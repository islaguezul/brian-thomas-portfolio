'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, User, Mail, Phone, MapPin, Github, Linkedin, FileText, Link, CheckCircle, AlertCircle, Copy, Loader2 } from 'lucide-react';
import type { PersonalInfo } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';
import { useOtherTenantData } from '@/hooks/useOtherTenantData';
import { getTenantShortName } from '@/lib/cross-tenant';
import FieldCopyButton from '@/components/admin/FieldCopyButton';

export default function PersonalInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyingAll, setCopyingAll] = useState(false);
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

  // Fetch personal info from the other tenant
  const { data: otherTenantData, otherTenant } = useOtherTenantData<PersonalInfo>('personal');
  const otherPersonalInfo = otherTenantData as PersonalInfo | null;
  const otherTenantName = getTenantShortName(otherTenant);

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

  async function handleCopyAll() {
    if (!otherPersonalInfo) return;

    const confirmed = window.confirm(
      `This will copy all personal info from ${otherTenantName} to the current site. Your current data will be overwritten. Continue?`
    );
    if (!confirmed) return;

    setCopyingAll(true);
    try {
      const response = await adminFetch('/api/admin/cross-tenant/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'personal',
        }),
      });

      if (response.ok) {
        // Reload data from current tenant
        await loadPersonalInfo();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      console.error('Error copying personal info:', error);
      alert('Failed to copy personal info from other site');
    } finally {
      setCopyingAll(false);
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

  // Helper to copy a single field value
  const copyField = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personal Information</h1>
          <p className="text-gray-400">Manage your personal and professional details</p>
        </div>
        {otherPersonalInfo && (
          <button
            onClick={handleCopyAll}
            disabled={copyingAll}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {copyingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy All from {otherTenantName}
          </button>
        )}
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
            <div className="flex gap-2">
              <input
                type="text"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.name}
                onCopy={(value) => copyField('name', value)}
                fieldLabel="name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Professional Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={personalInfo.title}
                onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.title}
                onCopy={(value) => copyField('title', value)}
                fieldLabel="title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.email}
                onCopy={(value) => copyField('email', value)}
                fieldLabel="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={personalInfo.phone || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.phone}
                onCopy={(value) => copyField('phone', value)}
                fieldLabel="phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={personalInfo.location || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.location}
                onCopy={(value) => copyField('location', value)}
                fieldLabel="location"
              />
            </div>
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
            <div className="flex gap-2">
              <input
                type="url"
                value={personalInfo.linkedinUrl || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedinUrl: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.linkedinUrl}
                onCopy={(value) => copyField('linkedinUrl', value)}
                fieldLabel="LinkedIn URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Github className="w-4 h-4 inline mr-1" />
              GitHub URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={personalInfo.githubUrl || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://github.com/username"
              />
              <FieldCopyButton
                otherValue={otherPersonalInfo?.githubUrl}
                onCopy={(value) => copyField('githubUrl', value)}
                fieldLabel="GitHub URL"
              />
            </div>
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
            <div className="relative flex gap-2">
              <div className="relative flex-1">
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
              <FieldCopyButton
                otherValue={otherPersonalInfo?.tagline}
                onCopy={(value) => copyField('tagline', value)}
                fieldLabel="tagline"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
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
              <FieldCopyButton
                otherValue={otherPersonalInfo?.bio}
                onCopy={(value) => copyField('bio', value)}
                fieldLabel="bio"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Summary (Resume)
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
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
              <FieldCopyButton
                otherValue={otherPersonalInfo?.executiveSummary}
                onCopy={(value) => copyField('executiveSummary', value)}
                fieldLabel="summary"
              />
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
