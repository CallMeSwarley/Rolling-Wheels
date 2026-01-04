import SideMenu from './components/SideMenu';
import ImageGallery from './components/ImageGallery';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="main-content">
      <div className="with-sidebar">
        <SideMenu />
        <main className="page-content">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            alignItems: 'flex-start', 
            gap: '1.5rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <Image
              src="/logo.png"
              alt="Rolling Wheels Logo"
              width={200}
              height={280}
              style={{ borderRadius: '6px', flexShrink: 0 }}
            />
            <div style={{ flex: '1', minWidth: '280px' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Willkommen bei den Rolling Wheels</h2>
              <p style={{ fontSize: '0.95rem', color: '#dc2626', fontWeight: '500', marginBottom: '1rem' }}>Ihr lokaler Rollsport Verein</p>
              <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
                Willkommen beim SV Lohhof Rolling Wheels! Seit 1990 sind wir die Anlaufstelle 
                für BMX- und Skateboard-Begeisterte im Münchner Norden. Unser Skatepark bietet 
                professionelle Rampen und eine lebendige Community für Anfänger und Fortgeschrittene 
                jeden Alters.
              </p>
            </div>
          </div>
          <section id="about" style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Über uns</h3>
            <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
              1990 als gemeinnütziger Verein gegründet und 1994 als Abteilung in den SV Lohhof 
              eingegliedert, haben wir uns über die Jahre zu einer der besten Outdoor-Anlagen 
              Deutschlands entwickelt. Mit über 3000 qm im Lohhofer Sportpark bieten wir eine 
              einzigartige Kombination aus Holz- und Betonrampen, die in unzähligen Stunden 
              Eigenleistung von unseren engagierten Mitgliedern aufgebaut und gepflegt werden.
            </p>
          </section>

          <section style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Unsere Galerie</h3>
            <ImageGallery />
          </section>

          <section style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Mitmachen</h3>
            <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
              Interesse dabei zu sein? Schau dir unsere Anmeldeformulare im{' '}
              <Link href="/downloads" style={{ color: '#dc2626', textDecoration: 'underline' }}>
                Download-Bereich
              </Link>{' '}
              an und informiere dich über unsere Öffnungszeiten im{' '}
              <Link href="/calendar" style={{ color: '#dc2626', textDecoration: 'underline' }}>
                Kalender
              </Link>
              . Wir bieten regelmäßige <Link href="/workshops" style={{ color: '#dc2626', textDecoration: 'underline' }}>
                Workshops
              </Link> für Anfänger & Fortgeschrittene und veranstalten Events für die ganze Community. 
              Wir freuen uns darauf, dich in der Rolling Wheels Familie am Platz begrüßen zu dürfen!
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
