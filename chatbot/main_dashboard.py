import streamlit as st
import uuid
import pandas as pd
import importlib
import tempfile
from gtts import gTTS
import os
import wave
import json
import speech_recognition as sr
from vosk import Model, KaldiRecognizer

from utils.database import init_db, save_conversation, get_conversation_history
import utils.llm_utils as llm_utils
import sentiment_analysis

st.set_page_config(page_title="Manamitra Mental Health System", page_icon="🧠", layout="wide")

# ---------------- Session State Initialization ----------------
if 'user_id' not in st.session_state:
    st.session_state.user_id = str(uuid.uuid4())
if 'screening_completed' not in st.session_state:
    st.session_state.screening_completed = False
if 'conversation_memory' not in st.session_state:
    from langchain.memory import ConversationBufferMemory
    st.session_state.conversation_memory = ConversationBufferMemory()

if 'voice_mode_active' not in st.session_state:
    st.session_state.voice_mode_active = False

# ---------------- Initialize DB ----------------
init_db()

# ---------------- Sidebar Navigation ----------------
st.sidebar.title("Manamitra Navigation")
module = st.sidebar.radio("Go to:", [
    "Welcome", "Sentiment Analysis", "Manamitra Chatbot"
])

st.title("Welcome to Manamitra 🧠")
st.write("Your anonymous mental health companion. All data is private and anonymized.")

# ---------------- Welcome ----------------
if module == "Welcome":
    st.header("Introduction")
    st.write("Manamitra provides AI-powered mental health support for college students. Navigate modules using the sidebar.")
    st.info(f"Your Anonymous ID: {st.session_state.user_id}")
    st.write("Disclaimer: This tool is not a replacement for professional mental health care.")

# ---------------- Sentiment Analysis ----------------
elif module == "Sentiment Analysis":
    importlib.reload(sentiment_analysis)
    sentiment_analysis.display_sentiment_analysis()

# ---------------- Chatbot with Continuous Vosk Voice + TTS ----------------
elif module == "Manamitra Chatbot":
    st.header("Manamitra Conversational AI")
    st.write("Chat with Manamitra for support. Multilingual and context-aware.")

    # ---------------- Load Vosk Model ----------------
    MODEL_PATH = r"C:\Users\HP\Documents\SIH2025\chatbot\vosk-model-en-us-0.22-lgraph"
    if not os.path.exists(MODEL_PATH):
        st.error("Vosk model not found! Please download and place it in the model folder.")
    else:
        vosk_model = Model(MODEL_PATH)

    # ---------------- Continuous Voice Input ----------------
    def record_audio_vosk_continuous(duration=5):
        r = sr.Recognizer()
        with sr.Microphone() as source:
            st.info(f"🎤 Speak now for {duration} seconds...")
            audio = r.record(source, duration=duration)  # record fixed duration

        # Save to temp WAV
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
            tmp_filename = tmp_wav.name
            with wave.open(tmp_filename, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(audio.sample_width)
                wf.setframerate(audio.sample_rate)
                wf.writeframes(audio.get_raw_data())

        # Recognize with Vosk
        rec = KaldiRecognizer(vosk_model, audio.sample_rate)
        result_text = ""
        with wave.open(tmp_filename, "rb") as wf:
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    res = json.loads(rec.Result())
                    result_text += " " + res.get("text", "")
            final_res = json.loads(rec.FinalResult())
            result_text += " " + final_res.get("text", "")

        os.remove(tmp_filename)
        return result_text.strip()

    # ---------------- Input Mode ----------------
    input_mode = st.radio("Input method:", ["Keyboard", "Voice"])
    user_message = ""

    if input_mode == "Keyboard":
        user_message = st.text_input("Type your message:")

    elif input_mode == "Voice":
        # Toggle voice mode
        if st.button("Start Continuous Voice Mode" if not st.session_state.voice_mode_active else "Stop Voice Mode"):
            st.session_state.voice_mode_active = not st.session_state.voice_mode_active

        if st.session_state.voice_mode_active:
            user_message = record_audio_vosk_continuous(duration=5)
            if user_message:
                st.success(f"You said: {user_message}")

    # ---------------- Bot Response ----------------
    if user_message:
        intent = llm_utils.get_intent(user_message)
        response = llm_utils.get_multilingual_response(user_message, st.session_state.conversation_memory)

        save_conversation(st.session_state.user_id, user_message, response, intent)
        st.write(f"Manamitra: {response}")

        if intent == "crisis":
            st.error("Crisis detected! Please use the Crisis Management module or contact a helpline.")

        # ---------------- TTS (Windows-safe) ----------------
        tts = gTTS(response, lang="en")
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tmp_file.close()
        tts.save(tmp_file.name)
        st.audio(tmp_file.name, format="audio/mp3")
        # Note: do not delete immediately; keeps Windows safe

    # ---------------- Conversation History ----------------
    st.header("Conversation History")
    history = get_conversation_history(st.session_state.user_id)
    if history:
        for row in history:
            st.write(f"You: {row['message']}")
            st.write(f"Manamitra: {row['response']}")

# ---------------- Coping Strategies ----------------
elif module == "Coping Strategies":
    import json
    from utils.database import save_resource_usage, get_resource_history
    st.header("Coping Strategies & Resources")
    st.write("Find personalized coping strategies and resources.")

    with open("data/coping_strategies.json", "r", encoding="utf-8") as f:
        strategies = json.load(f)

    condition = st.selectbox("Select your condition:", ["Anxiety", "Depression", "Stress", "Sleep Issues"])
    difficulty = st.selectbox("Difficulty Level:", ["Beginner", "Intermediate", "Advanced"])
    time = st.selectbox("Time Available:", ["5 min", "15 min", "30 min"])

    filtered = [s for s in strategies if s["condition"] == condition and s["difficulty"] == difficulty and s["time"] == time]

    if filtered:
        for strat in filtered:
            st.subheader(strat["title"])
            st.write(strat["description"])
            if "audio" in strat:
                st.audio(strat["audio"])
            if "video" in strat:
                st.video(strat["video"])
            if st.button(f"Mark as Used: {strat['title']}"):
                save_resource_usage(st.session_state.user_id, strat["title"])
    else:
        st.info("No strategies found for your selection.")

    st.header("Resource Usage History")
    history = get_resource_history(st.session_state.user_id)
    if history:
        for r in history:
            st.write(f"Resource: {r['resource_type']} at {r['accessed_at']}")

# ---------------- Analytics Dashboard ----------------
elif module == "Analytics Dashboard":
    import plotly.express as px
    from utils.database import get_screening_history, get_sentiment_history, get_resource_history, get_crisis_history

    st.header("Analytics & Progress Tracking")
    st.write("Visualize your journey, trends, and intervention effectiveness.")

    st.header("Screening Progress")
    screening = get_screening_history(st.session_state.user_id)
    if screening is not None:
        fig = px.line(pd.DataFrame(screening), x="timestamp", y="score", color="test_type", title="Screening Scores Over Time")
        st.plotly_chart(fig)
    else:
        st.info("No screening data available.")

    st.header("Sentiment Trends")
    sentiment = get_sentiment_history(st.session_state.user_id)
    if sentiment is not None:
        fig = px.line(pd.DataFrame(sentiment), x="timestamp", y="sentiment_score", title="Sentiment Trend Over Time")
        st.plotly_chart(fig)
    else:
        st.info("No sentiment data available.")

    st.header("Resource Utilization")
    resources = get_resource_history(st.session_state.user_id)
    if resources:
        st.write(f"Resources used: {len(resources)}")
    else:
        st.info("No resource usage data available.")

    st.header("Crisis Incidents")
    crisis = get_crisis_history(st.session_state.user_id)
    if crisis:
        st.write(f"Crisis incidents: {len(crisis)}")
    else:
        st.info("No crisis incidents recorded.")
