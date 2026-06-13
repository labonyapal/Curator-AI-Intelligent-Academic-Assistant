🎓 Curator AI: Intelligent Academic Assistant
Curator AI is a sophisticated Retrieval-Augmented Generation (RAG) system designed to ingest, process, and synthesize complex academic materials. By combining local vector-based semantic retrieval with Large Language Models (LLMs), the system provides personalized study tools, automated assignments, and structured academic summaries.

🏗️ System Architecture
Curator AI operates on a modern, modular stack designed for privacy and performance:

API Gateway: FastAPI (High-performance Python backend)

Vector Database: ChromaDB (Semantic storage & retrieval)

Deep Learning Models: Ollama (llama3 for reasoning, nomic-embed-text for embeddings)

Frontend: React (Vite) + Tailwind CSS v4

Data Persistence: SQLite (User tracking, history, and study planning)

Code snippet
graph TD
    User((User)) -->|Axios/Proxy| Frontend[React Dashboard]
    Frontend -->|API Request| FastAPI[FastAPI Backend]
    FastAPI -->|Similarity Search| ChromaDB[(ChromaDB)]
    FastAPI -->|Prompt Context| Ollama[Ollama LLM]
    FastAPI -->|Logs/History| SQLite[(SQLite)]
    FastAPI -->|PDF Generation| ReportLab[Synthesis Engine]
🚀 Key Features
Intelligent Ingestion: Automated PDF parsing and OCR fallback for scanned materials.

Semantic Retrieval: Context-aware search powered by deep learning embeddings.

Academic Synthesis: Automated generation of quizzes, flashcards, and professional assignments.

Personalized Study Plans: Data-driven timeline calculation based on document volume.

Progress Dashboard: Real-time visualization of academic engagement and history.

Research Paper Mode: Specialized extraction pipelines for abstract/conclusion synthesis.

📁 Project Structure
Plaintext
├── main.py                # FastAPI entrypoint & Routing
├── src/
│   ├── ingestor.py        # PDF parsing & OCR Service
│   ├── retriever.py       # Semantic similarity matching
│   └── db_manager.py      # SQLite backend for state/history
├── dl_models/
│   └── handwriting_gen.py # Generative PDF assignment engine
├── data/                  # Ingested knowledge base
└── frontend/              # React Dashboard source code
🛠️ Getting Started
Prerequisites
Ollama: Download & Install

Models: Run the following commands in your terminal:

Bash
ollama pull llama3
ollama pull nomic-embed-text
Installation
Clone the repository:

Bash
git clone <repository-url>
cd My_AI_University_Project
Backend Setup:

Bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate.ps1 on Windows
pip install -r requirements.txt
uvicorn main:app --reload
Frontend Setup:

Bash
cd frontend
npm install
npm run dev



python -m src.retriever
uvicorn main:app --reload
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
