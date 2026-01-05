import sys
import os
from basic_pitch.inference import predict_and_save

def process_audio(input_path, output_directory):
    # Basic Pitch processes the audio and outputs a MIDI file
    predict_and_save(
        audio_path_list=[input_path],
        output_directory=output_directory,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
    )

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Error: Missing arguments")
        sys.exit(1)
        
    audio_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    try:
        process_audio(audio_file, output_dir)
        # Basic Pitch adds "_basic_pitch.mid" to the original filename
        print("Success")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)