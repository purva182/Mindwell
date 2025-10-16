import streamlit as st
import plotly.express as px
from datetime import datetime
import pandas as pd
import json
import os
from utils.database import get_sentiment_history, get_conversation_history
from langchain_groq import ChatGroq
from dotenv import load_dotenv


def display_sentiment_analysis():
    st.title("AI-Powered Sentiment Analysis")

    st.write("This tool analyzes your recent conversations with Manamitra, PHQ-9 & GAD-7 scores, and journal to provide a comprehensive sentiment score and risk level.")

    # Load user profile for context
    profile_path = os.path.join(os.path.dirname(__file__), 'data/user_profile.json')
    if not os.path.exists(profile_path):
        profile_path = os.path.join(os.path.dirname(__file__), '../data/user_profile.json')
    with open(profile_path, 'r', encoding='utf-8') as f:
        user_profile = json.load(f)[0]

    st.write(f"DEBUG: Using user_id: {st.session_state.user_id}")

    # Get recent conversation history
    conversation_history = get_conversation_history(st.session_state.user_id)
    recent_conversation = ""
    if conversation_history and len(conversation_history) > 0:
        # Use the last 5 user+bot messages as context
        recent_msgs = conversation_history[-5:]
        recent_conversation = "\n".join([
            f"You: {msg['message']}\nManamitra: {msg['response']}" for msg in recent_msgs if msg['message'] and msg['response']
        ])

    # st.header("Recent Conversations Used for Analysis")
    # if conversation_history and len(conversation_history) > 0:
    #     recent_msgs = conversation_history[-5:]
    #     for msg in reversed(recent_msgs):
    #         if msg.get('message'):
    #             st.text(f"You: {msg['message']}")
    #         if msg.get('response'):
    #             st.text(f"Manamitra: {msg['response']}")
    #         st.markdown("---")
    # else:
    #     st.info("No recent conversations to display.")


    from utils.database import save_sentiment


    # Always show the most recent sentiment score from history if available
    history = get_sentiment_history(st.session_state.user_id)
    latest_result = None
    if history is not None and not history.empty:
        # Get the most recent sentiment entry
        latest_row = history.sort_values("timestamp", ascending=False).iloc[0]
        latest_result = {
            "level": latest_row.get("severity", "unknown"),
            "score": latest_row.get("sentiment_score", ""),
            "methodology": latest_row.get("message", "")
        }

    # Only run LLM if there is a new conversation not already analyzed
    should_run_llm = False
    if recent_conversation:
        # st.write(recent_conversation)  # Debug output   
        if latest_result is None or latest_result["methodology"] != recent_conversation:
            should_run_llm = True

    if should_run_llm:
        llm = ChatGroq(
            temperature=0,
            groq_api_key='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',
            model_name="llama-3.3-70b-versatile"
        )
        prompt = f"""
        You are a mental health AI assistant. Analyze the user's recent conversation with you, their latest conversation history,PHQ-9 and GAD-7 scores, and their journal entries to determine their current emotional state and risk level. Give more weightage to their conversation histroy. If user uses words like extremely harmful words(eg:suicide, killing,having poison, etc.) give a very high level and score for it.
        
        User profile: {json.dumps(user_profile)}
        Recent conversation: {recent_conversation}
        
        Please provide:
        1. A sentiment level (High/Medium/Low)
        2. A sentiment score (0-100, where higher means more negative)
        3. A short explanation of the methodology you used to determine this score, referencing the conversation, PHQ-9, GAD-7, and journal.
        Respond in JSON with keys: level, score, methodology.
        """
        response = llm.invoke(prompt)
        import re
        import ast
        import json as pyjson
        try:
            match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if match:
                result = ast.literal_eval(match.group(0))
            else:
                result = pyjson.loads(response.content)
        except Exception:
            result = {"level": "unknown", "score": 0, "methodology": response.content}
        save_sentiment(st.session_state.user_id, recent_conversation, result.get('score', 0), result.get('level', 'unknown'), datetime.now())
        latest_result = result

    if latest_result:
        level = latest_result.get('level', 'unknown').lower()
        score = latest_result.get('score', '')
        methodology = latest_result.get('methodology', '')

        st.subheader("Current Sentiment Analysis")

        # Display sentiment level with color
        if level == 'high':
            st.error(f"Sentiment Level: High")
        elif level == 'medium':
            st.warning(f"Sentiment Level: Medium")
        elif level == 'low':
            st.info(f"Sentiment Level: Low") # Using info for a distinct color
        else:
            st.info(f"Sentiment Level: {latest_result.get('level', 'unknown')}")

        # Display sentiment score with color
        try:
            score_val = float(score)
            if score_val < 40:
                st.success(f"Sentiment Score: {score}")
            elif 40 <= score_val <= 80:
                st.warning(f"Sentiment Score: {score}")
            else:
                st.error(f"Sentiment Score: {score}")
        except (ValueError, TypeError):
            st.info(f"Sentiment Score: {score}")

        st.write(f"Methodology: {methodology}")
    elif not recent_conversation:
        st.warning("No recent conversation found. Please chat with Manamitra to enable sentiment analysis.")



    st.header("Sentiment History")
    history = get_sentiment_history(st.session_state.user_id)
    if history is not None and not history.empty:
        df = history

        # --- Data Cleaning and Preparation for Plotting ---
        # Ensure timestamp is in datetime format
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Ensure sentiment_score is numeric, converting non-numeric to NaN
        df['sentiment_score'] = pd.to_numeric(df['sentiment_score'], errors='coerce')
        
        # Remove rows where sentiment_score could not be converted
        df.dropna(subset=['sentiment_score'], inplace=True)
        
        # Sort by timestamp to ensure the line connects points chronologically
        df.sort_values("timestamp", inplace=True)

        # Check if there's data left to plot
        if not df.empty:
            fig = px.line(df, x="timestamp", y="sentiment_score", title="Sentiment Trend Over Time", markers=True)
            st.plotly_chart(fig)
        else:
            st.info("No valid sentiment score data to plot.")

        # Show table of all sentiment analysis ratings
        st.subheader("All Sentiment Analysis Ratings")
        display_cols = [col for col in ["timestamp", "sentiment_score", "message"] if col in df.columns]
        st.dataframe(df[display_cols].sort_values("timestamp", ascending=False), use_container_width=True)
    else:
        st.info("No sentiment history found.")

if __name__ == "__main__":
    # This allows the page to be run standalone for testing if needed,
    # but it won't be executed when imported in main_dashboard.py
    if 'user_id' not in st.session_state:
        st.session_state.user_id = "test_user"  # Example user for standalone run
    display_sentiment_analysis()
