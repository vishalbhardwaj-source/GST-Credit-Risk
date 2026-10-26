import os
import uvicorn
import gradio as gr
from backend.main import app as fastapi_app

# Create a clean Gradio interface for status and health check
with gr.Blocks(title="GST Credit-at-Risk Forecaster API") as demo:
    gr.Markdown("# 🚀 GST Credit-at-Risk Forecaster API")
    gr.Markdown(
        """
        ### Backend is running live on Hugging Face Spaces!
        
        - **Interactive API Documentation:** [/docs](/docs)
        - **OpenAPI Schema:** [/openapi.json](/openapi.json)
        - **Frontend App:** [GST Credit-at-Risk Dashboard](https://gst-credit-risk.vercel.app)
        """
    )

# Mount Gradio onto the existing FastAPI backend
# This preserves all FastAPI /api routes and /docs while satisfying HF Gradio requirements
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
