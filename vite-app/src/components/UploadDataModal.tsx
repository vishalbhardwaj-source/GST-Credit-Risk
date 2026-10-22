import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Sparkles,
  ArrowRight,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import type { ReconciledInvoice } from '../types';
import {
  parsePurchaseRegisterCsv,
  parseGstr2bCsv,
  parseReconciledAuditCsv,
  reconcileUploadedLists,
  getSamplePrCsv,
  getSampleGstr2bCsv,
  getSampleReconciledCsv,
  downloadFile,
} from '../parser';

export interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (invoices: ReconciledInvoice[], sourceInfo: { name: string; total: number; matched: number; unmatched: number }) => void;
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
  const [activeTab, setActiveTab] = useState<'two_files' | 'single_file' | 'templates'>('two_files');

  // Two files state
  const [prFile, setPrFile] = useState<{ name: string; size: number; content: string; count: number } | null>(null);
  const [gstr2bFile, setGstr2bFile] = useState<{ name: string; size: number; content: string; count: number } | null>(null);

  // Single file state
  const [singleFile, setSingleFile] = useState<{ name: string; size: number; content: string; count: number } | null>(null);

  // Status and error states
  const [dragOverPr, setDragOverPr] = useState(false);
  const [dragOver2b, setDragOver2b] = useState(false);
  const [dragOverSingle, setDragOverSingle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const prInputRef = useRef<HTMLInputElement>(null);
  const gstr2bInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File handler helper
  const handleFileRead = (
    file: File,
    onSuccess: (info: { name: string; size: number; content: string }) => void
  ) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setErrorMessage(`Please upload a CSV file (.csv). Selected: ${file.name}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onSuccess({
        name: file.name,
        size: file.size,
        content,
      });
    };
    reader.onerror = () => {
      setErrorMessage(`Failed to read file ${file.name}.`);
    };
    reader.readAsText(file);
  };

  const handlePrSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { invoices, errors } = parsePurchaseRegisterCsv(info.content);
        if (errors.length > 0 && invoices.length === 0) {
          setErrorMessage(`Purchase Register error: ${errors.join(', ')}`);
          return;
        }
        setPrFile({ ...info, count: invoices.length });
      });
    }
  };

  const handleGstr2bSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { records, errors } = parseGstr2bCsv(info.content);
        if (errors.length > 0 && records.length === 0) {
          setErrorMessage(`GSTR-2B file error: ${errors.join(', ')}`);
          return;
        }
        setGstr2bFile({ ...info, count: records.length });
      });
    }
  };

  const handleSingleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { invoices, errors } = parseReconciledAuditCsv(info.content);
        if (errors.length > 0 && invoices.length === 0) {
          setErrorMessage(`Audit CSV error: ${errors.join(', ')}`);
          return;
        }
        setSingleFile({ ...info, count: invoices.length });
      });
    }
  };

  // Drag and Drop handlers
  const handleDropPr = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverPr(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { invoices, errors } = parsePurchaseRegisterCsv(info.content);
        if (errors.length > 0 && invoices.length === 0) {
          setErrorMessage(`Purchase Register error: ${errors.join(', ')}`);
          return;
        }
        setPrFile({ ...info, count: invoices.length });
      });
    }
  };

  const handleDrop2b = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver2b(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { records, errors } = parseGstr2bCsv(info.content);
        if (errors.length > 0 && records.length === 0) {
          setErrorMessage(`GSTR-2B file error: ${errors.join(', ')}`);
          return;
        }
        setGstr2bFile({ ...info, count: records.length });
      });
    }
  };

  const handleDropSingle = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverSingle(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileRead(file, (info) => {
        const { invoices, errors } = parseReconciledAuditCsv(info.content);
        if (errors.length > 0 && invoices.length === 0) {
          setErrorMessage(`Audit CSV error: ${errors.join(', ')}`);
          return;
        }
        setSingleFile({ ...info, count: invoices.length });
      });
    }
  };

  // Submit process
  const handleProcessTwoFiles = () => {
    if (!prFile) {
      setErrorMessage('Please upload a Purchase Register CSV file.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { invoices: prInvoices, errors: prErrors } = parsePurchaseRegisterCsv(prFile.content);
      if (prInvoices.length === 0) {
        setErrorMessage(`Failed to parse invoices: ${prErrors.join(', ') || 'No valid rows found'}`);
        setIsProcessing(false);
        return;
      }

      let gstr2bRecords: any[] = [];
      if (gstr2bFile) {
        const { records: g2bRecs } = parseGstr2bCsv(gstr2bFile.content);
        gstr2bRecords = g2bRecs;
      }

      const reconciled = reconcileUploadedLists(prInvoices, gstr2bRecords, true);
      const matched = reconciled.filter((i) => i.matchResult.matched).length;
      const unmatched = reconciled.length - matched;

      onDataLoaded(reconciled, {
        name: `${prFile.name}${gstr2bFile ? ` + ${gstr2bFile.name}` : ''}`,
        total: reconciled.length,
        matched,
        unmatched,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(`Processing error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessSingleFile = () => {
    if (!singleFile) {
      setErrorMessage('Please upload a Reconciled Audit CSV file.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { invoices, errors } = parseReconciledAuditCsv(singleFile.content);
      if (invoices.length === 0) {
        setErrorMessage(`Failed to parse invoices: ${errors.join(', ') || 'No valid rows found'}`);
        setIsProcessing(false);
        return;
      }

      const matched = invoices.filter((i) => i.matchResult.matched).length;
      const unmatched = invoices.length - matched;

      onDataLoaded(invoices, {
        name: singleFile.name,
        total: invoices.length,
        matched,
        unmatched,
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(`Processing error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleDataset = () => {
    setIsProcessing(true);
    try {
      const { invoices: prInvoices } = parsePurchaseRegisterCsv(getSamplePrCsv());
      const { records: g2bRecords } = parseGstr2bCsv(getSampleGstr2bCsv());
      const reconciled = reconcileUploadedLists(prInvoices, g2bRecords, true);

      const matched = reconciled.filter((i) => i.matchResult.matched).length;
      const unmatched = reconciled.length - matched;

      onDataLoaded(reconciled, {
        name: 'Sample 10-Invoice Retail Dataset',
        total: reconciled.length,
        matched,
        unmatched,
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--navy-surface, #111827)',
          border: '1px solid var(--navy-border, #1f2937)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(159, 111, 240, 0.15)',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--navy-border, #1f2937)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(159, 111, 240, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
                Upload &amp; Reconcile Invoices
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Ingest your real Purchase Register &amp; GSTR-2B data into the 3-Signal Triage Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Custom Data Status Banner */}
        {isCustomDataActive && (
          <div
            style={{
              padding: '10px 24px',
              background: 'rgba(16, 185, 129, 0.12)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <FileCheck2 size={16} />
              <span>
                Active custom dataset: <strong>{customDataName || 'Custom Upload'}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                onResetToDemo();
                onClose();
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} />
              Reset to 200-Invoice Demo
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--navy-border, #1f2937)',
            padding: '0 24px',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <button
            onClick={() => setActiveTab('two_files')}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'two_files' ? '2px solid #9F6FF0' : '2px solid transparent',
              color: activeTab === 'two_files' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileSpreadsheet size={15} />
            Two Files (PR + GSTR-2B)
          </button>

          <button
            onClick={() => setActiveTab('single_file')}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'single_file' ? '2px solid #9F6FF0' : '2px solid transparent',
              color: activeTab === 'single_file' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Upload size={15} />
            Single Audit / Reconciled CSV
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'templates' ? '2px solid #9F6FF0' : '2px solid transparent',
              color: activeTab === 'templates' ? '#fff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Download size={15} />
            Templates &amp; Quick Demo
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#f87171',
                fontSize: '12px',
              }}
            >
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: Two Files */}
          {activeTab === 'two_files' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                Upload your ERP <strong>Purchase Register</strong> and monthly <strong>GSTR-2B</strong> from the GST Portal.
                The engine normalizes invoice numbers, eliminates cross-vendor false positives, and groups unmatched tax credits into triage buckets.
              </div>

              {/* Dual Upload Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* File 1: Purchase Register */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                    1. Purchase Register CSV <span style={{ color: '#ef4444' }}>*</span>
                  </div>
                  <input
                    type="file"
                    ref={prInputRef}
                    accept=".csv,.txt"
                    style={{ display: 'none' }}
                    onChange={handlePrSelect}
                  />
                  <div
                    onClick={() => prInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverPr(true);
                    }}
                    onDragLeave={() => setDragOverPr(false)}
                    onDrop={handleDropPr}
                    style={{
                      border: `2px dashed ${dragOverPr ? '#9F6FF0' : prFile ? '#10b981' : 'var(--navy-border, #374151)'}`,
                      borderRadius: '12px',
                      padding: '20px 16px',
                      textAlign: 'center',
                      background: prFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {prFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={28} color="#10b981" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{prFile.name}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {(prFile.size / 1024).toFixed(1)} KB · {prFile.count} invoices detected
                        </span>
                        <span style={{ fontSize: '11px', color: '#9F6FF0', marginTop: '4px' }}>Click to replace</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <FileSpreadsheet size={28} color="#94a3b8" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
                          Drop Purchase Register CSV
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>or click to browse from device</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File 2: GSTR-2B */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                    2. GSTR-2B CSV <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                  </div>
                  <input
                    type="file"
                    ref={gstr2bInputRef}
                    accept=".csv,.txt"
                    style={{ display: 'none' }}
                    onChange={handleGstr2bSelect}
                  />
                  <div
                    onClick={() => gstr2bInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver2b(true);
                    }}
                    onDragLeave={() => setDragOver2b(false)}
                    onDrop={handleDrop2b}
                    style={{
                      border: `2px dashed ${dragOver2b ? '#9F6FF0' : gstr2bFile ? '#10b981' : 'var(--navy-border, #374151)'}`,
                      borderRadius: '12px',
                      padding: '20px 16px',
                      textAlign: 'center',
                      background: gstr2bFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {gstr2bFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={28} color="#10b981" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{gstr2bFile.name}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {(gstr2bFile.size / 1024).toFixed(1)} KB · {gstr2bFile.count} 2B records detected
                        </span>
                        <span style={{ fontSize: '11px', color: '#9F6FF0', marginTop: '4px' }}>Click to replace</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <FileCheck2 size={28} color="#94a3b8" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
                          Drop GSTR-2B CSV
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>If omitted, all invoices evaluated</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Supported Columns Guide */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--navy-border, #1f2937)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                  Auto-mapped Column Aliases:
                </div>
                <div>
                  • <strong>Invoice No:</strong> <code>invoice_number</code>, <code>Invoice No</code>, <code>bill_no</code>
                  <br />
                  • <strong>GSTIN:</strong> <code>supplier_gstin</code>, <code>Vendor GSTIN</code>, <code>gstin</code>
                  <br />
                  • <strong>Amounts:</strong> <code>taxable_value</code>, <code>total_tax</code>, <code>gross_amount</code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Single File */}
          {activeTab === 'single_file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                Upload an existing <strong>Audit Register or Previous Export CSV</strong> containing reconciled invoice status,
                IRN tags, and AP leverage tiers.
              </div>

              <input
                type="file"
                ref={singleInputRef}
                accept=".csv,.txt"
                style={{ display: 'none' }}
                onChange={handleSingleSelect}
              />
              <div
                onClick={() => singleInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSingle(true);
                }}
                onDragLeave={() => setDragOverSingle(false)}
                onDrop={handleDropSingle}
                style={{
                  border: `2px dashed ${dragOverSingle ? '#9F6FF0' : singleFile ? '#10b981' : 'var(--navy-border, #374151)'}`,
                  borderRadius: '12px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: singleFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {singleFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={32} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{singleFile.name}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {(singleFile.size / 1024).toFixed(1)} KB · {singleFile.count} invoices detected
                    </span>
                    <span style={{ fontSize: '11px', color: '#9F6FF0', marginTop: '4px' }}>Click to replace</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={32} color="#94a3b8" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
                      Drop Reconciled / Export CSV here
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>or click to browse file from device</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Templates & Quick Load */}
          {activeTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                Test the upload system immediately using pre-formatted sample datasets or download blank templates for your accounting team.
              </div>

              {/* Quick Load Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(159, 111, 240, 0.12), rgba(124, 58, 237, 0.05))',
                  border: '1px solid rgba(159, 111, 240, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff', fontSize: '13px' }}>
                    <Sparkles size={16} color="#B794F6" />
                    Load Sample Retail Dataset (10 Invoices)
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Pre-populated with 6 GSTR-2B matches and 4 discrepancies (Safe to Hold, Watch, Chase Now) for testing.
                  </p>
                </div>
                <button
                  onClick={handleLoadSampleDataset}
                  style={{
                    background: '#9F6FF0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Load Sample <ArrowRight size={13} />
                </button>
              </div>

              {/* Template Downloads */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '4px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--navy-border, #1f2937)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Purchase Register Template</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Standard invoice register headers
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile('purchase_register_template.csv', getSamplePrCsv())}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--navy-border, #374151)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={12} /> Download CSV
                  </button>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--navy-border, #1f2937)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>GSTR-2B Template</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Portal return filing format
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile('gstr2b_template.csv', getSampleGstr2bCsv())}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--navy-border, #374151)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={12} /> Download CSV
                  </button>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--navy-border, #1f2937)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Reconciled Audit Template</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Complete 15-column format
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile('reconciled_audit_template.csv', getSampleReconciledCsv())}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--navy-border, #374151)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={12} /> Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--navy-border, #1f2937)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--navy-border, #374151)',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          {activeTab === 'two_files' && (
            <button
              onClick={handleProcessTwoFiles}
              disabled={!prFile || isProcessing}
              style={{
                background: !prFile || isProcessing ? '#4b5563' : '#9F6FF0',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: !prFile || isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: prFile && !isProcessing ? '0 4px 14px rgba(159, 111, 240, 0.4)' : 'none',
              }}
            >
              <Upload size={14} />
              {isProcessing ? 'Reconciling...' : 'Apply & Reconcile Data'}
            </button>
          )}

          {activeTab === 'single_file' && (
            <button
              onClick={handleProcessSingleFile}
              disabled={!singleFile || isProcessing}
              style={{
                background: !singleFile || isProcessing ? '#4b5563' : '#9F6FF0',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: !singleFile || isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: singleFile && !isProcessing ? '0 4px 14px rgba(159, 111, 240, 0.4)' : 'none',
              }}
            >
              <Upload size={14} />
              {isProcessing ? 'Processing...' : 'Apply Reconciled Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
