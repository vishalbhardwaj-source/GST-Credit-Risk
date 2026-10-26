import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, FileSpreadsheet, RefreshCw, Upload, X } from 'lucide-react';
import { getApiBaseUrl } from '../config';
import type { PipelineSummary, ReconciledInvoice } from '../types';

interface DatasetResponse {
  session_id: string;
  source: string;
  scored: boolean;
  summary: PipelineSummary;
  total: number;
  invoices: ReconciledInvoice[];
}

type UploadKey = 'pr_file' | 'gstr2b_file' | 'gstr1_file' | 'ap_aging_file' | 'filing_history_file';
const uploadFields: { key: UploadKey; label: string; required?: boolean }[] = [
  { key: 'pr_file', label: 'Purchase Register', required: true },
  { key: 'gstr2b_file', label: 'GSTR-2B' },
  { key: 'gstr1_file', label: 'GSTR-1' },
  { key: 'ap_aging_file', label: 'AP aging' },
  { key: 'filing_history_file', label: 'Filing history' },
];

export interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: DatasetResponse, name: string) => void;
  onResetToDemo: () => void;
  isCustomDataActive: boolean;
  customDataName?: string;
}

export function UploadDataModal({
  isOpen,
  onClose,
  onDataLoaded,
  onResetToDemo,
  isCustomDataActive,
  customDataName,
}: UploadDataModalProps) {
  const [files, setFiles] = useState<Partial<Record<UploadKey, File>>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const purchaseRegister = files.pr_file;
    if (!purchaseRegister) {
      setErrorMessage('Upload a Purchase Register CSV to continue.');
      return;
    }
    const form = new FormData();
    for (const field of uploadFields) {
      const file = files[field.key];
      if (file) form.append(field.key, file);
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/model/upload`, { method: 'POST', body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : `Upload failed (${response.status}).`);
      onDataLoaded(body as DatasetResponse, uploadFields
        .map((field) => files[field.key]?.name)
        .filter(Boolean)
        .join(' + '));
      setFiles({});
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not process the uploaded files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(5, 10, 24, 0.82)', backdropFilter: 'blur(8px)' }}>
      <form onSubmit={submit} style={{ width: 'min(780px, 100%)', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--navy-border)', borderRadius: 16, background: 'var(--navy-surface)', color: '#f8fafc', boxShadow: '0 24px 48px -12px rgba(0,0,0,.6), 0 0 24px rgba(159,111,240,.15)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(159,111,240,.08) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', display: 'grid', placeItems: 'center', color: '#fff' }}><Upload size={20} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Upload &amp; Reconcile Invoices</h2>
              <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>Purchase Register required; source CSVs are optional.</p>
            </div>
          </div>
          <button type="button" aria-label="Close upload dialog" onClick={onClose} style={{ background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: 6, borderRadius: 8 }}><X size={20} /></button>
        </div>

        {isCustomDataActive && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '10px 24px', borderBottom: '1px solid rgba(16,185,129,.25)', background: 'rgba(16,185,129,.12)', fontSize: 12 }}>
            <span>Active dataset: {customDataName}</span>
            <button type="button" onClick={() => { onResetToDemo(); onClose(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', background: 'transparent', border: '1px solid rgba(16,185,129,.4)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}><RefreshCw size={12} /> Reset to demo</button>
          </div>
        )}

        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
            Upload your buyer Purchase Register and any available source data. Files are processed temporarily in backend memory; they are not saved to a database.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          {uploadFields.map((field) => (
            <label key={field.key} style={{ minHeight: 110, padding: 14, border: `2px dashed ${files[field.key] ? '#10b981' : 'rgba(159,111,240,.45)'}`, borderRadius: 10, background: files[field.key] ? 'rgba(16,185,129,.05)' : 'rgba(255,255,255,.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                <FileSpreadsheet size={15} color={files[field.key] ? '#34d399' : '#a5b4fc'} />
                {field.label} {field.required ? <span style={{ color: '#f87171' }}>*</span> : <span style={{ color: '#94a3b8' }}>(Optional)</span>}
              </span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFiles((current) => {
                    const updated = { ...current };
                    if (file) updated[field.key] = file;
                    else delete updated[field.key];
                    return updated;
                  });
                  setErrorMessage(null);
                }}
                style={{ width: '100%', color: '#94a3b8', fontSize: 11 }}
              />
              {files[field.key] && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: '#34d399', fontSize: 11, overflowWrap: 'anywhere' }}>
                  <CheckCircle2 size={13} /> {files[field.key]?.name} · {((files[field.key]?.size ?? 0) / 1024).toFixed(1)} KB
                </span>
              )}
            </label>
          ))}
          </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 12, borderRadius: 8, background: 'rgba(251,191,36,.08)', color: '#fde68a', fontSize: 12, lineHeight: 1.5 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          Uploads are processed in backend memory and are not saved to a database. These source files do not provide verified IRN status, so uploaded invoices will be reconciled where possible but not model-scored.
        </div>

        {errorMessage && (
          <div role="alert" style={{ display: 'flex', gap: 8, marginTop: 14, color: '#fca5a5', fontSize: 12 }}>
            <AlertCircle size={15} /> {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isProcessing || !files.pr_file} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', border: 0, color: '#fff', padding: '9px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: isProcessing || !files.pr_file ? .6 : 1 }}>
            {isProcessing ? <FileSpreadsheet size={14} /> : <Upload size={14} />}
            {isProcessing ? 'Processing…' : 'Process upload'}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
