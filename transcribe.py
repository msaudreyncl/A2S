import sys
import os
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from music21 import converter, duration

def run_ai(input_file_path):
    output_dir = os.path.dirname(input_file_path)
    
    # 1. Run Basic Pitch with higher thresholds to filter "noise"
    # onset_threshold: higher means it ignores accidental bumps/scuffs
    # minimum_note_length: removes tiny 1/64th note blips
    predict_and_save(
        audio_path_list=[input_file_path],
        output_directory=output_dir,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
        model_or_model_path=ICASSP_2022_MODEL_PATH,
        onset_threshold=0.6,
        frame_threshold=0.4,
        minimum_note_length=100 
    )

    base_name = os.path.basename(input_file_path).replace(os.path.splitext(input_file_path)[1], "")
    midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
    xml_file = input_file_path + "_basic_pitch.xml"

    # 2. Convert to MusicXML and Quantize
    if os.path.exists(midi_file):
        score = converter.parse(midi_file)
        
        # QUANTIZATION: This simplifies the rhythm.
        # [0.25] = snap to nearest 16th note. 
        # If the sheet is still too "messy", change 0.25 to 0.5 (8th notes).
        simplified_score = score.quantize([0.25], processOffsets=True, processDurations=True)
        
        # Remove any empty measures or overlapping tiny fragments
        simplified_score.makeNotation(inPlace=True)
        
        simplified_score.write('musicxml', fp=xml_file)
        print(f"Success: {xml_file}")
    else:
        print(f"Error: MIDI not found at {midi_file}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ai(sys.argv[1])