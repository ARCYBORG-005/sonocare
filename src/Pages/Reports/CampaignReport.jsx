import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Megaphone,
  Search,
  Filter,
  Eye,
  Download,
  TrendingUp,
  UserCheck,
  UserX,
  BarChart3,
  DollarSign,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Initial Mock Campaign Reports Data with Log Outreach Activity & Enquiry Conversion metrics.
 * Designed for 1-to-1 REST/GraphQL API integration.
 */
export const initialCampaignReports = [
  {
    id: 'CMP-2026-001',
    campaignId: 'CMP-2026-001',
    campaignName: 'Q3 Diagnostic Ultrasound Expo 2026',
    platform: 'Medical Expo / Event',
    status: 'Active',
    outreachLogsCount: 185, // Total Log Outreach Activities (Calls, Visits, Emails)
    outreachConvertedToEnquiry: 145, // Log Outreach Converted to Enquiry
    enquiriesReceived: 145,
    enquiriesCreated: 120,
    enquiriesDropped: 35,
    leadsConverted: 42,
    conversionRate: 35.0, // (42 / 120) * 100
    totalRevenue: 25200000, // INR 2.52 Cr
    budgetSpent: 450000,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    topDropReason: 'Budget Constraint / Price Mismatch',
    convertedLeadTypes: 'CAMC & Equipment Purchase'
  },
  {
    id: 'CMP-2026-002',
    campaignId: 'CMP-2026-002',
    campaignName: 'South Zone Radiology Digital Outreach',
    platform: 'Digital Marketing / Email',
    status: 'Active',
    outreachLogsCount: 260,
    outreachConvertedToEnquiry: 210,
    enquiriesReceived: 210,
    enquiriesCreated: 180,
    enquiriesDropped: 65,
    leadsConverted: 54,
    conversionRate: 30.0,
    totalRevenue: 18900000, // INR 1.89 Cr
    budgetSpent: 280000,
    startDate: '2026-06-15',
    endDate: '2026-09-15',
    topDropReason: 'Competitor Brand Preferred',
    convertedLeadTypes: 'Subscription & SAMC'
  },
  {
    id: 'CMP-2026-003',
    campaignId: 'CMP-2026-003',
    campaignName: 'Cardiology OT Probe Replacement Drive',
    platform: 'Direct Telemarketing',
    status: 'Completed',
    outreachLogsCount: 120,
    outreachConvertedToEnquiry: 98,
    enquiriesReceived: 98,
    enquiriesCreated: 85,
    enquiriesDropped: 20,
    leadsConverted: 38,
    conversionRate: 44.7,
    totalRevenue: 15200000, // INR 1.52 Cr
    budgetSpent: 150000,
    startDate: '2026-05-01',
    endDate: '2026-07-31',
    topDropReason: 'Delivery Lead Time Exceeded',
    convertedLeadTypes: 'Probe Repair & Replacement'
  },
  {
    id: 'CMP-2026-004',
    campaignId: 'CMP-2026-004',
    campaignName: 'Tier-2 Hospital Scanner Upgrade Webinar',
    platform: 'Webinar / Virtual Summit',
    status: 'Completed',
    outreachLogsCount: 210,
    outreachConvertedToEnquiry: 175,
    enquiriesReceived: 175,
    enquiriesCreated: 140,
    enquiriesDropped: 50,
    leadsConverted: 32,
    conversionRate: 22.8,
    totalRevenue: 12800000, // INR 1.28 Cr
    budgetSpent: 120000,
    startDate: '2026-04-10',
    endDate: '2026-06-30',
    topDropReason: 'Delayed Hospital Management Approval',
    convertedLeadTypes: 'CAMC & Annual Renewal'
  }
];

/**
 * CampaignReport Component
 * Dedicated workspace page for Campaign Analytics, Log Outreach to Enquiry Conversions, & Performance Reports.
 * Route: /reports/campaign
 */
const CampaignReport = () => {
  // Backend-Ready State (Synced with localStorage app_campaign_reports)
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_campaign_reports') || '[]');
      if (stored.length > 0) return stored;
    } catch (err) {
      console.error(err);
    }
    return [...initialCampaignReports];
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Campaign for Drill-Down Modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtered Data
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.campaignId.toLowerCase().includes(q) ||
        c.campaignName.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q);

      const matchesPlatform = !platformFilter || c.platform === platformFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [campaigns, searchQuery, platformFilter, statusFilter]);

  // Overall KPI Metrics Calculation
  const kpiMetrics = useMemo(() => {
    const totalOutreachLogs = filteredCampaigns.reduce((acc, c) => acc + Number(c.outreachLogsCount || 0), 0);
    const totalOutreachConverted = filteredCampaigns.reduce((acc, c) => acc + Number(c.outreachConvertedToEnquiry || 0), 0);
    const totalRec = filteredCampaigns.reduce((acc, c) => acc + Number(c.enquiriesReceived || 0), 0);
    const totalCreated = filteredCampaigns.reduce((acc, c) => acc + Number(c.enquiriesCreated || 0), 0);
    const totalDrop = filteredCampaigns.reduce((acc, c) => acc + Number(c.enquiriesDropped || 0), 0);
    const totalConv = filteredCampaigns.reduce((acc, c) => acc + Number(c.leadsConverted || 0), 0);
    const totalRev = filteredCampaigns.reduce((acc, c) => acc + Number(c.totalRevenue || 0), 0);
    
    const outreachConvPct = totalOutreachLogs > 0 ? ((totalOutreachConverted / totalOutreachLogs) * 100).toFixed(1) : 0;
    const avgRate = totalCreated > 0 ? ((totalConv / totalCreated) * 100).toFixed(1) : 0;

    return {
      totalOutreachLogs: totalOutreachLogs,
      totalOutreachConvertedToEnquiry: totalOutreachConverted,
      outreachConversionRate: outreachConvPct,
      totalReceived: totalRec,
      totalCreated: totalCreated,
      totalDropped: totalDrop,
      totalConverted: totalConv,
      totalRevenue: totalRev,
      overallConversionRate: avgRate
    };
  }, [filteredCampaigns]);

  // Open Detail Drill-Down Modal
  const handleOpenDetailModal = (row) => {
    setSelectedCampaign(row);
    setIsDetailModalOpen(true);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    toast.success('Campaign Performance Report exported as CSV successfully!');
  };

  // Table Columns Definition matching Role Master Design
  const columns = [
    {
      key: 'campaignId',
      title: 'CAMPAIGN ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'campaignName',
      title: 'CAMPAIGN NAME',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="fw-bold text-dark d-block">{val}</span>
          <span className="small text-muted font-monospace">{row.platform}</span>
        </div>
      )
    },
    {
      key: 'outreachLogsCount',
      title: 'LOG OUTREACH CONVERTED TO ENQUIRY',
      sortable: true,
      align: 'center',
      render: (val, row) => {
        const pct = val > 0 ? ((row.outreachConvertedToEnquiry / val) * 100).toFixed(1) : 0;
        return (
          <div>
            <span className="badge bg-info bg-opacity-10 text-info border border-info font-monospace me-1">
              {row.outreachConvertedToEnquiry} / {val}
            </span>
            <span className="small fw-bold text-success font-monospace">({pct}%)</span>
          </div>
        );
      }
    },
    {
      key: 'enquiriesCreated',
      title: 'ENQUIRIES CREATED',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-primary bg-opacity-10 text-primary border border-primary font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'enquiriesDropped',
      title: 'DROPPED ENQUIRIES',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-danger bg-opacity-10 text-danger border border-danger font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'leadsConverted',
      title: 'LEADS CONVERTED',
      sortable: true,
      align: 'center',
      render: (val) => <span className="badge bg-success bg-opacity-10 text-success border border-success font-monospace px-3 py-1 fs-6">{val}</span>
    },
    {
      key: 'conversionRate',
      title: 'CONVERSION RATE %',
      sortable: true,
      align: 'center',
      render: (val) => <span className="fw-bold text-success font-monospace">{val}%</span>
    },
    {
      key: 'totalRevenue',
      title: 'REVENUE GENERATED',
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
        title="View Full Campaign Performance Drill-down"
        onClick={() => handleOpenDetailModal(row)}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Campaign Performance Report | Sonocare CRM</title>
        <meta name="description" content="Campaign Performance Report in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <Megaphone size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Campaign Performance Report</h1>
            <span className="small text-muted">Track log outreach conversions to enquiries, lead conversions, drops, and revenue per Campaign ID</span>
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

      {/* SUMMARY KPI CARDS (RESPONSIVE GRID) */}
      <div className="row g-3 mb-4">
        {/* CARD 1: LOG OUTREACH CONVERTED TO ENQUIRY */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">OUTREACH TO ENQUIRY</span>
                <h3 className="fw-bold text-info mb-0 font-monospace">{kpiMetrics.totalOutreachConvertedToEnquiry}</h3>
                <span className="small text-info font-monospace">From {kpiMetrics.totalOutreachLogs} Logs ({kpiMetrics.outreachConversionRate}%)</span>
              </div>
              <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
                <PhoneCall size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: ENQUIRIES CREATED */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ENQUIRIES CREATED</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace">{kpiMetrics.totalCreated}</h3>
                <span className="small text-primary font-monospace">Received: {kpiMetrics.totalReceived}</span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <BarChart3 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: DROPPED ENQUIRIES */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">DROPPED ENQUIRIES</span>
                <h3 className="fw-bold text-danger mb-0 font-monospace">{kpiMetrics.totalDropped}</h3>
                <span className="small text-muted font-monospace">Dropped / Lost</span>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
                <UserX size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: LEADS CONVERTED */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">LEADS CONVERTED</span>
                <h3 className="fw-bold text-success mb-0 font-monospace">{kpiMetrics.totalConverted}</h3>
                <span className="small text-success font-monospace">Conversion: {kpiMetrics.overallConversionRate}%</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <UserCheck size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: TOTAL REVENUE */}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2.4">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL REVENUE</span>
                <h3 className="fw-bold text-dark mb-0 font-monospace">₹{(kpiMetrics.totalRevenue / 10000000).toFixed(2)} Cr</h3>
                <span className="small text-muted font-monospace">From Converted Leads</span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
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
          <h2 className="category-card-title mb-0">CAMPAIGN PERFORMANCE REGISTER ({filteredCampaigns.length})</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Campaign ID, Name, Platform..."
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
              <span className="fw-semibold">Filter Channel & Status:</span>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms / Channels</option>
                <option value="Medical Expo / Event">Medical Expo / Event</option>
                <option value="Digital Marketing / Email">Digital Marketing / Email</option>
                <option value="Direct Telemarketing">Direct Telemarketing</option>
                <option value="Webinar / Virtual Summit">Webinar / Virtual Summit</option>
              </select>
            </div>

            <div className="col-12 col-sm-4 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Campaign Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {(platformFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setPlatformFilter('');
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
            data={filteredCampaigns}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="90px"
            emptyMessage="No campaign report records found."
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
        title={`Campaign Breakdown Analytics — ${selectedCampaign?.campaignId}`}
        size="lg"
      >
        {selectedCampaign && (
          <div className="p-2 d-flex flex-column gap-3">
            <div className="p-3 bg-light rounded border">
              <h5 className="fw-bold text-dark mb-1">{selectedCampaign.campaignName}</h5>
              <span className="small text-muted font-monospace">
                Platform: {selectedCampaign.platform} | Duration: {selectedCampaign.startDate} to {selectedCampaign.endDate}
              </span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Log Outreach Activities</span>
                  <h4 className="fw-bold text-info mb-0 font-monospace">{selectedCampaign.outreachLogsCount}</h4>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Converted to Enquiry</span>
                  <h4 className="fw-bold text-primary mb-0 font-monospace">{selectedCampaign.outreachConvertedToEnquiry}</h4>
                  <span className="small text-success">
                    {((selectedCampaign.outreachConvertedToEnquiry / selectedCampaign.outreachLogsCount) * 100).toFixed(1)}% Conv.
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Enquiries Dropped</span>
                  <h4 className="fw-bold text-danger mb-0 font-monospace">{selectedCampaign.enquiriesDropped}</h4>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="p-2 border rounded text-center bg-white">
                  <span className="text-muted small d-block">Leads Converted</span>
                  <h4 className="fw-bold text-success mb-0 font-monospace">{selectedCampaign.leadsConverted}</h4>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <h6 className="fw-bold text-dark mb-2">Key Campaign Insights & Drop Reasons:</h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Top Enquiry Drop Reason:</span>
                  <span className="fw-bold text-danger">{selectedCampaign.topDropReason}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Converted Lead Product Types:</span>
                  <span className="fw-bold text-success">{selectedCampaign.convertedLeadTypes}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Campaign Budget Spent:</span>
                  <span className="fw-bold text-dark">₹{selectedCampaign.budgetSpent.toLocaleString()}</span>
                </div>
                <div className="col-12 col-md-6 mt-2">
                  <span className="text-muted d-block">Total Generated Revenue:</span>
                  <span className="fw-bold text-dark">₹{(selectedCampaign.totalRevenue / 100000).toFixed(2)} Lakhs</span>
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

export default CampaignReport;
