'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import type { WorkExperience } from '@/lib/database/types';

interface ExperienceFormProps {
  experience?: WorkExperience;
  isNew?: boolean;
}

export default function ExperienceForm({ experience, isNew = false }: ExperienceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<WorkExperience>({
    title: experience?.title || '',
    company: experience?.company || '',
    startDate: experience?.startDate || experience?.start_date || '',
    endDate: experience?.endDate || experience?.end_date || '',
    isCurrent: experience?.isCurrent || experience?.is_current || false,
    responsibilities: experience?.responsibilities || [],
    displayOrder: experience?.displayOrder || experience?.display_order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew 
        ? '/api/admin/resume/experience' 
        : `/api/admin/resume/experience/${experience?.id}`;
      
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/resume');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setSaving(false);
    }
  };

  const addResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [
        ...(formData.responsibilities || []), 
        { responsibility: '', displayOrder: formData.responsibilities?.length || 0 }
      ],
    });
  };

  const updateResponsibility = (index: number, value: string) => {
    const responsibilities = [...(formData.responsibilities || [])];
    responsibilities[index] = { ...responsibilities[index], responsibility: value };
    setFormData({ ...formData, responsibilities });
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities?.filter((_, i) => i !== index) || [],
    });
  };

  const enhanceResponsibilities = async () => {
    if (!formData.responsibilities || formData.responsibilities.length === 0) return;
    
    try {
      const enhancedResponsibilities = await Promise.all(
        formData.responsibilities.map(async (resp) => {
          if (!resp.responsibility) return resp;
          
          const response = await fetch('/api/admin/ai/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'enhance',
              field: 'responsibilities',
              context: `${formData.title} at ${formData.company}`,
              currentValue: resp.responsibility,
            }),
          });

          if (response.ok) {
            const { result } = await response.json();
            return { ...resp, responsibility: result };
          }
          return resp;
        })
      );
      
      setFormData({ ...formData, responsibilities: enhancedResponsibilities });
    } catch (error) {
      console.error('Error enhancing responsibilities:', error);
    }
  };

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 7); // YYYY-MM format for month input
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Position Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date (Month/Year) *
              </label>
              <input
                type="month"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date (Month/Year)
              </label>
              <input
                type="month"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.isCurrent}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCurrent || false}
              onChange={(e) => setFormData({ 
                ...formData, 
                isCurrent: e.target.checked,
                endDate: e.target.checked ? undefined : formData.endDate 
              })}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">I currently work here</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Responsibilities</h2>
          <button
            type="button"
            onClick={enhanceResponsibilities}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Enhance responsibilities with AI"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Enhance All</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.responsibilities?.map((resp, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <GripVertical className="w-4 h-4 text-gray-600 cursor-move mt-2.5" />
              <textarea
                value={resp.responsibility}
                onChange={(e) => updateResponsibility(idx, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe a key responsibility or achievement"
              />
              <button
                type="button"
                onClick={() => removeResponsibility(idx)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors mt-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addResponsibility}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Responsibility
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/resume')}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : (isNew ? 'Add Experience' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}