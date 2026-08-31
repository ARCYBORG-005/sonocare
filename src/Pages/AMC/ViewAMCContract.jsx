import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import {
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  DollarSign,
  Boxes,
  Edit
} from 'lucide-react';
import { initialMockAMCContracts } from './mockAMCData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';
import '../OrderFulfilment/OrderFulfilment.css';
import './AMCManagement.css';

/**
 * ViewAMCContract Component
 * Dedicated workspace page for viewing AMC Contract details.
 * Follows the EXACT UI design of EditAMCContract.jsx.
 * Route: /warranty-amc/:id/view
 */
const ViewAMCContract = () => {
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

  // Product List (Supports 1 or more products in Section 2)
  const productsList = useMemo(() => {
    if (!targetContract) return [];
    return [
      {
        id: 1,
        productName: targetContract.productSummary || 'Sonoscape X5 Portable Ultrasound System',
        category: 'Diagnostic Ultrasound System',
        serialNumber: 'SN-X5-2026-8841',
        softwareVersion: 'v4.2.1-PRO',
        licenseKey: 'LIC-SONO-X5-9982-A3',
        installationDate: '2024-05-10',
        warrantyMonths: '12 Months',
        warrantyEndDate: '2025-05-10',
        warrantyStatus: 'Warranty Ended',
        quantity: targetContract.productQty || 1,
        amcType: targetContract.amcType || 'SAMC (Support AMC)',
        nature: targetContract.nature || 'Mandatory support only',
        period: targetContract.period || '1 Year',
        basePrice: targetContract.basePrice || 135000,
        discountPercent: 5,
        gstPercent: targetContract.gstPercent || 18,
        totalAmountCycle: targetContract.totalAmountCycle || 150000,
        startDate: targetContract.startDate || '2025-05-11',
        endDate: targetContract.endDate || '2026-05-10',
        alertBeforeDays: targetContract.alertBeforeDays || '30 Days'
      }
    ];
  }, [targetContract]);

  // Calculate Grand Total AMC Amount for 1 Cycle
  const grandTotalAMC = useMemo(() => {
    return productsList.reduce((acc, prod) => {
      const b = Number(prod.basePrice) || 0;
      const discPct = Number(prod.discountPercent || 0);
      const gstPct = Number(prod.gstPercent) || 0;
      const discountAmount = (b * discPct) / 100;
      const taxable = Math.max(0, b - discountAmount);
      return acc + Math.round(taxable * (1 + gstPct / 100));
    }, 0);
  }, [productsList]);

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>AMC Contract Details | Sonocare CRM</title>
        <meta name="description" content="View AMC Contract details matching Edit AMC page design." />
      </Helmet>

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
                Warranty & AMC Details — {targetContract?.contractId}
              </h2>
              <span className="small text-muted font-monospace">
                Order Ref: {targetContract?.orderFulfilmentId} | PI: {targetContract?.piNumber || 'PI-2026-003-V1'}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className={`badge px-3 py-2 ${targetContract?.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'}`}>
            {targetContract?.status}
          </span>
         
        </div>
      </div>

      {targetContract && (
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
                    label="Client / Hospital Name"
                    value={targetContract.client}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={targetContract.contactPerson || 'Dr. Ananya Verma'}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile & Email"
                    value={`${targetContract.mobile || '9811223344'} | ${targetContract.email || 'purchase@fortis.com'}`}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location"
                    value={targetContract.territory || 'Bengaluru, Karnataka'}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT SYSTEM & SOFTWARE LICENSE SUMMARY (MATCHING EDIT PAGE EXACT DESIGN) */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <PackageCheck size={18} color="#2E3192" />
              <span>SECTION 2 — Product System & Software License Summary ({productsList.length} Product(s))</span>
            </div>

            <div className="p-3 d-flex flex-column gap-3">
              {productsList.map((prod, idx) => {
                const cycleTot = grandTotalAMC;
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
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Serial Number"
                          value={prod.serialNumber}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Software Version"
                          value={prod.softwareVersion}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Software License Key"
                          value={prod.licenseKey}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Installation Date"
                          type="date"
                          value={prod.installationDate}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Warranty Duration"
                          value={prod.warrantyMonths}
                          disabled={true}
                        />
                      </div>
                      <div className="col-12 col-sm-6 col-md-6">
                        <InputField
                          label="Warranty End Date"
                          type="date"
                          value={prod.warrantyEndDate}
                          disabled={true}
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
                          <InputField
                            label="AMC Type"
                            value={prod.amcType}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="AMC Period (Cycle)"
                            value={prod.period}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="Alert Before Days"
                            value={prod.alertBeforeDays}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="Base AMC Price (₹)"
                            value={`₹${Number(prod.basePrice).toLocaleString()}`}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="Discount (%)"
                            value={`${prod.discountPercent || 5}%`}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="GST %"
                            value={`${prod.gstPercent || 18}%`}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-6">
                          <InputField
                            label="1 Cycle Total (₹)"
                            value={`₹${cycleTot.toLocaleString()}`}
                            disabled={true}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <InputField
                            label="AMC Start Date"
                            type="date"
                            value={prod.startDate}
                            disabled={true}
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
              <div className="d-flex flex-column align-items-end border-top pt-3 mt-3 gap-2">
                <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end text-end">
                  <span className="small text-muted font-monospace border-end pe-3">
                    Applied: Discount ({productsList[0]?.discountPercent || 5}%) | GST ({productsList[0]?.gstPercent || 18}%)
                  </span>
                  <span className="small text-muted fw-semibold">Grand Total AMC Amount for 1 Cycle:</span>
                  <span className="fs-3 fw-bold text-success font-monospace">₹{grandTotalAMC.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ViewAMCContract;
