import { useEffect, useMemo, useState } from 'react';
import type { Bucket, ReconciledInvoice } from './types';
import { computeKpis, exportInvoicesToCsv, reconcileDataset } from './utils';
import { generateSyntheticDataset } from './data';
import { calculateRoutingScore } from './scoring';
import { getApiBaseUrl } from './config';
import { useTinyFish } from './hooks/useTinyFish';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterBar } from './components/FilterBar';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailPanel } from './components/InvoiceDetailPanel';
import { MlBacktestModal } from './components/MlBacktestModal';
import { WelcomePage } from './components/WelcomePage';
import { ProjectOverview } from './components/ProjectOverview';

export function App() {
  const [initialReconciled, setInitialReconciled] = useState<ReconciledInvoice[]>([]);
  const [serverLoading, setServerLoading] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // View state: 'overview' (Judge pitch landing) or 'dashboard' (Interactive triage console)
  const [activeView, setActiveView] = useState<'overview' | 'dashboard'>('overview');

  // Routing and modal state
  const [isRouted, setIsRouted] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ReconciledInvoice | null>(null);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(true);

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

  // Fetch server-side reconciled invoices from FastAPI backend with seamless fallback
  const fetchServerReconciled = async () => {
    setServerLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/reconciled-invoices`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid format');
      setInitialReconciled(data);
      setServerError(null);
    } catch (err: any) {
      console.warn('Backend server unreachable; using high-fidelity local dataset fallback.', err);
      // Graceful fallback guarantees live interactive UI
      const baseData = generateSyntheticDataset(42);
      const fallbackData = reconcileDataset(baseData);
      setInitialReconciled(fallbackData);
      setServerError('Running in Standalone Demo Mode (Backend serverless initializing or offline).');
    } finally {
      setServerLoading(false);
    }
  };

  useEffect(() => {
    fetchServerReconciled();
  }, []);

  // Enriched invoices with server-side routing or client fallback scoring
  const enrichedInvoices = useMemo(() => {
    return initialReconciled.map((inv) => {
      const liveIrnCheck = tinyFish.irnApplicabilityMap.get(inv.id);
      const vendorLookup = tinyFish.vendorLookupMap.get(inv.id);
      const effectiveIrnState = vendorLookup?.irn_state;

      // If routed and unbucketed (or live TinyFish override applied)
      if (!inv.matchResult.matched && isRouted && (!inv.routingBucket || liveIrnCheck || effectiveIrnState)) {
        const scoreExp = calculateRoutingScore(
          inv.irnRecord.irnPresent,
          inv.leverageTier,
          inv.vendor.filingPattern,
          liveIrnCheck?.status,
          effectiveIrnState
        );
        return {
          ...inv,
          scoreExplanation: scoreExp,
          routingBucket: scoreExp.bucket,
          irnApplicability: liveIrnCheck,
          vendorIrnLookup: vendorLookup,
          whyThisLabel: vendorLookup?.why_this_label || inv.whyThisLabel,
        };
      }

      return {
        ...inv,
        irnApplicability: liveIrnCheck,
        vendorIrnLookup: vendorLookup,
        whyThisLabel: vendorLookup?.why_this_label || inv.whyThisLabel,
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

        if (matchFilter === 'MATCHED' && !inv.matchResult.matched) return false;
        if (matchFilter === 'UNMATCHED' && inv.matchResult.matched) return false;
        if (bucketFilter !== 'ALL' && inv.routingBucket !== bucketFilter) return false;
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

  if (showWelcome) {
    return <WelcomePage onExplore={() => setShowWelcome(false)} />;
  }

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
        showSynopsis={showSynopsis}
        setShowSynopsis={setShowSynopsis}
        activeView={activeView}
        onViewChange={handleSwitchView}
        kpis={kpis}
        matchFilter={matchFilter}
        setMatchFilter={setMatchFilter}
      />

      {serverError && (
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span>
              <strong>Standalone Interactive Mode:</strong> The dashboard is fully functional with live 3-signal triage. Server API connection can be refreshed at any time.
            </span>
          </div>
          <button
            onClick={fetchServerReconciled}
            disabled={serverLoading}
            style={{
              padding: '6px 14px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #fbbf24',
              color: '#fbbf24',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: serverLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {serverLoading ? 'Reconnecting...' : 'Refresh Server'}
          </button>
        </div>
      )}

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
          />

          <InvoiceTable
            invoices={displayedInvoices}
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
    </div>
  );
}
