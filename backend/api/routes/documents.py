from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from groq import Groq
from core.config import settings
import io

router = APIRouter()

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
client = Groq(api_key=settings.GROQ_API_KEY)

vector_stores = {}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

@router.post("/upload/{session_id}")
async def upload_document(session_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan PDFs")

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_text(text)

    vector_stores[session_id] = FAISS.from_texts(chunks, embeddings)

    return {"status": "ok", "chunks": len(chunks), "filename": file.filename}

class DocumentQuery(BaseModel):
    question: str
    history: list = []

@router.post("/query/{session_id}")
async def query_document(session_id: str, body: DocumentQuery):
    if session_id not in vector_stores:
        raise HTTPException(status_code=404, detail="No hay documento cargado para esta sesión")

    docs = vector_stores[session_id].similarity_search(body.question, k=4)
    context = "\n\n".join([doc.page_content for doc in docs])

    messages = [
        {
            "role": "system",
            "content": f"Eres Jarvis. Responde basándote en este contexto del documento:\n\n{context}"
        }
    ]
    messages.extend(body.history)
    messages.append({"role": "user", "content": body.question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages
    )

    return {"answer": response.choices[0].message.content}

@router.delete("/document/{session_id}")
async def clear_document(session_id: str):
    vector_stores.pop(session_id, None)
    return {"status": "cleared"}