import os
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN", "")
USERNAME = "kikk22320"
REPO_NAME = "chepuha-tts"
REPO_ID = f"{USERNAME}/{REPO_NAME}"

api = HfApi(token=TOKEN)

print(f"Creating Space {REPO_ID} on Hugging Face...")
try:
    api.create_repo(repo_id=REPO_ID, repo_type="space", space_sdk="docker", private=False)
    print("Space created successfully!")
except Exception as e:
    print(f"Space might already exist or error: {e}")

print("Uploading files to the Space...")
try:
    api.upload_folder(
        folder_path=".",
        repo_id=REPO_ID,
        repo_type="space",
        ignore_patterns=["upload_space.py", "__pycache__/*"]
    )
    print(f"Upload complete! Space is now building at https://huggingface.co/spaces/{REPO_ID}")
except Exception as e:
    print(f"Failed to upload files: {e}")
