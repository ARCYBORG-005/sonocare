import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { toast, ToastContainer } from '../../components/Toast';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { initialMockSubscriptions } from '../Subscription/mockSubscriptionData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * SubscriptionReport Component
 * Dedicated reporting workspace for Subscription performance analytics.
 * Route: /reports/subscription
 *
 * Backend Integration Notes:
 * - Replace initialMockSubscriptions with API call: GET /api/reports/subscriptions
 * - KPI metric cards can map directly from aggregated API response fields
 * - All filter params (typeFilter, statusFilter, searchQuery) are ready to pass as query params
 * - Export CSV: call POST /api/reports/subscriptions/export
 */
const SubscriptionReport = () => {
  // ─── Data Source (Replace with API fetch on backend integration) ───────────
  const [reports] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialMockSubscriptions];
  });

  // ─── Filters & Search ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');       // Monthly | Half-Yearly | Yearly
  const [statusFilter, setStatusFilter] = useState('');   // Active | Pending | Lapsed

  // ─── Detail Modal ──────────────────────────────────────────────────────────
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ─── Filtered Dataset ──────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (r.subscriptionId || '').toLowerCase().includes(q) ||
        (r.client || '').toLowerCase().includes(q) ||
        (r.productSummary || '').toLowerCase().includes(q) ||
        (r.territory || '').toLowerCase().includes(q);

      const matchesType = !typeFilter || r.subscriptionType === typeFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, statusFilter]);

  // ─── KPI Metrics ──────────────────────────────────────────────────────────
  // Backend: these calculations can come from pre-aggregated API response
  const kpiMetrics = useMemo(() => {
    const total = filteredReports.length;
    const active = filteredReports.filter((r) => r.status === 'Active');
    const pending = filteredReports.filter((r) => String(r.status).trim() === 'Pending');
    const lapsed = filteredReports.filter((r) => r.status === 'Lapsed');

    const today = new Date();
    const renewalDue30 = filteredReports.filter((r) => {
      if (!r.nextBillingDate) return false;
      const diff = (new Date(r.nextBillingDate) - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30 && r.status === 'Active';
    });

    const activeRevenue = active.reduce((acc, r) => acc + Number(r.price || 0), 0);
    const pendingRevenue = pending.reduce((acc, r) => acc + Number(r.price || 0), 0);
    const annualRevenue = filteredReports.reduce((acc, r) => {
      const price = Number(r.price || 0);
      if (r.subscriptionType === 'Monthly') return acc + price * 12;
      if (r.subscriptionType === 'Half-Yearly') return acc + price * 2;
      return acc + price; // Yearly
    }, 0);

    const renewalRate = total > 0 ? ((active.length / total) * 100).toFixed(1) : 0;
    const churnRate = total > 0 ? ((lapsed.length / total) * 100).toFixed(1) : 0;

    return {
      total,
      activeCount: active.length,
      pendingCount: pending.length,
      lapsedCount: lapsed.length,
      renewalDue30Count: renewalDue30.length,
      activeRevenue,
      pendingRevenue,
      annualRevenue,
      renewalRate,
      churnRate
    };
  }, [filteredReports]);

  // ─── Detail Modal Handler ──────────────────────────────────────────────────
  const handleViewDetail = (row) => {
    setSelectedRecord(row);
    setIsDetailModalOpen(true);
  };

  // ─── Export CSV (stub — wire to backend POST /api/reports/subscriptions/export) ──
  const handleExportCSV = () => {
    toast.success('Subscription Performance Report exported as CSV successfully!');
  };

  // ─── Alert Status Helper ───────────────────────────────────────────────────
  const getAlertStatus = (row) => {
    if (!row.nextBillingDate) return 'normal';
    const today = new Date();
    const diff = (new Date(row.nextBillingDate) - today) / (1000 * 60 * 60 * 24);
    if (row.status === 'Lapsed' || diff < 0) return 'expired';
    if (diff <= 30) return 'due30';
    return 'normal';
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'subscriptionId',
      title: 'SUBSCRIPTION ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'client',
      title: 'CLIENT / TERRITORY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory || '—'}</span>
        </div>
      )
    },
    {
      key: 'productSummary',
      title: 'PRODUCT / CATEGORY',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.85rem' }}>{val}</span>
          <span className="small text-muted font-monospace">{row.category || '—'}</span>
        </div>
      )
    },
    {
      key: 'subscriptionType',
      title: 'TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Monthly'
            ? 'badge bg-primary text-white'
            : val === 'Half-Yearly'
            ? 'badge bg-warning text-dark'
            : 'badge bg-success text-white';
        return <span className={`${cls} px-3 py-1 fw-bold`}>{val || '—'}</span>;
      }
    },
    {
      key: 'price',
      title: 'CYCLE AMOUNT (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="fw-bold font-monospace text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'startDate',
      title: 'START DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val || '—'}</span>
    },
    {
      key: 'nextBillingDate',
      title: 'NEXT BILLING DATE',
      sortable: true,
      render: (val, row) => {
        const alert = getAlertStatus(row);
        const cls =
          alert === 'expired'
            ? 'text-danger fw-bold'
            : alert === 'due30'
            ? 'text-warning fw-bold'
            : 'text-dark fw-semibold';
        return <span className={`font-monospace small ${cls}`}>{val || '—'}</span>;
      }
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const clean = String(val || '').trim();
        const cls =
          clean === 'Active'
            ? 'badge bg-success-subtle text-success border border-success'
            : clean === 'Pending'
            ? 'badge bg-warning-subtle text-warning border border-warning'
            : 'badge bg-danger-subtle text-danger border border-danger';
        return <span className={`${cls} px-3 py-1 fw-bold`}>{clean}</span>;
      }
    },
    {
      key: 'renewalAlert',
      title: 'RENEWAL ALERT',
      sortable: false,
      align: 'center',
      render: (_, row) => {
        const alert = getAlertStatus(row);
        if (alert === 'expired') return <span className="badge bg-danger px-3 py-1 fw-bold">Expired</span>;
        if (alert === 'due30') return <span className="badge bg-warning text-dark px-3 py-1 fw-bold">Due in 30 Days</span>;
        return <span className="badge bg-success px-3 py-1 fw-bold">On Schedule</span>;
      }
    }
  ];

  // ─── Table Action: View Icon ───────────────────────────────────────────────
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Subscription Detail Breakdown"
        onClick={() => handleViewDetail(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Subscription Performance Report | Sonocare CRM</title>
        <meta name="description" content="Subscription Performance Report — track active subscriptions, renewals due, churn rates and revenue in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* ─── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <CreditCard size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Subscription Performance Report</h1>
            <span className="small text-muted">
              Track active subscriptions, renewals due, payment status, and churn analytics
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
          onClick={handleExportCSV}
        >
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* ─── KPI METRIC CARDS ─────────────────────────────────────────── */}
      <div className="row g-3 mb-4">

        {/* CARD 1: Active Subscriptions Revenue */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ACTIVE REVENUE</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">
                  ₹{(kpiMetrics.activeRevenue / 100000).toFixed(2)} L
                </h3>
                <span className="small text-success font-monospace">
                  {kpiMetrics.activeCount} Active Subscriptions
                </span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Annualised Revenue (ARR) */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ANNUAL REVENUE (ARR)</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">
                  ₹{(kpiMetrics.annualRevenue / 100000).toFixed(2)} L
                </h3>
                <span className="small text-muted font-monospace">All cycles annualised</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Renewals Due in 30 Days */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">RENEWALS DUE (30 DAYS)</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">
                  {kpiMetrics.renewalDue30Count} Contracts
                </h3>
                <span className="small text-danger font-monospace">Action Required</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Pending Subscriptions */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">PENDING PAYMENT</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace">
                  {kpiMetrics.pendingCount} Contracts
                </h3>
                <span className="small text-warning font-monospace">
                  ₹{(kpiMetrics.pendingRevenue / 100000).toFixed(2)} L pending
                </span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: Renewal Rate */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">RENEWAL RATE</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">
                  {kpiMetrics.renewalRate}%
                </h3>
                <span className="small text-muted font-monospace">Active / Total</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <RefreshCw size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 6: Churn Rate / Lapsed */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">SUBSCRIPTION CHURN RATE</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">
                  {kpiMetrics.churnRate}%
                </h3>
                <span className="small text-muted font-monospace">
                  {kpiMetrics.lapsedCount} Lapsed Contracts
                </span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CARD TABLE ───────────────────────────────────────────── */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>

        {/* Card Header + Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">
            SUBSCRIPTION REPORT ({filteredReports.length})
          </h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Subscription ID, Client, Product, Territory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filter Subscription Type &amp; Status:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Subscription Types</option>
                <option value="Monthly">Monthly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Lapsed">Lapsed</option>
              </select>
            </div>

            {(typeFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTypeFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
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
            data={filteredReports}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="90px"
            emptyMessage="No subscription records found matching the selected filters."
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

      {/* ─── DETAIL DRILL-DOWN MODAL ───────────────────────────────────── */}
      <Modal
        show={isDetailModalOpen}
        onHide={() => setIsDetailModalOpen(false)}
        title={`Subscription Breakdown — ${selectedRecord?.subscriptionId || ''}`}
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

            {/* Client & Product Block */}
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.client}</h5>
              <span className="small text-muted font-monospace">
                Territory: {selectedRecord.territory} | Contact: {selectedRecord.contactPerson || '—'} | {selectedRecord.mobile || ''}
              </span>
            </div>

            {/* KPI Mini Cards */}
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Subscription Type</span>
                  <h5 className="fw-bold text-primary mb-0 font-monospace">{selectedRecord.subscriptionType || '—'}</h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Cycle Amount</span>
                  <h5 className="fw-bold text-dark mb-0 font-monospace">
                    ₹{Number(selectedRecord.price || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Next Billing Date</span>
                  <h5 className={`fw-bold mb-0 font-monospace ${getAlertStatus(selectedRecord) !== 'normal' ? 'text-danger' : 'text-dark'}`}>
                    {selectedRecord.nextBillingDate || '—'}
                  </h5>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-3">Subscription Details:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Order Fulfilment ID:</span>
                  <span className="fw-bold text-dark">{selectedRecord.orderFulfilmentId || '—'}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">PI Number:</span>
                  <span className="fw-bold text-dark">{selectedRecord.piNumber || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Product / Equipment:</span>
                  <span className="fw-bold text-dark">{selectedRecord.productSummary || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Serial Number:</span>
                  <span className="fw-bold text-dark">{selectedRecord.serialNumber || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Start Date:</span>
                  <span className="fw-bold text-dark">{selectedRecord.startDate || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Billing Cycle:</span>
                  <span className="fw-bold text-dark">{selectedRecord.billingCycle || selectedRecord.subscriptionType || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Status:</span>
                  <span className={`fw-bold ${selectedRecord.status === 'Active' ? 'text-success' : selectedRecord.status === 'Lapsed' ? 'text-danger' : 'text-warning'}`}>
                    {selectedRecord.status}
                  </span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Payment Status:</span>
                  <span className={`fw-bold ${selectedRecord.paymentStatus === 'Paid' ? 'text-success' : 'text-danger'}`}>
                    {selectedRecord.paymentStatus || '—'}
                  </span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">GST (%):</span>
                  <span className="fw-bold text-dark">{selectedRecord.gstPercent || 18}%</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Discount (%):</span>
                  <span className="fw-bold text-dark">{selectedRecord.discountPercent || 0}%</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedRecord.notes && (
              <div className="p-3 bg-light rounded border">
                <h6 className="fw-bold text-dark mb-1 small">Notes:</h6>
                <p className="small text-muted mb-0" style={{ lineHeight: '1.6' }}>{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionReport;
