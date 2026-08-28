import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField } from '../../components/FormInputs';
import {
  ArrowLeft,
  UserCheck,
  Building2,
  Package,
  UserCog
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';

const ViewLead = ({
  leads = []
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target lead
  const lead = useMemo(() => {
    return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id));
  }, [leads, id]);

  if (!lead) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Lead Record Not Found</h4>
        <Button variant="primary" onClick={() => navigate('/leads')} className="mt-3">
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`View Lead ${lead.leadId}`} | Sonocare CRM</title>
        <meta name="description" content="View sales lead details in Sonocare CRM." />
      </Helmet>

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/leads')}
            title="Back to Leads"
          >
            <ArrowLeft size={18} />
          </button>
          <UserCheck size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">
            View Lead — {lead.customerName} ({lead.leadId})
          </h1>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary fw-bold"
          onClick={() => navigate(`/leads/${lead.leadId}/edit`)}
        >
          Edit Lead
        </button>
      </div>

      {/* SECTION 1 — CUSTOMER & CONTACT INFORMATION */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CUSTOMER & CONTACT DETAILS</h5>
          </div>
          <span className={`lead-status-badge ${lead.leadStatus.toLowerCase().replace(' ', '-')}`}>
            Status: {lead.leadStatus}
          </span>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <InputField label="Lead ID" value={lead.leadId} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="Enquiry ID" value={lead.enquiryId || '—'} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="Customer Type" value={lead.customerType} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Customer Name" value={lead.customerName} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Contact Person" value={lead.contactPerson} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Mobile Number" value={lead.mobile} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Email Address" value={lead.email} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="Territory" value={lead.territory} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="District" value={lead.district || '—'} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="City" value={lead.city || '—'} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — PRODUCT & COMMERCIAL REQUIREMENT */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Package size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — PRODUCT & COMMERCIAL INTEREST</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Product Category" value={lead.productCategory} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Product Name" value={lead.product} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="Service Interested" value={lead.serviceInterested || '—'} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField label="Expected Timeframe" value={lead.expectedPurchaseTimeframe || '—'} disabled={true} />
            </div>

            <div className="col-12 col-md-4">
              <InputField
                label="Budget (₹)"
                value={lead.budget ? `₹ ${Number(lead.budget).toLocaleString('en-IN')}` : '—'}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — ASSIGNMENT & STATUS */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <UserCog size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — DEPARTMENT & EMPLOYEE ASSIGNMENT</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Department" value={lead.department || 'Sales Team'} disabled={true} />
            </div>

            <div className="col-12 col-md-6">
              <InputField label="Assigned Employee" value={lead.assignedEmployeeName || 'Unassigned'} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="d-flex justify-content-end gap-2 pb-5">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => navigate('/leads')}
        >
          Back to Leads
        </Button>
      </div>
    </div>
  );
};

export default ViewLead;
