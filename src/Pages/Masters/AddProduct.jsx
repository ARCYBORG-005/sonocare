import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { InputField, Dropdown, RadioGroup } from '../../components/FormInputs';
import { toast } from '../../components/Toast';
import { Package, ArrowLeft, CheckCircle2 } from 'lucide-react';
import '../../styles/Product.css';

const categoriesList = [
  'Machinery & Equipment',
  'Tooling & Accessories',
  'Electrical & Automation',
  'Medical & Diagnostic Scanners',
  'Software & Integration'
];

const AddProduct = ({ onAddProduct, onCancel }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      category: 'Machinery & Equipment',
      productName: '',
      specification: '',
      modelNo: '',
      hsnCode: '',
      purchasePrice: '',
      gstPercent: '18',
      subscriptionMonthlyPrice: '',
      subscriptionQuarterlyPrice: '',
      subscriptionHalfYearlyPrice: '',
      subscriptionYearlyPrice: '',
      cancellationBeforeDispatch: '',
      cancellationAfterDispatch: '',
      cancellationAfterInstallation: '',
      kitRequirement: 'No',
      status: 'Active',
      description: ''
    }
  });

  const categoryValue = watch('category');
  const kitReqValue = watch('kitRequirement');
  const statusValue = watch('status');

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    navigate('/our-stock/master/products');
  };

  const onSubmit = (data) => {
    const newProductData = {
      id: Date.now(),
      productId: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: data.category,
      productName: data.productName,
      specification: data.specification,
      modelNo: data.modelNo,
      hsnCode: data.hsnCode,
      purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : 0,
      gstPercent: data.gstPercent ? parseFloat(data.gstPercent) : 18,
      subscriptionMonthlyPrice: data.subscriptionMonthlyPrice ? parseFloat(data.subscriptionMonthlyPrice) : 0,
      subscriptionQuarterlyPrice: data.subscriptionQuarterlyPrice ? parseFloat(data.subscriptionQuarterlyPrice) : 0,
      subscriptionHalfYearlyPrice: data.subscriptionHalfYearlyPrice ? parseFloat(data.subscriptionHalfYearlyPrice) : 0,
      subscriptionYearlyPrice: data.subscriptionYearlyPrice ? parseFloat(data.subscriptionYearlyPrice) : 0,
      cancellationBeforeDispatch: data.cancellationBeforeDispatch ? parseFloat(data.cancellationBeforeDispatch) : 0,
      cancellationAfterDispatch: data.cancellationAfterDispatch ? parseFloat(data.cancellationAfterDispatch) : 0,
      cancellationAfterInstallation: data.cancellationAfterInstallation ? parseFloat(data.cancellationAfterInstallation) : 0,
      kitRequirement: data.kitRequirement,
      status: data.status,
      description: data.description
    };

    if (onAddProduct) onAddProduct(newProductData);
    toast.success('Product added successfully');
    navigate('/our-stock/master/products');
  };

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* TOP HEADER SECTION */}
      <div className="product-page-header">
        <div className="product-page-title-group">
          <Button variant="ghost" size="sm" onClick={handleCancelClick} className="me-2 p-1">
            <ArrowLeft size={22} className="text-dark" />
          </Button>
          <Package size={28} style={{ color: '#2E3192' }} />
          <h1 className="product-page-title">Add Product</h1>
        </div>
      </div>

      {/* FORM WRAPPED IN REUSABLE CARD COMPONENT */}
      <Card className="p-2">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* SECTION 1: PRODUCT BASIC DETAILS (2 INPUTS PER ROW) */}
          <div className="mb-4">
            <h2 className="form-section-title">Product Basic Details</h2>

            <div className="row g-3">
              {/* Row 1: Category & Product Name */}
              <div className="col-12 col-md-6">
                <Dropdown
                  label="Category"
                  required={true}
                  options={categoriesList}
                  placeholder="Select Category..."
                  error={errors.category}
                  value={categoryValue}
                  onChange={(e) => setValue('category', e.target.value, { shouldValidate: true })}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Product Name"
                  required={true}
                  placeholder="Enter Product Full Name"
                  error={errors.productName}
                  {...register('productName', { required: 'Product Name is required' })}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Model No"
                  placeholder="e.g. MOD-8890"
                  {...register('modelNo')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="HSN Code"
                  placeholder="e.g. 8471"
                  {...register('hsnCode')}
                />
              </div>

              {/* Specification as Textarea */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Specification"
                  type="textarea"
                  rows={3}
                  placeholder="e.g. 500W High Precision Motor, 12000 RPM Spindle"
                  {...register('specification')}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING DETAILS (ONE TIME & GST RATE) */}
          <div className="mb-4">
            <h2 className="form-section-title">Pricing &amp; Tax Details</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="One Time Purchase Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 450000.00"
                  {...register('purchasePrice')}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="GST Rate (%)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 18"
                  {...register('gstPercent')}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SUBSCRIPTION PRICING DETAILS (MONTHLY, QUARTERLY, HALF YEARLY, YEARLY) */}
          <div className="mb-4">
            <h2 className="form-section-title">Subscription Pricing Details (₹)</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Monthly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 45000.00"
                  {...register('subscriptionMonthlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Quarterly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 125000.00"
                  {...register('subscriptionQuarterlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Half Yearly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 240000.00"
                  {...register('subscriptionHalfYearlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Yearly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 450000.00"
                  {...register('subscriptionYearlyPrice')}
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
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5.00"
                  {...register('cancellationBeforeDispatch')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="After Dispatch Price (%)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15.00"
                  {...register('cancellationAfterDispatch')}
                />
              </div>

              {/* Row 2: After Installation */}
              <div className="col-12 col-md-6">
                <InputField
                  label="After Installation Price (%)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 25.00"
                  {...register('cancellationAfterInstallation')}
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
                  name="kitRequirement"
                  value={kitReqValue}
                  onChange={(e) => setValue('kitRequirement', e.target.value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
              </div>

              <div className="col-12 col-md-6">
                <RadioGroup
                  label="Status"
                  name="status"
                  value={statusValue}
                  onChange={(e) => setValue('status', e.target.value)}
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
                  placeholder="Enter detailed product notes or description..."
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Button variant="outline-secondary" onClick={handleCancelClick}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              icon={<CheckCircle2 size={18} />}
            >
              Save Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddProduct;
