'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, User, Mail, Phone, MapPin, Github, Linkedin, FileText, Link, CheckCircle, AlertCircle } from 'lucide-react';
import type { PersonalInfo } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';

export default function PersonalInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    bio: '',
    tagline: '',
    executiveSummary: '',
    yearsExperience: 0,
    startYear: 2011,
  });

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  async function loadPersonalInfo() {
    try {
      const response = await adminFetch('/api/admin/personal');
      if (response.ok) {
        const info = await response.json();
        if (info) {
          setPersonalInfo(info);
        }
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const response = await adminFetch('/api/admin/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalInfo),
      });
      if (response.ok) {
        setSaveStatus('success');
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  async function enhanceText(field: keyof PersonalInfo) {
    try {
      const response = await adminFetch('/api/admin/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance',
          field,
          context: personalInfo.title || 'Technical Professional',
          currentValue: personalInfo[field as keyof PersonalInfo] as string || '',
        }),
      });

      if (response.ok) {
        const { result } = await response.json();
        setPersonalInfo({ ...personalInfo, [field]: result });
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Personal Information</h1>
        <p className="text-gray-400">Manage your personal and professional details</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Professional Title
            </label>
            <input
              type="text"
              value={personalInfo.title}
              onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={personalInfo.phone || ''}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={personalInfo.location || ''}
              onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              value={personalInfo.yearsExperience || ''}
              onChange={(e) => setPersonalInfo({ ...personalInfo, yearsExperience: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Link className="w-5 h-5 text-blue-400" />
          Social Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Linkedin className="w-4 h-4 inline mr-1" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={personalInfo.linkedinUrl || ''}
              onChange={(e) => setPersonalInfo({ ...personalInfo, linkedinUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Github className="w-4 h-4 inline mr-1" />
              GitHub URL
            </label>
            <input
              type="url"
              value={personalInfo.githubUrl || ''}
              onChange={(e) => setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Professional Summary
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tagline
            </label>
            <div className="relative">
              <input
                type="text"
                value={personalInfo.tagline || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, tagline: e.target.value })}
                className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Brief professional tagline"
              />
              <button
                onClick={() => enhanceText('tagline')}
                className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Enhance with AI"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <div className="relative">
              <textarea
                value={personalInfo.bio || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Professional bio for the portfolio homepage"
              />
              <button
                onClick={() => enhanceText('bio')}
                className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Enhance with AI"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Summary (Resume)
            </label>
            <div className="relative">
              <textarea
                value={personalInfo.executiveSummary || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, executiveSummary: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Professional summary for your resume"
              />
              <button
                onClick={() => enhanceText('executiveSummary')}
                className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Enhance with AI"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {saveStatus !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
            saveStatus === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Changes saved successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Failed to save changes</span>
              </>
            )}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}