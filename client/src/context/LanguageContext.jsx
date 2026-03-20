import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const t = {
  en: {
    // Navbar
    home: 'Home',
    voice: 'Voice AI',
    reports: 'Reports',
    familyRisk: 'Family Risk',
    wellness: 'Wellness',
    sos: 'SOS',
    emergency: 'Emergency SOS',
    login: 'Login',
    logout: 'Logout',

    // Hero
    heroTag: "India's First Voice-Enabled AI Health Companion",
    heroTitle1: 'Understand Your Health,',
    heroTitle2: 'In Your Language',
    heroSub: 'Speak symptoms, understand reports, know family risks — all in one place. Built for every Indian.',
    btnSpeak: 'Speak Symptoms',
    btnUpload: 'Upload Report',

    // Stats
    stat1val: '1:834', stat1label: 'Doctor to Patient Ratio in India',
    stat2val: '500M+', stat2label: 'Indians without healthcare access',
    stat3val: '6', stat3label: 'AI-Powered Health Tools',
    stat4val: '24/7', stat4label: 'Always Available, Free',

    // How it works
    howTitle: 'How KushalAyu Works',
    howSub: 'Three simple steps to better health guidance',
    step1title: 'Speak or Type', step1desc: 'Tell us your symptoms in English or Hindi. No medical knowledge needed.',
    step2title: 'AI Analyzes', step2desc: 'Our AI processes your input using trusted medical guidelines.',
    step3title: 'Get Guidance', step3desc: 'Receive clear, actionable health guidance instantly.',

    // Why section
    whyTitle: 'Why KushalAyu?',
    whySub: 'India needs a health companion that truly understands its people',
    why1title: 'Voice First', why1desc: 'Speak naturally in Hindi or English. No typing needed.',
    why2title: 'Trusted Data', why2desc: 'All guidance based on WHO and Indian medical guidelines.',
    why3title: 'Privacy First', why3desc: 'Your health data is encrypted and never shared.',
    why4title: 'Always Free', why4desc: 'No subscriptions. No downloads. Just open and use.',
    why5title: 'Report Analysis', why5desc: 'Upload any medical report and get a plain language summary.',
    why6title: 'Emergency Ready', why6desc: 'One tap to find nearest hospital and alert your family.',

    // Problem section
    problemTitle: 'The Problem We Solve',
    problemDesc: 'India has only 1 doctor for every 834 patients. Millions cannot understand their medical reports, track family health risks, or find essential tools in one place. Healthcare guidance is fragmented, expensive, and inaccessible.',
    solutionTitle: 'Our Solution',
    solutionDesc: 'KushalAyu brings AI-powered health guidance to every Indian — in their own language, on any device, completely free.',

    // Footer
    footerBuilt: 'Built with ❤️ by Protocol Pioneers | AWS Hackathon 2026',
    footerDisclaimer: 'KushalAyu empowers informed decisions but does not replace qualified doctors. Always consult a medical professional.',

    // Voice page
    voiceTitle: 'Voice Symptom Checker',
    voiceSub: 'Speak your symptoms in English or Hindi and get instant AI guidance',
    voiceMicLabel: 'Press mic and speak your symptoms',
    voiceListening: 'Listening... (click again to stop)',
    voiceYouSaid: 'You said:',
    voiceAnalyze: 'Analyze with AI',
    voiceAnalyzing: 'Analyzing...',
    voiceGuidance: '🤖 AI Guidance:',
    voiceListen: 'Listen',
    voiceSpeaking: 'Speaking...',
    voiceOrType: 'Or type your symptoms:',
    voicePlaceholder: 'e.g. headache, fever, cough for 3 days...',
    voiceTip1: 'Speak clearly', voiceTip2: 'Mention all symptoms', voiceTip3: 'Include duration', voiceTip4: 'Consult a doctor',
    voiceDisclaimer: '⚕️ This is AI guidance only. Always consult a qualified doctor.',

    // Report page
    reportTitle: 'AI Report Analyzer',
    reportSub: 'Upload your medical report and get a plain language summary with next steps',
    reportDrop: 'Drop your report here',
    reportFormats: 'Supports PDF, JPG, PNG',
    reportChoose: 'Choose File',
    reportAnalyze: 'Analyze Report',
    reportAnalyzing: 'Analyzing (Textract + AI)...',
    reportComplete: 'Analysis Complete',
    reportSummary: '📋 Summary:',
    reportNextSteps: '✅ What to do next:',
    reportDisclaimer: '⚕️ This is AI-generated analysis. Consult a doctor before any treatment.',

    // Family Risk
    familyTitle: 'Family Risk Predictor',
    familySub: 'Enter your family health history to get AI-generated genetic risk scores',
    familyAge: 'Your Age',
    familyGender: 'Gender',
    familySelect: 'Select',
    familyMale: 'Male',
    familyFemale: 'Female',
    familyOther: 'Other',
    familyDiseases: 'Which diseases run in your family? (select all that apply)',
    familyPredict: 'Generate Risk Score',
    familyPredicting: 'AI is predicting...',
    familyProfile: 'Your Risk Profile',
    familyHigh: 'High Risk',
    familyMedium: 'Medium Risk',
    familyLow: 'Low Risk',
    familyDisclaimer: '⚕️ This is AI-based risk estimation, not a medical diagnosis. Please consult a doctor.',

    // Wellness
    wellnessTitle: 'AI Wellness Advisor',
    wellnessSub: 'Get a personalized meal plan and wellness score based on your BMI and goals',
    wellnessWeight: 'Weight (kg)',
    wellnessHeight: 'Height (cm)',
    wellnessAge: 'Age',
    wellnessGender: 'Gender',
    wellnessGoal: 'Your Goal',
    wellnessGenerate: 'Generate Wellness Plan',
    wellnessGenerating: 'Creating your plan...',
    wellnessMeals: 'Meal Plan',
    wellnessExercise: 'Exercise Tips',
    wellnessSleep: 'Sleep Tips',
    wellnessDisclaimer: '⚕️ This is an AI-generated wellness plan. Consult a nutritionist before major diet changes.',

    // Emergency
    emergencyTitle: 'Emergency SOS',
    emergencySub: 'Find the nearest hospital in one tap and alert your family instantly',
    emergencySosBtn: 'SOS',
    emergencyLocating: 'Finding your location...',
    emergencyLocated: 'Location Found!',
    emergencyAlert: 'Alert Your Family',
    emergencyAlertDesc: 'Your live location will be sent via SMS to your registered family numbers',
    emergencySendSms: 'Send SMS Alert',
    emergencySmsSent: '✅ SMS Sent!',
    emergencyHospitals: 'Nearest Hospitals',
    emergencyNumbers: 'Emergency Numbers',
    backBtn: 'Go Back',
  },

  hi: {
    // Navbar
    home: 'होम',
    voice: 'वॉइस AI',
    reports: 'रिपोर्ट',
    familyRisk: 'पारिवारिक जोखिम',
    wellness: 'स्वास्थ्य',
    sos: 'SOS',
    emergency: '🚨 आपातकाल SOS',
    login: 'लॉगिन',
    logout: 'लॉगआउट',

    // Hero
    heroTag: 'भारत का पहला वॉइस-सक्षम AI स्वास्थ्य साथी',
    heroTitle1: 'अपनी सेहत को समझें,',
    heroTitle2: 'अपनी भाषा में',
    heroSub: 'लक्षण बोलें, रिपोर्ट समझें, पारिवारिक जोखिम जानें — सब एक जगह। हर भारतीय के लिए।',
    btnSpeak: 'लक्षण बोलें',
    btnUpload: 'रिपोर्ट अपलोड करें',

    // Stats
    stat1val: '१:८३४', stat1label: 'भारत में डॉक्टर-मरीज़ अनुपात',
    stat2val: '५०करोड़+', stat2label: 'भारतीय जिन्हें स्वास्थ्य सेवा नहीं मिलती',
    stat3val: '६', stat3label: 'AI-संचालित स्वास्थ्य उपकरण',
    stat4val: '२४/७', stat4label: 'हमेशा उपलब्ध, बिल्कुल मुफ़्त',

    // How it works
    howTitle: 'KushalAyu कैसे काम करता है',
    howSub: 'बेहतर स्वास्थ्य मार्गदर्शन के लिए तीन सरल चरण',
    step1title: 'बोलें या टाइप करें', step1desc: 'हिंदी या अंग्रेज़ी में अपने लक्षण बताएं। कोई चिकित्सा ज्ञान ज़रूरी नहीं।',
    step2title: 'AI विश्लेषण करता है', step2desc: 'हमारा AI विश्वसनीय चिकित्सा दिशानिर्देशों का उपयोग करके आपके इनपुट को संसाधित करता है।',
    step3title: 'मार्गदर्शन पाएं', step3desc: 'तुरंत स्पष्ट और उपयोगी स्वास्थ्य मार्गदर्शन प्राप्त करें।',

    // Why section
    whyTitle: 'KushalAyu क्यों?',
    whySub: 'भारत को एक ऐसे स्वास्थ्य साथी की ज़रूरत है जो सच में समझे',
    why1title: 'वॉइस फर्स्ट', why1desc: 'हिंदी या अंग्रेज़ी में स्वाभाविक रूप से बोलें। टाइपिंग की ज़रूरत नहीं।',
    why2title: 'विश्वसनीय डेटा', why2desc: 'सभी मार्गदर्शन WHO और भारतीय चिकित्सा दिशानिर्देशों पर आधारित।',
    why3title: 'गोपनीयता पहले', why3desc: 'आपका स्वास्थ्य डेटा एन्क्रिप्टेड है और कभी साझा नहीं किया जाता।',
    why4title: 'हमेशा मुफ़्त', why4desc: 'कोई सदस्यता नहीं। कोई डाउनलोड नहीं। बस खोलें और उपयोग करें।',
    why5title: 'रिपोर्ट विश्लेषण', why5desc: 'कोई भी मेडिकल रिपोर्ट अपलोड करें और सरल भाषा में सारांश पाएं।',
    why6title: 'आपातकाल तैयार', why6desc: 'एक टैप में नज़दीकी अस्पताल खोजें और परिवार को सतर्क करें।',

    // Problem section
    problemTitle: 'जो समस्या हम हल करते हैं',
    problemDesc: 'भारत में हर ८३४ मरीज़ों पर केवल १ डॉक्टर है। लाखों लोग अपनी मेडिकल रिपोर्ट नहीं समझ पाते, पारिवारिक स्वास्थ्य जोखिमों को ट्रैक नहीं कर पाते। स्वास्थ्य मार्गदर्शन बिखरा हुआ, महंगा और दुर्गम है।',
    solutionTitle: 'हमारा समाधान',
    solutionDesc: 'KushalAyu हर भारतीय को AI-संचालित स्वास्थ्य मार्गदर्शन देता है — उनकी अपनी भाषा में, किसी भी डिवाइस पर, बिल्कुल मुफ़्त।',

    // Footer
    footerBuilt: 'Protocol Pioneers द्वारा ❤️ के साथ बनाया गया | AWS Hackathon 2026',
    footerDisclaimer: 'KushalAyu सूचित निर्णय लेने में मदद करता है लेकिन योग्य डॉक्टर की जगह नहीं लेता। हमेशा चिकित्सक से परामर्श लें।',

    // Voice page
    voiceTitle: 'वॉइस लक्षण जाँचकर्ता',
    voiceSub: 'हिंदी या अंग्रेज़ी में अपने लक्षण बोलें और तुरंत AI मार्गदर्शन पाएं',
    voiceMicLabel: 'माइक दबाएं और लक्षण बोलें',
    voiceListening: 'सुन रहा हूं... (रोकने के लिए फिर क्लिक करें)',
    voiceYouSaid: 'आपने कहा:',
    voiceAnalyze: 'AI से विश्लेषण करें',
    voiceAnalyzing: 'विश्लेषण हो रहा है...',
    voiceGuidance: '🤖 AI मार्गदर्शन:',
    voiceListen: 'सुनें',
    voiceSpeaking: 'बोल रहा है...',
    voiceOrType: 'या टाइप करें:',
    voicePlaceholder: 'जैसे: सिरदर्द, बुखार, ३ दिन से खांसी...',
    voiceTip1: 'स्पष्ट बोलें', voiceTip2: 'सभी लक्षण बताएं', voiceTip3: 'अवधि बताएं', voiceTip4: 'डॉक्टर से मिलें',
    voiceDisclaimer: '⚕️ यह केवल AI मार्गदर्शन है। हमेशा योग्य डॉक्टर से परामर्श लें।',

    // Report page
    reportTitle: 'AI रिपोर्ट विश्लेषक',
    reportSub: 'अपनी मेडिकल रिपोर्ट अपलोड करें और सरल भाषा में सारांश पाएं',
    reportDrop: 'रिपोर्ट यहाँ छोड़ें',
    reportFormats: 'PDF, JPG, PNG समर्थित',
    reportChoose: 'फ़ाइल चुनें',
    reportAnalyze: 'रिपोर्ट विश्लेषण करें',
    reportAnalyzing: 'विश्लेषण हो रहा है...',
    reportComplete: 'विश्लेषण पूर्ण',
    reportSummary: '📋 सारांश:',
    reportNextSteps: '✅ आगे क्या करें:',
    reportDisclaimer: '⚕️ यह AI-जनित विश्लेषण है। किसी भी उपचार से पहले डॉक्टर से मिलें।',

    // Family Risk
    familyTitle: 'पारिवारिक जोखिम भविष्यवक्ता',
    familySub: 'अपना पारिवारिक स्वास्थ्य इतिहास दर्ज करें और AI-जनित आनुवंशिक जोखिम स्कोर पाएं',
    familyAge: 'आपकी उम्र',
    familyGender: 'लिंग',
    familySelect: 'चुनें',
    familyMale: 'पुरुष',
    familyFemale: 'महिला',
    familyOther: 'अन्य',
    familyDiseases: 'आपके परिवार में कौन सी बीमारियाँ हैं? (सभी चुनें)',
    familyPredict: 'जोखिम स्कोर बनाएं',
    familyPredicting: 'AI भविष्यवाणी कर रहा है...',
    familyProfile: 'आपका जोखिम प्रोफ़ाइल',
    familyHigh: 'अधिक जोखिम',
    familyMedium: 'मध्यम जोखिम',
    familyLow: 'कम जोखिम',
    familyDisclaimer: '⚕️ यह AI-आधारित जोखिम अनुमान है, चिकित्सा निदान नहीं। कृपया डॉक्टर से मिलें।',

    // Wellness
    wellnessTitle: 'AI स्वास्थ्य सलाहकार',
    wellnessSub: 'अपने BMI और लक्ष्यों के आधार पर व्यक्तिगत भोजन योजना और स्वास्थ्य स्कोर पाएं',
    wellnessWeight: 'वज़न (kg)',
    wellnessHeight: 'ऊंचाई (cm)',
    wellnessAge: 'उम्र',
    wellnessGender: 'लिंग',
    wellnessGoal: 'आपका लक्ष्य',
    wellnessGenerate: 'स्वास्थ्य योजना बनाएं',
    wellnessGenerating: 'आपकी योजना बन रही है...',
    wellnessMeals: 'भोजन योजना',
    wellnessExercise: 'व्यायाम सुझाव',
    wellnessSleep: 'नींद सुझाव',
    wellnessDisclaimer: '⚕️ यह AI-जनित स्वास्थ्य योजना है। बड़े आहार परिवर्तन से पहले पोषण विशेषज्ञ से मिलें।',

    // Emergency
    emergencyTitle: 'आपातकाल SOS',
    emergencySub: 'एक टैप में नज़दीकी अस्पताल खोजें और परिवार को तुरंत सतर्क करें',
    emergencySosBtn: 'SOS',
    emergencyLocating: 'आपकी लोकेशन मिल रही है...',
    emergencyLocated: 'लोकेशन मिली!',
    emergencyAlert: 'परिवार को सतर्क करें',
    emergencyAlertDesc: 'आपकी लाइव लोकेशन SMS द्वारा आपके पंजीकृत परिवार के नंबरों पर भेजी जाएगी',
    emergencySendSms: 'SMS भेजें',
    emergencySmsSent: '✅ SMS भेजा गया!',
    emergencyHospitals: 'नज़दीकी अस्पताल',
    emergencyNumbers: 'आपातकालीन नंबर',
    backBtn: 'वापस जाएं',
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi')
  const toggle = () => setLang(l => l === 'hi' ? 'en' : 'hi')
  return (
    <LanguageContext.Provider value={{ lang, toggle, t: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
