import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Mic, FileText, Users, Zap, Activity, Shield, Heart, ChevronDown, CheckCircle } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import './Home.css'

function HeartbeatLine() {
  return (
    <div className="heartbeat-container">
      <svg viewBox="0 0 800 80" className="heartbeat-svg" preserveAspectRatio="none">
        <motion.path
          d="M0,40 L120,40 L150,40 L160,10 L175,70 L190,5 L205,75 L220,40 L260,40 L800,40"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
        />
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="#00c896" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function FadeIn({ children, delay = 0, x = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

const toolIcons = [
  { icon: <Mic size={26} />, color: '#00c896', link: '/voice' },
  { icon: <FileText size={26} />, color: '#0ea5e9', link: '/report' },
  { icon: <Users size={26} />, color: '#7c3aed', link: '/family-risk' },
  { icon: <Zap size={26} />, color: '#ef4444', link: '/emergency' },
  { icon: <Activity size={26} />, color: '#f59e0b', link: '/wellness' },
  { icon: <Shield size={26} />, color: '#10b981', link: '/dashboard' },
]

const whyIcons = [
  <Mic size={24} />, <CheckCircle size={24} />, <Shield size={24} />,
  <Heart size={24} />, <FileText size={24} />, <Zap size={24} />
]

export default function Home() {
  const { t } = useLang()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  const stats = [
    { value: t.stat1val, label: t.stat1label },
    { value: t.stat2val, label: t.stat2label },
    { value: t.stat3val, label: t.stat3label },
    { value: t.stat4val, label: t.stat4label },
  ]

  const whyItems = [
    { title: t.why1title, desc: t.why1desc },
    { title: t.why2title, desc: t.why2desc },
    { title: t.why3title, desc: t.why3desc },
    { title: t.why4title, desc: t.why4desc },
    { title: t.why5title, desc: t.why5desc },
    { title: t.why6title, desc: t.why6desc },
  ]

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-orb orb3" />

        <motion.div className="hero-content" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div className="section-tag" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Heart size={14} fill="currentColor" /> {t.heroTag}
          </motion.div>

          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            {t.heroTitle1}
            <br />
            <span className="gradient-text">{t.heroTitle2}</span>
          </motion.h1>

          <motion.p className="hero-sub" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {t.heroSub}
          </motion.p>

          <motion.div className="hero-btns" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Link to="/voice" className="btn-primary"><Mic size={18} /> {t.btnSpeak}</Link>
            <Link to="/report" className="btn-outline"><FileText size={18} /> {t.btnUpload}</Link>
          </motion.div>

          <HeartbeatLine />

          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            {stats.map((s, i) => (
              <div key={i} className="hero-stat">
                <span className="stat-value gradient-text">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="scroll-hint" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── PROBLEM + SOLUTION ── */}
      <section className="problem-section">
        <div className="problem-inner">
          <FadeIn x={-40}>
            <div className="problem-card">
              <div className="problem-icon">⚠️</div>
              <h2>{t.problemTitle}</h2>
              <p>{t.problemDesc}</p>
            </div>
          </FadeIn>
          <FadeIn x={40} delay={0.15}>
            <div className="solution-card">
              <div className="problem-icon">💡</div>
              <h2>{t.solutionTitle}</h2>
              <p>{t.solutionDesc}</p>
              <div className="tool-icons-row">
                {toolIcons.map((item, i) => (
                  <Link key={i} to={item.link} className="tool-icon-btn" style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <FadeIn>
          <div className="section-center-header">
            <h2>{t.howTitle}</h2>
            <p>{t.howSub}</p>
          </div>
        </FadeIn>
        <div className="steps-row">
          {[
            { num: '01', title: t.step1title, desc: t.step1desc },
            { num: '02', title: t.step2title, desc: t.step2desc },
            { num: '03', title: t.step3title, desc: t.step3desc },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-connector" />
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── WHY KUSHALAYU ── */}
      <section className="why-section">
        <FadeIn>
          <div className="section-center-header">
            <h2>{t.whyTitle}</h2>
            <p>{t.whySub}</p>
          </div>
        </FadeIn>
        <div className="why-grid">
          {whyItems.map((w, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="why-card">
                <div className="why-icon">{whyIcons[i]}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-icon"><Heart size={18} fill="currentColor" /></div>
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>
              Kushal<span className="logo-accent">Ayu</span>
            </span>
          </div>
          <p>{t.footerBuilt}</p>
          <p className="footer-disclaimer">{t.footerDisclaimer}</p>
        </div>
      </footer>

    </div>
  )
}
