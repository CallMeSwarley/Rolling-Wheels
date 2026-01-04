import Image from 'next/image';
import Link from 'next/link';

export default function WorkshopsPage() {
  return (
    <div className="main-content">
      <div className="page-content full-width">
        <h2 style={{ color: '#dc2626', marginBottom: '2rem' }}>BMX und Skateboard Workshops</h2>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'flex-start', 
          gap: '1.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <Image 
            src="/workshop-banner.png" 
            alt="Workshop Banner" 
            width={400} 
            height={400} 
            style={{ borderRadius: '8px', height: 'auto', flexShrink: 0 }}
          />
          
          <div style={{ flex: '1', minWidth: '280px', color: '#4a5568', lineHeight: '1.8' }}>
            <h2 style={{ color: '#dc2626', marginTop: '0', marginBottom: '1rem' }}>Wer?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Jeder, egal ob Anfänger oder Fortgeschrittener, der gerne ein paar coole Tricks und Moves 
            mit dem BMX oder Skateboard lernen möchte, ist bei diesem Workshop exakt richtig! Wir verfügen 
            auch über Leihausrüstung die Du Dir für den Workshop zu Sonderkonditionen ausleihen kannst.
          </p>

          <h2 style={{ color: '#dc2626', marginTop: '2rem', marginBottom: '1rem' }}>Was?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Wir starten mit Theorie und Materialkunde: wie kann ich kleine Reparaturen am Sportgerät 
            selbst durchführen. Dann teilen wir uns in kleine Gruppen auf und fahren unter Anleitung. 
            Zum Abschluss machen wir einen kleinen Wettkampf und verleihen die Workshopurkunden.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Spiel und Spaß in der Gemeinschaft kommen garantiert nicht zu kurz und für das leibliche 
            Wohl ist gesorgt. Neben einem warmen Mittagessen ist auch ein Snack und zwei Getränke inbegriffen.
          </p>

          <h2 style={{ color: '#dc2626', marginTop: '2rem', marginBottom: '1rem' }}>Wann?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Jeweils an den Sonntagen <strong>27.04.2025, 25.05.2025, 13.07.2025, 31.08.2025</strong> und <strong>5.10.2025</strong>
            <br />
            Um 11 Uhr gehts los und der offizielle Teil endet um 15 Uhr. Den Rest des Tages kannst du 
            gerne im Park zum freien Fahren nutzen.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Anmeldeschluss ist jeweils der Freitag <span style={{ textDecoration: 'underline' }}>vor</span> dem Workshoptermin.</strong>
          </p>

          <h2 style={{ color: '#dc2626', marginTop: '2rem', marginBottom: '1rem' }}>Wo?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Skatepark Rolling Wheels im Lohhofer Sportpark
            <br />
            Ludwig-Pettinger-Weg Ecke Ismaninger Straße, 85716 Unterschleißheim
          </p>

          <h2 style={{ color: '#dc2626', marginTop: '2rem', marginBottom: '1rem' }}>Wieviel?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Für <strong>SV Lohhof Mitglieder</strong> mit Hauptabteilung <strong><span style={{ textDecoration: 'underline' }}>Rolling Wheels</span></strong> beträgt 
            der Unkostenbeitrag <strong>40 €</strong>.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Für <strong>Nichtmitglieder</strong> beträgt die <strong>Kursgebühr 60 €.</strong>
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Am Besten gleich das <a href="/anmeldung-workshop.pdf" style={{ color: '#dc2626', textDecoration: 'underline' }}>Workshop-Anmeldeformular hier herunterladen</a>, 
            ausfüllen und wie auf dem Formular beschrieben an uns weiterleiten.
          </p>
          <p>
            <a href="/anmeldung-workshop.pdf" style={{ color: '#dc2626', textDecoration: 'underline', fontWeight: 'bold' }}>
              Anmeldung zum Workshop
            </a>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
