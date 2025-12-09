import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Image src="/logo.png" alt="Rolling Wheels Logo" width={40} height={40} style={{ borderRadius: '3px' }} />
            <h4>About Us</h4>
          </div>
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
