import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import './AMCManagement.css';

/**
 * EditAMCContract Component
 * Dedicated workspace page for editing an existing AMC Contract.
 * Follows the EXACT UI design of the Installation Page (InstallationTaskAssignment.jsx).
 * Route: /warranty-amc/:id/edit
 */
const EditAMCContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target contract
  const targetContract = useMemo(() => {
    if (!id) return initialMockAMCContracts[0];
    const decoded = decodeURIComponent(id);
    return (
      initialMockAMCContracts.find((c) => c.contractId === decoded || c.id === decoded) ||
      initialMockAMCContracts[0]
    );
  }, [id]);

  // Form State
  const [orderData, setOrderData] = useState({
    contractId: targetContract?.contractId || 'AMC-2026-001',
    orderFulfilmentId: targetContract?.orderFulfilmentId || 'FUL-2026-003',
    piNumber: targetContract?.piNumber || 'PI-2026-001-V1',
    client: targetContract?.client || 'Fortis Healthcare Centre',
    contactPerson: targetContract?.contactPerson || 'Dr. Ananya Verma',
    mobile: targetContract?.mobile || '9811223344',
    email: targetContract?.email || 'purchase@fortishealthcare.com',
    territory: targetContract?.territory || 'Bengaluru, Karnataka'
  });

  // Per-product state
  const [productsList, setProductsList] = useState([
    {
      id: 1,
      productName: targetContract?.productSummary || 'Sonoscape X5 Portable Ultrasound System',
      category: 'Diagnostic Ultrasound System',
      serialNumber: 'SN-X5-2026-8841',
      softwareVersion: 'v4.2.1-PRO',
      licenseKey: 'LIC-SONO-X5-9982-A3',
      installationDate: '2024-05-10',
      warrantyMonths: '12 Months',
      warrantyEndDate: '2025-05-10',
      warrantyStatus: 'Warranty Ended',
      quantity: targetContract?.productQty || 1,
      hasAmc: true,
      amcType: targetContract?.amcType || 'SAMC (Support AMC)',
      nature: targetContract?.nature || 'Mandatory support only',
      period: targetContract?.period || '1 Year',
      basePrice: targetContract?.basePrice || 135000,
      discountPercent: 5,
      gstPercent: targetContract?.gstPercent || 18,
      startDate: targetContract?.startDate || '2025-05-11',
      endDate: targetContract?.endDate || '2026-05-10',
      alertBeforeDays: targetContract?.alertBeforeDays || '30 Days'
    }
  ]);

  // Calculate Cycle Total for a product with Percentage Discount
  const getProductCycleTotal = (prod) => {
    const b = Number(prod.basePrice) || 0;
    const discPct = Number(prod.discountPercent || 0);
    const gstPct = Number(prod.gstPercent) || 0;

    const discountAmount = (b * discPct) / 100;
    const taxable = Math.max(0, b - discountAmount);
    return Math.round(taxable * (1 + gstPct / 100));
  };

  // Calculate End Date from Start Date & Period
  const getCalculatedEndDate = (start, periodStr) => {
    if (!start) return '';
    const d = new Date(start);
    if (isNaN(d.getTime())) return '';
    const p = String(periodStr).toLowerCase();
    if (p.includes('monthly')) d.setMonth(d.getMonth() + 1);
    else if (p.includes('quarterly')) d.setMonth(d.getMonth() + 3);
    else if (p.includes('half-yearly')) d.setMonth(d.getMonth() + 6);
    else if (p.includes('2 year')) d.setFullYear(d.getFullYear() + 2);
    else if (p.includes('3 year')) d.setFullYear(d.getFullYear() + 3);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  // Update product fields
  const handleProductFieldChange = (prodId, field, value) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === prodId) {
          const updated = { ...p, [field]: value };
          if (field === 'period' || field === 'startDate') {
            updated.endDate = getCalculatedEndDate(
              field === 'startDate' ? value : p.startDate,
              field === 'period' ? value : p.period
            );
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Total Contract Value across products
  const grandTotalAMC = useMemo(() => {
    return productsList
      .filter((p) => p.hasAmc)
      .reduce((acc, p) => acc + getProductCycleTotal(p), 0);
  }, [productsList]);

  // Form Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    toast.success(`AMC Contract ${orderData.contractId} updated successfully! Total 1-Cycle Value: ₹${grandTotalAMC.toLocaleString()}`);
    setTimeout(() => {
      navigate('/warranty-amc');
    }, 1200);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Edit AMC Contract Details | Sonocare CRM</title>
        <meta name="description" content="Edit AMC Contract details following Installation Page design." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR (CLEAN TRANSPARENT HEADER — NO CARD BEHIND IT) */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/warranty-amc')}
            title="Back to Warranty & AMC Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Edit Warranty & AMC Details — {orderData.contractId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {orderData.orderFulfilmentId} | PI: {orderData.piNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* SECTION 1: CUSTOMER DETAILS & INSTALLATION SITE LOCATION */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <UserCheck size={18} color="#2E3192" />
              <span>Customer Details & Installation Site Location</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Client / Hospital Name "
                    required={true}
                    value={orderData.client}
                    onChange={(e) => setOrderData({ ...orderData, client: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={orderData.contactPerson}
                    onChange={(e) => setOrderData({ ...orderData, contactPerson: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile & Email"
                    value={`${orderData.mobile} | ${orderData.email}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('|');
                      setOrderData({
                        ...orderData,
                        mobile: parts[0]?.trim() || orderData.mobile,
                        email: parts[1]?.trim() || orderData.email
                      });
                    }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location"
                    value={orderData.territory}
                    onChange={(e) => setOrderData({ ...orderData, territory: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT SYSTEM & SOFTWARE LICENSE SUMMARY (SINGLE CLEAN CARD) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <PackageCheck size={18} color="#2E3192" />
              <span>SECTION 2 — Product System & Software License Summary ({productsList.length} Product(s))</span>
            </div>

            <div className="p-3 d-flex flex-column gap-3">
              {productsList.map((prod, idx) => {
                const cycleTot = getProductCycleTotal(prod);
                return (
                  <div key={prod.id}>
                    {/* Product Summary Header */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 mb-3 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <Boxes size={18} className="text-primary" />
                        <h6 className="fw-bold text-dark mb-0 fs-6">
                          Product {idx + 1}: {prod.productName}
                        </h6>
                        <span className="badge bg-secondary font-monospace">Qty: {prod.quantity}</span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted fw-semibold">Warranty Status:</span>
                        <span className="badge bg-danger">{prod.warrantyStatus}</span>
                      </div>
                    </div>

                    {/* Product Software & Warranty Info Input Boxes */}
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Product Category"
                          value={prod.category}
                          onChange={(e) => handleProductFieldChange(prod.id, 'category', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Serial Number"
                          value={prod.serialNumber}
                          onChange={(e) => handleProductFieldChange(prod.id, 'serialNumber', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Software Version"
                          value={prod.softwareVersion}
                          onChange={(e) => handleProductFieldChange(prod.id, 'softwareVersion', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Software License Key"
                          value={prod.licenseKey}
                          onChange={(e) => handleProductFieldChange(prod.id, 'licenseKey', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Installation Date"
                          type="date"
                          value={prod.installationDate}
                          onChange={(e) => handleProductFieldChange(prod.id, 'installationDate', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Warranty Duration"
                          value={prod.warrantyMonths}
                          onChange={(e) => handleProductFieldChange(prod.id, 'warrantyMonths', e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Warranty End Date"
                          type="date"
                          value={prod.warrantyEndDate}
                          onChange={(e) => handleProductFieldChange(prod.id, 'warrantyEndDate', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Product AMC Commercial Terms Fields */}
                    <div className="border-top pt-3">
                      <h6 className="fw-bold text-dark mb-3 small d-flex align-items-center gap-2">
                        <DollarSign size={16} className="text-primary" />
                        <span>Product AMC Commercial & Financial Terms</span>
                      </h6>
                      <div className="row g-3">
                        <div className="col-12 col-md-6 col-lg-6">
                          <Dropdown
                            label="AMC Type"
                            options={['SAMC (Support AMC)', 'CAMC (Comprehensive AMC)']}
                            value={prod.amcType}
                            onChange={(e) => handleProductFieldChange(prod.id, 'amcType', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <Dropdown
                            label="AMC Period (Cycle)"
                            options={['Monthly', 'Quarterly', 'Half-Yearly', '1 Year', '2 Years', '3 Years']}
                            value={prod.period}
                            onChange={(e) => handleProductFieldChange(prod.id, 'period', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <Dropdown
                            label="Alert Before Days"
                            options={['15 Days', '30 Days', '60 Days', '90 Days', '120 Days']}
                            value={prod.alertBeforeDays}
                            onChange={(e) => handleProductFieldChange(prod.id, 'alertBeforeDays', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="Base AMC Price (₹)"
                            type="number"
                            value={prod.basePrice}
                            onChange={(e) => handleProductFieldChange(prod.id, 'basePrice', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <Dropdown
                            label="Discount (%)"
                            options={['0%', '5%', '10%', '15%', '20%', '25%']}
                            value={`${prod.discountPercent}%`}
                            onChange={(e) => handleProductFieldChange(prod.id, 'discountPercent', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <Dropdown
                            label="GST %"
                            options={['18%', '12%', '5%', '0%']}
                            value={`${prod.gstPercent}%`}
                            onChange={(e) => handleProductFieldChange(prod.id, 'gstPercent', parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="1 Cycle Total (₹)"
                            type="number"
                            value={cycleTot}
                            disabled={true}
                            helpText="Calculated: (Base - Disc %) + GST %"
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <InputField
                            label="AMC Start Date"
                            type="date"
                            value={prod.startDate}
                            onChange={(e) => handleProductFieldChange(prod.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <InputField
                            label="AMC End Date (Calculated)"
                            type="date"
                            value={prod.endDate}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* CARD BOTTOM: APPLIED DISCOUNT/GST AND GRAND TOTAL IN ONE SINGLE ROW (RIGHT ALIGNED) */}
              <div className="d-flex flex-column align-items-end border-top pt-3 mt-3 gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                  <span className="small text-muted font-monospace border-end pe-3">
                    Applied: Discount ({productsList[0]?.discountPercent || 5}%) | GST ({productsList[0]?.gstPercent || 18}%)
                  </span>
                  <span className="small text-muted fw-semibold">Grand Total AMC Amount for 1 Cycle:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">₹{grandTotalAMC.toLocaleString()}</span>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-semibold"
                    onClick={() => navigate('/warranty-amc')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 fw-bold shadow-sm"
                    style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                  >
                    Update AMC Contract
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default EditAMCContract;
