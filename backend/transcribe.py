import sys
import os
from basic_pitch.inference import predict_and_save
from music21 import converter

def run_ai(input_file):
    output_dir = "backend/uploads"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Generate MIDI
    predict_and_save(
        audio_path_list=[input_file],
        output_directory=output_dir,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False
    )

    # 2. Convert MIDI → MusicXML for OSMD
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
    xml_file = os.path.join(output_dir, f"{base_name}_basic_pitch.xml")

    if os.path.exists(midi_file):
        midi = converter.parse(midi_file)
        midi.write('musicxml', fp=xml_file)

if __name__ == "__main__":
    run_ai(sys.argv[1])
