# ------------------
# IMPORTS
# ------------------
import os
import json
import google.generativeai as genai
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# ------------------
# INITIALIZATION
# ------------------

# Load environment variables from the .env file
load_dotenv()

# Create the Flask app instance
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow our React frontend to communicate with this backend
CORS(app)

# ------------------
# GOOGLE AI CONFIGURATION
# ------------------

# Get the API key from the environment variables
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    # If the API key is not found, stop the application with an error
    raise ValueError("GOOGLE_API_KEY not found. Please set it in the .env file.")

# Configure the generative AI client with the API key
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# ------------------
# API ROUTES
# ------------------

# A simple test route to confirm the backend is running and connected
@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Backend is connected to Frontend!"})

# The main endpoint that receives text and returns a simplified analysis
@app.route('/api/simplify', methods=['POST'])
def simplify_text():
    # Get the JSON data sent from the frontend
    data = request.get_json()
    if not data or 'text' not in data:
        # If the request is malformed, return a client error
        return jsonify({"error": "No text provided in the request"}), 400

    original_text = data['text']

    # --- NEW DETAILED PROMPT ---
    prompt = f"""
    All the conversation held is in the context of Indian law. and if got something with less context or less information reffer the word or phares to constitution of india.
    Article xyz or clause abc of article xyz means in reference with constitution of india.
    You are an expert legal analyst and educator with a deep understanding of Indian law, including the Constitution of India, statutory laws, case laws, and procedural laws. You are also a master at translating complex legal jargon into plain, easily understandable language for a non-legal audience. Your task is to analyze any legal text provided, interpret it accurately, and present it in a structured, user-friendly JSON format.

    **Instructions for Analysis and JSON Output:**

    1. **Core Task:**
       For the legal text provided below, produce a response strictly in **valid JSON format only**. **Do not include any introductory text, explanations, or notes outside the JSON object**.

    2. **JSON Structure:**
       Your JSON response must have the following three main keys:
       - `"constitutionofindia"`: A string that contains the full text of the Constitution of India.
       - `"simplifiedText"`: A concise, plain-language summary of the legal text that a layperson can easily understand.
       - `"keyPoints"`: An array of strings, each string representing a critical takeaway, principle, or rule from the text.
       - `"definedTerms"`: An object where each key is a complex legal term from the original text, and its value is a simple, one-sentence explanation.
       - `"references"`: An array of strings, each string being a reference to a specific law, article, or clause.
       - `"contextualFocus"`: A string that explains the specific legal context or focus of the text.
       - `"legalReferences"`: An array of strings, each string being a reference to a specific law, article, or clause.

    3. **Contextual Focus:**
       - Your explanations must always consider the **Indian legal context**.
       - If a law mentions general terms like “citizen” or “government authority,” assume **Indian legal definitions**.
       - If the text contains specific references to laws, articles, or clauses, include those references in the `"references"` array.
       - If the text contains specific references to laws, articles, or clauses, include those references in the `"legalReferences"` array.
       - If the text contains specific references to laws, articles, or clauses, include those references in the `"references"` array.

    ---
    **Legal Text to Analyze:**
    "{original_text}"
    ---

    **Your JSON Response:**
    """

    try:
        # Send the prompt to the AI model
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Clean up the response text in case the AI wraps it in markdown backticks
        if response_text.strip().startswith("```json"):
            response_text = response_text.strip()[7:-3].strip()
        elif response_text.strip().startswith("```"):
            response_text = response_text.strip()[3:-3].strip()


        # Parse the cleaned text into a Python dictionary
        json_response = json.loads(response_text)
        
        # Send the successful response back to the frontend
        return jsonify(json_response)

    except Exception as e:
        # If anything goes wrong (AI error, JSON parsing error), log it and send a server error response
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to process the text with the AI model."}), 500

# ------------------
# RUN THE APPLICATION
# ------------------

# This is the standard entry point for running a Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)