import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Voice from './pages/Voice'
import Report from './pages/Report'
import FamilyRisk from './pages/FamilyRisk'
import Emergency from './pages/Emergency'
import Wellness from './pages/Wellness'
import HealthTimeMachine from './pages/HealthTimeMachine'

function CustomCursor() {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX - 6 + 'px'
        cursorRef.current.style.top = e.clientY - 6 + 'px'
      }
      if (followerRef.current) {
        followerRef.current.style.left = e.clientX - 18 + 'px'
        followerRef.current.style.top = e.clientY - 18 + 'px'
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/report" element={<Report />} />
          <Route path="/family-risk" element={<FamilyRisk />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/health-time-machine" element={<HealthTimeMachine />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <CustomCursor />
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </LanguageProvider>
  )
}
