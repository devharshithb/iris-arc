from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio
import textwrap

# ✅ correct prefix now
router = APIRouter(prefix="/chat", tags=["stream"])

@router.post("/stream")
async def chat_stream(request: Request):
    """
    Compatible with frontend → /api/chat/stream
    """
    try:
        body = await request.json()
        prompt = (body.get("prompt") or "").strip() or "No prompt provided"
    except Exception:
        prompt = "No prompt provided"

    markdown = textwrap.dedent(f"""
    ## 💬 IrisArc Stream
    **You said:** {prompt}

    This is a streaming markdown demo.
    """).strip()

    async def token_gen():
        for token in markdown.split(" "):
            yield token + " "
            await asyncio.sleep(0.02)

    return StreamingResponse(token_gen(), media_type="text/plain")
