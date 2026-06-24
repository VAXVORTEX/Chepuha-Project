import os
import io
import torch
import soundfile as sf
import traceback
import sys
import numpy as np
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Fix PyTorch 2.6+ compatibility: torch.load defaults to weights_only=True,
# but fairseq (used by RVC/hubert) needs weights_only=False to load checkpoints.
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monkey-patch scipy.io.wavfile.write BEFORE rvc_python imports it
# rvc-python 0.1.5 has a bug: infer_file passes a tuple to wavfile.write
import scipy.io.wavfile as _wavfile
_original_wavfile_write = _wavfile.write
def _patched_wavfile_write(filename, rate, data):
    if isinstance(data, tuple):
        # Try to extract numpy array from tuple
        for item in data:
            if isinstance(item, np.ndarray):
                data = item
                break
        if isinstance(data, tuple):
            # Last resort: try second element
            if len(data) >= 2 and isinstance(data[1], np.ndarray):
                data = data[1]
            elif len(data) >= 1 and isinstance(data[0], np.ndarray):
                data = data[0]
    if data is None or isinstance(data, tuple):
        raise ValueError(f"Cannot write audio: data is {type(data)}")
    _original_wavfile_write(filename, rate, data)
_wavfile.write = _patched_wavfile_write

# Load Silero TTS
device = torch.device('cpu')
torch.set_num_threads(4)

# Download silero
model, _ = torch.hub.load(repo_or_dir='snakers4/silero-models',
                          model='silero_tts',
                          language='ua',
                          speaker='v4_ua',
                          trust_repo=True)
model.to(device)
sample_rate = 48000

import threading
rvc_lock = threading.Lock()
current_rvc_model = None

rvc_converter = None
RVC_AVAILABLE = True
RVC_ERROR = ""

RVC_MODELS_DIR = "rvc_models"
if not os.path.exists(RVC_MODELS_DIR):
    os.makedirs(RVC_MODELS_DIR)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Chepuha TTS Server running on Hugging Face Spaces"}

@app.get("/debug")
def debug_info():
    import pkg_resources
    installed_packages = [f"{dist.project_name}=={dist.version}" for dist in pkg_resources.working_set]
    return {
        "RVC_AVAILABLE": RVC_AVAILABLE,
        "RVC_ERROR": RVC_ERROR,
        "models_dir": RVC_MODELS_DIR,
        "models_files": os.listdir(RVC_MODELS_DIR) if os.path.exists(RVC_MODELS_DIR) else [],
        "packages": [p for p in installed_packages if 'rvc' in p.lower() or 'scipy' in p.lower()],
    }

def preprocess_text(text: str) -> str:
    # Map common English letters to Cyrillic so spam like "asasas" or "ssss" can be read
    en_to_cyr = {
        'a': 'а', 'b': 'б', 'c': 'с', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х',
        'i': 'і', 'j': 'дж', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
        'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс',
        'y': 'й', 'z': 'з',
        'A': 'А', 'B': 'Б', 'C': 'С', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х',
        'I': 'І', 'J': 'Дж', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П',
        'Q': 'К', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'В', 'X': 'Кс',
        'Y': 'Й', 'Z': 'З'
    }
    for eng, cyr in en_to_cyr.items():
        text = text.replace(eng, cyr)

    # Increase pause durations
    text = text.replace(',', ' - ')
    text = text.replace('.', '... ')
    
    import re
    # 1. Process long vowels to avoid glitches and stretch the sound (e.g., аааа -> а-а-а)
    def stretch_vowels(match):
        vowel = match.group(1)
        # Cap at 4 to avoid overly long pauses
        return '-'.join([vowel] * min(len(match.group(0)), 4))

    text = re.sub(r'([аеєиіїоуюяАЕЄИІЇОУЮЯ])\1{2,}', stretch_vowels, text)
    
    # 2. Shrink repeating consonants to max 3 so it doesn't break TTS (e.g. сссссссс -> ссс)
    def shrink_consonants(match):
        cons = match.group(1)
        return cons * 3
        
    text = re.sub(r'([бвгґджзйклмнпрстфхцчшщБВГҐДЖЗЙКЛМНПРСТФХЦЧШЩ])\1{2,}', shrink_consonants, text)
    
    # Transliterate basic Latin to Cyrillic so english spam works
    latin_to_cyrillic = {
        'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'і',
        'j': 'дж', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'кв', 'r': 'р',
        's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'й', 'z': 'з',
        'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'І',
        'J': 'Дж', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Кв', 'R': 'Р',
        'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'В', 'X': 'Кс', 'Y': 'Й', 'Z': 'З'
    }
    for lat, cyr in latin_to_cyrillic.items():
        text = text.replace(lat, cyr)

    # Convert common numbers to words (Silero UA drops digits)
    num_to_word = {
        '0': 'нуль ', '1': 'один ', '2': 'два ', '3': 'три ', '4': 'чотири ', 
        '5': 'п\'ять ', '6': 'шість ', '7': 'сім ', '8': 'вісім ', '9': 'дев\'ять '
    }
    # Simple replacement: 1 -> один (For complex numbers, Groq should have handled it, but this is a fallback for single digits)
    for digit, word in num_to_word.items():
        text = text.replace(digit, word)

    # Add longer pauses for punctuation
    text = text.replace('.', ' ... ')
    text = text.replace(',', ' - ')
    text = text.replace('!', ' !!! ')
    text = text.replace('?', ' ??? ')

    # Remove characters that are not Cyrillic (including Ukrainian), or punctuation
    text = re.sub(r'[^а-яА-ЯёЁіІїЇєЄґҐ\s.,!?+\-:*()"]', '', text)
    
    return text.strip()

def get_rvc_converter():
    """Lazy-initialize RVC converter"""
    global rvc_converter, RVC_AVAILABLE, RVC_ERROR
    if rvc_converter is not None:
        return rvc_converter
    try:
        from rvc_python.infer import RVCInference
        rvc_converter = RVCInference(models_dir=RVC_MODELS_DIR)
        return rvc_converter
    except Exception as e:
        RVC_ERROR = traceback.format_exc()
        RVC_AVAILABLE = False
        print(f"Failed to initialize RVCInference: {RVC_ERROR}")
        return None

import hashlib

CACHE_DIR = "audio_cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def get_cache_path(text, voice):
    hash_str = hashlib.md5(f"{text}_{voice}".encode('utf-8')).hexdigest()
    return os.path.join(CACHE_DIR, f"{hash_str}.wav")

from pydantic import BaseModel

class TTSRequest(BaseModel):
    text: str
    voice: str = 'mykyta'

@app.post("/tts")
def tts_post(req: TTSRequest):
    return tts_logic(req.text, req.voice)

@app.get("/tts")
def tts_get(text: str, voice: str = 'mykyta'):
    return tts_logic(text, voice)

def tts_logic(text: str, voice: str):
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Preprocess text
    text = preprocess_text(text)
    
    if len(text) > 800:
        text = text[:800]
        last_punct = max(text.rfind('.'), text.rfind('!'), text.rfind('?'), text.rfind(' '))
        if last_punct > 400:
            text = text[:last_punct]
            
    if not text:
        # Return 1 second of silence
        silence = np.zeros(24000, dtype=np.float32)
        buffer = io.BytesIO()
        sf.write(buffer, silence, 24000, format='WAV')
        buffer.seek(0)
        return Response(content=buffer.read(), media_type="audio/wav")

    cache_path = get_cache_path(text, voice)
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    # Check if voice is an RVC model
    rvc_model_path = os.path.join(RVC_MODELS_DIR, f"{voice}.pth")
    is_rvc = os.path.exists(rvc_model_path)

    # Base voice for generation
    base_voice = 'mykyta' if is_rvc else voice

    try:
        # Generate base audio
        audio_tensor = model.apply_tts(text=text,
                                    speaker=base_voice,
                                    sample_rate=sample_rate,
                                    put_accent=True,
                                    put_yo=True)
        
        audio_data = audio_tensor.numpy()

        if is_rvc and RVC_AVAILABLE:
            converter = get_rvc_converter()
            if converter is None:
                # Fallback to plain Silero
                buffer = io.BytesIO()
                sf.write(buffer, audio_data, sample_rate, format='WAV')
                buffer.seek(0)
                final_audio = buffer.read()
                with open(cache_path, "wb") as f:
                    f.write(final_audio)
                return Response(content=final_audio, media_type="audio/wav")

            # Save temp file
            temp_in = f"temp_{voice}_in.wav"
            temp_out = f"temp_{voice}_out.wav"
            sf.write(temp_in, audio_data, sample_rate)

            # Convert with RVC
            global current_rvc_model
            with rvc_lock:
                try:
                    try:
                        if current_rvc_model != rvc_model_path:
                            converter.load_model(rvc_model_path)
                            current_rvc_model = rvc_model_path
                    except RuntimeError as e:
                        if "size mismatch" in str(e):
                            converter.load_model(rvc_model_path, version="v1")
                            current_rvc_model = rvc_model_path
                        else:
                            raise e
                    
                    pitch = 0
                    if voice == "mita" or voice == "spongebob":
                        pitch = 12
                    elif voice == "optimus":
                        pitch = -6
                        
                    converter.set_params(f0method="rmvpe", f0up_key=pitch)
                    converter.infer_file(
                        input_path=temp_in,
                        output_path=temp_out
                    )
                except Exception as rvc_e:
                    print(f"RVC Conversion failed: {rvc_e}")
                    # Fallback to base voice if RVC crashes
                    import shutil
                    shutil.copy2(temp_in, temp_out)

            # Read back
            with open(temp_out, "rb") as f:
                final_audio = f.read()
            
            with open(cache_path, "wb") as f:
                f.write(final_audio)
            
            # Clean up
            if os.path.exists(temp_in):
                os.remove(temp_in)
            if os.path.exists(temp_out):
                os.remove(temp_out)

            return Response(content=final_audio, media_type="audio/wav")

        else:
            # Just return Silero audio
            buffer = io.BytesIO()
            sf.write(buffer, audio_data, sample_rate, format='WAV')
            buffer.seek(0)
            final_audio = buffer.read()
            with open(cache_path, "wb") as f:
                f.write(final_audio)
            return Response(content=final_audio, media_type="audio/wav")

    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"Error during TTS:\n{error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

