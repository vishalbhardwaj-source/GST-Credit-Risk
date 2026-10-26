import { RotateCcw, Search, X } from 'lucide-react';
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
          placeholder="Filter invoice number or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 30px 8px 34px',
            borderRadius: '8px',
            border: '1px solid var(--navy-border)',
            background: 'var(--navy-bg)',
            fontSize: '12px',
            outline: 'none',
            color: '#fff',
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
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown Filters & Status */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        {/* Bucket Filter */}
        <select
          value={bucketFilter}
          disabled={!isRouted}
          onChange={(e) => setBucketFilter(e.target.value as any)}
          style={{
            padding: '7px 10px',
            borderRadius: '7px',
            border: bucketFilter !== 'ALL' ? '1px solid #B794F6' : '1px solid var(--navy-border)',
            background: bucketFilter !== 'ALL' ? 'rgba(183, 148, 246, 0.12)' : 'var(--navy-bg)',
            color: !isRouted ? 'var(--navy-muted)' : bucketFilter !== 'ALL' ? '#93c5fd' : 'inherit',
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
          value={irnFilter}
          onChange={(e) => setIrnFilter(e.target.value as any)}
          style={{
            padding: '7px 10px',
            borderRadius: '7px',
            border: irnFilter !== 'ALL' ? '1px solid #B794F6' : '1px solid var(--navy-border)',
            background: irnFilter !== 'ALL' ? 'rgba(183, 148, 246, 0.12)' : 'var(--navy-bg)',
            color: irnFilter !== 'ALL' ? '#93c5fd' : 'inherit',
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
          value={apFilter}
          onChange={(e) => setApFilter(e.target.value as any)}
          style={{
            padding: '7px 10px',
            borderRadius: '7px',
            border: apFilter !== 'ALL' ? '1px solid #B794F6' : '1px solid var(--navy-border)',
            background: apFilter !== 'ALL' ? 'rgba(183, 148, 246, 0.12)' : 'var(--navy-bg)',
            color: apFilter !== 'ALL' ? '#93c5fd' : 'inherit',
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
          value={patternFilter}
          onChange={(e) => setPatternFilter(e.target.value as any)}
          style={{
            padding: '7px 10px',
            borderRadius: '7px',
            border: patternFilter !== 'ALL' ? '1px solid #B794F6' : '1px solid var(--navy-border)',
            background: patternFilter !== 'ALL' ? 'rgba(183, 148, 246, 0.12)' : 'var(--navy-bg)',
            color: patternFilter !== 'ALL' ? '#93c5fd' : 'inherit',
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
            onClick={handleResetFilters}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
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
          <strong style={{ color: '#fff' }}>{displayedCount}</strong> of {totalCount}
        </div>
      </div>
    </div>
  );
}
