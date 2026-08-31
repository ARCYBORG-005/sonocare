import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  CreditCard,
  Building2,
  TrendingUp
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Initial Mock Proforma Invoice Report Dataset.
 * Data schema designed for 1-to-1 REST/GraphQL API and SQL DB aggregate query integration:
 * SELECT piNumber, customerName, totalAmount, advancePaymentAtConfirmation, orderConfirmationStatus, confirmedDate FROM proforma_invoices;
 */
export const initialPIReports = [
  {
    id: 'PI-2026-089',
    piNumber: 'PI-2026-089',
    customerName: 'Apollo Hospitals',
    territory: 'Chennai, Tamil Nadu',
    piDate: '2026-08-10',
    totalPiAmount: 4850000, // INR 48.5 Lakhs
    advancePaymentAtConfirmation: 1450000, // Advance Received at Order Confirmation
    orderConfirmationStatus: 'Confirmed',
    confirmedDate: '2026-08-14',
    paymentMode: 'NEFT / RTGS (HDFC Bank)',
    balanceOutstanding: 3400000,
    salesExecutive: 'Karthik Raja'
  },
  {
    id: 'PI-2026-090',
    piNumber: 'PI-2026-090',
    customerName: 'Fortis Healthcare',
    territory: 'Bengaluru, Karnataka',
    piDate: '2026-08-12',
    totalPiAmount: 6200000,
    advancePaymentAtConfirmation: 1860000,
    orderConfirmationStatus: 'Confirmed',
    confirmedDate: '2026-08-16',
    paymentMode: 'Wire Transfer / Swift',
    balanceOutstanding: 4340000,
    salesExecutive: 'Anitha Ramesh'
  },
  {
    id: 'PI-2026-091',
    piNumber: 'PI-2026-091',
    customerName: 'Max Healthcare',
    territory: 'Delhi NCR, New Delhi',
    piDate: '2026-08-18',
    totalPiAmount: 3900000,
    advancePaymentAtConfirmation: 0,
    orderConfirmationStatus: 'Pending Confirmation',
    confirmedDate: '—',
    paymentMode: 'Awaiting Advance',
    balanceOutstanding: 3900000,
    salesExecutive: 'Siddharth Varma'
  },
  {
    id: 'PI-2026-092',
    piNumber: 'PI-2026-092',
    customerName: 'Manipal Hospital',
    territory: 'Hyderabad, Telangana',
    piDate: '2026-08-05',
    totalPiAmount: 5100000,
    advancePaymentAtConfirmation: 1530000,
    orderConfirmationStatus: 'Confirmed',
    confirmedDate: '2026-08-08',
    paymentMode: 'Letter of Credit (LC)',
    balanceOutstanding: 3570000,
    salesExecutive: 'Karthik Raja'
  }
];

/**
 * ProformaInvoiceReport Component
 * Dedicated workspace page for Proforma Invoice & Order Confirmation Performance Reports.
 * Route: /reports/proforma-invoice
 */
const ProformaInvoiceReport = () => {
  // Backend-Ready State (Synced with localStorage app_pi_reports)
  const [reports, setReports] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_pi_reports') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialPIReports];
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Record for Drill-Down Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered Data
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        r.piNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.salesExecutive.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || r.orderConfirmationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  // Overall KPI Metrics Calculations (BACKEND DB EQUIVALENT STATS)
  const kpiMetrics = useMemo(() => {
    const totalPIs = filteredReports.length;
    const confirmedCount = filteredReports.filter((r) => r.orderConfirmationStatus === 'Confirmed').length;
    const pendingCount = filteredReports.filter((r) => r.orderConfirmationStatus === 'Pending Confirmation').length;

    const totalPIValue = filteredReports.reduce((acc, r) => acc + Number(r.totalPiAmount || 0), 0);
    const advancePaidAtConfirmation = filteredReports.reduce((acc, r) => acc + Number(r.advancePaymentAtConfirmation || 0), 0);
    const balanceOutstanding = filteredReports.reduce((acc, r) => acc + Number(r.balanceOutstanding || 0), 0);

    const conversionRatePct = totalPIs > 0 ? ((confirmedCount / totalPIs) * 100).toFixed(1) : 0;

    return {
      totalPIs: totalPIs,
      totalOrderConfirmation: confirmedCount,
      pendingConfirmationCount: pendingCount,
      paymentAtOrderConfirmation: advancePaidAtConfirmation,
      totalPIValue: totalPIValue,
      balanceOutstanding: balanceOutstanding,
      conversionRate: conversionRatePct
    };
  }, [filteredReports]);

  // Open Detail Modal
  const handleOpenDetailModal = (row) => {
    setSelectedRecord(row);
    setIsDetailModalOpen(true);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    toast.success('Proforma Invoice & Order Confirmation Report exported as CSV successfully!');
  };

  // Table Columns Definition matching Role Master Design
  const columns = [
    {
      key: 'piNumber',
      title: 'PI NUMBER',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER / EXECUTIVE',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory} | Exec: {row.salesExecutive}</span>
        </div>
      )
    },
    {
      key: 'piDate',
      title: 'PI DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'totalPiAmount',
      title: 'TOTAL PI AMOUNT',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{(val / 100000).toFixed(2)} Lakhs</span>
    },
    {
      key: 'advancePaymentAtConfirmation',
      title: 'PAYMENT AT ORDER CONFIRMATION',
      sortable: true,
      align: 'right',
      render: (val) => {
        if (val > 0) {
          return (
            <span className="badge bg-success bg-opacity-10 text-success border border-success font-monospace px-3 py-1 fs-6">
              ₹{(val / 100000).toFixed(2)} Lakhs
            </span>
          );
        }
        return <span className="badge bg-light text-muted border font-monospace px-2 py-1">Pending Advance</span>;
      }
    },
    {
      key: 'orderConfirmationStatus',
      title: 'CONFIRMATION STATUS',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isConf = val === 'Confirmed';
        const cls = isConf ? 'badge bg-success text-white' : 'badge bg-warning text-dark';
        return <span className={`px-3 py-1 fw-bold ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'confirmedDate',
      title: 'CONFIRMED DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    }
  ];

  // Table Actions Renderer
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Full Order Confirmation Payment Details"
        onClick={() => handleOpenDetailModal(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Proforma Invoice & Order Confirmation Report | Sonocare CRM</title>
        <meta name="description" content="Proforma Invoice & Order Confirmation Report in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <FileText size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Proforma Invoice & Order Confirmation Report</h1>
            <span className="small text-muted">Track PIs issued, Order Confirmations, and Payment received at Order Confirmation</span>
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

      {/* SUMMARY KPI METRIC CARDS (RESPONSIVE GRID) */}
      <div className="row g-3 mb-4">
        {/* CARD 1: TOTAL PIS ISSUED */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL PIS ISSUED</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">{kpiMetrics.totalPIs}</h3>
                <span className="small text-muted font-monospace">Value: ₹{(kpiMetrics.totalPIValue / 100000).toFixed(2)} L</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <FileText size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL ORDER CONFIRMATIONS */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL ORDER CONFIRMED</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">{kpiMetrics.totalOrderConfirmation}</h3>
                <span className="small text-success font-monospace">Conversion: {kpiMetrics.conversionRate}%</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: PAYMENT AT ORDER CONFIRMATION */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">PAYMENT AT ORDER CONFIRM.</span>
                <h3 className="fw-bold text-dark mb-0 font-monospace">
                  ₹{(kpiMetrics.paymentAtOrderConfirmation / 100000).toFixed(2)} L
                </h3>
                <span className="small text-success font-monospace">Advance Collected</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <CreditCard size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: PENDING CONFIRMATION */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">PENDING CONFIRMATION</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace">{kpiMetrics.pendingConfirmationCount}</h3>
                <span className="small text-warning font-monospace">Awaiting Advance</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: OUTSTANDING BALANCE */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">OUTSTANDING BALANCE</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">
                  ₹{(kpiMetrics.balanceOutstanding / 100000).toFixed(2)} L
                </h3>
                <span className="small text-muted font-monospace">Due at Dispatch</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">PROFORMA INVOICE & ORDER CONFIRMATION REGISTER ({filteredReports.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search PI Number, Customer, Executive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-2">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filter Order Confirmation Status:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Confirmation Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Confirmation">Pending Confirmation</option>
              </select>
            </div>

            {(statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
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

        {/* Table Wrapper (ROLE MASTER DESIGN) */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredReports}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="90px"
            emptyMessage="No Proforma Invoice report records found."
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1200px"
          />
        </div>
      </div>

      {/* DRILL-DOWN ANALYTICS MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Confirmation & Payment Breakdown — ${selectedRecord?.piNumber}`}
        size="lg"
      >
        {selectedRecord && (
          <div className="p-2 d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.customerName}</h5>
              <span className="small text-muted font-monospace">
                Territory: {selectedRecord.territory} | PI Date: {selectedRecord.piDate} | Executive: {selectedRecord.salesExecutive}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Total PI Value</span>
                  <h4 className="fw-bold text-dark mb-0 font-monospace">₹{(selectedRecord.totalPiAmount / 100000).toFixed(2)} L</h4>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Advance at Order Confirmation</span>
                  <h4 className="fw-bold text-success mb-0 font-monospace">
                    ₹{(selectedRecord.advancePaymentAtConfirmation / 100000).toFixed(2)} L
                  </h4>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Balance Outstanding</span>
                  <h4 className="fw-bold text-danger mb-0 font-monospace">₹{(selectedRecord.balanceOutstanding / 100000).toFixed(2)} L</h4>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-2">Order Confirmation Payment Details:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Order Confirmation Status:</span>
                  <span className="fw-bold text-success">{selectedRecord.orderConfirmationStatus}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Order Confirmed Date:</span>
                  <span className="fw-bold text-dark">{selectedRecord.confirmedDate}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Payment Mode / Reference:</span>
                  <span className="fw-bold text-dark">{selectedRecord.paymentMode}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Advance Payment % Received:</span>
                  <span className="fw-bold text-primary">
                    {((selectedRecord.advancePaymentAtConfirmation / selectedRecord.totalPiAmount) * 100).toFixed(1)}% Advance Paid
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end border-top pt-3 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProformaInvoiceReport;
