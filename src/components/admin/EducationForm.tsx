'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import type { Education } from '@/lib/database/types';

interface EducationFormProps {
  education?: Education;
  isNew?: boolean;
}

export default function EducationForm({ education, isNew = false }: EducationFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Education>({
    degree: education?.degree || '',
    school: education?.school || '',
    graduationYear: education?.graduationYear || '',
    concentration: education?.concentration || '',
    courses: education?.courses || [],
    displayOrder: education?.displayOrder || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew 
        ? '/api/admin/resume/education' 
        : `/api/admin/resume/education/${education?.id}`;
      
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
      console.error('Error saving education:', error);
    } finally {
      setSaving(false);
    }
  };

  const addCourse = () => {
    setFormData({
      ...formData,
      courses: [
        ...(formData.courses || []), 
        { courseName: '', displayOrder: formData.courses?.length || 0 }
      ],
    });
  };

  const updateCourse = (index: number, value: string) => {
    const courses = [...(formData.courses || [])];
    courses[index] = { ...courses[index], courseName: value };
    setFormData({ ...formData, courses });
  };

  const removeCourse = (index: number) => {
    setFormData({
      ...formData,
      courses: formData.courses?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Education Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Degree *
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Bachelor of Science, MBA"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                School/University *
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Graduation Year
              </label>
              <input
                type="text"
                value={formData.graduationYear || ''}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Concentration/Major
              </label>
              <input
                type="text"
                value={formData.concentration || ''}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Computer Science, Business Administration"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Key Courses</h2>
        
        <div className="space-y-3">
          {formData.courses?.map((course, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
              <input
                type="text"
                value={course.courseName}
                onChange={(e) => updateCourse(idx, e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Course name"
              />
              <button
                type="button"
                onClick={() => removeCourse(idx)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addCourse}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
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
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : (isNew ? 'Add Education' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}