'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Plus, X, Upload, Sparkles, Trash2, GripVertical,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle
} from 'lucide-react';
import type { Project, ProjectScreenshot } from '@/lib/database/types';
import { getTechEmoji } from '@/lib/icons';
import { adminFetch } from '@/lib/admin-fetch';

interface ProjectFormProps {
  project?: Project;
  isNew?: boolean;
}

export default function ProjectForm({ project, isNew = false }: ProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    features: true,
    impacts: false,
    challenges: false,
    outcomes: false,
    screenshots: false,
  });

  const [formData, setFormData] = useState<Project>({
    name: project?.name || '',
    status: project?.status || '',
    description: project?.description || '',
    detailedDescription: project?.detailedDescription || '',
    stage: project?.stage || 'concept',
    progress: project?.progress || 0,
    experimental: project?.experimental || false,
    legacy: project?.legacy || false,
    liveUrl: project?.liveUrl || '',
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
    displayOrder: project?.displayOrder || 0,
    technologies: project?.technologies || [],
    features: project?.features || [],
    impacts: project?.impacts || [],
    challenges: project?.challenges || [],
    outcomes: project?.outcomes || [],
    screenshots: project?.screenshots || [],
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');

    try {
      const url = isNew 
        ? '/api/admin/projects' 
        : `/api/admin/projects/${project?.id}`;
      
      const response = await adminFetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => {
          router.push('/admin/projects');
          router.refresh();
        }, 1500);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies?.includes(tech)) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), tech],
      });
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter(t => t !== tech) || [],
    });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), { feature: '', displayOrder: formData.features?.length || 0 }],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(formData.features || [])];
    features[index] = { ...features[index], feature: value };
    setFormData({ ...formData, features });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || [],
    });
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Image compression function to reduce data URL size
  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  };

  const handleScreenshotUpload = async (files: FileList) => {
    if (!files) return;

    try {
      const newScreenshots: ProjectScreenshot[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a compressed data URL for storage
        const dataUrl = await compressImage(file);
        
        // Create screenshot object with temporary data URL
        // WARNING: This stores large base64 data URLs in database - not ideal for production
        // TODO: Implement proper file upload to storage service (AWS S3, Cloudinary, etc.)
        const screenshot: ProjectScreenshot = {
          filePath: dataUrl, // Using data URL for database storage (temporary solution)
          altText: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          displayOrder: (formData.screenshots?.length || 0) + newScreenshots.length
        };
        
        newScreenshots.push(screenshot);
      }
      
      // Add new screenshots to form data
      setFormData({
        ...formData,
        screenshots: [...(formData.screenshots || []), ...newScreenshots]
      });
      
      console.log(`Successfully added ${newScreenshots.length} screenshot(s)`);
    } catch (error) {
      console.error('Error uploading screenshots:', error);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleScreenshotUpload(files);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setFormData({
      ...formData,
      screenshots: formData.screenshots?.filter((_, i) => i !== index) || []
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        const fileList = new DataTransfer();
        imageFiles.forEach(file => fileList.items.add(file));
        await handleScreenshotUpload(fileList.files);
      }
    }
  };

  const enhanceText = async (field: keyof Project) => {
    try {
      const response = await adminFetch('/api/admin/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance',
          field,
          context: formData.name || 'Project',
          currentValue: formData[field] as string || '',
        }),
      });

      if (response.ok) {
        const { result } = await response.json();
        setFormData({ ...formData, [field]: result });
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
    }
  };

  const suggestTechnologies = async () => {
    if (!formData.description) return;
    
    try {
      const response = await adminFetch('/api/admin/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestTech',
          currentValue: formData.description,
        }),
      });

      if (response.ok) {
        const { result } = await response.json();
        setFormData({ 
          ...formData, 
          technologies: [...new Set([...(formData.technologies || []), ...result])]
        });
      }
    } catch (error) {
      console.error('Error suggesting technologies:', error);
    }
  };

  const generateFeatures = async () => {
    if (!formData.description) return;
    
    try {
      const response = await adminFetch('/api/admin/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generateFeatures',
          currentValue: formData.description,
        }),
      });

      if (response.ok) {
        const { result } = await response.json();
        const newFeatures = result.map((feature: string, idx: number) => ({
          feature,
          displayOrder: (formData.features?.length || 0) + idx
        }));
        setFormData({ 
          ...formData, 
          features: [...(formData.features || []), ...newFeatures]
        });
      }
    } catch (error) {
      console.error('Error generating features:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('basic')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
          {expandedSections.basic ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.basic && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Active Development, Live, Paused"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as Project['stage'] })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="production">Production</option>
                  <option value="mvp">MVP</option>
                  <option value="backend">Backend</option>
                  <option value="concept">Concept</option>
                  <option value="research">Research</option>
                  <option value="legacy">Legacy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief project description"
                />
                <button
                  type="button"
                  onClick={() => enhanceText('description')}
                  className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Enhance with AI"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Description
              </label>
              <div className="relative">
                <textarea
                  value={formData.detailedDescription || ''}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Comprehensive project details"
                />
                <button
                  type="button"
                  onClick={() => enhanceText('detailedDescription')}
                  className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Enhance with AI"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Live URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl || ''}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={formData.demoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.experimental || false}
                  onChange={(e) => setFormData({ ...formData, experimental: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Experimental Project</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.legacy || false}
                  onChange={(e) => setFormData({ ...formData, legacy: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Legacy Project</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technologies
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.technologies?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      <span>{getTechEmoji(tech)}</span>
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add technology..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addTechnology(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={suggestTechnologies}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                    title="AI suggest technologies"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Suggest
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('features')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-white">Features</h2>
          {expandedSections.features ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.features && (
          <div className="p-6 pt-0 space-y-3">
            {formData.features?.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
                <input
                  type="text"
                  value={feature.feature}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
              <button
                type="button"
                onClick={generateFeatures}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                title="AI generate features"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Generate Features
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screenshots Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('screenshots')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-white">Screenshots</h2>
          {expandedSections.screenshots ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSections.screenshots && (
          <div className="p-6 pt-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center z-10">
                  <div className="text-blue-400 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop images here</p>
                    <p className="text-xs opacity-75">Supports drag from Photos app</p>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {formData.screenshots && formData.screenshots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.screenshots.map((screenshot, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={screenshot.filePath}
                          alt={screenshot.altText || `Screenshot ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove screenshot"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400 mb-2">No screenshots uploaded yet</p>
                    <p className="text-sm text-gray-500">Drag images here or click to upload</p>
                    <p className="text-xs text-gray-600 mt-1">Supports drag from macOS Photos app</p>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  {formData.screenshots && formData.screenshots.length > 0 ? 'Add More Screenshots' : 'Upload Screenshots'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-4">
          {saveStatus !== 'idle' && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
              saveStatus === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isNew ? 'Project created!' : 'Changes saved!'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to save</span>
                </>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : (isNew ? 'Create Project' : 'Save Changes')}
          </button>
        </div>
      </div>
    </form>
  );
}