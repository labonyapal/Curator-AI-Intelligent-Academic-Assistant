import sys
import os

print("--- Python Path Diagnostic ---")
print("Current Working Directory:", os.getcwd())
print("\nWhere Python looks for modules (sys.path):")
for path in sys.path:
    print(path)

print("\n--- Checking LangChain ---")
try:
    import langchain
    print(f"SUCCESS: LangChain found at: {langchain.__file__}")
except ImportError as e:
    print(f"ERROR: LangChain import failed: {e}")