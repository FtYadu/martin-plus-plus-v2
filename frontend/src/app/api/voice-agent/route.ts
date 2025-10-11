import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, agent_id, turn_id } = body;

    // Forward the voice transcript to the Martin++ backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production, you'd get the auth token from the request
        'Authorization': `Bearer ${process.env.MARTIN_AUTH_TOKEN || ''}`,
      },
      body: JSON.stringify({
        message: transcript,
        isVoice: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.data?.content || data.message || 'I understand.';

    // Return response in Layercode expected format
    return NextResponse.json({
      response: assistantMessage,
      turn_id,
      agent_id,
    });
  } catch (error) {
    console.error('Voice agent error:', error);
    
    // Return fallback response
    return NextResponse.json({
      response: "I'm having trouble processing that right now. Please try again.",
      error: true,
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Martin++ Voice Agent',
    timestamp: new Date().toISOString(),
  });
}

