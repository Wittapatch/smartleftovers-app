import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
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
    return jsonify({"message": "Flack backend is running"})

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
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

