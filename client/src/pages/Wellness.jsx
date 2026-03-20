import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Loader, ArrowLeft, Apple, Dumbbell, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './Wellness.css'

const goals = {
  en: ['Weight Loss', 'Muscle Gain', 'Diabetes Control', 'Heart Health', 'General Fitness', 'Stress Relief'],
  hi: ['वज़न घटाना', 'मांसपेशी बढ़ाना', 'मधुमेह नियंत्रण', 'हृदय स्वास्थ्य', 'सामान्य फिटनेस', 'तनाव राहत'],
}

function buildPlan(weight, height, lang) {
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)
  let category, score

  if (bmi < 18.5) { category = lang === 'hi' ? 'कम वज़न' : 'Underweight'; score = 55 }
  else if (bmi < 25) { category = lang === 'hi' ? 'सामान्य' : 'Normal'; score = 88 }
  else if (bmi < 30) { category = lang === 'hi' ? 'अधिक वज़न' : 'Overweight'; score = 65 }
  else { category = lang === 'hi' ? 'मोटापा' : 'Obese'; score = 42 }

  const plans = {
    en: {
      meals: {
        Breakfast: 'Oats with fruits + warm lemon water | Whole wheat toast + boiled eggs',
        Lunch: 'Dal + 2 chapati + vegetables + salad | Brown rice + rajma + curd',
        Dinner: 'Khichdi + curd | Vegetable soup + 1 chapati',
        Snacks: 'Fruits, nuts, sprouts | Avoid fried and packaged snacks',
      },
      exercise: [
        '30 min brisk walk daily (WHO: 150 min/week moderate activity)',
        'Yoga: 5 rounds of Surya Namaskar',
        'Avoid sitting for more than 1 hour continuously',
        'Take stairs instead of elevator',
      ],
      sleep: [
        'Sleep by 10–11 PM (WHO recommends 7–9 hours for adults)',
        'Avoid screens 1 hour before bed',
        'Keep bedroom dark and cool',
      ],
    },
    hi: {
      meals: {
        'नाश्ता': 'फलों के साथ ओट्स + गर्म नींबू पानी | साबुत गेहूं टोस्ट + उबले अंडे',
        'दोपहर का खाना': 'दाल + 2 चपाती + सब्ज़ी + सलाद | ब्राउन राइस + राजमा + दही',
        'रात का खाना': 'खिचड़ी + दही | सब्ज़ी का सूप + 1 चपाती',
        'नाश्ते में': 'फल, मेवे, अंकुरित अनाज | तले और पैकेज्ड स्नैक्स से बचें',
      },
      exercise: [
        'रोज़ 30 मिनट तेज़ चलें (WHO: सप्ताह में 150 मिनट मध्यम गतिविधि)',
        'योग: 5 राउंड सूर्य नमस्कार',
        '1 घंटे से अधिक लगातार न बैठें',
        'लिफ्ट की जगह सीढ़ियां लें',
      ],
      sleep: [
        'रात 10–11 बजे सो जाएं (WHO: वयस्कों के लिए 7–9 घंटे)',
        'सोने से 1 घंटे पहले स्क्रीन बंद करें',
        'शयनकक्ष अंधेरा और ठंडा रखें',
      ],
    }
  }

  return { bmi, category, score, ...plans[lang] }
}

function ScoreRing({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#00c896' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="score-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="score-center">
        <motion.span className="score-num" style={{ color }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="score-label">{score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴'}</span>
      </div>
    </div>
  )
}

export default function Wellness() {
  const { lang, t } = useLang()
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: '', goal: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    if (!form.weight || !form.height || !form.age || !form.gender || !form.goal) return
    setLoading(true)
    try {
      const localPlan = buildPlan(form.weight, form.height, lang)
      const res = await fetch('/api/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: form.weight, height: form.height,
          age: form.age, gender: form.gender,
          goal: form.goal, lang
        }),
      })
      const data = await res.json()
      // Use local WHO-based plan for meals/exercise/sleep (always correct language)
      // Use API for score and bmiCategory only
      setResult({
        ...localPlan,
        score: data.score || localPlan.score,
        bmiCategory: localPlan.category,
        calorieTarget: data.calorieTarget || '',
        waterIntake: data.waterIntake || '',
      })
    } catch (err) {
      // Fallback to local plan if API fails
      const localPlan = buildPlan(form.weight, form.height, lang)
      setResult(localPlan)
    }
    setLoading(false)
  }

  const scoreLabel = lang === 'hi' ? 'स्वास्थ्य स्कोर' : 'Wellness Score'
  const bmiLabel = lang === 'hi' ? 'BMI श्रेणी' : 'BMI Category'
  const goalLabel = lang === 'hi' ? 'लक्ष्य' : 'Goal'
  const normalBmi = lang === 'hi' ? 'सामान्य BMI: 18.5 – 24.9 (WHO)' : 'Normal BMI: 18.5 – 24.9 (WHO)'

  return (
    <div className="page-wrapper">
      <div className="page-orb orb-green" />
      <div className="page-orb orb-blue" />

      <div className="page-container" style={{ maxWidth: 900 }}>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag"><Activity size={14} /> {t.wellness}</div>
          <h1><span className="gradient-text">{t.wellnessTitle}</span></h1>
          <p>{t.wellnessSub}</p>
        </motion.div>

        <motion.div className="wellness-form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="form-row">
            <div className="form-group">
              <label>{t.wellnessWeight}</label>
              <input type="number" placeholder="70" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.wellnessHeight}</label>
              <input type="number" placeholder="165" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.wellnessAge}</label>
              <input type="number" placeholder="28" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{t.wellnessGender}</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">{lang === 'hi' ? 'चुनें' : 'Select'}</option>
                <option value="male">{lang === 'hi' ? 'पुरुष' : 'Male'}</option>
                <option value="female">{lang === 'hi' ? 'महिला' : 'Female'}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t.wellnessGoal}</label>
            <div className="disease-chips">
              {goals[lang].map((g, i) => (
                <button
                  key={i}
                  className={`disease-chip ${form.goal === goals[lang][i] ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, goal: g }))}
                  style={form.goal === g ? { background: 'rgba(0,200,150,0.2)', borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={calculate}
            disabled={loading || !form.weight || !form.height || !form.age || !form.gender || !form.goal}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? <><Loader size={16} className="spin" /> {t.wellnessGenerating}</> : <><Activity size={16} /> {t.wellnessGenerate}</>}
          </button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div className="wellness-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="score-bmi-row">
                <ScoreRing score={result.score} />
                <div className="bmi-info">
                  <div className="bmi-value">
                    <span className="bmi-num">{result.bmi}</span>
                    <span className="bmi-unit">BMI</span>
                  </div>
                  <div className="bmi-category">{result.category}</div>
                  <p className="bmi-tip">{normalBmi} · {goalLabel}: <strong>{form.goal}</strong></p>
                  <p className="bmi-tip" style={{ marginTop: 4 }}>{scoreLabel}: <strong style={{ color: result.score >= 80 ? '#00c896' : result.score >= 60 ? '#f59e0b' : '#ef4444' }}>{result.score}/100</strong></p>
                </div>
              </div>

              <div className="plan-section">
                <div className="plan-header"><Apple size={20} color="var(--primary)" /> <h3>{t.wellnessMeals}</h3></div>
                <div className="meal-grid">
                  {Object.entries(result.meals).map(([time, meal]) => (
                    <div key={time} className="meal-card">
                      <span className="meal-time">{time}</span>
                      <p>{meal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="plan-section">
                <div className="plan-header"><Dumbbell size={20} color="#f59e0b" /> <h3>{t.wellnessExercise}</h3></div>
                <ul className="tips-list">{result.exercise.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>

              <div className="plan-section">
                <div className="plan-header"><Moon size={20} color="#7c3aed" /> <h3>{t.wellnessSleep}</h3></div>
                <ul className="tips-list">{result.sleep.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              <div className="disclaimer-box">{t.wellnessDisclaimer}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
