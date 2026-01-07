import sys
import os
from basic_pitch.inference import predict_and_save
from music21 import converter

def run_ai(input_file_path):
    # Get the directory where the uploaded file is (uploads/)
    output_dir = os.path.dirname(input_file_path)
    
    # 1. Run Basic Pitch
    # This generates [filename]_basic_pitch.mid
    predict_and_save(
        audio_path_list=[input_file_path],
        output_directory=output_dir,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False
    )

    # 2. Path to the newly created MIDI
    midi_file = input_file_path + "_basic_pitch.mid"
    xml_file = input_file_path + "_basic_pitch.xml"

    # 3. Convert to MusicXML
    if os.path.exists(midi_file):
        score = converter.parse(midi_file)
        score.write('musicxml', fp=xml_file)
        print(f"Success: {xml_file}")
    else:
        print("Error: MIDI not generated")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ai(sys.argv[1])