/* ==========================================================================
   Denkhorizonte V3 – app.js
   3-column resizable workspace with collapsible input, full localStorage
   persistence of decision/questions/answers/analysis/layout.
   ========================================================================== */

const NS = "http://www.w3.org/2000/svg";
const STORAGE_KEY = "denkhorizonte.v1";

/* ============================================================= */
/* ===== 1. Static data ======================================= */
/* ============================================================= */

const RINGS = [
  {
    id: "rot",
    label: "Rot",
    keyword: "Macht",
    ro: 115,
    ri: 42,
    col: "#C0392B",
  },
  {
    id: "blau",
    label: "Blau",
    keyword: "Ordnung",
    ro: 180,
    ri: 115,
    col: "#2E6DA4",
  },
  {
    id: "orange",
    label: "Orange",
    keyword: "Leistung",
    ro: 245,
    ri: 180,
    col: "#D4861A",
  },
  {
    id: "gruen",
    label: "Grün",
    keyword: "Gemeinschaft",
    ro: 308,
    ri: 245,
    col: "#4A8C5C",
  },
  {
    id: "gelb",
    label: "Gelb",
    keyword: "Integral",
    ro: 368,
    ri: 308,
    col: "#B8960C",
  },
];

const QS = {
  ii: { label: "Innen · Ich", short: "ii", col: "#9A7A10", a1: 270, a2: 360 },
  ai: { label: "Außen · Ich", short: "ai", col: "#1A4A8A", a1: 0, a2: 90 },
  wi: { label: "Innen · Wir", short: "wi", col: "#2A6A3A", a1: 180, a2: 270 },
  wa: { label: "Außen · Wir", short: "wa", col: "#8A4A1A", a1: 90, a2: 180 },
};

const FIELDS = [
  {
    id: "vertrauen",
    label: "Vertrauen",
    q: "ii",
    tips: {
      gelb: "in freien Willen",
      gruen: "in Gemeinschaft / gemeinsame Werte",
      orange: "in Fähigkeiten im Wettbewerb",
      blau: "in Regeln und bestehende Ordnung",
      rot: "in Stärke des Anführers",
    },
  },
  {
    id: "angst",
    label: "Angst",
    q: "ii",
    tips: {
      gelb: "vor Einschränkung",
      gruen: "vor Ablehnung",
      orange: "vor Versagen",
      blau: "vor Positionsverlust",
      rot: "vor Kontrollverlust / Schwäche",
    },
  },
  {
    id: "haltung",
    label: "Haltung im Kontakt",
    q: "ii",
    tips: {
      gelb: "individuell / Trennung Person & Rolle",
      gruen: "empathisch",
      orange: "strategisch-nutzenorientiert",
      blau: "vorsichtig / Rang ist wichtig",
      rot: "dominant / direkt",
    },
  },
  {
    id: "motivation",
    label: "Intrins. Motivation",
    q: "ii",
    tips: {
      gelb: "Berufung & Selbstausdruck",
      gruen: "Menschen inspirieren & würdigen",
      orange: "unternehmerisches Denken & Handeln",
      blau: "materiell / Sicherheit schaffen",
      rot: "Stärke beweisen / sich durchsetzen",
    },
  },
  {
    id: "selbstwahr",
    label: "Selbstwahrnehmung",
    q: "ii",
    tips: {
      gelb: "Metaperspektive / kann sich beim Denken zuschauen",
      gruen: "Gedanken & Gefühle bewusst",
      orange: "Gedanken bewusst, Gefühle unbewusst",
      blau: "Gedanken & Gefühle unbewusst",
      rot: "kaum Selbstreflexion / Impuls = Wahrheit",
    },
  },

  {
    id: "fuehrung",
    label: "Führungsverhalten",
    q: "ai",
    tips: {
      gelb: "Selbstmanagement / situative Beteiligung",
      gruen: "begeistert & bindet alle ein",
      orange: "motiviert durch Ziele & Rechenschaftspflicht",
      blau: "strikte Anweisungen",
      rot: "befiehlt / dominiert",
    },
  },
  {
    id: "entscheid",
    label: "Entscheidungsfindung",
    q: "ai",
    tips: {
      gelb: "systemisch / kontextsensitiv / situativ",
      gruen: "wertebasiert / konsensorientiert",
      orange: "Ziele & Strategie",
      blau: "Führungskraft intransparent / regelgebunden",
      rot: "Bauchentscheidung / Machtdemonstration",
    },
  },
  {
    id: "personal",
    label: "Personalentwicklung",
    q: "ai",
    tips: {
      gelb: "Networking / Coaching / Open Space",
      gruen: "Coaching",
      orange: "Training & Unterweisung",
      blau: "Schulung",
      rot: "Sink or swim",
    },
  },
  {
    id: "konflikt",
    label: "Umgang m. Konflikten",
    q: "ai",
    tips: {
      gelb: "Konflikt als Potenzial",
      gruen: "Lösung für Bedürfnisse aller",
      orange: "um effektivste Lösung ringen",
      blau: "Regelkonformität",
      rot: "Eskalation / Einschüchterung",
    },
  },
  {
    id: "meetings",
    label: "Meetings",
    q: "ai",
    tips: {
      gelb: "Kontext- & kompetenzorientiert",
      gruen: "auf Meinungsvielfalt & Bedürfnisse achten",
      orange: "Ergebnisorientierung durch Moderation",
      blau: "Ordnung halten / Protokoll",
      rot: "Chef spricht, Rest hört zu",
    },
  },

  {
    id: "produkte",
    label: "Produkte / DL",
    q: "wa",
    tips: {
      gelb: "disruptive Innovation",
      gruen: "sinnhafte / nachhaltige Produkte",
      orange: "Trendprodukte / Innovation",
      blau: "etablierte Produkte",
      rot: "kopieren was funktioniert",
    },
  },
  {
    id: "entlohnung",
    label: "Entlohnungssystem",
    q: "wa",
    tips: {
      gelb: "möglichkeitsorientiert",
      gruen: "beteiligungsorientiert",
      orange: "leistungsorientiert",
      blau: "tarifgebunden / fix",
      rot: "wer sich durchsetzt bekommt mehr",
    },
  },
  {
    id: "ressourcen",
    label: "Ressourcen-Effizienz",
    q: "wa",
    tips: {
      gelb: "flexible Systeme",
      gruen: "nachhaltige Wertschöpfungskette",
      orange: "Kosteneffizienz / Qualität",
      blau: "Gesetze / Normen",
      rot: "Ressourcen für Machterhalt",
    },
  },
  {
    id: "infofluss",
    label: "Infofluss / Komm.",
    q: "wa",
    tips: {
      gelb: "freies Networking / kollegiale Beratung",
      gruen: "Kommunikationsplattform / Transparenz",
      orange: "Meeting / strategische Informationen",
      blau: "Arbeitsgruppen",
      rot: "Information als Machtmittel",
    },
  },
  {
    id: "organigramm",
    label: "Organigramm",
    q: "wa",
    tips: {
      gelb: "Selbstorganisation / agil",
      gruen: "Matrix",
      orange: "dynamische / flache Hierarchie",
      blau: "feste Hierarchie",
      rot: "wer oben ist entscheidet alles",
    },
  },

  {
    id: "loyalitaet",
    label: "Loyalität",
    q: "wi",
    tips: {
      gelb: "zum gemeinsamen Interesse & Ideen",
      gruen: "zu gemeinsamen Werten",
      orange: "zur gesamten Organisation",
      blau: "gegenüber dem Chef",
      rot: "zur Clique / zum Stärksten",
    },
  },
  {
    id: "atmosphaere",
    label: "Arbeitsatmosphäre",
    q: "wi",
    tips: {
      gelb: "offen & kreativ",
      gruen: "freundschaftlich & gemeinschaftsorientiert",
      orange: "pragmatisch & ergebnisgetrieben",
      blau: "routiniertes Nebeneinander",
      rot: "Revierkämpfe / Rangordnung",
    },
  },
  {
    id: "vision",
    label: "Vision / Werte",
    q: "wi",
    tips: {
      gelb: "authentischer / situativer eigener Purpose",
      gruen: "vermeintlich gemeinsamer Purpose / gesellschaftlich validiert",
      orange: "Instrumente zur Entscheidungsfindung",
      blau: "z.T. plakativ / Dogmen von oben",
      rot: "Macht ist die Wahrheit",
    },
  },
  {
    id: "arbeitseinst",
    label: "Arbeitseinstellung",
    q: "wi",
    tips: {
      gelb: "interessenorientiert aus der Fülle / kein Mangel",
      gruen: "Vision / idealistisch / Kultur vor Strategie",
      orange: "Ziel / alles ist möglich",
      blau: "Vorgabe / Skepsis / Gehorsam",
      rot: "Durchsetzen oder verlieren",
    },
  },
  {
    id: "stakeholder",
    label: "Stakeholder-Bezieh.",
    q: "wi",
    tips: {
      gelb: "co-kreativ",
      gruen: "partnerschaftlich",
      orange: "zweckorientiert / strategisch",
      blau: "hierarchisch",
      rot: "ausnutzen solange möglich",
    },
  },
];

const RING_IDS = ["rot", "blau", "orange", "gruen", "gelb"];

/* ============================================================= */
/* ===== 2. State management & persistence =================== */
/* ============================================================= */

/** Persistent state shape:
 *  { decision, questions, answers, analysis, step, colInput, colResults, inputCollapsed }
 */

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    console.warn("State load failed:", e);
    return {};
  }
}

function saveState(patch) {
  try {
    const current = loadState();
    const next = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("State save failed:", e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
}

/* ============================================================= */
/* ===== 3. Geometry ========================================== */
/* ============================================================= */

const CX = 450,
  CY = 450;

function pol(deg, r) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function arc(ro, ri, a1, a2) {
  const p1 = pol(a1, ro),
    p2 = pol(a2, ro);
  const p3 = pol(a2, ri),
    p4 = pol(a1, ri);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${p1.x},${p1.y}A${ro},${ro} 0 ${lg} 1 ${p2.x},${p2.y}L${p3.x},${p3.y}A${ri},${ri} 0 ${lg} 0 ${p4.x},${p4.y}Z`;
}

function arcPath(r, a1, a2, sweep = 1) {
  const p1 = pol(a1, r),
    p2 = pol(a2, r);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${p1.x},${p1.y}A${r},${r} 0 ${lg} ${sweep} ${p2.x},${p2.y}`;
}

/* ============================================================= */
/* ===== 4. Build SVG map ===================================== */
/* ============================================================= */

const fieldState = {};
let pinnedFieldId = null;
let inspectorFieldId = null;
let ringFilter = null;
let quadFilter = null;
let lastAnalysis = null;
let decisionText = "";
let lastQuestions = null;

function build() {
  const byQ = { ii: [], ai: [], wi: [], wa: [] };
  FIELDS.forEach((f) => byQ[f.q].push(f));

  const segG = document.getElementById("segs");
  const lblG = document.getElementById("fieldLabels");
  const rG = document.getElementById("rnames");
  const spokeG = document.getElementById("spokes");
  const ctrG = document.getElementById("centerDot");

  /* 4a. Quadrant spokes */
  [0, 90, 180, 270].forEach((deg) => {
    const p1 = pol(deg, 42);
    const p2 = pol(deg, 368);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", p1.x);
    l.setAttribute("y1", p1.y);
    l.setAttribute("x2", p2.x);
    l.setAttribute("y2", p2.y);
    l.setAttribute("class", "spoke");
    spokeG.appendChild(l);
  });

  /* 4b. Segments + radial labels */
  FIELDS.forEach((f) => {
    const q = QS[f.q];
    const n = byQ[f.q].length;
    const idx = byQ[f.q].indexOf(f);
    const span = (q.a2 - q.a1) / n;
    const a1 = q.a1 + idx * span,
      a2 = a1 + span;
    f._mid = (a1 + a2) / 2;
    f._a1 = a1;
    f._a2 = a2;

    fieldState[f.id] = { segments: [], label: null };

    RING_IDS.forEach((rid) => {
      const ring = RINGS.find((r) => r.id === rid);
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", arc(ring.ro, ring.ri, a1, a2));
      p.setAttribute("class", "segment");
      p.setAttribute("data-field", f.id);
      p.setAttribute("data-ring", rid);
      p.addEventListener("mouseenter", () => inspect(f.id));
      p.addEventListener("mouseleave", unfocus);
      p.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePin(f.id);
      });
      segG.appendChild(p);
      fieldState[f.id].segments.push(p);
    });

    // Radial label
    const labelR = 388;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "field-label hit");
    g.setAttribute("data-field", f.id);

    const isBottom = f._mid > 90 && f._mid < 270;
    const pathId = `arc-${f.id}`;
    const pathEl = document.createElementNS(NS, "path");
    pathEl.setAttribute("id", pathId);
    pathEl.setAttribute("class", "field-label-arc");
    if (isBottom) {
      const p1 = pol(a2, labelR),
        p2 = pol(a1, labelR);
      pathEl.setAttribute(
        "d",
        `M${p1.x},${p1.y}A${labelR},${labelR} 0 0 0 ${p2.x},${p2.y}`,
      );
    } else {
      pathEl.setAttribute("d", arcPath(labelR, a1, a2, 1));
    }
    g.appendChild(pathEl);

    const textEl = document.createElementNS(NS, "text");
    const tp = document.createElementNS(NS, "textPath");
    tp.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "#" + pathId,
    );
    tp.setAttribute("href", "#" + pathId);
    tp.setAttribute("startOffset", "50%");
    tp.setAttribute("text-anchor", "middle");
    tp.textContent = f.label;
    textEl.appendChild(tp);
    g.appendChild(textEl);

    const underlineR = 374;
    const u = document.createElementNS(NS, "path");
    u.setAttribute("class", "field-underline");
    u.setAttribute("d", arcPath(underlineR, a1 + 1, a2 - 1, 1));
    g.appendChild(u);

    g.addEventListener("mouseenter", () => inspect(f.id));
    g.addEventListener("mouseleave", unfocus);
    g.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePin(f.id);
    });

    lblG.appendChild(g);
    fieldState[f.id].label = g;
  });

  /* 4c. Ring pills */
  RINGS.forEach((ring) => {
    const mid = (ring.ro + ring.ri) / 2;
    const y = CY - mid;
    const text = `${ring.label.toUpperCase()} · ${ring.keyword}`;
    const w = text.length * 5.9 + 28;
    const h = 22;

    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "ring-pill");
    g.setAttribute("data-ring", ring.id);

    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", CX - w / 2);
    rect.setAttribute("y", y - h / 2);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    rect.setAttribute("rx", h / 2);
    rect.setAttribute("stroke", ring.col);
    g.appendChild(rect);

    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", CX - w / 2 + 10);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 4);
    dot.setAttribute("fill", ring.col);
    g.appendChild(dot);

    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", CX + 6);
    t.setAttribute("y", y + 3.5);
    t.setAttribute("fill", ring.col);
    t.textContent = text;
    g.appendChild(t);

    g.addEventListener("click", () => toggleRingFilter(ring.id));
    rG.appendChild(g);
  });

  /* 4d. Center brand mark */
  const decoRing = document.createElementNS(NS, "circle");
  decoRing.setAttribute("cx", CX);
  decoRing.setAttribute("cy", CY);
  decoRing.setAttribute("r", 40);
  decoRing.setAttribute("class", "center-ring");
  ctrG.appendChild(decoRing);

  const disk = document.createElementNS(NS, "circle");
  disk.setAttribute("cx", CX);
  disk.setAttribute("cy", CY);
  disk.setAttribute("r", 34);
  disk.setAttribute("class", "center-disk");
  ctrG.appendChild(disk);

  const brand1 = document.createElementNS(NS, "text");
  brand1.setAttribute("x", CX);
  brand1.setAttribute("y", CY - 4);
  brand1.setAttribute("class", "center-brand");
  brand1.textContent = "DENK";
  ctrG.appendChild(brand1);

  const brand2 = document.createElementNS(NS, "text");
  brand2.setAttribute("x", CX);
  brand2.setAttribute("y", CY + 7);
  brand2.setAttribute("class", "center-brand");
  brand2.textContent = "HORIZONTE";
  ctrG.appendChild(brand2);

  const accent = document.createElementNS(NS, "line");
  accent.setAttribute("x1", CX - 12);
  accent.setAttribute("y1", CY + 13);
  accent.setAttribute("x2", CX + 12);
  accent.setAttribute("y2", CY + 13);
  accent.setAttribute("class", "center-accent");
  ctrG.appendChild(accent);

  const tagline = document.createElementNS(NS, "text");
  tagline.setAttribute("x", CX);
  tagline.setAttribute("y", CY + 23);
  tagline.setAttribute("class", "center-tag");
  tagline.textContent = "WERTEEBENEN";
  ctrG.appendChild(tagline);
}

/* ============================================================= */
/* ===== 5. Inspector ========================================= */
/* ============================================================= */

let unfocusTimer = null;

function inspect(id) {
  clearTimeout(unfocusTimer);
  if (pinnedFieldId) return;
  if (inspectorFieldId === id) return;
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
  }, 80);
}

function togglePin(id) {
  if (pinnedFieldId === id) {
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
  document
    .querySelectorAll(".segment.inspecting, .segment.pinned")
    .forEach((el) => el.classList.remove("inspecting", "pinned"));
  document
    .querySelectorAll(".field-label.inspecting, .field-label.pinned")
    .forEach((el) => el.classList.remove("inspecting", "pinned"));
  if (!id) return;
  const cls = isPinned ? "pinned" : "inspecting";
  fieldState[id].segments.forEach((el) => el.classList.add(cls));
  fieldState[id].label.classList.add(cls);
}

function renderInspector(id) {
  const el = document.getElementById("inspector");
  if (!id) {
    el.innerHTML = `<div class="inspector-empty">
      <span class="dot"></span>
      Fahren Sie über ein Feld oder klicken Sie es an — die fünf Werteausprägungen erscheinen hier.
    </div>`;
    return;
  }

  const f = FIELDS.find((x) => x.id === id);
  const q = QS[f.q];
  const isPinned = pinnedFieldId === id;

  const activatedRings = new Set();
  if (lastAnalysis && (lastAnalysis.activated_fields || []).includes(id)) {
    if (lastAnalysis.dominant_level)
      activatedRings.add(lastAnalysis.dominant_level);
  }

  const rows = RING_IDS.slice()
    .reverse()
    .map((rid) => {
      const ring = RINGS.find((r) => r.id === rid);
      const tip = f.tips[rid] || "—";
      const isAct = activatedRings.has(rid);
      return `
      <div class="inspector-row ${isAct ? "activated" : ""}" style="${isAct ? `border-left-color:${ring.col}` : ""}">
        <div class="inspector-bar" style="background:${ring.col}"></div>
        <div>
          <div class="inspector-level" style="color:${ring.col}">${ring.label.toUpperCase()} · ${ring.keyword}</div>
          <div class="inspector-desc">${tip}</div>
        </div>
      </div>`;
    })
    .join("");

  el.innerHTML = `
    <div class="inspector-head">
      <div>
        <div class="inspector-title">${f.label}</div>
        <div class="inspector-quadrant" style="color:${q.col}">${q.label}</div>
      </div>
      <button class="inspector-pin ${isPinned ? "pinned" : ""}" type="button" onclick="togglePin('${id}')">
        ${isPinned ? "📌 gepinnt" : "📍 pin"}
      </button>
    </div>
    <div class="inspector-body">${rows}</div>`;
}

/* ============================================================= */
/* ===== 6. Filters =========================================== */
/* ============================================================= */

function toggleRingFilter(rid) {
  ringFilter = ringFilter === rid ? null : rid;
  quadFilter = null;
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
  document
    .querySelectorAll(".filter-chip")
    .forEach((c) =>
      c.classList.toggle("active", c.dataset.ring === ringFilter),
    );
  document
    .querySelectorAll(".ring-pill")
    .forEach((p) =>
      p.classList.toggle("active", p.dataset.ring === ringFilter),
    );
  document.querySelectorAll(".q-corner").forEach((c) => {
    c.classList.toggle("active", c.dataset.q === quadFilter);
    c.classList.toggle("dimmed", quadFilter && c.dataset.q !== quadFilter);
  });
  document.getElementById("filter-clear").hidden = !(ringFilter || quadFilter);

  document.querySelectorAll(".segment").forEach((seg) => {
    seg.classList.remove("filter-on", "dimmed");
    const field = FIELDS.find((f) => f.id === seg.dataset.field);
    if (ringFilter) {
      if (seg.dataset.ring === ringFilter) seg.classList.add("filter-on");
      else seg.classList.add("dimmed");
    } else if (quadFilter) {
      if (field.q !== quadFilter) seg.classList.add("dimmed");
    }
  });

  document.querySelectorAll(".field-label").forEach((lbl) => {
    lbl.classList.remove("dimmed");
    const field = FIELDS.find((f) => f.id === lbl.dataset.field);
    if (quadFilter && field.q !== quadFilter) lbl.classList.add("dimmed");
  });

  if (lastAnalysis) reapplyActivation(lastAnalysis);
}

/* ============================================================= */
/* ===== 7. API helper ======================================== */
/* ============================================================= */

async function callAPI(system, userMsg) {
  const r = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, userMsg }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.content?.[0]?.text || "";
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (e) {
    const match = raw.match(/\{[\s\S]*/);
    if (!match) throw new Error("Keine JSON-Antwort erhalten");
    let p = match[0];
    const opens = [...p].reduce((acc, c) => {
      if (c === "{") acc.push("}");
      else if (c === "[") acc.push("]");
      else if (c === "}" || c === "]") acc.pop();
      return acc;
    }, []);
    p = p.replace(/,\s*$/, "") + opens.reverse().join("");
    return JSON.parse(p);
  }
}

/* ============================================================= */
/* ===== 8. Flow: get questions =============================== */
/* ============================================================= */

async function getQuestions() {
  const input = document.getElementById("inp").value.trim();
  if (!input) return;
  decisionText = input;
  saveState({ decision: input, step: "input" });

  const btn = document.getElementById("btn1");
  const load = document.getElementById("load1");
  btn.disabled = true;
  load.classList.add("active");

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
    lastQuestions = result;
    saveState({ questions: result, step: "questions", answers: [] });
    showStep2(result);
    updateHeaderReset();
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    load.classList.remove("active");
  }
}

function showStep2(questions) {
  document.getElementById("step1").setAttribute("hidden", "");
  document.getElementById("step2").removeAttribute("hidden");
  document.getElementById("dec-summary").textContent = decisionText;
  document.getElementById("panelTitle").textContent = "Diagnose";

  const container = document.getElementById("q-container");
  container.innerHTML = "";
  ["q1", "q2", "q3"].forEach((k, i) => {
    const div = document.createElement("div");
    div.className = "q-block";
    div.innerHTML = `
      <div class="q-label">${questions[k]}</div>
      <textarea class="q-input" id="ans${i + 1}" placeholder="Ihre Antwort …"></textarea>`;
    container.appendChild(div);
  });

  // Wire auto-save on answers
  container.querySelectorAll(".q-input").forEach((ta) => {
    ta.addEventListener("input", () => {
      const answers = [1, 2, 3].map(
        (i) => document.getElementById(`ans${i}`)?.value || "",
      );
      saveState({ answers });
    });
  });
}

function backToStep1() {
  document.getElementById("step2").setAttribute("hidden", "");
  document.getElementById("step1").removeAttribute("hidden");
  document.getElementById("panelTitle").textContent = "Situation";
}

/* ============================================================= */
/* ===== 9. Flow: analyse ===================================== */
/* ============================================================= */

async function analyse() {
  const a1 = document.getElementById("ans1")?.value.trim() || "";
  const a2 = document.getElementById("ans2")?.value.trim() || "";
  const a3 = document.getElementById("ans3")?.value.trim() || "";

  saveState({ answers: [a1, a2, a3] });

  const btn = document.getElementById("btn2");
  const load = document.getElementById("load2");
  const btnText = document.getElementById("btn2Text");
  btn.disabled = true;
  load.classList.add("active");
  setResultStatus("analyzing", "Analysiere …");

  const q1 =
    document.querySelector("#q-container .q-block:nth-child(1) .q-label")
      ?.textContent || "Hauptgrund";
  const q2 =
    document.querySelector("#q-container .q-block:nth-child(2) .q-label")
      ?.textContent || "Erhofftes Ergebnis";
  const q3 =
    document.querySelector("#q-container .q-block:nth-child(3) .q-label")
      ?.textContent || "Bedenken";

  const userContext = `Entscheidung: ${decisionText}
${q1}: ${a1 || "(keine Antwort)"}
${q2}: ${a2 || "(keine Antwort)"}
${q3}: ${a3 || "(keine Antwort)"}`;

  const fieldList = FIELDS.map(
    (f) =>
      `id="${f.id}" label="${f.label}" quadrant="${QS[f.q].label}" levels:${RING_IDS.map((r) => `${r}=${f.tips[r]}`).join(" / ")}`,
  ).join("\n");

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
    saveState({
      analysis: result,
      step: "results",
      answers: [a1, a2, a3],
    });
    document.getElementById("app").setAttribute("data-mode", "results");
    applyActivation(result);
    render(result);
    setResultStatus("active", "Abgeschlossen");
    btnText.textContent = "Erneut analysieren";
    updateHeaderReset();
  } catch (err) {
    showError(err.message);
    setResultStatus("", "Fehler");
    resetAll();
  } finally {
    btn.disabled = false;
    load.classList.remove("active");
  }
}

function showError(msg) {
  const res = document.getElementById("res");
  res.innerHTML = `<div style="padding:20px;color:var(--rot);font-size:.85rem;background:rgba(192,57,43,.08);border-left:3px solid var(--rot);border-radius:0 4px 4px 0">Fehler: ${msg}</div>`;
}

function setResultStatus(cls, text) {
  const el = document.getElementById("resultStatus");
  el.className = "result-status" + (cls ? " " + cls : "");
  el.textContent = text;
}

/* ============================================================= */
/* ===== 10. Activate segments ================================ */
/* ============================================================= */

function applyActivation(result) {
  resetAll();
  const activated = result.activated_fields || [];
  const primary = result.primary_fields || [];
  const dominant = result.dominant_level;

  // Nur Label-Highlighting, kein Dimming
  document.querySelectorAll(".field-label").forEach((lbl) => {
    if (activated.includes(lbl.dataset.field)) lbl.classList.add("activated");
  });

  // Alle Ringe der aktivierten Felder hervorheben (nicht nur dominant)
  activated.forEach((fid, idx) => {
    const segs = fieldState[fid]?.segments || [];
    segs.forEach((seg) => {
      setTimeout(
        () => {
          seg.classList.add("activated", "reveal");
          // Dominant-Ring zusätzlich als "primary" markieren
          if (seg.dataset.ring === dominant) seg.classList.add("dominant-ring");
          if (primary.includes(fid)) seg.classList.add("primary");
        },
        80 + idx * 55,
      );
    });
  });
}

function reapplyActivation(result) {
  const activated = result.activated_fields || [];
  const primary = result.primary_fields || [];
  const dominant = result.dominant_level;

  activated.forEach((fid) => {
    fieldState[fid]?.segments.forEach((seg) => {
      seg.classList.add("activated");
      if (seg.dataset.ring === dominant) seg.classList.add("dominant-ring");
      if (primary.includes(fid)) seg.classList.add("primary");
    });
  });
}

function resetAll() {
  document
    .querySelectorAll(".segment")
    .forEach((el) =>
      el.classList.remove(
        "dimmed",
        "activated",
        "primary",
        "pulse",
        "reveal",
        "filter-on",
        "inspecting",
        "pinned",
      ),
    );
  document
    .querySelectorAll(".field-label")
    .forEach((el) =>
      el.classList.remove("dimmed", "activated", "inspecting", "pinned"),
    );
}

function pulseField(id) {
  document
    .getElementById("mc")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
  const segs = fieldState[id]?.segments || [];
  segs.forEach((el) => {
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
    el.addEventListener("animationend", () => el.classList.remove("pulse"), {
      once: true,
    });
  });
  pinnedFieldId = id;
  inspectorFieldId = id;
  renderInspector(id);
  highlightInspect(id, true);
}

/* ============================================================= */
/* ===== 11. Render analysis panel ============================ */
/* ============================================================= */

function render(r) {
  const qL = {
    ii: "Innen · Ich",
    ai: "Außen · Ich",
    wi: "Innen · Wir",
    wa: "Außen · Wir",
  };
  const qC = { ii: "#9A7A10", ai: "#1A4A8A", wi: "#2A6A3A", wa: "#8A4A1A" };
  const lvC = {
    rot: "#C0392B",
    blau: "#2E6DA4",
    orange: "#D4861A",
    gruen: "#4A8C5C",
    gelb: "#B8960C",
  };
  const lvL = {
    rot: "Rot · Macht",
    blau: "Blau · Ordnung",
    orange: "Orange · Leistung",
    gruen: "Grün · Gemeinschaft",
    gelb: "Gelb · Integral",
  };

  const primarySet = new Set(r.primary_fields || []);
  const tags = (r.activated_fields || [])
    .map((id) => {
      const f = FIELDS.find((x) => x.id === id);
      if (!f) return "";
      const pri = primarySet.has(id);
      return `<span class="field-tag ${f.q} ${pri ? "primary" : ""}" onclick="pulseField('${id}')" title="Auf Karte zeigen">${f.label}</span>`;
    })
    .join("");

  const li = (a) => (a || []).map((x) => `<li>${x}</li>`).join("");
  const qf = r.quadrant_fokus || {};
  const dc = lvC[r.dominant_level] || "#888";
  const dl = lvL[r.dominant_level] || r.dominant_level;

  document.getElementById("res").innerHTML = `
    <div class="result-section">
      <h3>Aktivierte Felder <span class="section-hint">★ kritisch · Klick zeigt</span></h3>
      <div class="field-tags">${tags}</div>
    </div>

    <div class="result-section">
      <h3>Werteebene</h3>
      <div class="level-block" style="border-left-color:${dc}">
        <div class="insight-label" style="color:${dc}">${dl}</div>
        <div class="insight-text">${r.dominant_level_begruendung || ""}</div>
      </div>
      ${
        r.spannungsfeld
          ? `
        <div class="insight-block">
          <div class="insight-label" style="color:#888">Spannungsfeld</div>
          <div class="insight-text">${r.spannungsfeld}</div>
        </div>`
          : ""
      }
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
        ${Object.entries(qf)
          .map(
            ([q, t]) => `
          <div class="insight-block" style="background:var(--surface-alt);padding:11px 13px;border-radius:6px;border-left:3px solid ${qC[q] || "#888"}">
            <div class="insight-label" style="color:${qC[q] || "#888"};margin-bottom:5px">${qL[q] || q}</div>
            <div class="insight-text" style="font-size:.82rem">${t}</div>
          </div>`,
          )
          .join("")}
      </div>
    </div>

    <div class="result-section">
      <h3>Reflexionsfragen</h3>
      <div class="insight-text"><ul>${li(r.reflexionsfragen)}</ul></div>
    </div>
  `;
}

/* ============================================================= */
/* ===== 12. Reset flow ======================================= */
/* ============================================================= */

function resetFlow() {
  clearState();
  lastAnalysis = null;
  lastQuestions = null;
  decisionText = "";
  pinnedFieldId = null;
  inspectorFieldId = null;

  document.getElementById("inp").value = "";
  document.getElementById("q-container").innerHTML = "";
  document.getElementById("step2").setAttribute("hidden", "");
  document.getElementById("step1").removeAttribute("hidden");
  document.getElementById("app").setAttribute("data-mode", "input");
  document.getElementById("panelTitle").textContent = "Situation";
  document.getElementById("btn2Text").textContent = "Landkarte analysieren";

  document.getElementById("res").innerHTML = `
    <div class="result-empty-state">
      <div class="result-empty-icon">◎</div>
      <div class="result-empty-title">Noch keine Analyse</div>
      <p class="result-empty-text">Sobald Sie die Landkarte analysieren lassen, erscheinen hier:</p>
      <ul class="result-empty-list">
        <li>Aktivierte Felder auf der Karte</li>
        <li>Dominante Werteebene &amp; Spannungsfeld</li>
        <li>Chancen, Risiken, blinde Flecken</li>
        <li>Quadranten-Fokus</li>
        <li>Reflexionsfragen</li>
      </ul>
    </div>`;
  setResultStatus("", "Warten");
  resetAll();
  renderInspector(null);
  updateHeaderReset();

  // Keep layout preferences but clear data
  // (user's column widths stay)
}

/* ============================================================= */
/* ===== 13. Collapse panel =================================== */
/* ============================================================= */

function toggleInputPanel() {
  const app = document.getElementById("app");
  const collapsed = app.classList.toggle("input-collapsed");
  saveState({ inputCollapsed: collapsed });
  updateStripDots();
}

function updateStripDots() {
  const state = loadState();
  const dots = document.querySelectorAll(".strip-dots .dot");
  if (!dots.length) return;

  // Dot states: 1 = situation, 2 = questions, 3 = analysis
  const step = state.step || "input";
  dots.forEach((d) => d.classList.remove("done", "active"));

  if (step === "input") {
    dots[0].classList.add("active");
  } else if (step === "questions") {
    dots[0].classList.add("done");
    dots[1].classList.add("active");
  } else if (step === "results") {
    dots[0].classList.add("done");
    dots[1].classList.add("done");
    dots[2].classList.add("active");
  }
}

function updateHeaderReset() {
  const state = loadState();
  const btn = document.getElementById("headerResetBtn");
  btn.hidden = !(state.questions || state.analysis);
  updateStripDots();
}

/* ============================================================= */
/* ===== 14. Resize handles =================================== */
/* ============================================================= */

function initResize() {
  document.querySelectorAll(".resize-handle").forEach((h) => {
    h.addEventListener("pointerdown", startResize);
  });
}

let resizeActive = null;

function startResize(e) {
  // Only on desktop
  if (window.innerWidth < 1024) return;
  e.preventDefault();
  const handle = e.currentTarget;
  const col = handle.dataset.col;
  if (
    col === "input" &&
    document.getElementById("app").classList.contains("input-collapsed")
  )
    return;

  handle.setPointerCapture(e.pointerId);
  handle.classList.add("dragging");
  document.body.classList.add("resizing");
  document.getElementById("workspace").classList.add("dragging");

  const startX = e.clientX;
  const cssVar = `--col-${col}`;
  const current =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(cssVar),
    ) || 340;
  const minVar = `--col-${col}-min`;
  const maxVar = `--col-${col}-max`;
  const min =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(minVar),
    ) || 260;
  const max =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(maxVar),
    ) || 700;

  resizeActive = {
    handle,
    col,
    startX,
    current,
    min,
    max,
    pointerId: e.pointerId,
    cssVar,
  };

  handle.addEventListener("pointermove", onResize);
  handle.addEventListener("pointerup", endResize);
  handle.addEventListener("pointercancel", endResize);
}

function onResize(e) {
  if (!resizeActive) return;
  let delta = e.clientX - resizeActive.startX;
  // Right column: moving right should shrink it, so invert
  if (resizeActive.col === "results") delta = -delta;
  let next = resizeActive.current + delta;

  // Also cap so center column never goes below 400
  const ws = document.getElementById("workspace").getBoundingClientRect().width;
  const handleWidth = 12; // 2 handles × 6px
  const otherCol =
    resizeActive.col === "input"
      ? parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--col-results",
          ),
        )
      : parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--col-input",
          ),
        );
  const maxAllowed = ws - handleWidth - otherCol - 400;

  next = Math.max(
    resizeActive.min,
    Math.min(resizeActive.max, Math.min(next, maxAllowed)),
  );
  document.documentElement.style.setProperty(resizeActive.cssVar, next + "px");
}

function endResize(e) {
  if (!resizeActive) return;
  const { handle, col, pointerId, cssVar } = resizeActive;
  try {
    handle.releasePointerCapture(pointerId);
  } catch (e) {
    /* ignore */
  }
  handle.classList.remove("dragging");
  document.body.classList.remove("resizing");
  document.getElementById("workspace").classList.remove("dragging");
  handle.removeEventListener("pointermove", onResize);
  handle.removeEventListener("pointerup", endResize);
  handle.removeEventListener("pointercancel", endResize);

  // Save final width
  const final = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(cssVar),
  );
  if (col === "input") saveState({ colInput: final });
  else saveState({ colResults: final });
  resizeActive = null;
}

/* ============================================================= */
/* ===== 15. Window resize (reclamp columns) ================== */
/* ============================================================= */

function handleWindowResize() {
  if (window.innerWidth < 1024) return;
  const ws = document.getElementById("workspace").getBoundingClientRect().width;
  const handleWidth = 12;
  let colInput = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--col-input"),
  );
  let colResults = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--col-results",
    ),
  );
  const minCenter = 400;

  // If total exceeds available, shrink proportionally
  const totalFixed = colInput + colResults + handleWidth;
  if (totalFixed + minCenter > ws) {
    const excess = totalFixed + minCenter - ws;
    // Shrink results first (typically more space), then input
    const resultsMin =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--col-results-min",
        ),
      ) || 340;
    const inputMin =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--col-input-min",
        ),
      ) || 260;
    const resultsGiveUp = Math.min(excess, colResults - resultsMin);
    colResults -= resultsGiveUp;
    const remaining = excess - resultsGiveUp;
    if (remaining > 0) {
      const inputGiveUp = Math.min(remaining, colInput - inputMin);
      colInput -= inputGiveUp;
    }
    document.documentElement.style.setProperty("--col-input", colInput + "px");
    document.documentElement.style.setProperty(
      "--col-results",
      colResults + "px",
    );
  }
}

/* ============================================================= */
/* ===== 16. Event wiring ===================================== */
/* ============================================================= */

function wireEvents() {
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => toggleRingFilter(chip.dataset.ring));
  });
  document
    .getElementById("filter-clear")
    .addEventListener("click", clearFilters);

  document.querySelectorAll(".q-corner").forEach((corner) => {
    corner.addEventListener("click", () => toggleQuadFilter(corner.dataset.q));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pinnedFieldId) {
      pinnedFieldId = null;
      renderInspector(null);
      highlightInspect(null, false);
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".map-container") &&
      !e.target.closest(".inspector") &&
      !e.target.closest(".field-tag")
    ) {
      if (pinnedFieldId) {
        pinnedFieldId = null;
        renderInspector(null);
        highlightInspect(null, false);
      }
    }
  });

  // Decision textarea autosave
  document.getElementById("inp").addEventListener("input", (e) => {
    decisionText = e.target.value;
    saveState({ decision: e.target.value });
  });

  // Window resize (reclamp)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleWindowResize, 120);
  });
}

/* ============================================================= */
/* ===== 17. Restore on load ================================== */
/* ============================================================= */

function restoreState() {
  const s = loadState();

  // Layout
  if (s.colInput)
    document.documentElement.style.setProperty(
      "--col-input",
      s.colInput + "px",
    );
  if (s.colResults)
    document.documentElement.style.setProperty(
      "--col-results",
      s.colResults + "px",
    );
  if (s.inputCollapsed)
    document.getElementById("app").classList.add("input-collapsed");

  // Decision
  if (s.decision) {
    decisionText = s.decision;
    document.getElementById("inp").value = s.decision;
  }

  // Analysis exists → full results view
  if (s.analysis && s.questions) {
    lastQuestions = s.questions;
    lastAnalysis = s.analysis;
    showStep2(s.questions);
    if (s.answers) {
      s.answers.forEach((a, i) => {
        const el = document.getElementById(`ans${i + 1}`);
        if (el) el.value = a || "";
      });
    }
    document.getElementById("btn2Text").textContent = "Erneut analysieren";
    document.getElementById("app").setAttribute("data-mode", "results");
    applyActivation(s.analysis);
    render(s.analysis);
    setResultStatus("active", "Abgeschlossen");
  }
  // Questions exist but no analysis → step 2
  else if (s.questions) {
    lastQuestions = s.questions;
    showStep2(s.questions);
    if (s.answers) {
      s.answers.forEach((a, i) => {
        const el = document.getElementById(`ans${i + 1}`);
        if (el) el.value = a || "";
      });
    }
    setResultStatus("", "Warten");
  }

  updateHeaderReset();
}

/* ============================================================= */
/* ===== 18. Boot ============================================= */
/* ============================================================= */

build();
wireEvents();
initResize();
restoreState();
handleWindowResize();
