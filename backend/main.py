from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.genai.errors import ClientError, ServerError
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from google import genai
from google.genai import types


# Load environment variables from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
frontend_url = os.getenv("FRONTEND_URL")

# Ceeck whether the API key was loaded
if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in the .env file")

# Create Gemini client
client = genai.Client(api_key=api_key)

print("Gemini client created successfully")


# Create FastAPI app
app = FastAPI()


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request structure
class ChatRequest(BaseModel):
    message: str
    history: list[dict]


# Test route
@app.get("/")
def home():
    return {"message": "AI Chatbot Backend is running"}


# Chat route
@app.post("/chat")
def chat(request: ChatRequest):

    ai_messages = []

    # Convert your frontend chat history
    # into Gemini's conversation format
    for message in request.history:

        if message["sender"] == "user":
            role = "user"
        else:
            role = "model"

        ai_messages.append(
            types.Content(
                role=role,
                parts=[
                    types.Part(text=message["text"])
                ]
            )
        )

    

    # Send conversation to Gemini
    try:
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=ai_messages, 
            config=types.GenerateContentConfig(
                system_instruction="""
                    You are a helpful AI assistant. 
                    
                    Answer questions clearly and concisely by default.
                    Use simple and easy-to-understand language.
                    Avoid unnecessarily long explanations.
                    Answer the user's question directly first.
                    
                    Only provide detailes explanations when 
                    the use explicitly asks for more detail.   

                    If you provide a complete, ready-to-use code solution, 
                    put <!-- FULL_CODE --> immediately before the complete code block.

                    If you are only explaining code line-by-line or showing a small code 
                    snippet as part of an explanation, do NOT use <!-- FULL_CODE -->.
                    
                    Only provide code when the user asks for code 
                    or when code is necessary to answer the question.

                    Use emojis naturally when they fit the context of the 
                    conversation. Choose emojis based on the meaning and tone of the 
                    response. Do not overuse emojis. 
                    
                    For serious or professional topics, use few or no emojis. 
                    Do not use any emoji that appeared in the previous two assistant responses.
                    If using an emoji, choose a different appropriate emoji.
                    
                    Use an emoji naturally when appropriate, especially for responses longer 
                    than two short sentences.Do not overuse emojis. And also use appropriate emojis at 
                    last of the sentence     
                    
                    Use emojis naturally when appropriate, especially when the response contains more than two sentences.
                    Place appropriate emojis naturally at the end of relevant sentences.
                    Do not overuse emojis.   
                    """
            
            )
        )
            
    except ClientError as error: 
        print("Gemini Error: ",error); 
        
        if error.code == 429: 
            raise HTTPException(
                status_code = 429, 
                detail = "Gemini request limit reached. Please try again later."
            )
        raise HTTPException (
            status_code = 500, 
            detail = "AI service failed."
        )
    except ServerError as error: 
        print("Gemini Server Error:", error)
        
        if error.code == 503: 
            raise HTTPException(
                status_code = 503, 
                detail = "Gemini is temporarily busy. Please try again."
            )
        
        raise HTTPException(
            status_code = 500, 
            detail="AI service failed."
        )

    # Get Gemini's text response
    reply = response.text

    print("User:", request.message)
    print("Gemini:", reply)

    return {
        "reply": reply
    }
