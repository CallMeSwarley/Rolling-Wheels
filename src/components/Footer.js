import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>
            SV Lohhof Rolling Wheels is a community sports organization
            dedicated to promoting active lifestyles and teamwork.
          </p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>
            Email: info@rolling-wheels.net<br />
            Phone: +49 (0) 123 456789<br />
            Address: Lohhof, Germany
          </p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <p>
            Facebook<br />
            Instagram<br />
            Twitter
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Rolling Wheels. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
