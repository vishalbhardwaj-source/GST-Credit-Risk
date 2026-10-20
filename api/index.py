import sys
import os
import traceback

# Ensure root directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.main import app
except Exception as err:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Error Fallback")
    error_msg = str(err)
    error_tb = traceback.format_exc()

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend initialization failed on Vercel serverless",
                "details": error_msg,
                "traceback": error_tb
            }
        )
