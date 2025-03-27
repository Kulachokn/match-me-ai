import { NextRequest, NextResponse } from "next/server";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const prompt = `Extract the following information from the job description in JSON format:
- position
- required_skills (list)
- nice_to_have (list)
- education
- experience

Return ONLY JSON, without additional explanations.

Job description:
"""${text}"""
`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data[0]?.generated_text || "";

    const jsonMatch = rawText.match(/\{.*\}/s);
    console.log(JSON.parse(jsonMatch[0]));
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "No JSON found in response" },
        { status: 500 }
      );
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
