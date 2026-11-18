import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import type { Bucket, ReconciledInvoice } from './types';
import { computeKpis, exportInvoicesToCsv, getDaysToStatutoryCutoff, reconcileDataset } from './utils';
import { generateSyntheticDataset } from './data';
import { calculateRoutingScore } from './scoring';
import { getApiBaseUrl } from './config';
import { useTinyFish } from './hooks/useTinyFish';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterBar } from './components/FilterBar';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailPanel } from './components/InvoiceDetailPanel';
import { MlBacktestModal } from './components/MlBacktestModal';
import { ProjectOverview } from './components/ProjectOverview';
import { UploadDataModal } from './components/UploadDataModal';
import { TinyFishArbitraryModal } from './components/TinyFishArbitraryModal';
import { computeInvoiceMlForecast } from './mlForecaster';
import { AiChatDrawer } from './components/AiChatDrawer';

export function App() {
  const [initialReconciled, setInitialReconciled] = useState<ReconciledInvoice[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  // Unified single page architecture: Welcome and Overview merged into single view
  // const [showWelcome, setShowWelcome] = useState(false);

  // View state: 'overview' (Judge pitch landing) or 'dashboard' (Interactive triage console)
  const [activeView, setActiveView] = useState<'overview' | 'dashboard'>('dashboard');

  // Custom data upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCustomDataActive, setIsCustomDataActive] = useState(false);
  const [customDataInfo, setCustomDataInfo] = useState<{
    name: string;
    total: number;
    matched: number;
    unmatched: number;
  } | null>(null);

  // Routing and modal state
  const [isRouted, setIsRouted] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ReconciledInvoice | null>(null);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
  const [isTinyFishModalOpen, setIsTinyFishModalOpen] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<'ALL' | Bucket>('ALL');
  const [matchFilter, setMatchFilter] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');
  const [irnFilter, setIrnFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [apFilter, setApFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [patternFilter, setPatternFilter] = useState<'ALL' | 'HABITUAL LAGGARD' | 'NORMAL/PUNCTUAL' | 'NEW ANOMALY'>('ALL');

  // Sort states
  const [sortField, setSortField] = useState<'taxAmount' | 'score' | 'invoiceDate' | 'vendorName'>('taxAmount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // TinyFish Hook
  const tinyFish = useTinyFish();

  // Fetch server-side reconciled invoices from FastAPI backend with seamless fallback and auto-retry for Render spin-up
  const fetchServerReconciled = async (isRetry = false) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/reconciled-invoices`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid format');
      setInitialReconciled(data);
      setServerError(null);
    } catch (err: any) {
      if (!isRetry) {
        console.warn('Backend server unreachable; using high-fidelity local dataset fallback while server warms up.', err);
        // Graceful fallback guarantees live interactive UI immediately
        const baseData = generateSyntheticDataset(42);
        const fallbackData = reconcileDataset(baseData);
        setInitialReconciled(fallbackData);
        setServerError('Connecting to backend (waking up cloud server if idle)...');

        // Retry polling in case Render free instance was asleep (takes ~30-45s to wake)
        setTimeout(() => fetchServerReconciled(true), 6000);
        setTimeout(() => fetchServerReconciled(true), 18000);
        setTimeout(() => fetchServerReconciled(true), 35000);
      }
    }
  };

  useEffect(() => {
    // Immediate lightweight health ping to wake up sleeping Render instance as soon as page opens
    fetch(`${getApiBaseUrl()}/api/health`).catch(() => {});
    fetchServerReconciled();
  }, []);

  // Enriched invoices with server-side routing or client fallback scoring
  const enrichedInvoices = useMemo(() => {
    return initialReconciled.map((inv) => {
      const liveIrnCheck = tinyFish.irnApplicabilityMap.get(inv.id);
      const vendorLookup = tinyFish.vendorLookupMap.get(inv.id);
      const effectiveIrnState = vendorLookup?.irn_state;
      const daysToCutoff = getDaysToStatutoryCutoff(inv.invoiceDate);
      const mlForecast = computeInvoiceMlForecast(inv, daysToCutoff);

      // If routed and unbucketed (or live TinyFish override applied)
      if (!inv.matchResult.matched && isRouted && (!inv.routingBucket || liveIrnCheck || effectiveIrnState)) {
        const scoreExp = calculateRoutingScore(
          inv.irnRecord.irnPresent,
          inv.leverageTier,
          inv.vendor.filingPattern,
          liveIrnCheck?.status,
          effectiveIrnState,
          daysToCutoff
        );
        return {
          ...inv,
          scoreExplanation: scoreExp,
          routingBucket: scoreExp.bucket,
          irnApplicability: liveIrnCheck,
          vendorIrnLookup: vendorLookup,
          whyThisLabel: vendorLookup?.why_this_label || inv.whyThisLabel,
          mlForecast,
        };
      }

      return {
        ...inv,
        irnApplicability: liveIrnCheck,
        vendorIrnLookup: vendorLookup,
        whyThisLabel: vendorLookup?.why_this_label || inv.whyThisLabel,
        mlForecast,
      };
    });
  }, [initialReconciled, isRouted, tinyFish.irnApplicabilityMap, tinyFish.vendorLookupMap]);

  // Overall KPIs computed from invoices
  const kpis = useMemo(() => computeKpis(enrichedInvoices), [enrichedInvoices]);

  // Filtered & Sorted Invoices
  const displayedInvoices = useMemo(() => {
    return enrichedInvoices
      .filter((inv) => {
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchNo = inv.invoiceNumber.toLowerCase().includes(q);
          const matchVendor = inv.vendorName.toLowerCase().includes(q);
          const matchGstin = inv.gstin.toLowerCase().includes(q);
          if (!matchNo && !matchVendor && !matchGstin) return false;
        }

        if (isRouted) {
          if (matchFilter === 'MATCHED' && !inv.matchResult.matched) return false;
          if (matchFilter === 'UNMATCHED' && inv.matchResult.matched) return false;
          if (bucketFilter !== 'ALL' && inv.routingBucket !== bucketFilter) return false;
        }
        if (irnFilter === 'PRESENT' && !inv.irnRecord.irnPresent) return false;
        if (irnFilter === 'ABSENT' && inv.irnRecord.irnPresent) return false;
        if (apFilter !== 'ALL' && inv.leverageTier !== apFilter) return false;
        if (patternFilter !== 'ALL' && inv.vendor.filingPattern !== patternFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'taxAmount') {
          cmp = a.taxAmount - b.taxAmount;
        } else if (sortField === 'score') {
          const scoreA = a.scoreExplanation?.clampedScore ?? -1;
          const scoreB = b.scoreExplanation?.clampedScore ?? -1;
          cmp = scoreA - scoreB;
        } else if (sortField === 'invoiceDate') {
          cmp = a.invoiceDate.localeCompare(b.invoiceDate);
        } else if (sortField === 'vendorName') {
          cmp = a.vendorName.localeCompare(b.vendorName);
        }
        return sortDirection === 'desc' ? -cmp : cmp;
      });
  }, [
    enrichedInvoices,
    searchQuery,
    matchFilter,
    bucketFilter,
    irnFilter,
    apFilter,
    patternFilter,
    sortField,
    sortDirection,
  ]);

  const handleReset = () => {
    setIsRouted(false);
    setIsRouting(false);
    setSelectedInvoice(null);
    setSearchQuery('');
    setBucketFilter('ALL');
    setMatchFilter('ALL');
    setIrnFilter('ALL');
    setApFilter('ALL');
    setPatternFilter('ALL');
    tinyFish.handleResetAll();
    fetchServerReconciled();
  };

  const handleResetToDemo = () => {
    setIsCustomDataActive(false);
    setCustomDataInfo(null);
    handleReset();
  };

  const handleDataLoaded = (
    invoices: ReconciledInvoice[],
    sourceInfo: { name: string; total: number; matched: number; unmatched: number }
  ) => {
    setIsCustomDataActive(true);
    setCustomDataInfo(sourceInfo);
    setInitialReconciled(invoices);
    setIsRouted(true);
    setSelectedInvoice(null);
    setSearchQuery('');
    setBucketFilter('ALL');
    setMatchFilter(sourceInfo.unmatched > 0 ? 'UNMATCHED' : 'ALL');
    setIrnFilter('ALL');
    setApFilter('ALL');
    setPatternFilter('ALL');
    setActiveView('dashboard');
  };

  const handleRunRouting = async () => {
    setIsRouting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices: initialReconciled }),
      });
      if (res.ok) {
        const data = await res.json();
        setInitialReconciled(data.invoices);
        setIsRouted(true);
        setMatchFilter('UNMATCHED');
        return;
      }
      throw new Error(`Server status ${res.status}`);
    } catch (err: any) {
      console.warn('Server pipeline call bypassed; executing client triage engine.', err);
      // Seamlessly execute triage locally so demo never fails
      setIsRouted(true);
      setMatchFilter('UNMATCHED');
    } finally {
      setIsRouting(false);
    }
  };

  const handleSwitchView = (newView: 'overview' | 'dashboard') => {
    if (newView === 'dashboard' && activeView !== 'dashboard') {
      handleReset();
    }
    setActiveView(newView);
  };

  const handleSelectQuickDemo = (scenario: 'safe' | 'chase' | 'tinyfish') => {
    handleRunRouting().then(() => {
      setActiveView('dashboard');
      if (scenario === 'safe') {
        setBucketFilter('SAFE TO HOLD');
        const inv = enrichedInvoices.find((i) => i.invoiceNumber.includes('0412'));
        if (inv) setSelectedInvoice(inv);
      } else if (scenario === 'chase') {
        setBucketFilter('CHASE NOW');
        const inv = enrichedInvoices.find((i) => i.invoiceNumber.includes('5561'));
        if (inv) setSelectedInvoice(inv);
      } else if (scenario === 'tinyfish') {
        setBucketFilter('WATCH');
        const inv = enrichedInvoices.find((i) => !i.matchResult.matched && !i.irnRecord.irnPresent);
        if (inv) setSelectedInvoice(inv);
      }
    });
  };

  const handleExportCsv = () => {
    exportInvoicesToCsv(displayedInvoices);
  };

  const currentSelectedInvoice = useMemo(() => {
    if (!selectedInvoice) return null;
    return enrichedInvoices.find((i) => i.id === selectedInvoice.id) || selectedInvoice;
  }, [selectedInvoice, enrichedInvoices]);


  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <DashboardHeader
        wf1Status={tinyFish.wf1Status}
        apiConnected={!serverError && tinyFish.apiConnected}
        isRouted={isRouted}
        isRouting={isRouting}
        onReset={handleReset}
        onOpenBacktestModal={() => setIsBacktestModalOpen(true)}
        onExportCsv={handleExportCsv}
        onRunRouting={handleRunRouting}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isCustomDataActive={isCustomDataActive}
        customDataName={customDataInfo?.name}
        onResetToDemo={handleResetToDemo}
        onOpenTinyFishModal={() => setIsTinyFishModalOpen(true)}
        showSynopsis={showSynopsis}
        setShowSynopsis={setShowSynopsis}
        activeView={activeView}
        onViewChange={handleSwitchView}
        kpis={kpis}
        matchFilter={matchFilter}
        setMatchFilter={setMatchFilter}
        bucketFilter={bucketFilter}
        setBucketFilter={setBucketFilter}
      />

      {activeView === 'overview' ? (
        <ProjectOverview
          onLaunchDemo={() => {
            handleReset();
            setActiveView('dashboard');
          }}
          onOpenBacktestModal={() => setIsBacktestModalOpen(true)}
          onSelectQuickDemo={handleSelectQuickDemo}
          kpis={kpis}
        />
      ) : (
        <>
          {!isRouted && (
            <div
              style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--navy-border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-blue)',
                    flexShrink: 0,
                  }}
                >
                  <Play size={18} fill="currentColor" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    Step 1: Execute 3-Signal Pipeline Routing
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--navy-muted)', marginTop: '3px', lineHeight: 1.5 }}>
                    200 Purchase records loaded (170 Matched, 30 Discrepancies). Click below to triage unmatched invoices by <strong>IRN Footprint</strong>, <strong>AP Retention Leverage</strong>, and <strong>Filing Periodicity</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRunRouting}
                disabled={isRouting}
                className="sovereign-btn-primary"
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  height: '40px',
                  padding: '0 22px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  cursor: isRouting ? 'not-allowed' : 'pointer',
                  opacity: isRouting ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                <Play size={14} fill="#090A0C" />
                {isRouting ? 'Executing Pipeline...' : 'Run Pipeline Routing (1-Click)'}
              </button>
            </div>
          )}

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            bucketFilter={bucketFilter}
            setBucketFilter={setBucketFilter}
            irnFilter={irnFilter}
            setIrnFilter={setIrnFilter}
            apFilter={apFilter}
            setApFilter={setApFilter}
            patternFilter={patternFilter}
            setPatternFilter={setPatternFilter}
            displayedCount={displayedInvoices.length}
            totalCount={enrichedInvoices.length}
            isRouted={isRouted}
          />

          <InvoiceTable
            invoices={displayedInvoices}
            isRouted={isRouted}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onSelect={(inv) => setSelectedInvoice(inv)}
          />
        </>
      )}

      <InvoiceDetailPanel
        invoice={currentSelectedInvoice}
        isRouted={isRouted}
        onClose={() => setSelectedInvoice(null)}
        tinyFishResult={tinyFish.tinyFishResult}
        tinyFishLoading={tinyFish.tinyFishLoading}
        handleVerifyVendor={tinyFish.handleVerifyVendor}
        userTurnoverBand={tinyFish.userTurnoverBand}
        setUserTurnoverBand={tinyFish.setUserTurnoverBand}
        userTxnType={tinyFish.userTxnType}
        setUserTxnType={tinyFish.setUserTxnType}
        irnCheckingId={tinyFish.irnCheckingId}
        handleCheckIrnApplicability={tinyFish.handleCheckIrnApplicability}
        handleResetIrnCheck={tinyFish.handleResetIrnCheck}
        vendorLookupCheckingId={tinyFish.vendorLookupCheckingId}
        simFailureMode={tinyFish.simFailureMode}
        setSimFailureMode={tinyFish.setSimFailureMode}
        handleLookupVendorIrn={tinyFish.handleLookupVendorIrn}
      />

      <MlBacktestModal
        isOpen={isBacktestModalOpen}
        onClose={() => setIsBacktestModalOpen(false)}
      />

      <TinyFishArbitraryModal
        isOpen={isTinyFishModalOpen}
        onClose={() => setIsTinyFishModalOpen(false)}
      />

      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onResetToDemo={handleResetToDemo}
        isCustomDataActive={isCustomDataActive}
        customDataName={customDataInfo?.name}
      />

      <AiChatDrawer
        invoices={enrichedInvoices}
        kpis={kpis}
        selectedInvoice={selectedInvoice}
      />
    </div>
  );
}
