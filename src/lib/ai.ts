import OpenAI from 'openai';
import { buildEnhancementPrompt, buildTechSuggestionPrompt, buildFeaturePrompt, addHumanVariability, type PromptContext } from './ai-prompts';
import { getPersonalInfo } from './database/db';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface EnhanceOptions {
  field: string;
  context: string;
  currentValue: string;
  role?: string;
}

export async function enhanceText({
  field,
  context: _context,
  currentValue,
  role = 'Technical Product Manager'
}: EnhanceOptions): Promise<string> {
  try {
    // Get personal context for better prompting
    const personalInfo = await getPersonalInfo('internal');
    const personalContext = personalInfo ? {
      name: personalInfo.name || 'Brian Thomas',
      yearsExperience: personalInfo.yearsExperience || 13,
      currentCompany: 'Blue Origin', // Could be extracted from work experience
      targetRole: 'Senior Technical Product Manager'
    } : undefined;

    // Build sophisticated prompt
    const promptContext: PromptContext = {
      field,
      currentValue,
      role,
      personalContext
    };

    const prompt = buildEnhancementPrompt(promptContext);

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // GPT-4.1-mini - latest efficient model
      messages: [
        {
          role: 'system',
          content: 'You are an expert at crafting compelling professional content that sounds authentically human. Never mention that you are AI or that content is being generated. Write as if you are the person themselves.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.85, // Higher temperature for more natural variation
      max_tokens: 500,
      presence_penalty: 0.3, // Encourages variety in word choice
      frequency_penalty: 0.3, // Reduces repetition
    });

    let enhancedText = response.choices[0]?.message?.content || currentValue;
    
    // Remove surrounding quotes if present
    enhancedText = enhancedText.replace(/^["']|["']$/g, '').trim();
    
    // Add human variability to make it less detectable
    return addHumanVariability(enhancedText);
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw new Error('Failed to enhance text');
  }
}

export async function suggestTechnologies(projectDescription: string): Promise<string[]> {
  try {
    const prompt = buildTechSuggestionPrompt(projectDescription);
    
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Principal Engineer with deep knowledge of modern tech stacks. Suggest technologies that Senior TPMs would be expected to understand and evaluate.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6, // Balanced for accuracy
      max_tokens: 150,
    });

    let techs = response.choices[0]?.message?.content || '';
    
    // Remove surrounding quotes if present
    techs = techs.replace(/^["']|["']$/g, '').trim();
    
    // Clean and validate the response
    const techList = techs.split(',')
      .map(t => t.trim().replace(/^["']|["']$/g, '')) // Remove quotes from individual items
      .filter(t => t.length > 0 && t.length < 30) // Reasonable tech name length
      .slice(0, 10); // Limit to 10 max
    
    return techList;
  } catch (error) {
    console.error('Error suggesting technologies:', error);
    return [];
  }
}

export async function generateProjectFeatures(projectDescription: string): Promise<string[]> {
  try {
    const prompt = buildFeaturePrompt(projectDescription);
    
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Senior Product Manager writing feature lists for technical stakeholders. Focus on value and capability, not marketing speak.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.75, // More creative for features
      max_tokens: 200,
      presence_penalty: 0.2,
    });

    let features = response.choices[0]?.message?.content || '';
    
    // Remove surrounding quotes if present
    features = features.replace(/^["']|["']$/g, '').trim();
    
    // Parse and clean features
    const featureList = features.split('\n')
      .map(f => f.replace(/^[-•*\d.]+\s*/, '').trim())
      .map(f => f.replace(/^["']|["']$/g, '')) // Remove quotes from individual features
      .filter(f => f.length > 5 && f.length < 100)
      .map(f => {
        // Add natural variation to feature descriptions
        if (Math.random() > 0.7 && !f.endsWith('.')) {
          return f + '.';
        }
        return f.replace(/\.$/, ''); // Remove trailing periods for consistency
      })
      .slice(0, 8); // Max 8 features
    
    return featureList;
  } catch (error) {
    console.error('Error generating features:', error);
    return [];
  }
}