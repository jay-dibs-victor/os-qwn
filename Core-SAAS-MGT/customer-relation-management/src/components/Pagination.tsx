import React, { useState, useEffect } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;          // 1-indexed
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const [inputVal, setInputVal] = useState(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    onPageChange(clamped);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed)) {
      goTo(parsed);
    } else {
      setInputVal(String(currentPage));
    }
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleInputBlur();
    else if (e.key === 'Escape') setInputVal(String(currentPage));
  };

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      {/* ── LEFT: << < [Page input] > >> + info ── */}
      <div className="pagination-bar-left">
        <button
          className="pagination-btn"
          title="First page"
          disabled={currentPage === 1}
          onClick={() => goTo(1)}
        >
          <ChevronsLeft size={13} />
        </button>

        <button
          className="pagination-btn"
          title="Previous page"
          disabled={currentPage === 1}
          onClick={() => goTo(currentPage - 1)}
        >
          <ChevronLeft size={13} />
        </button>

        <span className="pagination-meta" style={{ margin: '0 0.25rem' }}>Page</span>

        <input
          type="text"
          inputMode="numeric"
          className="pagination-page-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKey}
          aria-label="Current page"
        />

        <span className="pagination-meta" style={{ margin: '0 0.25rem' }}>
          of <strong>{totalPages}</strong>
        </span>

        <button
          className="pagination-btn"
          title="Next page"
          disabled={currentPage === totalPages}
          onClick={() => goTo(currentPage + 1)}
        >
          <ChevronRight size={13} />
        </button>

        <button
          className="pagination-btn"
          title="Last page"
          disabled={currentPage === totalPages}
          onClick={() => goTo(totalPages)}
        >
          <ChevronsRight size={13} />
        </button>

        <span className="pagination-meta" style={{ marginLeft: '0.5rem' }}>
          {totalItems === 0 ? 'No records' : `${start}–${end} of ${totalItems}`}
        </span>
      </div>

      {/* ── RIGHT: Rows per page select ── */}
      <div className="pagination-bar-right">
        <span className="pagination-meta">Rows per page</span>
        <select
          className="pagination-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Page size"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option
              key={size}
              value={size}
              style={{ background: '#0e0e0e', color: '#fff', fontWeight: 'bold' }}
            >
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
