from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from src.retriever import LibraryManager
from dl_models.handwriting_gen import SynthesisEngine
from src.db_manager import init_db, log_activity
from src.ingestor import IngestionService
import shutil
import os
import sqlite3

app = FastAPI(title="Curator AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
manager = LibraryManager()
engine = SynthesisEngine()

# Initialize Database
init_db()

@app.get("/")
def read_root():
    return {"status": "online"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Uploads files to be processed by the Curator."""
    os.makedirs("data/academic", exist_ok=True)
    file_path = f"data/academic/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    log_activity("upload_document")
    return {"message": f"Successfully uploaded {file.filename}."}

@app.get("/search")
async def search_library(question: str, request_notes: bool = False):
    """Searches the library and returns an AI-curated response."""
    log_activity("search_query")
    mode = "notes" if request_notes else "detailed"
    return manager.query_library(question, mode=mode)

@app.post("/generate-assignment")
async def generate_assignment(question: str = Form(...)):
    log_activity("generate_assignment")
    search_result = manager.query_library(question, mode="detailed")
    academic_content = search_result.get("answer", "No content found.")
    pdf_path = engine.generate_pdf_assignment(academic_content)
    return FileResponse(pdf_path, media_type='application/pdf', filename='assignment.pdf')

@app.post("/summarize")
async def summarize_chapter(topic: str = Form(...)):
    log_activity("summarize_chapter")
    context = manager.get_context_by_query(topic, n_results=5)
    prompt = f"Summarize the following academic content into concise bullet points: \n{context}"
    summary = manager.llm_gateway.generate(prompt)
    return {"topic": topic, "summary": summary}

@app.post("/generate-quiz")
async def generate_quiz(topic: str = Form(...)):
    log_activity("generate_quiz")
    context = manager.get_context_by_query(topic, n_results=5)
    prompt = (f"Based on the following academic content, generate 5 multiple-choice "
              f"questions with answers, and 5 flashcards in question-answer "
              f"format: \n{context}")
    content = manager.llm_gateway.generate(prompt)
    return {"topic": topic, "content": content}

@app.post("/summarize-specific-paper")
async def summarize_specific_paper(filename: str = Form(...)):
    log_activity("summarize_specific_paper")
    file_path = os.path.join("data/academic", filename)
    if not os.path.exists(file_path):
        return {"error": "File not found in academic data."}
    
    text = IngestionService.extract_text_from_pdf(file_path)
    prompt = f"Summarize the following document titled {filename}: \n{text[:10000]}"
    summary = manager.llm_gateway.generate(prompt)
    return {"filename": filename, "summary": summary}

@app.post("/create-study-plan")
async def create_plan(topic: str = Form(...), due_date: str = Form(...)):
    log_activity("create_study_plan")
    results = manager.vectorstore.similarity_search(topic, k=20)
    total_chunks = len(results)
    
    conn = sqlite3.connect("curator_data.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO study_goals (topic, due_date, total_chunks) VALUES (?, ?, ?)", 
                   (topic, due_date, total_chunks))
    conn.commit()
    conn.close()
    
    return {"message": f"Plan created for {topic}", "daily_goal": f"{max(1, total_chunks//10)} chunks per day"}

@app.get("/dashboard-stats")
async def get_stats():
    conn = sqlite3.connect("curator_data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT activity_type, COUNT(*) FROM activity_log GROUP BY activity_type")
    stats = cursor.fetchall()
    conn.close()
    return {"usage_stats": dict(stats)}

@app.get("/documents")
async def list_documents():
    """Lists all documents stored in the library."""
    os.makedirs("data/academic", exist_ok=True)
    files = os.listdir("data/academic")
    pdf_files = [f for f in files if f.lower().endswith('.pdf')]
    return {"documents": pdf_files}

@app.get("/study-plans")
async def get_study_plans():
    """Retrieves all saved study goals."""
    conn = sqlite3.connect("curator_data.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, topic, due_date, total_chunks FROM study_goals")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "topic": r[1], "due_date": r[2], "total_chunks": r[3]} for r in rows]