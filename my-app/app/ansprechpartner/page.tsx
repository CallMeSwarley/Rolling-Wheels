import Image from 'next/image';
import SideMenu from '../components/SideMenu';

interface ContactPerson {
    id: number;
    name: string;
    position: string;
    email: string;
    image: string;
}

const contactPersons: ContactPerson[] = [
    {
        id: 1,
        name: 'Philip Staudigl',
        position: 'Abteilungsleiter',
        email: 'philip.staudigl@rolling-wheels.net',
        image: '/leiter_bilder/ps.jpg'
    },
    {
        id: 2,
        name: 'Thomas Stellwag',
        position: 'Stellvertretender Abteilungsleiter',
        email: 'thomas.stellwag@rolling-wheels.net',
        image: '/leiter_bilder/ts.jpg'
    },
    {
        id: 3,
        name: 'Michael Gerber',
        position: 'Kassenwart',
        email: 'michael.gerber@rolling-wheels.net',
        image: '/leiter_bilder/mg.jpg'
    },
    {
        id: 4,
        name: 'Maximilian Amougou',
        position: 'Schriftführer',
        email: 'maximilian.amougou@rolling-wheels.net',
        image: '/leiter_bilder/ma.jpeg'
    },
    {
        id: 5,
        name: 'Martin Hornburger',
        position: 'Jugendwart',
        email: 'martin.hornburger@rolling-wheels.net',
        image: '/leiter_bilder/mh.jpg'
    },
    {
        id: 6,
        name: 'Timm Dauth',
        position: 'Pressewart',
        email: 'timm.dauth@rolling-wheels.net',
        image: '/leiter_bilder/td.png'
    },
    {
        id: 7,
        name: 'Marvin Stellwag',
        position: 'Organisationswart',
        email: 'marvin.stellwag@rolling-wheels.net',
        image: '/leiter_bilder/ms.jpeg'
    }
];

export default function AnsprechpartnerPage() {
    return (
        <div className="main-content">
            <div className="with-sidebar">
                <SideMenu />
                <main className="page-content">
                    <h2 style={{ color: '#dc2626', marginBottom: '2rem' }}>Ansprechpartner</h2>

                    <div className="contact-persons-list">
                        {contactPersons.map((person) => (
                            <div key={person.id} className="contact-person-row">
                                <div className="person-image">
                                    <Image
                                        src={person.image}
                                        alt={person.name}
                                        width={150}
                                        height={150}
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                </div>
                                <div className="person-info">
                                    <h3>{person.position}</h3>
                                    <p className="person-name">{person.name}</p>
                                    <a href={`mailto:${person.email}`} className="person-email">
                                        {person.email}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
