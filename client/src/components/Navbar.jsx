import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { lang, toggle, t } = useLang()

  const links = [
    { to: '/', label: t.home },
    { to: '/voice', label: t.voice },
    { to: '/report', label: t.reports },
    { to: '/family-risk', label: t.familyRisk },
    { to: '/wellness', label: t.wellness },
    { to: '/health-time-machine', label: lang === 'hi' ? '⏳ टाइम मशीन' : '⏳ Time Machine' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Link to="/" className="nav-logo">
        <motion.div
          className="logo-icon"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart size={20} fill="currentColor" />
        </motion.div>
        <span>Kushal<span className="logo-accent">Ayu</span></span>
      </Link>

      <ul className="nav-links">
        {links.map(l => (
          <li key={l.to}>
            <Link to={l.to} className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}>
              {l.label}
              {location.pathname === l.to && (
                <motion.div className="nav-underline" layoutId="underline" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <button className="lang-toggle" onClick={toggle} title="Switch Language">
          <span className={lang === 'hi' ? 'lang-active' : ''}>हि</span>
          <span className="lang-divider">|</span>
          <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
        </button>
        <Link to="/emergency" className="btn-primary nav-cta">
          🚨 {t.sos}
        </Link>
      </div>

      <button className="hamburger" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`mobile-link ${location.pathname === l.to ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
            <div className="mobile-bottom">
              <button className="lang-toggle" onClick={toggle}>
                <span className={lang === 'hi' ? 'lang-active' : ''}>हिंदी</span>
                <span className="lang-divider">|</span>
                <span className={lang === 'en' ? 'lang-active' : ''}>English</span>
              </button>
              <Link to="/emergency" className="btn-primary">🚨 {t.sos}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
