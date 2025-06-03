// AI Prompt Engineering System
// Sophisticated prompting for Senior Technical Product Manager positioning

export interface FieldConstraints {
  minWords: number;
  maxWords: number;
  examples: string[];
}

export interface FieldContext {
  role: string;
  objective: string;
  style: string;
  avoid: string;
  constraints?: FieldConstraints;
}

export interface PromptContext {
  field: string;
  currentValue: string;
  role: string;
  personalContext?: {
    name: string;
    yearsExperience: number;
    currentCompany?: string;
    targetRole: string;
  };
}

// Writing style instructions to evade AI detection
const HUMANIZATION_INSTRUCTIONS = `
CRITICAL: Write in a natural, conversational yet professional tone that reflects genuine human expression:
- Vary sentence structure and length naturally
- Include occasional contractions (I've, I'm) where appropriate
- Add subtle personality markers and authentic voice
- Use specific, concrete examples rather than generic statements
- Include minor imperfections that humans naturally make (but still professional)
- Avoid overly polished or formulaic language patterns
- Reference real experiences with authentic details
- Mix formal and slightly informal elements naturally
- Include genuine enthusiasm without sounding scripted
`;

// Field-specific roles and objectives
const FIELD_CONTEXTS = {
  tagline: {
    role: 'LinkedIn Headline Specialist for Tech Leaders',
    objective: 'Create a 5-8 word tagline that instantly communicates senior TPM value proposition',
    style: 'Ultra-concise power statement. Think LinkedIn headline, not paragraph. Format: "[Action/Value] + [Domain] + [Unique Angle]"',
    avoid: 'Complete sentences, generic phrases, anything over 8 words',
    constraints: {
      minWords: 5,
      maxWords: 8,
      examples: [
        'Turning Technical Complexity into Product Success',
        'Engineering-First Product Strategy at Scale',
        'Building Products Where Code Meets Customer',
        'Technical Vision to Market Reality'
      ]
    }
  },
  bio: {
    role: 'Executive Recruiter who understands what hiring managers actually want',
    objective: 'Paint a picture of a product leader who bridges technical depth with business impact',
    style: 'Conversational but impactful - like explaining your value to a CEO in an elevator',
    avoid: 'Buzzword soup, trying too hard, obvious AI patterns'
  },
  executiveSummary: {
    role: 'Senior Hiring Manager at a top tech company',
    objective: 'Demonstrate immediate value for Senior Technical PM roles with concrete evidence',
    style: 'Professional but personable - like a compelling opening statement in an interview',
    avoid: 'Generic achievements, vague statements, overused corporate language'
  },
  description: {
    role: 'Technical Product Manager peer reviewing your portfolio',
    objective: 'Quickly convey technical sophistication and product thinking',
    style: 'Crisp, technical, intriguing - like a product pitch to engineers',
    avoid: 'Marketing fluff, oversimplification'
  },
  detailedDescription: {
    role: 'VP of Product evaluating your depth of experience',
    objective: 'Show deep product thinking, technical architecture understanding, and business impact',
    style: 'Detailed but engaging - like a case study presentation to leadership',
    avoid: 'Too technical without business context, too business-y without technical depth'
  },
  responsibilities: {
    role: 'Recruiter scanning for Senior TPM qualifications',
    objective: 'Highlight leadership, technical depth, and measurable impact for senior roles',
    style: 'Action-oriented, quantified - like bullet points that make recruiters stop scrolling',
    avoid: 'Task lists, junior-level activities, responsibilities without outcomes'
  }
};

// Personal writing patterns to incorporate
const WRITING_PATTERNS = {
  brian: {
    phrases: [
      "I thrive at the intersection of",
      "translating ambiguity into clarity",
      "vision into reality",
      "built bridges between",
      "championing",
      "untangling legacy systems",
      "bring curiosity, rigor, and a bias for action",
      "not only work, but make work better"
    ],
    style: {
      sentenceVariation: 'Mix long, detailed sentences with short, punchy ones',
      vocabulary: 'Technical but accessible, occasional sophisticated word choice',
      personality: 'Confident without arrogance, thoughtful, systems-thinker',
      tone: 'Professional but with subtle enthusiasm and genuine passion'
    }
  }
};

export function buildEnhancementPrompt(context: PromptContext): string {
  const fieldContext = FIELD_CONTEXTS[context.field as keyof typeof FIELD_CONTEXTS] || {
    role: 'Senior Technical Recruiter',
    objective: 'Position candidate for senior technical product management roles',
    style: 'Professional, engaging, authentic',
    avoid: 'Generic corporate speak'
  };

  const personalContext = context.personalContext || {
    name: 'Brian Thomas',
    yearsExperience: 13,
    targetRole: 'Senior Technical Product Manager'
  };

  const writingStyle = WRITING_PATTERNS.brian;

  return `You are a ${fieldContext.role} helping ${personalContext.name} land a ${personalContext.targetRole} role.

OBJECTIVE: ${fieldContext.objective}

CURRENT CONTEXT:
- Field: ${context.field}
- Current Value: "${context.currentValue}"
- Years of Experience: ${personalContext.yearsExperience}
- Current Role: ${context.role}

WRITING REQUIREMENTS:
${HUMANIZATION_INSTRUCTIONS}

SPECIFIC STYLE FOR THIS FIELD:
- ${fieldContext.style}
- Avoid: ${fieldContext.avoid}

${fieldContext.constraints ? `STRICT CONSTRAINTS:
- MUST be between ${fieldContext.constraints.minWords}-${fieldContext.constraints.maxWords} words
- Count words carefully before responding
- DO NOT exceed word limit under any circumstances

GOOD EXAMPLES TO INSPIRE (but don't copy):
${fieldContext.constraints.examples.map(ex => `- "${ex}"`).join('\n')}
` : ''}
PERSONAL WRITING PATTERNS TO INCORPORATE:
- Occasionally use phrases like: ${writingStyle.phrases.slice(0, 3).join(', ')}
- ${writingStyle.style.sentenceVariation}
- Tone: ${writingStyle.style.tone}

SENIOR TPM POSITIONING:
- Emphasize strategic thinking and technical depth
- Highlight cross-functional leadership without using the cliché term
- Show ability to drive ambiguous, complex initiatives
- Demonstrate both product vision and execution excellence
- Include subtle indicators of seniority (scale, complexity, autonomy)

Generate enhanced text that:
1. Sounds genuinely human and matches Brian's writing style
2. Positions clearly for Senior Technical PM roles
3. Passes ATS keyword scans for senior positions
4. Avoids AI detection through natural language variation
5. Compels hiring managers within 5 seconds of reading

IMPORTANT: Return ONLY the enhanced text without surrounding quotes, quotation marks, or any formatting.

${fieldContext.constraints ? `

⚠️  CRITICAL FOR ${context.field.toUpperCase()}: 
Your response MUST be exactly ${fieldContext.constraints.minWords}-${fieldContext.constraints.maxWords} words. 
Count each word before submitting. Reject responses that don't meet this requirement.
DO NOT wrap your response in quotes or quotation marks.
` : ''}

${context.currentValue ? `Build upon the current value, maintaining any specific details or achievements mentioned.` : `Create fresh, compelling content.`}`;
}

export function buildTechSuggestionPrompt(projectDescription: string): string {
  return `As a Principal Engineer reviewing technical architecture, suggest technologies for this project.

Project: "${projectDescription}"

Consider:
- Modern but proven technologies (not just trendy)
- Full stack including infrastructure
- Technologies that Senior TPMs should understand
- Mix of specific tools and broader platforms

Return 6-10 technologies as a comma-separated list. Include a mix of:
- Core languages/frameworks
- Databases/storage
- Cloud/infrastructure
- DevOps/monitoring
- Any domain-specific tools

Be specific (e.g., "PostgreSQL" not "database", "React" not "frontend").

IMPORTANT: Return ONLY the comma-separated list without quotes or additional formatting.`;
}

export function buildFeaturePrompt(projectDescription: string): string {
  return `As a Senior Product Manager, identify key features that demonstrate product thinking.

Project: "${projectDescription}"

Generate 4-6 features that:
- Show user-centric thinking
- Highlight technical sophistication
- Demonstrate business value
- Sound like actual product features (not marketing)
- Mix user-facing and technical capabilities

Write each feature as if presenting to engineering and business stakeholders.
Each feature should be 5-12 words, specific and value-focused.

IMPORTANT: Return ONLY the feature list, one per line, without quotes, bullets, or numbering.`;
}

// Utility to add variability to responses
export function addHumanVariability(text: string): string {
  // Add subtle variations that make text more human
  const variations = [
    // Occasionally start with "I" instead of always action verbs
    (t: string) => Math.random() > 0.7 ? t.replace(/^(\w+ed|Led|Managed|Developed)/i, 'I $1'.toLowerCase()) : t,
    // Add occasional discourse markers
    (t: string) => Math.random() > 0.8 ? t.replace('. ', '. Additionally, ') : t,
    // Natural emphasis
    (t: string) => t.replace(/significant|substantial|considerable/gi, (match) => 
      Math.random() > 0.5 ? `particularly ${match}` : match
    )
  ];

  let result = text;
  variations.forEach(variation => {
    if (Math.random() > 0.6) {
      result = variation(result);
    }
  });

  return result;
}

// Export prompt templates securely (actual content in env vars)
export function getSecurePrompt(key: string): string {
  // In production, these would come from secure environment variables
  // This way, inspecting the repo doesn't reveal the actual prompts
  const envKey = `AI_PROMPT_${key.toUpperCase()}`;
  return process.env[envKey] || buildEnhancementPrompt({ field: key, currentValue: '', role: 'Technical Product Manager' });
}