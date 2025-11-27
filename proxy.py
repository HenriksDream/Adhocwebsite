from flask import Flask, request, Response
import requests

app = Flask(__name__)

@app.route("/proxy")
def proxy():
    url = request.args.get("url")
    if not url:
        return "Missing URL", 400

    # Fetch image from fandom
    r = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://twilight-imperium.fandom.com/"
    })

    if r.status_code != 200:
        return f"Error fetching image: {r.status_code}", 500

    # Guess content type
    content_type = r.headers.get("Content-Type", "image/png")

    return Response(r.content, content_type=content_type)

@app.route("/")
def home():
    return "Image Proxy Running"
    
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
