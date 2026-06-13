from langchain_chroma import Chroma
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from run_ingest import RobustOllamaEmbeddings

# 1. Setup
db_path = "./multimodal_db"
embeddings = RobustOllamaEmbeddings()
vectorstore = Chroma(persist_directory=db_path, embedding_function=embeddings)
llm = OllamaLLM(model="llama3")

# 2. Updated Prompt: Includes a request for the Source
prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the context below. 
If you use information from the context, please state the filename it came from.

<context>
{context}
</context>

Question: {input}
""")

combine_docs_chain = create_stuff_documents_chain(llm, prompt)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
qa_chain = create_retrieval_chain(retriever, combine_docs_chain)

# 3. Loop
print("\n--- AI Chatbot Ready! (Sources included) ---")
while True:
    query = input("Ask a question: ")
    if query.lower() == "quit": break
    
    response = qa_chain.invoke({"input": query})
    
    # This prints the answer
    print(f"\nAI Answer:\n{response['answer']}\n")
    
    # This shows you the technical source if available
    sources = [doc.metadata.get('source', 'Unknown') for doc in response['context']]
    print(f"Sources used: {set(sources)}")