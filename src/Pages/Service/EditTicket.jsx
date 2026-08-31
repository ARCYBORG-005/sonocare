import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  Save
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * EditTicket Component
 * Editable workspace page for updating Service Tickets.
 * Route: /service/tickets/:id/edit
 */
const EditTicket = () => {
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

  // Form state
  const [formState, setFormState] = useState({
    customerName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    territory: '',
    productName: '',
    category: '',
    serialNumber: '',
    type: 'CAMC',
    priority: 'Critical',
    assignedEngineer: '',
    status: 'New',
    issueSummary: '',
    resolutionNotes: ''
  });

  useEffect(() => {
    if (targetTicket) {
      setFormState({
        customerName: targetTicket.customerName || '',
        contactPerson: targetTicket.contactPerson || '',
        mobile: targetTicket.mobile || '',
        email: targetTicket.email || '',
        territory: targetTicket.territory || '',
        productName: targetTicket.productName || '',
        category: targetTicket.category || 'Ultrasound Diagnostic Scanner',
        serialNumber: targetTicket.serialNumber || '',
        type: targetTicket.type || 'CAMC',
        priority: targetTicket.priority || 'Critical',
        assignedEngineer: targetTicket.assignedEngineer || 'Unassigned',
        status: targetTicket.status || 'New',
        issueSummary: targetTicket.issueSummary || '',
        resolutionNotes: targetTicket.resolutionNotes || ''
      });
    }
  }, [targetTicket]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const updatedTicket = {
      ...targetTicket,
      ...formState
    };

    try {
      let list = [...initialMockTickets];
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;

      const updatedList = list.map((item) =>
        item.ticketId === targetTicket.ticketId ? updatedTicket : item
      );

      localStorage.setItem('app_service_tickets', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Ticket ${targetTicket?.ticketId} updated successfully!`);
    setTimeout(() => {
      navigate('/service/tickets');
    }, 1200);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Edit Ticket | Sonocare CRM</title>
        <meta name="description" content="Edit Service Ticket in Sonocare CRM." />
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
                Edit Ticket — {targetTicket?.ticketId}
              </h2>
              <span className="small text-muted font-monospace">
                Customer: {targetTicket?.customerName} | Territory: {targetTicket?.territory}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
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
                    label="Customer / Hospital Name *"
                    value={formState.customerName}
                    onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person"
                    value={formState.contactPerson}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile Number"
                    value={formState.mobile}
                    onChange={(e) => setFormState({ ...formState, mobile: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Email Address"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory "
                    value={formState.territory}
                    onChange={(e) => setFormState({ ...formState, territory: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PRODUCT SPECIFICATIONS & PROBLEM SUMMARY */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <PackageCheck size={18} color="#2E3192" />
              <span>Product Equipment, Severity & Resolution Specifications</span>
            </div>

            <div className="p-3 d-flex flex-column gap-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <InputField
                    label="Product Equipment Name "
                    value={formState.productName}
                    onChange={(e) => setFormState({ ...formState, productName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Product Category "
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Product Serial Number "
                    value={formState.serialNumber}
                    onChange={(e) => setFormState({ ...formState, serialNumber: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Service Type "
                    options={['SAMC', 'CAMC', 'Subscription']}
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Severity  Level "
                    options={['Critical', 'High', 'Medium', 'Low']}
                    value={formState.priority}
                    onChange={(e) => setFormState({ ...formState, priority: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Problem / Issue Summary & Customer Complaint
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formState.issueSummary}
                    onChange={(e) => setFormState({ ...formState, issueSummary: e.target.value })}
                  />
                </div>

               
              </div>

              {/* CARD BOTTOM FOOTER */}
              <div className="d-flex gap-2 justify-content-end border-top pt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/service/tickets')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                >
                  <Save size={18} />
                  <span>Update Record</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default EditTicket;
