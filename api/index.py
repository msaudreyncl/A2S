from flask import Flask, request, jsonify
import os
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from music21 import converter

app = Flask(__name__)

@app.route('/api/generate', methods=['POST'])
def generate():
    if 'audio' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    audio_file = request.files['audio']
    # Vercel's /tmp is the only writable directory
    input_path = os.path.join("/tmp", audio_file.filename)
    audio_file.save(input_path)
    
    try:
        # Run AI Transcription
        predict_and_save(
            audio_path_list=[input_path],
            output_directory="/tmp",
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=ICASSP_2022_MODEL_PATH
        )

        # Locate the generated MIDI
        base_name = os.path.basename(input_path).replace(os.path.splitext(input_path)[1], "")
        midi_file = os.path.join("/tmp", f"{base_name}_basic_pitch.mid")
        
        if os.path.exists(midi_file):
            # Convert MIDI to MusicXML string
            score = converter.parse(midi_file)
            # score.write returns the path to the temp XML file
            temp_xml_path = score.write('musicxml')
            
            with open(temp_xml_path, 'r') as f:
                xml_content = f.read()
            
            return jsonify({
                "xmlData": xml_content,
                "title": "AI Generated Sheet",
                "instrument": "Detected via Basic Pitch"
            })
        else:
            return jsonify({"error": "AI failed to produce MIDI"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Required for Vercel functions
app.debug = False