# TheBookieAI/backend/bot.py
# -*- coding: utf-8 -*-

import logging
import os
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import requests # <-- ADD THIS LINE

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


# --- Mock Book Database (REMOVED) ---
# This static dictionary is no longer needed. We will fetch books from a live API.


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
    Handles user messages, searches for the book using Google Books API, and replies with the result.
    """
    user_query = update.message.text.strip()
    logger.info(f"User '{update.effective_user.username}' searched for: '{user_query}'")

    await update.message.reply_chat_action('typing') # Let the user know the bot is working

    # Google Books API endpoint
    api_url = f"https://www.googleapis.com/books/v1/volumes?q={user_query}&maxResults=5"

    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()

        if "items" not in data:
            # Handle case where no books are found
            response_message = (
                f"❌ *Sorry!* I couldn't find any books matching '{user_query}'.\n\n"
                "Please try a different title or author."
            )
            await update.message.reply_text(response_message, parse_mode='Markdown')
            return

        # Find the first book with a downloadable PDF
        found_book = None
        for item in data["items"]:
            if item.get("accessInfo", {}).get("pdf", {}).get("isAvailable", False):
                found_book = item
                break
        
        if found_book:
            # A book with a downloadable PDF was found
            info = found_book.get("volumeInfo", {})
            title = info.get("title", "No Title")
            authors = ", ".join(info.get("authors", ["Unknown Author"]))
            
            # The webReaderLink for public domain books usually offers a PDF download option.
            download_link = found_book.get("accessInfo", {}).get("webReaderLink")

            response_message = (
                f"✅ *Success!* I found a downloadable version.\n\n"
                f"📚 *Title:* {title}\n"
                f"✒️ *Author(s):* {authors}\n\n"
                "Click the button below to open it."
            )
            
            keyboard = [
                [InlineKeyboardButton("⬇️ Open & Download", url=download_link)]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                response_message, 
                parse_mode='Markdown', 
                reply_markup=reply_markup
            )
        else:
            # Books were found, but none had a downloadable PDF
            # We can offer a preview link from the first result instead.
            first_result_info = data["items"][0].get("volumeInfo", {})
            title = first_result_info.get("title", "No Title")
            authors = ", ".join(first_result_info.get("authors", ["Unknown Author"]))
            preview_link = first_result_info.get("previewLink")

            response_message = (
                f"🤔 I found '{title}' by {authors}, but a free, legal PDF isn't available.\n\n"
                "This usually happens with copyrighted books. You can check out a preview instead."
            )
            keyboard = [
                [InlineKeyboardButton("📘 View Preview", url=preview_link)]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text(
                response_message, 
                parse_mode='Markdown',
                reply_markup=reply_markup
                )

    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
        await update.message.reply_text("- *Oops!* I'm having trouble connecting to my library. Please try again in a moment.")


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

