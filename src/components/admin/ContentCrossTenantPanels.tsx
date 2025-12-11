'use client';

import OtherTenantPanel from './OtherTenantPanel';
import type { TechStackItem, SkillCategory, ProcessStrategy } from '@/lib/database/types';
import { useRouter } from 'next/navigation';

interface ContentCrossTenantPanelsProps {
  currentTechStack: TechStackItem[];
  currentSkillCategories: SkillCategory[];
  currentProcessStrategies: ProcessStrategy[];
}

export default function ContentCrossTenantPanels({
  currentTechStack,
  currentSkillCategories,
  currentProcessStrategies,
}: ContentCrossTenantPanelsProps) {
  const router = useRouter();

  const handleItemCopied = () => {
    // Refresh the page to show the newly copied item
    router.refresh();
  };

  // Check if tech stack item already exists
  const checkTechConflict = (techName: string): boolean => {
    return currentTechStack.some(t => t.name.toLowerCase() === techName.toLowerCase());
  };

  // Check if skill category already exists
  const checkSkillCategoryConflict = (catName: string): boolean => {
    return currentSkillCategories.some(c => c.name.toLowerCase() === catName.toLowerCase());
  };

  // Check if process strategy already exists
  const checkProcessStrategyConflict = (strategyTitle: string): boolean => {
    return currentProcessStrategies.some(s => s.title.toLowerCase() === strategyTitle.toLowerCase());
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Tech Stack Panel */}
      <OtherTenantPanel<TechStackItem>
        entityType="tech-stack"
        title="Tech Stack on the other site"
        emptyMessage="No tech stack items on the other site"
        onItemCopied={handleItemCopied}
        getItemName={(tech) => tech.name}
        checkConflict={checkTechConflict}
        renderItem={(tech) => (
          <div className="flex items-center gap-3">
            <span className="text-xl">{tech.icon}</span>
            <div>
              <h4 className="text-white font-medium">{tech.name}</h4>
              <p className="text-gray-500 text-xs">
                {tech.category} • {Number(tech.level).toFixed(1)} years
              </p>
            </div>
          </div>
        )}
      />

      {/* Skill Categories Panel */}
      <OtherTenantPanel<SkillCategory>
        entityType="skills"
        title="Skill Categories on the other site"
        emptyMessage="No skill categories on the other site"
        onItemCopied={handleItemCopied}
        getItemName={(cat) => cat.name}
        checkConflict={checkSkillCategoryConflict}
        renderItem={(category) => (
          <div>
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="text-green-400">{category.icon}</span>
              {category.name}
            </h4>
            {category.skills && category.skills.length > 0 && (
              <p className="text-gray-500 text-xs mt-1">
                {category.skills.length} skills: {category.skills.slice(0, 3).map(s => s.skillName).join(', ')}
                {category.skills.length > 3 && ` +${category.skills.length - 3} more`}
              </p>
            )}
          </div>
        )}
      />

      {/* Process Strategies Panel */}
      <OtherTenantPanel<ProcessStrategy>
        entityType="process-strategies"
        title="Process Strategies on the other site"
        emptyMessage="No process strategies on the other site"
        onItemCopied={handleItemCopied}
        getItemName={(strategy) => strategy.title}
        checkConflict={checkProcessStrategyConflict}
        renderItem={(strategy) => (
          <div>
            <h4 className="text-white font-medium flex items-center gap-2">
              <span className="text-yellow-400">{strategy.icon}</span>
              {strategy.title}
            </h4>
            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
              {strategy.description}
            </p>
          </div>
        )}
      />
    </div>
  );
}
