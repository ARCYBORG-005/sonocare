import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from '../../components/Toast';
import {
  ShieldCheck,
  Save,
  CheckSquare
} from 'lucide-react';
import { initialRoles } from '../Masters/Role';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

/**
 * Categorized Modules Structure matching the design screenshot
 */
const MODULE_GROUPS = [
  {
    category: 'MAIN',
    modules: [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'inventory', name: 'Inventory Register' }
    ]
  },
  {
    category: 'SALES PIPELINE',
    modules: [
      { id: 'enquiries', name: 'Enquiries' },
      { id: 'leads', name: 'Leads & Proforma Invoice' },
      { id: 'campaigns', name: 'Campaigns & Log Outreach' }
    ]
  },
  {
    category: 'FULFILMENT & ORDERS',
    modules: [
      { id: 'order_fulfilment', name: 'Order Fulfilment' },
      { id: 'order_cancellation', name: 'Order Cancellation' }
    ]
  },
  {
    category: 'CONTRACTS & SUBSCRIPTIONS',
    modules: [
      { id: 'amc', name: 'AMC & Warranty Contracts' },
      { id: 'subscriptions', name: 'Subscriptions (PS)' }
    ]
  },
  {
    category: 'SERVICE OPERATIONS',
    modules: [
      { id: 'service_tickets', name: 'Ticket Creation & Operations' },
      { id: 'technical_escalations', name: 'Technical Escalations' }
    ]
  },
  {
    category: 'REPORTS & ANALYTICS',
    modules: [
      { id: 'sales_reports', name: 'Sales & Fulfilment Reports' },
      { id: 'amc_reports', name: 'AMC & Warranty Reports' },
      { id: 'subscription_reports', name: 'Subscription Reports' },
      { id: 'ticket_reports', name: 'Ticket Performance Reports' }
    ]
  }
];

// Helper to generate full default privileges for a role
const createDefaultPrivileges = (roleName) => {
  const isSuperAdmin = roleName === 'Super Admin' || roleName === 'Administrator';
  const privileges = {};

  MODULE_GROUPS.forEach((group) => {
    group.modules.forEach((mod) => {
      privileges[mod.id] = {
        view: true,
        add: isSuperAdmin,
        edit: isSuperAdmin,
        delete: isSuperAdmin
      };
    });
  });

  return privileges;
};

/**
 * AccessPrivilege Component
 * Exact UI implementation of Settings > Access Privilege
 * Route: /settings/access-privilege
 */
const AccessPrivilege = () => {
  // Dynamically load system roles from Role Master
  const systemRoles = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_roles') || '[]');
      if (stored.length > 0) {
        const names = stored.map((r) => r.roleName).filter(Boolean);
        return Array.from(new Set(['Super Admin', ...names]));
      }
    } catch (e) {
      console.error(e);
    }
    const defaultNames = initialRoles.map((r) => r.roleName);
    return Array.from(new Set(['Super Admin', ...defaultNames]));
  }, []);

  const [selectedRole, setSelectedRole] = useState(systemRoles[0] || 'Super Admin');

  // Role Privilege Matrix State map: { [roleName]: { [moduleId]: { view, add, edit, delete } } }
  const [rolePrivilegesMap, setRolePrivilegesMap] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_role_access_privileges') || '{}');
      if (Object.keys(stored).length > 0) return stored;
    } catch (e) {
      console.error(e);
    }
    // Initialize default matrix for all roles
    const initialMap = {};
    systemRoles.forEach((r) => {
      initialMap[r] = createDefaultPrivileges(r);
    });
    return initialMap;
  });

  // Active matrix for the currently selected role
  const activeMatrix = useMemo(() => {
    return rolePrivilegesMap[selectedRole] || createDefaultPrivileges(selectedRole);
  }, [rolePrivilegesMap, selectedRole]);

  // Handle single privilege checkbox toggle
  const handleTogglePrivilege = (moduleId, permType) => {
    setRolePrivilegesMap((prev) => {
      const currentRoleMatrix = prev[selectedRole] || createDefaultPrivileges(selectedRole);
      const currentModPerms = currentRoleMatrix[moduleId] || { view: false, add: false, edit: false, delete: false };
      
      const newPermVal = !currentModPerms[permType];
      const updatedModPerms = { ...currentModPerms, [permType]: newPermVal };

      // Rule: If enabling Add, Edit, or Delete, View MUST automatically be checked
      if ((permType === 'add' || permType === 'edit' || permType === 'delete') && newPermVal) {
        updatedModPerms.view = true;
      }
      // Rule: If unchecking View, Add/Edit/Delete MUST automatically be unchecked
      if (permType === 'view' && !newPermVal) {
        updatedModPerms.add = false;
        updatedModPerms.edit = false;
        updatedModPerms.delete = false;
      }

      return {
        ...prev,
        [selectedRole]: {
          ...currentRoleMatrix,
          [moduleId]: updatedModPerms
        }
      };
    });
  };

  // Toggle ALL permissions for a single row module
  const handleToggleRowAll = (moduleId) => {
    const currentModPerms = activeMatrix[moduleId] || { view: false, add: false, edit: false, delete: false };
    const isAllChecked = currentModPerms.view && currentModPerms.add && currentModPerms.edit && currentModPerms.delete;
    const newVal = !isAllChecked;

    setRolePrivilegesMap((prev) => {
      const currentRoleMatrix = prev[selectedRole] || createDefaultPrivileges(selectedRole);
      return {
        ...prev,
        [selectedRole]: {
          ...currentRoleMatrix,
          [moduleId]: {
            view: newVal,
            add: newVal,
            edit: newVal,
            delete: newVal
          }
        }
      };
    });
  };

  // Toggle ALL permissions for an entire COLUMN (e.g. Master View column)
  const handleToggleColumnMaster = (permType) => {
    const allModules = MODULE_GROUPS.flatMap((g) => g.modules);
    const isColumnAllChecked = allModules.every((mod) => activeMatrix[mod.id]?.[permType]);
    const newVal = !isColumnAllChecked;

    setRolePrivilegesMap((prev) => {
      const currentRoleMatrix = prev[selectedRole] || createDefaultPrivileges(selectedRole);
      const updatedRoleMatrix = { ...currentRoleMatrix };

      allModules.forEach((mod) => {
        const modPerms = { ...(updatedRoleMatrix[mod.id] || { view: false, add: false, edit: false, delete: false }) };
        modPerms[permType] = newVal;

        if ((permType === 'add' || permType === 'edit' || permType === 'delete') && newVal) {
          modPerms.view = true;
        }
        if (permType === 'view' && !newVal) {
          modPerms.add = false;
          modPerms.edit = false;
          modPerms.delete = false;
        }

        updatedRoleMatrix[mod.id] = modPerms;
      });

      return {
        ...prev,
        [selectedRole]: updatedRoleMatrix
      };
    });
  };

  // Save changes to localStorage / backend state
  const handleSavePrivileges = () => {
    try {
      localStorage.setItem('app_role_access_privileges', JSON.stringify(rolePrivilegesMap));
      toast.success(`Access privileges for ${selectedRole} saved successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save access privileges.');
    }
  };

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Access Privilege | Sonocare CRM</title>
        <meta name="description" content="Access Privilege Management — Configure View, Add, Edit, and Delete module permissions per role." />
      </Helmet>
      <ToastContainer />

      {/* ─── 1. TOP PAGE HEADER BAR ─────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={26} style={{ color: '#1F325C' }} />
            <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '1.4rem' }}>Access Privilege</h2>
          </div>
          <span className="small text-muted font-monospace" style={{ fontSize: '0.82rem' }}>
            Settings &gt; Access Privilege
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Save Button */}
          <button
            type="button"
            className="btn px-4 py-2 fw-bold text-white d-inline-flex align-items-center gap-2 rounded-2 shadow-sm"
            onClick={handleSavePrivileges}
            style={{ backgroundColor: '#1F325C', borderColor: '#1F325C', fontSize: '0.88rem' }}
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* ─── 2. SELECT ROLE & LEGEND CARD ──────────────────────────────── */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: '12px' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Role Dropdown (Populated dynamically from Role Master) */}
          <div className="d-flex flex-column" style={{ minWidth: '280px' }}>
            <label className="form-label small fw-semibold text-muted mb-1">Select Role</label>
            <select
              className="form-select form-select-md fw-bold text-dark border-secondary-subtle"
              style={{ borderRadius: '8px', fontSize: '0.95rem' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {systemRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Color Legend Indicators */}
          <div className="d-flex align-items-center gap-3 flex-wrap small font-monospace">
            <span className="d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#2563eb' }}></span>
              <strong style={{ color: '#2563eb' }}>View</strong>
            </span>
            <span className="d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#16a34a' }}></span>
              <strong style={{ color: '#16a34a' }}>Add</strong>
            </span>
            <span className="d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#d97706' }}></span>
              <strong style={{ color: '#d97706' }}>Edit</strong>
            </span>
            <span className="d-flex align-items-center gap-1">
              <span className="d-inline-block rounded-1" style={{ width: '12px', height: '12px', backgroundColor: '#dc2626' }}></span>
              <strong style={{ color: '#dc2626' }}>Delete</strong>
            </span>
            <span className="text-muted ms-2">
              — Editing privileges for <strong className="text-dark">{selectedRole}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. PRIVILEGE MATRIX TABLE ─────────────────────────────────── */}
      <div className="card border shadow-sm bg-white overflow-hidden" style={{ borderRadius: '12px' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: '0.9rem' }}>
            {/* Table Column Headers */}
            <thead style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th className="ps-4 py-3 text-uppercase text-secondary fw-bold" style={{ width: '40%' }}>
                  Module
                </th>

                {/* View Header */}
                <th className="text-center py-3" style={{ width: '12%' }}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center mx-auto"
                    onClick={() => handleToggleColumnMaster('view')}
                  >
                    <CheckSquare size={16} style={{ color: '#2563eb' }} />
                    <span className="fw-bold mt-1" style={{ color: '#2563eb', fontSize: '0.85rem' }}>View</span>
                  </button>
                </th>

                {/* Add Header */}
                <th className="text-center py-3" style={{ width: '12%' }}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center mx-auto"
                    onClick={() => handleToggleColumnMaster('add')}
                  >
                    <CheckSquare size={16} style={{ color: '#16a34a' }} />
                    <span className="fw-bold mt-1" style={{ color: '#16a34a', fontSize: '0.85rem' }}>Add</span>
                  </button>
                </th>

                {/* Edit Header */}
                <th className="text-center py-3" style={{ width: '12%' }}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center mx-auto"
                    onClick={() => handleToggleColumnMaster('edit')}
                  >
                    <CheckSquare size={16} style={{ color: '#d97706' }} />
                    <span className="fw-bold mt-1" style={{ color: '#d97706', fontSize: '0.85rem' }}>Edit</span>
                  </button>
                </th>

                {/* Delete Header */}
                <th className="text-center py-3" style={{ width: '12%' }}>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none d-flex flex-column align-items-center mx-auto"
                    onClick={() => handleToggleColumnMaster('delete')}
                  >
                    <CheckSquare size={16} style={{ color: '#dc2626' }} />
                    <span className="fw-bold mt-1" style={{ color: '#dc2626', fontSize: '0.85rem' }}>Delete</span>
                  </button>
                </th>

                {/* All Master Header */}
                <th className="text-center py-3" style={{ width: '12%' }}>
                  <span className="fw-bold d-block text-secondary" style={{ fontSize: '0.85rem' }}>All</span>
                </th>
              </tr>
            </thead>

            {/* Table Body Categorized Groups */}
            <tbody>
              {MODULE_GROUPS.map((group) => (
                <React.Fragment key={group.category}>
                  {/* Category Header Row (Light Blue background) */}
                  <tr style={{ backgroundColor: '#eff6ff', borderTop: '1px solid #dbeafe', borderBottom: '1px solid #dbeafe' }}>
                    <td colSpan="6" className="ps-4 py-2 fw-bold text-primary" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                      {group.category}
                    </td>
                  </tr>

                  {/* Modules under this Category */}
                  {group.modules.map((mod) => {
                    const modPerms = activeMatrix[mod.id] || { view: false, add: false, edit: false, delete: false };
                    const isAllRowChecked = modPerms.view && modPerms.add && modPerms.edit && modPerms.delete;

                    return (
                      <tr key={mod.id} className="border-bottom hover-row" style={{ transition: 'background-color 0.2s' }}>
                        {/* Module Name */}
                        <td className="ps-4 py-3 fw-semibold text-dark">
                          {mod.name}
                        </td>

                        {/* View Checkbox */}
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              borderColor: '#2563eb',
                              accentColor: '#2563eb'
                            }}
                            checked={modPerms.view}
                            onChange={() => handleTogglePrivilege(mod.id, 'view')}
                          />
                        </td>

                        {/* Add Checkbox */}
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              borderColor: '#16a34a',
                              accentColor: '#16a34a'
                            }}
                            checked={modPerms.add}
                            onChange={() => handleTogglePrivilege(mod.id, 'add')}
                          />
                        </td>

                        {/* Edit Checkbox */}
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              borderColor: '#d97706',
                              accentColor: '#d97706'
                            }}
                            checked={modPerms.edit}
                            onChange={() => handleTogglePrivilege(mod.id, 'edit')}
                          />
                        </td>

                        {/* Delete Checkbox */}
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              borderColor: '#dc2626',
                              accentColor: '#dc2626'
                            }}
                            checked={modPerms.delete}
                            onChange={() => handleTogglePrivilege(mod.id, 'delete')}
                          />
                        </td>

                        {/* All Row Checkbox */}
                        <td className="text-center py-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              borderColor: '#d97706',
                              accentColor: '#d97706'
                            }}
                            checked={isAllRowChecked}
                            onChange={() => handleToggleRowAll(mod.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessPrivilege;
