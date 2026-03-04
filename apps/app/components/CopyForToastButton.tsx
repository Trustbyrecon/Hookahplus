'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';

/** Short ID: first 8 chars for order name field */
const SHORT_ID_LEN = 8;

export type CopyVariant = 'note' | 'sessionId';

export interface CopyForToastButtonProps {
  sessionId: string;
  tableId?: string | null;
  customerName?: string | null;
  variant: CopyVariant;
  /** Include HH:MM timestamp for reconciliation disambiguation */
  includeTimestamp?: boolean;
  /** Primary = large prominent button; secondary = smaller */
  primary?: boolean;
  onCopySuccess?: () => void;
  onCopyFailure?: (text: string) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Builds Toast reconciliation text.
 * Guest: use "Guest (unclaimed)" when missing — never silent "Guest".
 */
export function buildToastNoteText(
  sessionId: string,
  tableId?: string | null,
  customerName?: string | null,
  includeTimestamp?: boolean
): string {
  const table = tableId || 'N/A';
  const guest = customerName?.trim() ? customerName : 'Guest (unclaimed)';
  const ts = includeTimestamp
    ? ` | ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
    : '';
  return `H+ Session: ${sessionId} | Table: ${table} | Guest: ${guest}${ts}`;
}

/**
 * Order name format (short): H+ {shortId} T{table}
 */
export function buildToastOrderNameText(
  sessionId: string,
  tableId?: string | null
): string {
  const shortId = sessionId.slice(0, SHORT_ID_LEN);
  const table = tableId || 'N/A';
  return `H+ ${shortId} T${table}`;
}

export default function CopyForToastButton({
  sessionId,
  tableId,
  customerName,
  variant,
  includeTimestamp = true,
  primary = false,
  onCopySuccess,
  onCopyFailure,
  className = '',
  children,
}: CopyForToastButtonProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const fallbackInputRef = useRef<HTMLTextAreaElement>(null);

  const getTextToCopy = (): string => {
    if (variant === 'sessionId') {
      return sessionId;
    }
    return buildToastNoteText(sessionId, tableId, customerName, includeTimestamp);
  };

  const handleCopy = async () => {
    const text = getTextToCopy();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        onCopySuccess?.();
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      setFallbackText(text);
      setShowFallback(true);
      onCopyFailure?.(text);
    }
  };

  // Select text when fallback modal opens
  useEffect(() => {
    if (showFallback && fallbackInputRef.current) {
      fallbackInputRef.current.focus();
      fallbackInputRef.current.select();
    }
  }, [showFallback]);

  const label =
    variant === 'note'
      ? 'Copy for Toast (Note)'
      : 'Copy Session ID';

  const icon = primary ? (
    <Copy className="w-5 h-5" />
  ) : (
    <Copy className="w-4 h-4" />
  );

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={
          primary
            ? `w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors min-h-[44px] ${className}`
            : `flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors min-h-[44px] ${className}`
        }
        aria-label={label}
      >
        {children ?? (
          <>
            {icon}
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Fallback modal when clipboard fails */}
      {showFallback && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl w-full max-w-lg border border-zinc-700 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Copy failed</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Tap and hold the text below to copy.
            </p>
            <textarea
              ref={fallbackInputRef}
              readOnly
              value={fallbackText}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono resize-none"
              rows={4}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFallback(false)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
