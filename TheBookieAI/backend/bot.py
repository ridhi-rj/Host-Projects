# TheBookieAI/backend/bot.py
# -*- coding: utf-8 -*-

import logging
import os
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# --- Configuration ---
# Load environment variables from .env file in the config directory
dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'config', '.env')
load_dotenv(dotenv_path=dotenv_path)

TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
# Replace with your actual web app URL once deployed
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://example.com') 

# Enable logging for better debugging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


# --- Mock Book Database ---
# In a real-world application, this would be a database (e.g., PostgreSQL, MongoDB)
# or an API call to a book-finding service.
# For this example, we use a simple dictionary with public domain books from Project Gutenberg.
MOCK_BOOK_DATABASE = {
    "pride and prejudice": {
        "author": "Jane Austen",
        "link": "https://www.gutenberg.org/ebooks/1342.pdf.images"
    },
    "frankenstein": {
        "author": "Mary Shelley",
        "link": "https://www.gutenberg.org/ebooks/84.pdf.images"
    },
    "moby dick": {
        "author": "Herman Melville",
        "link": "https://www.gutenberg.org/ebooks/2701.pdf.images"
    },
    "a tale of two cities": {
        "author": "Charles Dickens",
        "link": "https://www.gutenberg.org/ebooks/98.pdf.images"
    },
    "the adventures of sherlock holmes": {
        "author": "Arthur Conan Doyle",
        "link": "https://www.gutenberg.org/ebooks/1661.pdf.images"
    }
}

# --- Bot Command Handlers ---

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles the /start command. Greets the user and provides instructions.
    """
    user = update.effective_user
    welcome_message = (
        f"👋 *Welcome to TheBookieAI, {user.first_name}!* 📖\n\n"
        "I'm your personal AI-powered librarian. I can help you find PDF versions of your favorite books in a flash.\n\n"
        "To get started, simply type the name of the book you're looking for.\n\n"
        "*For example:* `Pride and Prejudice`\n\n"
        "Let the reading adventure begin! ✨"
    )
    
    # Create a keyboard with a button to open the Web App
    keyboard = [
        [InlineKeyboardButton("🎨 Open TheBookieAI Hub", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        welcome_message, 
        parse_mode='Markdown',
        reply_markup=reply_markup
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles the /help command. Provides user support.
    """
    help_message = (
        "🆘 *How I Can Help You*\n\n"
        "Simply send me the name of a book, and I'll do my best to find a direct PDF download link for you.\n\n"
        "*Commands:*\n"
        "`/start` - Welcome message and instructions.\n"
        "`/help` - Shows this help message.\n\n"
        "If you encounter any issues, please make sure you're typing the book title correctly."
    )
    await update.message.reply_text(help_message, parse_mode='Markdown')

# --- Main Logic ---

async def find_book(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles user messages, searches for the book, and replies with the result.
    """
    user_query = update.message.text.lower().strip()
    logger.info(f"User '{update.effective_user.username}' searched for: '{user_query}'")

    await update.message.reply_text(f"Searching for '{user_query}'... 🕵️‍♂️")

    # Search in our mock database (case-insensitive)
    book_info = MOCK_BOOK_DATABASE.get(user_query)

    if book_info:
        # Book found
        download_link = book_info["link"]
        author = book_info["author"]
        
        response_message = (
            f"✅ *Success!* I found your book.\n\n"
            f"📚 *Title:* {user_query.title()}\n"
            f"✒️ *Author:* {author}\n\n"
            "Click the button below to download the PDF."
        )
        
        keyboard = [
            [InlineKeyboardButton("⬇️ Download PDF", url=download_link)]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            response_message, 
            parse_mode='Markdown', 
            reply_markup=reply_markup
        )
    else:
        # Book not found
        response_message = (
            f"❌ *Sorry!* I couldn't find a PDF for '{user_query.title()}'.\n\n"
            "Please double-check the spelling. My library is always growing, so feel free to try again later!"
        )
        await update.message.reply_text(response_message, parse_mode='Markdown')


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Log Errors caused by Updates.
    """
    logger.warning('Update "%s" caused error "%s"', update, context.error)


def main() -> None:
    """
    Main function to start the bot.
    """
    if not TELEGRAM_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN environment variable not set! Exiting.")
        return

    # Create the Application and pass it your bot's token.
    application = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # --- Register Handlers ---
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    
    # Register a message handler for non-command text messages
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, find_book))
    
    # Register an error handler
    application.add_error_handler(error_handler)

    # Start the Bot
    logger.info("Bot is starting... Polling for updates.")
    application.run_polling()

if __name__ == '__main__':
    main()
