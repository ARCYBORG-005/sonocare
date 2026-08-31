import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Star,
  ShieldAlert
} from 'lucide-react';
import { initialMockTickets } from '../Service/mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * TicketReport Component
 * Dedicated reporting workspace for Service Ticket analytics.
 * Route: /reports/tickets
 *
 * Backend Integration Notes:
 * ─ Replace data source with: GET /api/reports/tickets
 * ─ KPI aggregations map to backend fields:
 *     { totalTickets, openTickets, resolvedTickets, closedTickets,
 *       slaViolations, avgResolutionHours, avgFeedbackRating, escalatedTickets }
 * ─ Filter params (statusFilter, priorityFilter, typeFilter, searchQuery)
 *   ready to pass as query params
 * ─ Export: POST /api/reports/tickets/export
 */
const TicketReport = () => {
  // ─── Data Source ──────────────────────────────────────────────────────────
  const [tickets] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockTickets];
  });

  // ─── Filters ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');    // Open | In Progress | Waiting... | Resolved | Closed
  const [priorityFilter, setPriorityFilter] = useState(''); // Critical | High | Medium | Low
  const [typeFilter, setTypeFilter]     = useState('');    // CAMC | SAMC | Subscription

  // ─── Detail Modal ──────────────────────────────────────────────────────────
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ─── Filtered Dataset ──────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (t.ticketId || '').toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.assignedEngineer || '').toLowerCase().includes(q) ||
        (t.productName || '').toLowerCase().includes(q) ||
        (t.territory || '').toLowerCase().includes(q);

      const matchesStatus   = !statusFilter   || t.status === statusFilter;
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      const matchesType     = !typeFilter     || t.type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, typeFilter]);

  // ─── KPI Metrics ──────────────────────────────────────────────────────────
  // Backend: pre-aggregate these on the server to avoid client computation
  const kpiMetrics = useMemo(() => {
    const total     = filteredTickets.length;
    const open      = filteredTickets.filter((t) => t.status === 'Open').length;
    const inProg    = filteredTickets.filter((t) => t.status === 'In Progress').length;
    const waiting   = filteredTickets.filter((t) => t.status === 'Waiting for Customer/Parts').length;
    const resolved  = filteredTickets.filter((t) => t.status === 'Resolved').length;
    const closed    = filteredTickets.filter((t) => t.status === 'Closed').length;
    const slaViol   = filteredTickets.filter((t) => t.isSlaViolated === true).length;
    const escalated = filteredTickets.filter(
      (t) => t.escalationLevel === 'Team Lead' || t.escalationLevel === 'Developer'
    ).length;

    // Average feedback rating (only rated tickets)
    const ratedTickets = filteredTickets.filter((t) => Number(t.feedbackRating) > 0);
    const avgRating = ratedTickets.length > 0
      ? (ratedTickets.reduce((acc, t) => acc + Number(t.feedbackRating), 0) / ratedTickets.length).toFixed(1)
      : 'N/A';

    const criticalOpen = filteredTickets.filter(
      (t) => t.priority === 'Critical' && (t.status === 'Open' || t.status === 'In Progress')
    ).length;

    return {
      total,
      open,
      inProg,
      waiting,
      resolved,
      closed,
      slaViol,
      escalated,
      avgRating,
      criticalOpen
    };
  }, [filteredTickets]);

  // ─── Priority badge helper ─────────────────────────────────────────────────
  const priorityBadge = (val) => {
    const cls =
      val === 'Critical' ? 'badge bg-danger text-white' :
      val === 'High'     ? 'badge bg-warning text-dark' :
      val === 'Medium'   ? 'badge bg-info text-dark' :
                           'badge bg-secondary text-white';
    return <span className={`${cls} px-2 py-1 fw-bold`} style={{ fontSize: '0.75rem' }}>{val}</span>;
  };

  // ─── Status badge helper ───────────────────────────────────────────────────
  const statusBadge = (val) => {
    const cls =
      val === 'Resolved'                      ? 'badge bg-success-subtle text-success border border-success' :
      val === 'Closed'                        ? 'badge bg-primary-subtle text-primary border border-primary' :
      val === 'In Progress'                   ? 'badge bg-warning-subtle text-warning border border-warning' :
      val === 'Waiting for Customer/Parts'    ? 'badge bg-secondary-subtle text-secondary border border-secondary' :
                                               'badge bg-danger-subtle text-danger border border-danger';
    return <span className={`${cls} px-2 py-1 fw-bold`} style={{ fontSize: '0.75rem' }}>{val}</span>;
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'ticketId',
      title: 'TICKET ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER / TERRITORY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory || '—'}</span>
        </div>
      )
    },
    {
      key: 'productName',
      title: 'PRODUCT / CATEGORY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.84rem' }}>{val}</span>
          <span className="small text-muted font-monospace">{row.category || '—'}</span>
        </div>
      )
    },
    {
      key: 'assignedEngineer',
      title: 'ENGINEER',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.escalationLevel || 'Support'}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'CONTRACT TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'CAMC'         ? 'badge bg-primary text-white' :
          val === 'SAMC'         ? 'badge bg-secondary text-white' :
                                   'badge bg-success text-white';
        return <span className={`${cls} px-3 py-1 fw-bold`}>{val || '—'}</span>;
      }
    },
    {
      key: 'priority',
      title: 'PRIORITY',
      sortable: true,
      align: 'center',
      render: (val) => priorityBadge(val)
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => statusBadge(val)
    },
    {
      key: 'isSlaViolated',
      title: 'SLA',
      sortable: true,
      align: 'center',
      render: (val) =>
        val
          ? <span className="badge bg-danger px-2 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>Violated</span>
          : <span className="badge bg-success px-2 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>On Time</span>
    },
    {
      key: 'feedbackRating',
      title: 'RATING',
      sortable: true,
      align: 'center',
      render: (val) => {
        if (!val || val === 0) return <span className="small text-muted">—</span>;
        const stars = '★'.repeat(Number(val)) + '☆'.repeat(5 - Number(val));
        return <span className="text-warning fw-bold" style={{ fontSize: '0.9rem' }} title={`${val}/5`}>{stars}</span>;
      }
    },
    {
      key: 'dateCreated',
      title: 'CREATED',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val ? val.split(' ')[0] : '—'}</span>
    }
  ];

  // ─── View Action ───────────────────────────────────────────────────────────
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Ticket Detail Breakdown"
        onClick={() => { setSelectedRecord(row); setIsDetailModalOpen(true); }}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  const hasFilters = searchQuery || statusFilter || priorityFilter || typeFilter;
  const clearFilters = () => { setSearchQuery(''); setStatusFilter(''); setPriorityFilter(''); setTypeFilter(''); };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Ticket Report | Sonocare CRM</title>
        <meta name="description" content="Service Ticket Performance Report — ticket volume, SLA compliance, escalations, and CSAT ratings in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* ─── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <Wrench size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Ticket Report</h1>
            <span className="small text-muted">
              Ticket volume · SLA compliance · Escalations · Customer satisfaction
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
          onClick={() => toast.success('Ticket Performance Report exported as CSV!')}
        >
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* ─── KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">

        {/* CARD 1: Total Tickets */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL TICKETS</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">{kpiMetrics.total}</h3>
                <span className="small text-muted font-monospace">
                  {kpiMetrics.open} Open · {kpiMetrics.inProg} In Progress
                </span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <Wrench size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Resolved + Closed */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">RESOLVED / CLOSED</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">
                  {kpiMetrics.resolved + kpiMetrics.closed}
                </h3>
                <span className="small text-muted font-monospace">
                  {kpiMetrics.resolved} Resolved · {kpiMetrics.closed} Closed
                </span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Critical Open Tickets */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">CRITICAL OPEN</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">{kpiMetrics.criticalOpen}</h3>
                <span className="small text-muted font-monospace">
                  {kpiMetrics.waiting} Waiting for Parts
                </span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: SLA Violations */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">SLA VIOLATIONS</span>
                <h3 className={`fw-bold mb-0 font-monospace ${kpiMetrics.slaViol > 0 ? 'text-danger' : 'text-success'}`}>
                  {kpiMetrics.slaViol}
                </h3>
                <span className="small text-muted font-monospace">
                  {kpiMetrics.total > 0 ? (((kpiMetrics.total - kpiMetrics.slaViol) / kpiMetrics.total) * 100).toFixed(0) : 100}% SLA compliance
                </span>
              </div>
              <div className={`p-3 bg-opacity-10 rounded-circle ${kpiMetrics.slaViol > 0 ? 'bg-danger text-danger' : 'bg-success text-success'}`}>
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: Escalations */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ESCALATED TICKETS</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace">{kpiMetrics.escalated}</h3>
                <span className="small text-muted font-monospace">Team Lead / Developer</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <ShieldAlert size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 6: Avg CSAT Rating */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">AVG CSAT RATING</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">
                  {kpiMetrics.avgRating} {kpiMetrics.avgRating !== 'N/A' ? '/ 5' : ''}
                </h3>
                <span className="small text-warning fw-bold">
                  {kpiMetrics.avgRating !== 'N/A' ? '★'.repeat(Math.round(Number(kpiMetrics.avgRating))) : 'No ratings yet'}
                </span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <Star size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN TABLE CARD ───────────────────────────────────────────── */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>

        {/* Card Header + Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">
            SERVICE TICKET REGISTER ({filteredTickets.length})
          </h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Ticket ID, Customer, Engineer, Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer/Parts">Waiting for Customer/Parts</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Contract Type Filter */}
            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Contract Types</option>
                <option value="CAMC">CAMC</option>
                <option value="SAMC">SAMC</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            {hasFilters && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredTickets}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="80px"
            emptyMessage="No service ticket records found matching the selected filters."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1100px"
          />
        </div>
      </div>

      {/* ─── DETAIL MODAL ──────────────────────────────────────────────── */}
      <Modal
        show={isDetailModalOpen}
        onHide={() => setIsDetailModalOpen(false)}
        title={`Ticket Breakdown — ${selectedRecord?.ticketId || ''}`}
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button variant="outline-secondary" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedRecord && (
          <div className="d-flex flex-column gap-3">

            {/* Customer Block */}
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.customerName}</h5>
              <span className="small text-muted font-monospace">
                {selectedRecord.territory} | {selectedRecord.contactPerson} | {selectedRecord.mobile}
              </span>
            </div>

            {/* KPI Mini Cards */}
            <div className="row g-2">
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Priority</span>
                  <span>{priorityBadge(selectedRecord.priority)}</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Status</span>
                  <span className="small">{statusBadge(selectedRecord.status)}</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">SLA</span>
                  {selectedRecord.isSlaViolated
                    ? <span className="badge bg-danger px-2 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>Violated</span>
                    : <span className="badge bg-success px-2 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>On Time</span>}
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Rating</span>
                  <span className="text-warning fw-bold">
                    {selectedRecord.feedbackRating > 0 ? `${selectedRecord.feedbackRating}/5 ★` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-3">Ticket Details:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Product:</span>
                  <span className="fw-bold text-dark">{selectedRecord.productName}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Serial Number:</span>
                  <span className="fw-bold text-dark">{selectedRecord.serialNumber || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Contract Type:</span>
                  <span className="fw-bold text-primary">{selectedRecord.type || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Channel:</span>
                  <span className="fw-bold text-dark">{selectedRecord.channel || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Assigned Engineer:</span>
                  <span className="fw-bold text-dark">{selectedRecord.assignedEngineer || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Escalation Level:</span>
                  <span className={`fw-bold ${selectedRecord.escalationLevel !== 'Support' ? 'text-danger' : 'text-success'}`}>
                    {selectedRecord.escalationLevel || 'Support'}
                  </span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Date Created:</span>
                  <span className="fw-bold text-dark">{selectedRecord.dateCreated || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Last Updated:</span>
                  <span className="fw-bold text-dark">{selectedRecord.lastUpdated || '—'}</span>
                </div>
              </div>
            </div>

            {/* Issue & Resolution */}
            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-2">Issue Summary:</h6>
              <p className="small text-muted mb-3" style={{ lineHeight: '1.6' }}>{selectedRecord.issueSummary || '—'}</p>
              {selectedRecord.resolutionNotes && (
                <>
                  <h6 className="fw-bold text-dark mb-2">Resolution Notes:</h6>
                  <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>{selectedRecord.resolutionNotes}</p>
                </>
              )}
            </div>

            {/* Parts List */}
            {selectedRecord.partsList && selectedRecord.partsList.length > 0 && (
              <div className="p-3 bg-light rounded border">
                <h6 className="fw-bold text-dark mb-2">Parts Used:</h6>
                <div className="d-flex flex-column gap-1">
                  {selectedRecord.partsList.map((part, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center small font-monospace border-bottom pb-1">
                      <span className="text-dark fw-semibold">{part.partName}</span>
                      <span className={`fw-bold ${part.isAmcCovered ? 'text-success' : 'text-danger'}`}>
                        ₹{Number(part.cost || 0).toLocaleString('en-IN')}
                        {part.isAmcCovered ? ' (AMC)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TicketReport;
