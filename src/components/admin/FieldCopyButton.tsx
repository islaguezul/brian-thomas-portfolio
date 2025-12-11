'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, X, Check, Loader2 } from 'lucide-react';
import { getTenantShortName, getOppositeTenant } from '@/lib/cross-tenant';
import { getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

interface FieldCopyButtonProps {
  otherValue: string | undefined | null;
  onCopy: (value: string) => void;
  fieldLabel?: string;
  loading?: boolean;
}

export default function FieldCopyButton({
  otherValue,
  onCopy,
  fieldLabel = 'value',
  loading = false,
}: FieldCopyButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTenant = getCurrentTenantFromClient();
  const otherTenant = getOppositeTenant(currentTenant);
  const otherTenantName = getTenantShortName(otherTenant);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (otherValue) {
      onCopy(otherValue);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowPopover(false);
      }, 1500);
    }
  };

  // Don't show button if there's no value to copy
  if (!otherValue) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowPopover(!showPopover)}
        disabled={loading}
        className="p-1.5 bg-amber-900/30 hover:bg-amber-900/50 rounded transition-colors border border-amber-500/30"
        title={`Copy from ${otherTenantName}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-amber-400" />
        )}
      </button>

      {/* Popover */}
      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute z-50 bottom-full left-0 mb-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <span className="text-sm font-medium text-amber-400">
              {fieldLabel} on {otherTenantName}
            </span>
            <button
              onClick={() => setShowPopover(false)}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {otherValue}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-3 border-t border-gray-800">
            <button
              onClick={handleCopy}
              disabled={copied}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Apply this {fieldLabel}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
