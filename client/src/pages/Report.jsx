import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, Loader, CheckCircle, ArrowLeft, X, AlertCircle, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './Report.css'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
const MAX_SIZE_MB = 10

export default function Report() {
  const { lang, t } = useLang()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validateAndSet = (f) => {
    setError(null)
    setResult(null)
    if (!f) return

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError(lang === 'hi'
        ? '❌ केवल PDF, JPG, PNG फ़ाइलें स्वीकार की जाती हैं।'
        : '❌ Only PDF, JPG, PNG files are accepted.')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(lang === 'hi'
        ? `❌ फ़ाइल का आकार ${MAX_SIZE_MB}MB से कम होना चाहिए।`
        : `❌ File size must be less than ${MAX_SIZE_MB}MB.`)
      return
    }
    setFile(f)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('report', file)
      formData.append('lang', lang)

      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'NOT_MEDICAL') {
          setError(data.message)
          setFile(null)
        } else if (data.error === 'INVALID_TYPE') {
          setError(lang === 'hi'
            ? '❌ अमान्य फ़ाइल प्रकार। केवल PDF, JPG, PNG अपलोड करें।'
            : '❌ Invalid file type. Upload only PDF, JPG, or PNG.')
          setFile(null)
        } else {
          setError(lang === 'hi'
            ? '❌ विश्लेषण विफल हुआ। कृपया पुनः प्रयास करें।'
            : '❌ Analysis failed. Please try again.')
        }
        setLoading(false)
        return
      }

      setResult(data.analysis)
    } catch {
      setError(lang === 'hi'
        ? '❌ सर्वर से कनेक्ट नहीं हो सका। सुनिश्चित करें कि backend चल रहा है।'
        : '❌ Could not connect to server. Make sure the backend is running.')
    }
    setLoading(false)
  }

  const statusColor = (s) => s === 'low' ? '#ef4444' : s === 'high' ? '#f59e0b' : '#00c896'
  const statusLabel = (s) => {
    if (lang === 'hi') return s === 'normal' ? '✓ सामान्य' : s === 'low' ? '↓ कम' : '↑ अधिक'
    return s === 'normal' ? '✓ Normal' : s === 'low' ? '↓ Low' : '↑ High'
  }

  const urgencyBadge = (u) => {
    if (!u) return null
    const map = {
      urgent: { en: '🚨 Urgent — See doctor immediately', hi: '🚨 तत्काल — तुरंत डॉक्टर से मिलें', color: '#ef4444' },
      soon: { en: '⚠️ See a doctor within a few days', hi: '⚠️ कुछ दिनों में डॉक्टर से मिलें', color: '#f59e0b' },
      routine: { en: '✅ Routine — Follow up at next checkup', hi: '✅ सामान्य — अगली जांच पर फॉलो-अप करें', color: '#00c896' },
    }
    const badge = map[u]
    if (!badge) return null
    return (
      <div className="urgency-badge" style={{ borderColor: badge.color, color: badge.color, background: `${badge.color}12` }}>
        {badge[lang]}
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-orb orb-blue" />
      <div className="page-orb orb-green" />

      <div className="page-container" style={{ maxWidth: 900 }}>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag"><FileText size={14} /> {t.reports}</div>
          <h1><span className="gradient-text">{t.reportTitle}</span></h1>
          <p>{t.reportSub}</p>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertTriangle size={18} />
              <p>{error}</p>
              <button onClick={() => setError(null)}><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="upload-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          {!file ? (
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); validateAndSet(e.dataTransfer.files[0]) }}
              onClick={() => inputRef.current.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={e => validateAndSet(e.target.files[0])} />
              <div className="upload-icon"><Upload size={36} /></div>
              <h3>{t.reportDrop}</h3>
              <p>{t.reportFormats}</p>
              <div className="upload-note">
                <AlertCircle size={14} />
                {lang === 'hi'
                  ? 'केवल मेडिकल रिपोर्ट, लैब रिपोर्ट, X-Ray, प्रिस्क्रिप्शन स्वीकार किए जाते हैं'
                  : 'Only medical reports, lab reports, X-rays, prescriptions accepted'}
              </div>
              <button className="btn-outline" style={{ marginTop: 16 }}>{t.reportChoose}</button>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-info">
                <FileText size={32} color="var(--secondary)" />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB · {file.type.split('/')[1].toUpperCase()}</p>
                </div>
                <button className="remove-btn" onClick={() => { setFile(null); setResult(null); setError(null) }}><X size={18} /></button>
              </div>
              {!result && (
                <button className="btn-primary" onClick={analyze} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? <><Loader size={16} className="spin" /> {t.reportAnalyzing}</>
                    : <><FileText size={16} /> {t.reportAnalyze}</>}
                </button>
              )}
              {loading && (
                <div className="loading-bar" style={{ marginTop: 8 }}>
                  <motion.div className="loading-fill" initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 4 }} />
                </div>
              )}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div className="result-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="result-header">
                <CheckCircle size={22} color="var(--primary)" />
                <h2>{t.reportComplete}</h2>
                {result.reportType && (
                  <span className="report-type-badge">{result.reportType}</span>
                )}
              </div>

              {urgencyBadge(result.urgency)}

              <div className="result-summary">
                <label>{t.reportSummary}</label>
                <p>{result.summary}</p>
              </div>

              {result.findings && result.findings.length > 0 && (
                <div className="findings-grid">
                  {result.findings.map((f, i) => (
                    <motion.div
                      key={i}
                      className="finding-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ '--fc': statusColor(f.status) }}
                    >
                      <div className="finding-top">
                        <span className="finding-label">{f.label}</span>
                        <span className="finding-status" style={{ color: statusColor(f.status), background: `${statusColor(f.status)}18` }}>
                          {statusLabel(f.status)}
                        </span>
                      </div>
                      <div className="finding-value" style={{ color: statusColor(f.status) }}>{f.value}</div>
                      <div className="finding-normal">{lang === 'hi' ? 'सामान्य' : 'Normal'}: {f.normal}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {result.nextSteps && result.nextSteps.length > 0 && (
                <div className="next-steps">
                  <label>{t.reportNextSteps}</label>
                  <ul>
                    {result.nextSteps.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="disclaimer-box">{t.reportDisclaimer}</div>

              <button
                className="btn-outline"
                onClick={() => { setFile(null); setResult(null) }}
                style={{ marginTop: 8, fontSize: 13, padding: '10px 24px' }}
              >
                {lang === 'hi' ? 'नई रिपोर्ट अपलोड करें' : 'Upload Another Report'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
