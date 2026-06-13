import os
import shutil
import pdfplumber
import pytesseract
import multiprocessing
from langchain_chroma import Chroma
from langchain_core.documents import Document
import requests

# ── Config ──────────────────────────────────────────────────────────────────
PDF_PATH      = "./Academic_Knowledge"
DB_PATH       = "./multimodal_db"
OLLAMA_URL    = "http://localhost:11434/api/embed"
EMBED_MODEL   = "nomic-embed-text"
CHUNK_SIZE    = 512
CHUNK_OVERLAP = 64
BATCH_SIZE    = 2  # Reduced for stability
# ────────────────────────────────────────────────────────────────────────────

class RobustOllamaEmbeddings:
    def embed_batch(self, texts):
        try:
            resp = requests.post(OLLAMA_URL, json={"model": EMBED_MODEL, "input": texts}, timeout=120)
            if resp.status_code == 200:
                return resp.json().get("embeddings")
        except Exception as e:
            print(f"Embedding error: {e}")
        return None

    def embed_documents(self, texts):
        all_vectors = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i + BATCH_SIZE]
            vecs = self.embed_batch(batch)
            if vecs: all_vectors.extend(vecs)
        return all_vectors if all_vectors else None

def worker_process(filename, pdf_path, db_path):
    try:
        file_full_path = os.path.join(pdf_path, filename)
        full_text = ""
        
        with pdfplumber.open(file_full_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text and len(text.strip()) > 50:
                    full_text += text + "\n"
                else:
                    img = page.to_image(resolution=100).original
                    full_text += pytesseract.image_to_string(img) + "\n"
        
        if not full_text.strip(): return "EMPTY"
        
        chunks = [full_text[i:i+CHUNK_SIZE] for i in range(0, len(full_text), CHUNK_SIZE-CHUNK_OVERLAP)]
        docs = [Document(page_content=c, metadata={"source": filename}) for c in chunks if c.strip()]
        
        vectorstore = Chroma(persist_directory=db_path, embedding_function=RobustOllamaEmbeddings())
        vectorstore.add_documents(docs)
        return "SUCCESS"
    except Exception as e:
        return f"FAILED: {str(e)}"

if __name__ == '__main__':
    REJECTED_DIR = os.path.join(PDF_PATH, "REJECTED_FILES")
    os.makedirs(REJECTED_DIR, exist_ok=True)

    vectorstore = Chroma(persist_directory=DB_PATH, embedding_function=RobustOllamaEmbeddings())
    results = vectorstore.get()
    processed = set(m.get("source") for m in results.get("metadatas", []) if m and "source" in m)
    
    files = [f for f in os.listdir(PDF_PATH) if f.endswith(".pdf")]
    
    for filename in files:
        if filename in processed: continue
        
        print(f"--- Processing: {filename}...")
        p = multiprocessing.Process(target=worker_process, args=(filename, PDF_PATH, DB_PATH))
        p.start()
        p.join(300) 
        
        if p.is_alive():
            print(f"  !!! TIMEOUT: Moving {filename} to REJECTED_FILES")
            p.terminate()
            p.join()
            shutil.move(os.path.join(PDF_PATH, filename), os.path.join(REJECTED_DIR, filename))
        else:
            print(f"  Finished {filename}")