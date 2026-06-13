import os
from unstructured.partition.pdf import partition_pdf
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.documents import Document
import requests

# 1. Bypass the buggy library class with a custom class
class FixedOllamaEmbeddings(Embeddings):
    def embed_documents(self, texts):
        url = "http://localhost:11434/api/embed"
        results = []
        for text in texts:
            response = requests.post(url, json={"model": "nomic-embed-text", "input": text})
            results.append(response.json()["embeddings"][0])
        return results

    def embed_query(self, text):
        return self.embed_documents([text])[0]

# 2. Use the Fixed Embeddings
pdf_path = "./Academic_Knowledge"
db_path = "./multimodal_db"

print("--- Initializing Database with Manual Connection ---")
embeddings = FixedOllamaEmbeddings()
vectorstore = Chroma(persist_directory=db_path, embedding_function=embeddings)