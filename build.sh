#!/bin/bash

# Install Node dependencies
npm install

# Upgrade pip
python3 -m pip install --upgrade pip

# Install Python dependencies
pip3 install basic-pitch==0.2.5
pip3 install music21==9.1.0
pip3 install tensorflow==2.13.0
pip3 install numpy==1.24.3
pip3 install librosa==0.10.1
pip3 install scipy==1.11.4

echo "✅ Build completed successfully"