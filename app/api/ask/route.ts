// app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return new NextResponse(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new NextResponse(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const msg = await anthropic.messages.create({
      model: "claude-3.5-sonnet-20240229", // Use 3.5 Sonnet
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
    });

    return NextResponse.json({ response: msg.content[0].text });

  } catch (error: any) {
    console.error("Error calling Anthropic API:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to call Anthropic API" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}