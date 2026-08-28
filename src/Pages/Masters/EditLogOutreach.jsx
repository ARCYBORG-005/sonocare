import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  PhoneCall,
  Building2,
  UserCheck,
  Package,
  Clock
} from 'lucide-react';
import '../../styles/LogOutreach.css';
import {
  initialMockOutreachLogs,
  calculateActiveContactCountForEmployee
} from './mockOutreachLogs';
import { initialMockCampaignContacts } from './mockCampaignContacts';
import { initialMockProducts } from './mockProducts';

const mockOutreachTypes = ['Call', 'Email', 'WhatsApp', 'SMS'];
const mockOutreachStatuses = ['Interested', 'Not Interested'];
const mockOutcomes = ['Success', 'Failed', 'In Progress', 'Paused', 'Completed'];
const mockProductCategories = [
  'Medical & Diagnostic Scanners',
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation'
];
const mockTimeframes = ['Immediate', 'Within 1 Month', '1–3 Months', '3–6 Months', '> 6 Months'];

const EditLogOutreach = ({
  outreachLogs = initialMockOutreachLogs,
  setOutreachLogs
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target log by numeric id or outreachId
  const targetLog = useMemo(() => {
    return (outreachLogs || []).find(
      (l) => String(l.id) === String(id) || l.outreachId === id
    );
  }, [outreachLogs, id]);

  const [formData, setFormData] = useState({
    outreachId: '',
    campaignId: '',
    campaignName: '',
    contactId: '',
    contactName: '',
    customerType: '',
    otherCustomerType: '',
    email: '',
    mobile: '',
    institution: '',
    territory: '',
    district: '',
    city: '',
    pincode: '',
    department: 'Telecaller Team',
    assignedEmployeeId: 'UNASSIGNED',
    assignedEmployeeName: 'Unassigned',
    outreachType: 'Call',
    outreachStatus: 'Interested',
    outcome: 'Success',
    outreachDate: new Date().toISOString().split('T')[0],
    outreachTime: '10:00 AM',
    nextOutreachDate: '',
    nextOutreachTime: '',
    remarks: '',
    productCategory: 'Medical & Diagnostic Scanners',
    product: 'Sonocare HD Cardiac Probe Transducer',
    serviceInterested: 'One-Time Purchase',
    expectedTimeframe: '1–3 Months',
    budget: '',
    remarks:''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (targetLog) {
      setFormData({
        outreachId: targetLog.outreachId || '',
        campaignId: targetLog.campaignId || '',
        campaignName: targetLog.campaignName || '',
        contactId: targetLog.contactId || '',
        contactName: targetLog.contactName || '',
        customerType: targetLog.customerType || '',
        otherCustomerType: targetLog.otherCustomerType || '',
        email: targetLog.email || '',
        mobile: targetLog.mobile || '',
        institution: targetLog.institution || '',
        territory: targetLog.territory || '',
        district: targetLog.district || '',
        city: targetLog.city || '',
        pincode: targetLog.pincode || '',
        department: targetLog.department || 'Telecaller Team',
        assignedEmployeeId: targetLog.assignedEmployeeId || 'UNASSIGNED',
        assignedEmployeeName: targetLog.assignedEmployeeName || 'Unassigned',
        outreachType: targetLog.outreachType || 'Call',
        outreachStatus: targetLog.outreachStatus || 'Interested',
        outcome: targetLog.outcome || 'Success',
        outreachDate: targetLog.outreachDate || new Date().toISOString().split('T')[0],
        outreachTime: targetLog.outreachTime || '10:00 AM',
        nextOutreachDate: targetLog.nextOutreachDate || '',
        nextOutreachTime: targetLog.nextOutreachTime || '',
        remarks: targetLog.remarks || '',
        productCategory: targetLog.productCategory || 'Medical & Diagnostic Scanners',
        product: targetLog.product || 'Sonocare HD Cardiac Probe Transducer',
        serviceInterested: targetLog.serviceInterested || 'One-Time Purchase',
        expectedTimeframe: targetLog.expectedTimeframe || '1–3 Months',
        budget: targetLog.budget || '',
         remarks:targetLog.remarks||''
      });
    }
  }, [targetLog]);

  // Cascading Products Options
  const availableProducts = useMemo(() => {
    if (!formData.productCategory) return [];
    const filtered = initialMockProducts.filter((p) => p.category === formData.productCategory);
    return filtered.length > 0 ? filtered.map((p) => p.productName) : ['General Equipment'];
  }, [formData.productCategory]);

  // Employee Active Contact Count system calculation
  const employeeActiveContactCount = useMemo(() => {
    if (!formData.assignedEmployeeId || formData.assignedEmployeeId === 'UNASSIGNED') return 0;
    return calculateActiveContactCountForEmployee(formData.assignedEmployeeId, outreachLogs);
  }, [formData.assignedEmployeeId, outreachLogs]);

  // Generic Input Handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'productCategory') {
        const prods = initialMockProducts.filter((p) => p.category === value);
        next.product = prods.length > 0 ? prods[0].productName : 'General Equipment';
      }
      return next;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Save Edit Log Outreach
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.outreachType || !formData.outreachStatus || !formData.outcome) {
      toast.error('Please fill required outreach fields.');
      return;
    }

    if (setOutreachLogs) {
      setOutreachLogs((prev) =>
        prev.map((l) =>
          l.outreachId === formData.outreachId || String(l.id) === String(id)
            ? { ...l, ...formData }
            : l
        )
      );
    }

    toast.success(`Outreach Log ${formData.outreachId} updated successfully.`);
    navigate('/campaign/log-outreach');
  };

  if (!targetLog) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Outreach activity log not found.</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/campaign/log-outreach')}
        >
          Back to Outreach Logs
        </button>
      </div>
    );
  }

  return (
    <div className="log-outreach-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`Edit Log Outreach (${formData.outreachId})`} | Sonocare CRM</title>
        <meta name="description" content="Edit campaign contact log outreach activity in Sonocare CRM." />
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
          <h1 className="category-page-title">Edit Log Outreach Activity ({formData.outreachId})</h1>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit}>
        {/* SECTION 1 — CAMPAIGN CONTACT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CAMPAIGN CONTACT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField label="Campaign ID" value={formData.campaignId} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Campaign Name" value={formData.campaignName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Campaign Contact ID" value={formData.contactId} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Contact Name" value={formData.contactName} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Email" value={formData.email} disabled={true} />
              </div>
              <div className="col-12 col-md-6">
                <InputField label="Mobile Number" value={formData.mobile} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Customer Type" value={formData.customerType} disabled={true} />
              </div>
              <div className="col-12 col-md-8">
                <InputField label="Hospital / Institution" value={formData.institution} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="Territory" value={formData.territory} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="District" value={formData.district} disabled={true} />
              </div>
              <div className="col-12 col-md-4">
                <InputField label="City" value={formData.city} disabled={true} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — DEPARTMENT & EMPLOYEE ASSIGNMENT */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <UserCheck size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — DEPARTMENT & EMPLOYEE ASSIGNMENT</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField
                  label="Target Department (Auto-Determined)"
                  value={formData.department}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Assigned Employee (Auto-Determined)"
                  value={formData.assignedEmployeeName}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Employee Active Contact Count"
                  value={`${employeeActiveContactCount} / 50`}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — OUTREACH ACTIVITY */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <PhoneCall size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — OUTREACH ACTIVITY</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Type "
                  options={mockOutreachTypes}
                  value={formData.outreachType}
                  onChange={(e) => handleInputChange('outreachType', e.target.value)}
                  error={formErrors.outreachType}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outreach Status "
                  options={mockOutreachStatuses}
                  value={formData.outreachStatus}
                  onChange={(e) => handleInputChange('outreachStatus', e.target.value)}
                  error={formErrors.outreachStatus}
                />
              </div>
              <div className="col-12 col-md-4">
                <Dropdown
                  label="Outcome "
                  options={mockOutcomes}
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  error={formErrors.outcome}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Outreach Date "
                  type="date"
                  value={formData.outreachDate}
                  onChange={(e) => handleInputChange('outreachDate', e.target.value)}
                  error={formErrors.outreachDate}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Outreach Time "
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={formData.outreachTime}
                  onChange={(e) => handleInputChange('outreachTime', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Next Outreach Date "
                  type="date"
                  value={formData.nextOutreachDate}
                  onChange={(e) => handleInputChange('nextOutreachDate', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Next Outreach Time "
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={formData.nextOutreachTime}
                  onChange={(e) => handleInputChange('nextOutreachTime', e.target.value)}
                />
              </div>
              <div className="col-12">
                <InputField
                  label="Remarks"
                  type="textarea"
                  rows={3}
                  placeholder="Outreach notes & details..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — PRODUCT INTEREST (Shown if Interested or Success) */}
        {(formData.outreachStatus === 'Interested' || formData.outcome === 'Success') && (
          <>
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <Package size={20} color="#2E3192" />
                <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 4 — PRODUCT INTEREST</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Product Category"
                      options={mockProductCategories}
                      value={formData.productCategory}
                      onChange={(e) => handleInputChange('productCategory', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Product"
                      options={availableProducts}
                      value={formData.product}
                      onChange={(e) => handleInputChange('product', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Dropdown
                      label="Service Interested"
                      options={['One-Time Purchase', 'Subscription']}
                      value={formData.serviceInterested}
                      onChange={(e) => handleInputChange('serviceInterested', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 — PURCHASE INFORMATION */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                <Clock size={20} color="#2E3192" />
                <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 5 — PURCHASE INFORMATION</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Expected Timeframe"
                      options={mockTimeframes}
                      value={formData.expectedTimeframe}
                      onChange={(e) => handleInputChange('expectedTimeframe', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Budget (₹)"
                      type="number"
                      placeholder="e.g. 500000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FORM BUTTONS */}
        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/campaign/log-outreach')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Update Log Outreach
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLogOutreach;
