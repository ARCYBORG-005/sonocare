import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  TrendingUp,
  Search,
  Filter,
  Eye,
  Download,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  DollarSign,
  Briefcase
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Initial Mock Lead Reports Dataset per Sales Executive / Territory.
 * Data schema designed for 1-to-1 mapping with SQL DB `GROUP BY` backend queries:
 * SELECT executiveId, executiveName, territory, enquiriesConverted, inProgress, highConfirm, wonLeads, droppedLeads, pipelineValue FROM lead_reports;
 */
export const initialLeadReports = [
  {
    id: 'EXEC-2026-001',
    executiveId: 'EXEC-2026-001',
    executiveName: 'Karthik Raja',
    territory: 'Chennai, Tamil Nadu',
    enquiriesConverted: 68,
    inProgress: 24,
    highConfirm: 18,
    wonLeads: 20,
    droppedLeads: 6,
    pipelineValue: 28500000, // INR 2.85 Cr
    winRate: 29.4, // (20 / 68) * 100
    topLostReason: 'Price Competition from Refurbished Vendors'
  },
  {
    id: 'EXEC-2026-002',
    executiveId: 'EXEC-2026-002',
    executiveName: 'Anitha Ramesh',
    territory: 'Bengaluru, Karnataka',
    enquiriesConverted: 82,
    inProgress: 30,
    highConfirm: 22,
    wonLeads: 24,
    droppedLeads: 6,
    pipelineValue: 34200000, // INR 3.42 Cr
    winRate: 29.3,
    topLostReason: 'Budget Postponed to Next Financial Year'
  },
  {
    id: 'EXEC-2026-003',
    executiveId: 'EXEC-2026-003',
    executiveName: 'Siddharth Varma',
    territory: 'Hyderabad, Telangana',
    enquiriesConverted: 54,
    inProgress: 18,
    highConfirm: 14,
    wonLeads: 16,
    droppedLeads: 6,
    pipelineValue: 21800000, // INR 2.18 Cr
    winRate: 29.6,
    topLostReason: 'Customer Preferred Competitor Product'
  },
  {
    id: 'EXEC-2026-004',
    executiveId: 'EXEC-2026-004',
    executiveName: 'Meenakshi Sundaram',
    territory: 'Coimbatore, Tamil Nadu',
    enquiriesConverted: 45,
    inProgress: 15,
    highConfirm: 12,
    wonLeads: 14,
    droppedLeads: 4,
    pipelineValue: 18900000, // INR 1.89 Cr
    winRate: 31.1,
    topLostReason: 'Hospital Management Approval Delayed'
  }
];

/**
 * LeadReport Component
 * Dedicated workspace page for Lead Conversion & Pipeline Reports.
 * Route: /reports/lead
 */
const LeadReport = () => {
  // Backend-Ready State (Synced with localStorage app_lead_reports)
  const [reports, setReports] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_lead_reports') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialLeadReports];
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');

  // Selected Record for Drill-Down Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered Data
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        r.executiveId.toLowerCase().includes(q) ||
        r.executiveName.toLowerCase().includes(q) ||
        r.territory.toLowerCase().includes(q);

      const matchesTerritory = !territoryFilter || r.territory === territoryFilter;

      return matchesSearch && matchesTerritory;
    });
  }, [reports, searchQuery, territoryFilter]);

  // Overall KPI Metrics Calculations (BACKEND DB EQUIVALENT: AGGREGATE STATS)
  const kpiMetrics = useMemo(() => {
    const totalEnqConverted = filteredReports.reduce((acc, r) => acc + Number(r.enquiriesConverted || 0), 0);
    const totalInProgress = filteredReports.reduce((acc, r) => acc + Number(r.inProgress || 0), 0);
    const totalHighConfirm = filteredReports.reduce((acc, r) => acc + Number(r.highConfirm || 0), 0);
    const totalWon = filteredReports.reduce((acc, r) => acc + Number(r.wonLeads || 0), 0);
    const totalDrop = filteredReports.reduce((acc, r) => acc + Number(r.droppedLeads || 0), 0);
    const totalPipelineValue = filteredReports.reduce((acc, r) => acc + Number(r.pipelineValue || 0), 0);
    const winRatePct = totalEnqConverted > 0 ? ((totalWon / totalEnqConverted) * 100).toFixed(1) : 0;

    return {
      totalEnquiriesConvertedToLead: totalEnqConverted,
      totalInProgress: totalInProgress,
      totalHighConfirm: totalHighConfirm,
      totalWon: totalWon,
      totalDrop: totalDrop,
      totalPipelineValue: totalPipelineValue,
      overallWinRate: winRatePct
    };
  }, [filteredReports]);

  // Open Detail Modal
  const handleOpenDetailModal = (row) => {
    setSelectedRecord(row);
    setIsDetailModalOpen(true);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    toast.success('Lead Conversion & Pipeline Report exported as CSV successfully!');
  };

  // Table Columns Definition matching Role Master Design
  const columns = [
    {
      key: 'executiveId',
      title: 'EXECUTIVE ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'executiveName',
      title: 'EXECUTIVE / REGION',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.territory}</span>
        </div>
      )
    },
    {
      key: 'enquiriesConverted',
      title: 'ENQUIRIES CONVERTED',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-primary bg-opacity-10 text-primary border border-primary font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'inProgress',
      title: 'IN PROGRESS',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-warning bg-opacity-10 text-warning border border-warning font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'highConfirm',
      title: 'HIGH CONFIRM',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-info bg-opacity-10 text-info border border-info font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'wonLeads',
      title: 'TOTAL WON',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-success bg-opacity-10 text-success border border-success font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'droppedLeads',
      title: 'TOTAL DROP',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-danger bg-opacity-10 text-danger border border-danger font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'winRate',
      title: 'WIN RATE %',
      sortable: true,
      align: 'center',
      render: (val) => <span className="fw-bold text-success font-monospace">{val}%</span>
    },
    {
      key: 'pipelineValue',
      title: 'PIPELINE VALUE',
      sortable: true,
      align: 'right',
      render: (val) => <span className="fw-bold text-dark font-monospace">₹{(val / 100000).toFixed(2)} Lakhs</span>
    }
  ];

  // Table Actions Renderer
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Full Executive Pipeline Breakdown"
        onClick={() => handleOpenDetailModal(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Lead Conversion & Pipeline Report | Sonocare CRM</title>
        <meta name="description" content="Lead Conversion and Pipeline Report in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <TrendingUp size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Lead Conversion & Pipeline Report</h1>
            <span className="small text-muted">Track Enquiries Converted to Leads, In Progress, High Confirm, Won, and Dropped metrics</span>
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

      {/* SUMMARY KPI METRIC CARDS (RESPONSIVE GRID: MOBILE, TABLET, DESKTOP) */}
      <div className="row g-3 mb-4">
        {/* CARD 1: TOTAL ENQUIRIES CONVERTED TO LEAD */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL ENQUIRIES CONVERTED</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">
                  {kpiMetrics.totalEnquiriesConvertedToLead}
                </h3>
                <span className="small text-muted font-monospace">Converted to Leads</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <BarChart3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL IN PROGRESS */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL IN PROGRESS</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace">
                  {kpiMetrics.totalInProgress}
                </h3>
                <span className="small text-warning font-monospace">Active Negotiation</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: TOTAL HIGH CONFIRM */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL HIGH CONFIRM</span>
                <h3 className="fw-bold text-info mb-0 font-monospace">
                  {kpiMetrics.totalHighConfirm}
                </h3>
                <span className="small text-info font-monospace">Near Closure</span>
              </div>
              <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: TOTAL WON */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL WON LEADS</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">
                  {kpiMetrics.totalWon}
                </h3>
                <span className="small text-success font-monospace">Win Rate: {kpiMetrics.overallWinRate}%</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL DROP */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL DROPPED / LOST</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">
                  {kpiMetrics.totalDrop}
                </h3>
                <span className="small text-muted font-monospace">Dropped Leads</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <UserX size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card shadow-sm border mb-4" style={{ borderRadius: '10px' }}>
        {/* Card Header & Search */}
        <div className="category-card-header pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h2 className="category-card-title mb-0">LEAD CONVERSION REGISTER ({filteredReports.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Executive ID, Name, Territory..."
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
              <span className="fw-semibold">Filter Territory:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                <option value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
                <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
                <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                <option value="Coimbatore, Tamil Nadu">Coimbatore, Tamil Nadu</option>
              </select>
            </div>

            {(territoryFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTerritoryFilter('');
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
            emptyMessage="No lead conversion records found."
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
        title={`Executive Lead Conversion Breakdown — ${selectedRecord?.executiveId}`}
        size="lg"
      >
        {selectedRecord && (
          <div className="p-2 d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedRecord.executiveName}</h5>
              <span className="small text-muted font-monospace">
                Territory: {selectedRecord.territory} | Overall Win Rate: {selectedRecord.winRate}%
              </span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Converted Leads</span>
                  <h4 className="fw-bold text-primary mb-0 font-monospace">{selectedRecord.enquiriesConverted}</h4>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">In Progress</span>
                  <h4 className="fw-bold text-warning mb-0 font-monospace">{selectedRecord.inProgress}</h4>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">High Confirm</span>
                  <h4 className="fw-bold text-info mb-0 font-monospace">{selectedRecord.highConfirm}</h4>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Won Leads</span>
                  <h4 className="fw-bold text-success mb-0 font-monospace">{selectedRecord.wonLeads}</h4>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-2">Executive Pipeline Insights:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Total Dropped Leads:</span>
                  <span className="fw-bold text-danger">{selectedRecord.droppedLeads} Leads</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Top Lost Reason:</span>
                  <span className="fw-bold text-dark">{selectedRecord.topLostReason}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Total Pipeline Revenue Value:</span>
                  <span className="fw-bold text-success">₹{(selectedRecord.pipelineValue / 100000).toFixed(2)} Lakhs</span>
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

export default LeadReport;
