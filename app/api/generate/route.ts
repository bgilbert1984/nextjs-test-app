// app/api/generate/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use OPENAI_API_KEY now
  //baseURL: 'https://api.perplexity.ai', // Remove or comment out baseURL
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!messages || messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: "Invalid request: Expected at least one user message." }, { status: 400 });
  }

  // const userMessage = messages[messages.length -1].content

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // Or your preferred OpenAI model
      messages: [
          {role: "system", content: "You are a helpful assistant."}, //Keep system context
          ...messages
        ], // Send *all* messages for context
      stream: false, // No streaming for now
    });

    // Correctly access the generated text:
    const generatedText = response.choices[0]?.message?.content || '';
    return NextResponse.json({ text: generatedText });

  } catch (error) {
    console.error('Error from OpenAI API:', error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}