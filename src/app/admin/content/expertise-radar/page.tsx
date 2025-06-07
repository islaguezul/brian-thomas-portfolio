'use client';

import React, { useState, useEffect } from 'react';
import { ExpertiseRadarItem } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';

export default function ExpertiseRadarAdmin() {
  const [radarItems, setRadarItems] = useState<ExpertiseRadarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpertiseRadarItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ExpertiseRadarItem>>({
    skillName: '',
    skillLevel: 5,
    category: '',
    description: '',
    color: '#8884d8',
    displayOrder: 0,
    isActive: true
  });

  const predefinedColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
    '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
  ];

  const fetchRadarItems = async () => {
    try {
      const response = await adminFetch('/api/admin/content/expertise-radar');
      console.log('Admin fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Admin fetch response data:', data);
      
      setRadarItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching radar items:', error);
      setRadarItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRadarItems();
  }, []);

  const handleCreate = async () => {
    if (!newItem.skillName?.trim()) return;
    
    setIsCreating(true);
    try {
      await adminFetch('/api/admin/content/expertise-radar', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      
      setNewItem({
        skillName: '',
        skillLevel: 5,
        category: '',
        description: '',
        color: '#8884d8',
        displayOrder: 0,
        isActive: true
      });
      
      await fetchRadarItems();
    } catch (error) {
      console.error('Error creating radar item:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (item: ExpertiseRadarItem) => {
    try {
      await adminFetch(`/api/admin/content/expertise-radar/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify(item)
      });
      
      setEditingItem(null);
      await fetchRadarItems();
    } catch (error) {
      console.error('Error updating radar item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this radar item?')) return;
    
    try {
      await adminFetch(`/api/admin/content/expertise-radar/${id}`, {
        method: 'DELETE'
      });
      
      await fetchRadarItems();
    } catch (error) {
      console.error('Error deleting radar item:', error);
    }
  };

  const EditForm = ({ item, onSave, onCancel }: {
    item: ExpertiseRadarItem;
    onSave: (item: ExpertiseRadarItem) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(item);

    return (
      <tr className="bg-gray-50">
        <td colSpan={7} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.skillName}
                onChange={(e) => setFormData({...formData, skillName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Level (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.skillLevel}
                onChange={(e) => setFormData({...formData, skillLevel: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Technical, Leadership, Domain Knowledge"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color || '#8884d8'}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <div className="flex space-x-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({...formData, color})}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description or context for this skill"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expertise Radar</h1>
        <p className="text-gray-600">
          Manage your expertise radar visualization. These skills will appear on your portfolio&apos;s radar chart.
        </p>
      </div>

      {/* Create New Item */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Add New Skill</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                value={newItem.skillName || ''}
                onChange={(e) => setNewItem({...newItem, skillName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Product Strategy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Level (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={newItem.skillLevel || 5}
                onChange={(e) => setNewItem({...newItem, skillLevel: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={newItem.category || ''}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Technical, Leadership"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!newItem.skillName?.trim() || isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Items */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current Skills</h2>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {radarItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.skillName}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.skillLevel}/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {item.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => item.id && handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {editingItem?.id === item.id && editingItem && (
                    <EditForm
                      item={editingItem}
                      onSave={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                    />
                  )}
                </React.Fragment>
              ))}
              {radarItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No radar skills found. Add your first skill above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {radarItems.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No radar skills found. Add your first skill above.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {radarItems.map((item) => (
                <React.Fragment key={`mobile-${item.id}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.skillName}
                          </h3>
                          <div
                            className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-500 mb-3">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Level:</span>
                            <span className="ml-1 text-gray-900">{item.skillLevel}/10</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <span className="ml-1 text-gray-500">{item.category || '-'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Order:</span>
                            <span className="ml-1 text-gray-500">{item.displayOrder}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {editingItem?.id === item.id && editingItem && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <EditForm
                          item={editingItem}
                          onSave={handleUpdate}
                          onCancel={() => setEditingItem(null)}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}