from langchain_chroma import Chroma
import requests

# Test the manual embedding connection
url = "http://localhost:11434/api/embed"
response = requests.post(url, json={"model": "nomic-embed-text", "input": "test"})
print(f"Ollama Connection Status: {response.status_code}")

# Test the Database
vectorstore = Chroma(persist_directory="./multimodal_db")
print(f"Number of chunks in DB: {vectorstore._collection.count()}")