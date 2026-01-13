import sys
import os
import json
import warnings

# Force UTF-8 encoding for Windows console to prevent 'charmap' errors
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Silence TensorFlow and general warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
warnings.filterwarnings("ignore")

try:
    from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
    from music21 import converter, tempo, key
except ImportError as e:
    print(json.dumps({"error": f"Missing library: {str(e)}"}))
    sys.exit(1)

def run_ai(input_file_path):
    try:
        output_dir = os.path.dirname(input_file_path)
        
        # Run Basic Pitch inference
        predict_and_save(
            audio_path_list=[input_file_path],
            output_directory=output_dir,
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=ICASSP_2022_MODEL_PATH
        )

        base_name = os.path.basename(input_file_path).replace(os.path.splitext(input_file_path)[1], "")
        midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
        xml_file = input_file_path + "_basic_pitch.xml"

        if os.path.exists(midi_file):
            score = converter.parse(midi_file)
            
            # Extract Key and Tempo
            detected_key = score.analyze('key')
            detected_tempo = 120
            mark = score.flatten().getElementsByClass(tempo.MetronomeMark)
            if mark:
                detected_tempo = round(mark[0].number)
            
            # Export to MusicXML
            score.write('musicxml', fp=xml_file)
            
            # JSON result - Ensure strings are clean of emojis
            result = {
                "xml_file": xml_file,
                "key": f"{detected_key.tonic.name} {detected_key.mode}",
                "tempo": f"{detected_tempo} BPM",
                "instrument": "Piano"
            }
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "MIDI generation failed"}))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ai(sys.argv[1])