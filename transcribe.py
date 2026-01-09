import sys
import os
# Added ICASSP_2022_MODEL_PATH to imports
from basic_pitch.inference import predict_and_save, ICASSP_2022_MODEL_PATH
from music21 import converter, duration

def run_ai(input_file_path):
    output_dir = os.path.dirname(input_file_path)
    
    # 1. Run Basic Pitch with refined thresholds
    # onset_threshold=0.6 filters out ghost notes and background noise
    # minimum_note_length=100 removes tiny "stutter" notes (shorter than 1/10th of a second)
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

    # Locate the generated MIDI
    base_name = os.path.basename(input_file_path).replace(os.path.splitext(input_file_path)[1], "")
    midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
    xml_file = input_file_path + "_basic_pitch.xml"

    # 2. Post-Processing & Rhythm Simplification
    if os.path.exists(midi_file):
        # Load the MIDI into music21
        score = converter.parse(midi_file)
        
        # QUANTIZATION: This is the critical fix.
        # [0.25] tells the AI to snap everything to the nearest 16th note.
        # This removes the "complicated" tiny rests and weird tied notes.
        simplified_score = score.quantize([0.25], processOffsets=True, processDurations=True)
        
        # makeNotation() cleans up stem directions and measure distributions
        simplified_score.makeNotation(inPlace=True)
        
        # Write to MusicXML for your website to display
        simplified_score.write('musicxml', fp=xml_file)
        print(f"Success: {xml_file}")
    else:
        print(f"Error: MIDI not found at {midi_file}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_ai(sys.argv[1])