import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect("curator_data.db")
    cursor = conn.cursor()
    # Table for study goals
    cursor.execute('''CREATE TABLE IF NOT EXISTS study_goals 
                      (id INTEGER PRIMARY KEY, topic TEXT, due_date TEXT, total_chunks INTEGER)''')
    # Table for tracking user activity
    cursor.execute('''CREATE TABLE IF NOT EXISTS activity_log 
                      (id INTEGER PRIMARY KEY, activity_type TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

def log_activity(activity):
    conn = sqlite3.connect("curator_data.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO activity_log (activity_type, timestamp) VALUES (?, ?)", 
                   (activity, datetime.now().isoformat()))
    conn.commit()
    conn.close()