import sys
import os
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from music21 import converter

def run_ai(input_file_path):
    output_dir = os.path.dirname(input_file_path)
    
    # Run Basic Pitch
    predict_and_save(
        audio_path_list=[input_file_path],
        output_directory=output_dir,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
        model_or_model_path=ICASSP_2022_MODEL_PATH
    )

    base_name = os.path.basename(input_file_path)
    midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
    xml_file = os.path.join(output_dir, f"{base_name}_basic_pitch.xml")

    if os.path.exists(midi_file):
        score = converter.parse(midi_file)
        score.write('musicxml', fp=xml_file)
        print(f"Success: {xml_file}")
    else:
        print(f"Error: MIDI not found")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ai(sys.argv[1])