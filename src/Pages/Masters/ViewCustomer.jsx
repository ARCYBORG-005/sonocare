import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import { ArrowLeft, Pencil, Trash2, Building2, Layers, Users, Clock } from 'lucide-react';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Customer.css';

const ViewCustomer = ({ customers, setCustomers }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find target customer by ID or customerId
  const customer = useMemo(() => {
    return (customers || []).find((c) => String(c.id) === String(id) || c.customerId === id);
  }, [customers, id]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    if (!customer) return;
    setCustomers((prev) => prev.filter((item) => item.id !== customer.id && item.customerId !== customer.customerId));
    setIsDeleteModalOpen(false);
    toast.success('Customer deleted successfully.');
    navigate('/masters/customers');
  };

  if (!customer) {
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
        <title>{`View Customer (${customer.customerId})`} | Sonocare CRM</title>
        <meta name="description" content="View detailed healthcare customer information in Sonocare CRM." />
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
          <h1 className="category-page-title">View Customer ({customer.customerId})</h1>
        </div>

        {/* TOP ACTIONS */}
        
      </div>

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
                value={customer.customerId}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Customer Type"
                value={customer.customerType}
                disabled={true}
              />
            </div>

            {/* Row 2: Customer Name & Country */}
            <div className="col-12 col-md-6">
              <InputField
                label="Customer Name"
                value={customer.customerName}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Country"
                value={customer.country || 'India'}
                disabled={true}
              />
            </div>

            {/* Row 3: Territory & District */}
            <div className="col-12 col-md-6">
              <InputField
                label="Territory"
                value={customer.territoryName || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="District"
                value={customer.district || '—'}
                disabled={true}
              />
            </div>

            {/* Row 4: City & Pincode */}
            <div className="col-12 col-md-6">
              <InputField
                label="City"
                value={customer.city || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Pincode"
                value={customer.pincode || '—'}
                disabled={true}
              />
            </div>

            {/* Row 5: GST No. & PAN No. */}
            <div className="col-12 col-md-6">
              <InputField
                label="GST No. (Optional)"
                value={customer.gstNo || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="PAN No. (Optional)"
                value={customer.panNo || '—'}
                disabled={true}
              />
            </div>

            {/* Row 6: Address */}
            <div className="col-12">
              <InputField
                label="Address"
                type="textarea"
                rows={2}
                value={customer.address || '—'}
                disabled={true}
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
              <InputField
                label="Source"
                value={customer.sourceName || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Campaign"
                value={
                  customer.campaignId
                    ? `${customer.campaignId} - ${customer.campaignName}`
                    : '—'
                }
                disabled={true}
              />
            </div>

            {/* DYNAMIC READONLY SOURCE FIELDS */}
            {(customer.sourceName === 'Referral' || customer.sourceName === 'Doctor Reference') && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Person Name"
                    value={customer.referralPersonName || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Organization Name"
                    value={customer.organizationName || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Phone No."
                    value={customer.referralPhone || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Email"
                    value={customer.referralEmail || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory"
                    value={customer.referralTerritory || '—'}
                    disabled={true}
                  />
                </div>
              </>
            )}

            {customer.sourceName === 'Website' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Website Name"
                    value={customer.websiteName || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Website Link"
                    value={customer.websiteLink || '—'}
                    disabled={true}
                  />
                </div>
              </>
            )}

            {(customer.sourceName === 'Direct' || customer.sourceName === 'Phone' || customer.sourceName === 'Walk-in') && (
              <>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Handled Employee"
                    value={customer.handledEmployee || '—'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Employee ID"
                    value={customer.handledEmployeeId || '—'}
                    disabled={true}
                  />
                </div>
              </>
            )}

            {(customer.sourceName === 'Email' || customer.sourceName === 'WhatsApp') && (
              <div className="col-12 col-md-6">
                <InputField
                  label="Handled By"
                  value={customer.handledBy || '—'}
                  disabled={true}
                />
              </div>
            )}

            {/* Status */}
            <div className="col-12 col-md-6">
              <InputField
                label="Status"
                value={customer.status || 'Active'}
                disabled={true}
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
            {(customer.contacts || []).length} / 4 Contacts Added
          </span>
        </div>

        <div className="card-body p-4">
          {(customer.contacts || []).map((contact, index) => (
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
              </div>

              <div className="row g-3">
                {/* Row 1: Contact Person & Role */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={contact.contactPerson}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Role / Designation"
                    value={contact.role}
                    disabled={true}
                  />
                </div>

                {/* Row 2: Phone 1 & Phone 2 */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Phone 1"
                    value={contact.phone1}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Phone 2 (Optional)"
                    value={contact.phone2 || '—'}
                    disabled={true}
                  />
                </div>

                {/* Row 3: Email */}
                <div className="col-12 col-md-6">
                  <InputField
                    label="Email (Optional)"
                    type="email"
                    value={contact.email || '—'}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          ))}
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
                value={customer.createdBy || 'System'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Created Date"
                value={customer.createdDate || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Updated By"
                value={customer.updatedBy || '—'}
                disabled={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Updated Date"
                value={customer.updatedDate || '—'}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="d-flex justify-content-end gap-2 pb-5">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => navigate('/masters/customers')}
        >
          Back
        </Button>
       
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-dark fs-6 mb-0">
            Are you sure you want to delete this customer?
          </p>
          <div className="alert alert-light border mt-3 mb-0 p-2 text-dark small">
            <strong>{customer.customerId}</strong> - {customer.customerName} ({customer.customerType})
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewCustomer;
