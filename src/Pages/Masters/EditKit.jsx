import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { InputField, RadioGroup } from '../../components/FormInputs';
import { toast } from '../../components/Toast';
import { Boxes, ArrowLeft, CheckCircle2 } from 'lucide-react';
import '../../styles/Product.css';

const EditKit = ({ kits = [], onUpdateKit, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find target kit by ID
  const kit = kits.find((k) => String(k.id) === String(id)) || kits[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      kitId: kit?.kitId || '',
      kitName: kit?.kitName || '',
      kitPrice: kit?.kitPrice !== undefined ? kit.kitPrice : '',
      gstPercent: kit?.gstPercent !== undefined ? kit.gstPercent : 18,
      description: kit?.description || '',
      specification: kit?.specification || '',
      status: kit?.status || 'Active'
    }
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (kit) {
      reset({
        kitId: kit.kitId || '',
        kitName: kit.kitName || '',
        kitPrice: kit.kitPrice !== undefined ? kit.kitPrice : '',
        gstPercent: kit.gstPercent !== undefined ? kit.gstPercent : 18,
        description: kit.description || '',
        specification: kit.specification || '',
        status: kit.status || 'Active'
      });
    }
  }, [kit, reset]);

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    navigate('/masters/kits');
  };

  const onSubmit = (data) => {
    // Validation: Price must be non-negative
    const priceNum = parseFloat(data.kitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Kit Price cannot be negative');
      return;
    }

    const gstNum = parseFloat(data.gstPercent);
    if (isNaN(gstNum) || gstNum < 0) {
      toast.error('GST % cannot be negative');
      return;
    }

    const updatedKitData = {
      ...kit,
      kitName: data.kitName.trim(),
      kitPrice: priceNum,
      gstPercent: gstNum,
      description: data.description ? data.description.trim() : '',
      specification: data.specification ? data.specification.trim() : '',
      status: data.status,
      modifiedAt: new Date().toISOString().split('T')[0]
    };

    if (onUpdateKit) onUpdateKit(updatedKitData);
    toast.success('Kit updated successfully');
    navigate('/masters/kits');
  };

  if (!kit) {
    return (
      <div className="product-master-page container-fluid px-0 px-md-1">
        <Card className="p-4 text-center">
          <h2 className="h4 text-dark mb-3">Kit Record Not Found</h2>
          <Button variant="outline-secondary" onClick={handleCancelClick}>
            Back to Kit Master List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="product-master-page container-fluid px-0 px-md-1">
      {/* TOP HEADER SECTION */}
      <div className="product-page-header">
        <div className="product-page-title-group">
          <Button variant="ghost" size="sm" onClick={handleCancelClick} className="me-2 p-1">
            <ArrowLeft size={22} className="text-dark" />
          </Button>
          <Boxes size={28} style={{ color: '#2E3192' }} />
          <h1 className="product-page-title">Edit Kit (ID: {kit.kitId})</h1>
        </div>
      </div>

      {/* FORM WRAPPED IN CARD */}
      <Card className="p-2">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* SECTION 1: KIT BASIC DETAILS */}
          <div className="mb-4">
            <h2 className="form-section-title">Kit Details</h2>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Kit ID (Read-only)"
                  value={kit.kitId}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Name"
                  required={true}
                  placeholder="Kit Name"
                  error={errors.kitName}
                  {...register('kitName', { required: 'Kit Name is required' })}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Price (₹)"
                  type="number"
                  step="0.01"
                  min="0"
                  required={true}
                  placeholder="Kit Price"
                  error={errors.kitPrice}
                  {...register('kitPrice', {
                    required: 'Kit Price is required',
                    min: { value: 0, message: 'Kit Price must not be negative' }
                  })}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="GST (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  required={true}
                  placeholder="e.g. 18"
                  error={errors.gstPercent}
                  {...register('gstPercent', {
                    required: 'GST % is required',
                    min: { value: 0, message: 'GST % must not be negative' }
                  })}
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
                  placeholder="Enter detailed technical kit specs..."
                  {...register('specification')}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Kit Description"
                  type="textarea"
                  rows={3}
                  placeholder="Enter kit description..."
                  {...register('description')}
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
              Update Kit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditKit;
