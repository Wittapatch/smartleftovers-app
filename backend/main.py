import os
from database import add_food, add_user, delete_food, delete_user, filter_food_type, get_foods, update_food
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types

# Load local environment variables when running outside Docker.
load_dotenv()

# Gemini is called only from the backend so the private key is never bundled into the app.
GEMINI_KEY = os.getenv("GEMINI_KEY")

if not GEMINI_KEY:
    raise ValueError("Missing GEMINI_KEY in the environment")

# Flask exposes the API used by the Expo frontend.
app = Flask(__name__)

# Allow the Expo dev server or web build to call this API from another origin.
CORS(app)

# Reuse one Gemini client for image extraction and ChefBot chat requests.
client = genai.Client(api_key=GEMINI_KEY)

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    # Keep API failures JSON-shaped so the frontend can show friendly errors.
    return jsonify({"error": str(error)}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask backend is running"})

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    try:
        # The frontend sends the selected/captured food photo as multipart form data.
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        
        # Get image file from request
        image_file = request.files["image"]

        # Read image into bytes
        image_bytes = image_file.read()

        # Get image mine type, like image/jpeg
        mime_type = image_file.mimetype or "image/jpeg"

        prompt = """
You are an image extraction assistant for a food inventory app.

Look carefully at the image and extract food information.

Return ONLY valid JSON.
Do not include markdown.
Do not include ```json.
Do not include explanation outside the JSON.

Use this exact JSON structure:
{
    "name": "",
    "food_type": "",
    "quantity": "",
    "unit": "",
    "expiry_date": "",
    "purchase_date": "",
    "description": ""
}

Rules to follow:
- "name" is important. If you can identify the food, write the food name.
- "food_type" should be one simple category from this list only:
  Dairy, Meat, Vegetable, Fruit, Grain, Drink, Snack, Frozen, Sauce, Other.
- "quantity" should only be filled if the image clearly shows a quantity, weight, volume, or count.
- "unit" should be the unit for quantity, such as g, kg, ml, L, pieces, slices, pack, bottle, can, box.
- "expiry_date" should only be filled if the image clearly shows an expiry date, use-by date, or best-before date.
- "purchase_date" should only be filled if the image clearly shows a purchase date. Otherwise use an empty string.
- Use date format DD/MM/YY when possible.
- "description" should describe the food item itself in a useful inventory way, not the photo or what is visible in the image.
- Do not guess hidden information.
- Do not invent expiry dates, purchase dates, or quantities.
- If a field cannot be deterined from the image, use an empty string.
"""

        # Gemini returns text, so the frontend parses the JSON string after this response.
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                prompt,
            ],
        )

        # Return Gemini result back to Expo
        return jsonify({"response": response.text})
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    
@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Chat requests include the message, prior chat, selected foods, and serving count.
        data = request.get_json()

        # Get the user's message
        user_message = data.get("message", "")

        # Get previous chat history, optional
        history = data.get("history", [])

        # Get selected ingredients from the app, optional
        ingredients = data.get("ingredients", [])
        servings = data.get("servings", "")

        # Check if message is empty
        if user_message.strip() == "":
            return jsonify({
                "error": "Message is empty"
            }), 400

        # Flatten app state into prompt text so Gemini can answer with recipe context.
        history_text = ""
        for item in history:
            role = item.get("role", "user")
            text = item.get("text", "")
            history_text += f"{role}: {text}\n"

        ingredients_text = ""
        for item in ingredients:
            name = item.get("name", "")
            quantity = item.get("quantity", "")
            unit = item.get("unit", "")
            food_type = item.get("type", "")
            expiry_date = item.get("expiryDate", "")
            description = item.get("description", "")

            details = []
            if quantity:
                details.append(f"quantity: {quantity} {unit}".strip())
            if food_type:
                details.append(f"type: {food_type}")
            if expiry_date:
                details.append(f"expiry: {expiry_date}")
            if description:
                details.append(f"description: {description}")

            detail_text = f" ({', '.join(details)})" if details else ""
            ingredients_text += f"- {name}{detail_text}\n"

        # Clear instructional prompt for one practical leftover recipe.
        prompt = f"""
You are ChefBot, a friendly cooking assistant inside a food leftovers app.

Suggest a creative and easy-to-cook recipe for {servings or "the requested number of"} person(s)
using the following available ingredients:

{ingredients_text or "- No selected ingredients were provided."}

User request:
{user_message}

Please provide:
1. A Recipe Name
2. A brief description of why this works for these leftovers
3. Step-by-step cooking instructions
4. Tips for avoiding waste with any remaining portions

Previous conversation:
{history_text}

Guidelines:
- Prioritize the selected ingredients and items that expire soon.
- You may add simple pantry basics, but label them as pantry extras.
- Do not invent expensive or specific ingredients unless the user mentioned them.
- Include safety notes for expired food, raw meat, seafood, dairy, or leftovers.
- Keep the answer concise and easy to follow.
"""

        # Send prompt to Gemini
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt,
        )

        # Return Gemini reply to Expo
        return jsonify({
            "reply": response.text
        })

    except Exception as error:
        print("Chat error:", error)

        return jsonify({
            "error": str(error)
        }), 500
    

@app.route("/create-user",methods=['POST'])
def create_user():
    # Firebase owns authentication; MongoDB stores app data under the Firebase uid.
    data = request.json
    _id = data.get("_id") if data else None
    
    if not _id:
        return jsonify({"error":"No id provided"}), 400
    
    add_user(_id)
    return jsonify({"message": "User created"}), 201

@app.route("/foods", methods=["GET"])
def list_foods():
    # Load the signed-in user's saved food list.
    _id = request.args.get("_id")

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    return jsonify({"food_items": get_foods(_id)}), 200

@app.route("/delete-account", methods=["DELETE"])
def delete_account():
    data = request.json
    _id = data.get("_id") if data else None

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    delete_user(_id)
    return jsonify({"message": "Account deleted"}), 200

@app.route("/add-food", methods=["POST"])
def create_food():
    # Add one food item to the user's embedded food_items array.
    data = request.json
    _id = data.get("_id") if data else None

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    food_id = add_food(
        _id,
        data.get("name"),
        data.get("expiry_date"),
        data.get("purchase_date"),
        data.get("food_type"),
        data.get("quantity"),
        data.get("unit"),
        data.get("description"),
        data.get("image_uri"),
        data.get("image_data"),
        data.get("use_extract_feature", False),
    )
    return jsonify({"message": "Food added","food_id":food_id}), 201

@app.route("/update-food", methods=["PUT"])
def edit_food():
    # Replace the matching embedded food item with the edited version.
    data = request.json
    _id = data.get("_id") if data else None
    food_id = data.get("food_id") if data else None

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    if not food_id:
        return jsonify({"error": "No food id provided"}), 400

    update_food(
        _id,
        food_id,
        data.get("name"),
        data.get("expiry_date"),
        data.get("purchase_date"),
        data.get("food_type"),
        data.get("quantity"),
        data.get("unit"),
        data.get("description"),
        data.get("image_uri"),
        data.get("image_data"),
        data.get("use_extract_feature", False),
    )
    return jsonify({"message": "Food updated"}), 200

@app.route("/delete-food", methods=["DELETE"])
def remove_food():
    # Remove one embedded food item by its generated food_id.
    data = request.json
    _id = data.get("_id") if data else None
    food_id = data.get("food_id") if data else None

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    if not food_id:
        return jsonify({"error": "No food id provided"}), 400

    delete_food(_id, food_id)
    return jsonify({"message": "Food deleted"}), 200

@app.route("/filter-food-type",methods=["GET"])
def get_food_type():
    # Server-side food type filtering used by older/frontend filter flows.
    _id = request.args.get("_id")
    food_type_value = request.args.get("food_type")
    if not _id or not food_type_value:
        return jsonify({"error":"not_id or food_type not provided"}),400

    result = filter_food_type(_id,food_type=food_type_value)
    return jsonify(result), 200
    


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
