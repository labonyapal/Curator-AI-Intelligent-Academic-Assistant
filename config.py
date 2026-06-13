import os

# Get the directory where your project lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define your paths here
DATA_ACADEMIC = os.path.join(BASE_DIR, "data", "academic")
DATA_REJECTED = os.path.join(BASE_DIR, "data", "rejected")
DB_PATH = os.path.join(BASE_DIR, "multimodal_db")