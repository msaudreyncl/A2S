import sys
import os
from basic_pitch.inference import predict_and_save

def run_ai(input_file):
    # This creates the MIDI file from the raw audio data found in your uploads folder
    output_path = "backend/uploads/"
    predict_and_save(
        audio_path_list=[input_file],
        output_directory=output_path,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False
    )

if __name__ == "__main__":
    # The file path passed from index.js
    file_to_process = sys.argv[1] 
    run_ai(file_to_process)