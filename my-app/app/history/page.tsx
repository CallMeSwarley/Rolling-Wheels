'use client';

import SideMenu from '../components/SideMenu';

export default function History() {
    const timelineData = [
        {
            year: "1990",
            content: `Gründung des gemeinnützigen Vereins „Rolling Wheels e.V.", der zum Ziel hat in Unterschleißheim eine angemessene Anlage für BMX und Skateboard zu bekommen. Mitgliederzahl ist 50 und Vereinsvorstand wird Dieter Bürger und Stellvertreter Thomas Stellwag`
        },
        {
            year: "1991",
            content: `Aus Mangel an Trainingsmöglichkeiten in Lohhof, wird weiterhin in Eching auf einem Verkehrsübungsplatz und der örtlichen Halfpipe trainiert. Dort wird auch der erste BMX Wettkampf der „Rolling Wheels" veranstaltet.`,
            achievements: [
                "2. Platz BMX Weltmeisterschaft (Aalborg, Dänemark) Harald Wagner",
                "5. Platz BMX Weltmeisterschaft (Aalborg, Dänemark) Thomas Stellwag",
                "1. Platz BMX Deutsche Meisterschaft (Freiburg) Monika Stellwag",
                "1. Platz BMX Deutsche Meisterschaft (Freiburg) Harald Wagner",
                "1. Platz BMX Deutsche Meisterschaft (Freiburg) Thomas Stellwag"
            ]
        },
        {
            year: "1992",
            content: `Rolling Wheels veranstaltet wieder den einzigen BMX Wettkampf in der Münchner Umgebung.`,
            achievements: [
                "1. Platz BMX Weltmeisterschaft (Budapest, Ungarn) Harald Wagner",
                "7. Platz BMX Weltmeisterschaft (Budapest, Ungarn) Thomas Stellwag",
                "1. Platz BMX Deutsche Meisterschaft (Braunschweig) Thomas Stellwag"
            ]
        },
        {
            year: "1993",
            content: `BMX- und Skateboard-Wettkampf in Eching.`,
            achievements: [
                "1. Platz BMX Weltmeisterschaft (Limoges, Frankreich) Thomas Stellwag",
                "2. Platz BMX Weltmeisterschaft (Limoges, Frankreich) Monika Stellwag",
                "3. Platz BMX Weltmeisterschaft (Limoges, Frankreich) Harald Wagner",
                "1. Platz BMX Deutsche Meisterschaft (Nürnberg) Thomas Stellwag",
                "3. Platz BMX Deutsche Meisterschaft (Nürnberg) Christian Hundertmark"
            ]
        },
        {
            year: "1994",
            content: `Rolling Wheels wird mit über 50 Mitgliedern als Abteilung in den SV-Lohhof eingegliedert. Die Abteilung beantragt die gemeindliche Bezuschussung zum Bau einer BMX-/Skateanlage. Abteilungsleiter ist Marc Heinzmann. BMX-Wettkampf in Eching, der inzwischen schon einen besonders guten Ruf genießt.`,
            achievements: [
                "2. Platz BMX Deutsche Meisterschaft (Beerfelden) Thomas Stellwag",
                "2. Platz BMX Weltmeisterschaft (Köln) Thomas Stellwag",
                "3. Platz BMX Weltmeisterschaft (Köln) Thomas Stellwag"
            ]
        },
        {
            year: "1995",
            content: `Die Neueröffnung des BMX/Skate-Shops „360Grad" in Unterschleißheim, wird von Seiten der Gemeinde als ein weiteres positives Signal gewertet und der Zuschuss wird bewilligt. Ein passendes Grundstück wird von der Gemeinde günstig erworben. Letzter BMX Wettkampf in Eching.`,
            achievements: [
                "3. Platz BMX Deutsche Meisterschaft (Köln) Thomas Stellwag"
            ]
        },
        {
            year: "1996",
            content: `Im Sommer beginnen die Erd- und Asphaltierungsarbeiten der ca. 3000qm. großen Fläche im Lohhofer Sportpark. Das Vereinsgelände ist im Herbst fertig gestellt und es wird sogar noch die erste große Rampe in Eigenleistung gebaut. Die Mitglieder investieren an die 900 Arbeitsstunden, Materialkosten für diese eine Rampe sind über 12,000 DM und werden von der Abteilung selbst übernommen. Es findet auch der erste BMX Wettkampf statt und die Anlage wird durch Bürgermeister Zeitler und dem Vereinsvorstand Herrn Schindler offiziell eröffnet.`,
            achievements: [
                "1. Platz BMX Weltmeisterschaft (Köln) Daniel Tinhof",
                "2. Platz BMX Weltmeisterschaft (Köln) Omar Almanai"
            ]
        },
        {
            year: "1997",
            content: `Es entstehen sechs weitere Rampen. Sämtliche Arbeiten (Planung, Beschaffung, Montage) werden von den Abteilungsmitgliedern durchgeführt (ca. 2000 Arbeitsstunden, Materialkosten übernimmt die Abteilung). Das Ergebnis kann sich durchaus sehen lassen. Die Anlage ist professionell gebaut und wird als eine der besten Outdoor Anlagen in Deutschland eingeschätzt. Viele Gemeinden aus dem Umland schicken Ihre Vertreter und würden am liebsten selbst eine Anlage nach dem Lohhofer Prinzip bauen. Die Anlage gilt deutschlandweit als Referenz. Als Krönung erhält Rolling Wheels/SVL den Zuschlag für die Deutsche Meisterschaft in BMX. Diese Veranstaltung ist ein sehr großer Erfolg. Hunderte von Teilnehmer aus ganz Deutschland, Österreich, Dänemark und England genießen die perfekten Bedingungen.`,
            achievements: [
                "2. Platz BMX Deutsche Meisterschaft (Lohhof) Andreas Kittel",
                "5. Platz BMX Deutsche Meisterschaft (Lohhof) Thomas Stellwag"
            ]
        },
        {
            year: "1998",
            content: `Die letzte und größte Rampe, die Halfpipe, wird fertig gestellt. Die 10m breite und 3,50m hohe Holzkonstruktion wird mit einer Fahrfläche aus 3mm starken Stahlplatten belegt. Fast alle der vorhandenen anderen Rampen müssen saniert werden. Wie üblich wird wieder alles in Eigenleistung gemacht und der Skatepark Lohhof ist endlich komplett. Arbeitsaufwand sind an die 1200 Arbeitsstunden. Materialkosten, in diesem Fall weit über 10,000 DM für eine Rampe, übernimmt die Abteilung selbst. Neuer Abteilungsleiter ist jetzt Stefan Kusenberg.`
        },
        {
            year: "1999",
            content: `Die Lohhofer „Rampenlandschaft" wird erweitert. Die Mitgliederzahl ist auf 80 gestiegen. Einzelne Rampen werden hergerichtet (300 Arbeitsstunden, Materialkosten übernimmt die Abteilung)`,
            achievements: [
                "8. Platz Skateboard Weltmeisterschaft (Münster) Stephan Lehnert",
                "1. Platz BMX Deutsche Meisterschaft (Coburg) Andreas Kittel",
                "8. Platz BMX Deutsche Meisterschaft (Coburg) Thomas Stellwag"
            ]
        },
        {
            year: "2000",
            content: `Die Anlage wird an die Strom und Wasserversorgung angeschlossen. Die Gemeinde bezuschusst die Erschließung, den Rest trägt die junge Abteilung selbst. Die Rampen müssen komplett saniert werden. (Eigenleistung 1100 Arbeitsstunden, Materialkosten übernimmt die Abteilung). Abteilungsleiter ist Martin Zwetko.`,
            achievements: [
                "9. Platz BMX Weltmeisterschaft (Köln) Thomas Stellwag"
            ]
        },
        {
            year: "2001",
            content: `Erneut erhält Lohhof den Zuschlag für die Deutsche BMX Meisterschaft: „German BMX Open 2001" Vorbereitung, Organisation und Durchführung wird in Eigenleistung gestemmt. Es tummeln sich in Lohhof dieses mal auch BMXer aus USA, England, Ungarn, Holland, Österreich, Tschechien und Dänemark. In Presse und auf Radio wird eifrig über den Event berichtet.`,
            achievements: [
                "1. Platz BMX Deutsche Meisterschaft (Lohhof) Jörg Kerner",
                "2. Platz BMX Deutsche Meisterschaft (Lohhof) Benny Korthaus",
                "6. Platz BMX Deutsche Meisterschaft (Lohhof) Volker Wildner",
                "10. Platz BMX Deutsche Meisterschaft (Lohhof) Thomas Stellwag"
            ]
        },
        {
            year: "2002",
            content: `Die Abteilung ist inzwischen auf über 100 Mitglieder angewachsen. Wieder müssen fast alle Rampen saniert werden. Wie üblich beträgt die Eigenleistung weit über 1000 unentgeltliche Arbeitsstunden, Materialkosten übernimmt die Abteilung. Zur 75 Jahr Feier der SV Lohhofs, stellt Rolling Wheels einen Verkaufsstand mit Sekt, gebrannten Mandeln und anderen Leckereien. Abteilungsleiter ist Stefan Kusenberg.`
        },
        {
            year: "2004",
            content: `Die Abteilung umfasst 140 Mitglieder. Alle Rampen werden wieder einmal in Eigenleistung erneuert. (900 Arbeitsstunden, Materialkosten übernimmt die Abteilung)`
        },
        {
            year: "2005",
            achievements: [
                "2. Platz BMX Weltmeisterschaft (Prag, Tschechien) Raphael Adam",
                "2. Platz BMX Weltmeisterschaft (Prag, Tschechien) Florian Thomas",
                "3. Platz BMX Weltmeisterschaft (Prag, Tschechien) Monika Stellwag",
                "3. Platz BMX Deutsche Meisterschaft (Köln) Raphael Adam"
            ]
        },
        {
            year: "2006",
            content: `Der Skatepark wird einem kompletten Facelifting unterzogen. Mit über 1500 Arbeitsstunden werden in Eigenleistung 90% der Rampen neu gebaut, da für nächstes Jahr wieder ein großer Wettkampf ansteht. Die Materialkosten trägt die Abteilung.`
        },
        {
            year: "2007",
            content: `Playstation veranstaltet in Lohhof „The PSP Champ Series". Die Teilnehmer kommen unter anderem aus ganz Deutschland, Italien, Österreich und Holland. Zeitungen und Radiostationen berichten begeistert über den Event. Außerdem findet Ende Sommer auch ein Snakeboard Wettkampf mit internationaler Beteiligung statt.`
        },
        {
            year: "2008",
            content: `Einzelne Holzrampen werden ausgebessert (400 Arbeitsstunden, Materialkosten übernimmt die Abteilung). Die Abteilung ist 120 Mitglieder stark.`
        },
        {
            year: "2009",
            content: `Der Münchner Brick e.V (Gemeinnütziger Verein zur Integrationsförderung) veranstaltet auf dem Rolling Wheels Gelände BMX- und Skateboard-Workshops. Die Events finden großen Anklang. Viele Rampen werden komplett erneuert. Dafür bringen die Mitglieder an die 700 Arbeitsstunden auf. Die Materialkosten trägt die Abteilung.`
        },
        {
            year: "2010",
            content: `Die bekannte deutsche BMX Firma KHE macht auf Ihrer Deutschlandtour in Lohhof einen Tourstop. Mit dabei sind X-Games Gewinner Daniel Dhers aus Venezuela und USA-Profi James Foster. Es wird auf Weltklasseniveau BMX gefahren und der Tag mit einem gemütlichen Barbeque beendet. Die Abteilung umfasst 101 Mitglieder.`
        },
        {
            year: "2011",
            content: `Lohhof lädt die deutsche BMX Elite zum „Knockout Jam" ein. Zur Sportlerehrung präsentiert Rolling Wheels einen Showauftritt im Bürgerhaus. Bei dieser Gelegenheit betätigt Bürgermeister Zeitler nochmals die Bezuschussung der schon seit Jahren versprochenen Flutlichtanlage (leider bis dato nicht ausgeführt). Der Fernsehsender Pro7 dreht für seine Sendung „Galileo Fake Check" eine Episode im Lohhofer Skatepark. Abteilungsleiter ist Thomas Stellwag. Die Abteilung hat 120 Mitglieder.`
        },
        {
            year: "2012",
            content: `Rolling Wheels veranstaltet die Deutsche Meisterschaft im Inline-Skating. Dazu wird die 170 qm große Minirampe komplett neu aufgebaut (ca. 400 Arbeitsstunden, Materialkosten übernimmt die Abteilung). Für die TV Sendung „SAT 1 / Mein Mann kann" finden Dreharbeiten im Lohhofer Skatepark statt.`
        },
        {
            year: "2013",
            content: `Als Ergänzung zu den X-Games in München, veranstaltet Rolling Wheels ein „Chill and Grill" mit vielen internationalen Actionsport-Athleten. Die Abteilung hat 103 Mitglieder.`
        },
        {
            year: "2014",
            content: `Die Mitgliederzahlen sind trotz großem Engagement rückläufig (75 Mitglieder), da es in München und Umgebung viele alternative Angebote aus Beton gibt. Diese Anlagen sind wartungsarm und kosten keinen Eintritt. Die Fahrer müssen dort weder Mitglied werden, noch Ihre Rampen selbst bauen.`
        },
        {
            year: "2015",
            content: `Weiterhin verliert die Abteilung aus den o.g. genannten Gründen Mitglieder. Es sind nur noch 62 Mitglieder. Dadurch entstehen auch Problem die großen Mengen an freiwilligen und unentgeltlichen Arbeitsstunden aufzubringen. In deutlich kleinerem Kreis (z.T. nur zwei bis drei Freiwillige) wird trotzdem versucht die Anlage bestmöglich in Schuss zu halten. (300 Arbeitsstunden, Materialkosten übernimmt die Abteilung). Es entsteht die erste Abteilungs-Arbeitsgemeinschaft „Rampen aus Beton".`
        },
        {
            year: "2016",
            content: `Im Rahmen der städtischen Aktion „Schöner Ferientag" wird ein Tag der offenen Tür veranstaltet. Es werden kostenlose Schnupperkurse angeboten, und für das leibliche Wohl der Teilnehmer und Zuschauer ist ebenfalls gesorgt. Dieser Event findet sehr großen Anklang. Der Mitgliederschwund lässt sich trotzdem nicht aufhalten (53 Mitglieder). Die Konkurrenz von kostenlosen Skateparks in München und Umgebung ist einfach zu stark. Die Abteilungsleitung arbeitet intensiv an einem neuen Konzept um den bekannten Lohhofer Skatepark wieder aufleben zu lassen. Es werden Rampen aus Beton geplant. Diese wären wartungsarm, und man könnte das Engagement der Mitglieder in Veranstaltungen, Wettkämpfe, Workshops etc. fliesen lassen. Um ein Zeichen zu setzen wird eine erste kleinere Betonrampe mit professioneller Hilfe begonnen. Die Holzrampen werden weiter saniert. Der freiwillige und unentgeltliche Arbeitseinsatz beträgt an die 400 Stunden, die Materialkosten trägt wie immer die Abteilung selbst.`
        },
        {
            year: "2017",
            content: `Nachdem mit sehr wenigen Freiwilligen die meisten Rampen wieder saniert und befahrbar sind, findet im Mai 2017 endlich wieder eine Veranstaltung statt. An die 300 Teilnehmer und Zuschauer genießen das perfekte Wetter und ein gelungenes Event. Die Mitgliederzahl erholt sich deutlich (80 Mitglieder), und die Anlage wird wieder regelmäßig genutzt. Des Weiteren finden auch unserer ersten Kurse (Workshops) für BMX und Skateboard statt. Neben der weiteren Sanierung einzelner Rampen werden auch alle Büsche und Bäume in Eigenleistung zugeschnitten. Außerdem werden gemütliche Sitzecken eingerichtet, und die Planung zum Beton-Umbau werden Voran getrieben. Der freiwillige und unentgeltliche Arbeitseinsatz beträgt an die 700 Stunden, die Materialkosten trägt wie immer die Abteilung selbst.`
        },
        {
            year: "2018",
            content: `DUMMY: Die Betonrampen-Arbeitsgemeinschaft macht bedeutende Fortschritte. Weitere Betonelemente werden in Eigenleistung geplant und umgesetzt. Die Workshopreihe wird fortgeführt und findet großen Zuspruch bei Anfängern und Fortgeschrittenen. Die Mitgliederzahl stabilisiert sich bei 85 Mitgliedern. Insgesamt werden 600 freiwillige Arbeitsstunden geleistet.`
        },
        {
            year: "2019",
            content: `DUMMY: Der Skatepark wird um neue Betonelemente erweitert. Die moderne Kombination aus Holz- und Betonrampen zieht immer mehr Fahrer an. Es finden regelmäßige Community-Events und Jam-Sessions statt. Die Anlage wird zum beliebten Treffpunkt für die lokale Action-Sport Szene. Die Mitgliederzahl wächst auf 92.`
        },
        {
            year: "2020",
            content: `DUMMY: Trotz Corona-Pandemie kann die Anlage unter Einhaltung der Hygienevorschriften geöffnet bleiben. Der Outdoor-Charakter erweist sich als großer Vorteil. Viele neue Mitglieder entdecken BMX und Skateboard als Sport an der frischen Luft. Die Mitgliederzahl steigt auf 105. Kleinere Instandhaltungsarbeiten werden durchgeführt (350 Arbeitsstunden).`
        },
        {
            year: "2021",
            content: `DUMMY: Nach den Lockdowns startet die Abteilung mit neuer Energie durch. Es werden mehrere erfolgreiche Events veranstaltet. Die Jugendarbeit wird intensiviert mit regelmäßigen Anfängerkursen. Die Zusammenarbeit mit lokalen Schulen wird ausgebaut. Die Mitgliederzahl erreicht 118.`
        },
        {
            year: "2022",
            content: `DUMMY: Modernisierung der Infrastruktur: Die Beleuchtungsanlage wird endlich realisiert, was Training auch in den Abendstunden ermöglicht. Neue Sicherheitsmaßnahmen werden implementiert. Die Abteilung feiert ihr 32-jähriges Bestehen mit einem großen Sommerfest. 800 Arbeitsstunden werden in die Anlage investiert.`
        },
        {
            year: "2023",
            content: `DUMMY: Digitalisierung der Vereinsarbeit: Online-Anmeldungen und digitale Kommunikationskanäle werden eingeführt. Social Media Präsenz wird ausgebaut. Es finden mehrere erfolgreiche Workshops und Wettkämpfe statt. Die Abteilung zählt stolze 125 Mitglieder. Weitere Betonelemente werden ergänzt.`
        },
        {
            year: "2024",
            content: `DUMMY: Nachhaltigkeit wird großgeschrieben: Solarpanele werden installiert, Regenwassernutzung wird umgesetzt. Die Anlage wird noch umweltfreundlicher gestaltet. Die Kooperation mit anderen Vereinen wird intensiviert. Regelmäßige Meisterschaften und Community-Events festigen den Ruf als Top-Anlage in Bayern. Mitgliederzahl: 132.`
        },
        {
            year: "2025",
            content: `DUMMY: 35 Jahre Rolling Wheels! Ein Jubiläumsjahr mit zahlreichen Veranstaltungen und Highlights. Die Anlage wird kontinuierlich weiterentwickelt. Neue Generationen von BMX- und Skateboard-Fahrern werden begeistert. Die Abteilung blickt stolz auf über drei Jahrzehnte Erfolgsgeschichte zurück und plant bereits die Zukunft. Aktuelle Mitgliederzahl: 140.`
        }
    ];

    return (
        <div className="main-content">
            <div className="with-sidebar">
                <SideMenu />
                <main className="page-content">
                    <h1 style={{ marginBottom: '2rem' }}>Vereinsgeschichte</h1>
                    <p style={{ lineHeight: '1.8', color: '#4a5568', marginBottom: '3rem' }}>
                        Von der Gründung 1990 bis heute – die Geschichte von Rolling Wheels e.V. ist geprägt von Leidenschaft, 
                        unzähligen Arbeitsstunden in Eigenleistung und großartigen sportlichen Erfolgen.
                    </p>

                    <div className="timeline">
                        {timelineData.map((item, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className="timeline-year">{item.year}</div>
                                </div>
                                <div className="timeline-content">
                                    {item.content && (
                                        <p style={{ lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
                                            {item.content}
                                        </p>
                                    )}
                                    {item.achievements && item.achievements.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <h4 style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                Sportliche Erfolge:
                                            </h4>
                                            <ul style={{ 
                                                marginLeft: '1.5rem', 
                                                lineHeight: '1.6', 
                                                color: '#4a5568',
                                                fontSize: '0.9rem'
                                            }}>
                                                {item.achievements.map((achievement, i) => (
                                                    <li key={i}>{achievement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <style jsx>{`
                        .timeline {
                            position: relative;
                            padding-left: 2rem;
                        }

                        .timeline::before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            width: 3px;
                            background: linear-gradient(to bottom, #dc2626, #ef4444);
                        }

                        .timeline-item {
                            position: relative;
                            margin-bottom: 3rem;
                            padding-left: 2rem;
                        }

                        .timeline-marker {
                            position: absolute;
                            left: -2rem;
                            top: 0;
                            transform: translateX(-50%);
                        }

                        .timeline-year {
                            background: #dc2626;
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            font-weight: bold;
                            font-size: 1.1rem;
                            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
                            white-space: nowrap;
                        }

                        .timeline-content {
                            background: #f9fafb;
                            padding: 1.5rem;
                            border-radius: 8px;
                            border-left: 4px solid #dc2626;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                        }

                        .timeline-content h4 {
                            margin-top: 0;
                        }

                        @media (max-width: 768px) {
                            .timeline {
                                padding-left: 1.5rem;
                            }

                            .timeline-item {
                                padding-left: 1.5rem;
                            }

                            .timeline-marker {
                                left: -1.5rem;
                            }

                            .timeline-year {
                                font-size: 1rem;
                                padding: 0.4rem 0.8rem;
                            }

                            .timeline-content {
                                padding: 1rem;
                            }
                        }
                    `}</style>
                </main>
            </div>
        </div>
    );
}
