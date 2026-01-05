import sys
import os
from basic_pitch.inference import predict_and_save

def process_audio(input_path, output_directory):
    # This model predicts pitch and creates a MIDI file
    predict_and_save(
        audio_path_list=[input_path],
        output_directory=output_directory,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
    )

if __name__ == "__main__":
    audio_file = sys.argv[1]
    output_dir = sys.argv[2]
    process_audio(audio_file, output_dir)
    print("Success")