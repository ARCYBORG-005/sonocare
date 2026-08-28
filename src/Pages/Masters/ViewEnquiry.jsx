import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { InputField } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ArrowLeft,
  HelpCircle,
  Building2,
  MapPin,
  Share2,
  ShieldAlert,
  Package,
  Clock,
  Pencil,
  ArrowRightCircle,
  CheckCircle2
} from 'lucide-react';
import '../../styles/Enquiry.css';

const ViewEnquiry = ({ enquiries, setEnquiries }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const enquiry = useMemo(() => {
    return (enquiries || []).find((e) => String(e.id) === String(id) || e.enquiryId === id);
  }, [enquiries, id]);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const handleOpenConvertModal = () => {
    if (!enquiry) return;
    const hasContact = enquiry.customerName && enquiry.contactPerson && enquiry.mobile;
    const hasProduct = enquiry.productCategory && enquiry.product;
    const hasBudget = enquiry.budget !== undefined && enquiry.budget !== null && enquiry.budget !== '';
    const hasTimeframe = enquiry.expectedTimeframe;

    if (!hasContact || !hasProduct || !hasBudget || !hasTimeframe) {
      toast.error(
        'Lead Conversion Blocked: Complete Contact Info, Product Interest, Budget, and Timeframe before converting.'
      );
      return;
    }

    setIsConvertModalOpen(true);
  };

  const handleConfirmConvertToLead = () => {
    if (!enquiry) return;

    setEnquiries((prev) =>
      prev.map((item) =>
        item.enquiryId === enquiry.enquiryId
          ? {
            ...item,
            status: 'Converted to Lead',
            isConvertedToLead: true,
            leadConvertedDate: new Date().toISOString().split('T')[0]
          }
          : item
      )
    );

    setIsConvertModalOpen(false);
    toast.success(`Enquiry ${enquiry.enquiryId} successfully converted into a Lead.`);
  };

  if (!enquiry) {
    return (
      <div className="container-fluid py-5 text-center">
        <h4 className="text-muted">Enquiry record not found.</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/masters/enquiries')}>
          Back to Enquiry Master
        </button>
      </div>
    );
  }

  return (
    <div className="enquiry-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>{`View Enquiry (${enquiry.enquiryId})`} | Sonocare CRM</title>
        <meta name="description" content="View customer enquiry details in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER SECTION */}
      <div className="category-page-header mb-4">
        <div className="category-page-title-group">
          <button
            type="button"
            className="btn btn-sm btn-light border me-2"
            onClick={() => navigate('/masters/enquiries')}
            title="Back to Enquiry Master"
          >
            <ArrowLeft size={18} />
          </button>
          <HelpCircle size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">View Enquiry ({enquiry.enquiryId})</h1>
        </div>

        <div className="enquiry-header-actions">
          <button
            type="button"
            className="enquiry-convert-btn py-2 px-3 fs-6"
            onClick={handleOpenConvertModal}
            disabled={enquiry.isConvertedToLead}
          >
            <ArrowRightCircle size={18} />
            <span>{enquiry.isConvertedToLead ? 'Converted to Lead' : 'Convert to Lead'}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold"
            onClick={() => navigate(`/masters/enquiries/${enquiry.enquiryId}/edit`)}
            disabled={enquiry.isConvertedToLead}
          >
            <Pencil size={16} />
            <span>Edit Enquiry</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 — CONTACT / CUSTOMER */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Building2 size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 1 — CONTACT / CUSTOMER</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Enquiry ID" value={enquiry.enquiryId} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Customer Name" value={enquiry.customerName} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Contact Person" value={enquiry.contactPerson} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Customer Type" value={enquiry.customerType} disabled={true} />
            </div>
            {enquiry.customerType === 'Other' && (
              <div className="col-12 col-md-6">
                <InputField label="Other Customer Type Description" value={enquiry.otherCustomerType || '—'} disabled={true} />
              </div>
            )}
            <div className="col-12 col-md-6">
              <InputField label="Hospital / Institution" value={enquiry.hospitalInstitution || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Mobile" value={enquiry.mobile} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Email" value={enquiry.email || '—'} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — LOCATION */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <MapPin size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 2 — LOCATION</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <InputField label="Territory (State)" value={enquiry.territory || enquiry.state} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="District" value={enquiry.district || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="City" value={enquiry.city || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Pincode" value={enquiry.pincode || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-8">
              <InputField label="Address" type="textarea" rows={2} value={enquiry.address || '—'} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — ENQUIRY SOURCE */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Share2 size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 3 — ENQUIRY SOURCE</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Source" value={enquiry.source} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Source Details" value={enquiry.sourceDetails || '—'} disabled={true} />
            </div>
            {enquiry.source === 'Referral' && (
              <>
                <div className="col-12 col-md-6">
                  <InputField label="Referral Name" value={enquiry.referralName || '—'} disabled={true} />
                </div>
                <div className="col-12 col-md-6">
                  <InputField label="Referral Organization" value={enquiry.referralOrg || '—'} disabled={true} />
                </div>
                <div className="col-12 col-md-6">
                  <InputField label="Referral Mobile" value={enquiry.referralMobile || '—'} disabled={true} />
                </div>
                <div className="col-12 col-md-6">
                  <InputField label="Referral Territory" value={enquiry.referralTerritory || '—'} disabled={true} />
                </div>
              </>
            )}
            {enquiry.source === 'Campaign' && (
              <div className="col-12 col-md-6">
                <InputField label="Campaign ID" value={enquiry.campaignId || '—'} disabled={true} />
              </div>
            )}
            {enquiry.source === 'Conference/Event' && (
              <div className="col-12 col-md-6">
                <InputField label="Conference Name" value={enquiry.conferenceName || '—'} disabled={true} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4 — PRIORITY & AUTO-ASSIGNMENT */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <ShieldAlert size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 4 — PRIORITY & AUTO-ASSIGNMENT ENGINE</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <InputField label="Priority" value={enquiry.priority} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Department" value={enquiry.department} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Assigned Employee" value={enquiry.assignedEmployeeName} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5 — PRODUCT INTEREST */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Package size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 5 — PRODUCT INTEREST</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Product Category" value={enquiry.productCategory} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Product" value={enquiry.product} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Service Interested" value={enquiry.serviceInterested} disabled={true} />
            </div>
            {enquiry.serviceInterested === 'Subscription' && (
              <div className="col-12 col-md-6">
                <InputField label="Subscription Frequency" value={enquiry.subscriptionFrequency || '—'} disabled={true} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 6 — PURCHASE INFORMATION */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
          <Clock size={20} color="#2E3192" />
          <h5 className="mb-0 fw-bold text-dark fs-6">SECTION 6 — PURCHASE INFORMATION</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputField label="Expected Timeframe" value={enquiry.expectedTimeframe} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField label="Budget (₹)" value={enquiry.budget ? `₹ ${enquiry.budget}` : '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Status" value={enquiry.status} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Enquiry Date" value={enquiry.enquiryDate || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-4">
              <InputField label="Last Activity Date" value={enquiry.lastActivityDate || '—'} disabled={true} />
            </div>
            <div className="col-12 col-md-6">
              <InputField
                label="Active Workload Count Impact"
                value={
                  ['Pending', 'Approved', 'In Progress', 'Active'].includes(enquiry.status) && !enquiry.isConvertedToLead
                    ? 'Yes'
                    : 'No'
                }
                disabled={true}
              />
            </div>
            <div className="col-12">
              <InputField label="Remarks" type="textarea" rows={2} value={enquiry.remarks || '—'} disabled={true} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="d-flex justify-content-end gap-2 pb-5">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={() => navigate('/masters/enquiries')}
        >
          Back to Enquiry Master
        </Button>
      </div>

      {/* CONVERT TO LEAD MODAL */}
      <Modal
        show={isConvertModalOpen}
        onHide={() => setIsConvertModalOpen(false)}
        title="Convert Enquiry to Lead"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsConvertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmConvertToLead}
            >
              Convert to Lead
            </Button>
          </div>
        }
      >
        <div className="py-2">
          <div className="d-flex align-items-center gap-2 text-success mb-3">
            <CheckCircle2 size={24} />
            <h6 className="mb-0 fw-bold text-dark">Confirm Lead Conversion</h6>
          </div>
          <p className="text-dark small mb-3">
            Are you sure you want to convert Enquiry <strong>{enquiry.enquiryId}</strong> (
            {enquiry.customerName}) into an active Lead?
          </p>
          <div className="p-3 bg-light rounded border small text-dark mb-0">
            <div><strong>Product Interest:</strong> {enquiry.productCategory} — {enquiry.product}</div>
            <div><strong>Target Timeframe:</strong> {enquiry.expectedTimeframe}</div>
            <div><strong>Disclosed Budget:</strong> ₹ {enquiry.budget || 'N/A'}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewEnquiry;
