import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Loader, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './Voice.css'

export default function Voice() {
  const { lang, t } = useLang()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const autoTimer = useRef(null)

  useEffect(() => {
    if (!listening && transcript.trim() && !result && !loading) {
      autoTimer.current = setTimeout(() => runAnalyze(transcript), 1200)
    }
    return () => clearTimeout(autoTimer.current)
  }, [listening, transcript])

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError(lang === 'hi' ? 'Chrome browser उपयोग करें।' : 'Please use Chrome browser.')
      return
    }
    const recognition = new SR()
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(text)
    }
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
    setResult(null)
    setTranscript('')
    setError(null)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const runAnalyze = async (text) => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: text, lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setResult(data)
    } catch (err) {
      setError(lang === 'hi'
        ? '❌ विश्लेषण विफल। सर्वर चल रहा है?'
        : '❌ Analysis failed. Is the server running?')
    }
    setLoading(false)
  }

  const speakWithPolly = async () => {
    if (!result) return
    const text = result.guidance || ''
    setSpeaking(true)
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        audioRef.current.onended = () => setSpeaking(false)
      }
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US'
      utterance.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const severityColor = (s) => s === 'severe' ? '#ef4444' : s === 'moderate' ? '#f59e0b' : '#00c896'
  const tips = [t.voiceTip1, t.voiceTip2, t.voiceTip3, t.voiceTip4]

  return (
    <div className="page-wrapper">
      <div className="page-orb orb-blue" />
      <div className="page-orb orb-green" />
      <audio ref={audioRef} hidden />

      <div className="page-container">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag"><Mic size={14} /> {t.voice}</div>
          <h1><span className="gradient-text">{t.voiceTitle}</span></h1>
          <p>{t.voiceSub}</p>
        </motion.div>

        <motion.div className="voice-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>

          {/* Mic */}
          <div className="mic-area">
            <motion.button
              className={`mic-btn ${listening ? 'active' : ''}`}
              onClick={listening ? stopListening : startListening}
              whileTap={{ scale: 0.95 }}
            >
              {listening && (<><div className="mic-ring ring1" /><div className="mic-ring ring2" /><div className="mic-ring ring3" /></>)}
              {listening ? <MicOff size={36} /> : <Mic size={36} />}
            </motion.button>
            <p className="mic-label">
              {listening ? t.voiceListening : loading ? t.voiceAnalyzing : t.voiceMicLabel}
            </p>
            {loading && <div className="analyzing-dots"><span /><span /><span /></div>}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div className="voice-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div className="transcript-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <label>{t.voiceYouSaid}</label>
                <p>"{transcript}"</p>
                {loading && (
                  <div className="loading-bar">
                    <motion.div className="loading-fill" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
                  </div>
                )}
                {!loading && !result && (
                  <button className="btn-primary" onClick={() => runAnalyze(transcript)} style={{ marginTop: 12 }}>
                    {t.voiceAnalyze}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div className="response-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {result.emergency && (
                  <div className="emergency-alert">
                    🚨 {lang === 'hi' ? 'आपातकाल — तुरंत 108 पर कॉल करें!' : 'EMERGENCY — Call 108 immediately!'}
                  </div>
                )}

                <div className="response-header">
                  <div>
                    <label>{t.voiceGuidance}</label>
                    {result.condition && (
                      <div className="condition-badge" style={{ color: severityColor(result.severity), background: `${severityColor(result.severity)}18` }}>
                        {result.condition} · {result.severity}
                      </div>
                    )}
                  </div>
                  <button className={`speak-btn ${speaking ? 'active' : ''}`} onClick={speakWithPolly}>
                    <Volume2 size={16} /> {speaking ? t.voiceSpeaking : t.voiceListen}
                  </button>
                </div>

                <p className="response-text">{result.guidance}</p>

                {result.homeRemedies?.length > 0 && (
                  <div className="remedies-box">
                    <label>{lang === 'hi' ? '🏠 घरेलू उपाय:' : '🏠 Home Remedies:'}</label>
                    <ul>{result.homeRemedies.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}

                {result.whenToSeeDoctor && (
                  <div className="doctor-box">
                    <label>{lang === 'hi' ? '👨‍⚕️ डॉक्टर से कब मिलें:' : '👨‍⚕️ When to see a doctor:'}</label>
                    <p>{result.whenToSeeDoctor}</p>
                  </div>
                )}

                <div className="disclaimer-box">{t.voiceDisclaimer}</div>

                <button className="btn-outline" onClick={() => { setTranscript(''); setResult(null) }} style={{ marginTop: 12, fontSize: 13, padding: '8px 20px' }}>
                  {lang === 'hi' ? 'नया लक्षण बताएं' : 'Check New Symptom'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Input */}
          <div className="manual-input">
            <label>{t.voiceOrType}</label>
            <textarea
              placeholder={t.voicePlaceholder}
              value={transcript}
              onChange={e => { setTranscript(e.target.value); setResult(null) }}
              rows={3}
            />
            {transcript && !loading && !result && (
              <button className="btn-primary" onClick={() => runAnalyze(transcript)} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                {t.voiceAnalyze}
              </button>
            )}
          </div>
        </motion.div>

        <motion.div className="tips-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {tips.map((tip, i) => (
            <div key={i} className="tip-card">
              <span className="tip-num">0{i + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
