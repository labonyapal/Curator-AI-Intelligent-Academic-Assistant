from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
import textwrap

class SynthesisEngine:
    def __init__(self):
        pass

    def generate_pdf_assignment(self, text, user_style_image_path=None):
        output_pdf = "assignment.pdf"
        c = canvas.Canvas(output_pdf, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "AI Generated Academic Assignment")
        
        # Content
        c.setFont("Helvetica", 12)
        y = height - 100
        
        # Use textwrap to handle long lines
        wrapped_text = textwrap.wrap(text, width=80)
        
        for line in wrapped_text:
            if y < 50: # Page break logic
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 50
            c.drawString(50, y, line)
            y -= 20
            
        c.save()
        return output_pdf