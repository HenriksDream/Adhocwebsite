from flask import Flask, request, Response
import requests

app = Flask(__name__)

@app.route("/img")
def img():
    url = request.args.get("url")
    if not url:
        return "Missing url", 400

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }


    r = requests.get(url, headers=headers)

    return Response(r.content, content_type=r.headers.get("Content-Type", "image/jpeg"))

app.run(port=5005)
