/* ==========================================================================
   Denkhorizonte – Entscheidungsreflektor
   Frontend logic. Alle API-Calls gehen über /.netlify/functions/claude –
   der Anthropic-Key liegt ausschließlich als Env-Var in Netlify, nie im Browser.
   ========================================================================== */

/* ----- 1. Static data -------------------------------------------------- */

const RINGS = [
  { id: 'rot',    label: 'Rot',    ro: 114, ri: 30,  col: '#C0392B' },
  { id: 'blau',   label: 'Blau',   ro: 170, ri: 114, col: '#2E6DA4' },
  { id: 'orange', label: 'Orange', ro: 228, ri: 170, col: '#D4861A' },
  { id: 'gruen',  label: 'Grün',   ro: 288, ri: 228, col: '#4A8C5C' },
  { id: 'gelb',   label: 'Gelb',   ro: 348, ri: 288, col: '#B8960C' },
];

const QS = {
  ii: { label: 'Innen / Ich', col: '#9A7A10', a1: 270, a2: 360 },
  ai: { label: 'Außen / Ich', col: '#1A4A8A', a1: 0,   a2: 90  },
  wi: { label: 'Innen / Wir', col: '#2A6A3A', a1: 180, a2: 270 },
  wa: { label: 'Außen / Wir', col: '#8A4A1A', a1: 90,  a2: 180 },
};

const FIELDS = [
  { id: 'vertrauen',   label: 'Vertrauen',            q: 'ii', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'in freien Willen', gruen: 'in Gemeinschaft / gemeinsame Werte', orange: 'in Fähigkeiten im Wettbewerb', blau: 'in Regeln und bestehende Ordnung', rot: 'in Stärke des Anführers' } },
  { id: 'angst',       label: 'Angst',                q: 'ii', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'vor Einschränkung', gruen: 'vor Ablehnung', orange: 'vor Versagen', blau: 'vor Positionsverlust', rot: 'vor Kontrollverlust / Schwäche' } },
  { id: 'haltung',     label: 'Haltung im Kontakt',   q: 'ii', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'individuell / Trennung Person & Rolle', gruen: 'empathisch', orange: 'strategisch-nutzenorientiert', blau: 'vorsichtig / Rang ist wichtig', rot: 'dominant / direkt' } },
  { id: 'motivation',  label: 'Intrins. Motivation',  q: 'ii', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Berufung & Selbstausdruck', gruen: 'Menschen inspirieren & würdigen', orange: 'unternehmerisches Denken & Handeln', blau: 'materiell / Sicherheit schaffen', rot: 'Stärke beweisen / sich durchsetzen' } },
  { id: 'selbstwahr',  label: 'Selbstwahrnehmung',    q: 'ii', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Metaperspektive / kann sich beim Denken zuschauen', gruen: 'Gedanken & Gefühle bewusst', orange: 'Gedanken bewusst, Gefühle unbewusst', blau: 'Gedanken & Gefühle unbewusst', rot: 'Kaum Selbstreflexion / Impuls = Wahrheit' } },
  { id: 'fuehrung',    label: 'Führungsverhalten',    q: 'ai', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Selbstmanagement / situative Beteiligung', gruen: 'begeistert & bindet alle ein', orange: 'motiviert durch Ziele & Rechenschaftspflicht', blau: 'strikte Anweisungen', rot: 'befiehlt / dominiert' } },
  { id: 'entscheid',   label: 'Entscheidungsfindung', q: 'ai', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'systemisch / kontextsensitiv / situativ', gruen: 'wertebasiert / konsensorientiert', orange: 'Ziele & Strategie', blau: 'Führungskraft intransparent / regelgebunden', rot: 'Bauchentscheidung / Machtdemonstration' } },
  { id: 'personal',    label: 'Personalentwicklung',  q: 'ai', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Networking / Coaching / Open Space', gruen: 'Coaching', orange: 'Training & Unterweisung', blau: 'Schulung', rot: 'Sink or swim' } },
  { id: 'konflikt',    label: 'Umgang mit Konflikten',q: 'ai', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Konflikt als Potenzial', gruen: 'Lösung für Bedürfnisse aller', orange: 'um effektivste Lösung ringen', blau: 'Regelkonformität', rot: 'Eskalation / Einschüchterung' } },
  { id: 'meetings',    label: 'Meetings',             q: 'ai', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Kontext- & kompetenzorientiert', gruen: 'auf Meinungsvielfalt & Bedürfnisse achten', orange: 'Ergebnisorientierung durch Moderation', blau: 'Ordnung halten / Protokoll', rot: 'Chef spricht, Rest hört zu' } },
  { id: 'loyalitaet',  label: 'Loyalität',            q: 'wi', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'zum gemeinsamen Interesse & Ideen', gruen: 'zu gemeinsamen Werten', orange: 'zur gesamten Organisation', blau: 'gegenüber dem Chef', rot: 'zur Clique / zum Stärksten' } },
  { id: 'atmosphaere', label: 'Arbeitsatmosphäre',    q: 'wi', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'offen & kreativ', gruen: 'freundschaftlich & gemeinschaftsorientiert', orange: 'pragmatisch & ergebnisgetrieben', blau: 'routiniertes Nebeneinander', rot: 'Revierkämpfe / Rangordnung' } },
  { id: 'vision',      label: 'Vision / Werte',       q: 'wi', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'authentischer / situativer eigener Purpose', gruen: 'vermeintlich gemeinsamer Purpose / gesellschaftlich validiert', orange: 'Instrumente zur Entscheidungsfindung', blau: 'z.T. plakativ / Dogmen von oben', rot: 'Macht ist die Wahrheit' } },
  { id: 'arbeitseinst',label: 'Arbeitseinstellung',   q: 'wi', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'interessenorientiert aus der Fülle / kein Mangel', gruen: 'Vision / idealistisch / Kultur vor Strategie', orange: 'Ziel / alles ist möglich', blau: 'Vorgabe / Skepsis / Gehorsam', rot: 'Durchsetzen oder verlieren' } },
  { id: 'stakeholder', label: 'Stakeholder-Beziehung',q: 'wi', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'co-kreativ', gruen: 'partnerschaftlich', orange: 'zweckorientiert / strategisch', blau: 'hierarchisch', rot: 'ausnutzen solange möglich' } },
  { id: 'produkte',    label: 'Produkte / DL',        q: 'wa', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'disruptive Innovation', gruen: 'sinnhafte / nachhaltige Produkte', orange: 'Trendprodukte / Innovation', blau: 'etablierte Produkte', rot: 'kopieren was funktioniert' } },
  { id: 'entlohnung',  label: 'Entlohnungssystem',    q: 'wa', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'möglichkeitsorientiert', gruen: 'beteiligungsorientiert', orange: 'leistungsorientiert', blau: 'tarifgebunden / fix', rot: 'wer sich durchsetzt bekommt mehr' } },
  { id: 'ressourcen',  label: 'Ressourcen-Effizienz', q: 'wa', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'flexible Systeme', gruen: 'nachhaltige Wertschöpfungskette', orange: 'Kosteneffizienz / Qualität', blau: 'Gesetze / Normen', rot: 'Ressourcen für Machterhalt' } },
  { id: 'infofluss',   label: 'Infofluss / Komm.',    q: 'wa', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'freies Networking / kollegiale Beratung', gruen: 'Kommunikationsplattform / Transparenz', orange: 'Meeting / strategische Informationen', blau: 'Arbeitsgruppen', rot: 'Information als Machtmittel' } },
  { id: 'organigramm', label: 'Organigramm',          q: 'wa', rings: ['rot','blau','orange','gruen','gelb'],
    tips: { gelb: 'Selbstorganisation / agil', gruen: 'Matrix', orange: 'dynamische / flache Hierarchie', blau: 'feste Hierarchie', rot: 'wer oben ist entscheidet alles' } },
];


/* ----- 2. SVG geometry ------------------------------------------------- */

const CX = 400, CY = 400;

function pol(deg, r) {
  const a = (deg - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function arc(ro, ri, a1, a2) {
  const p1 = pol(a1, ro), p2 = pol(a2, ro);
  const p3 = pol(a2, ri), p4 = pol(a1, ri);
  const lg = (a2 - a1) > 180 ? 1 : 0;
  return `M${p1.x},${p1.y}A${ro},${ro} 0 ${lg} 1 ${p2.x},${p2.y}L${p3.x},${p3.y}A${ri},${ri} 0 ${lg} 0 ${p4.x},${p4.y}Z`;
}


/* ----- 3. Build map ---------------------------------------------------- */

function build() {
  const byQ = {};
  FIELDS.forEach(f => { if (!byQ[f.q]) byQ[f.q] = []; byQ[f.q].push(f); });

  const sg = document.getElementById('segs');
  const cd = document.getElementById('cards');
  const rn = document.getElementById('rnames');

  FIELDS.forEach(f => {
    const q = QS[f.q];
    const n = byQ[f.q].length;
    const idx = byQ[f.q].indexOf(f);
    const span = (q.a2 - q.a1) / n;
    const a1 = q.a1 + idx * span, a2 = a1 + span;
    f._mid = (a1 + a2) / 2;

    // Ring segments for this field
    f.rings.forEach(rid => {
      const ring = RINGS.find(r => r.id === rid);
      if (!ring) return;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', arc(ring.ro, ring.ri, a1, a2));
      p.setAttribute('class', 'segment');
      p.setAttribute('data-field', f.id);
      p.setAttribute('data-ring', rid);
      const t = f.tips[rid] || f.label;
      p.addEventListener('mouseenter', e => showTip(e, `${f.label} · ${ring.label}`, t));
      p.addEventListener('mousemove', mvTip);
      p.addEventListener('mouseleave', hideTip);
      sg.appendChild(p);
    });

    // Outer label card (Vollständig ausgeschrieben & dynamische Breite)
    const pos = pol(f._mid, 372);
    const lbl = f.label; 
    const W = Math.max(80, lbl.length * 6 + 12); // Dynamische Box-Breite
    const H = 24;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'outer-label');
    g.setAttribute('data-field', f.id);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', pos.x - W / 2);
    rect.setAttribute('y', pos.y - H / 2);
    rect.setAttribute('width', W);
    rect.setAttribute('height', H);
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', q.col);
    rect.setAttribute('fill-opacity', '0.14');
    rect.setAttribute('stroke', q.col);
    rect.setAttribute('stroke-width', '1');
    rect.setAttribute('stroke-opacity', '0.55');

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', pos.x);
    txt.setAttribute('y', pos.y + 4);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', "'Source Sans 3',sans-serif");
    txt.setAttribute('font-size', '9');
    txt.setAttribute('fill', '#333');
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = lbl;

    g.appendChild(rect);
    g.appendChild(txt);
    g.addEventListener('mouseenter', e => showTip(e, f.label, 'Hover auf Ringsegmente für Details je Werteebene'));
    g.addEventListener('mousemove', mvTip);
    g.addEventListener('mouseleave', hideTip);
    cd.appendChild(g);
  });

  // Ring name labels (centered on vertical axis)
  RINGS.forEach(ring => {
    const mid = (ring.ro + ring.ri) / 2;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', CX);
    t.setAttribute('y', CY - mid + 4);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', "'Source Sans 3',sans-serif");
    t.setAttribute('font-size', '9');
    t.setAttribute('fill', 'white');
    t.setAttribute('font-weight', '600');
    t.setAttribute('opacity', '0.9');
    t.setAttribute('pointer-events', 'none');
    t.textContent = ring.label;
    rn.appendChild(t);
  });
}


/* ----- 4. Tooltip ------------------------------------------------------ */

const tipEl = document.getElementById('tip');

function showTip(e, title, desc) {
  tipEl.innerHTML = `<strong>${title}</strong>${desc}`;
  tipEl.classList.add('show');
  mvTip(e);
}

function mvTip(e) {
  const r = document.getElementById('mc').getBoundingClientRect();
  let x = e.clientX - r.left + 12;
  let y = e.clientY - r.top - 8;
  if (x + 225 > r.width) x = e.clientX - r.left - 230;
  tipEl.style.left = x + 'px';
  tipEl.style.top  = y + 'px';
}

function hideTip() { tipEl.classList.remove('show'); }


/* ----- 5. Highlight / reset ------------------------------------------- */

function highlight(ids) {
  document.querySelectorAll('.segment').forEach(el => {
    const on = ids.includes(el.dataset.field);
    el.classList.toggle('dimmed', !on);
    el.classList.toggle('highlighted', on);
  });
  document.querySelectorAll('.outer-label').forEach(el => {
    const on = ids.includes(el.dataset.field);
    el.classList.toggle('dimmed', !on);
    el.classList.toggle('highlighted', on);
  });
}

function resetAll() {
  document.querySelectorAll('.segment, .outer-label').forEach(el =>
    el.classList.remove('dimmed', 'highlighted', 'pulse')
  );
}

function pulseField(id) {
  document.getElementById('mc').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const segs = document.querySelectorAll(`.segment[data-field="${id}"]`);
  segs.forEach(el => {
    el.classList.remove('pulse');
    void el.offsetWidth; // force reflow so animation restarts
    el.classList.add('pulse');
    el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
  });
}


/* ----- 6. API helper (via Netlify function) --------------------------- */

async function callAPI(system, userMsg) {
  const r = await fetch('/.netlify/functions/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, userMsg }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.content?.[0]?.text || '';
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (e) {
    const match = raw.match(/\{[\s\S]*/);
    if (!match) throw new Error('Keine JSON-Antwort erhalten');
    let p = match[0];
    const opens = [...p].reduce((acc, c) => {
      if (c === '{') acc.push('}');
      else if (c === '[') acc.push(']');
      else if (c === '}' || c === ']') acc.pop();
      return acc;
    }, []);
    p = p.replace(/,\s*$/, '') + opens.reverse().join('');
    return JSON.parse(p);
  }
}


/* ----- 7. Step 1: Fragen generieren ----------------------------------- */

let decisionText = '';

async function getQuestions() {
  const input = document.getElementById('inp').value.trim();
  if (!input) return;
  decisionText = input;

  const btn  = document.getElementById('btn1');
  const load = document.getElementById('load1');
  btn.disabled = true;
  load.classList.add('active');

  const sys = `Du bist ein integraler Organisationsberater. Ein Geschäftsführer beschreibt eine Entscheidungssituation.
Stelle genau diese 3 Diagnosefragen – passe sie sprachlich an die konkrete Situation an, behalte aber Zweck und Reihenfolge bei:
1. Was ist der Hauptgrund für diese Entscheidung? (Zweck: Werteebene des Users erkennen)
2. Was erhoffen Sie sich als konkretes Ergebnis? (Zweck: Ziel-Werteebene erkennen)
3. Gibt es Bedenken – bei Ihnen oder im Team? (Zweck: Widerstände und aktivierte Felder erkennen)

Antworte NUR mit validem JSON, kein Markdown:
{"q1":"Fragetext 1","q2":"Fragetext 2","q3":"Fragetext 3"}`;

  try {
    const raw = await callAPI(sys, input);
    const result = parseJSON(raw);
    showStep2(result);
  } catch (err) {
    document.getElementById('res').innerHTML =
      `<p style="color:#c0392b;font-size:.85rem;padding:8px 0">Fehler: ${err.message}</p>`;
  } finally {
    btn.disabled = false;
    load.classList.remove('active');
  }
}

function showStep2(questions) {
  document.getElementById('step1').setAttribute('hidden', '');
  document.getElementById('step2').removeAttribute('hidden');
  document.getElementById('dec-summary').textContent = decisionText;

  const container = document.getElementById('q-container');
  container.innerHTML = '';
  ['q1', 'q2', 'q3'].forEach((k, i) => {
    const div = document.createElement('div');
    div.className = 'q-block';
    div.innerHTML = `
      <div class="q-label">${questions[k]}</div>
      <textarea class="q-input" id="ans${i + 1}" placeholder="Ihre Antwort..."></textarea>`;
    container.appendChild(div);
  });
}

function resetFlow() {
  document.getElementById('step2').setAttribute('hidden', '');
  document.getElementById('step1').removeAttribute('hidden');
  document.getElementById('res').innerHTML =
    `<p class="result-empty">Beschreiben Sie Ihre Entscheidungssituation – die KI stellt Ihnen drei Diagnosefragen, bevor die Landkarte analysiert wird.</p>`;
  resetAll();
}


/* ----- 8. Step 2: Analyse --------------------------------------------- */

async function analyse() {
  const a1 = document.getElementById('ans1')?.value.trim() || '';
  const a2 = document.getElementById('ans2')?.value.trim() || '';
  const a3 = document.getElementById('ans3')?.value.trim() || '';

  const btn  = document.getElementById('btn2');
  const load = document.getElementById('load2');
  btn.disabled = true;
  load.classList.add('active');
  document.getElementById('res').innerHTML = '';

  const q1 = document.querySelector('#q-container .q-block:nth-child(1) .q-label')?.textContent || 'Hauptgrund';
  const q2 = document.querySelector('#q-container .q-block:nth-child(2) .q-label')?.textContent || 'Erhofftes Ergebnis';
  const q3 = document.querySelector('#q-container .q-block:nth-child(3) .q-label')?.textContent || 'Bedenken';

  const userContext = `Entscheidung: ${decisionText}
${q1}: ${a1 || '(keine Antwort)'}
${q2}: ${a2 || '(keine Antwort)'}
${q3}: ${a3 || '(keine Antwort)'}`;

  const fieldList = FIELDS.map(f =>
    `id="${f.id}" label="${f.label}" quadrant="${QS[f.q].label}" levels:${f.rings.map(r => `${r}=${f.tips[r]}`).join(' / ')}`
  ).join('\n');

  const sys = `Du bist ein erfahrener integraler Organisationsberater (Spiral Dynamics, Wilber 4-Quadranten). Du arbeitest mit GF und Führungskräften im Mittelstand.

20 Themenfelder der Landkarte:
${fieldList}

Quadranten: ii=Innen/Ich, ai=Außen/Ich, wi=Innen/Wir, wa=Außen/Wir
Ringe (außen→innen): gelb=integral, grün=Gemeinschaft, orange=Leistung, blau=Ordnung, rot=Macht

Wichtige Hinweise zur Analyse:
- Die dominante Werteebene ergibt sich aus den Antworten des Users – nicht aus dem Entscheidungsthema allein
- Wenn die Antworten auf mehrere Ebenen hindeuten, benenne das Spannungsfeld statt eine Ebene autoritär zu setzen
- Formuliere Chancen, Risiken und blinde Flecken konkret und situationsbezogen – keine generischen Aussagen
- Sprache: direkt, respektvoll, auf Augenhöhe mit einem erfahrenen GF

Antworte NUR mit validem JSON, kein Markdown:
{"activated_fields":["id",...],"primary_fields":["id",...],"dominant_level":"rot|blau|orange|gruen|gelb","dominant_level_begruendung":"2 Sätze basierend auf den Antworten","spannungsfeld":"Welche Ebenen sind im Spiel und warum (1-2 Sätze)","chancen":["...","...","..."],"risiken":["...","...","..."],"blinde_flecken":["...","..."],"reflexionsfragen":["...?","...?","...?"],"quadrant_fokus":{"ii":"...","ai":"...","wi":"...","wa":"..."}}

activated_fields: 4-12 Felder. primary_fields: 2-4 kritischste.`;

  try {
    const raw = await callAPI(sys, userContext);
    const result = parseJSON(raw);
    highlight(result.activated_fields || []);
    render(result);
  } catch (err) {
    document.getElementById('res').innerHTML =
      `<p style="color:#c0392b;font-size:.85rem;padding:8px 0">Fehler: ${err.message}</p>`;
    resetAll();
  } finally {
    btn.disabled = false;
    load.classList.remove('active');
  }
}


/* ----- 9. Render results ---------------------------------------------- */

function render(r) {
  const qL = { ii: 'Innen / Ich', ai: 'Außen / Ich', wi: 'Innen / Wir', wa: 'Außen / Wir' };
  const qC = { ii: '#9A7A10',    ai: '#1A4A8A',    wi: '#2A6A3A',    wa: '#8A4A1A' };
  const lvC = { rot: '#C0392B', blau: '#2E6DA4', orange: '#D4861A', gruen: '#4A8C5C', gelb: '#B8960C' };
  const lvL = { rot: 'Rot – Macht', blau: 'Blau – Ordnung', orange: 'Orange – Leistung', gruen: 'Grün – Gemeinschaft', gelb: 'Gelb – Integral' };

  const tags = (r.activated_fields || []).map(id => {
    const f = FIELDS.find(x => x.id === id);
    if (!f) return '';
    const pri = (r.primary_fields || []).includes(id);
    return `<span class="field-tag ${f.q}" style="${pri ? 'font-weight:700;border-width:2px' : ''}" onclick="pulseField('${id}')" title="Auf Karte zeigen ↑">${f.label}</span>`;
  }).join('');

  const li = a => (a || []).map(x => `<li>${x}</li>`).join('');
  const qf = r.quadrant_fokus || {};
  const dc = lvC[r.dominant_level] || '#888';
  const dl = lvL[r.dominant_level] || r.dominant_level;

  document.getElementById('res').innerHTML = `
    <div class="result-section">
      <h3>Aktivierte Felder <span style="font-family:'Source Sans 3',sans-serif;font-weight:300;font-size:.72rem;color:#bbb">→ Klick zeigt Position</span></h3>
      <div class="field-tags">${tags}</div>
    </div>
    <div class="result-section">
      <h3>Werteebene & Spannungsfeld</h3>
      <div class="insight-block">
        <div class="insight-label" style="color:${dc}">${dl}</div>
        <div class="insight-text">${r.dominant_level_begruendung || ''}</div>
      </div>
      ${r.spannungsfeld ? `
        <div class="insight-block">
          <div class="insight-label" style="color:#888">Spannungsfeld</div>
          <div class="insight-text">${r.spannungsfeld}</div>
        </div>` : ''}
    </div>
    <div class="result-section">
      <h3>Chancen · Risiken · Blinde Flecken</h3>
      <div class="insight-block">
        <div class="insight-label chance">Chancen</div>
        <div class="insight-text"><ul>${li(r.chancen)}</ul></div>
      </div>
      <div class="insight-block">
        <div class="insight-label risiko">Risiken</div>
        <div class="insight-text"><ul>${li(r.risiken)}</ul></div>
      </div>
      <div class="insight-block">
        <div class="insight-label blind">Blinde Flecken</div>
        <div class="insight-text"><ul>${li(r.blinde_flecken)}</ul></div>
      </div>
    </div>
    <div class="result-section">
      <h3>Quadranten-Fokus</h3>
      ${Object.entries(qf).map(([q, t]) => `
        <div class="insight-block">
          <div class="insight-label" style="color:${qC[q] || '#888'}">${qL[q] || q}</div>
          <div class="insight-text">${t}</div>
        </div>`).join('')}
    </div>
    <div class="result-section">
      <h3>Reflexionsfragen</h3>
      <div class="insight-text"><ul>${li(r.reflexionsfragen)}</ul></div>
    </div>
    <button class="reset-btn" onclick="resetFlow();resetAll();">Neue Analyse starten</button>
  `;
}


/* ----- 10. Boot -------------------------------------------------------- */

build();


/* ----- 11. Miro-Board Feature (Pan & Zoom) ---------------------------- */

const svgEl = document.getElementById('svg');
let viewBox = { x: 0, y: 0, w: 800, h: 800 };
let isDragging = false;
let startPos = { x: 0, y: 0 };

svgEl.style.cursor = 'grab';

// Zoom per Mausrad / Trackpad
svgEl.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
  const newW = viewBox.w * zoomFactor;
  const newH = viewBox.h * zoomFactor;

  // Rechnet den Zoom so um, dass er dort passiert, wo die Maus ist
  const rect = svgEl.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const rx = mouseX / rect.width;
  const ry = mouseY / rect.height;

  viewBox.x += (viewBox.w - newW) * rx;
  viewBox.y += (viewBox.h - newH) * ry;
  viewBox.w = newW;
  viewBox.h = newH;

  svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}, { passive: false });

// Verschieben (Pan) per Drag & Drop
svgEl.addEventListener('mousedown', (e) => {
  isDragging = true;
  startPos = { x: e.clientX, y: e.clientY };
  svgEl.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  // Berechne die Distanz der Mausbewegung relativ zur aktuellen Skalierung
  const dx = (startPos.x - e.clientX) * (viewBox.w / svgEl.clientWidth);
  const dy = (startPos.y - e.clientY) * (viewBox.h / svgEl.clientHeight);
  
  viewBox.x += dx;
  viewBox.y += dy;
  startPos = { x: e.clientX, y: e.clientY };
  
  svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  svgEl.style.cursor = 'grab';
});

window.addEventListener('mouseleave', () => {
  isDragging = false;
  svgEl.style.cursor = 'grab';
});

// Mobile / Touch-Support zum Wischen (Pan)
svgEl.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  
  const dx = (startPos.x - e.touches[0].clientX) * (viewBox.w / svgEl.clientWidth);
  const dy = (startPos.y - e.touches[0].clientY) * (viewBox.h / svgEl.clientHeight);
  
  viewBox.x += dx;
  viewBox.y += dy;
  startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  
  svgEl.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}, { passive: true });

window.addEventListener('touchend', () => {
  isDragging = false;
});