from gradio_client import Client

try:
    client = Client("https://iyneshkarthick15-diabetespredictor-api.hf.space/")
    print("Successfully connected to the Gradio client.")
    print("Inspecting available API endpoints...")
    print(client.view_api(all_endpoints=True))
except Exception as e:
    print(f"An error occurred: {e}")
