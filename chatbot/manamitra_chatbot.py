from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain.memory import ConversationBufferMemory
from utils.llm_utils import get_intent, get_multilingual_response, get_user_profile

# ---------------------------
# FastAPI app
# ---------------------------
app = FastAPI(title="Manamitra API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Pydantic models
# ---------------------------
class UserMessage(BaseModel):
    message: str

class BotResponse(BaseModel):
    response: str
    intent: str

# ---------------------------
# Endpoint for chat
# ---------------------------
@app.post("/chat", response_model=BotResponse)
async def chat_endpoint(user_message: UserMessage):
    try:
        # Create a **new memory for each session**
        conversation_memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        # detect intent
        intent = get_intent(user_message.message)

        # get AI response
        response = get_multilingual_response(user_message.message, conversation_memory)

        return {"response": response, "intent": intent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
