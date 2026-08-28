import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { InputField, RadioGroup } from '../../components/FormInputs';
import { Boxes, ArrowLeft } from 'lucide-react';
import '../../styles/Product.css';

const ViewKit = ({ kits = [], onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find target kit by ID
  const kit = kits.find((k) => String(k.id) === String(id)) || kits[0];

  const handleBackClick = () => {
    if (onCancel) onCancel();
    navigate('/masters/kits');
  };

  if (!kit) {
    return (
      <div className="product-master-page container-fluid px-0 px-md-1">
        <Card className="p-4 text-center">
          <h2 className="h4 text-dark mb-3">Kit Record Not Found</h2>
          <Button variant="outline-secondary" onClick={handleBackClick}>
            Back to Kit Master List
          </Button>
        </Card>
      </div>
    );
  }

  const kitPriceFormatted = kit.kitPrice
    ? `₹${Number(kit.kitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const gstFormatted = kit.gstPercent !== undefined ? `${kit.gstPercent}%` : '18%';

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* TOP HEADER SECTION */}
      <div className="product-page-header">
        <div className="product-page-title-group">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="me-2 p-1">
            <ArrowLeft size={22} className="text-dark" />
          </Button>
          <Boxes size={28} style={{ color: '#2E3192' }} />
          <h1 className="product-page-title">View Kit (ID: {kit.kitId})</h1>
        </div>

        <Button variant="outline-secondary" onClick={handleBackClick}>
          Back
        </Button>
      </div>

      {/* VIEW DETAILS WRAPPED IN CARD */}
      <Card className="p-2">
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          {/* SECTION 1: KIT BASIC DETAILS */}
          <div className="mb-4">
            <h2 className="form-section-title">Kit Details</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Kit ID"
                  value={kit.kitId || 'N/A'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Name"
                  value={kit.kitName || 'N/A'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Price (₹)"
                  value={kitPriceFormatted}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="GST (%)"
                  value={gstFormatted}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SPECIFICATIONS & DESCRIPTION */}
          <div className="mb-4">
            <h2 className="form-section-title">Specifications &amp; Description</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Specification"
                  type="textarea"
                  rows={3}
                  value={kit.specification || 'No specific technical specifications recorded.'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Description"
                  type="textarea"
                  rows={3}
                  value={kit.description || 'No detailed description available.'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <RadioGroup
                  label="Status"
                  name="viewKitStatus"
                  value={kit.status || 'Active'}
                  disabled={true}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <div className="d-flex justify-content-end pt-3 border-top">
            <Button variant="outline-secondary" onClick={handleBackClick}>
              Back
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ViewKit;
