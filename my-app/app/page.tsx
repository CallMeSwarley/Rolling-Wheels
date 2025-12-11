import SideMenu from './components/SideMenu';
import ImageGallery from './components/ImageGallery';
import Image from 'next/image';

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
              <h2 style={{ marginBottom: '0.5rem' }}>Welcome to Rolling Wheels</h2>
              <p style={{ fontSize: '0.95rem', color: '#dc2626', fontWeight: '500', marginBottom: '1rem' }}>SV Lohhof - Ihr Rollsportverein</p>
              <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
                Welcome to SV Lohhof Rolling Wheels! We are a vibrant community sports
                organization dedicated to promoting active lifestyles, teamwork, and
                community spirit. Our facilities offer state-of-the-art equipment and
                programs for all ages and skill levels.
              </p>
            </div>
          </div>
          <section style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>About Us</h3>
            <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
              Founded with a passion for sports and community building, Rolling Wheels
              has become a cornerstone of the Lohhof community. We offer a variety of
              programs including youth training, competitive leagues, and recreational
              activities for the whole family.
            </p>
          </section>

          <section style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Our Gallery</h3>
            <ImageGallery />
          </section>

          <section style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Get Involved</h3>
            <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
              Interested in joining us? Check out our registration forms in the
              Downloads section and see our opening hours in the Calendar. We look
              forward to welcoming you to the Rolling Wheels family!
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
