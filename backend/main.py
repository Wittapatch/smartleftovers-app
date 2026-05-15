import os

from database import add_food, add_user, delete_user, update_food
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types

# Load backend/.env
load_dotenv()

# Get Gemini API key from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in the .env file")

# Create Flask app
app = Flask(__name__)

# Allow Expo app to call Flask backend
CORS(app)

# Create Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask backend is running"})

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    try:
        #Check if image was sent from Expo
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        
        # Get image file from request
        image_file = request.files["image"]

        # Read image into bytes
        image_bytes = image_file.read()

        # Get image mine type, like image/jpeg
        mime_type = image_file.minetype or "image/jpeg"

        # Send image to Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                "ADD PROMPT HERE",
            ],
        )

        # Return Gemini result back to Expo
        return jsonify({"response": response.text})
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    
@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Get JSON data from Expo
        data = request.get_json()

        # Get the user's message
        user_message = data.get("message", "")

        # Get previous chat history, optional
        history = data.get("history", [])

        # Check if message is empty
        if user_message.strip() == "":
            return jsonify({
                "error": "Message is empty"
            }), 400

        # Convert chat history into readable text
        history_text = ""
        for item in history:
            role = item.get("role", "user")
            text = item.get("text", "")
            history_text += f"{role}: {text}\n"

        # Create prompt for Gemini
        prompt = f"""
    You are a chatbot for conversation

    Previous conversation:
    {history_text}

    User: {user_message}
    Bot:
"""

        # Send prompt to Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
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
    data = request.json
    _id = data.get("_id") if data else None
    
    if not _id:
        return jsonify({"error":"No id provided"}), 400
    
    add_user(_id)
    return jsonify({"message": "User created"}), 201

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
    data = request.json
    _id = data.get("_id") if data else None

    if not _id:
        return jsonify({"error": "No id provided"}), 400

    add_food(
        _id,
        data.get("name"),
        data.get("expiry_date"),
        data.get("food_type"),
        data.get("price"),
        data.get("quantity"),
        data.get("description"),
    )
    return jsonify({"message": "Food added"}), 201

@app.route("/update-food", methods=["PUT"])
def edit_food():
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
        data.get("food_type"),
        data.get("price"),
        data.get("quantity"),
        data.get("description"),
    )
    return jsonify({"message": "Food updated"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
