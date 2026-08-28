import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { toast, ToastContainer } from '../../components/Toast';
import {
  PhoneCall,
  Plus,
  Eye,
  Pencil,
  ArrowRightCircle,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/LogOutreach.css';
import {
  initialMockOutreachLogs,
  calculateActiveContactCountForEmployee
} from './mockOutreachLogs';
import { initialMockCampaignContacts } from './mockCampaignContacts';
import { initialMockEmployees } from './mockEmployees';
import { checkDuplicateEnquiry, allocateEnquiryEmployee } from './mockEnquiry';

// Mock Campaign List Lookup
const mockCampaignList = [
  { campaignId: 'CMP-001', campaignName: 'National Radiology Expo 2026' },
  { campaignId: 'CMP-002', campaignName: 'Q1 Diagnostic Scanner Promo' },
  { campaignId: 'CMP-003', campaignName: 'Cardiology Scanner Launch' },
  { campaignId: 'CMP-004', campaignName: 'Hospital AMC Renewal Drive' },
  { campaignId: 'CMP-005', campaignName: 'Medica South Asia Summit' }
];

const mockOutreachTypes = ['Call', 'Email', 'WhatsApp', 'SMS'];
const mockOutreachStatuses = ['Interested', 'Not Interested'];
const mockOutcomes = ['Success', 'Failed', 'In Progress', 'Paused', 'Completed'];

const LogOutreach = ({
  outreachLogs: propOutreachLogs,
  setOutreachLogs: propSetOutreachLogs,
  campaignContacts = initialMockCampaignContacts,
  employees = initialMockEmployees,
  enquiries = [],
  setEnquiries
}) => {
  const navigate = useNavigate();

  // Local state for outreach logs if not passed via props
  const [localOutreachLogs, setLocalOutreachLogs] = useState(initialMockOutreachLogs);
  const outreachLogs = propOutreachLogs || localOutreachLogs;
  const setOutreachLogs = propSetOutreachLogs || setLocalOutreachLogs;

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [outreachTypeFilter, setOutreachTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');

  // --- MODAL STATES ---
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtered dataset for main table
  const filteredLogs = useMemo(() => {
    return (outreachLogs || []).filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = log.outreachId && log.outreachId.toLowerCase().includes(q);
        const matchCamp = log.campaignId && log.campaignId.toLowerCase().includes(q);
        const matchContactId = log.contactId && log.contactId.toLowerCase().includes(q);
        const matchName = log.contactName && log.contactName.toLowerCase().includes(q);
        const matchMobile = log.mobile && log.mobile.includes(q);
        const matchEmp = log.assignedEmployeeName && log.assignedEmployeeName.toLowerCase().includes(q);

        if (!matchId && !matchCamp && !matchContactId && !matchName && !matchMobile && !matchEmp) {
          return false;
        }
      }

      if (campaignFilter && log.campaignId !== campaignFilter) return false;
      if (outreachTypeFilter && log.outreachType !== outreachTypeFilter) return false;
      if (statusFilter && log.outreachStatus !== statusFilter) return false;
      if (outcomeFilter && log.outcome !== outcomeFilter) return false;

      return true;
    });
  }, [outreachLogs, searchQuery, campaignFilter, outreachTypeFilter, statusFilter, outcomeFilter]);

  // Open History Modal
  const handleOpenHistoryModal = (log) => {
    setSelectedLog(log);
    setIsHistoryModalOpen(true);
  };

  // Open Convert Confirmation Modal
  const handleOpenConvertModal = (log) => {
    const isEligible = log.outcome === 'Success' && log.outreachStatus === 'Interested';
    if (!isEligible) {
      toast.warning('Conversion to Enquiry requires Outreach Status = Interested AND Outcome = Success.');
      return;
    }

    if (log.isConvertedToEnquiry) {
      toast.info(`Contact ${log.contactId} is already converted to Enquiry (${log.convertedEnquiryId}).`);
      return;
    }

    setSelectedLog(log);
    setIsConvertModalOpen(true);
  };

  // Confirm Convert to Enquiry Execution
  const handleConfirmConvert = () => {
    if (!selectedLog) return;

    // Validate required fields
    if (!selectedLog.contactName || !selectedLog.mobile || !selectedLog.email || !selectedLog.territory) {
      toast.error('Missing required contact or location details for enquiry conversion.');
      return;
    }
    if (!selectedLog.productCategory || !selectedLog.product) {
      toast.error('Missing Product Category or Product details. Please edit outreach log to provide product info.');
      return;
    }

    // 1. Run Duplicate Check against existing Enquiries
    const duplicate = checkDuplicateEnquiry(selectedLog.email, selectedLog.mobile, enquiries);
    if (duplicate) {
      toast.warning(`Possible Duplicate: An enquiry (${duplicate.enquiryId}) with matching contact already exists.`);
    }

    // 2. Generate Next Enquiry ID
    const nextNum =
      enquiries.length > 0
        ? Math.max(...enquiries.map((e) => parseInt((e.enquiryId || '').replace('ENQ-', ''), 10)).filter(Boolean)) + 1
        : 1;
    const newEnquiryId = `ENQ-${String(nextNum).padStart(3, '0')}`;

    // 3. Allocate Employee for Enquiry Master
    const allocation = allocateEnquiryEmployee(
      selectedLog.territory,
      selectedLog.department || 'Telecaller Team',
      'Normal',
      'Campaign',
      employees,
      enquiries,
      selectedLog.district,
      selectedLog.city
    );

    // 4. Create new Enquiry Record
    const newEnquiry = {
      id: Date.now(),
      enquiryId: newEnquiryId,
      customerName: selectedLog.institution || selectedLog.contactName,
      contactPerson: selectedLog.contactName,
      customerType: selectedLog.customerType || 'Hospital',
      otherCustomerType: selectedLog.otherCustomerType || '',
      hospitalInstitution: selectedLog.institution || '',
      mobile: selectedLog.mobile,
      email: selectedLog.email,
      state: selectedLog.territory,
      territory: selectedLog.territory,
      district: selectedLog.district || '',
      city: selectedLog.city || '',
      pincode: selectedLog.pincode || '',
      address: selectedLog.address || '',
      source: 'Campaign',
      sourceDetails: `Converted from Campaign Contact ${selectedLog.contactId} (${selectedLog.campaignId})`,
      campaignId: selectedLog.campaignId,
      campaignContactId: selectedLog.contactId,
      priority: 'Normal',
      department: allocation.department || selectedLog.department || 'Telecaller Team',
      assignedEmployeeId: allocation.assignedEmployeeId,
      assignedEmployeeName: allocation.assignedEmployeeName,
      productCategory: selectedLog.productCategory,
      product: selectedLog.product,
      serviceInterested: selectedLog.serviceInterested || 'One-Time Purchase',
      expectedTimeframe: selectedLog.expectedTimeframe || '1–3 Months',
      budget: selectedLog.budget || '',
      remarks: selectedLog.remarks || 'Converted from Campaign Contact Log Outreach.',
      status: 'Pending',
      enquiryDate: new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      daysSinceLastActivity: 0,
      isConvertedToLead: false
    };

    if (setEnquiries) {
      setEnquiries((prev) => [newEnquiry, ...prev]);
    }

    // 5. Update Outreach Logs status to Converted to Enquiry
    setOutreachLogs((prev) =>
      prev.map((l) =>
        l.contactId === selectedLog.contactId
          ? {
              ...l,
              isConvertedToEnquiry: true,
              convertedEnquiryId: newEnquiryId,
              outreachStatus: 'Interested',
              contactStatus: 'Converted to Enquiry'
            }
          : l
      )
    );

    setIsConvertModalOpen(false);
    toast.success(`Campaign Contact ${selectedLog.contactId} successfully converted to Enquiry ${newEnquiryId}!`);

    // Redirect to Enquiry Master page to show newly created enquiry
    setTimeout(() => {
      navigate('/masters/enquiries');
    }, 1000);
  };

  // History timeline records for selected contact
  const historyRecords = useMemo(() => {
    if (!selectedLog) return [];
    return outreachLogs
      .filter((l) => l.contactId === selectedLog.contactId)
      .sort((a, b) => new Date(b.outreachDate) - new Date(a.outreachDate));
  }, [selectedLog, outreachLogs]);

  // Table Columns Configuration (16 Columns)
  const columns = [
    {
      key: 'outreachId',
      title: 'OUTREACH ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'campaignId',
      title: 'CAMPAIGN ID',
      sortable: true,
      render: (val) => <span className="badge bg-info text-dark font-monospace">{val}</span>
    },
    {
      key: 'campaignName',
      title: 'CAMPAIGN NAME',
      sortable: true,
      render: (val) => <span className="small text-dark text-truncate d-inline-block" style={{ maxWidth: '140px' }}>{val}</span>
    },
    {
      key: 'contactId',
      title: 'CONTACT ID',
      sortable: true,
      render: (val) => <span className="badge bg-dark font-monospace">{val}</span>
    },
    {
      key: 'contactName',
      title: 'CONTACT NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'mobile',
      title: 'MOBILE',
      sortable: true,
      render: (val) => <span className="font-monospace small text-dark">{val}</span>
    },
    {
      key: 'email',
      title: 'EMAIL',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'department',
      title: 'DEPARTMENT',
      sortable: true,
      render: (val) => <span className="small text-dark">{val || '—'}</span>
    },
    {
      key: 'assignedEmployeeName',
      title: 'ASSIGNED EMPLOYEE',
      sortable: true,
      render: (val) => <span className="small fw-bold text-dark">{val || 'Unassigned'}</span>
    },
    {
      key: 'activeContactCount',
      title: 'ACTIVE CONTACT COUNT',
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const count = calculateActiveContactCountForEmployee(row.assignedEmployeeId, outreachLogs);
        return <span className={`badge ${count >= 50 ? 'bg-danger' : 'bg-secondary'}`}>{count} / 50</span>;
      }
    },
    {
      key: 'outreachType',
      title: 'OUTREACH TYPE',
      sortable: true,
      render: (val) => <span className={`log-outreach-type-badge ${val.toLowerCase()}`}>{val}</span>
    },
    {
      key: 'outreachStatus',
      title: 'STATUS',
      sortable: true,
      render: (val) => (
        <span className={`badge ${val === 'Interested' ? 'bg-success' : 'bg-secondary'}`}>{val}</span>
      )
    },
    {
      key: 'outcome',
      title: 'OUTCOME',
      sortable: true,
      render: (val) => {
        let cls = 'in-progress';
        if (val === 'Success') cls = 'success';
        if (val === 'Failed') cls = 'failed';
        if (val === 'Completed') cls = 'completed';
        if (val === 'Paused') cls = 'paused';
        return <span className={`log-outcome-badge ${cls}`}>{val}</span>;
      }
    },
    {
      key: 'outreachDate',
      title: 'DATE',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'outreachTime',
      title: 'TIME',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    }
  ];

  // Action Buttons Renderer (View History, Edit, Convert to Enquiry)
  const tableActions = (row) => {
    const isEligibleForConversion = row.outcome === 'Success' && row.outreachStatus === 'Interested' && !row.isConvertedToEnquiry;

    return (
      <div className="category-actions-container">
        <button
          type="button"
          className="category-action-btn view-btn"
          title="View Outreach History"
          onClick={() => navigate(`/campaign/log-outreach/${row.contactId}/history`)}
        >
          <Eye size={15} color="#2563EB" />
        </button>

        <button
          type="button"
          className="category-action-btn edit-btn"
          title="Edit Outreach Log"
          onClick={() => navigate(`/campaign/log-outreach/${row.outreachId}/edit`)}
        >
          <Pencil size={15} color="#16A34A" />
        </button>

        <button
          type="button"
          className="enquiry-convert-btn"
          title={row.isConvertedToEnquiry ? `Converted (${row.convertedEnquiryId})` : 'Convert to Enquiry'}
          onClick={() => handleOpenConvertModal(row)}
          disabled={!isEligibleForConversion || row.isConvertedToEnquiry}
          style={{ opacity: isEligibleForConversion ? 1 : 0.6 }}
        >
          <ArrowRightCircle size={14} />
          <span>{row.isConvertedToEnquiry ? 'Converted' : 'Convert'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="category-master-page log-outreach-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Log Outreach Activity | Sonocare CRM</title>
        <meta name="description" content="Log outreach activity for campaign contacts in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* TOP HEADER */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <PhoneCall size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Campaign Contact Log Outreach Activity</h1>
        </div>

        <div className="campaign-contacts-header-actions">
          <button
            type="button"
            className="campaign-contacts-action-btn add-btn"
            onClick={() => navigate('/campaign/log-outreach/add')}
          >
            <Plus size={18} />
            <span> Add Log Outreach</span>
          </button>
        </div>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="category-card">
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Outreach Log Register</h2>
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search Log ID, Campaign, Contact, Mobile, Employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
              >
                <option value="">All Campaigns</option>
                {mockCampaignList.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.campaignId} ({c.campaignName})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={outreachTypeFilter}
                onChange={(e) => setOutreachTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {mockOutreachTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {mockOutreachStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
              >
                <option value="">All Outcomes</option>
                {mockOutcomes.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      {/* TABLE */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredLogs}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="160px"
            emptyMessage="No outreach activity logs found"
            emptyIcon="bi-headset"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1400px"
          />
        </div>
      </div>

      {/* 1. CONVERT TO ENQUIRY CONFIRMATION MODAL POPUP */}
      <Modal
        show={isConvertModalOpen}
        onHide={() => setIsConvertModalOpen(false)}
        title="Convert to Enquiry Confirmation"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="outline-secondary" onClick={() => setIsConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmConvert}
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
            >
              Confirm & Convert to Enquiry
            </Button>
          </div>
        }
      >
        {selectedLog && (
          <div className="py-2">
            <div className="d-flex align-items-center gap-2 text-primary mb-3">
              <CheckCircle2 size={24} color="#2563EB" />
              <h6 className="mb-0 fw-bold text-dark">Confirm Conversion to Enquiry Master</h6>
            </div>
            <p className="small text-muted mb-3">
              This action will create a formal Enquiry record in Enquiry Master for Campaign Contact{' '}
              <strong>{selectedLog.contactName}</strong> (<strong>{selectedLog.contactId}</strong>) under Campaign{' '}
              <strong>{selectedLog.campaignId}</strong>.
            </p>

            <div className="p-3 bg-light rounded border small text-dark mb-3">
              <div><strong>Contact Name:</strong> {selectedLog.contactName}</div>
              <div><strong>Mobile / Email:</strong> {selectedLog.mobile} | {selectedLog.email || '—'}</div>
              <div><strong>Institution:</strong> {selectedLog.institution || '—'}</div>
              <div><strong>Territory:</strong> {selectedLog.territory}</div>
              <div><strong>Outreach Status:</strong> <span className="badge bg-success">{selectedLog.outreachStatus}</span></div>
              <div><strong>Outcome:</strong> <span className="badge bg-primary">{selectedLog.outcome}</span></div>
              <div><strong>Product Category:</strong> {selectedLog.productCategory || 'Medical & Diagnostic Scanners'}</div>
              <div><strong>Product:</strong> {selectedLog.product || 'Sonocare HD Cardiac Probe Transducer'}</div>
              <div><strong>Expected Timeframe:</strong> {selectedLog.expectedTimeframe || '1–3 Months'}</div>
              <div><strong>Budget:</strong> {selectedLog.budget ? `₹ ${selectedLog.budget}` : '—'}</div>
            </div>

            <p className="small text-dark mb-0 fw-semibold">
              The existing Enquiry duplicate detection and employee allocation engine will be executed automatically.
            </p>
          </div>
        )}
      </Modal>

      {/* 2. OUTREACH HISTORY TIMELINE MODAL */}
      <Modal
        show={isHistoryModalOpen}
        onHide={() => setIsHistoryModalOpen(false)}
        title={selectedLog ? `Outreach History — ${selectedLog.contactName} (${selectedLog.contactId})` : 'Outreach History'}
        size="lg"
        centered={true}
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button variant="outline-secondary" onClick={() => setIsHistoryModalOpen(false)}>
              Close History
            </Button>
          </div>
        }
      >
        {selectedLog && (
          <div className="py-2">
            <div className="p-3 bg-light rounded border mb-4">
              <div className="row g-2 small text-dark">
                <div className="col-12 col-md-6"><strong>Contact Name:</strong> {selectedLog.contactName}</div>
                <div className="col-12 col-md-6"><strong>Contact ID:</strong> {selectedLog.contactId}</div>
                <div className="col-12 col-md-6"><strong>Mobile:</strong> {selectedLog.mobile}</div>
                <div className="col-12 col-md-6"><strong>Email:</strong> {selectedLog.email || '—'}</div>
                <div className="col-12 col-md-6"><strong>Institution:</strong> {selectedLog.institution || '—'}</div>
                <div className="col-12 col-md-6"><strong>Territory:</strong> {selectedLog.territory || '—'}</div>
                <div className="col-12 col-md-6">
                  <strong>Total Outreach Attempts:</strong> <span className="badge bg-primary fs-6">{historyRecords.length}</span>
                </div>
                <div className="col-12 col-md-6">
                  <strong>Last Outreach:</strong> {historyRecords[0] ? `${historyRecords[0].outreachDate} ${historyRecords[0].outreachTime}` : '—'}
                </div>
              </div>
            </div>

            <h6 className="fw-bold text-dark mb-3">Outreach Timeline</h6>
            <div className="outreach-history-timeline">
              {historyRecords.map((rec, index) => (
                <div key={rec.id || index} className="outreach-history-item p-3 bg-white border rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-primary">
                      Outreach Attempt #{historyRecords.length - index} ({rec.outreachId})
                    </span>
                    <span className="small text-muted">{rec.outreachDate} at {rec.outreachTime}</span>
                  </div>

                  <div className="row g-2 small text-dark mb-2">
                    <div className="col-12 col-sm-4">
                      <strong>Assigned Employee:</strong> {rec.assignedEmployeeName}
                    </div>
                    <div className="col-12 col-sm-4">
                      <strong>Type:</strong> <span className={`log-outreach-type-badge ${rec.outreachType.toLowerCase()}`}>{rec.outreachType}</span>
                    </div>
                    <div className="col-12 col-sm-4">
                      <strong>Status:</strong> <span className={`badge ${rec.outreachStatus === 'Interested' ? 'bg-success' : 'bg-secondary'}`}>{rec.outreachStatus}</span>
                    </div>
                    <div className="col-12 col-sm-4">
                      <strong>Outcome:</strong> <span className={`log-outcome-badge ${rec.outcome.toLowerCase().replace(' ', '-')}`}>{rec.outcome}</span>
                    </div>
                    {rec.nextOutreachDate && (
                      <div className="col-12 col-sm-8 text-primary">
                        <strong>Next Outreach Scheduled:</strong> {rec.nextOutreachDate} {rec.nextOutreachTime}
                      </div>
                    )}
                  </div>

                  {rec.remarks && (
                    <div className="small text-muted bg-light p-2 rounded">
                      <strong>Remarks:</strong> {rec.remarks}
                    </div>
                  )}

                  {rec.product && (
                    <div className="mt-2 pt-2 border-top small">
                      <span className="fw-bold text-dark me-2">Product Interest:</span>
                      <span className="badge bg-light text-dark border me-2">{rec.productCategory}</span>
                      <span className="badge bg-info-subtle text-primary border me-2">{rec.product}</span>
                      <span className="badge bg-secondary-subtle text-dark border">{rec.serviceInterested}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LogOutreach;
