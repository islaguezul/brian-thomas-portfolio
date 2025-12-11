'use client';

import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import type { ConflictResolution } from '@/lib/cross-tenant';
import { getTenantShortName } from '@/lib/cross-tenant';
import type { Tenant } from '@/middleware';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolution: ConflictResolution) => void;
  sourceName: string;
  sourceDescription?: string;
  targetName: string;
  targetDescription?: string;
  sourceTenant: Tenant;
  targetTenant: Tenant;
  entityType: string;
  loading?: boolean;
}

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  onResolve,
  sourceName,
  sourceDescription,
  targetName,
  targetDescription,
  sourceTenant,
  targetTenant,
  entityType,
  loading = false,
}: ConflictResolutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Similar {entityType} Found
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            A similar item already exists on {getTenantShortName(targetTenant)}.
            How would you like to proceed?
          </p>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Source */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2">
                Source ({getTenantShortName(sourceTenant)})
              </div>
              <h3 className="text-white font-medium mb-1">{sourceName}</h3>
              {sourceDescription && (
                <p className="text-gray-400 text-sm line-clamp-3">
                  {sourceDescription}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </div>

            {/* Target */}
            <div className="bg-gray-800/50 border border-amber-500/30 rounded-lg p-4">
              <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                Existing ({getTenantShortName(targetTenant)})
              </div>
              <h3 className="text-white font-medium mb-1">{targetName}</h3>
              {targetDescription && (
                <p className="text-gray-400 text-sm line-clamp-3">
                  {targetDescription}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onResolve('skip')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="text-left">
                <div className="text-white font-medium">Skip</div>
                <div className="text-gray-400 text-sm">
                  Don&apos;t copy anything, keep the existing item unchanged
                </div>
              </div>
            </button>

            <button
              onClick={() => onResolve('replace')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-amber-900/30 border border-gray-700 hover:border-amber-500/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="text-left">
                <div className="text-white font-medium">Replace Existing</div>
                <div className="text-gray-400 text-sm">
                  Overwrite the existing item with data from {getTenantShortName(sourceTenant)}
                </div>
              </div>
            </button>

            <button
              onClick={() => onResolve('create-new')}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-blue-900/30 border border-gray-700 hover:border-blue-500/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="text-left">
                <div className="text-white font-medium">Create New Copy</div>
                <div className="text-gray-400 text-sm">
                  Create a new item alongside the existing one (may result in duplicates)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
