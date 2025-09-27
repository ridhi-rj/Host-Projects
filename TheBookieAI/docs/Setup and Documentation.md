📖 TheBookieAI - Your AI-Powered Telegram Librarian
TheBookieAI is a fully functional, deployable Telegram bot that provides users with direct download links for book PDFs. It features a simple, interactive chat interface and a sleek, modern web landing page.

✨ Features
Instant Book Search: Users can type a book name to get a direct PDF download link.

Interactive UI: Clean and user-friendly interaction within Telegram.

Modern Web Page: A stylish landing page built with HTML and Tailwind CSS.

Asynchronous Backend: Built with the latest python-telegram-bot library for optimal performance.

Easy to Deploy: Ready for deployment on platforms like Render or Heroku.

Clean Code: Modular, well-commented, and organized project structure.

🚀 Getting Started: Step-by-Step Setup
Follow these instructions to get your own instance of TheBookieAI running in VS Code.

1. Prerequisites
Python 3.8+

Visual Studio Code

Git

A Telegram Account

2. Create Your Telegram Bot
First, you need to create a bot in Telegram and get its API token.

Open Telegram and search for the @BotFather user (it's the official bot for creating other bots).

Start a chat with BotFather and send the /newbot command.

Follow the on-screen prompts:

Choose a name for your bot (e.g., My Book Finder).

Choose a unique username for your bot, which must end in bot (e.g., MyBookFinder123_bot).

BotFather will send you a message containing your API Token. It will look something like 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11.

Copy this token and keep it safe! This is your bot's secret key.

3. Clone the Project
Open your terminal or command prompt and clone this repository:

git clone <repository_url>
cd TheBookieAI

4. Set Up VS Code
Open the TheBookieAI folder in Visual Studio Code.

VS Code might prompt you to install recommended extensions like "Python". It's a good idea to do so.

5. Create a Virtual Environment
It's best practice to use a virtual environment to manage project dependencies.

# In the VS Code terminal (Ctrl+` or Cmd+`)
python -m venv venv

Now, activate the virtual environment:

Windows: .\venv\Scripts\activate

macOS/Linux: source venv/bin/activate

Your terminal prompt should now be prefixed with (venv).

6. Install Dependencies
Install all the required Python packages using the requirements.txt file.

pip install -r requirements.txt

7. Configure Environment Variables
Navigate to the /config folder.

Rename the .env.example file to .env.

Open the new .env file and paste your Telegram Bot Token that you got from BotFather.

# TheBookieAI/config/.env
TELEGRAM_BOT_TOKEN="PASTE_YOUR_TOKEN_HERE"
WEB_APP_URL="[https://example.com](https://example.com)" # You can leave this as is for now

8. Run the Bot Locally
You're all set! Run the bot from the root TheBookieAI directory:

python backend/bot.py

If everything is correct, your terminal will show Bot is starting... Polling for updates.. Your bot is now live!

9. Interact with Your Bot
Open Telegram.

Search for your bot's username (e.g., MyBookFinder123_bot).

Send the /start command.

Try searching for a book like Frankenstein or Moby Dick.

🌐 Deployment (Example with Render)
To make your bot available 24/7, you should deploy it to a cloud service. Render is a great free option.

Sign up for a free account at Render.com.

Push your code to a GitHub repository.

On the Render Dashboard, click New + > Background Worker.

Connect your GitHub repository.

Configure the worker:

Name: thebookieai-bot (or any name you like)

Region: Choose a region close to you.

Branch: main

Build Command: pip install -r requirements.txt

Start Command: python backend/bot.py

Instance Type: Free

Click on Advanced, then go to Environment Variables. Add your TELEGRAM_BOT_TOKEN here.

Key: TELEGRAM_BOT_TOKEN

Value: PASTE_YOUR_TOKEN_HERE

Click Create Background Worker.

Render will automatically build and deploy your bot. It will now run continuously online.

Note on Book Sources: The current version uses a small, hardcoded dictionary of public domain books for demonstration purposes. To expand its library, you would need to integrate a database or an API from a service like the Internet Archive or Project Gutenberg.