import Image from 'next/image';
import { FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div id="about" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Image src="/logo.png" alt="Rolling Wheels Logo" width={40} height={40} style={{ borderRadius: '3px' }} />
            <h4>Über uns</h4>
          </div>
          <p>
            SV Lohhof Rolling Wheels ist ein gemeinnütziger Sportverein,
            bei dem sich alles um unseren Skatepark dreht.
          </p>
        </div>
        <div id="contact" className="footer-section">
          <h4>Kontakt</h4>
          <p>
            E-Mail: <a href="mailto:info@rolling-wheels.net">info@rolling-wheels.net</a><br />
            Addresse: Ecke Ludwig-Pettinger-Weg/Ismaninger Straße, 85716 Unterschleißheim
          </p>
        </div>
        <div className="footer-section">
          <h4>Folge uns</h4>
          <p>
            <a href="https://www.facebook.com/RollingWheelsLohhof/">
              <FaFacebook size={20} /><span>Facebook</span>
            </a><br />
            <a href="https://www.instagram.com/sv_lohhof_rolling_wheels/">
              <FaInstagram size={20} /><span>Instagram</span>
            </a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Rolling Wheels | <Link href="/impressum">Impressum</Link></p>
      </div>
    </footer>
  );
}
