import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { InputField, Dropdown, RadioGroup } from '../../components/FormInputs';
import { Package, ArrowLeft } from 'lucide-react';
import '../../styles/Product.css';

const categoriesList = [
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation',
  'Medical & Diagnostic Scanners',
  'Software & Integration'
];

const ViewProduct = ({ product: propProduct, products = [], onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find target product from prop or products list by ID
  const product = propProduct || products.find((p) => String(p.id) === String(id)) || products[0];

  const handleBackClick = () => {
    if (onCancel) onCancel();
    navigate('/our-stock/master/products');
  };

  if (!product) {
    return (
      <div className="product-master-page container-fluid px-0 px-md-1">
        <Card className="p-4 text-center">
          <h2 className="h4 text-dark mb-3">Product Not Found</h2>
          <Button variant="outline-secondary" onClick={handleBackClick}>
            Back to Products List
          </Button>
        </Card>
      </div>
    );
  }

  const purchasePriceFormatted = product.purchasePrice
    ? `₹${Number(product.purchasePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const gstPercentFormatted = product.gstPercent !== undefined ? `${product.gstPercent}%` : '18%';

  const subMonthlyFormatted = product.subscriptionMonthlyPrice
    ? `₹${Number(product.subscriptionMonthlyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const subQuarterlyFormatted = product.subscriptionQuarterlyPrice
    ? `₹${Number(product.subscriptionQuarterlyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const subHalfYearlyFormatted = product.subscriptionHalfYearlyPrice
    ? `₹${Number(product.subscriptionHalfYearlyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const subYearlyFormatted = product.subscriptionYearlyPrice
    ? `₹${Number(product.subscriptionYearlyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '₹0.00';

  const cancellationBefore = product.cancellationBeforeDispatch !== undefined
    ? `${Number(product.cancellationBeforeDispatch).toFixed(2)}%`
    : '0.00%';

  const cancellationAfter = product.cancellationAfterDispatch !== undefined
    ? `${Number(product.cancellationAfterDispatch).toFixed(2)}%`
    : '0.00%';

  const cancellationInstall = product.cancellationAfterInstallation !== undefined
    ? `${Number(product.cancellationAfterInstallation).toFixed(2)}%`
    : '0.00%';

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* TOP HEADER SECTION */}
      <div className="product-page-header">
        <div className="product-page-title-group">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="me-2 p-1">
            <ArrowLeft size={22} className="text-dark" />
          </Button>
          <Package size={28} style={{ color: '#2E3192' }} />
          <h1 className="product-page-title">View Product (ID: {product.productId || id})</h1>
        </div>

        <Button variant="outline-secondary" onClick={handleBackClick}>
          Back
        </Button>
      </div>

      {/* VIEW DETAILS WRAPPED IN CARD (EXACT SAME DESIGN AS EDIT PRODUCT PAGE) */}
      <Card className="p-2">
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          {/* SECTION 1: PRODUCT BASIC DETAILS (2 INPUTS PER ROW) */}
          <div className="mb-4">
            <h2 className="form-section-title">Product Basic Details</h2>

            <div className="row g-3">
              {/* Row 1: Category & Product Name */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Category"
                  options={categoriesList}
                  value={product.category || 'Machinery & Equipment'}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Product Name"
                  value={product.productName || ''}
                  disabled={true}
                />
              </div>

              {/* Row 2: Specification & Model No */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Specification"
                  type="textarea"
                  rows={3}
                  value={product.specification || ''}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Model No"
                  value={product.modelNo || ''}
                  disabled={true}
                />
              </div>

              {/* Row 3: HSN Code */}
              <div className="col-12 col-md-6">
                <InputField
                  label="HSN Code"
                  value={product.hsnCode || ''}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & TAX DETAILS */}
          <div className="mb-4">
            <h2 className="form-section-title">Pricing &amp; Tax Details</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="One Time Purchase Price (₹)"
                  value={purchasePriceFormatted}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="GST Rate (%)"
                  value={gstPercentFormatted}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SUBSCRIPTION PRICING DETAILS */}
          <div className="mb-4">
            <h2 className="form-section-title">Subscription Pricing Details (₹)</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Monthly Subscription Price (₹)"
                  value={subMonthlyFormatted}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Quarterly Subscription Price (₹)"
                  value={subQuarterlyFormatted}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Half Yearly Subscription Price (₹)"
                  value={subHalfYearlyFormatted}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Yearly Subscription Price (₹)"
                  value={subYearlyFormatted}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CANCELLATION PRICE (% VALUES, 2 INPUTS PER ROW) */}
          <div className="mb-4">
            <h2 className="form-section-title">Cancellation Price (%)</h2>

            <div className="row g-3">
              {/* Row 1: Before Dispatch & After Dispatch */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Before Dispatch Price (%)"
                  value={cancellationBefore}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="After Dispatch Price (%)"
                  value={cancellationAfter}
                  disabled={true}
                />
              </div>

              {/* Row 2: After Installation */}
              <div className="col-12 col-md-6">
                <InputField
                  label="After Installation Price (%)"
                  value={cancellationInstall}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: CONFIGURATION & STATUS (2 INPUTS PER ROW) */}
          <div className="mb-4">
            <h2 className="form-section-title">Configuration &amp; Status</h2>

            <div className="row g-3">
              {/* Row 1: Kit Requirement & Status */}
              <div className="col-12 col-md-6">
                <RadioGroup
                  label="Kit Requirement"
                  name="viewKitRequirement"
                  value={product.kitRequirement || 'No'}
                  disabled={true}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
              </div>

              <div className="col-12 col-md-6">
                <RadioGroup
                  label="Status"
                  name="viewStatus"
                  value={product.status || 'Active'}
                  disabled={true}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' }
                  ]}
                />
              </div>

              {/* Row 2: Description */}
              <div className="col-12">
                <InputField
                  label="Description"
                  type="textarea"
                  rows={3}
                  value={product.description || ''}
                  disabled={true}
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

export default ViewProduct;
