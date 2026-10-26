import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Bucket, PipelineSummary, ReconciledInvoice } from './types';
import { exportInvoicesToCsv } from './utils';
import { getApiBaseUrl } from './config';
import { useTinyFish } from './hooks/useTinyFish';
import { getFallbackDemoData } from './demoFallback';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterBar } from './components/FilterBar';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailPanel } from './components/InvoiceDetailPanel';
import { MlBacktestModal } from './components/MlBacktestModal';
import { WelcomePage } from './components/WelcomePage';
import { ProjectOverview } from './components/ProjectOverview';
import { UploadDataModal } from './components/UploadDataModal';
import { TinyFishArbitraryModal } from './components/TinyFishArbitraryModal';

const PAGE_SIZE = 100;

interface DatasetResponse {
  session_id: string;
  source: string;
  scored: boolean;
  summary: PipelineSummary;
  total: number;
  invoices: ReconciledInvoice[];
}

async function readResponse(response: Response): Promise<DatasetResponse> {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(typeof body.detail === 'string' ? body.detail : `Backend returned ${response.status}.`);
  }
  return body as DatasetResponse;
}

const initialDemo = getFallbackDemoData(
  false,
  0,
  PAGE_SIZE,
  '',
  'ALL',
  'ALL',
  'ALL',
  'ALL',
  'ALL',
  'taxAmount',
  'desc',
);

export function App() {
  const [invoices, setInvoices] = useState<ReconciledInvoice[]>(initialDemo.invoices);
  const [summary, setSummary] = useState<PipelineSummary>(initialDemo.summary);
  const [sessionId, setSessionId] = useState('demo');
  const [filteredTotal, setFilteredTotal] = useState(initialDemo.total);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'dashboard'>('overview');
  const [showSynopsis, setShowSynopsis] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCustomDataActive, setIsCustomDataActive] = useState(false);
  const [customDataName, setCustomDataName] = useState<string>();
  const [isRouted, setIsRouted] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ReconciledInvoice | null>(null);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
  const [isTinyFishModalOpen, setIsTinyFishModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<'ALL' | Bucket>('ALL');
  const [matchFilter, setMatchFilter] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');
  const [irnFilter, setIrnFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [apFilter, setApFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [patternFilter, setPatternFilter] = useState<'ALL' | 'HABITUAL LAGGARD' | 'NORMAL/PUNCTUAL' | 'NEW ANOMALY'>('ALL');
  const [sortField, setSortField] = useState<'taxAmount' | 'score' | 'invoiceDate' | 'vendorName'>('taxAmount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const tinyFish = useTinyFish();

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      session_id: sessionId,
      offset: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      search: searchQuery,
      bucket: bucketFilter === 'ALL' ? '' : bucketFilter,
      match: matchFilter,
      irn: irnFilter,
      ap: apFilter,
      pattern: patternFilter === 'ALL' ? '' : patternFilter,
      sort: sortField,
      direction: sortDirection,
    });
    fetch(`${getApiBaseUrl()}/api/model/invoices?${params}`, { signal: controller.signal })
      .then(readResponse)
      .then((data) => {
        setInvoices(data.invoices);
        setFilteredTotal(data.total);
        setSummary(data.summary);
        setIsRouted(data.scored || data.source === 'user_upload');
        setServerError(null);
        setIsBackendOnline(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setIsBackendOnline(false);
        if (sessionId === 'demo') {
          const fallback = getFallbackDemoData(
            isRouted,
            page,
            PAGE_SIZE,
            searchQuery,
            bucketFilter,
            matchFilter,
            irnFilter,
            apFilter,
            patternFilter,
            sortField,
            sortDirection,
          );
          setInvoices(fallback.invoices);
          setFilteredTotal(fallback.total);
          setSummary(fallback.summary);
          setServerError(null);
        } else {
          setServerError(error instanceof Error ? error.message : 'Could not load invoice data.');
        }
      });
    return () => controller.abort();
  }, [sessionId, page, searchQuery, bucketFilter, matchFilter, irnFilter, apFilter, patternFilter, sortField, sortDirection, isRouted]);

  const enrichedInvoices = useMemo(
    () => invoices.map((invoice) => ({
      ...invoice,
      irnApplicability: tinyFish.irnApplicabilityMap.get(invoice.id),
      vendorIrnLookup: tinyFish.vendorLookupMap.get(invoice.id),
    })),
    [invoices, tinyFish.irnApplicabilityMap, tinyFish.vendorLookupMap],
  );

  const currentSelectedInvoice = useMemo(
    () => enrichedInvoices.find((invoice) => invoice.id === selectedInvoice?.id) ?? selectedInvoice,
    [enrichedInvoices, selectedInvoice],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setBucketFilter('ALL');
    setMatchFilter('ALL');
    setIrnFilter('ALL');
    setApFilter('ALL');
    setPatternFilter('ALL');
    setPage(0);
  };

  const handleResetToDemo = () => {
    setIsCustomDataActive(false);
    setCustomDataName(undefined);
    setSessionId('demo');
    setIsRouted(false);
    setSelectedInvoice(null);
    resetFilters();
    tinyFish.handleResetAll();
    if (isBackendOnline === false) {
      const fallback = getFallbackDemoData(
        false,
        0,
        PAGE_SIZE,
        '',
        'ALL',
        'ALL',
        'ALL',
        'ALL',
        'ALL',
        'taxAmount',
        'desc',
      );
      setInvoices(fallback.invoices);
      setFilteredTotal(fallback.total);
      setSummary(fallback.summary);
    }
  };

  const handleDataLoaded = (data: DatasetResponse, name: string) => {
    setIsCustomDataActive(true);
    setCustomDataName(name);
    setSessionId(data.session_id);
    setSummary(data.summary);
    setInvoices(data.invoices);
    setFilteredTotal(data.total);
    setIsRouted(true);
    setSelectedInvoice(null);
    resetFilters();
    setActiveView('dashboard');
  };

  const handleRunRouting = async () => {
    setIsRouting(true);
    setServerError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/model/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCustomDataActive ? { session_id: sessionId } : {}),
      });
      const data = await readResponse(response);
      setSessionId(data.session_id);
      setSummary(data.summary);
      setInvoices(data.invoices);
      setFilteredTotal(data.total);
      setIsRouted(true);
      setPage(0);
      setMatchFilter('ALL');
      setIsBackendOnline(true);
    } catch (error) {
      if (sessionId === 'demo') {
        setIsRouted(true);
        setPage(0);
        setMatchFilter('ALL');
        const fallback = getFallbackDemoData(
          true,
          0,
          PAGE_SIZE,
          searchQuery,
          bucketFilter,
          'ALL',
          irnFilter,
          apFilter,
          patternFilter,
          sortField,
          sortDirection,
        );
        setInvoices(fallback.invoices);
        setFilteredTotal(fallback.total);
        setSummary(fallback.summary);
        setServerError(null);
        setIsBackendOnline(false);
      } else {
        setServerError(error instanceof Error ? error.message : 'Pipeline could not run.');
      }
    } finally {
      setIsRouting(false);
    }
  };

  const handleExportCsv = () => exportInvoicesToCsv(enrichedInvoices);
  const updatePageFilter = useCallback((update: () => void) => {
    setPage(0);
    update();
  }, []);

  if (showWelcome) {
    return <WelcomePage onExplore={() => setShowWelcome(false)} />;
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <DashboardHeader
        apiConnected={isBackendOnline ?? (!serverError && tinyFish.apiConnected)}
        isRouted={isRouted}
        isRouting={isRouting}
        onReset={handleResetToDemo}
        onOpenBacktestModal={() => setIsBacktestModalOpen(true)}
        onExportCsv={handleExportCsv}
        onRunRouting={handleRunRouting}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isCustomDataActive={isCustomDataActive}
        customDataName={customDataName}
        onResetToDemo={handleResetToDemo}
        onOpenTinyFishModal={() => setIsTinyFishModalOpen(true)}
        showSynopsis={showSynopsis}
        setShowSynopsis={setShowSynopsis}
        activeView={activeView}
        onViewChange={setActiveView}
        summary={summary}
        matchFilter={matchFilter}
        setMatchFilter={(value) => updatePageFilter(() => setMatchFilter(value))}
      />

      {serverError && (
        <div role="alert" style={{ padding: '12px 16px', border: '1px solid #f87171', borderRadius: 8, color: '#fecaca' }}>
          Backend unavailable: {serverError}
        </div>
      )}

      {activeView === 'overview' ? (
        <ProjectOverview
          summary={summary}
          onLaunchDemo={() => setActiveView('dashboard')}
          onOpenBacktestModal={() => setIsBacktestModalOpen(true)}
        />
      ) : (
        <>
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={(value) => updatePageFilter(() => setSearchQuery(value))}
            bucketFilter={bucketFilter}
            setBucketFilter={(value) => updatePageFilter(() => setBucketFilter(value))}
            irnFilter={irnFilter}
            setIrnFilter={(value) => updatePageFilter(() => setIrnFilter(value))}
            apFilter={apFilter}
            setApFilter={(value) => updatePageFilter(() => setApFilter(value))}
            patternFilter={patternFilter}
            setPatternFilter={(value) => updatePageFilter(() => setPatternFilter(value))}
            displayedCount={enrichedInvoices.length}
            totalCount={filteredTotal}
            isRouted={isRouted}
          />

          <InvoiceTable
            invoices={enrichedInvoices}
            isRouted={isRouted}
            sortField={sortField}
            setSortField={(value) => updatePageFilter(() => setSortField(value))}
            sortDirection={sortDirection}
            setSortDirection={(value) => updatePageFilter(() => setSortDirection(value))}
            onSelect={setSelectedInvoice}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 0', color: 'var(--navy-muted)', fontSize: 12 }}>
            <button disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid var(--navy-border)', color: '#cbd5e1', fontSize: 12, fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? .5 : 1 }}>Previous</button>
            <span>Page {page + 1} · {filteredTotal.toLocaleString()} matching invoices</span>
            <button disabled={(page + 1) * PAGE_SIZE >= filteredTotal} onClick={() => setPage((value) => value + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'linear-gradient(135deg, #9F6FF0, #7C3AED)', border: '1px solid rgba(159,111,240,.4)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: (page + 1) * PAGE_SIZE >= filteredTotal ? 'not-allowed' : 'pointer', opacity: (page + 1) * PAGE_SIZE >= filteredTotal ? .5 : 1 }}>Next</button>
          </div>
        </>
      )}

      <InvoiceDetailPanel
        invoice={currentSelectedInvoice}
        isRouted={isRouted}
        onClose={() => setSelectedInvoice(null)}
      />
      <MlBacktestModal isOpen={isBacktestModalOpen} onClose={() => setIsBacktestModalOpen(false)} />
      <TinyFishArbitraryModal isOpen={isTinyFishModalOpen} onClose={() => setIsTinyFishModalOpen(false)} />
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onResetToDemo={handleResetToDemo}
        isCustomDataActive={isCustomDataActive}
        customDataName={customDataName}
      />
    </div>
  );
}
