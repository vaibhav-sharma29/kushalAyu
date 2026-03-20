import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Loader, ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './HealthTimeMachine.css'

const diseaseOptions = {
  en: ['Diabetes', 'Heart Disease', 'Hypertension', 'Obesity', 'Thyroid', 'Cancer', 'Kidney Disease', 'Asthma'],
  hi: ['मधुमेह', 'हृदय रोग', 'उच्च रक्तचाप', 'मोटापा', 'थायरॉइड', 'कैंसर', 'गुर्दे की बीमारी', 'अस्थमा']
}

// WHO Global Health Risk Factors Report 2023 — 6 modifiable risk factors
const QUESTIONS = {
  en: [
    {
      key: 'smoking',
      label: '🚬 Tobacco Use',
      sub: 'WHO Risk Factor #1 — Tobacco causes 8M deaths/year',
      yes: '🚬 Yes, I smoke/use tobacco',
      no: '✅ No, I don\'t',
      yesColor: 'active-red', noColor: 'active-green'
    },
    {
      key: 'exercise',
      label: '🏃 Physical Activity',
      sub: 'WHO recommends 150 min/week moderate activity',
      yes: '🏃 Yes, I exercise regularly',
      no: '🛋️ No, mostly sedentary',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'diet',
      label: '🥗 Diet Quality',
      sub: 'WHO Risk Factor #3 — Unhealthy diet causes 11M deaths/year',
      yes: '🥗 Healthy (fruits, vegetables, whole grains)',
      no: '🍔 Mostly junk/processed/oily food',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'sleep',
      label: '😴 Sleep Duration',
      sub: 'WHO recommends 7–9 hours/night for adults',
      yes: '😴 7–9 hours (WHO recommended)',
      no: '⏰ Less than 6 hours',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'alcohol',
      label: '🍺 Alcohol Consumption',
      sub: 'WHO Risk Factor — No safe level of alcohol',
      yes: '🍺 Yes, I drink regularly',
      no: '✅ No / Rarely',
      yesColor: 'active-red', noColor: 'active-green'
    },
    {
      key: 'stress',
      label: '🧠 Stress Level',
      sub: 'WHO Mental Health Report — Chronic stress increases disease risk',
      yes: '😰 High stress (work/personal)',
      no: '😊 Low/manageable stress',
      yesColor: 'active-red', noColor: 'active-green'
    },
  ],
  hi: [
    {
      key: 'smoking',
      label: '🚬 तंबाकू सेवन',
      sub: 'WHO जोखिम कारक #1 — तंबाकू से 80 लाख मौतें/वर्ष',
      yes: '🚬 हाँ, धूम्रपान/तंबाकू करता/करती हूं',
      no: '✅ नहीं करता/करती',
      yesColor: 'active-red', noColor: 'active-green'
    },
    {
      key: 'exercise',
      label: '🏃 शारीरिक गतिविधि',
      sub: 'WHO: सप्ताह में 150 मिनट मध्यम व्यायाम अनुशंसित',
      yes: '🏃 हाँ, नियमित व्यायाम करता/करती हूं',
      no: '🛋️ नहीं, ज़्यादातर बैठे रहता/रहती हूं',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'diet',
      label: '🥗 खान-पान की गुणवत्ता',
      sub: 'WHO जोखिम कारक #3 — अस्वस्थ आहार से 1.1 करोड़ मौतें/वर्ष',
      yes: '🥗 स्वस्थ (फल, सब्ज़ियां, साबुत अनाज)',
      no: '🍔 ज़्यादातर जंक/तला-भुना खाना',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'sleep',
      label: '😴 नींद की अवधि',
      sub: 'WHO: वयस्कों के लिए 7–9 घंटे/रात अनुशंसित',
      yes: '😴 7–9 घंटे (WHO अनुशंसित)',
      no: '⏰ 6 घंटे से कम',
      yesColor: 'active-green', noColor: 'active-red'
    },
    {
      key: 'alcohol',
      label: '🍺 शराब का सेवन',
      sub: 'WHO: शराब का कोई सुरक्षित स्तर नहीं है',
      yes: '🍺 हाँ, नियमित पीता/पीती हूं',
      no: '✅ नहीं / कभी-कभी',
      yesColor: 'active-red', noColor: 'active-green'
    },
    {
      key: 'stress',
      label: '🧠 तनाव स्तर',
      sub: 'WHO मानसिक स्वास्थ्य रिपोर्ट — दीर्घकालिक तनाव बीमारी का जोखिम बढ़ाता है',
      yes: '😰 अधिक तनाव (काम/व्यक्तिगत)',
      no: '😊 कम/नियंत्रणीय तनाव',
      yesColor: 'active-red', noColor: 'active-green'
    },
  ]
}

export default function HealthTimeMachine() {
  const { lang, t } = useLang()

  const [form, setForm] = useState({
    age: '', gender: '', weight: '', height: '',
    smoking: null, exercise: null, diet: null,
    sleep: null, alcohol: null, stress: null,
    diseases: []
  })
  const [otherDisease, setOtherDisease] = useState('')
  const [showOther, setShowOther] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ageError, setAgeError] = useState('')

  const questions = QUESTIONS[lang]

  const toggleDisease = (d) => {
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d]
    }))
  }

  const allAnswered = questions.every(q => form[q.key] !== null)
  const canSubmit = form.age && form.gender && form.weight && form.height && allAnswered

  const analyze = async () => {
    const age = parseInt(form.age)
    if (!form.age || isNaN(age) || age < 1 || age > 100) {
      setAgeError(lang === 'hi' ? 'कृपया 1 से 100 के बीच सही आयु दर्ज करें' : 'Please enter a valid age between 1 and 100')
      return
    }
    setAgeError('')
    if (!canSubmit) return

    const allDiseases = [...form.diseases]
    if (otherDisease.trim()) allDiseases.push(otherDisease.trim())

    setLoading(true)
    try {
      const res = await fetch('/api/health-time-machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, diseases: allDiseases, lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setResult(data)
    } catch {
      alert(lang === 'hi' ? '❌ विश्लेषण विफल। सर्वर चल रहा है?' : '❌ Analysis failed. Is server running?')
    }
    setLoading(false)
  }

  const tx = {
    tag: lang === 'hi' ? 'AI स्वास्थ्य टाइम मशीन' : 'AI Health Time Machine',
    title: lang === 'hi' ? 'अपना भविष्य का स्वास्थ्य देखें' : 'See Your Future Health',
    sub: lang === 'hi' ? '10 साल बाद आपकी सेहत कैसी होगी — WHO के 6 जोखिम कारकों पर आधारित' : 'Your health in 10 years — based on WHO\'s 6 key risk factors',
    whoNote: lang === 'hi' ? '📊 WHO Global Health Risk Factors Report 2023 के अनुसार' : '📊 Based on WHO Global Health Risk Factors Report 2023',
    basicInfo: lang === 'hi' ? 'बुनियादी जानकारी' : 'Basic Information',
    riskFactors: lang === 'hi' ? 'WHO जोखिम कारक (सभी 6 ज़रूरी हैं)' : 'WHO Risk Factors (All 6 required)',
    family: lang === 'hi' ? 'पारिवारिक बीमारियां (वैकल्पिक)' : 'Family Diseases (Optional)',
    otherLabel: lang === 'hi' ? '+ अन्य' : '+ Other',
    otherPlaceholder: lang === 'hi' ? 'अन्य बीमारी का नाम लिखें...' : 'Type other disease name...',
    btn: lang === 'hi' ? 'मेरा भविष्य का स्वास्थ्य देखें' : 'Predict My Future Health',
    loading: lang === 'hi' ? 'आपका भविष्य विश्लेषण हो रहा है...' : 'Analyzing your future...',
    without: lang === 'hi' ? '😰 बिना बदलाव के (10 साल बाद)' : '😰 Without Changes (10 Years Later)',
    with: lang === 'hi' ? '💪 WHO योजना के साथ (10 साल बाद)' : '💪 With WHO Plan (10 Years Later)',
    advice: lang === 'hi' ? '🎯 आज से क्या करें' : '🎯 What To Do Starting Today',
    disclaimer: lang === 'hi' ? '⚕️ WHO Global Health Risk Factors Report 2023 पर आधारित AI भविष्यवाणी। यह चिकित्सा निदान नहीं है।' : '⚕️ AI prediction based on WHO Global Health Risk Factors Report 2023. Not a medical diagnosis.',
    age: lang === 'hi' ? 'आपकी उम्र' : 'Your Age',
    gender: lang === 'hi' ? 'लिंग' : 'Gender',
    weight: lang === 'hi' ? 'वज़न (kg)' : 'Weight (kg)',
    height: lang === 'hi' ? 'ऊंचाई (cm)' : 'Height (cm)',
    male: lang === 'hi' ? 'पुरुष' : 'Male',
    female: lang === 'hi' ? 'महिला' : 'Female',
    select: lang === 'hi' ? 'चुनें' : 'Select',
    answered: lang === 'hi' ? 'उत्तर दिए' : 'answered',
    of: lang === 'hi' ? 'में से' : 'of',
  }

  const answeredCount = questions.filter(q => form[q.key] !== null).length

  return (
    <div className="page-wrapper">
      <div className="page-orb orb-purple" />
      <div className="page-orb orb-green" style={{ bottom: 0, right: -100 }} />

      <div className="page-container" style={{ maxWidth: 960 }}>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag" style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' }}>
            <Clock size={14} /> {tx.tag}
          </div>
          <h1><span className="gradient-text">{tx.title}</span></h1>
          <p>{tx.sub}</p>
          <div className="tm-who-note">{tx.whoNote}</div>
        </motion.div>

        <motion.div className="tm-form-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>

          {/* Basic Info */}
          <p className="tm-section-title">{tx.basicInfo}</p>
          <div className="form-row">
            <div className="form-group">
              <label>{tx.age}</label>
              <input type="number" placeholder="25" min="1" max="100" value={form.age}
                onChange={e => { setAgeError(''); setForm(f => ({ ...f, age: e.target.value })) }} />
              {ageError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{ageError}</p>}
            </div>
            <div className="form-group">
              <label>{tx.gender}</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">{tx.select}</option>
                <option value="male">{tx.male}</option>
                <option value="female">{tx.female}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{tx.weight}</label>
              <input type="number" placeholder="70" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{tx.height}</label>
              <input type="number" placeholder="165" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
          </div>

          {/* WHO Risk Factors */}
          <div className="tm-section-header">
            <p className="tm-section-title">{tx.riskFactors}</p>
            <span className="tm-progress">{answeredCount} {tx.of} 6 {tx.answered}</span>
          </div>

          {questions.map((q) => (
            <div key={q.key} className="tm-toggle-group">
              <div className="tm-toggle-label-row">
                <p className="tm-toggle-label">{q.label}</p>
                <span className="tm-toggle-sub">{q.sub}</span>
              </div>
              <div className="tm-toggle-btns">
                <button className={`tm-toggle ${form[q.key] === true ? q.yesColor : ''}`}
                  onClick={() => setForm(f => ({ ...f, [q.key]: true }))}>
                  {q.yes}
                </button>
                <button className={`tm-toggle ${form[q.key] === false ? q.noColor : ''}`}
                  onClick={() => setForm(f => ({ ...f, [q.key]: false }))}>
                  {q.no}
                </button>
              </div>
            </div>
          ))}

          {/* Family diseases */}
          <div className="form-group" style={{ marginTop: 20 }}>
            <label>{tx.family}</label>
            <div className="disease-chips">
              {diseaseOptions[lang].map((d, i) => (
                <button key={i} className={`disease-chip ${form.diseases.includes(d) ? 'selected' : ''}`}
                  onClick={() => toggleDisease(d)}>
                  {d}
                </button>
              ))}
              <button className={`disease-chip ${showOther ? 'selected' : ''}`}
                onClick={() => setShowOther(v => !v)}>
                {tx.otherLabel}
              </button>
            </div>
            <AnimatePresence>
              {showOther && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="other-input"
                  placeholder={tx.otherPlaceholder}
                  value={otherDisease}
                  onChange={e => setOtherDisease(e.target.value)}
                />
              )}
            </AnimatePresence>
          </div>

          <button className="btn-primary" onClick={analyze}
            disabled={loading || !canSubmit}
            style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            {loading ? <><Loader size={16} className="spin" /> {tx.loading}</> : <><Zap size={16} /> {tx.btn}</>}
          </button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="tm-age-banner">
                <span>📅 {lang === 'hi'
                  ? `आज: ${form.age} वर्ष → 10 साल बाद: ${parseInt(form.age) + 10} वर्ष`
                  : `Today: Age ${form.age} → In 10 Years: Age ${parseInt(form.age) + 10}`}
                </span>
              </div>

              <div className="tm-comparison">
                <motion.div className="tm-card tm-bad" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div className="tm-card-header">
                    <TrendingDown size={20} /> <h3>{tx.without}</h3>
                  </div>
                  <div className="tm-metrics">
                    {result.without.map((item, i) => (
                      <div key={i} className="tm-metric">
                        <div className="tm-metric-label">{item.label}</div>
                        <div className="tm-metric-value bad">{item.value}</div>
                        <div className="tm-metric-risk">{item.risk}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="tm-card tm-good" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div className="tm-card-header">
                    <TrendingUp size={20} /> <h3>{tx.with}</h3>
                  </div>
                  <div className="tm-metrics">
                    {result.with.map((item, i) => (
                      <div key={i} className="tm-metric">
                        <div className="tm-metric-label">{item.label}</div>
                        <div className="tm-metric-value good">{item.value}</div>
                        <div className="tm-metric-risk">{item.risk}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div className="tm-action-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3><AlertTriangle size={18} color="#f59e0b" /> {tx.advice}</h3>
                <ul className="tm-action-list">
                  {result.actions.map((a, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                      {a}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <div className="disclaimer-box">{tx.disclaimer}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
