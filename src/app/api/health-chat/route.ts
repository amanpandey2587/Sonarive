import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  console.log("Received request at /api/health-chat");
  try {
    const body = await req.json();
    const { messages } = body;

    console.log("Messages received from client:", messages);
    console.log("Using SONAR API KEY:", process.env.SONAR_API_KEY);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SONAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages,
      }),
    });

    const result = await response.json();
    console.log("Perplexity AI response:", result);

    const reply = result?.choices?.[0]?.message?.content || "Sorry, I couldn't find that.";
    return NextResponse.json({ response: reply });
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "Unknown" },
      { status: 500 }
    );
  }
}
