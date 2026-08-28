import React from 'react';
import { Menu, LogOut, User, ShieldCheck } from 'lucide-react';
import sonocareLogo from '../assets/sonocare.webp';
import '../styles/Layout.css';

/**
 * Fixed Top Header Component for MEDIALOGIC CRM
 * - Height: ~76px
 * - Left: MEDIALOGIC logo (src/assets/sonocare.webp) + Sidebar collapse toggle
 * - Right: Logged in employee name/profile + Logout button
 */
const Header = ({ isCollapsed, toggleSidebar, onLogout, currentUser = { name: 'Admin User', role: 'CRM Manager' } }) => {
  return (
    <header className="crm-header">
      {/* LEFT SIDE: Toggle Button + MEDIALOGIC Logo */}
      <div className="crm-header-left">
        <button
          className="crm-toggle-btn"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu size={22} />
        </button>

        <div className="crm-header-logo-container">
          <img
            src={sonocareLogo}
            alt="MEDIALOGIC CRM Logo"
            className="crm-header-logo"
          />
        </div>
      </div>

      {/* RIGHT SIDE: User Profile Badge + Logout Button */}
      <div className="crm-header-right">
        {/* User Profile Badge */}
        <div className="crm-user-profile">
          <div className="crm-user-avatar">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div className="crm-user-info">
            <span className="crm-user-name">{currentUser.name || 'Admin User'}</span>
            <span className="crm-user-role">{currentUser.role || 'CRM Executive'}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="crm-logout-btn"
          onClick={onLogout}
          title="Logout from CRM"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
