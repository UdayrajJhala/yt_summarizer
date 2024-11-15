import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
import os
from dotenv import load_dotenv
import logging
from typing import Dict

SUPPORTED_LANGUAGES: Dict[str, str] = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'ta': 'Tamil',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia'
}

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Check if API key exists
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Google AI
genai.configure(api_key=GOOGLE_API_KEY)

def get_video_id(youtube_url):
    try:
        if 'v=' in youtube_url:
            return youtube_url.split('v=')[1].split('&')[0]
        else:
            raise ValueError("Invalid YouTube URL format")
    except Exception as e:
        logger.error(f"Error extracting video ID: {str(e)}")
        raise

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US', 'en-GB', 'hi'])
        return transcript
    except TranscriptsDisabled:
        logger.error(f"Subtitles are disabled for video ID: {video_id}")
        raise RuntimeError("Subtitles are disabled for this video.")
    except Exception as e:
        logger.error(f"Error fetching transcript for video ID {video_id}: {str(e)}")
        raise RuntimeError(f"Error fetching transcript: {str(e)}")

def transcript_to_text(transcript):
    try:
        return " ".join([entry['text'] for entry in transcript])
    except Exception as e:
        logger.error(f"Error converting transcript to text: {str(e)}")
        raise

def summarize_text(text, target_language='en'):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Summarize the following YouTube video transcript in {SUPPORTED_LANGUAGES[target_language]} language. Include:
        
        - A brief overview/introduction (2-3 sentences)
        - Key points or main topics discussed (using bullet points)
        - Important highlights or takeaways
        - A brief conclusion
        
        Use appropriate markdown formatting (headers, bullet points, bold/italic text) to make the summary well-structured and readable.
        Make sure the ENTIRE summary is in {SUPPORTED_LANGUAGES[target_language]} language, including all headings and bullet points.
        
        Transcript:
        """ + text
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise RuntimeError(f"Error generating summary: {str(e)}")
