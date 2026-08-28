import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditProduct = ({ product: propProduct, products = [], onUpdateProduct, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find target product from prop or products list by ID
  const product = propProduct || products.find((p) => String(p.id) === String(id)) || products[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      category: product?.category || 'Machinery & Equipment',
      productName: product?.productName || '',
      specification: product?.specification || '',
      modelNo: product?.modelNo || '',
      hsnCode: product?.hsnCode || '',
      purchasePrice: product?.purchasePrice !== undefined ? product.purchasePrice : '',
      gstPercent: product?.gstPercent !== undefined ? product.gstPercent : '18',
      subscriptionMonthlyPrice: product?.subscriptionMonthlyPrice !== undefined ? product.subscriptionMonthlyPrice : '',
      subscriptionQuarterlyPrice: product?.subscriptionQuarterlyPrice !== undefined ? product.subscriptionQuarterlyPrice : '',
      subscriptionHalfYearlyPrice: product?.subscriptionHalfYearlyPrice !== undefined ? product.subscriptionHalfYearlyPrice : '',
      subscriptionYearlyPrice: product?.subscriptionYearlyPrice !== undefined ? product.subscriptionYearlyPrice : '',
      cancellationBeforeDispatch: product?.cancellationBeforeDispatch !== undefined ? product.cancellationBeforeDispatch : '',
      cancellationAfterDispatch: product?.cancellationAfterDispatch !== undefined ? product.cancellationAfterDispatch : '',
      cancellationAfterInstallation: product?.cancellationAfterInstallation !== undefined ? product.cancellationAfterInstallation : '',
      kitRequirement: product?.kitRequirement || 'No',
      status: product?.status || 'Active',
      description: product?.description || ''
    }
  });

  const categoryValue = watch('category');
  const kitReqValue = watch('kitRequirement');
  const statusValue = watch('status');

  useEffect(() => {
    if (product) {
      reset({
        category: product.category || 'Machinery & Equipment',
        productName: product.productName || '',
        specification: product.specification || '',
        modelNo: product.modelNo || '',
        hsnCode: product.hsnCode || '',
        purchasePrice: product.purchasePrice !== undefined ? product.purchasePrice : '',
        gstPercent: product.gstPercent !== undefined ? product.gstPercent : '18',
        subscriptionMonthlyPrice: product.subscriptionMonthlyPrice !== undefined ? product.subscriptionMonthlyPrice : '',
        subscriptionQuarterlyPrice: product.subscriptionQuarterlyPrice !== undefined ? product.subscriptionQuarterlyPrice : '',
        subscriptionHalfYearlyPrice: product.subscriptionHalfYearlyPrice !== undefined ? product.subscriptionHalfYearlyPrice : '',
        subscriptionYearlyPrice: product.subscriptionYearlyPrice !== undefined ? product.subscriptionYearlyPrice : '',
        cancellationBeforeDispatch: product.cancellationBeforeDispatch !== undefined ? product.cancellationBeforeDispatch : '',
        cancellationAfterDispatch: product.cancellationAfterDispatch !== undefined ? product.cancellationAfterDispatch : '',
        cancellationAfterInstallation: product.cancellationAfterInstallation !== undefined ? product.cancellationAfterInstallation : '',
        kitRequirement: product.kitRequirement || 'No',
        status: product.status || 'Active',
        description: product.description || ''
      });
    }
  }, [product, reset]);

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    navigate('/our-stock/master/products');
  };

  const onSubmit = (data) => {
    const updatedProduct = {
      ...product,
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

    if (onUpdateProduct) onUpdateProduct(updatedProduct);
    toast.success('Product updated successfully');
    navigate('/our-stock/master/products');
  };

  if (!product) return null;

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* TOP HEADER SECTION */}
      <div className="product-page-header">
        <div className="product-page-title-group">
          <Button variant="ghost" size="sm" onClick={handleCancelClick} className="me-2 p-1">
            <ArrowLeft size={22} className="text-dark" />
          </Button>
          <Package size={28} style={{ color: '#2E3192' }} />
          <h1 className="product-page-title">Edit Product (ID: {product.productId || id})</h1>
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

              {/* Row 2: Specification & Model No */}
              <div className="col-12 col-md-6">
                <InputField
                  label="Specification"
                  type="textarea"
                  rows={3}
                  placeholder="Specification details..."
                  {...register('specification')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Model No"
                  placeholder="Model No"
                  {...register('modelNo')}
                />
              </div>

              {/* Row 3: HSN Code */}
              <div className="col-12 col-md-6">
                <InputField
                  label="HSN Code"
                  placeholder="HSN Code"
                  {...register('hsnCode')}
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
                  type="number"
                  step="0.01"
                  placeholder="Purchase Price"
                  {...register('purchasePrice')}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="GST Rate (%)"
                  type="number"
                  step="0.01"
                  placeholder="GST Rate (%)"
                  {...register('gstPercent')}
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
                  type="number"
                  step="0.01"
                  placeholder="Monthly Price"
                  {...register('subscriptionMonthlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Quarterly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="Quarterly Price"
                  {...register('subscriptionQuarterlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Half Yearly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="Half Yearly Price"
                  {...register('subscriptionHalfYearlyPrice')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Yearly Subscription Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="Yearly Price"
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
                  placeholder="Before Dispatch %"
                  {...register('cancellationBeforeDispatch')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="After Dispatch Price (%)"
                  type="number"
                  step="0.01"
                  placeholder="After Dispatch %"
                  {...register('cancellationAfterDispatch')}
                />
              </div>

              {/* Row 2: After Installation */}
              <div className="col-12 col-md-6">
                <InputField
                  label="After Installation Price (%)"
                  type="number"
                  step="0.01"
                  placeholder="After Installation %"
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
              Update Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProduct;
