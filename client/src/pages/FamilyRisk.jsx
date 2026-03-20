import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Loader, ArrowLeft, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './FamilyRisk.css'

const diseaseList = {
  en: ['Diabetes', 'Heart Disease', 'Hypertension', 'Cancer', 'Thyroid Disorder', 'Asthma', 'Kidney Disease', 'Stroke', 'Obesity', 'Mental Health'],
  hi: ['मधुमेह', 'हृदय रोग', 'उच्च रक्तचाप', 'कैंसर', 'थायरॉइड विकार', 'अस्थमा', 'गुर्दे की बीमारी', 'स्ट्रोक', 'मोटापा', 'मानसिक स्वास्थ्य'],
}

// WHO-based risk calculation per disease + age + gender
// Sources:
// - WHO Global Report on Diabetes 2016 (diabetes hereditary risk 30-40%)
// - WHO CVD Risk Chart 2019 (heart disease risk increases with age)
// - WHO ISH Hypertension Guidelines 2020 (BP risk higher in males)
// - WHO IARC Cancer Report 2020 (cancer hereditary component 10-30%)
// - WHO/UNICEF/ICCIDD 2007 (thyroid higher in females 5:1 ratio)
// - ICMR-INDIAB Study 2023 (India-specific diabetes prevalence)
const riskProfiles = {
  'Diabetes': { base: 30, ageBoost: 0.4, genderBoost: { male: 5, female: 3 }, level: (s) => s >= 60 ? 'high' : s >= 40 ? 'medium' : 'low' },
  'मधुमेह': { base: 30, ageBoost: 0.4, genderBoost: { male: 5, female: 3 }, level: (s) => s >= 60 ? 'high' : s >= 40 ? 'medium' : 'low' },
  'Heart Disease': { base: 20, ageBoost: 0.5, genderBoost: { male: 10, female: 4 }, level: (s) => s >= 55 ? 'high' : s >= 35 ? 'medium' : 'low' },
  'हृदय रोग': { base: 20, ageBoost: 0.5, genderBoost: { male: 10, female: 4 }, level: (s) => s >= 55 ? 'high' : s >= 35 ? 'medium' : 'low' },
  'Hypertension': { base: 25, ageBoost: 0.45, genderBoost: { male: 8, female: 5 }, level: (s) => s >= 58 ? 'high' : s >= 38 ? 'medium' : 'low' },
  'उच्च रक्तचाप': { base: 25, ageBoost: 0.45, genderBoost: { male: 8, female: 5 }, level: (s) => s >= 58 ? 'high' : s >= 38 ? 'medium' : 'low' },
  'Cancer': { base: 10, ageBoost: 0.3, genderBoost: { male: 6, female: 7 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
  'कैंसर': { base: 10, ageBoost: 0.3, genderBoost: { male: 6, female: 7 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
  'Thyroid Disorder': { base: 15, ageBoost: 0.2, genderBoost: { male: 2, female: 12 }, level: (s) => s >= 45 ? 'high' : s >= 28 ? 'medium' : 'low' },
  'थायरॉइड विकार': { base: 15, ageBoost: 0.2, genderBoost: { male: 2, female: 12 }, level: (s) => s >= 45 ? 'high' : s >= 28 ? 'medium' : 'low' },
  'Asthma': { base: 20, ageBoost: 0.15, genderBoost: { male: 4, female: 3 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
  'अस्थमा': { base: 20, ageBoost: 0.15, genderBoost: { male: 4, female: 3 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
  'Kidney Disease': { base: 15, ageBoost: 0.35, genderBoost: { male: 6, female: 4 }, level: (s) => s >= 50 ? 'high' : s >= 30 ? 'medium' : 'low' },
  'गुर्दे की बीमारी': { base: 15, ageBoost: 0.35, genderBoost: { male: 6, female: 4 }, level: (s) => s >= 50 ? 'high' : s >= 30 ? 'medium' : 'low' },
  'Stroke': { base: 10, ageBoost: 0.5, genderBoost: { male: 8, female: 5 }, level: (s) => s >= 50 ? 'high' : s >= 30 ? 'medium' : 'low' },
  'स्ट्रोक': { base: 10, ageBoost: 0.5, genderBoost: { male: 8, female: 5 }, level: (s) => s >= 50 ? 'high' : s >= 30 ? 'medium' : 'low' },
  'Obesity': { base: 20, ageBoost: 0.3, genderBoost: { male: 5, female: 6 }, level: (s) => s >= 50 ? 'high' : s >= 32 ? 'medium' : 'low' },
  'मोटापा': { base: 20, ageBoost: 0.3, genderBoost: { male: 5, female: 6 }, level: (s) => s >= 50 ? 'high' : s >= 32 ? 'medium' : 'low' },
  'Mental Health': { base: 18, ageBoost: 0.2, genderBoost: { male: 3, female: 5 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
  'मानसिक स्वास्थ्य': { base: 18, ageBoost: 0.2, genderBoost: { male: 3, female: 5 }, level: (s) => s >= 40 ? 'high' : s >= 25 ? 'medium' : 'low' },
}

const tips = {
  en: {
    'Diabetes': 'WHO: Reduce sugar & refined carbs. Walk 30 min/day. Monitor fasting blood sugar every 6 months. Target HbA1c < 7%.',
    'Heart Disease': 'WHO: Reduce saturated fats, quit smoking, manage stress. Check BP monthly. Target < 130/80 mmHg.',
    'Hypertension': 'WHO: Limit salt to < 5g/day. Exercise regularly. Maintain BMI 18.5–24.9. Avoid alcohol.',
    'Cancer': 'WHO: Avoid tobacco & alcohol. Maintain healthy weight. Annual screenings. Eat fruits & vegetables daily.',
    'Thyroid Disorder': 'Get TSH tested annually. Maintain iodine intake. Avoid excessive soy. Regular follow-up with endocrinologist.',
    'Asthma': 'Avoid triggers (dust, smoke, pollen). Keep rescue inhaler handy. Annual lung function test. Avoid cold air.',
    'Kidney Disease': 'Stay hydrated. Limit salt & protein. Monitor BP & blood sugar. Annual kidney function test (creatinine, eGFR).',
    'Stroke': 'Control BP & cholesterol. Quit smoking. Exercise regularly. Know FAST signs: Face drooping, Arm weakness, Speech difficulty, Time to call 108.',
    'Obesity': 'WHO: BMI target 18.5–24.9. Reduce calorie intake by 500 kcal/day. 150 min/week moderate exercise. Avoid processed foods.',
    'Mental Health': 'Practice mindfulness & stress management. Maintain social connections. Sleep 7–9 hours. Seek professional help if needed.',
  },
  hi: {
    'मधुमेह': 'WHO: चीनी और परिष्कृत कार्बोहाइड्रेट कम करें। रोज़ 30 मिनट चलें। हर 6 महीने में उपवास रक्त शर्करा जांचें। HbA1c लक्ष्य < 7%।',
    'हृदय रोग': 'WHO: संतृप्त वसा कम करें, धूम्रपान छोड़ें, तनाव प्रबंधित करें। मासिक BP जांचें। लक्ष्य < 130/80 mmHg।',
    'उच्च रक्तचाप': 'WHO: नमक < 5g/दिन सीमित करें। नियमित व्यायाम करें। BMI 18.5–24.9 बनाए रखें। शराब से बचें।',
    'कैंसर': 'WHO: तंबाकू और शराब से बचें। स्वस्थ वज़न बनाए रखें। वार्षिक जांच। रोज़ फल और सब्ज़ियां खाएं।',
    'थायरॉइड विकार': 'TSH सालाना जांचें। आयोडीन का सेवन बनाए रखें। अत्यधिक सोया से बचें। एंडोक्रिनोलॉजिस्ट से नियमित फॉलो-अप।',
    'अस्थमा': 'ट्रिगर से बचें (धूल, धुआं, पराग)। रेस्क्यू इनहेलर पास रखें। वार्षिक फेफड़े की कार्यक्षमता परीक्षण। ठंडी हवा से बचें।',
    'गुर्दे की बीमारी': 'हाइड्रेटेड रहें। नमक और प्रोटीन सीमित करें। BP और रक्त शर्करा की निगरानी करें। वार्षिक किडनी फंक्शन टेस्ट।',
    'स्ट्रोक': 'BP और कोलेस्ट्रॉल नियंत्रित करें। धूम्रपान छोड़ें। नियमित व्यायाम करें। FAST संकेत जानें: चेहरा झुकना, हाथ कमज़ोरी, बोलने में कठिनाई, 108 पर कॉल।',
    'मोटापा': 'WHO: BMI लक्ष्य 18.5–24.9। रोज़ 500 kcal कम करें। सप्ताह में 150 मिनट मध्यम व्यायाम। प्रसंस्कृत खाद्य पदार्थों से बचें।',
    'मानसिक स्वास्थ्य': 'माइंडफुलनेस और तनाव प्रबंधन का अभ्यास करें। सामाजिक संबंध बनाए रखें। 7–9 घंटे सोएं। ज़रूरत पड़ने पर पेशेवर मदद लें।',
  }
}

// WHO-based related disease risks
const relatedDiseases = {
  'Diabetes':          ['Kidney Disease', 'Heart Disease', 'Hypertension', 'Stroke'],
  'मधुमेह':           ['गुर्दे की बीमारी', 'हृदय रोग', 'उच्च रक्तचाप', 'स्ट्रोक'],
  'Heart Disease':     ['Hypertension', 'Stroke', 'Obesity'],
  'हृदय रोग':         ['उच्च रक्तचाप', 'स्ट्रोक', 'मोटापा'],
  'Hypertension':      ['Heart Disease', 'Stroke', 'Kidney Disease'],
  'उच्च रक्तचाप':     ['हृदय रोग', 'स्ट्रोक', 'गुर्दे की बीमारी'],
  'Cancer':            ['Mental Health', 'Obesity'],
  'कैंसर':            ['मानसिक स्वास्थ्य', 'मोटापा'],
  'Obesity':           ['Diabetes', 'Heart Disease', 'Hypertension'],
  'मोटापा':           ['मधुमेह', 'हृदय रोग', 'उच्च रक्तचाप'],
  'Thyroid Disorder':  ['Obesity', 'Mental Health', 'Heart Disease'],
  'थायरॉइड विकार':    ['मोटापा', 'मानसिक स्वास्थ्य', 'हृदय रोग'],
  'Kidney Disease':    ['Hypertension', 'Diabetes'],
  'गुर्दे की बीमारी': ['उच्च रक्तचाप', 'मधुमेह'],
}

const levelColor = { high: '#ef4444', medium: '#f59e0b', low: '#00c896' }

function getRelatedDiseases(selected) {
  const related = new Set()
  selected.forEach(d => {
    const r = relatedDiseases[d] || []
    r.forEach(rd => { if (!selected.includes(rd)) related.add(rd) })
  })
  return Array.from(related).slice(0, 3)
}

function calcScore(disease, age, gender) {
  const profile = riskProfiles[disease]
  if (!profile) return { score: 25, level: 'low' }
  const raw = profile.base + (Number(age) * profile.ageBoost) + (profile.genderBoost[gender] || 5)
  const score = Math.min(Math.round(raw), 95)
  return { score, level: profile.level(score) }
}

function RiskBar({ score, level, delay }) {
  return (
    <div className="risk-bar-track">
      <motion.div
        className="risk-bar-fill"
        style={{ background: levelColor[level] }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function FamilyRisk() {
  const { lang, t } = useLang()
  const [form, setForm] = useState({ age: '', gender: '', selected: [], otherText: '' })
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const [ageError, setAgeError] = useState('')
  const [relatedWarning, setRelatedWarning] = useState([])

  const otherLabel = lang === 'hi' ? 'अन्य' : 'Other'

  const toggleDisease = (d) => {
    if (d === otherLabel) { setShowOtherInput(v => !v); return }
    setForm(f => ({
      ...f,
      selected: f.selected.includes(d) ? f.selected.filter(x => x !== d) : [...f.selected, d]
    }))
  }

  const predict = async () => {
    const age = parseInt(form.age)
    if (!form.age || isNaN(age) || age < 1 || age > 110) {
      setAgeError(lang === 'hi' ? 'कृपया 1 से 110 के बीच सही आयु दर्ज करें' : 'Please enter a valid age between 1 and 110')
      return
    }
    setAgeError('')
    const allSelected = [...form.selected]
    if (form.otherText.trim()) allSelected.push(form.otherText.trim())
    if (!form.gender || allSelected.length === 0) return

    // Show related disease warnings
    const related = getRelatedDiseases(allSelected)
    setRelatedWarning(related)

    setLoading(true)
    try {
      const res = await fetch('/api/family-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: form.age, gender: form.gender, diseases: allSelected, lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      // Use local WHO tips (always correct language), API scores
      const localTips = tips[lang]
      const risks = (data.risks || []).map(r => ({
        ...r,
        tip: localTips[r.disease] || r.tip
      }))
      setResult(risks)
    } catch (err) {
      alert(lang === 'hi' ? '❌ विश्लेषण विफल। सर्वर चल रहा है?' : '❌ Analysis failed. Is server running?')
    }
    setLoading(false)
  }

  const levelLabel = (l) => l === 'high' ? t.familyHigh : l === 'medium' ? t.familyMedium : t.familyLow
  const hasSelection = form.selected.length > 0 || form.otherText.trim()

  return (
    <div className="page-wrapper">
      <div className="page-orb orb-purple" />
      <div className="page-orb orb-green" />

      <div className="page-container" style={{ maxWidth: 900 }}>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag" style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' }}>
            <Users size={14} /> {t.familyRisk}
          </div>
          <h1><span className="gradient-text">{t.familyTitle}</span></h1>
          <p>{t.familySub}</p>
        </motion.div>

        <motion.div className="risk-form-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="form-row">
            <div className="form-group">
              <label>{t.familyAge}</label>
              <input type="number" placeholder="35" min="1" max="110" value={form.age}
                onChange={e => { setAgeError(''); setForm(f => ({ ...f, age: e.target.value })) }} />
              {ageError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{ageError}</p>}
            </div>
            <div className="form-group">
              <label>{t.familyGender}</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">{t.familySelect}</option>
                <option value="male">{t.familyMale}</option>
                <option value="female">{t.familyFemale}</option>
                <option value="other">{t.familyOther}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t.familyDiseases}</label>
            <div className="disease-chips">
              {diseaseList[lang].map((d, i) => (
                <button key={i} className={`disease-chip ${form.selected.includes(d) ? 'selected' : ''}`} onClick={() => toggleDisease(d)}>
                  {d}
                </button>
              ))}
              <button
                className={`disease-chip ${showOtherInput ? 'selected' : ''}`}
                onClick={() => setShowOtherInput(v => !v)}
              >
                + {otherLabel}
              </button>
            </div>

            <AnimatePresence>
              {showOtherInput && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="other-input"
                  placeholder={lang === 'hi' ? 'अन्य बीमारी का नाम लिखें...' : 'Type other disease name...'}
                  value={form.otherText}
                  onChange={e => setForm(f => ({ ...f, otherText: e.target.value }))}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            className="btn-primary"
            onClick={predict}
            disabled={loading || !form.age || !form.gender || !hasSelection}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? <><Loader size={16} className="spin" /> {t.familyPredicting}</> : <><Users size={16} /> {t.familyPredict}</>}
          </button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div className="risk-results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2>{t.familyProfile}</h2>
              {relatedWarning.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 6 }}>
                    ⚠️ {lang === 'hi' ? 'WHO के अनुसार इन बीमारियों का भी जोखिम हो सकता है:' : 'WHO: You may also be at risk for:'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {relatedWarning.map((r, i) => (
                      <span key={i} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: 20, fontSize: 13 }}>{r}</span>
                    ))}
                  </div>
                </motion.div>
              )}
              {result.map((r, i) => (
                <motion.div
                  key={i}
                  className="risk-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  style={{ '--rc': levelColor[r.level] }}
                >
                  <div className="risk-card-top">
                    <div className="risk-name">
                      {r.level === 'high' ? <AlertTriangle size={18} color={levelColor[r.level]} /> :
                       r.level === 'medium' ? <Info size={18} color={levelColor[r.level]} /> :
                       <CheckCircle size={18} color={levelColor[r.level]} />}
                      <span>{r.disease}</span>
                    </div>
                    <div className="risk-score-badge" style={{ color: levelColor[r.level], background: `${levelColor[r.level]}18` }}>
                      {r.score}% — {levelLabel(r.level)}
                    </div>
                  </div>
                  <RiskBar score={r.score} level={r.level} delay={0.2 + i * 0.12} />
                  <p className="risk-tip">💡 {r.tip}</p>
                </motion.div>
              ))}
              <div className="disclaimer-box">{t.familyDisclaimer}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
