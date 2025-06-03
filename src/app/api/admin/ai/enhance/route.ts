import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { enhanceText, suggestTechnologies, generateProjectFeatures } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    const { type, field, context, currentValue } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let result;
    
    switch (type) {
      case 'enhance':
        result = await enhanceText({ field, context, currentValue });
        break;
      case 'suggestTech':
        result = await suggestTechnologies(currentValue);
        break;
      case 'generateFeatures':
        result = await generateProjectFeatures(currentValue);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid enhancement type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in AI enhancement:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}