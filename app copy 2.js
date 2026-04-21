/* ==========================================================================
   Denkhorizonte V2 – app.js
   Alle API-Calls gehen über /.netlify/functions/claude.
   V2: radiale Feldlabels, persistenter Inspector, Click-to-Pin, Ring- &
   Quadranten-Filter, gestaffelte Reveal-Animation, Grid-Analyse-Layout.
   ========================================================================== */

const NS = 'http://www.w3.org/2000/svg';


/* ----- 1. Static data -------------------------------------------------- */

const RINGS = [
  { id: 'rot', label: 'Rot', keyword: 'Macht', ro: 115, ri: 42, col: '#C0392B' },
  { id: 'blau', label: 'Blau', keyword: 'Ordnung', ro: 180, ri: 115, col: '#2E6DA4' },
  { id: 'orange', label: 'Orange', keyword: 'Leistung', ro: 245, ri: 180, col: '#D4861A' },
  { id: 'gruen', label: 'Grün', keyword: 'Gemeinschaft', ro: 308, ri: 245, col: '#4A8C5C' },
  { id: 'gelb', label: 'Gelb', keyword: 'Integral', ro: 368, ri: 308, col: '#B8960C' },
];

const QS = {
  ii: { label: 'Innen · Ich', short: 'ii', col: '#9A7A10', a1: 270, a2: 360 },
  ai: { label: 'Außen · Ich', short: 'ai', col: '#1A4A8A', a1: 0, a2: 90 },
  wi: { label: 'Innen · Wir', short: 'wi', col: '#2A6A3A', a1: 180, a2: 270 },
  wa: { label: 'Außen · Wir', short: 'wa', col: '#8A4A1A', a1: 90, a2: 180 },
};

const FIELDS = [
  {
    id: 'vertrauen', label: 'Vertrauen', q: 'ii',
    tips: { gelb: 'in freien Willen', gruen: 'in Gemeinschaft / gemeinsame Werte', orange: 'in Fähigkeiten im Wettbewerb', blau: 'in Regeln und bestehende Ordnung', rot: 'in Stärke des Anführers' }
  },
  {
    id: 'angst', label: 'Angst', q: 'ii',
    tips: { gelb: 'vor Einschränkung', gruen: 'vor Ablehnung', orange: 'vor Versagen', blau: 'vor Positionsverlust', rot: 'vor Kontrollverlust / Schwäche' }
  },
  {
    id: 'haltung', label: 'Haltung im Kontakt', q: 'ii',
    tips: { gelb: 'individuell / Trennung Person & Rolle', gruen: 'empathisch', orange: 'strategisch-nutzenorientiert', blau: 'vorsichtig / Rang ist wichtig', rot: 'dominant / direkt' }
  },
  {
    id: 'motivation', label: 'Intrins. Motivation', q: 'ii',
    tips: { gelb: 'Berufung & Selbstausdruck', gruen: 'Menschen inspirieren & würdigen', orange: 'unternehmerisches Denken & Handeln', blau: 'materiell / Sicherheit schaffen', rot: 'Stärke beweisen / sich durchsetzen' }
  },
  {
    id: 'selbstwahr', label: 'Selbstwahrnehmung', q: 'ii',
    tips: { gelb: 'Metaperspektive / kann sich beim Denken zuschauen', gruen: 'Gedanken & Gefühle bewusst', orange: 'Gedanken bewusst, Gefühle unbewusst', blau: 'Gedanken & Gefühle unbewusst', rot: 'kaum Selbstreflexion / Impuls = Wahrheit' }
  },

  {
    id: 'fuehrung', label: 'Führungsverhalten', q: 'ai',
    tips: { gelb: 'Selbstmanagement / situative Beteiligung', gruen: 'begeistert & bindet alle ein', orange: 'motiviert durch Ziele & Rechenschaftspflicht', blau: 'strikte Anweisungen', rot: 'befiehlt / dominiert' }
  },
  {
    id: 'entscheid', label: 'Entscheidungsfindung', q: 'ai',
    tips: { gelb: 'systemisch / kontextsensitiv / situativ', gruen: 'wertebasiert / konsensorientiert', orange: 'Ziele & Strategie', blau: 'Führungskraft intransparent / regelgebunden', rot: 'Bauchentscheidung / Machtdemonstration' }
  },
  {
    id: 'personal', label: 'Personalentwicklung', q: 'ai',
    tips: { gelb: 'Networking / Coaching / Open Space', gruen: 'Coaching', orange: 'Training & Unterweisung', blau: 'Schulung', rot: 'Sink or swim' }
  },
  {
    id: 'konflikt', label: 'Umgang m. Konflikten', q: 'ai',
    tips: { gelb: 'Konflikt als Potenzial', gruen: 'Lösung für Bedürfnisse aller', orange: 'um effektivste Lösung ringen', blau: 'Regelkonformität', rot: 'Eskalation / Einschüchterung' }
  },
  {
    id: 'meetings', label: 'Meetings', q: 'ai',
    tips: { gelb: 'Kontext- & kompetenzorientiert', gruen: 'auf Meinungsvielfalt & Bedürfnisse achten', orange: 'Ergebnisorientierung durch Moderation', blau: 'Ordnung halten / Protokoll', rot: 'Chef spricht, Rest hört zu' }
  },

  {
    id: 'produkte', label: 'Produkte / DL', q: 'wa',
    tips: { gelb: 'disruptive Innovation', gruen: 'sinnhafte / nachhaltige Produkte', orange: 'Trendprodukte / Innovation', blau: 'etablierte Produkte', rot: 'kopieren was funktioniert' }
  },
  {
    id: 'entlohnung', label: 'Entlohnungssystem', q: 'wa',
    tips: { gelb: 'möglichkeitsorientiert', gruen: 'beteiligungsorientiert', orange: 'leistungsorientiert', blau: 'tarifgebunden / fix', rot: 'wer sich durchsetzt bekommt mehr' }
  },
  {
    id: 'ressourcen', label: 'Ressourcen-Effizienz', q: 'wa',
    tips: { gelb: 'flexible Systeme', gruen: 'nachhaltige Wertschöpfungskette', orange: 'Kosteneffizienz / Qualität', blau: 'Gesetze / Normen', rot: 'Ressourcen für Machterhalt' }
  },
  {
    id: 'infofluss', label: 'Infofluss / Komm.', q: 'wa',
    tips: { gelb: 'freies Networking / kollegiale Beratung', gruen: 'Kommunikationsplattform / Transparenz', orange: 'Meeting / strategische Informationen', blau: 'Arbeitsgruppen', rot: 'Information als Machtmittel' }
  },
  {
    id: 'organigramm', label: 'Organigramm', q: 'wa',
    tips: { gelb: 'Selbstorganisation / agil', gruen: 'Matrix', orange: 'dynamische / flache Hierarchie', blau: 'feste Hierarchie', rot: 'wer oben ist entscheidet alles' }
  },

  {
    id: 'loyalitaet', label: 'Loyalität', q: 'wi',
    tips: { gelb: 'zum gemeinsamen Interesse & Ideen', gruen: 'zu gemeinsamen Werten', orange: 'zur gesamten Organisation', blau: 'gegenüber dem Chef', rot: 'zur Clique / zum Stärksten' }
  },
  {
    id: 'atmosphaere', label: 'Arbeitsatmosphäre', q: 'wi',
    tips: { gelb: 'offen & kreativ', gruen: 'freundschaftlich & gemeinschaftsorientiert', orange: 'pragmatisch & ergebnisgetrieben', blau: 'routiniertes Nebeneinander', rot: 'Revierkämpfe / Rangordnung' }
  },
  {
    id: 'vision', label: 'Vision / Werte', q: 'wi',
    tips: { gelb: 'authentischer / situativer eigener Purpose', gruen: 'vermeintlich gemeinsamer Purpose / gesellschaftlich validiert', orange: 'Instrumente zur Entscheidungsfindung', blau: 'z.T. plakativ / Dogmen von oben', rot: 'Macht ist die Wahrheit' }
  },
  {
    id: 'arbeitseinst', label: 'Arbeitseinstellung', q: 'wi',
    tips: { gelb: 'interessenorientiert aus der Fülle / kein Mangel', gruen: 'Vision / idealistisch / Kultur vor Strategie', orange: 'Ziel / alles ist möglich', blau: 'Vorgabe / Skepsis / Gehorsam', rot: 'Durchsetzen oder verlieren' }
  },
  {
    id: 'stakeholder', label: 'Stakeholder-Bezieh.', q: 'wi',
    tips: { gelb: 'co-kreativ', gruen: 'partnerschaftlich', orange: 'zweckorientiert / strategisch', blau: 'hierarchisch', rot: 'ausnutzen solange möglich' }
  },
];

const RING_IDS = ['rot', 'blau', 'orange', 'gruen', 'gelb'];


/* ----- 2. Geometry ----------------------------------------------------- */

const CX = 450, CY = 450;

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

function arcPath(r, a1, a2, sweep = 1) {
  const p1 = pol(a1, r), p2 = pol(a2, r);
  const lg = (a2 - a1) > 180 ? 1 : 0;
  return `M${p1.x},${p1.y}A${r},${r} 0 ${lg} ${sweep} ${p2.x},${p2.y}`;
}


/* ----- 3. Build map ---------------------------------------------------- */

const fieldState = {}; // id -> element refs
let pinnedFieldId = null;
let inspectorFieldId = null;
let ringFilter = null;   // 'rot' | 'blau' | ... | null
let quadFilter = null;   // 'ii' | 'ai' | 'wi' | 'wa' | null
let lastAnalysis = null;

function build() {
  const byQ = { ii: [], ai: [], wi: [], wa: [] };
  FIELDS.forEach(f => byQ[f.q].push(f));

  const segG = document.getElementById('segs');
  const lblG = document.getElementById('fieldLabels');
  const rG = document.getElementById('rnames');
  const spokeG = document.getElementById('spokes');
  const ctrG = document.getElementById('centerDot');

  /* 3a. Quadrant spokes (dashed dividers) */
  [0, 90, 180, 270].forEach(deg => {
    const p1 = pol(deg, 42);
    const p2 = pol(deg, 368);
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', p1.x); l.setAttribute('y1', p1.y);
    l.setAttribute('x2', p2.x); l.setAttribute('y2', p2.y);
    l.setAttribute('class', 'spoke');
    spokeG.appendChild(l);
  });

  /* 3b. Ring segments + radial labels */
  FIELDS.forEach(f => {
    const q = QS[f.q];
    const n = byQ[f.q].length;
    const idx = byQ[f.q].indexOf(f);
    const span = (q.a2 - q.a1) / n;
    const a1 = q.a1 + idx * span, a2 = a1 + span;
    f._mid = (a1 + a2) / 2;
    f._a1 = a1;
    f._a2 = a2;

    fieldState[f.id] = { segments: [], label: null };

    // Ring segments
    RING_IDS.forEach(rid => {
      const ring = RINGS.find(r => r.id === rid);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', arc(ring.ro, ring.ri, a1, a2));
      p.setAttribute('class', 'segment');
      p.setAttribute('data-field', f.id);
      p.setAttribute('data-ring', rid);
      p.addEventListener('mouseenter', () => inspect(f.id));
      p.addEventListener('mouseleave', unfocus);
      p.addEventListener('click', e => {
        e.stopPropagation();
        togglePin(f.id);
      });
      segG.appendChild(p);
      fieldState[f.id].segments.push(p);
    });

    // Radial label (curved text along arc just outside outermost ring)
    const labelR = 388;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'field-label hit');
    g.setAttribute('data-field', f.id);

    // Path for textPath — flip direction on bottom half so text reads upright
    const isBottom = f._mid > 90 && f._mid < 270;
    const pathId = `arc-${f.id}`;
    const pathEl = document.createElementNS(NS, 'path');
    pathEl.setAttribute('id', pathId);
    pathEl.setAttribute('class', 'field-label-arc');
    if (isBottom) {
      // reverse sweep: path from a2 → a1 with sweep=0
      const p1 = pol(a2, labelR), p2 = pol(a1, labelR);
      pathEl.setAttribute('d', `M${p1.x},${p1.y}A${labelR},${labelR} 0 0 0 ${p2.x},${p2.y}`);
    } else {
      pathEl.setAttribute('d', arcPath(labelR, a1, a2, 1));
    }
    g.appendChild(pathEl);

    const textEl = document.createElementNS(NS, 'text');
    const tp = document.createElementNS(NS, 'textPath');
    tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + pathId);
    tp.setAttribute('href', '#' + pathId);
    tp.setAttribute('startOffset', '50%');
    tp.setAttribute('text-anchor', 'middle');
    tp.textContent = f.label;
    textEl.appendChild(tp);
    g.appendChild(textEl);

    // subtle underline following ring edge
    const underlineR = 374;
    const u = document.createElementNS(NS, 'path');
    u.setAttribute('class', 'field-underline');
    u.setAttribute('d', arcPath(underlineR, a1 + 1, a2 - 1, 1));
    g.appendChild(u);

    g.addEventListener('mouseenter', () => inspect(f.id));
    g.addEventListener('mouseleave', unfocus);
    g.addEventListener('click', e => {
      e.stopPropagation();
      togglePin(f.id);
    });

    lblG.appendChild(g);
    fieldState[f.id].label = g;
  });

  /* 3c. Ring level pills (center top) */
  RINGS.forEach(ring => {
    const mid = (ring.ro + ring.ri) / 2;
    const y = CY - mid;
    const text = `${ring.label.toUpperCase()} · ${ring.keyword}`;
    const w = text.length * 5.8 + 18;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ring-pill');
    g.setAttribute('data-ring', ring.id);

    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', CX - w / 2);
    rect.setAttribute('y', y - 9.5);
    rect.setAttribute('width', w);
    rect.setAttribute('height', 19);
    rect.setAttribute('rx', 9.5);
    rect.setAttribute('stroke', ring.col);
    g.appendChild(rect);

    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', CX);
    t.setAttribute('y', y + 3.5);
    t.setAttribute('fill', ring.col);
    t.textContent = text;
    g.appendChild(t);

    g.addEventListener('click', () => toggleRingFilter(ring.id));
    rG.appendChild(g);
  });

  /* 3d. Center dot & label */
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('cx', CX);
  dot.setAttribute('cy', CY);
  dot.setAttribute('r', 36);
  dot.setAttribute('class', 'center-dot');
  ctrG.appendChild(dot);

  const ring1 = document.createElementNS(NS, 'circle');
  ring1.setAttribute('cx', CX);
  ring1.setAttribute('cy', CY);
  ring1.setAttribute('r', 36);
  ring1.setAttribute('fill', 'url(#centerGlow)');
  ctrG.appendChild(ring1);

  const cl1 = document.createElementNS(NS, 'text');
  cl1.setAttribute('x', CX);
  cl1.setAttribute('y', CY - 3);
  cl1.setAttribute('class', 'center-label');
  cl1.textContent = 'Werte-';
  ctrG.appendChild(cl1);
  const cl2 = document.createElementNS(NS, 'text');
  cl2.setAttribute('x', CX);
  cl2.setAttribute('y', CY + 9);
  cl2.setAttribute('class', 'center-label');
  cl2.textContent = 'ebenen';
  ctrG.appendChild(cl2);
}


/* ----- 4. Inspector ---------------------------------------------------- */

let unfocusTimer = null;

function inspect(id) {
  clearTimeout(unfocusTimer);
  if (pinnedFieldId) return; // pinned inspector stays
  if (inspectorFieldId === id) return; // already inspecting, avoid rerender
  inspectorFieldId = id;
  renderInspector(id);
  highlightInspect(id, false);
}

function unfocus() {
  if (pinnedFieldId) return;
  clearTimeout(unfocusTimer);
  unfocusTimer = setTimeout(() => {
    inspectorFieldId = null;
    renderInspector(null);
    highlightInspect(null, false);
  }, 60);
}

function togglePin(id) {
  if (pinnedFieldId === id) {
    // unpin
    pinnedFieldId = null;
    inspectorFieldId = null;
    renderInspector(null);
    highlightInspect(null, false);
  } else {
    pinnedFieldId = id;
    inspectorFieldId = id;
    renderInspector(id);
    highlightInspect(id, true);
  }
}

function highlightInspect(id, isPinned) {
  // Clear prior
  document.querySelectorAll('.segment.inspecting, .segment.pinned').forEach(el => {
    el.classList.remove('inspecting', 'pinned');
  });
  document.querySelectorAll('.field-label.inspecting, .field-label.pinned').forEach(el => {
    el.classList.remove('inspecting', 'pinned');
  });
  if (!id) return;

  const cls = isPinned ? 'pinned' : 'inspecting';
  fieldState[id].segments.forEach(el => el.classList.add(cls));
  fieldState[id].label.classList.add(cls);
}

function renderInspector(id) {
  const el = document.getElementById('inspector');
  if (!id) {
    el.innerHTML = `<div class="inspector-empty">
      <span class="dot"></span>
      Fahren Sie über ein Feld oder klicken Sie es an — die fünf Werteausprägungen erscheinen hier.
    </div>`;
    return;
  }

  const f = FIELDS.find(x => x.id === id);
  const q = QS[f.q];
  const isPinned = pinnedFieldId === id;

  // Which rings are "activated" for this field by the current analysis?
  const activatedRings = new Set();
  if (lastAnalysis && lastAnalysis.activated_fields && lastAnalysis.activated_fields.includes(id)) {
    const dom = lastAnalysis.dominant_level;
    if (dom) activatedRings.add(dom);
  }

  const rows = RING_IDS.slice().reverse().map(rid => {  // gelb at top → rot at bottom
    const ring = RINGS.find(r => r.id === rid);
    const tip = f.tips[rid] || '—';
    const isAct = activatedRings.has(rid);
    return `
      <div class="inspector-row ${isAct ? 'activated' : ''}" style="${isAct ? `border-left-color:${ring.col}` : ''}">
        <div class="inspector-bar" style="background:${ring.col}"></div>
        <div>
          <div class="inspector-level" style="color:${ring.col}">${ring.label.toUpperCase()} · ${ring.keyword}</div>
          <div class="inspector-desc">${tip}</div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="inspector-head">
      <div>
        <div class="inspector-title">${f.label}</div>
        <div class="inspector-quadrant" style="color:${q.col}">${q.label}</div>
      </div>
      <button class="inspector-pin ${isPinned ? 'pinned' : ''}" onclick="togglePin('${id}')">
        ${isPinned ? '📌 gepinnt' : '📍 pin'}
      </button>
    </div>
    <div class="inspector-body">${rows}</div>`;
}


/* ----- 5. Filters ------------------------------------------------------ */

function toggleRingFilter(rid) {
  ringFilter = ringFilter === rid ? null : rid;
  quadFilter = null; // filters are mutually exclusive for clarity
  applyFilters();
}

function toggleQuadFilter(qid) {
  quadFilter = quadFilter === qid ? null : qid;
  ringFilter = null;
  applyFilters();
}

function clearFilters() {
  ringFilter = null;
  quadFilter = null;
  applyFilters();
}

function applyFilters() {
  // Update chip state
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.ring === ringFilter);
  });
  document.querySelectorAll('.ring-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.ring === ringFilter);
  });
  document.querySelectorAll('.q-corner').forEach(c => {
    c.classList.toggle('active', c.dataset.q === quadFilter);
    c.classList.toggle('dimmed', quadFilter && c.dataset.q !== quadFilter);
  });
  document.getElementById('filter-clear').hidden = !(ringFilter || quadFilter);

  // Segments
  document.querySelectorAll('.segment').forEach(seg => {
    seg.classList.remove('filter-on', 'dimmed');
    const field = FIELDS.find(f => f.id === seg.dataset.field);
    if (ringFilter) {
      if (seg.dataset.ring === ringFilter) seg.classList.add('filter-on');
      else seg.classList.add('dimmed');
    } else if (quadFilter) {
      if (field.q !== quadFilter) seg.classList.add('dimmed');
    }
  });

  // Labels
  document.querySelectorAll('.field-label').forEach(lbl => {
    lbl.classList.remove('dimmed');
    const field = FIELDS.find(f => f.id === lbl.dataset.field);
    if (quadFilter && field.q !== quadFilter) lbl.classList.add('dimmed');
  });

  // Reapply analysis highlights so they aren't wiped
  if (lastAnalysis) reapplyActivation(lastAnalysis);
}


/* ----- 6. API helper --------------------------------------------------- */

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

  const btn = document.getElementById('btn1');
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
      <textarea class="q-input" id="ans${i + 1}" placeholder="Ihre Antwort …"></textarea>`;
    container.appendChild(div);
  });
  document.getElementById('ans1')?.focus();
}

function resetFlow() {
  document.getElementById('step2').setAttribute('hidden', '');
  document.getElementById('step1').removeAttribute('hidden');
  document.getElementById('app').setAttribute('data-mode', 'input');
  document.getElementById('res').innerHTML =
    `<p class="result-empty">Beschreiben Sie Ihre Entscheidungssituation &mdash; die KI stellt drei Diagnosefragen, bevor die Landkarte analysiert wird.</p>`;
  resetAll();
  lastAnalysis = null;
  pinnedFieldId = null;
  inspectorFieldId = null;
  renderInspector(null);
}


/* ----- 8. Step 2: Analyse --------------------------------------------- */

async function analyse() {
  const a1 = document.getElementById('ans1')?.value.trim() || '';
  const a2 = document.getElementById('ans2')?.value.trim() || '';
  const a3 = document.getElementById('ans3')?.value.trim() || '';

  const btn = document.getElementById('btn2');
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
    `id="${f.id}" label="${f.label}" quadrant="${QS[f.q].label}" levels:${RING_IDS.map(r => `${r}=${f.tips[r]}`).join(' / ')}`
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
    lastAnalysis = result;
    document.getElementById('app').setAttribute('data-mode', 'results');
    applyActivation(result);
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


/* ----- 8a. Apply/reapply analysis activation --------------------------- */

function applyActivation(result) {
  resetAll();
  const activated = result.activated_fields || [];
  const primary = result.primary_fields || [];
  const dominant = result.dominant_level;

  // Dim non-activated fields' labels
  document.querySelectorAll('.field-label').forEach(lbl => {
    const fid = lbl.dataset.field;
    if (activated.includes(fid)) lbl.classList.add('activated');
    else lbl.classList.add('dimmed');
  });

  // Stagger-activate segments
  activated.forEach((fid, idx) => {
    const segs = fieldState[fid]?.segments || [];
    segs.forEach(seg => {
      if (seg.dataset.ring === dominant) {
        setTimeout(() => {
          seg.classList.add('activated', 'reveal');
          if (primary.includes(fid)) seg.classList.add('primary');
        }, 80 + idx * 55);
      } else {
        seg.classList.add('dimmed');
      }
    });
  });

  // Non-activated fields → dim all their segments
  FIELDS.forEach(f => {
    if (!activated.includes(f.id)) {
      fieldState[f.id].segments.forEach(seg => seg.classList.add('dimmed'));
    }
  });
}

function reapplyActivation(result) {
  // Applied on top of filter changes so analysis highlights persist
  const activated = result.activated_fields || [];
  const primary = result.primary_fields || [];
  const dominant = result.dominant_level;

  activated.forEach(fid => {
    fieldState[fid]?.segments.forEach(seg => {
      if (seg.dataset.ring === dominant) {
        if (!ringFilter || ringFilter === dominant) {
          seg.classList.add('activated');
          if (primary.includes(fid)) seg.classList.add('primary');
        }
      }
    });
  });
}

function resetAll() {
  document.querySelectorAll('.segment').forEach(el =>
    el.classList.remove('dimmed', 'activated', 'primary', 'pulse', 'reveal', 'filter-on', 'inspecting', 'pinned')
  );
  document.querySelectorAll('.field-label').forEach(el =>
    el.classList.remove('dimmed', 'activated', 'inspecting', 'pinned')
  );
}

function pulseField(id) {
  document.getElementById('mc').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const segs = fieldState[id]?.segments || [];
  segs.forEach(el => {
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
    el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
  });
  // Also inspect it
  pinnedFieldId = id;
  inspectorFieldId = id;
  renderInspector(id);
  highlightInspect(id, true);
}


/* ----- 9. Render results ---------------------------------------------- */

function render(r) {
  const qL = { ii: 'Innen · Ich', ai: 'Außen · Ich', wi: 'Innen · Wir', wa: 'Außen · Wir' };
  const qC = { ii: '#9A7A10', ai: '#1A4A8A', wi: '#2A6A3A', wa: '#8A4A1A' };
  const lvC = { rot: '#C0392B', blau: '#2E6DA4', orange: '#D4861A', gruen: '#4A8C5C', gelb: '#B8960C' };
  const lvL = { rot: 'Rot · Macht', blau: 'Blau · Ordnung', orange: 'Orange · Leistung', gruen: 'Grün · Gemeinschaft', gelb: 'Gelb · Integral' };

  const primarySet = new Set(r.primary_fields || []);
  const tags = (r.activated_fields || []).map(id => {
    const f = FIELDS.find(x => x.id === id);
    if (!f) return '';
    const pri = primarySet.has(id);
    return `<span class="field-tag ${f.q} ${pri ? 'primary' : ''}"
              onclick="pulseField('${id}')"
              title="Auf Karte zeigen & pinnen">${f.label}</span>`;
  }).join('');

  const li = a => (a || []).map(x => `<li>${x}</li>`).join('');
  const qf = r.quadrant_fokus || {};
  const dc = lvC[r.dominant_level] || '#888';
  const dl = lvL[r.dominant_level] || r.dominant_level;

  document.getElementById('res').innerHTML = `
    <div class="result-section">
      <h3>Aktivierte Felder <span class="section-hint">★ = kritisch · Klick zeigt Position</span></h3>
      <div class="field-tags">${tags}</div>
    </div>

    <div class="result-section">
      <h3>Werteebene &amp; Spannungsfeld</h3>
      <div class="level-block" style="border-left-color:${dc}">
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
      <div class="results-grid-3">
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
    </div>

    <div class="result-section">
      <h3>Quadranten-Fokus</h3>
      <div class="quadrant-grid">
        ${Object.entries(qf).map(([q, t]) => `
          <div class="insight-block" style="background:var(--surface-alt);padding:12px 14px;border-radius:6px;border-left:3px solid ${qC[q] || '#888'}">
            <div class="insight-label" style="color:${qC[q] || '#888'};margin-bottom:6px">${qL[q] || q}</div>
            <div class="insight-text" style="font-size:.84rem">${t}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="result-section">
      <h3>Reflexionsfragen</h3>
      <div class="insight-text"><ul>${li(r.reflexionsfragen)}</ul></div>
    </div>

    <button class="reset-btn" onclick="resetFlow()">Neue Analyse starten</button>
  `;
}


/* ----- 10. Event wiring ------------------------------------------------ */

function wireEvents() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => toggleRingFilter(chip.dataset.ring));
  });
  document.getElementById('filter-clear').addEventListener('click', clearFilters);

  document.querySelectorAll('.q-corner').forEach(corner => {
    corner.addEventListener('click', () => toggleQuadFilter(corner.dataset.q));
  });

  // ESC unpins
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pinnedFieldId) {
      pinnedFieldId = null;
      renderInspector(null);
      highlightInspect(null, false);
    }
  });

  // Click outside map to unpin
  document.addEventListener('click', e => {
    if (!e.target.closest('.map-container') && !e.target.closest('.inspector') && !e.target.closest('.field-tag')) {
      if (pinnedFieldId) {
        pinnedFieldId = null;
        renderInspector(null);
        highlightInspect(null, false);
      }
    }
  });
}


/* ----- 11. Boot -------------------------------------------------------- */

build();
wireEvents();