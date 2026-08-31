import React, { useState, useMemo } from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
  Inbox,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import '../styles/Table.css';

/**
 * Reusable Production-Ready Responsive Data Table Component for React & Bootstrap 5
 * 
 * Features:
 * - Dynamic Column & Row Rendering
 * - Custom Cell Rendering via `col.render(value, row, index)`
 * - Bootstrap 5 Utilities & Classes (.table, .table-responsive, .table-hover, .table-striped, .table-bordered, .table-sm)
 * - Pagination with customizable page sizes (25, 50, 100)
 * - Mobile Touch Horizontal Scroll (overflow-x: auto, configurable minWidth)
 * - Loading Skeleton & Spinner States
 * - Custom Empty State UI
 * - Clickable Row Support with accessible keyboard triggers
 * - Optional Serial Number (#) Column
 * - Built-in Action Buttons Column
 * - Dynamic Sorting & Search Filter
 */
const Table = ({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No records found',
  emptyIcon = 'bi-inbox',
  onRowClick = null,
  hover = true,
  striped = false,
  bordered = true,
  borderless = false,
  compact = false,
  small = false, // Alias for compact
  variant = '', // e.g., 'dark', 'light', 'primary'
  className = '',
  tableClassName = '',
  headerClassName = 'table-light',
  containerClassName = '',
  caption = null,
  captionTop = false,
  minWidth = '650px',
  responsiveBreakpoint = true, // true, 'sm', 'md', 'lg', 'xl', 'xxl'
  showSerialNumber = false,
  serialNumberHeader = '#',
  actions = null,
  actionHeader = 'Actions',
  actionWidth = '120px',
  stickyHeader = false,
  
  // Pagination Props
  paginated = true,
  pageSizeOptions = [25, 50, 100],
  defaultPageSize = 25,
  currentPage: externalPage,
  pageSize: externalPageSize,
  totalCount: externalTotalCount,
  onPageChange = null,
  onPageSizeChange = null,

  // Search & Filter Props
  showSearch = false,
  searchPlaceholder = 'Search records...',
  searchQuery: externalSearchQuery,
  onSearchChange = null,

  // Sorting Props
  sortable = true,
  defaultSortKey = '',
  defaultSortOrder = 'asc', // 'asc' | 'desc'
  onSortChange = null,
}) => {
  // --- Internal State (Uncontrolled Mode Fallbacks) ---
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(
    pageSizeOptions.includes(defaultPageSize) ? defaultPageSize : pageSizeOptions[0] || 25
  );
  const [internalSearch, setInternalSearch] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  // Controlled vs Uncontrolled Resolution
  const isPageControlled = externalPage !== undefined;
  const isPageSizeControlled = externalPageSize !== undefined;
  const isSearchControlled = externalSearchQuery !== undefined;

  const page = isPageControlled ? externalPage : internalPage;
  const pageSize = isPageSizeControlled ? externalPageSize : internalPageSize;
  const searchQuery = isSearchControlled ? externalSearchQuery : internalSearch;

  // --- Filtering ---
  const filteredData = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);

  // --- Sorting ---
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // --- Pagination Calculation ---
  const totalItems = externalTotalCount !== undefined ? externalTotalCount : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Determine current page data slicing
  const pageData = useMemo(() => {
    if (!paginated) return sortedData;
    if (externalTotalCount !== undefined) return sortedData; // Server side handles slicing
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, page, pageSize, externalTotalCount]);

  // --- Handlers ---
  const handlePageChange = (newPage) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    if (!isPageControlled) setInternalPage(validPage);
    if (onPageChange) onPageChange(validPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    if (!isPageSizeControlled) {
      setInternalPageSize(newSize);
      setInternalPage(1); // Reset to page 1 on page size change
    }
    if (onPageSizeChange) onPageSizeChange(newSize);
    if (onPageChange && isPageControlled) onPageChange(1);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (!isSearchControlled) {
      setInternalSearch(val);
      setInternalPage(1); // Reset to page 1 on search change
    }
    if (onSearchChange) onSearchChange(val);
  };

  const handleSort = (key, isColumnSortable) => {
    if (!sortable || isColumnSortable === false) return;

    let newOrder = 'asc';
    if (sortKey === key) {
      if (sortOrder === 'asc') newOrder = 'desc';
      else if (sortOrder === 'desc') {
        // Reset sort
        setSortKey('');
        setSortOrder('asc');
        if (onSortChange) onSortChange('', 'asc');
        return;
      }
    }

    setSortKey(key);
    setSortOrder(newOrder);
    if (onSortChange) onSortChange(key, newOrder);
  };

  const getRowId = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row, index);
    if (row && row[rowKey] !== undefined) return row[rowKey];
    return `row-${index}`;
  };

  // --- Responsive Container Class ---
  const responsiveClass = useMemo(() => {
    if (!responsiveBreakpoint) return '';
    if (typeof responsiveBreakpoint === 'string') return `table-responsive-${responsiveBreakpoint}`;
    return 'table-responsive';
  }, [responsiveBreakpoint]);

  // --- Dynamic Table Classes ---
  const tableClasses = [
    'table',
    'sonocare-table',
    hover && 'table-hover',
    striped && 'table-striped',
    bordered && 'table-bordered',
    borderless && 'table-borderless',
    (compact || small) && 'table-sm',
    variant && `table-${variant}`,
    alignMiddleClass(),
    tableClassName
  ].filter(Boolean).join(' ');

  function alignMiddleClass() {
    return 'align-middle';
  }

  // Calculate start and end count for display
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className={`sonocare-table-container ${className}`}>
      {/* Table Toolbar: Search Bar */}
      {showSearch && (
        <div className="sonocare-table-toolbar">
          <div className="sonocare-search-box">
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control form-control-sm sonocare-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search table records"
            />
          </div>
          {searchQuery && (
            <span className="badge bg-light text-dark border">
              Filtered: {filteredData.length} of {data.length}
            </span>
          )}
        </div>
      )}

      {/* Horizontally Scrollable Table Container */}
      <div 
        className={`${responsiveClass} sonocare-table-responsive ${containerClassName}`}
        tabIndex={0}
        role="region"
        aria-label="Data Table Container"
      >
        <table className={tableClasses} style={{ minWidth: minWidth }}>
          {caption && (
            <caption className={captionTop ? 'caption-top' : ''}>
              {caption}
            </caption>
          )}

          {/* Table Header */}
          <thead className={headerClassName} style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 1 } : {}}>
            <tr>
              {/* Optional Serial Number Header */}
              {showSerialNumber && (
                <th scope="col" className="text-center" style={{ width: '50px' }}>
                  {serialNumberHeader}
                </th>
              )}

              {/* Dynamic Column Headers */}
              {columns.map((col) => {
                const isColSortable = sortable && col.sortable !== false;
                const isSorted = sortKey === col.key;
                const alignClass = col.align ? `text-${col.align}` : '';

                return (
                  <th
                    key={col.key || col.title}
                    scope="col"
                    style={col.width ? { width: col.width } : {}}
                    className={`${isColSortable ? 'sortable' : ''} ${alignClass} ${col.headerClassName || ''}`}
                    onClick={() => handleSort(col.key, col.sortable)}
                    aria-sort={isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className={`d-inline-flex align-items-center ${col.align === 'end' ? 'justify-content-end' : col.align === 'center' ? 'justify-content-center' : ''}`}>
                      <span>{col.title}</span>
                      {isColSortable && (
                        <span className={`sonocare-sort-icon ${isSorted ? 'active' : ''}`}>
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={14} title="Sorted Ascending" />
                            ) : (
                              <ArrowDown size={14} title="Sorted Descending" />
                            )
                          ) : (
                            <ArrowUpDown size={14} title="Sortable" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Optional Action Header */}
              {actions && (
                <th scope="col" className="text-center" style={{ width: actionWidth }}>
                  {actionHeader}
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody aria-busy={loading ? 'true' : 'false'}>
            {/* Loading State */}
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  {showSerialNumber && (
                    <td className="text-center">
                      <span className="sonocare-skeleton" style={{ width: '20px' }}></span>
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={`skeleton-col-${colIdx}`} className={col.align ? `text-${col.align}` : ''}>
                      <span className="sonocare-skeleton"></span>
                    </td>
                  ))}
                  {actions && (
                    <td className="text-center">
                      <span className="sonocare-skeleton" style={{ width: '60px' }}></span>
                    </td>
                  )}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              /* Empty State */
              <tr>
                <td
                  colSpan={
                    columns.length + (showSerialNumber ? 1 : 0) + (actions ? 1 : 0)
                  }
                >
                  <div className="sonocare-empty-state">
                    {typeof emptyIcon === 'string' ? (
                      <Inbox size={40} className="text-muted d-block mx-auto mb-2" />
                    ) : (
                      emptyIcon
                    )}
                    <div className="fw-semibold text-secondary">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              /* Dynamic Data Rows */
              pageData.map((row, rowIndex) => {
                const globalIndex = (page - 1) * pageSize + rowIndex + 1;
                const rKey = getRowId(row, rowIndex);
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={rKey}
                    className={isClickable ? 'sonocare-table-row-clickable' : ''}
                    onClick={(e) => isClickable && onRowClick(row, rowIndex, e)}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(row, rowIndex, e);
                      }
                    }}
                  >
                    {/* Serial Number Cell */}
                    {showSerialNumber && (
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '0.875rem' }}>
                        {globalIndex}
                      </td>
                    )}

                    {/* Column Cells */}
                    {columns.map((col) => {
                      const val = row[col.key];
                      const alignClass = col.align ? `text-${col.align}` : '';
                      const cellClass = `${alignClass} ${col.className || ''}`;

                      return (
                        <td key={`${rKey}-${col.key}`} className={cellClass}>
                          {col.render
                            ? col.render(val, row, rowIndex)
                            : val !== undefined && val !== null
                            ? String(val)
                            : '—'}
                        </td>
                      );
                    })}

                    {/* Actions Cell */}
                    {actions && (
                      <td 
                        className="text-center"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking action buttons
                      >
                        <div className="btn-group btn-group-sm" role="group" aria-label="Row Actions">
                          {typeof actions === 'function' ? (
                            actions(row, rowIndex)
                          ) : (
                            actions.map((act, actIdx) => (
                              <button
                                key={`act-${actIdx}`}
                                type="button"
                                className={`btn btn-${act.variant || 'outline-primary'} btn-sm ${act.className || ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (act.onClick) act.onClick(row, rowIndex, e);
                                }}
                                disabled={act.disabled ? act.disabled(row) : false}
                                title={act.title || act.label}
                                aria-label={act.label || act.title}
                              >
                                {act.icon && <i className={`bi ${act.icon} ${act.label ? 'me-1' : ''}`}></i>}
                                {act.label}
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Pagination & Info */}
      {paginated && !loading && totalItems > 0 && (
        <div className="sonocare-table-footer">
          {/* Entries Summary Info */}
          <div className="sonocare-table-info">
            Showing <span className="sonocare-table-info-highlight">{startItem}</span> to{' '}
            <span className="sonocare-table-info-highlight">{endItem}</span> of{' '}
            <span className="sonocare-table-info-highlight">{totalItems}</span> entries
          </div>

          {/* Right Group: Rows Per Page & Navigation Controls */}
          <div className="sonocare-pagination-controls">
            {/* Rows Per Page Selector */}
            <div className="sonocare-rows-per-page">
              <span>Rows per page:</span>
              <select
                className="form-select form-select-sm sonocare-page-size-select"
                value={pageSize}
                onChange={handlePageSizeChange}
                aria-label="Select number of records per page"
              >
                {pageSizeOptions.map((size, idx) => (
                  <option key={`opt-${size}-${idx}`} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Controls: « ‹ 1 / 4 › » */}
            <div className="sonocare-pagination-nav" role="navigation" aria-label="Table Pagination">
              {/* First Page */}
              <button
                type="button"
                className="sonocare-pag-btn"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                aria-label="Go to first page"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                className="sonocare-pag-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Go to previous page"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Current Page / Total Pages Display */}
              <div className="sonocare-page-counter" aria-live="polite">
                <span className="current-page-num">{page}</span>
                <span className="page-separator">/</span>
                <span className="total-pages-num">{totalPages}</span>
              </div>

              {/* Next Page */}
              <button
                type="button"
                className="sonocare-pag-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                aria-label="Go to next page"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                className="sonocare-pag-btn"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages || totalPages === 0}
                aria-label="Go to last page"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper to generate page number sequence with ellipsis
 */
function generatePaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default Table;
