import requests

class RobustOllamaEmbeddings:
    def __init__(self, model="nomic-embed-text"):
        self.model = model
        self.url = "http://localhost:11434/api/embed"
        self.batch_size = 2

    # ADD THIS METHOD: LangChain calls this when searching
    def embed_query(self, text: str):
        # We treat a query as a single-element list for the API
        results = self.embed_documents([text])
        return results[0] if results else None

    def embed_documents(self, texts):
        all_vectors = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            try:
                resp = requests.post(self.url, json={"model": self.model, "input": batch}, timeout=120)
                if resp.status_code == 200:
                    # Depending on your Ollama version, sometimes it returns 'embeddings'
                    data = resp.json()
                    all_vectors.extend(data.get("embeddings", []))
            except Exception as e:
                print(f"Embedding error: {e}")
        return all_vectors if all_vectors else None

class OllamaLLM:
    def __init__(self, model="llama3"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt):
        try:
            response = requests.post(
                self.url, 
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=120
            )
            return response.json().get("response", "Error generating response.")
        except Exception as e:
            return f"LLM Connection Error: {str(e)}"