import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Function 'get-health-summary' initializing.");

const AI_API_KEY = Deno.env.get("GROQ_API_KEY");
const AI_API_URL = "https://api.groq.com/openai/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    if (!AI_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables.");
    }

    const { patientId } = await req.json();
    if (!patientId) {
      throw new Error("patientId is required.");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: patientData, error: dbError } = await supabaseClient
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);
    if (!patientData) throw new Error(`Patient with ID ${patientId} not found.`);

    // Enhanced prompt for a friendlier, more supportive AI persona.
    const prompt = `
      As a friendly and supportive health guide, analyze the following patient's data. 

      Start your response with a warm, personal greeting, like: "Hi, ${patientData.id}! Here is your health summary." 

      Then, structure your response in markdown format with two main sections:
      
      ### Health Summary
      Provide a brief, easy-to-understand overview of the patient's current health status based on the data. Keep the tone encouraging.

      ### Actionable Advice
      Provide a bulleted list of 3-5 specific, practical, and personalized tips for diet, exercise, and lifestyle changes to help manage or prevent diabetes. Phrase these as positive actions.

      Your entire response should be supportive and clear. Address the patient directly as 'you'.

      Patient Data:
      - Age: ${patientData.age}
      - Gender: ${patientData.gender}
      - BMI: ${patientData.bmi}
      - HbA1c Level: ${patientData.hba1c_level}
      - Blood Glucose Level: ${patientData.blood_glucose_level}
      - Hypertension: ${patientData.hypertension === 1 ? 'Yes' : 'No'}
      - Heart Disease: ${patientData.heart_disease === 1 ? 'Yes' : 'No'}
      - Smoking History: ${patientData.smoking_history}
      - Latest Prediction: You are considered '${patientData.prediction_status}' with a '${patientData.risk_level}' risk of diabetes.
    `;

    const aiResponse = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6, // Adding some creativity while keeping it factual
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("AI API Error Body:", errorBody);
      throw new Error(`AI API error: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const summary = aiResult.choices[0]?.message?.content || "No summary available.";

    return new Response(JSON.stringify({ summary }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Error in handler:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
