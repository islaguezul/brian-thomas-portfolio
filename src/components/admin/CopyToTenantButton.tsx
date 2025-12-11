'use client';

import { useState } from 'react';
import { Copy, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';
import { getTenantShortName, getOppositeTenant } from '@/lib/cross-tenant';
import type { CrossTenantEntityType, ConflictResolution } from '@/lib/cross-tenant';
import ConflictResolutionModal from './ConflictResolutionModal';
import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

interface CopyToTenantButtonProps {
  entityType: CrossTenantEntityType;
  entityId: number;
  entityName: string;
  entityDescription?: string;
  onCopied?: () => void;
  // Function to check if a matching entity exists on the target tenant
  checkForConflict?: () => Promise<{
    exists: boolean;
    targetId?: number;
    targetName?: string;
    targetDescription?: string;
  }>;
  className?: string;
  showLabel?: boolean;
}

export default function CopyToTenantButton({
  entityType,
  entityId,
  entityName,
  entityDescription,
  onCopied,
  checkForConflict,
  className = '',
  showLabel = false,
}: CopyToTenantButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState<{
    targetId: number;
    targetName: string;
    targetDescription?: string;
  } | null>(null);

  const currentTenant = getCurrentTenantFromClient();
  const targetTenant = getOppositeTenant(currentTenant);
  const targetTenantName = getTenantShortName(targetTenant);

  const handleCopy = async (resolution?: ConflictResolution, targetEntityId?: number) => {
    setLoading(true);
    setStatus('idle');

    try {
      // If no resolution specified and we have a conflict checker, check for conflicts first
      if (!resolution && checkForConflict) {
        const conflict = await checkForConflict();
        if (conflict.exists && conflict.targetId) {
          setConflictData({
            targetId: conflict.targetId,
            targetName: conflict.targetName || entityName,
            targetDescription: conflict.targetDescription,
          });
          setShowConflictModal(true);
          setLoading(false);
          return;
        }
      }

      const response = await adminFetch('/api/admin/cross-tenant/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          conflictResolution: resolution || 'create-new',
          targetEntityId: targetEntityId,
        }),
      });

      if (!response.ok) {
        throw new Error('Copy failed');
      }

      setStatus('success');
      setShowConflictModal(false);
      onCopied?.();

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error copying entity:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleConflictResolution = (resolution: ConflictResolution) => {
    if (resolution === 'skip') {
      setShowConflictModal(false);
      return;
    }
    handleCopy(resolution, resolution === 'replace' ? conflictData?.targetId : undefined);
  };

  const buttonContent = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <Copy className="w-4 h-4" />;
  };

  return (
    <>
      <button
        onClick={() => handleCopy()}
        disabled={loading}
        className={`p-2 bg-gray-800 hover:bg-amber-900/50 rounded-lg transition-colors disabled:opacity-50 group ${className}`}
        title={`Copy to ${targetTenantName}`}
      >
        <span className="flex items-center gap-2">
          {buttonContent()}
          {showLabel && (
            <span className="text-gray-300 group-hover:text-amber-400 text-sm">
              Copy to {targetTenantName}
            </span>
          )}
        </span>
      </button>

      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        onResolve={handleConflictResolution}
        sourceName={entityName}
        sourceDescription={entityDescription}
        targetName={conflictData?.targetName || ''}
        targetDescription={conflictData?.targetDescription}
        sourceTenant={currentTenant}
        targetTenant={targetTenant}
        entityType={entityType}
        loading={loading}
      />
    </>
  );
}
