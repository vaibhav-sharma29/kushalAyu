import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, MapPin, Phone, MessageSquare, ArrowLeft, Navigation, AlertTriangle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './PageCommon.css'
import './Emergency.css'

// City-based hospital data (real hospitals with real numbers)
const hospitalsByCity = {
  delhi: [
    { name: 'AIIMS Delhi', phone: '011-26588500', type: { en: 'Government', hi: 'सरकारी' }, address: 'Ansari Nagar, New Delhi' },
    { name: 'Safdarjung Hospital', phone: '011-26707444', type: { en: 'Government', hi: 'सरकारी' }, address: 'Ansari Nagar West, New Delhi' },
    { name: 'Apollo Hospital Delhi', phone: '011-26925858', type: { en: 'Private', hi: 'निजी' }, address: 'Sarita Vihar, New Delhi' },
    { name: 'Max Super Speciality', phone: '011-26515050', type: { en: 'Private', hi: 'निजी' }, address: 'Saket, New Delhi' },
  ],
  mumbai: [
    { name: 'KEM Hospital', phone: '022-24107000', type: { en: 'Government', hi: 'सरकारी' }, address: 'Parel, Mumbai' },
    { name: 'Nair Hospital', phone: '022-23027600', type: { en: 'Government', hi: 'सरकारी' }, address: 'Mumbai Central' },
    { name: 'Lilavati Hospital', phone: '022-26751000', type: { en: 'Private', hi: 'निजी' }, address: 'Bandra West, Mumbai' },
    { name: 'Kokilaben Hospital', phone: '022-30999999', type: { en: 'Private', hi: 'निजी' }, address: 'Andheri West, Mumbai' },
  ],
  bangalore: [
    { name: 'Victoria Hospital', phone: '080-26701150', type: { en: 'Government', hi: 'सरकारी' }, address: 'Fort, Bengaluru' },
    { name: 'Bowring Hospital', phone: '080-25561902', type: { en: 'Government', hi: 'सरकारी' }, address: 'Shivajinagar, Bengaluru' },
    { name: 'Manipal Hospital', phone: '080-25024444', type: { en: 'Private', hi: 'निजी' }, address: 'HAL Airport Road, Bengaluru' },
    { name: 'Apollo Hospital Bangalore', phone: '080-26304050', type: { en: 'Private', hi: 'निजी' }, address: 'Bannerghatta Road, Bengaluru' },
  ],
  default: [
    { name: 'District Government Hospital', phone: '108', type: { en: 'Government', hi: 'सरकारी' }, address: 'Your nearest district hospital' },
    { name: 'Primary Health Centre', phone: '104', type: { en: 'Government', hi: 'सरकारी' }, address: 'Nearest PHC' },
    { name: 'Apollo Hospitals', phone: '1860-500-1066', type: { en: 'Private', hi: 'निजी' }, address: 'Nearest Apollo branch' },
    { name: 'Fortis Healthcare', phone: '1800-103-0066', type: { en: 'Private', hi: 'निजी' }, address: 'Nearest Fortis branch' },
  ]
}

const emergencyNums = [
  { en: 'Ambulance', hi: 'एम्बुलेंस', num: '108', color: '#ef4444' },
  { en: 'Police', hi: 'पुलिस', num: '100', color: '#3b82f6' },
  { en: 'Fire', hi: 'अग्निशमन', num: '101', color: '#f97316' },
  { en: 'Women Helpline', hi: 'महिला हेल्पलाइन', num: '1091', color: '#ec4899' },
]

function getCityFromCoords(lat, lng) {
  // Approximate bounding boxes for major Indian cities
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) return 'delhi'
  if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1) return 'mumbai'
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'bangalore'
  return 'default'
}

export default function Emergency() {
  const { lang, t } = useLang()
  const [locating, setLocating] = useState(false)
  const [located, setLocated] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [location, setLocation] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [cityName, setCityName] = useState('')

  const triggerSOS = async (lat, lng) => {
    const mapsLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : ''
    const msg = lang === 'hi'
      ? `🚨 SOS अलर्ट! मुझे आपातकालीन सहायता चाहिए।${mapsLink ? ` मेरी लोकेशन: ${mapsLink}` : ''} एम्बुलेंस: 108`
      : `🚨 SOS Alert! I need emergency help.${mapsLink ? ` My Location: ${mapsLink}` : ''} Ambulance: 108`

    const phone = import.meta.env.VITE_SOS_PHONE?.replace(/[^0-9+]/g, '') || '+919214178185'

    // 1. Native SMS (works without internet)
    window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_self')

    // 2. Call after 1.5s
    setTimeout(() => {
      window.open(`tel:${phone}`, '_self')
    }, 1500)

    setSmsSent(true)
  }

  const getLocation = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      fallback()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const city = getCityFromCoords(lat, lng)
        setLocation({ lat: lat.toFixed(4), lng: lng.toFixed(4), rawLat: lat, rawLng: lng })
        setHospitals(hospitalsByCity[city])
        setCityName(city === 'default' ? (lang === 'hi' ? 'आपके नज़दीक' : 'Near You') : city.charAt(0).toUpperCase() + city.slice(1))
        setLocating(false)
        setLocated(true)
        triggerSOS(lat, lng)
      },
      () => fallback()
    )
  }

  const fallback = () => {
    setLocation({ lat: '—', lng: '—', rawLat: null, rawLng: null })
    setHospitals(hospitalsByCity.default)
    setCityName(lang === 'hi' ? 'राष्ट्रीय हेल्पलाइन' : 'National Helplines')
    setLocating(false)
    setLocated(true)
    triggerSOS(null, null)
  }

  // Opens Google Maps with real user location searching for hospitals nearby
  const mapsLink = (name, address) => {
    if (location?.rawLat && location?.rawLng) {
      return `https://www.google.com/maps/search/hospital+near+me/@${location.rawLat},${location.rawLng},14z`
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + address)}`
  }

  // Opens Google Maps directions from user location to hospital
  const directionsLink = (name, address) => {
    if (location?.rawLat && location?.rawLng) {
      return `https://www.google.com/maps/dir/${location.rawLat},${location.rawLng}/${encodeURIComponent(name + ' ' + address)}`
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + address)}`
  }

  const open247 = lang === 'hi' ? '● 24/7 खुला' : '● Open 24/7'



  return (
    <div className="page-wrapper">
      <div className="page-orb orb-red" />
      <div className="page-orb orb-blue" style={{ bottom: 0, left: -100 }} />

      <div className="page-container" style={{ maxWidth: 900 }}>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> {t.backBtn}</Link>

        <motion.div className="page-header" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="section-tag" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <Zap size={14} /> {t.sos}
          </div>
          <h1><span style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.emergencyTitle}</span></h1>
          <p>{t.emergencySub}</p>
        </motion.div>

        {/* SOS Button */}
        <motion.div className="sos-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <motion.button
            className={`sos-btn ${located ? 'located' : ''}`}
            onClick={getLocation}
            disabled={locating || located}
            whileTap={{ scale: 0.95 }}
          >
            {!located && !locating && (<><div className="sos-ring r1" /><div className="sos-ring r2" /><div className="sos-ring r3" /></>)}
            <div className="sos-inner">
              {locating ? (
                <><Navigation size={32} className="spin" /><span>{t.emergencyLocating}</span></>
              ) : located ? (
                <><MapPin size={32} /><span>{t.emergencyLocated}</span></>
              ) : (
                <><AlertTriangle size={32} /><span>{t.emergencySosBtn}</span><span className="sos-sub">{lang === 'hi' ? 'लोकेशन खोजें' : 'Find Location'}</span></>
              )}
            </div>
          </motion.button>

          {located && location && (
            <motion.div className="location-badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <MapPin size={14} />
              {location.lat !== '—'
                ? `${lang === 'hi' ? 'स्थान' : 'Location'}: ${location.lat}°N, ${location.lng}°E`
                : (lang === 'hi' ? 'GPS उपलब्ध नहीं — राष्ट्रीय हेल्पलाइन दिखा रहे हैं' : 'GPS unavailable — showing national helplines')}
            </motion.div>
          )}
        </motion.div>

        {/* SMS Alert */}
        <AnimatePresence>
          {located && (
            <motion.div className="sms-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="sms-icon"><MessageSquare size={24} /></div>
              <div>
                <h3>{t.emergencyAlert}</h3>
                <p>{t.emergencyAlertDesc}</p>
              </div>
              <div className="sms-sent">✅ {smsSent ? t.emergencySmsSent : (lang === 'hi' ? 'SMS भेजा जा रहा है...' : 'Sending SMS...')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hospitals */}
        <AnimatePresence>
          {located && (
            <motion.div className="hospitals-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2>{t.emergencyHospitals} — {cityName}</h2>
              <div className="hospitals-list">
                {hospitals.map((h, i) => (
                  <motion.div key={i} className="hospital-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="hospital-left">
                      <div className="hospital-rank">#{i + 1}</div>
                      <div>
                        <h3>{h.name}</h3>
                        <div className="hospital-meta">
                          <span className={`hospital-type ${h.type.en === 'Government' ? 'gov' : 'pvt'}`}>{h.type[lang]}</span>
                          <span style={{ fontSize: 12 }}>{h.address}</span>
                          <span className="open-badge">{open247}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hospital-actions">
                      <a href={`tel:${h.phone}`} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                        <Phone size={14} /> {h.phone}
                      </a>
                      <a href={directionsLink(h.name, h.address)} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                        <ExternalLink size={14} /> {lang === 'hi' ? 'Directions खोलें' : 'Get Directions'}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Numbers */}
        <motion.div className="emergency-numbers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3>{t.emergencyNumbers}</h3>
          <div className="numbers-grid">
            {emergencyNums.map((n, i) => (
              <a key={i} href={`tel:${n.num}`} className="number-card" style={{ '--nc': n.color }}>
                <Phone size={20} />
                <span className="num-label">{n[lang]}</span>
                <span className="num-val">{n.num}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
