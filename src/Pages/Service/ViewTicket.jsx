import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField } from '../../components/FormInputs';
import { ToastContainer } from '../../components/Toast';
import {
  Wrench,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  Edit,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  PenTool,
  AlertTriangle
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import { getSlaStatus } from './slaEngine';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * ViewTicket Component
 * Read-only view page for service tickets.
 * Route: /service/tickets/:id/view
 */
const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Locate target ticket
  const targetTicket = useMemo(() => {
    let list = [...initialMockTickets];
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;
    } catch (e) {
      console.error(e);
    }
    const decoded = decodeURIComponent(id || '');
    return (
      list.find((t) => t.ticketId === decoded || t.id === decoded) ||
      list[0]
    );
  }, [id]);

  const slaInfo = useMemo(() => {
    if (!targetTicket) return null;
    return getSlaStatus(targetTicket);
  }, [targetTicket]);

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>View Ticket Details | Sonocare CRM</title>
        <meta name="description" content="View Ticket details in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/service/tickets')}
            title="Back to Ticket Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <Wrench size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Service Ticket Details — {targetTicket?.ticketId}
              </h2>
              <span className="small text-muted font-monospace">
                Customer: {targetTicket?.customerName} | Territory: {targetTicket?.territory} | Status: {targetTicket?.status}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-primary px-3 fw-bold d-inline-flex align-items-center gap-1"
          style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
          onClick={() => navigate(`/service/tickets/${encodeURIComponent(targetTicket?.ticketId)}/edit`)}
        >
          <Edit size={15} />
          <span>Edit Ticket</span>
        </button>
      </div>

      <div className="d-flex flex-column gap-4 mb-4">

        {/* SLA BUSINESS HOURS BREAKDOWN CARD */}
        {slaInfo && (
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Clock size={18} color="#2E3192" />
                <span>Business Hours SLA Performance (Mon–Sat 9AM–6PM)</span>
              </div>
              <span className={slaInfo.badgeClass}>{slaInfo.label}</span>
            </div>
            <div className="p-3">
              <div className="row g-3 text-center">
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded border">
                    <span className="small text-muted d-block">Ticket Priority</span>
                    <span className="fw-bold text-dark">{slaInfo.priority}</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded border">
                    <span className="small text-muted d-block">SLA Target</span>
                    <span className="fw-bold text-dark">{slaInfo.targetHours} Business Hours</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded border">
                    <span className="small text-muted d-block">Business Elapsed Time</span>
                    <span className="fw-bold text-primary">{slaInfo.elapsedHours} Hours</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="p-2 bg-light rounded border">
                    <span className="small text-muted d-block">Total Paused Time</span>
                    <span className="fw-bold text-warning">{targetTicket?.totalPausedMinutes || 0} Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* CARD 1: CUSTOMER MASTER INFORMATION */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <UserCheck size={18} color="#2E3192" />
            <span>Customer Master Information & Location</span>
          </div>
          <div className="p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <InputField
                  label="Customer / Hospital Name"
                  value={targetTicket?.customerName}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Contact Person"
                  value={targetTicket?.contactPerson}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Mobile Number"
                  value={targetTicket?.mobile}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Email Address"
                  value={targetTicket?.email}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Territory / Location"
                  value={targetTicket?.territory}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: TICKET SPECIFICATIONS & COMPLAINT DETAILS */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <PackageCheck size={18} color="#2E3192" />
            <span>Product Equipment, Severity & Resolution Specifications</span>
          </div>

          <div className="p-3 d-flex flex-column gap-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <InputField
                  label="Product Equipment Name"
                  value={targetTicket?.productName}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Product Category"
                  value={targetTicket?.category || 'Ultrasound Diagnostic Scanner'}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Product Serial Number"
                  value={targetTicket?.serialNumber}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-6">
                <InputField
                  label="Subscription / Service Type"
                  value={targetTicket?.type}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-6">
                <InputField
                  label="Severity / Priority Level"
                  value={targetTicket?.priority}
                  disabled={true}
                />
              </div>

              <div className="col-12 col-md-4">
                <InputField
                  label="Date Created"
                  value={targetTicket?.dateCreated}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Target Resolution Date"
                  value={targetTicket?.targetResolutionDate}
                  disabled={true}
                />
              </div>
              <div className="col-12 col-md-4">
                <InputField
                  label="Assigned Field Engineer(s)"
                  value={targetTicket?.assignedEngineer || 'Unassigned'}
                  disabled={true}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Problem / Issue Summary & Customer Complaint
                </label>
                <textarea
                  className="form-control bg-light"
                  rows={2}
                  value={targetTicket?.issueSummary}
                  disabled={true}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Technical Resolution Notes & Action Taken
                </label>
                <textarea
                  className="form-control bg-light font-monospace"
                  rows={2}
                  value={targetTicket?.resolutionNotes || 'Resolution details pending work completion.'}
                  disabled={true}
                />
              </div>
            </div>

            {/* CUSTOMER SIGN-OFF PREVIEW BOX */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <PenTool size={18} className="text-primary" />
                <span>Customer Work Sign-Off Record</span>
              </h6>
              <div className="row g-2 small font-monospace">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">OTP Verification:</span>
                  <span className={`badge ${targetTicket?.customerOtpVerified ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                    {targetTicket?.customerOtpVerified ? 'OTP Verified (Code 582910)' : 'Pending OTP'}
                  </span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Digital Signature:</span>
                  {targetTicket?.customerSignatureUrl ? (
                    <div className="border bg-white rounded p-1 d-inline-block mt-1">
                      <img src={targetTicket.customerSignatureUrl} alt="Customer Signature" style={{ height: '40px' }} />
                    </div>
                  ) : (
                    <span className="text-muted italic">Digital signature recorded via OTP / sign-off form.</span>
                  )}
                </div>
              </div>
            </div>

            {/* PARTS & COMMERCIAL QUOTATION TABLE IF PRESENT */}
            {Array.isArray(targetTicket?.partsList) && targetTicket.partsList.length > 0 && (
              <div>
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <FileSpreadsheet size={18} className="text-primary" />
                  <span>Spare Parts Replacement & Commercial Quotation Breakdown</span>
                </h6>
                <table className="table table-bordered table-sm small">
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>Part Name</th>
                      <th className="text-end">Estimated Cost (₹)</th>
                      <th className="text-center">AMC Coverage</th>
                      <th className="text-center">Quotation Status (&gt;₹5,000 Rule)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetTicket.partsList.map((part, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-bold text-dark">{part.partName}</td>
                        <td className="text-end font-monospace">₹{(part.cost || 0).toLocaleString('en-IN')}</td>
                        <td className="text-center">
                          <span className={`badge ${part.isAmcCovered ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                            {part.isAmcCovered ? 'AMC Covered (₹0)' : 'Out of Warranty'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border font-monospace">
                            {part.quotationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* CARD 3: 3-TIER TECHNICAL ESCALATION LOGS */}
        <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
          <div className="section-card-title-bar">
            <ShieldCheck size={18} color="#2E3192" />
            <span>3-Tier Technical Escalation Logs</span>
          </div>

          <div className="p-3 d-flex flex-column gap-3">
            {/* Level 1: Support Engineers */}
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-2">Level 1: Support Field Engineers</h6>
              <div className="row g-2 small">
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Assigned Field Engineers:</span>
                  <span className="fw-bold text-dark">{targetTicket?.assignedEngineer || 'Unassigned'}</span>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted d-block">Initial Diagnosis & Inspection Notes:</span>
                  <span className="font-monospace text-muted">{targetTicket?.issueSummary || 'Initial inspection pending.'}</span>
                </div>
              </div>
            </div>

            {/* Level 2: Team Lead Escalation */}
            <div className="p-3 bg-white rounded border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0">Level 2: Team Lead Escalation</h6>
                <span className={`badge ${targetTicket?.requiresTeamLeadSupport ? 'bg-warning text-dark' : 'bg-light text-muted border'}`}>
                  {targetTicket?.requiresTeamLeadSupport ? 'Escalated to Team Lead' : 'Not Escalated'}
                </span>
              </div>
              {targetTicket?.requiresTeamLeadSupport ? (
                <div className="row g-2 small font-monospace">
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Team Lead Name:</span>
                    <span className="fw-bold text-dark">{targetTicket?.teamLeadName || 'Suresh Reddy (Lead)'}</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Mobile & Email:</span>
                    <span>{targetTicket?.teamLeadMobile || '9740556677'} | {targetTicket?.teamLeadEmail || 'suresh.reddy@sonocare.com'}</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Completion Time:</span>
                    <span>{targetTicket?.teamLeadCompletionDateTime || '2026-08-28 15:00'}</span>
                  </div>
                  <div className="col-12 mt-2">
                    <span className="text-muted d-block">Team Lead Resolution Remarks:</span>
                    <span className="text-dark">{targetTicket?.teamLeadRemarks || 'Reviewed display board assembly and approved patch dispatch.'}</span>
                  </div>
                </div>
              ) : (
                <span className="small text-muted italic">Issue resolved by Level 1 Support Engineers without Team Lead escalation.</span>
              )}
            </div>

            {/* Level 3: Developer Team Escalation */}
            <div className="p-3 bg-light rounded border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0">Level 3: Developer Team Escalation</h6>
                <span className={`badge ${targetTicket?.requiresDeveloperSupport ? 'bg-danger text-white' : 'bg-light text-muted border'}`}>
                  {targetTicket?.requiresDeveloperSupport ? 'Escalated to Developer Team' : 'Not Escalated'}
                </span>
              </div>
              {targetTicket?.requiresDeveloperSupport ? (
                <div className="row g-2 small font-monospace">
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Assigned Developer:</span>
                    <span className="fw-bold text-dark">{targetTicket?.developerList?.[0]?.name || 'Rohan Deshmukh (Firmware Dev)'}</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Mobile & Email:</span>
                    <span>{targetTicket?.developerList?.[0]?.mobile || '9811002233'} | {targetTicket?.developerList?.[0]?.email || 'rohan.dev@sonocare.com'}</span>
                  </div>
                  <div className="col-12 col-md-4">
                    <span className="text-muted d-block">Completion Time:</span>
                    <span>{targetTicket?.developerList?.[0]?.completedDateTime || '2026-08-28 16:30'}</span>
                  </div>
                  <div className="col-12 mt-2">
                    <span className="text-muted d-block">Firmware / Code Patch Remarks:</span>
                    <span className="text-dark">{targetTicket?.developerList?.[0]?.remarks || 'Firmware patch v4.2.1 compiled and flashed onto scanner EEPROM.'}</span>
                  </div>
                </div>
              ) : (
                <span className="small text-muted italic">No software or firmware developer code escalation required.</span>
              )}
            </div>

            {/* CARD BOTTOM FOOTER */}
            <div className="d-flex gap-2 justify-content-end border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={() => navigate('/service/tickets')}
              >
                Back to Register
              </button>
              <button
                type="button"
                className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                onClick={() => navigate(`/service/tickets/${encodeURIComponent(targetTicket?.ticketId)}/edit`)}
              >
                <Edit size={18} />
                <span>Edit Ticket</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewTicket;
