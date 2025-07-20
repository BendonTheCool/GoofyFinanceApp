import { NextResponse } from "next/server";

export async function POST(req) {
  const { GOOGLE_API_KEY } = process.env;
  const body = await req.json();
  const { transactions } = body;

  const prompt = `
You are a financial assistant. Give helpful, encouraging feedback based on these transactions:

${JSON.stringify(transactions, null, 2)}

Summarize how they are spending, saving, and any areas to improve. Keep it short, friendly, and human.
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback generated.";
  return NextResponse.json({ feedback: text });
  
}
