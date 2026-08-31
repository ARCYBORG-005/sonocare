import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { toast, ToastContainer } from '../../components/Toast';
import {
  BarChart3,
  Search,
  Filter,
  Eye,
  Download,
  PackageCheck,
  Ban,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { initialMockFulfilments } from '../OrderFulfilment/mockOrderFulfilment';
import { initialMockCancellations } from '../OrderFulfilment/mockCancellationData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * SalesReport Component
 * Dedicated report page built from Order Fulfilment + Cancellation data.
 * Route: /reports/sales
 *
 * Backend Integration Notes:
 * ─ Replace data sources with:
 *     GET /api/reports/sales/fulfilments
 *     GET /api/reports/sales/cancellations
 * ─ KPI metrics map 1:1 to backend aggregated response fields:
 *     { totalOrders, totalInstallations, completedInstallations,
 *       totalOrderValue, totalCollected, totalCancellations,
 *       totalRefundValue, pendingInstallations }
 * ─ Filter params (statusFilter, searchQuery) are query-param-ready
 * ─ Export CSV: POST /api/reports/sales/export
 */
const SalesReport = () => {
  // ─── Data Sources ──────────────────────────────────────────────────────────
  const fulfilments = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_order_fulfilments') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockFulfilments];
  }, []);

  const cancellations = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_order_cancellations') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockCancellations];
  }, []);

  // ─── Filters ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('fulfilments'); // 'fulfilments' | 'cancellations'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ─── Detail Modal ──────────────────────────────────────────────────────────
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ─── Filtered Datasets ─────────────────────────────────────────────────────
  const filteredFulfilments = useMemo(() => {
    return fulfilments.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (f.fulfilmentId || '').toLowerCase().includes(q) ||
        (f.customerName || '').toLowerCase().includes(q) ||
        (f.productSummary || '').toLowerCase().includes(q) ||
        (f.fieldEmployee || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || f.installationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fulfilments, searchQuery, statusFilter]);

  const filteredCancellations = useMemo(() => {
    return cancellations.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (c.cancellationId || '').toLowerCase().includes(q) ||
        (c.orderFulfilmentId || '').toLowerCase().includes(q) ||
        (c.customerName || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cancellations, searchQuery, statusFilter]);

  // ─── KPI Metrics ──────────────────────────────────────────────────────────
  const kpiMetrics = useMemo(() => {
    const totalOrders = fulfilments.length;
    const completed = fulfilments.filter((f) => f.installationStatus === 'Completed');
    const pending = fulfilments.filter((f) => f.installationStatus === 'Pending');
    const scheduled = fulfilments.filter((f) => f.installationStatus === 'Scheduled');

    const totalOrderValue = fulfilments.reduce((acc, f) => acc + Number(f.totalOrderValue || 0), 0);
    const totalCollected  = fulfilments.reduce((acc, f) => acc + Number(f.paidAmount || 0), 0);
    const amountAtInstall = completed.reduce((acc, f) => acc + Number(f.paidAmount || 0), 0);

    const totalCancellations = cancellations.length;
    const approvedCancellations = cancellations.filter((c) => c.status === 'Approved' || c.status === 'Refund Processed');
    const totalRefundValue = cancellations.reduce((acc, c) => acc + Number(c.refundAmount || 0), 0);

    return {
      totalOrders,
      completedInstallations: completed.length,
      pendingInstallations: pending.length + scheduled.length,
      totalOrderValue,
      totalCollected,
      amountAtInstall,
      totalCancellations,
      approvedCancellations: approvedCancellations.length,
      totalRefundValue
    };
  }, [fulfilments, cancellations]);

  // ─── Detail Modal Handler ──────────────────────────────────────────────────
  const handleView = (row) => {
    setSelectedRecord({ ...row, _tab: activeTab });
    setIsDetailModalOpen(true);
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    toast.success(`Sales Report (${activeTab === 'fulfilments' ? 'Order Fulfilments' : 'Cancellations'}) exported as CSV!`);
  };

  // ─── Switch Tab: clear filters ─────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setStatusFilter('');
  };

  // ─── Fulfilment Table Columns ──────────────────────────────────────────────
  const fulfilmentColumns = [
    {
      key: 'fulfilmentId',
      title: 'FULFILMENT ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.fieldEmployee || '—'}</span>
        </div>
      )
    },
    {
      key: 'productSummary',
      title: 'PRODUCT / ORDER',
      sortable: true,
      render: (val) => (
        <span className="small text-dark fw-semibold" style={{ maxWidth: '200px', display: 'block' }}>{val}</span>
      )
    },
    {
      key: 'totalOrderValue',
      title: 'ORDER VALUE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="fw-bold font-monospace text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'paidAmount',
      title: 'AMOUNT COLLECTED (₹)',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const pct = row.totalOrderValue > 0 ? Math.round((val / row.totalOrderValue) * 100) : 0;
        return (
          <div className="text-end">
            <span className="fw-bold font-monospace text-success d-block">
              ₹{Number(val || 0).toLocaleString('en-IN')}
            </span>
            <span className="small text-muted font-monospace">{pct}% collected</span>
          </div>
        );
      }
    },
    {
      key: 'installationStatus',
      title: 'INSTALLATION STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Completed'
            ? 'badge bg-success-subtle text-success border border-success'
            : val === 'Scheduled'
            ? 'badge bg-primary-subtle text-primary border border-primary'
            : 'badge bg-warning-subtle text-warning border border-warning';
        return <span className={`${cls} px-3 py-1 fw-bold`}>{val || 'Pending'}</span>;
      }
    },
    {
      key: 'installationDate',
      title: 'INSTALLATION DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val || '—'}</span>
    },
    {
      key: 'overallStatus',
      title: 'OVERALL STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Fulfilled'
            ? 'badge bg-success text-white'
            : 'badge bg-warning text-dark';
        return <span className={`${cls} px-3 py-1 fw-bold`}>{val || 'Pending'}</span>;
      }
    }
  ];

  // ─── Cancellation Table Columns ────────────────────────────────────────────
  const cancellationColumns = [
    {
      key: 'cancellationId',
      title: 'CANCELLATION ID',
      sortable: true,
      render: (val) => <span className="badge bg-danger font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">FUL: {row.orderFulfilmentId}</span>
        </div>
      )
    },
    {
      key: 'productName',
      title: 'PRODUCT',
      sortable: true,
      render: (val) => <span className="small text-dark fw-semibold">{val}</span>
    },
    {
      key: 'orderTotal',
      title: 'ORDER VALUE (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="fw-bold font-monospace text-dark">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'refundAmount',
      title: 'REFUND AMOUNT (₹)',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="fw-bold font-monospace text-danger">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'cancellationStage',
      title: 'STAGE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Before Dispatch'
            ? 'badge bg-info text-dark'
            : val === 'After Dispatch'
            ? 'badge bg-warning text-dark'
            : 'badge bg-danger text-white';
        return <span className={`${cls} px-2 py-1 fw-bold`} style={{ fontSize: '0.75rem' }}>{val}</span>;
      }
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const cls =
          val === 'Refund Processed'
            ? 'badge bg-success text-white'
            : val === 'Approved'
            ? 'badge bg-primary text-white'
            : val === 'Pending Manager Approval'
            ? 'badge bg-warning text-dark'
            : 'badge bg-secondary text-white';
        return <span className={`${cls} px-2 py-1 fw-bold`} style={{ fontSize: '0.75rem' }}>{val}</span>;
      }
    },
    {
      key: 'requestDate',
      title: 'REQUEST DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val || '—'}</span>
    }
  ];

  const currentColumns = activeTab === 'fulfilments' ? fulfilmentColumns : cancellationColumns;
  const currentData    = activeTab === 'fulfilments' ? filteredFulfilments : filteredCancellations;

  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Detail"
        onClick={() => handleView(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Sales Report | Sonocare CRM</title>
        <meta name="description" content="Sales Performance Report — Order Fulfilments, Installations, Cancellations and Revenue in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* ─── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <BarChart3 size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Sales Report</h1>
            <span className="small text-muted">
              Order Fulfilments · Installations · Cancellations · Revenue collected
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
          onClick={handleExport}
        >
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* ─── KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">

        {/* CARD 1: Total Orders */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL ORDERS</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">{kpiMetrics.totalOrders}</h3>
                <span className="small text-muted font-monospace">Order Fulfilments</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <PackageCheck size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Installations Completed */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">INSTALLATIONS DONE</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">{kpiMetrics.completedInstallations}</h3>
                <span className="small text-muted font-monospace">{kpiMetrics.pendingInstallations} Pending / Scheduled</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Total Order Value */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL ORDER VALUE</span>
                <h3 className="fw-bold text-dark mb-0 font-monospace">
                  ₹{(kpiMetrics.totalOrderValue / 100000).toFixed(2)} L
                </h3>
                <span className="small text-muted font-monospace">Gross order value</span>
              </div>
              <div className="p-3 bg-secondary bg-opacity-10 rounded-circle text-secondary">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Amount Collected at Installation */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">AMOUNT COLLECTED</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">
                  ₹{(kpiMetrics.totalCollected / 100000).toFixed(2)} L
                </h3>
                <span className="small text-success font-monospace">
                  ₹{(kpiMetrics.amountAtInstall / 100000).toFixed(2)} L at install
                </span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: Total Cancellations */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ORDER CANCELLATIONS</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">{kpiMetrics.totalCancellations}</h3>
                <span className="small text-muted font-monospace">
                  Refunds: ₹{(kpiMetrics.totalRefundValue / 100000).toFixed(2)} L
                </span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <Ban size={22} />
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
            {activeTab === 'fulfilments'
              ? `ORDER FULFILMENT REGISTER (${filteredFulfilments.length})`
              : `CANCELLATION REGISTER (${filteredCancellations.length})`}
          </h2>

          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder={activeTab === 'fulfilments'
                ? 'Search Fulfilment ID, Customer, Product...'
                : 'Search Cancellation ID, Customer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Switcher + Filters */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">

            {/* Tab Buttons */}
            <div className="col-12 col-md-auto d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm fw-semibold px-3 ${activeTab === 'fulfilments' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => switchTab('fulfilments')}
              >
                <PackageCheck size={14} className="me-1" />
                Order Fulfilments
              </button>
              <button
                type="button"
                className={`btn btn-sm fw-semibold px-3 ${activeTab === 'cancellations' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => switchTab('cancellations')}
              >
                <Ban size={14} className="me-1" />
                Cancellations
              </button>
            </div>

            <div className="col-12 col-sm-5 col-md-3 ms-md-2">
              <div className="d-flex align-items-center gap-2">
                <Filter size={15} className="text-muted flex-shrink-0" />
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {activeTab === 'fulfilments' ? (
                    <>
                      <option value="">All Installation Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Pending">Pending</option>
                    </>
                  ) : (
                    <>
                      <option value="">All Cancellation Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Refund Processed">Refund Processed</option>
                      <option value="Pending Manager Approval">Pending Approval</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {(statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
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
            columns={currentColumns}
            data={currentData}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="80px"
            emptyMessage={activeTab === 'fulfilments'
              ? 'No Order Fulfilment records found.'
              : 'No Cancellation records found.'}
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth={activeTab === 'fulfilments' ? '1000px' : '950px'}
          />
        </div>
      </div>

      {/* ─── DETAIL MODAL ──────────────────────────────────────────────── */}
      <Modal
        show={isDetailModalOpen}
        onHide={() => setIsDetailModalOpen(false)}
        title={
          selectedRecord?._tab === 'fulfilments'
            ? `Order Fulfilment — ${selectedRecord?.fulfilmentId || ''}`
            : `Cancellation — ${selectedRecord?.cancellationId || ''}`
        }
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
        {selectedRecord && selectedRecord._tab === 'fulfilments' && (
          <div className="d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.customerName}</h5>
              <span className="small text-muted font-monospace">
                {selectedRecord.contactPerson} | {selectedRecord.mobile} | Field: {selectedRecord.fieldEmployee}
              </span>
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Order Value</span>
                  <h5 className="fw-bold text-dark mb-0 font-monospace">
                    ₹{Number(selectedRecord.totalOrderValue || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Amount Collected</span>
                  <h5 className="fw-bold text-success mb-0 font-monospace">
                    ₹{Number(selectedRecord.paidAmount || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Installation Status</span>
                  <h5 className={`fw-bold mb-0 ${selectedRecord.installationStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>
                    {selectedRecord.installationStatus || '—'}
                  </h5>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-3">Order Details:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Fulfilment ID:</span>
                  <span className="fw-bold text-dark">{selectedRecord.fulfilmentId}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">PI Number:</span>
                  <span className="fw-bold text-dark">{selectedRecord.piNumber || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Product:</span>
                  <span className="fw-bold text-dark">{selectedRecord.productSummary || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Installation Date:</span>
                  <span className="fw-bold text-dark">{selectedRecord.installationDate || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Warranty Months:</span>
                  <span className="fw-bold text-dark">{selectedRecord.warrantyMonths || '—'} Months</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Payment Status:</span>
                  <span className={`fw-bold ${selectedRecord.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>
                    {selectedRecord.paymentStatus || '—'}
                  </span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Kit Status:</span>
                  <span className="fw-bold text-dark">{selectedRecord.kitStatus || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Overall Status:</span>
                  <span className={`fw-bold ${selectedRecord.overallStatus === 'Fulfilled' ? 'text-success' : 'text-warning'}`}>
                    {selectedRecord.overallStatus || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedRecord && selectedRecord._tab === 'cancellations' && (
          <div className="d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.customerName}</h5>
              <span className="small text-muted font-monospace">
                {selectedRecord.contactPerson} | {selectedRecord.mobile}
              </span>
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Order Total</span>
                  <h5 className="fw-bold text-dark mb-0 font-monospace">
                    ₹{Number(selectedRecord.orderTotal || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Refund Amount</span>
                  <h5 className="fw-bold text-danger mb-0 font-monospace">
                    ₹{Number(selectedRecord.refundAmount || 0).toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Charge %</span>
                  <h5 className="fw-bold text-warning mb-0 font-monospace">
                    {selectedRecord.chargePercent || 0}%
                  </h5>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-3">Cancellation Details:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Cancellation ID:</span>
                  <span className="fw-bold text-danger">{selectedRecord.cancellationId}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Fulfilment ID:</span>
                  <span className="fw-bold text-dark">{selectedRecord.orderFulfilmentId}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Product:</span>
                  <span className="fw-bold text-dark">{selectedRecord.productName || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Cancellation Stage:</span>
                  <span className="fw-bold text-dark">{selectedRecord.cancellationStage || '—'}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Status:</span>
                  <span className={`fw-bold ${selectedRecord.status === 'Refund Processed' ? 'text-success' : 'text-warning'}`}>
                    {selectedRecord.status}
                  </span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Payment Status:</span>
                  <span className={`fw-bold ${selectedRecord.paymentStatus === 'Complete' ? 'text-success' : 'text-danger'}`}>
                    {selectedRecord.paymentStatus || '—'}
                  </span>
                </div>
                <div className="col-12 mt-2">
                  <span className="text-muted d-block">Refund Terms:</span>
                  <span className="fw-bold text-dark">{selectedRecord.refundTerms || '—'}</span>
                </div>
                <div className="col-12 mt-2">
                  <span className="text-muted d-block">Reason:</span>
                  <span className="fw-semibold text-dark">{selectedRecord.reason || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesReport;
