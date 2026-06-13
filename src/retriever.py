from langchain_chroma import Chroma
from config import DB_PATH
from src.llm_gateway import RobustOllamaEmbeddings, OllamaLLM

class LibraryManager:
    def __init__(self):
        self.embedding_function = RobustOllamaEmbeddings()
        self.llm_gateway = OllamaLLM()
        self.vectorstore = Chroma(
            persist_directory=DB_PATH, 
            embedding_function=self.embedding_function
        )

    def get_context_by_query(self, query: str, n_results: int = 5, filter_type: str = None):
        """Retrieves relevant chunks, optionally filtered by document type."""
        try:
            # Construct search arguments
            search_kwargs = {"k": n_results}
            if filter_type:
                search_kwargs["filter"] = {"type": filter_type}
            
            # Perform similarity search
            results = self.vectorstore.similarity_search(query, **search_kwargs)
            
            # Combine content into a single string for the LLM
            return "\n\n".join([doc.page_content for doc in results])
        except Exception as e:
            return f"Error retrieving context: {str(e)}"

    def query_library(self, question: str, mode: str = "detailed", k: int = 3):
        try:
            # Standard search without specific type filtering
            context = self.get_context_by_query(question, n_results=k)
            
            prompt = (
                "Act as an Academic Curator. Provide " + 
                ("structured study notes" if mode == "notes" else "a detailed answer") +
                f" for this question: {question}. Context: {context}"
            )

            response = self.llm_gateway.generate(prompt)
            return {"answer": str(response).strip(), "sources": []}
            
        except Exception as e:
            return {"answer": f"Backend Error: {str(e)}", "sources": []}

    def search_by_type(self, query: str, doc_type: str, k: int = 5):
        """Helper specifically for Research Papers or Textbooks."""
        return self.get_context_by_query(query, n_results=k, filter_type=doc_type)