import { 
  Code2, Server, Database, Cloud, Brain, Wrench, Monitor,
  Smartphone, TestTube, Shield, Zap, Target,
  TrendingUp, Lightbulb, Users, Settings, Rocket,
  Activity, BarChart3, type LucideIcon
} from 'lucide-react';

export type TechCategory = 
  | 'frontend' | 'backend' | 'database' | 'devops' 
  | 'cloud' | 'ai-ml' | 'mobile' | 'testing' | 'other';

export const techCategoryIcons: Record<TechCategory, LucideIcon> = {
  'frontend': Monitor,
  'backend': Server,
  'database': Database,
  'devops': Wrench,
  'cloud': Cloud,
  'ai-ml': Brain,
  'mobile': Smartphone,
  'testing': TestTube,
  'other': Code2,
};

export const techCategories = Object.entries(techCategoryIcons).map(([value, icon]) => ({
  value,
  label: value.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('/'),
  icon,
}));

export const processIconMap = {
  'zap': Zap,
  'trending-up': TrendingUp,
  'shield': Shield,
  'lightbulb': Lightbulb,
  'users': Users,
  'target': Target,
  'settings': Settings,
  'rocket': Rocket,
  'activity': Activity,
  'bar-chart': BarChart3,
} as const;

export type ProcessIconName = keyof typeof processIconMap;

export const processIcons = Object.entries(processIconMap).map(([value, icon]) => ({
  value,
  label: value.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
  icon,
}));

// Common tech stack with emojis (for backward compatibility)
export const commonTechEmojis: Record<string, string> = {
  // Languages
  'javascript': '📝',
  'typescript': '📘',
  'python': '🐍',
  'java': '☕',
  'go': '🐹',
  'rust': '🦀',
  'ruby': '💎',
  'php': '🐘',
  'csharp': '#️⃣',
  'cpp': '➕',
  
  // Frontend
  'react': '⚛️',
  'vue': '💚',
  'angular': '🅰️',
  'svelte': '🧡',
  'nextjs': '▲',
  'tailwind': '🎨',
  
  // Backend
  'nodejs': '🟢',
  'express': '🚂',
  'django': '🎸',
  'flask': '🧪',
  'rails': '💎',
  'spring': '🌿',
  
  // Databases
  'postgresql': '🐘',
  'mysql': '🐬',
  'mongodb': '🍃',
  'redis': '⚡',
  'sqlite': '📦',
  
  // Cloud/DevOps
  'aws': '☁️',
  'docker': '🐳',
  'kubernetes': '☸️',
  'github': '🐙',
  'gitlab': '🦊',
  'jenkins': '🏗️',
  
  // AI/ML
  'tensorflow': '🧠',
  'pytorch': '🔥',
  'openai': '🤖',
  'pandas': '🐼',
  'jupyter': '📓',
  
  // Other
  'git': '📚',
  'vscode': '💻',
  'figma': '🎨',
  'graphql': '📊',
  'rest': '🌐',
  'nginx': '🔧',
  'linux': '🐧',
};

export function getTechEmoji(tech: string): string {
  const normalized = tech.toLowerCase().replace(/[^a-z0-9]/g, '');
  return commonTechEmojis[normalized] || '💻';
}

export function getTechIcon(category: string): LucideIcon {
  return techCategoryIcons[category as TechCategory] || Code2;
}

export function getProcessIcon(name: ProcessIconName): LucideIcon {
  return processIconMap[name] || Settings;
}