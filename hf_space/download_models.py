import os
import urllib.request

MODELS_DIR = "rvc_models"
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

# HuggingFace URL for a Russian SpongeBob RVC model
SPONGEBOB_URL = "https://huggingface.co/iamalexcaspian/SpongeBob-SquarePants-Russian/resolve/main/SpongeBob_ru.pth"

print(f"Downloading SpongeBob model to {MODELS_DIR}...")
try:
    req = urllib.request.Request(SPONGEBOB_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(os.path.join(MODELS_DIR, "spongebob.pth"), 'wb') as out_file:
        data = response.read()
        out_file.write(data)
    print("Downloaded spongebob.pth successfully!")
except Exception as e:
    print(f"Failed to download SpongeBob model: {e}")
