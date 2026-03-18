import type { CaseStudy } from '@/lib/database/types';

const CATEGORY_COLORS: Record<string, string> = {
  'Product Launch': 'var(--accretion)',
  'Platform Migration': 'var(--steel-blue)',
  'Process Transformation': 'var(--dusty-violet)',
  'Cross-Org Program': 'var(--muted-rose)',
  'Infrastructure': 'var(--deep-steel)',
  'Compliance/Regulatory': 'var(--wheat-light)',
  'Team Building': 'var(--accretion)',
};

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.08)', border: 'rgba(212, 168, 85, 0.2)', text: 'var(--accretion)' },
  { bg: 'rgba(107, 143, 181, 0.1)', border: 'rgba(107, 143, 181, 0.25)', text: 'var(--steel-blue)' },
  { bg: 'rgba(160, 124, 176, 0.1)', border: 'rgba(160, 124, 176, 0.25)', text: 'var(--dusty-violet)' },
  { bg: 'rgba(196, 120, 120, 0.1)', border: 'rgba(196, 120, 120, 0.25)', text: 'var(--muted-rose)' },
  { bg: 'rgba(74, 111, 143, 0.1)', border: 'rgba(74, 111, 143, 0.25)', text: 'var(--deep-steel)' },
];

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onClick: () => void;
}

export default function CaseStudyCard({ caseStudy, onClick }: CaseStudyCardProps) {
  const categoryColor = CATEGORY_COLORS[caseStudy.category || ''] || 'var(--wheat-light)';

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 transition-transform hover:scale-[1.02]"
      style={{
        background: 'rgba(212, 168, 85, 0.04)',
        border: '1px solid rgba(212, 168, 85, 0.1)',
      }}
    >
      {/* Category badge + outcome count */}
      <div className="flex items-center justify-between mb-3">
        {caseStudy.category && (
          <span
            className="text-[10px] font-space uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: categoryColor,
              border: `1px solid ${categoryColor}`,
              opacity: 0.7,
            }}
          >
            {caseStudy.category}
          </span>
        )}
        {caseStudy.outcomes && caseStudy.outcomes.length > 0 && (
          <span
            className="text-[10px]"
            style={{ color: 'rgba(245, 222, 179, 0.4)' }}
          >
            {caseStudy.outcomes.length} outcomes
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-space font-semibold text-sm mb-2" style={{ color: 'var(--floral)' }}>
        {caseStudy.title}
      </h3>

      {/* Summary */}
      {caseStudy.summary && (
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-3"
          style={{ color: 'rgba(245, 222, 179, 0.6)' }}
        >
          {caseStudy.summary}
        </p>
      )}

      {/* Context metadata */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-[10px]" style={{ color: 'rgba(245, 222, 179, 0.4)' }}>
        {caseStudy.industry && <span>{caseStudy.industry}</span>}
        {caseStudy.timeline && <span>{caseStudy.timeline}</span>}
        {caseStudy.stakeholderCount && <span>{caseStudy.stakeholderCount}</span>}
      </div>

      {/* Skill tags */}
      {caseStudy.skills && caseStudy.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {caseStudy.skills.slice(0, 3).map((s, i) => {
            const color = TAG_COLORS[i % TAG_COLORS.length];
            return (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
                {s.skill}
              </span>
            );
          })}
          {caseStudy.skills.length > 3 && (
            <span
              className="text-[10px] px-2 py-0.5"
              style={{ color: 'rgba(245, 222, 179, 0.35)' }}
            >
              +{caseStudy.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
