'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { getTenantShortName, getOppositeTenant } from '@/lib/cross-tenant';
import type { CrossTenantEntityType } from '@/lib/cross-tenant';
import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

interface OtherTenantPanelProps<T> {
  entityType: CrossTenantEntityType;
  renderItem: (item: T, onCopy: () => void) => React.ReactNode;
  emptyMessage?: string;
  title?: string;
  onItemCopied?: () => void;
  // Function to get name from item for conflict checking
  getItemName?: (item: T) => string;
  // Function to check if item exists on current tenant
  checkConflict?: (itemName: string) => boolean;
}

export default function OtherTenantPanel<T extends { id?: number }>({
  entityType,
  renderItem,
  emptyMessage = 'No items on the other site',
  title,
  onItemCopied,
  getItemName,
  checkConflict,
}: OtherTenantPanelProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<number | null>(null);

  const currentTenant = getCurrentTenantFromClient();
  const otherTenant = getOppositeTenant(currentTenant);
  const otherTenantName = getTenantShortName(otherTenant);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminFetch(`/api/admin/cross-tenant/${entityType}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when expanded
  useEffect(() => {
    if (isExpanded && data.length === 0 && !loading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const handleCopyItem = async (item: T) => {
    if (!item.id) return;

    setCopyingId(item.id);
    try {
      // Check for conflict if we have the functions
      const conflictResolution: 'create-new' | 'replace' = 'create-new';
      if (getItemName && checkConflict) {
        const itemName = getItemName(item);
        if (checkConflict(itemName)) {
          // Show confirmation
          const action = window.confirm(
            `"${itemName}" already exists on your current site. Click OK to create a duplicate, or Cancel to skip.`
          );
          if (!action) {
            setCopyingId(null);
            return;
          }
        }
      }

      const response = await adminFetch('/api/admin/cross-tenant/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId: item.id,
          conflictResolution,
        }),
      });

      if (!response.ok) throw new Error('Copy failed');

      onItemCopied?.();
    } catch (err) {
      console.error('Error copying item:', err);
      alert('Failed to copy item');
    } finally {
      setCopyingId(null);
    }
  };

  const displayTitle = title || `Content on ${otherTenantName}`;

  return (
    <div className="bg-amber-900/10 border border-amber-500/30 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Copy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">{displayTitle}</h3>
            <p className="text-amber-400/70 text-sm">
              {isExpanded
                ? `${data.length} item${data.length !== 1 ? 's' : ''} available to copy`
                : 'Click to view and copy items from the other site'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchData();
              }}
              className="p-2 hover:bg-amber-900/30 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-amber-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-amber-500/20 p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="text-center py-8 text-gray-400">{emptyMessage}</div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    {renderItem(item, () => handleCopyItem(item))}
                  </div>
                  <button
                    onClick={() => handleCopyItem(item)}
                    disabled={copyingId === item.id}
                    className="ml-3 px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copyingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
