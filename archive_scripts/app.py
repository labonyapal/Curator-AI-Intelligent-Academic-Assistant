import streamlit as st
import uuid
from langchain_chroma import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from run_ingest import RobustOllamaEmbeddings
from langchain_ollama import OllamaLLM

# --- Page Setup ---
st.set_page_config(page_title="University AI", page_icon="🎓", layout="wide")

st.markdown("""
    <style>
    /* Dark Theme Base */
    .stApp { background-color: #1a1a2e; color: #e8eaed; }
    [data-testid="stSidebar"] { background-color: #0f0f0f; border-right: 1px solid #2a2a3e; }
    
    /* Centered Welcome Container */
    .welcome-container {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        height: 70vh; text-align: center;
    }
    .welcome-icon { font-size: 60px; margin-bottom: 20px; }
    .welcome-text { font-size: 32px; font-weight: 600; color: #ffffff; margin-bottom: 10px; }
    .welcome-sub { font-size: 16px; color: #9aa0a6; max-width: 400px; }
    
    /* Input Bar Styling to match your image */
    [data-testid="stChatInput"] {
        background: #2a2a3e !important;
        border: 1px solid #3a3a5e !important;
        border-radius: 30px !important;
        padding: 10px 20px !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- Logic ---
@st.cache_resource
def get_chain():
    embeddings = RobustOllamaEmbeddings()
    vectorstore = Chroma(persist_directory="./multimodal_db", embedding_function=embeddings)
    llm = OllamaLLM(model="llama3")
    prompt = ChatPromptTemplate.from_template("""
    Answer based ONLY on context. If unknown, say "I only have access to department documents."
    <context>{context}</context>
    Question: {input}
    """)
    return create_retrieval_chain(vectorstore.as_retriever(search_kwargs={"k": 3}), 
                                 create_stuff_documents_chain(llm, prompt))

qa_chain = get_chain()

# --- Session Management ---
if "sessions" not in st.session_state:
    st.session_state.sessions = {"default": {"name": "New Chat", "messages": []}}
if "active_id" not in st.session_state:
    st.session_state.active_id = "default"

# --- Sidebar ---
with st.sidebar:
    st.markdown("### 🎓 University AI")
    if st.button("➕ New conversation", use_container_width=True):
        new_id = str(uuid.uuid4())
        st.session_state.sessions[new_id] = {"name": "New Chat", "messages": []}
        st.session_state.active_id = new_id
        st.rerun()
    
    st.markdown("---")
    st.write("RECENT")
    for s_id, data in st.session_state.sessions.items():
        if st.button(data["name"], key=s_id, use_container_width=True):
            st.session_state.active_id = s_id
            st.rerun()

# --- Main Area ---
active_id = st.session_state.active_id
session = st.session_state.sessions[active_id]

if not session["messages"]:
    st.markdown(f"""
        <div class="welcome-container">
            <div class="welcome-icon">🎓</div>
            <div class="welcome-text">Hello, Student</div>
            <div class="welcome-sub">Ask anything about your textbooks and lecture notes. I've read them all.</div>
        </div>
    """, unsafe_allow_html=True)
else:
    for msg in session["messages"]:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

if prompt := st.chat_input("Ask about your research..."):
    if not session["messages"]:
        session["name"] = prompt[:20] + "..."
    
    session["messages"].append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        response = qa_chain.invoke({"input": prompt})
        answer = response['answer']
        st.markdown(answer)
        sources = set([doc.metadata.get('source', 'Unknown') for doc in response['context']])
        st.caption(f"📚 Sources: {', '.join(sources)}")
        session["messages"].append({"role": "assistant", "content": answer})
    st.rerun()