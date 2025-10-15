from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import textwrap

app = FastAPI(title="IrisArc Backend")

# ------------------------------------------------------------
# CORS (allow local Next.js frontend during development)
# ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# Streaming Markdown Chat Endpoint
# ------------------------------------------------------------
@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    """
    Streams a Markdown-formatted response token-by-token to the frontend.
    Properly preserves line breaks and indentation for Markdown rendering.
    """
    try:
        body = await request.json()
        prompt = body.get("prompt", "").strip() or "No prompt provided"
    except Exception:
        prompt = "No prompt provided"

    # ✅ Use a plain triple-quoted string (not an f-string) for Markdown safety
    markdown_template = """# 💬 IrisArc Markdown Stream Demo

**You said:** {prompt}

---

Here’s a *sample streaming* **Markdown** reply with various elements:

1. **Bold text** for emphasis  
2. *Italic text* for subtle tone  
3. [A sample link](https://example.com)  
4. Inline code: `print("hello world")`

---

### 🧠 Example Code Block
```python
def greet(name):
    print("Hello, " + name + "!")
    
greet("IrisArc")
```
---

> “This quote shows how markdown can structure responses beautifully.”

- [x] Works with streaming  
- [ ] Not rendered yet (until you add react-markdown)

*— end of stream —*
"""

    # ✅ Safely format without f-string interpretation
    markdown_response = textwrap.dedent(markdown_template).format(prompt=prompt)

    # Convert newlines to explicit Markdown soft breaks ("  \n")
    markdown_response = markdown_response.replace("\n", "  \n")

    async def token_gen():
        for token in markdown_response.split(" "):
            yield token + " "
            await asyncio.sleep(0.03)  # simulate token delay

    return StreamingResponse(token_gen(), media_type="text/plain")


# ------------------------------------------------------------
# Root route (optional sanity check)
# ------------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "message": "IrisArc FastAPI backend running 🚀"}
