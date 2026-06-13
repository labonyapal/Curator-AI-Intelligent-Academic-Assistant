import pdfplumber
import pytesseract
from langchain_core.documents import Document
from config import DATA_ACADEMIC 

class IngestionService:
    @staticmethod
    def classify_document(text):
        """Simple classifier: Detects research papers based on common structural keywords."""
        text_lower = text.lower()
        # Research papers almost always contain these sections
        if "abstract" in text_lower[:2000] and "conclusion" in text_lower[-5000:]:
            return "research_paper"
        return "textbook"

    @staticmethod
    def extract_text_from_pdf(file_path):
        """Clean logic for PDF parsing."""
        full_text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text and len(text.strip()) > 50:
                    full_text += text + "\n"
                else:
                    # Fallback to OCR
                    img = page.to_image(resolution=100).original
                    full_text += pytesseract.image_to_string(img) + "\n"
        return full_text

    @staticmethod
    def chunk_text(text, filename):
        """Clean logic for chunking with document classification metadata."""
        # Classify the document type before chunking
        doc_type = IngestionService.classify_document(text)
        
        chunk_size = 512
        overlap = 64
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size-overlap)]
        
        # Add 'doc_type' to the metadata so we can filter by it in ChromaDB later
        return [
            Document(
                page_content=c, 
                metadata={"source": filename, "type": doc_type}
            ) for c in chunks if c.strip()
        ]