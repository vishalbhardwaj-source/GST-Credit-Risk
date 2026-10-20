import { useMemo, useState } from 'react';
import { generateSyntheticDataset } from './data';
import { calculateRoutingScore } from './scoring';
import type { Bucket, ReconciledInvoice } from './types';
import { computeKpis, exportInvoicesToCsv, reconcileDataset } from './utils';
import { useTinyFish } from './hooks/useTinyFish';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterBar } from './components/FilterBar';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailPanel } from './components/InvoiceDetailPanel';
import { MlBacktestModal } from './components/MlBacktestModal';
import { WelcomePage } from './components/WelcomePage';
import { ProjectOverview } from './components/ProjectOverview';

export function App() {
  const baseData = useMemo(() => generateSyntheticDataset(42), []);
  const initialReconciled = useMemo(() => reconcileDataset(baseData), [baseData]);
  const [showWelcome, setShowWelcome] = useState(true);

  // View state: 'overview' (Judge pitch landing) or 'dashboard' (Interactive triage console)
  const [activeView, setActiveView] = useState<'overview' | 'dashboard'>('overview');

  // Routing and modal state
  const [isRouted, setIsRouted] = useState(false);
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

  // Enriched invoices with routing and TinyFish overrides
  const enrichedInvoices = useMemo(() => {
    return initialReconciled.map((inv) => {
      const liveIrnCheck = tinyFish.irnApplicabilityMap.get(inv.id);
      const vendorLookup = tinyFish.vendorLookupMap.get(inv.id);
      const effectiveIrnState = vendorLookup?.irn_state;

      if (!inv.matchResult.matched && isRouted) {
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
          whyThisLabel: vendorLookup?.why_this_label,
        };
      }
      return {
        ...inv,
        irnApplicability: liveIrnCheck,
        vendorIrnLookup: vendorLookup,
        whyThisLabel: vendorLookup?.why_this_label,
      };
    });
  }, [initialReconciled, isRouted, tinyFish.irnApplicabilityMap, tinyFish.vendorLookupMap]);

  // Overall KPIs
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
    setSelectedInvoice(null);
    setSearchQuery('');
    setBucketFilter('ALL');
    setMatchFilter('ALL');
    setIrnFilter('ALL');
    setApFilter('ALL');
    setPatternFilter('ALL');
    tinyFish.handleResetAll();
  };

  const handleRunRouting = () => {
    setIsRouted(true);
    setMatchFilter('UNMATCHED');
  };

  const handleSwitchView = (newView: 'overview' | 'dashboard') => {
    // Whenever transitioning to dashboard from another page, reset to clean starting demo state
    if (newView === 'dashboard' && activeView !== 'dashboard') {
      handleReset();
    }
    setActiveView(newView);
  };

  const handleSelectQuickDemo = (scenario: 'safe' | 'chase' | 'tinyfish') => {
    handleRunRouting();
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
        apiConnected={tinyFish.apiConnected}
        isRouted={isRouted}
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
