

**URL**: https://mentalhealthsupportsystem.lovable.app/


Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

Launch the Backend (Chatbot API)

The backend is built with FastAPI and serves the AI responses for the chat interface.

```# Step 1: Navigate to the backend directory.
cd chatbot

# Step 2: Create and activate a Python virtual environment.
python -m venv env          # Create venv
# Activate on Windows:
env\Scripts\activate

# Step 3: Install the required Python dependencies.
pip install -r requirements.txt

# Step 4: Launch the backend server using uvicorn.
uvicorn manamitra_chatbot:app --reload --host 0.0.0.0 --port 8000

```
The backend API will be available at: http://localhost:8000.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

