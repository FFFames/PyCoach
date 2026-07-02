const path = require("path");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "PyCoach";
pptx.subject = "FDE & AI Research Engineer Practical Assessment";
pptx.title = "PyCoach — Adaptive Python Practice";
pptx.company = "Beyond Education Group practical assessment";
pptx.lang = "en-US";
pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial", lang: "en-US" };

const C = {
  ink: "17221B",
  paper: "F6F8F2",
  moss: "295B3B",
  lime: "C7F36B",
  clay: "EF6A47",
  muted: "607067",
  white: "FFFFFF",
  line: "DCE5D8",
  soft: "EAF0E5"
};

const asset = (name) => path.resolve(__dirname, "assets", name);

pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: C.paper },
  objects: [
    { line: { x: 0.45, y: 7.1, w: 12.4, h: 0, line: { color: C.line, width: 1 } } },
    {
      text: {
        text: "PYCOACH  /  SHALOM INCHOI",
        options: {
          x: 0.55, y: 7.18, w: 5.8, h: 0.16,
          fontFace: "Arial", fontSize: 6.5, bold: true, color: "587060",
          charSpacing: 1.4, margin: 0
        }
      }
    },
    {
      text: {
        text: "03 JUL 2026",
        options: {
          x: 11.7, y: 7.18, w: 1.05, h: 0.16,
          fontFace: "Arial", fontSize: 6.5, bold: true, color: "587060",
          align: "right", margin: 0
        }
      }
    }
  ],
  slideNumber: { x: 12.8, y: 7.18, color: "587060", fontFace: "Arial", fontSize: 6.5 }
});

function slide() {
  return pptx.addSlide("MASTER");
}

function title(s, kicker, heading, sub) {
  s.addText(kicker.toUpperCase(), {
    x: 0.65, y: 0.48, w: 4.8, h: 0.2,
    fontSize: 8, bold: true, color: C.moss, charSpacing: 2, margin: 0
  });
  s.addText(heading, {
    x: 0.65, y: 0.78, w: 11.9, h: 0.7,
    fontSize: 30, bold: true, color: C.ink, margin: 0, fit: "shrink"
  });
  if (sub) {
    s.addText(sub, {
      x: 0.67, y: 1.52, w: 11.2, h: 0.38,
      fontSize: 12, color: C.muted, margin: 0, fit: "shrink"
    });
  }
}

function card(s, x, y, w, h, fill = C.white) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.14,
    fill: { color: fill },
    line: { color: C.line, width: 1 }
  });
}

function pill(s, text, x, y, w, fill = C.lime, color = C.ink) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34,
    rectRadius: 0.16,
    fill: { color: fill },
    line: { color: fill }
  });
  s.addText(text, {
    x, y: y + 0.085, w, h: 0.12,
    fontSize: 7.5, bold: true, color, align: "center", margin: 0, charSpacing: 0.7
  });
}

function bulletList(s, items, x, y, w, fontSize = 12, color = C.muted, gap = 0.5) {
  items.forEach((item, index) => {
    s.addText(`• ${item}`, {
      x, y: y + index * gap, w, h: 0.34,
      fontSize, color, margin: 0, fit: "shrink"
    });
  });
}

// 1 — cover
{
  const s = slide();
  s.background = { color: C.ink };
  s.addText("PYCOACH", {
    x: 0.7, y: 0.6, w: 3, h: 0.25,
    fontSize: 11, bold: true, color: C.lime, charSpacing: 2, margin: 0
  });
  s.addText("Python clicks\nwhen you build it.", {
    x: 0.7, y: 1.35, w: 7.8, h: 2.2,
    fontSize: 48, bold: true, color: C.white, margin: 0, fit: "shrink"
  });
  s.addText("Adaptive practice, immediate feedback, and an instructor-ready view of learning.", {
    x: 0.75, y: 3.85, w: 6.8, h: 0.65,
    fontSize: 17, color: "C7D0C9", margin: 0, fit: "shrink"
  });
  pill(s, "FDE + AI RESEARCH ENGINEER", 0.75, 5.05, 2.25, C.clay, C.white);
  pill(s, "DEPLOYED MVP", 3.18, 5.05, 1.4, C.lime, C.ink);
  s.addShape(pptx.ShapeType.arc, {
    x: 8.6, y: 0.65, w: 4.2, h: 4.2,
    adjustPoint: 0.25, rotate: 20,
    line: { color: C.lime, width: 3, transparency: 20 },
    fill: { color: C.ink, transparency: 100 }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.25, y: 2.0, w: 4.2, h: 3.85,
    rectRadius: 0.2, fill: { color: "20372A" }, line: { color: "3D5D49", width: 1 }
  });
  s.addText("def is_palindrome(text):\n    clean = text.lower()\n    return clean == clean[::-1]\n\nprint(is_palindrome(input()))", {
    x: 8.62, y: 2.55, w: 3.5, h: 1.9,
    fontFace: "Courier New", fontSize: 13, color: "DDF3C6", margin: 0, fit: "shrink"
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.62, y: 4.65, w: 3.45, h: 0.55,
    rectRadius: 0.1, fill: { color: C.lime }, line: { color: C.lime }
  });
  s.addText("✓  All tests passed", {
    x: 8.85, y: 4.84, w: 3, h: 0.16,
    fontSize: 10, bold: true, color: C.ink, margin: 0
  });
}

// 2 — product
{
  const s = slide();
  title(s, "The product", "One learning loop. Two clear surfaces.", "Students get immediate coaching and mastery updates; instructors get cohort signal without digging through raw submission noise.");

  const cols = [
    ["01", "Practice", "Open a focused Python assignment, write code in Monaco, and grade it in place."],
    ["02", "Reflect", "See score, feedback, mistakes, hint, mastery change, and the recommended next step."],
    ["03", "Review", "Instructors see one row per student, then drill into mastery and submission history."]
  ];

  cols.forEach((c, i) => {
    const x = 0.68 + i * 4.18;
    card(s, x, 2.25, 3.75, 2.2);
    s.addText(c[0], { x: x + 0.25, y: 2.5, w: 0.5, h: 0.3, fontSize: 12, bold: true, color: C.clay, margin: 0 });
    s.addText(c[1], { x: x + 0.25, y: 2.98, w: 3.15, h: 0.42, fontSize: 24, bold: true, color: C.ink, margin: 0 });
    s.addText(c[2], { x: x + 0.25, y: 3.57, w: 3.15, h: 0.65, fontSize: 11.5, color: C.muted, margin: 0, fit: "shrink" });
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.68, y: 4.85, w: 12.0, h: 1.4,
    rectRadius: 0.16, fill: { color: C.ink }, line: { color: C.ink }
  });
  s.addText("AUTH", { x: 1.05, y: 5.15, w: 1.1, h: 0.18, fontSize: 8, bold: true, color: C.lime, charSpacing: 1.5, margin: 0 });
  s.addText("Email/password login, student self-signup, and clearly labeled demo accounts", {
    x: 2.05, y: 5.08, w: 4.7, h: 0.36, fontSize: 13, bold: true, color: C.white, margin: 0, fit: "shrink"
  });
  s.addText("RECOMMENDATION", { x: 7.05, y: 5.15, w: 1.8, h: 0.18, fontSize: 8, bold: true, color: C.clay, charSpacing: 1.5, margin: 0 });
  s.addText("Start here → next unattempted skill → weakest mastery after evidence exists", {
    x: 8.55, y: 5.08, w: 3.6, h: 0.38, fontSize: 13, bold: true, color: C.white, margin: 0, fit: "shrink"
  });
}

// 3 — screens
{
  const s = slide();
  title(s, "Built, not mocked", "The current product surface", "Screens below come from the deployed app and reflect the latest login, student, and instructor flows.");
  card(s, 0.68, 2.0, 6.3, 4.9, C.white);
  card(s, 7.25, 2.0, 2.55, 3.02, C.white);
  card(s, 10.05, 2.0, 2.45, 1.5, C.white);
  card(s, 10.05, 3.72, 2.45, 1.84, C.white);
  s.addImage({ path: asset("student-dashboard.png"), x: 0.82, y: 2.13, w: 6.02, h: 4.32 });
  s.addImage({ path: asset("login-signup.png"), x: 7.43, y: 2.12, w: 2.19, h: 2.63 });
  s.addImage({ path: asset("instructor-dashboard.png"), x: 10.19, y: 2.15, w: 2.18, h: 1.31 });
  s.addImage({ path: asset("student-detail.png"), x: 10.19, y: 3.88, w: 2.18, h: 1.57 });
  pill(s, "STUDENT DASHBOARD", 0.92, 6.4, 1.58, C.lime, C.ink);
  pill(s, "LOGIN + SIGNUP", 7.72, 5.18, 1.28, C.clay, C.white);
  pill(s, "INSTRUCTOR DETAIL", 10.22, 5.72, 1.45, C.lime, C.ink);
}

// 4 — architecture
{
  const s = slide();
  title(s, "Architecture", "A deliberately small MVP surface", "One Next.js codebase, Supabase for auth and persistence, and Groq for fast grading feedback.");
  const nodes = [
    { x: 0.85, t: "Browser", d: "Next.js App Router\nMonaco editor", c: C.white },
    { x: 4.65, t: "Route handlers", d: "Grade · mastery\nrecommendations", c: C.soft },
    { x: 8.45, t: "Supabase", d: "Auth · PostgreSQL\nRLS policies", c: C.white }
  ];
  nodes.forEach((n) => {
    card(s, n.x, 2.35, 3.1, 1.65, n.c);
    s.addText(n.t, { x: n.x + 0.25, y: 2.68, w: 2.6, h: 0.35, fontSize: 21, bold: true, color: C.ink, margin: 0 });
    s.addText(n.d, { x: n.x + 0.25, y: 3.22, w: 2.55, h: 0.55, fontSize: 11.5, color: C.muted, margin: 0, fit: "shrink" });
  });
  s.addShape(pptx.ShapeType.chevron, { x: 4.05, y: 2.93, w: 0.38, h: 0.45, fill: { color: C.clay }, line: { color: C.clay } });
  s.addShape(pptx.ShapeType.chevron, { x: 7.85, y: 2.93, w: 0.38, h: 0.45, fill: { color: C.clay }, line: { color: C.clay } });

  card(s, 4.65, 4.67, 3.1, 1.25, C.ink);
  s.addText("Groq LLM grader", { x: 4.95, y: 4.95, w: 2.5, h: 0.3, fontSize: 17, bold: true, color: C.white, margin: 0, align: "center" });
  s.addText("Assignment + tests + rubric + reference solution", { x: 4.95, y: 5.34, w: 2.5, h: 0.25, fontSize: 9, color: "C8D2CB", margin: 0, align: "center", fit: "shrink" });

  pill(s, "CURRENT MVP", 8.82, 4.82, 1.2, C.lime, C.ink);
  bulletList(s, [
    "No arbitrary Python runs inside Next.js or the browser",
    "Grading uses prompt-based evaluation with strict JSON output checks"
  ], 8.82, 5.23, 3.45, 10.5, C.muted, 0.4);
}

// 5 — grading
{
  const s = slide();
  title(s, "Auto-grading", "Prompted for correctness, completeness, and useful feedback", "Current MVP uses Groq with richer grading context; deterministic execution is the production upgrade.");
  s.addImage({ path: asset("assignment-workspace.png"), x: 0.68, y: 2.0, w: 7.3, h: 3.85 });
  bulletList(s, [
    "Prompt includes title, description, skill, starter code, public tests, hidden tests, rubric, and backend-only reference solution",
    "The grader is asked to check every required branch or case, not just the easiest visible example",
    "If syntax issues and missing logic both exist, feedback should mention both",
    "Output must be valid JSON before any grade is saved"
  ], 8.35, 2.35, 4.0, 11.5, C.muted, 0.65);
  pill(s, "PRODUCTION UPGRADE", 8.55, 5.58, 1.8, C.clay, C.white);
  s.addText("Deterministic sandbox execution plus LLM explanation remains future work, not a current claim.", {
    x: 10.55, y: 5.6, w: 2.0, h: 0.5, fontSize: 10.5, color: C.ink, bold: true, margin: 0, fit: "shrink"
  });
}

// 6 — personalization
{
  const s = slide();
  title(s, "Personalization", "BKT is simple, interpretable, and honest about sparse data", "The UI hides the 0.30 prior until a skill has evidence, then recommends what to do next based on observed work.");
  card(s, 0.68, 2.0, 3.8, 3.45, C.white);
  card(s, 4.72, 2.0, 3.8, 3.45, C.white);
  s.addImage({ path: asset("mastery-passed.png"), x: 0.85, y: 2.13, w: 3.46, h: 3.01 });
  s.addImage({ path: asset("mastery-failed.png"), x: 4.89, y: 2.13, w: 3.46, h: 3.01 });

  const params = [["P(L₀)", "0.30"], ["P(T)", "0.12"], ["P(G)", "0.20"], ["P(S)", "0.10"]];
  params.forEach((p, i) => {
    const x = 8.75 + (i % 2) * 1.85;
    const y = 2.18 + Math.floor(i / 2) * 1.05;
    card(s, x, y, 1.62, 0.84);
    s.addText(p[0], { x: x + 0.16, y: y + 0.21, w: 0.68, h: 0.18, fontSize: 9, bold: true, color: C.moss, margin: 0 });
    s.addText(p[1], { x: x + 0.9, y: y + 0.1, w: 0.46, h: 0.28, fontSize: 16, bold: true, color: C.ink, align: "right", margin: 0 });
  });

  card(s, 8.55, 4.22, 4.55, 2.15, C.white);
  s.addText("Recommendation behavior", {
    x: 8.82, y: 4.52, w: 2.4, h: 0.18,
    fontSize: 8, bold: true, color: C.clay, charSpacing: 1.2, margin: 0
  });
  bulletList(s, [
    "Brand new student: start with Variables",
    "Partially attempted path: recommend the next\nunattempted concept",
    "All skills attempted: recommend the weakest mastery",
    "Score below 80 after grading: retry the same\nassignment first"
  ], 8.82, 4.88, 3.9, 8.5, C.muted, 0.35);
}

// 7 — evidence and handoff
{
  const s = slide();
  title(s, "Evidence & handoff", "What is real today, and what comes next", "The app is deployed, tested through build, and documented with clear next steps for production hardening.");
  const checks = [
    ["LIVE", "Vercel app"],
    ["AUTH", "login + signup"],
    ["GRADE", "Groq + rubric"],
    ["OVERVIEW", "instructor drill-down"]
  ];
  checks.forEach((c, i) => {
    const x = 0.68 + i * 3.02;
    card(s, x, 2.1, 2.7, 1.35);
    s.addText(c[0], { x: x + 0.2, y: 2.38, w: 2.3, h: 0.42, fontSize: 24, bold: true, color: i % 2 ? C.clay : C.moss, align: "center", margin: 0 });
    s.addText(c[1].toUpperCase(), { x: x + 0.2, y: 2.97, w: 2.3, h: 0.16, fontSize: 7.5, bold: true, color: C.muted, align: "center", charSpacing: 1, margin: 0 });
  });
  s.addText("Research basis", { x: 0.72, y: 4.0, w: 2.2, h: 0.3, fontSize: 20, bold: true, color: C.ink, margin: 0 });
  s.addText("Corbett & Anderson (1995)  ·  Open PDF via ACT-R archive\nPardos & Heffernan (2010)  ·  Open PDF via WPI archive\nPiech et al. (2015)  ·  Deep Knowledge Tracing (arXiv:1506.05908)", {
    x: 0.72, y: 4.55, w: 6.45, h: 1.05, fontSize: 12, color: C.muted, margin: 0, fit: "shrink"
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.65, y: 4.0, w: 4.55, h: 1.55,
    rectRadius: 0.15, fill: { color: C.lime }, line: { color: C.lime }
  });
  s.addText("NEXT", { x: 7.98, y: 4.3, w: 0.75, h: 0.17, fontSize: 8, bold: true, color: C.moss, charSpacing: 1.5, margin: 0 });
  s.addText("Add deterministic sandbox execution, per-test feedback, and calibrated BKT from real learner sequences.", {
    x: 7.98, y: 4.68, w: 3.9, h: 0.52, fontSize: 16, bold: true, color: C.ink, margin: 0, fit: "shrink"
  });
}

pptx.writeFile({ fileName: path.resolve(__dirname, "..", "PyCoach_Assessment_Deck.pptx") });
