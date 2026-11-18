import { useState } from 'react';
import { AlertTriangle, Eye, HelpCircle, PauseCircle, RotateCcw, Search, X } from 'lucide-react';
import type { Bucket } from '../types';

export interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  bucketFilter: 'ALL' | Bucket;
  setBucketFilter: (val: 'ALL' | Bucket) => void;
  irnFilter: 'ALL' | 'PRESENT' | 'ABSENT';
  setIrnFilter: (val: 'ALL' | 'PRESENT' | 'ABSENT') => void;
  apFilter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  setApFilter: (val: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  patternFilter: 'ALL' | 'HABITUAL LAGGARD' | 'NORMAL/PUNCTUAL' | 'NEW ANOMALY';
  setPatternFilter: (val: 'ALL' | 'HABITUAL LAGGARD' | 'NORMAL/PUNCTUAL' | 'NEW ANOMALY') => void;
  displayedCount: number;
  totalCount: number;
  isRouted?: boolean;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  bucketFilter,
  setBucketFilter,
  irnFilter,
  setIrnFilter,
  apFilter,
  setApFilter,
  patternFilter,
  setPatternFilter,
  displayedCount,
  totalCount,
  isRouted = false,
}: FilterBarProps) {
  const [showHelper, setShowHelper] = useState(false);

  const isFiltered =
    searchQuery !== '' ||
    bucketFilter !== 'ALL' ||
    irnFilter !== 'ALL' ||
    apFilter !== 'ALL' ||
    patternFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setBucketFilter('ALL');
    setIrnFilter('ALL');
    setApFilter('ALL');
    setPatternFilter('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div
      style={{
        background: 'var(--navy-card)',
        border: '1px solid var(--navy-border)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Left: Search Input + Quick Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
      {/* Search Input with quick clear */}
      <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '11px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--navy-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          aria-label="Filter invoices by invoice number, vendor name, or GSTIN"
          placeholder="Filter invoice #, supplier name, GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 30px 8px 34px',
            borderRadius: '8px',
            background: 'var(--navy-bg)',
            fontSize: '12px',
            outline: 'none',
            color: 'var(--navy-text)',
            border: '1px solid var(--navy-border)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--navy-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
            title="Clear search" aria-label="Clear search query"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Quick Bucket Pills */}
      {isRouted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setBucketFilter('ALL')}
            style={{
              padding: '0 14px',
              height: '34px',
              borderRadius: '8px',
              justifyContent: 'center',
              boxSizing: 'border-box',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: bucketFilter === 'ALL' ? '1px solid var(--accent-blue)' : '1px solid var(--navy-border)',
              background: bucketFilter === 'ALL' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              color: bucketFilter === 'ALL' ? '#FFFFFF' : 'var(--navy-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            All Buckets
          </button>
          <button
            onClick={() => setBucketFilter('SAFE TO HOLD')}
            style={{
              padding: '0 14px',
              height: '34px',
              borderRadius: '8px',
              justifyContent: 'center',
              boxSizing: 'border-box',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              border: bucketFilter === 'SAFE TO HOLD' ? '1px solid var(--safe-color)' : '1px solid rgba(16, 185, 129, 0.25)',
              background: bucketFilter === 'SAFE TO HOLD' ? 'var(--safe-color)' : 'var(--safe-bg)',
              color: bucketFilter === 'SAFE TO HOLD' ? '#080E1A' : 'var(--safe-light)',
              boxShadow: bucketFilter === 'SAFE TO HOLD' ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <PauseCircle size={12} />
            Safe to Hold
          </button>
          <button
            onClick={() => setBucketFilter('WATCH')}
            style={{
              padding: '0 14px',
              height: '34px',
              borderRadius: '8px',
              justifyContent: 'center',
              boxSizing: 'border-box',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              border: bucketFilter === 'WATCH' ? '1px solid var(--watch-color)' : '1px solid rgba(245, 158, 11, 0.25)',
              background: bucketFilter === 'WATCH' ? 'var(--watch-color)' : 'var(--watch-bg)',
              color: bucketFilter === 'WATCH' ? '#080E1A' : 'var(--watch-light)',
              boxShadow: bucketFilter === 'WATCH' ? '0 2px 8px rgba(245, 158, 11, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Eye size={12} />
            Watch List
          </button>
          <button
            onClick={() => setBucketFilter('CHASE NOW')}
            style={{
              padding: '0 14px',
              height: '34px',
              borderRadius: '8px',
              justifyContent: 'center',
              boxSizing: 'border-box',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              border: bucketFilter === 'CHASE NOW' ? '1px solid var(--chase-color)' : '1px solid rgba(239, 68, 68, 0.25)',
              background: bucketFilter === 'CHASE NOW' ? 'var(--chase-color)' : 'var(--chase-bg)',
              color: bucketFilter === 'CHASE NOW' ? '#FFFFFF' : 'var(--chase-light)',
              boxShadow: bucketFilter === 'CHASE NOW' ? '0 2px 8px rgba(239, 68, 68, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <AlertTriangle size={12} />
            Chase Now
          </button>
        </div>
      )}
      </div>

      {/* Dropdown Filters & Status */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        {/* Bucket Filter */}
        <select
          aria-label="Filter by triage bucket"
          value={bucketFilter}
          disabled={!isRouted}
          onChange={(e) => setBucketFilter(e.target.value as any)}
          style={{
            padding: '0 12px',
            height: '34px',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: bucketFilter !== 'ALL' ? '1px solid var(--accent-blue)' : '1px solid var(--navy-border)',
            background: bucketFilter !== 'ALL' ? 'rgba(255, 255, 255, 0.08)' : 'var(--navy-bg)',
            color: !isRouted ? 'var(--navy-muted)' : bucketFilter !== 'ALL' ? 'var(--accent-primary)' : 'inherit',
            fontSize: '11px',
            fontWeight: 600,
            opacity: !isRouted ? 0.6 : 1,
            cursor: !isRouted ? 'not-allowed' : 'pointer',
          }}
          title={!isRouted ? 'Run pipeline routing to enable bucket filtering' : 'Filter by triage bucket'}
        >
          <option value="ALL">{!isRouted ? 'Buckets (Awaiting Pipeline)' : 'All Buckets'}</option>
          <option value="SAFE TO HOLD">Safe to Hold</option>
          <option value="WATCH">Watch</option>
          <option value="CHASE NOW">Chase Now</option>
        </select>

        {/* IRN Filter */}
        <select
          aria-label="Filter by IRN applicability and status"
          value={irnFilter}
          onChange={(e) => setIrnFilter(e.target.value as any)}
          style={{
            padding: '0 12px',
            height: '34px',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: irnFilter !== 'ALL' ? '1px solid var(--accent-blue)' : '1px solid var(--navy-border)',
            background: irnFilter !== 'ALL' ? 'rgba(255, 255, 255, 0.08)' : 'var(--navy-bg)',
            color: irnFilter !== 'ALL' ? 'var(--accent-primary)' : 'inherit',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <option value="ALL">Any IRN</option>
          <option value="PRESENT">IRN Present</option>
          <option value="ABSENT">IRN Absent</option>
        </select>

        {/* AP Leverage Filter */}
        <select
          aria-label="Filter by accounts payable retention leverage"
          value={apFilter}
          onChange={(e) => setApFilter(e.target.value as any)}
          style={{
            padding: '0 12px',
            height: '34px',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: apFilter !== 'ALL' ? '1px solid var(--accent-blue)' : '1px solid var(--navy-border)',
            background: apFilter !== 'ALL' ? 'rgba(255, 255, 255, 0.08)' : 'var(--navy-bg)',
            color: apFilter !== 'ALL' ? 'var(--accent-primary)' : 'inherit',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <option value="ALL">Any AP Leverage</option>
          <option value="HIGH">High Leverage (≥100%)</option>
          <option value="MEDIUM">Medium Leverage (&gt;0%)</option>
          <option value="LOW">Low Leverage (0%)</option>
        </select>

        {/* Filing Pattern Filter */}
        <select
          aria-label="Filter by vendor historical filing periodicity"
          value={patternFilter}
          onChange={(e) => setPatternFilter(e.target.value as any)}
          style={{
            padding: '0 12px',
            height: '34px',
            borderRadius: '8px',
            boxSizing: 'border-box',
            border: patternFilter !== 'ALL' ? '1px solid var(--accent-blue)' : '1px solid var(--navy-border)',
            background: patternFilter !== 'ALL' ? 'rgba(255, 255, 255, 0.08)' : 'var(--navy-bg)',
            color: patternFilter !== 'ALL' ? 'var(--accent-primary)' : 'inherit',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <option value="ALL">Any Filing Pattern</option>
          <option value="HABITUAL LAGGARD">Habitual Laggard</option>
          <option value="NORMAL/PUNCTUAL">Normal / Punctual</option>
          <option value="NEW ANOMALY">New Anomaly</option>
        </select>

        {/* Clear Filters Button if filtered */}
        {isFiltered && (
          <button
            aria-label="Reset all active filters"
            onClick={handleResetFilters}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'var(--chase-bg)',
              border: '1px solid var(--chase-border)',
              color: 'var(--chase-light)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}

        {/* Count Indicator */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--navy-muted)',
            marginLeft: '4px',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--navy-border)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <strong style={{ color: 'var(--navy-heading)' }}>{displayedCount}</strong> of {totalCount}
        </div>

        {/* How Triage Works Helper Trigger */}
        <button
          onClick={() => setShowHelper(!showHelper)}
          title="Explain how triage buckets work"
          style={{
            background: showHelper ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: '1px solid var(--navy-border)',
            borderRadius: '6px',
            color: showHelper ? 'var(--accent-blue)' : 'var(--navy-muted)',
            padding: '5px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <HelpCircle size={13} />
          {showHelper ? 'Hide Guide' : 'Triage Guide'}
        </button>
      </div>
    </div>

    {/* Expandable Friendly Triage Guide */}
    {showHelper && (
      <div
        style={{
          background: 'var(--navy-surface)',
          border: '1px solid var(--navy-border)',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--safe-color)', marginTop: '4px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--safe-light)' }}>
              Safe to Hold (Score 75–100)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              Supplier has not filed GSTR-1 yet, but your unpaid commercial balance completely covers the tax exposure. No need to harass the vendor; cash leverage hedges your risk.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--watch-color)', marginTop: '4px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--watch-light)' }}>
              Watch List (Score 40–74)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              Mixed indicators (e.g. habitual 5-day laggard or partial AP balance). Keep under observation before the monthly return cycle without souring commercial goodwill.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--chase-color)', marginTop: '4px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--chase-light)' }}>
              Chase Now (Score 0–39)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--navy-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              Critical statutory exposure! High tax amount with zero unpaid balance to retain, or vendor filing anomaly. Immediate commercial or legal escalation required before Rule 37A cutoff.
            </p>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}