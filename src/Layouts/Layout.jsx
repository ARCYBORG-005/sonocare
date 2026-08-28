import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ToastContainer } from '../components/Toast';
import '../styles/Layout.css';

/**
 * Reusable Application Layout Shell Component for MEDIALOGIC CRM
 * - Wraps Header, Sidebar, and Main Content Area
 * - Manages responsive sidebar collapse & mobile drawer overlay
 * - Ensures main content scrolls independently without being hidden
 */
const Layout = ({
  children,
  activePage = 'dashboard',
  onNavigate,
  onLogout,
  currentUser = { name: 'Admin User', role: 'MEDIALOGIC Executive' }
}) => {
  // Sidebar collapsed state for desktop & tablet
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mobile drawer open state for mobile screens (<768px)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle window resize to auto-collapse on tablet viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 992) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 992) {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar action
  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="crm-layout-wrapper">
      {/* Global Toast Container */}
      <ToastContainer />

      {/* 1. FIXED TOP HEADER */}
      <Header
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {/* 2. MOBILE SIDEBAR BACKDROP OVERLAY */}
      <div
        className={`crm-sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* 3. FIXED COLLAPSIBLE VERTICAL SIDEBAR */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        activePage={activePage}
        onNavigate={onNavigate}
        closeMobileSidebar={closeMobileSidebar}
      />

      {/* 4. INDEPENDENT MAIN CONTENT AREA */}
      <main className={`crm-main-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
