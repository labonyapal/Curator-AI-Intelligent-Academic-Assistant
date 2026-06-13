from config import DATA_ACADEMIC, DB_PATH
import os

print(f"Checking Academic Data Path: {DATA_ACADEMIC}")
print(f"Path exists: {os.path.exists(DATA_ACADEMIC)}")
print(f"Checking Database Path: {DB_PATH}")