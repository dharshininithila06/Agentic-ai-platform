"""
RAG Pipeline Service

Implements Retrieval Augmented Generation using:
- ChromaDB for vector storage
- sentence-transformers for embeddings
- Anthropic Claude for generation
"""

from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os

class RAGPipeline:
    """
    Production RAG pipeline for operational document retrieval.

    Architecture:
    Documents → Chunk → Embed → ChromaDB
    Query → Embed → Similarity Search → Context → Claude → Response
    """

    def __init__(self):
        self.embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vectorstore = None
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            max_tokens=1500,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def ingest_documents(self, documents: list[dict]) -> int:
        """
        Ingest and chunk documents into ChromaDB vector store.
        Returns number of chunks created.
        """
        texts = []
        metadatas = []
        for doc in documents:
            chunks = self.text_splitter.split_text(doc["content"])
            texts.extend(chunks)
            metadatas.extend([{"source": doc["name"], "type": doc.get("type", "ops")} for _ in chunks])

        self.vectorstore = Chroma.from_texts(
            texts=texts,
            embedding=self.embeddings,
            metadatas=metadatas,
            collection_name="ops_documents",
        )
        return len(texts)

    def build_rag_chain(self):
        """Build the RAG chain: retriever → prompt → LLM → parser."""
        if not self.vectorstore:
            raise ValueError("No documents ingested. Call ingest_documents() first.")

        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )

        prompt = ChatPromptTemplate.from_template("""
You are an expert operational analyst. Use the following context from internal documents to answer the question.
Be specific, cite sources, and provide actionable insights.

Context:
{context}

Question: {question}

Provide a structured response with:
1. Direct answer
2. Supporting evidence from documents
3. Recommended actions
""")

        def format_docs(docs):
            return "\n\n".join([f"[{d.metadata['source']}]: {d.page_content}" for d in docs])

        chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        return chain

    async def query(self, question: str) -> dict:
        """Execute a RAG query and return response with sources."""
        chain = self.build_rag_chain()
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})
        docs = retriever.get_relevant_documents(question)
        response = await chain.ainvoke(question)
        return {
            "answer": response,
            "sources": list(set([d.metadata["source"] for d in docs])),
            "docs_retrieved": len(docs),
        }

# Singleton instance
rag_pipeline = RAGPipeline()
