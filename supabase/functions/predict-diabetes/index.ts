import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Function 'predict-diabetes' initializing.");

const huggingFaceApiUrl = "https://iyneshkarthick15-diabetespredictor-api.hf.space/gradio_api/call/predict";
const huggingFaceApiKey = Deno.env.get("HUGGING_FACE_API_KEY");

serve(async (req) => {
  console.log(`Received request: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  if (!huggingFaceApiKey) {
    return new Response(JSON.stringify({ error: "HUGGING_FACE_API_KEY is not set." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { data: inputArray } = await req.json();

    const startResponse = await fetch(huggingFaceApiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${huggingFaceApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: inputArray }),
    });

    if (!startResponse.ok) {
      throw new Error(`Hugging Face API Step 1 error: ${await startResponse.text()}`);
    }

    const { event_id } = await startResponse.json();
    console.log(`Prediction job started with event_id: ${event_id}`);

    const eventUrl = `${huggingFaceApiUrl}/${event_id}`;
    const sseResponse = await fetch(eventUrl, {
      headers: { "Authorization": `Bearer ${huggingFaceApiKey}` },
    });

    if (!sseResponse.body) {
      throw new Error("SSE response has no body");
    }

    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const message of messages) {
        const lines = message.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonData = line.substring(6);
            try {
              const parsedData = JSON.parse(jsonData);

              // Based on logs, the final result is a JSON array.
              if (Array.isArray(parsedData)) {
                console.log("Found prediction result array:", parsedData);
                reader.releaseLock();
                await sseResponse.body.cancel();
                
                // The frontend expects the result in a { data: [...] } wrapper.
                return new Response(JSON.stringify({ data: parsedData }), {
                  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
              }
            } catch (e) {
              console.warn("Failed to parse SSE JSON chunk:", jsonData);
            }
          }
        }
      }
    }

    throw new Error("Stream ended without returning a prediction result array.");

  } catch (error) {
    console.error("Error in handler:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
