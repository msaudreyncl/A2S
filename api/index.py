from flask import Flask, request, jsonify
from basic_pitch.inference import predict_and_save
import os

app = Flask(__name__)

@app.route('/api/generate', methods=['POST'])
def generate():
    if 'audio' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['audio']
    # Vercel only allows writing to the /tmp folder
    path = os.path.join("/tmp", file.filename)
    file.save(path)
    
    # Run your basic-pitch logic here...
    # Return the URL or data
    return jsonify({"success": True, "note": "Processing on Vercel!"})