"use client";
import { useState, useEffect } from "react";
// ============================================================
// FinanceHub — World-Class Landing Page
// app/page.tsx — Complete Rebuild
// 13 Sections · Premium · Editorial · All Features Displayed
// ============================================================
const TRACKS = [
  { code:"PF", name:"Personal Finance",   icon:"💰", color:"#0E6163", bg:"#F0F9F7", desc:"Budgeting, saving, tax, insurance, retirement — the essentials no school taught.", lessons:45, quizzes:12, level:"Beginner → Advanced" },
  { code:"TM", name:"Trading & Markets",  icon:"📈", color:"#185FA5", bg:"#EEF4FB", desc:"From reading a chart to running a full trading strategy — three complete levels.", lessons:52, quizzes:14, level:"Beginner → Advanced" },
  { code:"CF", name:"Corporate Finance",  icon:"🏢", color:"#7C3AED", bg:"#F4F0FE", desc:"Valuation, M&A, fundraising, unit economics — for founders and finance careers.", lessons:38, quizzes:10, level:"Intermediate → Advanced" },
  { code:"CR", name:"Crypto & DeFi",      icon:"₿",  color:"#0891B2", bg:"#EEF8FB", desc:"Blockchain, DeFi protocols, wallets, paper trading — without the hype.", lessons:28, quizzes:8,  level:"Beginner → Advanced" },
  { code:"BF", name:"Behavioral Finance", icon:"🧠", color:"#B45309", bg:"#FEF7EC", desc:"Why smart people make bad money decisions — and how to stop.", lessons:24, quizzes:6,  level:"Beginner → Intermediate" },
  { code:"TA", name:"Technical Analysis", icon:"📊", color:"#0F766E", bg:"#F0FAFA", desc:"Charts, indicators, candlesticks — read the market with confidence.", lessons:36, quizzes:9,  level:"Intermediate → Advanced" },
  { code:"FX", name:"Forex & Currencies", icon:"💱", color:"#1D4ED8", bg:"#EEF2FF", desc:"Currency markets, FEMA, carry trades, hedging — the global money layer.", lessons:22, quizzes:6,  level:"Intermediate → Advanced" },
  { code:"HI", name:"हिंदी Finance",      icon:"🇮🇳", color:"#B91C1C", bg:"#FEF2F2", desc:"Personal finance and investing explained simply — in Hindi.", lessons:13, quizzes:4,  level:"Beginner" },
];
const FEATURES = [
  { icon:"📖", name:"Structured Lessons",  desc:"320+ lessons across 8 tracks. Clear explanations with India-specific examples, cited sources and key takeaways.",  stat:"320+ lessons" },
  { icon:"▶️", name:"Video Library",       desc:"82 curated playlists from trusted Indian and global educators. Organised by topic so you can learn by watching.",   stat:"82 playlists" },
  { icon:"📚", name:"Resource Library",    desc:"Books, PDFs, research papers and guides. FinanceHub-created and authorised external resources in one place.",      stat:"50+ resources" },
  { icon:"🧮", name:"Finance Lab",         desc:"9 interactive simulators — SIP, EMI, tax, retirement, net worth, goal planning, Forex and crypto paper trading.",   stat:"9 simulators" },
  { icon:"🤖", name:"AI Mentor",           desc:"Ask anything. Get India-specific answers with RBI/SEBI sources cited. Personalised to your learning history.",       stat:"24/7 available" },
  { icon:"📝", name:"Digital Rough Book",  desc:"Take notes while you learn. Cloud-synced across all your devices. Organise, highlight and revisit.",               stat:"Your notes" },
  { icon:"🏆", name:"XP & Leagues",        desc:"Earn XP for every lesson. Compete in weekly leagues — Bronze to Master. Daily streaks keep you consistent.",         stat:"5 league tiers" },
  { icon:"🎓", name:"Certificates",        desc:"Complete a track, earn a verified certificate with a unique ID. Share on LinkedIn directly from your profile.",      stat:"Verifiable" },
];
const SIMULATORS = [
  { name:"SIP Calculator",      icon:"📈", desc:"See compound interest work on your exact numbers", color:"#0E6163" },
  { name:"EMI Calculator",      icon:"🏠", desc:"Plan any loan — home, car, personal", color:"#185FA5" },
  { name:"Tax Comparison",      icon:"💰", desc:"Old vs new regime — find which saves you more", color:"#7C3AED" },
  { name:"Retirement Planner",  icon:"🌅", desc:"How much corpus do you need?", color:"#B45309" },
  { name:"Net Worth Tracker",   icon:"💎", desc:"Assets minus liabilities — your true financial score", color:"#0891B2" },
  { name:"Goal Planner",        icon:"🎯", desc:"SIP needed for home, education, travel — inflation adjusted", color:"#0F766E" },
  { name:"Forex Paper Trade",   icon:"💱", desc:"Trade currency pairs with simulated money", color:"#1D4ED8" },
  { name:"Crypto Paper Trade",  icon:"₿",  desc:"Build a crypto portfolio — no real money", color:"#B91C1C" },
  { name:"Compound Visualiser", icon:"📊", desc:"Watch ₹5,000/month grow over 30 years", color:"#0E6163" },
];
const AUDIENCES = [
  { icon:"🎓", label:"Student",           desc:"Money basics, budgeting, savings, first investments. Build the right habits early.", track:"Personal Finance", lessons:22 },
  { icon:"💼", label:"Working Adult",     desc:"SIP, EMI, tax filing, mutual funds, insurance. The financial independence toolkit.", track:"Personal Finance", lessons:28 },
  { icon:"📈", label:"Investor",          desc:"Markets, equity analysis, portfolio management, behavioural traps to avoid.", track:"Trading & Markets", lessons:35 },
  { icon:"📊", label:"Trader",            desc:"Technical analysis, charts, risk management, derivatives and strategy.", track:"Technical Analysis", lessons:36 },
  { icon:"🚀", label:"Founder",           desc:"Cash flow, valuation, fundraising, cap tables, unit economics.", track:"Corporate Finance", lessons:24 },
  { icon:"📝", label:"Exam Aspirant",     desc:"Structured learning for finance certifications and competitive exams.", track:"All Tracks", lessons:45 },
];
const FAQS = [
  { q:"Is FinanceHub really free?",              a:"Yes. You can access 100+ lessons across all tracks, 5 AI Mentor questions per day, quizzes, and simulators — completely free. No credit card required." },
  { q:"Do I need prior finance knowledge?",      a:"Not at all. Every track starts from absolute zero. The Personal Finance Beginner track assumes you know nothing about money." },
  { q:"How does the AI Mentor work?",            a:"The AI knows your completed lessons, your weak areas and your primary track. It answers questions in India-specific context, cites RBI/SEBI/AMFI sources and never gives investment advice — only education." },
  { q:"Are the simulators using real money?",    a:"No. All simulators use fictional/simulated amounts. They exist to help you understand financial concepts — not to trade or invest real money." },
  { q:"Can I get a certificate?",                a:"Yes. Complete all lessons in a track and a verified certificate is generated automatically with a unique ID. You can add it to LinkedIn directly." },
  { q:"Is the content available in Hindi?",      a:"Yes. We have a growing Hindi Finance track with 13+ lessons covering personal finance, investing and tax — explained simply in Hindi." },
  { q:"What payment methods do you accept?",     a:"Razorpay (UPI, cards, net banking, EMI) for Indian users and Stripe for international users." },
  { q:"Can I cancel my subscription anytime?",   a:"Yes. Cancel anytime from your account settings. No lock-in, no questions asked." },
];
const QUIZ_STEPS = [
  { q:"Who are you?", key:"who", opts:[
    { label:"🎓 Student",         val:"student" },
    { label:"💼 Working Adult",   val:"adult" },
    { label:"📈 Investor",        val:"investor" },
    { label:"📊 Trader",          val:"trader" },
    { label:"🚀 Founder",         val:"founder" },
    { label:"📝 Exam Aspirant",   val:"exam" },
  ]},
  { q:"What is your main goal?", key:"goal", opts:[
    { label:"Stop living paycheck to paycheck",  val:"basics" },
    { label:"Start investing confidently",       val:"invest" },
    { label:"Learn trading and markets",         val:"trade" },
    { label:"Understand my business finances",   val:"business" },
    { label:"Pass a finance exam",               val:"exam" },
  ]},
  { q:"How much do you know already?", key:"level", opts:[
    { label:"Almost nothing",          val:"zero" },
    { label:"I know the basics",       val:"basic" },
    { label:"Intermediate — I've started", val:"mid" },
    { label:"Advanced — I want depth", val:"adv" },
  ]},
];
const PATHS: Record<string,{track:string;level:string;desc:string}> = {
  student:   { track:"Personal Finance",    level:"Absolute Beginner", desc:"Start with money basics — saving, budgeting and compound interest." },
  adult:     { track:"Personal Finance",    level:"Working Adult",     desc:"SIP, mutual funds, tax, insurance and building wealth." },
  investor:  { track:"Trading & Markets",   level:"Markets 101",       desc:"Equity investing, fundamentals and portfolio management." },
  trader:    { track:"Technical Analysis",  level:"Intermediate",      desc:"Charts, indicators, risk management and trading psychology." },
  founder:   { track:"Corporate Finance",   level:"Business Basics",   desc:"Unit economics, valuation, fundraising and cap tables." },
  exam:      { track:"All Tracks",          level:"Structured",        desc:"Systematic coverage aligned with finance certification syllabi." },
};
export default function HomePage() {
  const [activeAudience, setActiveAudience] = useState(0);
  const [quizStep,       setQuizStep]       = useState(0);
  const [answers,        setAnswers]        = useState<Record<string,string>>({});
  const [quizDone,       setQuizDone]       = useState(false);
  const [openFaq,        setOpenFaq]        = useState<number|null>(null);
  const [mobileMenu,     setMobileMenu]     = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleAnswer = (key:string, val:string) => {
    const next = { ...answers, [key]:val };
    setAnswers(next);
    if (quizStep < QUIZ_STEPS.length - 1) setQuizStep(s => s+1);
    else setQuizDone(true);
  };
  const path = PATHS[answers.who] || PATHS.adult;
  const S = {
    // Section wrappers
    white:   { background:"#ffffff", padding:"100px 0" } as React.CSSProperties,
    soft:    { background:"#F7F9F8", padding:"100px 0" } as React.CSSProperties,
    navy:    { background:"#0B1A2B", padding:"100px 0" } as React.CSSProperties,
    teal:    { background:"#F0F9F7", padding:"100px 0" } as React.CSSProperties,
    // Container
    container: { maxWidth:1160, margin:"0 auto", padding:"0 32px" } as React.CSSProperties,
    // Eyebrow
    eyebrow: { fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#0E6163", marginBottom:14, display:"block" as const },
    // Headings
    h1: { fontSize:"clamp(42px,5.5vw,68px)", fontWeight:700, lineHeight:1.08, letterSpacing:"-2px", color:"#0B1A2B", margin:"0 0 24px" } as React.CSSProperties,
    h2: { fontSize:"clamp(30px,3.5vw,46px)", fontWeight:700, lineHeight:1.12, letterSpacing:"-1px", color:"#0B1A2B", margin:"0 0 16px" } as React.CSSProperties,
    h2w:{ fontSize:"clamp(30px,3.5vw,46px)", fontWeight:700, lineHeight:1.12, letterSpacing:"-1px", color:"#ffffff", margin:"0 0 16px" } as React.CSSProperties,
    body: { fontSize:17, color:"#526173", lineHeight:1.75, margin:"0 0 32px", maxWidth:580 } as React.CSSProperties,
    bodyw:{ fontSize:17, color:"rgba(255,255,255,0.65)", lineHeight:1.75, margin:"0 0 32px", maxWidth:580 } as React.CSSProperties,
  };
  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", color:"#0B1A2B", background:"#ffffff" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin:0; }
        a { text-decoration:none; color:inherit; }
        button { font-family:inherit; cursor:pointer; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .hero-in { animation: fadeUp 0.7s ease both; }
        .hero-in-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .hero-in-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .card-hover:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(11,26,43,0.1); }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .faq-item:hover { background:#F7F9F8; }
        @media(max-width:768px){
          .hide-mobile { display:none!important; }
          .grid-2 { grid-template-columns:1fr!important; }
          .grid-3 { grid-template-columns:1fr!important; }
          .grid-4 { grid-template-columns:1fr 1fr!important; }
          .hero-grid { grid-template-columns:1fr!important; }
        }
      `}</style>
      {/* ── 1. NAVIGATION ─────────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:200,
        background: scrolled ? "rgba(255,255,255,0.97)" : "#ffffff",
        borderBottom:`1px solid ${scrolled ? "#e5eaf0" : "transparent"}`,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition:"all 0.25s",
        padding:"0 32px",
      }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          {/* Logo */}
          <a href="/" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:9,
              background:"linear-gradient(135deg,#0E6163,#1D9E75)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 8px rgba(14,97,99,0.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="10" width="3" height="8" rx="1" fill="rgba(255,255,255,0.6)"/>
                <rect x="7" y="6"  width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)"/>
                <rect x="12" y="2" width="3" height="16" rx="1" fill="#fff"/>
                <path d="M2 12 L7 8 L12 4 L17 2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <circle cx="17" cy="2" r="1.5" fill="#fff"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.3px", lineHeight:1, color:"#0B1A2B" }}>
                Finance<span style={{ color:"#0E6163" }}>Hub</span>
              </div>
              <div style={{ fontSize:9, fontWeight:600, color:"#a0aec0", letterSpacing:"0.08em", textTransform:"uppercase", lineHeight:1 }}>
                of India
              </div>
            </div>
          </a>
          {/* Nav links */}
          <div className="hide-mobile" style={{ display:"flex", gap:32, fontSize:14, fontWeight:500, color:"#526173" }}>
            {[["Tracks","#tracks"],["Finance Lab","#lab"],["Library","#library"],["AI Mentor","#ai"],["Pricing","#pricing"]].map(([l,h]) => (
              <a key={l} href={h} style={{ color:"#526173", transition:"color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="#0B1A2B")}
                onMouseLeave={e=>(e.currentTarget.style.color="#526173")}>{l}</a>
            ))}
          </div>
          {/* CTAs */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <a href="/login" className="hide-mobile" style={{ padding:"7px 16px", fontSize:13, fontWeight:500, color:"#526173", border:"1px solid #e5eaf0", borderRadius:8, background:"transparent" }}>
              Log in
            </a>
            <a href="/signup" style={{ padding:"8px 18px", fontSize:13, fontWeight:600, background:"#0B1A2B", color:"#fff", borderRadius:8, border:"none" }}>
              Start free
            </a>
          </div>
        </div>
      </nav>
      {/* ── 2. HERO ───────────────────────────────────────────────── */}
      <section style={{ ...S.white, padding:"80px 0 0", overflow:"hidden" }}>
        <div style={{ ...S.container }}>
          {/* Badge */}
          <div className="hero-in" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F0F9F7", border:"1px solid #B7E4D8", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color:"#0E6163", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#1D9E75", display:"inline-block" }}/>
            Free to start · Built for India · No credit card needed
          </div>
          {/* Two-column hero */}
          <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:48, alignItems:"flex-start" }}>
            <div>
              <h1 className="hero-in-2" style={{
                fontFamily:"'Playfair Display', serif",
                fontSize:"clamp(44px,5.5vw,72px)",
                fontWeight:800,
                lineHeight:1.05,
                letterSpacing:"-2.5px",
                color:"#0B1A2B",
                margin:"0 0 24px",
              }}>
                Master Finance.<br/>
                <span style={{ color:"#0E6163" }}>Shape Your Future.</span>
              </h1>
              <p className="hero-in-2" style={{ fontSize:18, color:"#526173", lineHeight:1.75, margin:"0 0 36px", maxWidth:520 }}>
                Learn personal finance, investing, trading, corporate finance, crypto and forex — through structured lessons, AI-powered guidance, interactive simulators and curated resources. In Hindi and English.
              </p>
              <div className="hero-in-3" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40 }}>
                <a href="/signup" style={{
                  padding:"13px 28px", fontSize:15, fontWeight:600,
                  background:"#0E6163", color:"#fff",
                  borderRadius:10, border:"none",
                  boxShadow:"0 4px 16px rgba(14,97,99,0.3)",
                }}>
                  Start Learning Free →
                </a>
                <a href="/explore" style={{
                  padding:"13px 28px", fontSize:15, fontWeight:500,
                  background:"transparent", color:"#0B1A2B",
                  borderRadius:10, border:"1.5px solid #d1dbe6",
                }}>
                  Explore Curriculum
                </a>
              </div>
              {/* Capability chips */}
              <div className="hero-in-3" style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:40 }}>
                {["Learn","Watch","Read","Practice","Simulate","Ask AI","Earn Certificates","Track Progress"].map(c => (
                  <span key={c} style={{ fontSize:12, fontWeight:500, color:"#526173", background:"#F7F9F8", border:"1px solid #e5eaf0", borderRadius:20, padding:"4px 12px" }}>{c}</span>
                ))}
              </div>
            </div>
            {/* Stats panel */}
            <div className="hero-in-3 hide-mobile" style={{
              background:"#F7F9F8",
              border:"1px solid #e5eaf0",
              borderRadius:20,
              padding:32,
              marginTop:8,
            }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#0E6163", marginBottom:20 }}>Platform at a glance</div>
              {[
                { val:"320+",  label:"Published lessons",          icon:"📖" },
                { val:"8",     label:"Learning tracks",            icon:"🗺️" },
                { val:"9",     label:"Finance simulators",         icon:"🧮" },
                { val:"82",    label:"Curated video playlists",    icon:"▶️" },
                { val:"50+",   label:"AI questions answered daily",icon:"🤖" },
                { val:"13",    label:"Hindi lessons",              icon:"🇮🇳" },
                { val:"5",     label:"League tiers (Bronze→Master)",icon:"🏆" },
                { val:"Free",  label:"Core content, always",       icon:"✅" },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #eef0f2" }}>
                  <span style={{ fontSize:18, width:28, textAlign:"center" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:18, fontWeight:700, color:"#0B1A2B", lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:12, color:"#718096", marginTop:2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Stats bar — mobile visible */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)",
            borderTop:"1px solid #e5eaf0", marginTop:16,
          }}>
            {[
              { val:"320+", label:"Lessons" },
              { val:"8",    label:"Tracks" },
              { val:"9",    label:"Simulators" },
              { val:"Free", label:"Core content" },
            ].map((s,i) => (
              <div key={s.label} style={{
                padding:"20px 16px", textAlign:"center",
                borderRight: i<3 ? "1px solid #e5eaf0" : "none",
              }}>
                <div style={{ fontSize:24, fontWeight:700, color:"#0B1A2B", letterSpacing:"-0.5px" }}>{s.val}</div>
                <div style={{ fontSize:12, color:"#8a9ab0", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── 3. WHO IT'S FOR ───────────────────────────────────────── */}
      <section id="who" style={S.soft}>
        <div style={S.container}>
          <span style={S.eyebrow}>Who it is for</span>
          <h2 style={S.h2}>Finance knowledge for every stage of life</h2>
          <p style={{ ...S.body, marginBottom:40 }}>
            Whether you're just starting out or deep in advanced markets — FinanceHub has a structured path for you.
          </p>
          {/* Audience tabs */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
            {AUDIENCES.map((a,i) => (
              <button key={i} onClick={() => setActiveAudience(i)}
                style={{
                  padding:"9px 18px", fontSize:13, fontWeight: activeAudience===i ? 600 : 400,
                  borderRadius:20, border: activeAudience===i ? "1.5px solid #0E6163" : "1px solid #d1dbe6",
                  background: activeAudience===i ? "#F0F9F7" : "#ffffff",
                  color: activeAudience===i ? "#0E6163" : "#526173",
                  transition:"all 0.15s",
                }}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
          {/* Active audience card */}
          <div style={{
            background:"#ffffff", border:"1px solid #e5eaf0",
            borderRadius:16, padding:"28px 32px",
            display:"flex", gap:24, alignItems:"flex-start", flexWrap:"wrap",
          }}>
            <div style={{ fontSize:48 }}>{AUDIENCES[activeAudience].icon}</div>
            <div style={{ flex:1, minWidth:240 }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#0B1A2B", marginBottom:8 }}>{AUDIENCES[activeAudience].label}</div>
              <div style={{ fontSize:15, color:"#526173", lineHeight:1.7, marginBottom:16 }}>{AUDIENCES[activeAudience].desc}</div>
              <div style={{ display:"flex", gap:16, fontSize:13, color:"#718096" }}>
                <span>📚 {AUDIENCES[activeAudience].lessons} lessons</span>
                <span>🗺️ {AUDIENCES[activeAudience].track}</span>
              </div>
            </div>
            <a href="/explore" style={{
              padding:"10px 20px", background:"#0E6163", color:"#fff",
              borderRadius:9, fontSize:13, fontWeight:600, flexShrink:0,
              alignSelf:"center",
            }}>
              See curriculum →
            </a>
          </div>
        </div>
      </section>
      {/* ── 4. WHY FINANCEHUB ─────────────────────────────────────── */}
      <section style={S.white}>
        <div style={S.container}>
          <span style={S.eyebrow}>Why FinanceHub</span>
          <h2 style={S.h2}>Built differently. For a reason.</h2>
          <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, marginTop:40 }}>
            {[
              { title:"Simple",      icon:"✦", desc:"Complex finance explained in plain language with India-specific examples — not textbook jargon." },
              { title:"Practical",   icon:"✦", desc:"Learn by doing. Simulators, quizzes, notes, case studies and AI exercises that apply knowledge." },
              { title:"Visual",      icon:"✦", desc:"Videos, charts, knowledge maps and interactive diagrams — because some things need to be seen." },
              { title:"Structured",  icon:"✦", desc:"Always know what to learn next. Clear tracks, levels, prerequisites and adaptive recommendations." },
              { title:"Trusted",     icon:"✦", desc:"Every lesson cites RBI, SEBI, AMFI or NSE. No opinions masquerading as facts." },
              { title:"For India",   icon:"✦", desc:"₹ examples, Indian tax law, SEBI regulations, RBI policy — built from the ground up for India." },
            ].map((w,i) => (
              <div key={i} className="card-hover" style={{
                background:"#ffffff", border:"1px solid #e5eaf0",
                borderRadius:14, padding:"28px 24px",
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#0E6163", letterSpacing:"0.1em", marginBottom:10 }}>0{i+1}</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#0B1A2B", marginBottom:10 }}>{w.title}</div>
                <div style={{ fontSize:14, color:"#526173", lineHeight:1.7 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── 5. EIGHT LEARNING TRACKS ──────────────────────────────── */}
      <section id="tracks" style={S.soft}>
        <div style={S.container}>
          <span style={S.eyebrow}>Learning Tracks</span>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, gap:20, flexWrap:"wrap" }}>
            <div>
              <h2 style={{ ...S.h2, margin:0 }}>Eight tracks.<br/>One complete finance education.</h2>
            </div>
            <a href="/explore" style={{ fontSize:14, fontWeight:600, color:"#0E6163", flexShrink:0 }}>View all tracks →</a>
          </div>
          <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {TRACKS.map((t,i) => (
              <a key={i} href={`/tracks/${t.code.toLowerCase()}`} className="card-hover" style={{
                display:"block",
                background:"#ffffff", border:"1px solid #e5eaf0",
                borderRadius:14, overflow:"hidden",
                textDecoration:"none",
              }}>
                {/* Accent top */}
                <div style={{ height:4, background:t.color }} />
                <div style={{ padding:"20px 18px" }}>
                  {/* Icon + code */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <span style={{ fontSize:26 }}>{t.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:t.color, background:t.bg, padding:"2px 8px", borderRadius:8, letterSpacing:"0.05em" }}>{t.code}</span>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#0B1A2B", marginBottom:8, lineHeight:1.3 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:"#526173", lineHeight:1.6, marginBottom:14 }}>{t.desc}</div>
                  <div style={{ display:"flex", gap:12, fontSize:11, color:"#8a9ab0", marginBottom:16 }}>
                    <span>📖 {t.lessons} lessons</span>
                    <span>🎯 {t.quizzes} quizzes</span>
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:t.color }}>{t.level}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* ── 6. COMPLETE PLATFORM FEATURES ────────────────────────── */}
      <section style={S.navy}>
        <div style={S.container}>
          <span style={{ ...S.eyebrow, color:"#4ECDC4" }}>Everything you need</span>
          <h2 style={S.h2w}>One platform.<br/>The complete finance learning system.</h2>
          <p style={{ ...S.bodyw, marginBottom:48 }}>
            Not just lessons. A complete ecosystem built around how people actually learn and retain financial knowledge.
          </p>
          <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {FEATURES.map((f,i) => (
              <div key={i} className="card-hover" style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:14, padding:"24px 20px",
              }}>
                <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#ffffff", marginBottom:8 }}>{f.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:14 }}>{f.desc}</div>
                <div style={{ fontSize:11, fontWeight:600, color:"#4ECDC4" }}>{f.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── 7. FINANCE LAB ────────────────────────────────────────── */}
      <section id="lab" style={S.teal}>
        <div style={S.container}>
          <span style={S.eyebrow}>Finance Lab</span>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, gap:20, flexWrap:"wrap" }}>
            <div>
              <h2 style={{ ...S.h2, margin:0 }}>Don't just learn finance.<br/>Experience it.</h2>
              <p style={{ fontSize:16, color:"#526173", margin:"12px 0 0" }}>9 interactive simulators. Simulated money. Zero risk. Real insight.</p>
            </div>
            <a href="/practice" style={{ fontSize:14, fontWeight:600, color:"#0E6163", flexShrink:0 }}>Explore Finance Lab →</a>
          </div>
          <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {SIMULATORS.map((s,i) => (
              <a key={i} href="/practice" className="card-hover" style={{
                display:"flex", alignItems:"flex-start", gap:14,
                background:"#ffffff", border:"1px solid #e5eaf0",
                borderRadius:12, padding:"18px 16px",
                textDecoration:"none",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:`${s.color}15`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#0B1A2B", marginBottom:4 }}>{s.name}</div>
                  <div style={{ fontSize:12, color:"#718096", lineHeight:1.5 }}>{s.desc}</div>
                </div>
              </a>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:32, fontSize:13, color:"#718096" }}>
            Simulated only — no real money involved
          </div>
        </div>
      </section>
      {/* ── 8. LIBRARY & RESOURCES ───────────────────────────────── */}
      <section id="library" style={S.white}>
        <div style={S.container}>
          <span style={S.eyebrow}>Library & Resources</span>
          <h2 style={S.h2}>More than just lessons</h2>
          <p style={{ ...S.body }}>Videos, books, research, PDFs and guides — organised and curated by FinanceHub.</p>
          <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {[
              { icon:"▶️", title:"Video Library",    desc:"82 curated YouTube playlists from India's trusted finance educators — organised by track and topic.", count:"82 playlists",   color:"#B91C1C", href:"/library" },
              { icon:"📚", title:"Book Library",      desc:"30+ classic and modern finance books with summaries, key takeaways and chapter notes.",              count:"30+ books",      color:"#854F0B", href:"/library" },
              { icon:"📄", title:"PDFs & Guides",     desc:"FinanceHub-created study sheets, cheat sheets, formula guides and downloadable notes.",               count:"Download free",  color:"#0E6163", href:"/library" },
              { icon:"🗞️", title:"Research & Reports",desc:"RBI circulars, SEBI guidelines, AMFI data and institutional research — all in one place.",            count:"Official sources", color:"#185FA5", href:"/library" },
            ].map((r,i) => (
              <a key={i} href={r.href} className="card-hover" style={{
                display:"block",
                background:"#ffffff", border:"1px solid #e5eaf0",
                borderRadius:14, padding:"24px 20px",
                textDecoration:"none",
              }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{r.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#0B1A2B", marginBottom:8 }}>{r.title}</div>
                <div style={{ fontSize:13, color:"#526173", lineHeight:1.7, marginBottom:14 }}>{r.desc}</div>
                <div style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.count}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* ── 9. AI MENTOR ─────────────────────────────────────────── */}
      <section id="ai" style={S.soft}>
        <div style={S.container}>
          <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
            {/* Left */}
            <div>
              <span style={S.eyebrow}>AI Mentor</span>
              <h2 style={S.h2}>Your finance questions<br/>don't need to wait.</h2>
              <p style={{ fontSize:16, color:"#526173", lineHeight:1.75, marginBottom:24 }}>
                Ask FinanceHub AI to explain a concept, quiz you, simplify a complex topic or guide you through your learning path — with India-specific context and cited sources.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {[
                  "Explain compound interest with a ₹5,000 SIP example",
                  "What is the difference between ELSS and PPF?",
                  "How does the new income tax regime compare for ₹12 lakh salary?",
                  "Quiz me on personal finance basics",
                ].map(q => (
                  <div key={q} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#ffffff", border:"1px solid #e5eaf0", borderRadius:9, fontSize:13, color:"#526173" }}>
                    <span style={{ color:"#0E6163", fontSize:14 }}>→</span> {q}
                  </div>
                ))}
              </div>
              <a href="/ai-tutor" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"12px 24px", background:"#0B1A2B", color:"#fff",
                borderRadius:10, fontSize:14, fontWeight:600,
              }}>
                🤖 Meet FinanceHub AI →
              </a>
              <div style={{ fontSize:12, color:"#8a9ab0", marginTop:12 }}>5 free questions/day · No sign-in required to try</div>
            </div>
            {/* Right — chat mockup */}
            <div style={{
              background:"#0B1A2B", borderRadius:20,
              padding:24, boxShadow:"0 24px 60px rgba(11,26,43,0.15)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#0E6163,#1D9E75)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>FinanceHub AI Mentor</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>India-specific · Source-cited · Safe</div>
                </div>
                <div style={{ marginLeft:"auto", fontSize:11, background:"#1D9E75", color:"#fff", padding:"2px 8px", borderRadius:10, fontWeight:600 }}>5/5 free</div>
              </div>
              {[
                { role:"user", msg:"What is a SIP and how does compound interest work?" },
                { role:"ai",   msg:"A SIP (Systematic Investment Plan) lets you invest a fixed amount monthly into a mutual fund. The magic is compound interest — your returns earn returns.\n\nExample: ₹5,000/month at 12% p.a. for 20 years = ₹49.9 lakh. You invested just ₹12 lakh.\n\n[Source: AMFI India — amfiindia.com]" },
              ].map((m,i) => (
                <div key={i} style={{ marginBottom:12, display:"flex", flexDirection: m.role==="user" ? "row-reverse" : "row", gap:8 }}>
                  <div style={{
                    maxWidth:"85%", padding:"10px 14px",
                    background: m.role==="user" ? "#0E6163" : "rgba(255,255,255,0.07)",
                    borderRadius: m.role==="user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                    fontSize:13, color: m.role==="user" ? "#fff" : "rgba(255,255,255,0.8)",
                    lineHeight:1.6, whiteSpace:"pre-line",
                  }}>
                    {m.msg}
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <div style={{ flex:1, background:"rgba(255,255,255,0.07)", borderRadius:9, padding:"10px 14px", fontSize:13, color:"rgba(255,255,255,0.3)" }}>Ask anything about finance…</div>
                <div style={{ width:36, height:36, background:"#0E6163", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>→</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── 10. PERSONALISED PATH (QUIZ) ─────────────────────────── */}
      <section id="quiz" style={S.white}>
        <div style={S.container}>
          <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
            <span style={S.eyebrow}>Personalised Path</span>
            <h2 style={S.h2}>Not sure where to start?</h2>
            <p style={{ fontSize:16, color:"#526173", marginBottom:40 }}>
              Answer 3 quick questions. FinanceHub builds your exact starting path.
            </p>
            <div style={{ background:"#F7F9F8", border:"1px solid #e5eaf0", borderRadius:20, padding:36, textAlign:"left" }}>
              {!quizDone ? (
                <>
                  {/* Progress */}
                  <div style={{ display:"flex", gap:6, marginBottom:28 }}>
                    {QUIZ_STEPS.map((_,i) => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=quizStep ? "#0E6163" : "#e5eaf0", transition:"background 0.3s" }} />
                    ))}
                  </div>
                  <div style={{ fontSize:12, color:"#8a9ab0", marginBottom:8 }}>Question {quizStep+1} of {QUIZ_STEPS.length}</div>
                  <div style={{ fontSize:18, fontWeight:600, color:"#0B1A2B", marginBottom:20 }}>{QUIZ_STEPS[quizStep].q}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {QUIZ_STEPS[quizStep].opts.map((opt,i) => (
                      <button key={i} onClick={() => handleAnswer(QUIZ_STEPS[quizStep].key, opt.val)}
                        style={{
                          padding:"12px 16px", fontSize:14, textAlign:"left",
                          border:"1.5px solid #e5eaf0", borderRadius:10,
                          background:"#ffffff", color:"#0B1A2B", fontWeight:500,
                          transition:"all 0.15s",
                        }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#0E6163"; e.currentTarget.style.background="#F0F9F7"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor="#e5eaf0"; e.currentTarget.style.background="#ffffff"; }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#0E6163", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Your recommended path</div>
                  <div style={{ fontSize:22, fontWeight:700, color:"#0B1A2B", marginBottom:6 }}>{path.track}</div>
                  <div style={{ fontSize:14, color:"#0E6163", fontWeight:600, marginBottom:14 }}>Starting level: {path.level}</div>
                  <p style={{ fontSize:14, color:"#526173", lineHeight:1.7, marginBottom:24 }}>{path.desc}</p>
                  <div style={{ display:"flex", gap:10 }}>
                    <a href="/signup" style={{ flex:1, display:"block", textAlign:"center", padding:"12px", background:"#0E6163", color:"#fff", borderRadius:10, fontSize:14, fontWeight:600 }}>
                      Start this path — it's free
                    </a>
                    <button onClick={() => { setQuizStep(0); setAnswers({}); setQuizDone(false); }}
                      style={{ padding:"12px 18px", fontSize:13, background:"#fff", border:"1px solid #d1dbe6", borderRadius:10, color:"#526173" }}>
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ── 11. PRICING ──────────────────────────────────────────── */}
      <section id="pricing" style={S.soft}>
        <div style={S.container}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <span style={S.eyebrow}>Pricing</span>
            <h2 style={S.h2}>Start free. Upgrade when ready.</h2>
            <p style={{ fontSize:16, color:"#526173" }}>Core content is always free. Premium unlocks the full depth.</p>
          </div>
          <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, maxWidth:960, margin:"0 auto", alignItems:"start" }}>
            {[
              {
                name:"Free", price:"₹0", period:"forever",
                badge:null,
                features:[
                  "100+ beginner lessons (all tracks)",
                  "5 AI Mentor questions per day",
                  "SIP, EMI and Tax simulators",
                  "Community Q&A access",
                  "Progress tracking and streaks",
                  "Quiz practice (3 per track)",
                ],
                cta:"Start Free", ctaStyle:{ background:"#ffffff", color:"#0B1A2B", border:"1.5px solid #d1dbe6" },
                href:"/signup",
              },
              {
                name:"Pro", price:"₹499", period:"/month",
                badge:"Recommended",
                features:[
                  "All 320+ lessons across every track",
                  "Unlimited AI Mentor questions",
                  "All 9 Finance Lab simulators",
                  "PDF downloads and offline notes",
                  "Verified certificates on completion",
                  "Weekly leagues and leaderboard",
                  "Video library (82 playlists)",
                  "Priority support",
                ],
                cta:"Start 7-day Trial", ctaStyle:{ background:"#0E6163", color:"#ffffff", border:"none" },
                href:"/signup?plan=pro",
              },
              {
                name:"Expert", price:"₹999", period:"/month",
                badge:null,
                features:[
                  "Everything in Pro",
                  "Advanced Trading track",
                  "Corporate Finance & Founder track",
                  "Forex and Crypto paper trading",
                  "Career preparation module",
                  "Premium labs (advanced simulators)",
                  "200 AI questions per day",
                  "1-on-1 AI-guided study sessions",
                ],
                cta:"Start 7-day Trial", ctaStyle:{ background:"#0B1A2B", color:"#ffffff", border:"none" },
                href:"/signup?plan=expert",
              },
            ].map((p,i) => (
              <div key={i} style={{
                background:"#ffffff",
                border: i===1 ? "2px solid #0E6163" : "1px solid #e5eaf0",
                borderRadius:16, padding:"28px 24px",
                position:"relative",
                boxShadow: i===1 ? "0 8px 32px rgba(14,97,99,0.12)" : "none",
              }}>
                {p.badge && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#0E6163", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, whiteSpace:"nowrap" }}>
                    {p.badge}
                  </div>
                )}
                <div style={{ fontSize:15, fontWeight:700, color:"#0B1A2B", marginBottom:8 }}>{p.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
                  <span style={{ fontSize:32, fontWeight:800, color:"#0B1A2B", letterSpacing:"-1px" }}>{p.price}</span>
                  <span style={{ fontSize:14, color:"#8a9ab0" }}>{p.period}</span>
                </div>
                <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:20, marginBottom:24 }}>
                  {p.features.map((f,j) => (
                    <div key={j} style={{ display:"flex", gap:10, marginBottom:10, fontSize:13, color:"#526173", alignItems:"flex-start" }}>
                      <span style={{ color:"#0E6163", fontWeight:700, flexShrink:0, marginTop:1 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href={p.href} style={{
                  display:"block", width:"100%", textAlign:"center",
                  padding:"12px", fontSize:14, fontWeight:600,
                  borderRadius:9, ...p.ctaStyle,
                  boxSizing:"border-box",
                }}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:28, fontSize:13, color:"#8a9ab0", display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap" }}>
            <span>💳 No credit card for free plan</span>
            <span>🔒 Secure payments via Razorpay & Stripe</span>
            <span>💰 7-day money-back guarantee</span>
            <span>❌ Cancel anytime</span>
          </div>
        </div>
      </section>
      {/* ── 12. FAQ ──────────────────────────────────────────────── */}
      <section style={S.white}>
        <div style={S.container}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <span style={S.eyebrow}>FAQ</span>
            <h2 style={S.h2}>Frequently asked questions</h2>
            {FAQS.map((faq,i) => (
              <div key={i} className="faq-item" style={{
                borderBottom:"1px solid #e5eaf0",
                padding:"0",
                cursor:"pointer",
                borderRadius: i===0 ? "12px 12px 0 0" : i===FAQS.length-1 ? "0 0 12px 12px" : 0,
                transition:"background 0.15s",
              }}
                onClick={() => setOpenFaq(openFaq===i ? null : i)}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px" }}>
                  <span style={{ fontSize:15, fontWeight:600, color:"#0B1A2B" }}>{faq.q}</span>
                  <span style={{ fontSize:18, color:"#0E6163", transition:"transform 0.2s", transform: openFaq===i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </div>
                {openFaq===i && (
                  <div style={{ padding:"0 20px 18px", fontSize:14, color:"#526173", lineHeight:1.75 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── 13. FINAL CTA ────────────────────────────────────────── */}
      <section style={{ ...S.navy, padding:"120px 0" }}>
        <div style={{ ...S.container, textAlign:"center" }}>
          <span style={{ ...S.eyebrow, color:"#4ECDC4", display:"block", textAlign:"center" }}>Ready to start</span>
          <h2 style={{
            fontFamily:"'Playfair Display', serif",
            fontSize:"clamp(36px,4.5vw,58px)",
            fontWeight:800, lineHeight:1.1, letterSpacing:"-1.5px",
            color:"#ffffff", margin:"0 0 20px",
          }}>
            Your financial education<br/>starts today.
          </h2>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.55)", maxWidth:480, margin:"0 auto 40px", lineHeight:1.75 }}>
            One concept. One lesson. One better financial decision at a time.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/signup" style={{
              padding:"14px 32px", fontSize:15, fontWeight:700,
              background:"#1D9E75", color:"#fff",
              borderRadius:10, border:"none",
              boxShadow:"0 4px 20px rgba(29,158,117,0.3)",
            }}>
              Start Learning Free →
            </a>
            <a href="/explore" style={{
              padding:"14px 32px", fontSize:15, fontWeight:500,
              background:"rgba(255,255,255,0.08)", color:"#fff",
              borderRadius:10, border:"1px solid rgba(255,255,255,0.15)",
            }}>
              Explore Curriculum
            </a>
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:20 }}>
            No prior knowledge required · Free forever · No credit card
          </div>
        </div>
      </section>
      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background:"#060E18", padding:"64px 0 32px" }}>
        <div style={S.container}>
          {/* Top grid */}
          <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:56 }}>
            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0E6163,#1D9E75)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="10" width="3" height="8" rx="1" fill="rgba(255,255,255,0.6)"/>
                    <rect x="7" y="6"  width="3" height="12" rx="1" fill="rgba(255,255,255,0.8)"/>
                    <rect x="12" y="2" width="3" height="16" rx="1" fill="#fff"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>Finance<span style={{ color:"#1D9E75" }}>Hub</span></div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>of India</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.75, maxWidth:240 }}>
                Master finance. Build confidence. Shape your future. Built in India for every learner.
              </p>
              <div style={{ marginTop:20, fontSize:11, color:"rgba(255,255,255,0.25)", lineHeight:1.6 }}>
                🇮🇳 Built in India. Designed for the world.
              </div>
            </div>
            {/* Learn */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>Learn</div>
              {["Personal Finance","Trading & Markets","Corporate Finance","Crypto & DeFi","Forex & Currencies","Technical Analysis","Behavioral Finance","हिंदी Finance"].map(l => (
                <a key={l} href="/explore" style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:10, transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>{l}</a>
              ))}
            </div>
            {/* Platform */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>Platform</div>
              {[["Finance Lab","/practice"],["AI Mentor","/ai-tutor"],["Video Library","/library"],["Book Library","/library"],["Knowledge Map","/knowledge-map"],["Glossary","/glossary"],["Leaderboard","/leaderboard"],["Certificates","/certificates"],["Daily Review","/review"]].map(([l,h]) => (
                <a key={l} href={h} style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:10, transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>{l}</a>
              ))}
            </div>
            {/* Legal */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>Legal</div>
              {[["Privacy Policy","/legal/privacy"],["Terms of Service","/legal/terms"],["Disclaimer","/legal/disclaimer"],["Refund Policy","/legal/refund"],["Contact","mailto:hello@financehub.in"],["Pricing","/pricing"]].map(([l,h]) => (
                <a key={l} href={h} style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:10, transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>{l}</a>
              ))}
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:28, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>
              © 2026 FinanceHub of India. All content is educational only — not investment advice.
            </div>
            <div style={{ display:"flex", gap:20 }}>
              {[["Privacy","/legal/privacy"],["Terms","/legal/terms"],["Disclaimer","/legal/disclaimer"]].map(([l,h]) => (
                <a key={l} href={h} style={{ fontSize:12, color:"rgba(255,255,255,0.25)", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.25)")}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}