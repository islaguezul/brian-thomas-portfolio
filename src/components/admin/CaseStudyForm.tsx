'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';
import type { CaseStudy, CaseStudyOutcome } from '@/lib/database/types';

interface CaseStudyFormProps {
  caseStudy?: CaseStudy;
  isNew?: boolean;
}

export default function CaseStudyForm({ caseStudy, isNew = false }: CaseStudyFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    context: true,
    problem: true,
    approach: false,
    outcomes: false,
    skills: false,
    complexity: false,
  });

  const [formData, setFormData] = useState<CaseStudy>({
    title: caseStudy?.title || '',
    slug: caseStudy?.slug || '',
    category: caseStudy?.category || '',
    summary: caseStudy?.summary || '',
    problem: caseStudy?.problem || '',
    industry: caseStudy?.industry || '',
    orgScale: caseStudy?.orgScale || '',
    teamScope: caseStudy?.teamScope || '',
    timeline: caseStudy?.timeline || '',
    stakeholderCount: caseStudy?.stakeholderCount || '',
    ambiguity: caseStudy?.ambiguity || '',
    ambiguityDetail: caseStudy?.ambiguityDetail || '',
    technicalDepth: caseStudy?.technicalDepth || '',
    technicalDepthDetail: caseStudy?.technicalDepthDetail || '',
    organizationalComplexity: caseStudy?.organizationalComplexity || '',
    organizationalComplexityDetail: caseStudy?.organizationalComplexityDetail || '',
    regulatoryConstraints: caseStudy?.regulatoryConstraints || '',
    regulatoryConstraintsDetail: caseStudy?.regulatoryConstraintsDetail || '',
    displayOrder: caseStudy?.displayOrder || 0,
    isActive: caseStudy?.isActive !== undefined ? caseStudy.isActive : true,
    approaches: caseStudy?.approaches || [],
    outcomes: caseStudy?.outcomes || [],
    skills: caseStudy?.skills || [],
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const generateSlug = () => {
    if (formData.title) {
      setFormData({
        ...formData,
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      });
    }
  };

  // Approach helpers
  const addApproach = () => {
    setFormData({
      ...formData,
      approaches: [...(formData.approaches || []), { stepText: '', displayOrder: formData.approaches?.length || 0 }],
    });
  };
  const updateApproach = (index: number, value: string) => {
    const approaches = [...(formData.approaches || [])];
    approaches[index] = { ...approaches[index], stepText: value };
    setFormData({ ...formData, approaches });
  };
  const removeApproach = (index: number) => {
    setFormData({ ...formData, approaches: formData.approaches?.filter((_, i) => i !== index) || [] });
  };

  // Outcome helpers
  const addOutcome = () => {
    setFormData({
      ...formData,
      outcomes: [...(formData.outcomes || []), { metric: '', result: '', context: '', displayOrder: formData.outcomes?.length || 0 }],
    });
  };
  const updateOutcome = (index: number, field: keyof CaseStudyOutcome, value: string) => {
    const outcomes = [...(formData.outcomes || [])];
    outcomes[index] = { ...outcomes[index], [field]: value };
    setFormData({ ...formData, outcomes });
  };
  const removeOutcome = (index: number) => {
    setFormData({ ...formData, outcomes: formData.outcomes?.filter((_, i) => i !== index) || [] });
  };

  // Skill helpers
  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), { skill: '', displayOrder: formData.skills?.length || 0 }],
    });
  };
  const updateSkill = (index: number, value: string) => {
    const skills = [...(formData.skills || [])];
    skills[index] = { ...skills[index], skill: value };
    setFormData({ ...formData, skills });
  };
  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills?.filter((_, i) => i !== index) || [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');

    try {
      const url = isNew ? '/api/admin/case-studies' : `/api/admin/case-studies/${caseStudy?.id}`;
      const response = await adminFetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => {
          router.push('/admin/case-studies');
          router.refresh();
        }, 1500);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const CATEGORIES = [
    'Product Launch',
    'Platform Migration',
    'Process Transformation',
    'Cross-Org Program',
    'Infrastructure',
    'Compliance/Regulatory',
    'Team Building',
  ];

  const COMPLEXITY_LEVELS = ['high', 'medium', 'low'];

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic Info Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('basic')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Basic Info
          <span>{expandedSections.basic ? '▼' : '▶'}</span>
        </button>
        {expandedSections.basic && (
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className={labelClass}>Slug</label>
                <input className={inputClass} value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <button type="button" onClick={generateSlug} className="px-3 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600">
                Generate
              </button>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Summary</label>
              <textarea className={inputClass} rows={3} value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
            </div>
            <div className="flex gap-4">
              <div>
                <label className={labelClass}>Display Order</label>
                <input type="number" className={inputClass} value={formData.displayOrder || 0} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                  Active
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('context')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Context
          <span>{expandedSections.context ? '▼' : '▶'}</span>
        </button>
        {expandedSections.context && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Industry</label>
                <input className={inputClass} value={formData.industry || ''} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Org Scale</label>
                <input className={inputClass} value={formData.orgScale || ''} onChange={(e) => setFormData({ ...formData, orgScale: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Team Scope</label>
              <input className={inputClass} value={formData.teamScope || ''} onChange={(e) => setFormData({ ...formData, teamScope: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Timeline</label>
                <input className={inputClass} value={formData.timeline || ''} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Stakeholder Count</label>
                <input className={inputClass} value={formData.stakeholderCount || ''} onChange={(e) => setFormData({ ...formData, stakeholderCount: e.target.value })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Problem Statement Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('problem')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Problem Statement
          <span>{expandedSections.problem ? '▼' : '▶'}</span>
        </button>
        {expandedSections.problem && (
          <div className="p-6 pt-0">
            <textarea className={inputClass} rows={5} value={formData.problem || ''} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} />
          </div>
        )}
      </div>

      {/* Approach Steps Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('approach')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Approach Steps ({formData.approaches?.length || 0})
          <span>{expandedSections.approach ? '▼' : '▶'}</span>
        </button>
        {expandedSections.approach && (
          <div className="p-6 pt-0 space-y-3">
            {formData.approaches?.map((a, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-500 text-sm pt-2 w-6">{i + 1}.</span>
                <textarea className={`${inputClass} flex-1`} rows={2} value={a.stepText || ''} onChange={(e) => updateApproach(i, e.target.value)} />
                <button type="button" onClick={() => removeApproach(i)} className="text-red-400 hover:text-red-300 px-2">&#x2715;</button>
              </div>
            ))}
            <button type="button" onClick={addApproach} className="text-blue-400 hover:text-blue-300 text-sm">+ Add Step</button>
          </div>
        )}
      </div>

      {/* Outcomes Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('outcomes')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Outcomes ({formData.outcomes?.length || 0})
          <span>{expandedSections.outcomes ? '▼' : '▶'}</span>
        </button>
        {expandedSections.outcomes && (
          <div className="p-6 pt-0 space-y-4">
            {formData.outcomes?.map((o, i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Outcome {i + 1}</span>
                  <button type="button" onClick={() => removeOutcome(i)} className="text-red-400 hover:text-red-300 text-sm">&#x2715;</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Metric</label>
                    <input className={inputClass} value={o.metric || ''} onChange={(e) => updateOutcome(i, 'metric', e.target.value)} placeholder="e.g. Rework reduction" />
                  </div>
                  <div>
                    <label className={labelClass}>Result</label>
                    <input className={inputClass} value={o.result || ''} onChange={(e) => updateOutcome(i, 'result', e.target.value)} placeholder="e.g. 40%" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Context (optional)</label>
                  <input className={inputClass} value={o.context || ''} onChange={(e) => updateOutcome(i, 'context', e.target.value)} placeholder="e.g. Across modernized workflows" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addOutcome} className="text-blue-400 hover:text-blue-300 text-sm">+ Add Outcome</button>
          </div>
        )}
      </div>

      {/* Skills Demonstrated Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Skills Demonstrated ({formData.skills?.length || 0})
          <span>{expandedSections.skills ? '▼' : '▶'}</span>
        </button>
        {expandedSections.skills && (
          <div className="p-6 pt-0 space-y-2">
            {formData.skills?.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={s.skill || ''} onChange={(e) => updateSkill(i, e.target.value)} />
                <button type="button" onClick={() => removeSkill(i)} className="text-red-400 hover:text-red-300 px-2">&#x2715;</button>
              </div>
            ))}
            <button type="button" onClick={addSkill} className="text-blue-400 hover:text-blue-300 text-sm">+ Add Skill</button>
          </div>
        )}
      </div>

      {/* Complexity Signals Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('complexity')} className="w-full flex items-center justify-between p-4 text-white font-medium hover:bg-gray-800/50">
          Complexity Signals
          <span>{expandedSections.complexity ? '▼' : '▶'}</span>
        </button>
        {expandedSections.complexity && (
          <div className="p-6 pt-0 space-y-4">
            {(['ambiguity', 'technicalDepth', 'organizationalComplexity', 'regulatoryConstraints'] as const).map((field) => {
              const labels: Record<string, string> = {
                ambiguity: 'Ambiguity',
                technicalDepth: 'Technical Depth',
                organizationalComplexity: 'Organizational Complexity',
                regulatoryConstraints: 'Regulatory Constraints',
              };
              const detailField = `${field}Detail` as keyof CaseStudy;
              return (
                <div key={field}>
                  <div className="flex gap-2 mb-1">
                    <label className={labelClass}>{labels[field]}</label>
                    <select
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                      value={(formData[field] as string) || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    >
                      <option value="">&#8212;</option>
                      {COMPLEXITY_LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
                    </select>
                  </div>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={(formData[detailField] as string) || ''}
                    onChange={(e) => setFormData({ ...formData, [detailField]: e.target.value })}
                    placeholder={`Detail: why is ${labels[field].toLowerCase()} at this level?`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium text-sm"
        >
          {saving ? 'Saving...' : isNew ? 'Create Case Study' : 'Save Changes'}
        </button>
        {saveStatus === 'success' && <span className="text-green-400 text-sm">Saved successfully!</span>}
        {saveStatus === 'error' && <span className="text-red-400 text-sm">Failed to save. Please try again.</span>}
      </div>
    </form>
  );
}
