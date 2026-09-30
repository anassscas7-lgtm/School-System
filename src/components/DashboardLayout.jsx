import React from 'react';
import Sidebar from './Sidebar/Sidebar'; // Importing your new Sidebar
import './DashboardLayout.css'; // Importing the layout grid

export default function DashboardLayout({ 
  children, 
  userRole = 'admin', 
  currentPath = '/dashboard', 
  userName = 'System Admin', 
  userInitials = 'SA' 
}) {
  return (
    <div className="dashboard-layout">
      {/* The Sidebar stays fixed on the left */}
      <Sidebar 
         userRole={userRole} 
         currentPath={currentPath} 
         userName={userName} 
         userInitials={userInitials} 
      />
      
      {/* The specific page content gets injected into this scrollable area */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}