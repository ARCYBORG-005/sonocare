import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  UserX,
  RefreshCw,
  Building2,
  PackageCheck
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Initial Mock Warranty & AMC Report Dataset.
 * Status values aligned with AMC Management: 'Active', 'Pending Renewal', 'Lapsed'.
 */
export const initialAMCReports = [
  {
    id: 'AMC-2026-001',
    contractNo: 'AMC-2026-001',
    customerName: 'Apollo Hospitals',
    territory: 'Chennai, Tamil Nadu',
    productName: 'Sonoscape P20 Expert Ultrasound System',
    serialNumber: 'SN-P20-2026-4412',
    type: 'CAMC',
    activeValue: 480000, // INR 4.80 Lakhs / year
    startDate: '2025-09-15',
    expiryDate: '2026-09-15',
    daysUntilExpiry: 18, // Due in 18 days (30 Days Urgent Bucket!)
    renewalDueStatus: 'Due in 30 Days',
    status: 'Pending Renewal',
    churnRisk: 'Low (Renewal PI Sent)',
    salesExecutive: 'Karthik Raja'
  },
  {
    id: 'AMC-2026-002',
    contractNo: 'AMC-2026-002',
    customerName: 'Fortis Healthcare',
    territory: 'Bengaluru, Karnataka',
    productName: 'Mindray DC-70 X-Insight Ultrasound',
    serialNumber: 'SN-DC70-8812',
    type: 'CAMC',
    activeValue: 620000,
    startDate: '2025-10-10',
    expiryDate: '2026-10-10',
    daysUntilExpiry: 43, // Due in 43 days (60 Days Bucket!)
    renewalDueStatus: 'Due in 60 Days',
    status: 'Active',
    churnRisk: 'Medium (Awaiting Budget Approval)',
    salesExecutive: 'Anitha Ramesh'
  },
  {
    id: 'AMC-2026-003',
    contractNo: 'AMC-2026-003',
    customerName: 'Max Healthcare',
    territory: 'Delhi NCR, New Delhi',
    productName: 'GE Voluson E10 Diagnostic Scanner',
    serialNumber: 'SN-VOL-9923',
    type: 'SAMC',
    activeValue: 350000,
    startDate: '2025-05-01',
    expiryDate: '2026-05-01',
    daysUntilExpiry: -119, // Expired / Lapsed
    renewalDueStatus: 'Lapsed (Churned)',
    status: 'Lapsed',
    churnRisk: 'High (Competitor AMC Signed)',
    salesExecutive: 'Siddharth Varma'
  },
  {
    id: 'AMC-2026-004',
    contractNo: 'AMC-2026-004',
    customerName: 'Manipal Hospital',
    territory: 'Hyderabad, Telangana',
    productName: 'Samsung HS50 Ultrasound Diagnostics System',
    serialNumber: 'SN-HS50-7711',
    type: 'CAMC',
    activeValue: 550000,
    startDate: '2025-11-01',
    expiryDate: '2026-11-01',
    daysUntilExpiry: 65, // Active (> 60 Days)
    renewalDueStatus: 'Active (On Schedule)',
    status: 'Active',
    churnRisk: 'None (Healthy Contract)',
    salesExecutive: 'Karthik Raja'
  }
];

/**
 * AMCReport Component
 * Dedicated workspace page for Warranty & AMC Performance Reports.
 * Route: /reports/amc
 */
const AMCReport = () => {
  // Backend-Ready State (Synced with localStorage app_amc_contracts)
  const [reports, setReports] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_amc_contracts') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialAMCReports];
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
        r.contractNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q);

      const matchesType = !typeFilter || r.type === typeFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter || r.renewalDueStatus === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, statusFilter]);

  // Overall KPI Metrics Calculations (ALIGNED WITH AMC MANAGEMENT STATUS: LAPSED = CHURN)
  const kpiMetrics = useMemo(() => {
    const totalContracts = filteredReports.length;
    const activeContracts = filteredReports.filter((r) => r.status === 'Active' || r.status === 'Pending Renewal');
    
    // Lapsed status in AMC Management represents churn
    const churnedContracts = filteredReports.filter((r) => r.status === 'Lapsed' || (r.renewalDueStatus && r.renewalDueStatus.includes('Lapsed')));

    const renewalsDue30 = filteredReports.filter((r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 30);
    const renewalsDue60 = filteredReports.filter((r) => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60);

    const activeContractValue = activeContracts.reduce((acc, r) => acc + Number(r.activeValue || 0), 0);
    const val30Days = renewalsDue30.reduce((acc, r) => acc + Number(r.activeValue || 0), 0);
    const val60Days = renewalsDue60.reduce((acc, r) => acc + Number(r.activeValue || 0), 0);

    const churnCount = churnedContracts.length;
    const churnRatePct = totalContracts > 0 ? ((churnCount / totalContracts) * 100).toFixed(1) : 0;
    const renewalRatePct = totalContracts > 0 ? (((activeContracts.length) / totalContracts) * 100).toFixed(1) : 0;

    return {
      totalContracts: totalContracts,
      activeContractValue: activeContractValue,
      renewalsDue30Count: renewalsDue30.length,
      renewalsDue30Value: val30Days,
      renewalsDue60Count: renewalsDue60.length,
      renewalsDue60Value: val60Days,
      churnCount: churnCount,
      churnRate: churnRatePct,
      renewalRate: renewalRatePct
    };
  }, [filteredReports]);

  // Open Detail Modal
  const handleOpenDetailModal = (row) => {
    setSelectedRecord(row);
    setIsDetailModalOpen(true);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    toast.success('Warranty & AMC Performance Report exported as CSV successfully!');
  };

  // Table Columns Definition matching Role Master Design
  const columns = [
    {
      key: 'contractNo',
      title: 'CONTRACT NO',
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
      key: 'productName',
      title: 'PRODUCT EQUIPMENT',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-semibold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">SN: {row.serialNumber}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: 'AMC TYPE',
      sortable: true,
      align: 'center',
      render: (val) => {
        const isCamc = val === 'CAMC';
        const cls = isCamc ? 'badge bg-primary text-white' : 'badge bg-secondary text-white';
        return <span className={`px-3 py-1 fw-bold ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'activeValue',
      title: 'ACTIVE CONTRACT VALUE',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{(val / 100000).toFixed(2)} Lakhs</span>
    },
    {
      key: 'expiryDate',
      title: 'EXPIRY DATE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'renewalDueStatus',
      title: 'RENEWAL DUE STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const is30 = row.daysUntilExpiry >= 0 && row.daysUntilExpiry <= 30;
        const is60 = row.daysUntilExpiry > 30 && row.daysUntilExpiry <= 60;
        const isLapsed = row.status === 'Lapsed' || (row.renewalDueStatus && row.renewalDueStatus.includes('Lapsed')) || row.daysUntilExpiry < 0;

        if (isLapsed) {
          return <span className="badge bg-danger text-white px-3 py-1 fw-bold">Lapsed (Churned)</span>;
        }
        if (is30) {
          return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 fw-bold">Due in 30 Days ({row.daysUntilExpiry}d)</span>;
        }
        if (is60) {
          return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-1 fw-bold">Due in 60 Days ({row.daysUntilExpiry}d)</span>;
        }
        return <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 fw-bold">Active (On Schedule)</span>;
      }
    }
  ];

  // Table Actions Renderer
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Full AMC Contract & Renewal Details"
        onClick={() => handleOpenDetailModal(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Warranty & AMC Performance Report | Sonocare CRM</title>
        <meta name="description" content="Warranty & AMC Performance Report in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <ShieldCheck size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Warranty & AMC Performance Report</h1>
            <span className="small text-muted">Track Active AMC contract values, renewals due at 60/30 days, and AMC Lapsed (churn) rates</span>
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
        {/* CARD 1: ACTIVE AMC CONTRACT VALUE */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ACTIVE AMC VALUE</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">
                  ₹{(kpiMetrics.activeContractValue / 100000).toFixed(2)} L
                </h3>
                <span className="small text-success font-monospace">Renewal Rate: {kpiMetrics.renewalRate}%</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RENEWALS DUE IN 30 DAYS */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">RENEWALS DUE (30 DAYS)</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">
                  {kpiMetrics.renewalsDue30Count} Contracts
                </h3>
                <span className="small text-danger font-monospace">Value: ₹{(kpiMetrics.renewalsDue30Value / 100000).toFixed(2)} L</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: RENEWALS DUE IN 60 DAYS */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">RENEWALS DUE (60 DAYS)</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace">
                  {kpiMetrics.renewalsDue60Count} Contracts
                </h3>
                <span className="small text-warning font-monospace">Value: ₹{(kpiMetrics.renewalsDue60Value / 100000).toFixed(2)} L</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: AMC CHURN RATE / LAPSED */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">AMC CHURN RATE</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">{kpiMetrics.churnRate}%</h3>
                <span className="small text-muted font-monospace">{kpiMetrics.churnCount} Lapsed Contracts</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <UserX size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL AMC CONTRACTS */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL CONTRACTS</span>
                <h3 className="fw-bold text-dark mb-0 font-monospace">{kpiMetrics.totalContracts}</h3>
                <span className="small text-muted font-monospace">SAMC & CAMC</span>
              </div>
              <div className="p-3 bg-secondary bg-opacity-10 rounded-circle text-secondary">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">WARRANTY & AMC PERFORMANCE REGISTER ({filteredReports.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Contract No, Customer, Product..."
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
              <span className="fw-semibold">Filter AMC Type & Renewal Status:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All AMC Types</option>
                <option value="CAMC">CAMC</option>
                <option value="SAMC">SAMC</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Renewal Statuses</option>
                <option value="Due in 30 Days">Due in 30 Days</option>
                <option value="Due in 60 Days">Due in 60 Days</option>
                <option value="Active">Active (On Schedule)</option>
                <option value="Lapsed">Lapsed (Churned)</option>
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
            emptyMessage="No Warranty & AMC report records found."
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
        title={`AMC Contract Performance Breakdown — ${selectedRecord?.contractNo}`}
        size="lg"
      >
        {selectedRecord && (
          <div className="p-2 d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.customerName}</h5>
              <span className="small text-muted font-monospace">
                Territory: {selectedRecord.territory} | Executive: {selectedRecord.salesExecutive}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Active Contract Value</span>
                  <h4 className="fw-bold text-primary mb-0 font-monospace">₹{(selectedRecord.activeValue / 100000).toFixed(2)} L</h4>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Contract Expiry Date</span>
                  <h4 className="fw-bold text-dark mb-0 font-monospace">{selectedRecord.expiryDate}</h4>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Renewal Due Deadline</span>
                  <h4 className="fw-bold text-danger mb-0 font-monospace">{selectedRecord.daysUntilExpiry} Days</h4>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-2">Equipment & Churn Risk Analysis:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Product Equipment Name:</span>
                  <span className="fw-bold text-dark">{selectedRecord.productName}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Equipment Serial Number:</span>
                  <span className="fw-bold text-dark">{selectedRecord.serialNumber}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">AMC Contract Type:</span>
                  <span className="fw-bold text-primary">{selectedRecord.type}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Contract Status:</span>
                  <span className="fw-bold text-danger">{selectedRecord.status} ({selectedRecord.churnRisk})</span>
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

export default AMCReport;
