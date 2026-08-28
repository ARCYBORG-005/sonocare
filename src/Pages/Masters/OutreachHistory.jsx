import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Table from '../../components/Table';
import Button from '../../components/Button';
import { InputField } from '../../components/FormInputs';
import { ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  PhoneCall,
  Building2,
  Clock,
  Plus
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/LogOutreach.css';
import { initialMockOutreachLogs } from './mockOutreachLogs';
import { initialMockCampaignContacts } from './mockCampaignContacts';

const OutreachHistory = ({
  outreachLogs = initialMockOutreachLogs,
  campaignContacts = initialMockCampaignContacts
}) => {
  const navigate = useNavigate();
  const { contactId } = useParams();

  // Find contact details
  const contact = useMemo(() => {
    return (campaignContacts || []).find(
      (c) => c.contactId === contactId || String(c.id) === String(contactId)
    );
  }, [campaignContacts, contactId]);

  // Find all outreach activity records for this contact sorted chronologically
  const historyRecords = useMemo(() => {
    return (outreachLogs || [])
      .filter((l) => l.contactId === contactId || (contact && l.contactId === contact.contactId))
      .sort((a, b) => new Date(b.outreachDate) - new Date(a.outreachDate));
  }, [outreachLogs, contactId, contact]);

  const latestRecord = historyRecords.length > 0 ? historyRecords[0] : null;

  // Table Columns Configuration for History
  const columns = [
    {
      key: 'outreachId',
      title: 'OUTREACH ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'outreachDate',
      title: 'DATE',
      sortable: true,
      render: (val) => <span className="small text-dark font-monospace">{val || '—'}</span>
    },
    {
      key: 'outreachTime',
      title: 'TIME',
      sortable: true,
      render: (val) => <span className="small text-muted">{val || '—'}</span>
    },
    {
      key: 'assignedEmployeeName',
      title: 'ASSIGNED EMPLOYEE',
      sortable: true,
      render: (val) => <span className="small fw-bold text-dark">{val || 'Unassigned'}</span>
    },
    {
      key: 'outreachType',
      title: 'TYPE',
      sortable: true,
      render: (val) => <span className={`log-outreach-type-badge ${(val || '').toLowerCase()}`}>{val}</span>
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
      key: 'nextOutreach',
      title: 'NEXT SCHEDULED',
      sortable: true,
      render: (_, row) =>
        row.nextOutreachDate ? (
          <span className="small text-primary font-monospace">
            {row.nextOutreachDate} {row.nextOutreachTime ? `(${row.nextOutreachTime})` : ''}
          </span>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'product',
      title: 'PRODUCT INTEREST',
      sortable: true,
      render: (val, row) =>
        val ? (
          <div className="small">
            <span className="badge bg-light text-dark border me-1">{row.productCategory}</span>
            <span className="badge bg-info-subtle text-primary border">{val}</span>
          </div>
        ) : (
          <span className="small text-muted">—</span>
        )
    },
    {
      key: 'remarks',
      title: 'REMARKS & NOTES',
      sortable: true,
      render: (val) => (
        <span className="small text-dark text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={val}>
          {val || '—'}
        </span>
      )
    }
  ];

  if (!contact && historyRecords.length === 0) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">No outreach history found for Contact ID: {contactId}</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/campaign/log-outreach')}
          style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
        >
          Back to Outreach Logs
        </button>
      </div>
    );
  }

  const contactName = contact ? contact.contactName : latestRecord ? latestRecord.contactName : contactId;

  return (
    <div className="category-master-page log-outreach-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`Outreach History — ${contactName}`} | Sonocare CRM</title>
        <meta name="description" content="View complete history of all outreach attempts for campaign contact in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/campaign/log-outreach')}
            title="Back to Outreach Logs"
          >
            <ArrowLeft size={18} />
          </button>
          <PhoneCall size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">
            Outreach History — {contactName} ({contactId})
          </h1>
        </div>

        <button
          type="button"
          className="campaign-contacts-action-btn add-btn"
          onClick={() => navigate('/campaign/log-outreach/add')}
        >
          <Plus size={18} />
          <span>  Log New Outreach Attempt</span>
        </button>
      </div>

      {/* CONTACT SUMMARY CARD (MATCHES ADD PAGE DESIGN) */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CAMPAIGN CONTACT DETAILS</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary fs-6">{historyRecords.length} Total Attempts</span>

          </div>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField
                label="Campaign ID"
                value={contact ? contact.campaignId : latestRecord ? latestRecord.campaignId : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Campaign Name"
                value={latestRecord ? latestRecord.campaignName : 'National Radiology Expo 2026'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Campaign Contact ID" value={contactId} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Contact Name" value={contactName} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Email"
                value={contact ? contact.email : latestRecord ? latestRecord.email : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Mobile Number"
                value={contact ? contact.mobile : latestRecord ? latestRecord.mobile : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="Customer Type"
                value={contact ? contact.customerType : latestRecord ? latestRecord.customerType : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-8">
              <InputField
                label="Hospital / Institution"
                value={contact ? contact.institution : latestRecord ? latestRecord.institution : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="Territory"
                value={contact ? contact.territory : latestRecord ? latestRecord.territory : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="District"
                value={contact ? contact.district : latestRecord ? latestRecord.district : '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-4">
              <InputField
                label="City"
                value={contact ? contact.city : latestRecord ? latestRecord.city : '—'}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RESPONSIVE TABLE VIEW SECTION */}
      <div className="category-card mb-4">
        <div className="category-card-header pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h2 className="category-card-title">Outreach History Register</h2>
          </div>
          <span className="badge bg-primary fs-6">{historyRecords.length} Total Logs</span>
        </div>

        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={historyRecords}
            showSerialNumber={true}
            serialNumberHeader="S.NO"
            emptyMessage="No outreach activity logs recorded yet for this contact."
            emptyIcon="bi-clock-history"
            paginated={true}
            pageSizeOptions={[25, 50, 100]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="1200px"
          />
        </div>
      </div>
    </div>
  );
};

export default OutreachHistory;
