import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { ArrowLeft, Plus, Trash2, Building2, Layers, Users, Clock } from 'lucide-react';
import {
  mockTerritoryMasterData,
  mockDistrictMasterData,
  mockCityMasterData,
  mockSourceMasterData,
  mockCampaignMasterData,
  mockEmployeeData
} from './mockCustomers';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Customer.css';

const EditCustomer = ({ customers, setCustomers }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target customer by ID or customerId
  const targetCustomer = useMemo(() => {
    return (customers || []).find((c) => String(c.id) === String(id) || c.customerId === id);
  }, [customers, id]);

  const [formData, setFormData] = useState({
    customerId: '',
    customerType: '',
    customerName: '',
    country: 'India',
    territoryId: '',
    territoryName: '',
    district: '',
    city: '',
    pincode: '',
    address: '',
    gstNo: '',
    panNo: '',
    sourceId: '',
    sourceName: '',
    referralPersonName: '',
    organizationName: '',
    referralPhone: '',
    referralEmail: '',
    referralTerritory: '',
    websiteName: '',
    websiteLink: '',
    handledEmployee: '',
    handledEmployeeId: '',
    handledBy: '',
    campaignId: '',
    campaignName: '',
    status: 'Active',
    createdBy: '',
    createdDate: ''
  });

  const [contacts, setContacts] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [contactErrors, setContactErrors] = useState({});
  const [contactToDeleteIndex, setContactToDeleteIndex] = useState(null);

  // Pre-populate form data on component mount / targetCustomer load
  useEffect(() => {
    if (targetCustomer) {
      setFormData({
        customerId: targetCustomer.customerId || '',
        customerType: targetCustomer.customerType || '',
        customerName: targetCustomer.customerName || '',
        country: targetCustomer.country || 'India',
        territoryId: targetCustomer.territoryId || '',
        territoryName: targetCustomer.territoryName || '',
        district: targetCustomer.district || '',
        city: targetCustomer.city || '',
        pincode: targetCustomer.pincode || '',
        address: targetCustomer.address || '',
        gstNo: targetCustomer.gstNo || '',
        panNo: targetCustomer.panNo || '',
        sourceId: targetCustomer.sourceId || '',
        sourceName: targetCustomer.sourceName || '',
        referralPersonName: targetCustomer.referralPersonName || '',
        organizationName: targetCustomer.organizationName || '',
        referralPhone: targetCustomer.referralPhone || '',
        referralEmail: targetCustomer.referralEmail || '',
        referralTerritory: targetCustomer.referralTerritory || '',
        websiteName: targetCustomer.websiteName || '',
        websiteLink: targetCustomer.websiteLink || '',
        handledEmployee: targetCustomer.handledEmployee || '',
        handledEmployeeId: targetCustomer.handledEmployeeId || '',
        handledBy: targetCustomer.handledBy || '',
        campaignId: targetCustomer.campaignId || '',
        campaignName: targetCustomer.campaignName || '',
        status: targetCustomer.status || 'Active',
        createdBy: targetCustomer.createdBy || `${mockEmployeeData.employeeId} (${mockEmployeeData.name})`,
        createdDate: targetCustomer.createdDate || ''
      });

      setContacts(
        targetCustomer.contacts && targetCustomer.contacts.length > 0
          ? targetCustomer.contacts
          : [
              {
                contactId: 'CONT-0001',
                contactType: 'Primary',
                contactPerson: '',
                role: '',
                phone1: '',
                phone2: '',
                email: ''
              }
            ]
      );
    }
  }, [targetCustomer]);

  // Helper to generate unique Contact ID
  const getNextContactId = (existingContacts) => {
    let maxIdNum = 0;
    (customers || []).forEach((c) => {
      (c.contacts || []).forEach((ct) => {
        const numStr = (ct.contactId || '').replace('CONT-', '');
        const n = parseInt(numStr, 10);
        if (n > maxIdNum) maxIdNum = n;
      });
    });
    (existingContacts || []).forEach((ct) => {
      const numStr = (ct.contactId || '').replace('CONT-', '');
      const n = parseInt(numStr, 10);
      if (n > maxIdNum) maxIdNum = n;
    });
    return `CONT-${String(maxIdNum + 1).padStart(4, '0')}`;
  };

  // Cascading dropdown options
  const availableDistricts = useMemo(() => {
    if (!formData.territoryName) return [];
    return mockDistrictMasterData[formData.territoryName] || [];
  }, [formData.territoryName]);

  const availableCities = useMemo(() => {
    if (!formData.district) return [];
    return mockCityMasterData[formData.district] || [];
  }, [formData.district]);

  // Input Handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'territoryName') {
        const matchedT = mockTerritoryMasterData.find((t) => t.name === value);
        updated.territoryId = matchedT ? matchedT.territoryId : '';
        updated.district = '';
        updated.city = '';
      } else if (field === 'district') {
        updated.city = '';
      } else if (field === 'campaignId') {
        const matchedC = mockCampaignMasterData.find((c) => c.campaignId === value);
        updated.campaignName = matchedC ? matchedC.name : '';
      } else if (field === 'sourceName') {
        const matchedS = mockSourceMasterData.find((s) => s.name === value);
        updated.sourceId = matchedS ? matchedS.sourceId : '';
      }
      return updated;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Contact Field Change Handler
  const handleContactChange = (index, field, value) => {
    setContacts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

    const errorKey = `${index}_${field}`;
    if (contactErrors[errorKey]) {
      setContactErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Add Contact Handler (Max 4 Rule)
  const handleAddContact = () => {
    if (contacts.length >= 4) {
      toast.error('Maximum 4 contacts are allowed for a customer.');
      return;
    }
    const newContactId = getNextContactId(contacts);
    setContacts((prev) => [
      ...prev,
      {
        contactId: newContactId,
        contactType: 'Secondary',
        contactPerson: '',
        role: '',
        phone1: '',
        phone2: '',
        email: ''
      }
    ]);
  };

  // Confirm Delete Contact Handler
  const handleConfirmDeleteContact = () => {
    if (contactToDeleteIndex === null) return;
    setContacts((prev) => prev.filter((_, idx) => idx !== contactToDeleteIndex));
    setContactToDeleteIndex(null);
    toast.success('Contact removed from customer.');
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    const cErrors = {};

    if (!formData.customerType) errors.customerType = 'Customer Type is required';
    if (!formData.customerName.trim()) errors.customerName = 'Customer Name is required';
    if (!formData.territoryName) errors.territoryName = 'Territory is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.city) errors.city = 'City is required';

    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'PIN code must be exactly 6 digits';
    }

    if (!formData.address.trim()) errors.address = 'Address is required';

    contacts.forEach((contact, idx) => {
      if (!contact.contactPerson.trim()) {
        cErrors[`${idx}_contactPerson`] = 'Contact Person is required';
      }
      if (!contact.role.trim()) {
        cErrors[`${idx}_role`] = 'Role / Designation is required';
      }
      if (!contact.phone1.trim()) {
        cErrors[`${idx}_phone1`] = 'Phone 1 is required';
      }
      if (contact.email && contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
        cErrors[`${idx}_email`] = 'Invalid email address format';
      }
    });

    setFormErrors(errors);
    setContactErrors(cErrors);
    return Object.keys(errors).length === 0 && Object.keys(cErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting.');
      return;
    }

    const currentDateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setCustomers((prev) =>
      prev.map((c) =>
        c.customerId === formData.customerId || String(c.id) === String(id)
          ? {
              ...c,
              customerType: formData.customerType,
              customerName: formData.customerName.trim(),
              country: formData.country || 'India',
              territoryId: formData.territoryId,
              territoryName: formData.territoryName,
              district: formData.district,
              city: formData.city,
              pincode: formData.pincode.trim(),
              address: formData.address.trim(),
              gstNo: formData.gstNo ? formData.gstNo.trim() : '',
              panNo: formData.panNo ? formData.panNo.trim() : '',
              sourceId: formData.sourceId,
              sourceName: formData.sourceName,
              referralPersonName: formData.referralPersonName ? formData.referralPersonName.trim() : '',
              organizationName: formData.organizationName ? formData.organizationName.trim() : '',
              referralPhone: formData.referralPhone ? formData.referralPhone.trim() : '',
              referralEmail: formData.referralEmail ? formData.referralEmail.trim() : '',
              referralTerritory: formData.referralTerritory || '',
              websiteName: formData.websiteName ? formData.websiteName.trim() : '',
              websiteLink: formData.websiteLink ? formData.websiteLink.trim() : '',
              handledEmployee: formData.handledEmployee ? formData.handledEmployee.trim() : '',
              handledEmployeeId: formData.handledEmployeeId ? formData.handledEmployeeId.trim() : '',
              handledBy: formData.handledBy ? formData.handledBy.trim() : '',
              campaignId: formData.campaignId,
              campaignName: formData.campaignName,
              status: formData.status,
              updatedBy: `${mockEmployeeData.employeeId} (${mockEmployeeData.name})`,
              updatedDate: currentDateStr,
              contacts: contacts.map((ct) => ({
                ...ct,
                contactPerson: ct.contactPerson.trim(),
                role: ct.role.trim(),
                phone1: ct.phone1.trim(),
                phone2: ct.phone2 ? ct.phone2.trim() : '',
                email: ct.email ? ct.email.trim() : ''
              }))
            }
          : c
      )
    );

    toast.success('Customer updated successfully.');
    navigate('/masters/customers');
  };

  if (!targetCustomer) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Customer record not found.</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/masters/customers')}>
          Back to Customer Master
        </button>
      </div>
    );
  }

  return (
    <div className="customer-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Edit Customer | Sonocare CRM</title>
        <meta name="description" content="Edit existing customer details in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/masters/customers')}
            title="Back to Customer Master"
          >
            <ArrowLeft size={18} />
          </button>
          <Users size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Edit Customer ({formData.customerId})</h1>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} noValidate>
        {/* SECTION 1 — CUSTOMER DETAILS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Building2 size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CUSTOMER DETAILS</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Row 1: Customer ID & Customer Type */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer ID (Read-only)"
                  value={formData.customerId}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Customer Type"
                  required={true}
                  options={['Hospital', 'Diagnostic Center', 'Clinic']}
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                  error={formErrors.customerType}
                />
              </div>

              {/* Row 2: Customer Name & Country */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer Name"
                  placeholder="Customer Name"
                  required={true}
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={formErrors.customerName}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Country"
                  options={['India']}
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>

              {/* Row 3: Territory & District */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Territory"
                  required={true}
                  options={mockTerritoryMasterData.map((t) => t.name)}
                  value={formData.territoryName}
                  onChange={(e) => handleInputChange('territoryName', e.target.value)}
                  error={formErrors.territoryName}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="District"
                  required={true}
                  disabled={!formData.territoryName}
                  options={availableDistricts}
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  error={formErrors.district}
                />
              </div>

              {/* Row 4: City & Pincode */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="City"
                  required={true}
                  disabled={!formData.district}
                  options={availableCities}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={formErrors.city}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Pincode"
                  placeholder="Pincode"
                  required={true}
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  error={formErrors.pincode}
                />
              </div>

              {/* Row 5: GST No. & PAN No. */}
              <div className="col-12 col-md-6">
                <InputField
                  label="GST No. (Optional)"
                  placeholder="GST No."
                  value={formData.gstNo}
                  onChange={(e) => handleInputChange('gstNo', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="PAN No. (Optional)"
                  placeholder="PAN No."
                  value={formData.panNo}
                  onChange={(e) => handleInputChange('panNo', e.target.value)}
                />
              </div>

              {/* Row 6: Address */}
              <div className="col-12">
                <InputField
                  label="Address"
                  type="textarea"
                  rows={2}
                  placeholder="Street address..."
                  required={true}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={formErrors.address}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — SOURCE & CAMPAIGN */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Layers size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — SOURCE & CAMPAIGN</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Row 1: Source & Campaign */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Source"
                  options={mockSourceMasterData.map((s) => s.name)}
                  value={formData.sourceName}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleInputChange('sourceName', selectedName);
                  }}
                />
              </div>
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Campaign"
                  options={['', ...mockCampaignMasterData.map((c) => `${c.campaignId} - ${c.name}`)]}
                  value={formData.campaignId ? `${formData.campaignId} - ${formData.campaignName}` : ''}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    const campId = rawVal.split(' - ')[0] || '';
                    const matchedC = mockCampaignMasterData.find((c) => c.campaignId === campId);
                    handleInputChange('campaignId', campId);
                    handleInputChange('campaignName', matchedC ? matchedC.name : '');
                  }}
                />
              </div>

              {/* DYNAMIC CONDITIONAL INPUT FIELDS BASED ON CHOSEN SOURCE */}
              {(formData.sourceName === 'Referral' || formData.sourceName === 'Doctor Reference') && (
                <>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Person Name"
                      placeholder="e.g. Dr. M. S. Swaminathan"
                      value={formData.referralPersonName}
                      onChange={(e) => handleInputChange('referralPersonName', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Organization Name"
                      placeholder="e.g. City Scanning Center"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Phone No."
                      placeholder="e.g. 9840123456"
                      value={formData.referralPhone}
                      onChange={(e) => handleInputChange('referralPhone', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Email"
                      type="email"
                      placeholder="e.g. swaminathan@cityscan.com"
                      value={formData.referralEmail}
                      onChange={(e) => handleInputChange('referralEmail', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Dropdown
                      label="Territory"
                      options={mockTerritoryMasterData.map((t) => t.name)}
                      value={formData.referralTerritory}
                      onChange={(e) => handleInputChange('referralTerritory', e.target.value)}
                    />
                  </div>
                </>
              )}

              {formData.sourceName === 'Website' && (
                <>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Website Name"
                      placeholder="e.g. Sonocare Official Portal"
                      value={formData.websiteName}
                      onChange={(e) => handleInputChange('websiteName', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Website Link"
                      placeholder="e.g. https://sonocare.in"
                      value={formData.websiteLink}
                      onChange={(e) => handleInputChange('websiteLink', e.target.value)}
                    />
                  </div>
                </>
              )}

              {(formData.sourceName === 'Direct' || formData.sourceName === 'Phone' || formData.sourceName === 'Walk-in') && (
                <>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Handled Employee"
                      placeholder="e.g. Admin User"
                      value={formData.handledEmployee}
                      onChange={(e) => handleInputChange('handledEmployee', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Employee ID"
                      placeholder="e.g. EMP-001"
                      value={formData.handledEmployeeId}
                      onChange={(e) => handleInputChange('handledEmployeeId', e.target.value)}
                    />
                  </div>
                </>
              )}

              {(formData.sourceName === 'Email' || formData.sourceName === 'WhatsApp') && (
                <div className="col-12 col-md-6">
                  <InputField
                    label="Handled By"
                    placeholder="e.g. Admin User (EMP-001)"
                    value={formData.handledBy}
                    onChange={(e) => handleInputChange('handledBy', e.target.value)}
                  />
                </div>
              )}

              {/* Status */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Status"
                  options={['Active', 'Inactive']}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — CONTACT PERSONS */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Users size={20} color="#2E3192" />
              <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — CONTACT PERSONS</h5>
            </div>
            <span className="badge bg-light text-secondary border">
              {contacts.length} / 4 Contacts Added
            </span>
          </div>

          <div className="card-body p-4">
            {contacts.map((contact, index) => (
              <div
                key={contact.contactId || index}
                className="p-3 mb-3 border rounded bg-light position-relative"
                style={{ backgroundColor: '#f8fafc' }}
              >
                <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">
                      Contact {index + 1}
                    </span>
                    <span className="badge bg-secondary font-monospace ms-1">{contact.contactId}</span>
                    <span className={`badge ${contact.contactType === 'Primary' ? 'bg-primary' : 'bg-secondary'}`}>
                      {contact.contactType}
                    </span>
                  </div>

                  {contacts.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                      onClick={() => setContactToDeleteIndex(index)}
                      title="Delete Contact"
                    >
                      <Trash2 size={14} />
                      <span>Delete Contact</span>
                    </button>
                  )}
                </div>

                <div className="row g-3">
                  {/* Row 1: Contact Person & Role */}
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Contact Person *"
                      placeholder="Contact Person"
                      value={contact.contactPerson}
                      onChange={(e) => handleContactChange(index, 'contactPerson', e.target.value)}
                      error={contactErrors[`${index}_contactPerson`]}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Role / Designation *"
                      placeholder="Role / Designation"
                      value={contact.role}
                      onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                      error={contactErrors[`${index}_role`]}
                    />
                  </div>

                  {/* Row 2: Phone 1 & Phone 2 */}
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Phone 1 *"
                      placeholder="Phone 1"
                      value={contact.phone1}
                      onChange={(e) => handleContactChange(index, 'phone1', e.target.value)}
                      error={contactErrors[`${index}_phone1`]}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Phone 2 (Optional)"
                      placeholder="Phone 2"
                      value={contact.phone2}
                      onChange={(e) => handleContactChange(index, 'phone2', e.target.value)}
                    />
                  </div>

                  {/* Row 3: Email */}
                  <div className="col-12 col-md-6">
                    <InputField
                      label="Email (Optional)"
                      type="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      error={contactErrors[`${index}_email`]}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="d-flex align-items-center justify-content-between pt-2">
              {contacts.length < 4 ? (
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={handleAddContact}
                  style={{ borderColor: '#2E3192', color: '#2E3192' }}
                >
                  <Plus size={16} />
                  <span>+ Add Contact</span>
                </button>
              ) : (
                <div className="text-muted small fw-semibold">
                  Maximum 4 contacts allowed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4 — AUDIT INFORMATION */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
            <Clock size={20} color="#2E3192" />
            <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 4 — AUDIT INFORMATION</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Created By"
                  value={formData.createdBy}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Created Date"
                  value={formData.createdDate}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Updated By (System Auto)"
                  value={`${mockEmployeeData.employeeId} (${mockEmployeeData.name})`}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Updated Date (Current)"
                  value={new Date().toISOString().replace('T', ' ').substring(0, 16)}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FORM BUTTONS */}
        <div className="d-flex justify-content-end gap-2 pb-5">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => navigate('/masters/customers')}
          >
            Cancel / Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          >
            Update Customer
          </Button>
        </div>
      </form>

      {/* DELETE CONTACT CONFIRMATION MODAL */}
      <Modal
        show={contactToDeleteIndex !== null}
        onHide={() => setContactToDeleteIndex(null)}
        title="Delete Contact"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setContactToDeleteIndex(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteContact}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-dark mb-0 py-2">
          Are you sure you want to delete this contact?
        </p>
      </Modal>
    </div>
  );
};

export default EditCustomer;
