import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  Clock,
  PhoneCall,
  UserCheck,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Lead.css';
import {
  initialMockLeads,
  initialMockFollowUps
} from './mockLead';

const outreachTypeOptions = ['Call', 'Email', 'WhatsApp', 'SMS', 'Meeting', 'Other'];
const followUpStatusOptions = ['Interested', 'Not Interested'];
const outcomeOptions = ['Success', 'Failure', 'In Progress', 'Completed', 'Drop'];

const AddLeadFollowUp = ({
  leads = initialMockLeads,
  followUps = initialMockFollowUps,
  setFollowUps,
  setLeads
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Target lead if :id route parameter is provided
  const targetLead = useMemo(() => {
    if (!id) return (leads || [])[0] || null;
    return (leads || []).find((l) => l.leadId === id || String(l.id) === String(id)) || (leads || [])[0] || null;
  }, [leads, id]);

  const [selectedLead, setSelectedLead] = useState(targetLead);

  const [formData, setFormData] = useState({
    outreachType: 'Call',
    followUpStatus: 'Interested',
    outcome: 'Success',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nextFollowUpDate: '',
    nextFollowUpTime: '',
    title: 'Sales Follow-up Interaction',
    description: targetLead ? `Follow-up discussion with ${targetLead.contactPerson} regarding ${targetLead.product}.` : '',
    remarks: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Input change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!selectedLead) errors.lead = 'Please select a valid Lead';
    if (!formData.outreachType) errors.outreachType = 'Outreach Type is required';
    if (!formData.followUpStatus) errors.followUpStatus = 'Follow-up Status is required';
    if (!formData.outcome) errors.outcome = 'Outcome is required';
    if (!formData.followUpDate) errors.followUpDate = 'Follow-up Date is required';
    if (!formData.title.trim()) errors.title = 'Activity Title is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix form validation errors before saving.');
      return;
    }

    const newFollowUp = {
      id: Date.now(),
      leadId: selectedLead.leadId,
      outreachType: formData.outreachType,
      followUpStatus: formData.followUpStatus,
      outcome: formData.outcome,
      followUpDate: formData.followUpDate,
      followUpTime: formData.followUpTime,
      nextFollowUpDate: formData.nextFollowUpDate,
      nextFollowUpTime: formData.nextFollowUpTime,
      title: formData.title.trim(),
      description: formData.description.trim(),
      remarks: formData.remarks.trim(),
      assignedEmployeeName: selectedLead.assignedEmployeeName || 'Sales Executive'
    };

    if (setFollowUps) {
      setFollowUps((prev) => [newFollowUp, ...(prev || [])]);
    }

    // Auto Lead Status update: Open -> In Progress upon first follow-up logged
    if (selectedLead.leadStatus === 'Open' && setLeads) {
      setLeads((prev) =>
        prev.map((l) =>
          l.leadId === selectedLead.leadId
            ? {
                ...l,
                leadStatus: 'In Progress',
                lastActivityDate: formData.followUpDate,
                nextFollowUpDate: formData.nextFollowUpDate,
                nextFollowUpTime: formData.nextFollowUpTime
              }
            : l
        )
      );
      toast.success(`Follow-up saved! Lead status automatically updated to 'In Progress'.`);
    } else {
      if (setLeads) {
        setLeads((prev) =>
          prev.map((l) =>
            l.leadId === selectedLead.leadId
              ? {
                  ...l,
                  lastActivityDate: formData.followUpDate,
                  nextFollowUpDate: formData.nextFollowUpDate,
                  nextFollowUpTime: formData.nextFollowUpTime
                }
              : l
          )
        );
      }
      toast.success(`Follow-up activity logged for Lead ${selectedLead.leadId}.`);
    }

    // Redirect to the dedicated follow-up history page for this lead
    navigate(`/leads/${selectedLead.leadId}/follow-ups`);
  };

  return (
    <div className="category-master-page lead-management-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>
          {selectedLead
            ? `Add Follow-up Activity — ${selectedLead.customerName} (${selectedLead.leadId}) | Sonocare CRM`
            : 'Add Lead Follow-up Activity | Sonocare CRM'}
        </title>
        <meta name="description" content="Log a new sales follow-up activity in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

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
          <PhoneCall size={28} style={{ color: '#2E3192' }} />
          <div>
            <h1 className="category-page-title mb-0">Add Follow-up Activity</h1>
            <span className="small text-muted">
              {selectedLead
                ? `Recording interaction for ${selectedLead.customerName} (${selectedLead.leadId})`
                : 'Record a new customer contact interaction'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — LEAD RECORD SUMMARY */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — LEAD RECORD DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark mb-1">Select Lead Record *</label>
                <select
                  className="form-select"
                  value={selectedLead ? selectedLead.leadId : ''}
                  onChange={(e) => {
                    const matched = (leads || []).find((l) => l.leadId === e.target.value);
                    setSelectedLead(matched || null);
                  }}
                >
                  {(leads || []).map((l) => (
                    <option key={l.leadId} value={l.leadId}>
                      {l.leadId} — {l.customerName} ({l.contactPerson}) — Status: {l.leadStatus}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLead && (
                <>
                  <div className="col-12 col-md-3">
                    <InputField
                      label="Customer Type"
                      value={selectedLead.customerType || '—'}
                      disabled={true}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <InputField
                      label="Assigned Executive"
                      value={selectedLead.assignedEmployeeName || 'Sales Executive'}
                      disabled={true}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <InputField
                      label="Contact Person"
                      value={`${selectedLead.contactPerson} (${selectedLead.mobile})`}
                      disabled={true}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <InputField
                      label="Product Interest"
                      value={selectedLead.product || '—'}
                      disabled={true}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <InputField
                      label="Current Lead Status"
                      value={selectedLead.leadStatus}
                      disabled={true}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 — FOLLOW-UP INTERACTION DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — FOLLOW-UP INTERACTION DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Type *"
                  options={outreachTypeOptions}
                  value={formData.outreachType}
                  onChange={(e) => handleInputChange('outreachType', e.target.value)}
                  error={formErrors.outreachType}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Follow-up Status *"
                  options={followUpStatusOptions}
                  value={formData.followUpStatus}
                  onChange={(e) => handleInputChange('followUpStatus', e.target.value)}
                  error={formErrors.followUpStatus}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outcome *"
                  options={outcomeOptions}
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  error={formErrors.outcome}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Date *"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                  error={formErrors.followUpDate}
                  required={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Follow-up Time"
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={formData.followUpTime}
                  onChange={(e) => handleInputChange('followUpTime', e.target.value)}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Activity Title *"
                  placeholder="e.g. Discussed clinical features & quotation options"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={formErrors.title}
                  required={true}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Interaction Description"
                  type="textarea"
                  rows={4}
                  placeholder="Detailed discussion summary with customer..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — NEXT FOLLOW-UP & REMARKS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Calendar size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — NEXT SCHEDULED ACTIVITY & REMARKS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Date (Optional)"
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Next Follow-up Time"
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  value={formData.nextFollowUpTime}
                  onChange={(e) => handleInputChange('nextFollowUpTime', e.target.value)}
                />
              </div>

              <div className="col-12">
                <InputField
                  label="Remarks / Action Plan"
                  type="textarea"
                  rows={2}
                  placeholder="e.g. Prepare revised quote and send product brochure before Friday"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => (selectedLead ? navigate(`/leads/${selectedLead.leadId}/follow-ups`) : navigate('/leads'))}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Save Follow-up Activity
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadFollowUp;
