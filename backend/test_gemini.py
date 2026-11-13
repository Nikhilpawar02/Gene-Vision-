import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("FAIL: GEMINI_API_KEY was not loaded.")
    raise SystemExit(1)

try:
    client = genai.Client(api_key=api_key)

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        input="Explain DNA in one sentence.",
    )

    print("Gemini connection: PASS")
    print("Response:", interaction.output_text)

except Exception as exc:
    print("Gemini connection: FAIL")
    print("Error type:", type(exc).__name__)
    print("Error details:", str(exc))