import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import HealthBar from "./components/HealthBar.jsx";
import Charts from "./components/Charts.jsx";
import IncidentCards from "./components/IncidentCards.jsx";

export default function App() {
  const [health, setHealth] = useState(false);
  const [flows, setFlows] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let alive = true;
    api.health()
      .then(() => alive && setHealth(true))
      .catch(() => alive && setHealth(false));

    api.flowsLatest()
      .then((r) => alive && setFlows(r?.data ?? []))
      .catch(() => alive && setFlows([]));

    api.flowsHistory(24)
      .then((r) => alive && setHistory(r?.data ?? []))
      .catch(() => alive && setHistory([]));

    return () => { alive = false; };
  }, []);

  return (
    <div className="pi-container">
      <header className="pi-header">
        <h1 className="pi-title">Passenger Insight</h1>
        <div className="pi-health-wrap">
          <HealthBar ok={health} />
        </div>
      </header>

      <section className="pi-section">
        <h2 className="pi-h2">Flöden (senaste 24h)</h2>
        <p className="pi-subtitle">Historik (in per timme)</p>
        <div className="pi-grid">
          <div className="pi-card">
            <Charts data={flows} history={history} />
          </div>
        </div>
      </section>

      <section className="pi-section">
        <h2 className="pi-h2">Systemhälsa &amp; Incidenter</h2>
        <IncidentCards />
      </section>

      <footer className="pi-footer">
  <h2 className="pi-h2">Projektreflektion</h2>

  <p className="pi-summary">
  Detta projekt, <strong>Passenger Insight</strong>, utvecklades som ett
  simulerat passageraranalyssystem med fokus på realtidsdata,
  datakvalitet och systemhälsa. Backend-delen byggdes i
  <strong>Node.js/Express</strong> med simulerad data i stället för en
  aktiv databas, och frontend utvecklades i <strong>React</strong> med
  dynamiska visualiseringar via <strong>Chart.js</strong>. Systemet
  illustrerar hur passagerarflöden kan analyseras och statusnivåer
  klassificeras i realtid (OK, Varning, Kritisk).
</p>

<p className="pi-summary">
  Projektet demonstrerar ett helhetstänk kring systemövervakning,
  incidenthantering och teknisk analys, kompetenser som är centrala i
  rollen som <strong>Teknisk produktspecialist till Passageraranalyssystem</strong>
  hos Polismyndigheten. Jag har, genom detta projekt, arbetat med att
  designa API:er, simulera driftsscenarier och skapa användarvänliga
  visualiseringar som kombinerar teknisk precision med förståelse för
  verksamhetsnytta.
</p>

<p className="pi-summary">
  Arbetet visar hur tekniska system kan användas för att övervaka flöden,
  identifiera avvikelser och förebygga incidenter. Fokus har legat på
  struktur, skalbarhet och tydlig datakommunikation, vilket speglar hur
  Polismyndighetens IT-avdelning arbetar med livscykelhantering,
  driftsättning och systemförbättringar.
</p>

<p className="pi-summary">
  Jag ser en stark koppling mellan detta projekt och rollen som
  produktspecialist, särskilt i förmågan att samordna teknik,
  verksamhet och användarupplevelse. Det är denna kombination av
  teknisk kompetens, struktur och kommunikationsförmåga som jag vill
  bidra med i rollen som
  <strong>Teknisk produktspecialist inom Passageraranalyssystem</strong>.
</p>

</footer>

    </div>
  );
}
