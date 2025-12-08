import React, { useState } from 'react';
import Login from '../components/Login';
import CMSDashboard from '../components/CMSDashboard';

function CMS() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="main-content">
      <div className="page-content full-width">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <CMSDashboard onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default CMS;
