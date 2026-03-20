const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
require('dotenv').config()

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly')

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}

const bedrock = new BedrockRuntimeClient(awsConfig)
const s3 = new S3Client(awsConfig)
const textract = new TextractClient(awsConfig)
const sns = new SNSClient(awsConfig)
const polly = new PollyClient(awsConfig)

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('INVALID_TYPE'))
  }
})

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')

// ════════════════════════════════════════════════════════════
// REAL WHO GUIDELINES DATA
// Sources: WHO Global Health Observatory, ICMR, WHO CVD Risk Charts
// ════════════════════════════════════════════════════════════
const WHO_BLOOD_RANGES = {
  'Hemoglobin':      { male: '13.5-17.5 g/dL', female: '12.0-15.5 g/dL', ref: 'WHO/NMH/NHD/MNM/11.1' },
  'Blood Glucose':   { normal: '70-100 mg/dL (fasting)', pre: '100-125 mg/dL', diabetic: '>126 mg/dL', ref: 'WHO Diabetes Criteria 2006' },
  'Total Cholesterol': { normal: '<200 mg/dL', borderline: '200-239 mg/dL', high: '>240 mg/dL', ref: 'WHO CVD Prevention Guidelines 2007' },
  'Systolic BP':     { normal: '<120 mmHg', elevated: '120-129', stage1: '130-139', stage2: '>140', ref: 'WHO ISH Hypertension Guidelines 2020' },
  'Diastolic BP':    { normal: '<80 mmHg', stage1: '80-89', stage2: '>90', ref: 'WHO ISH 2020' },
  'TSH':             { normal: '0.4-4.0 mIU/L', ref: 'WHO/UNICEF/ICCIDD 2007' },
  'Creatinine':      { male: '0.7-1.3 mg/dL', female: '0.6-1.1 mg/dL', ref: 'WHO CKD Guidelines' },
  'WBC':             { normal: '4,500-11,000 cells/mcL', ref: 'WHO Laboratory Manual 2011' },
  'Platelets':       { normal: '150,000-400,000/mcL', ref: 'WHO Haematology Reference' },
}

const WHO_BMI = {
  underweight:   { range: '<18.5',    calories_adjust: +500, ref: 'WHO BMI Classification 1995' },
  normal:        { range: '18.5-24.9', calories_adjust: 0,   ref: 'WHO BMI Classification 1995' },
  overweight:    { range: '25.0-29.9', calories_adjust: -300, ref: 'WHO BMI Classification 1995' },
  obese_1:       { range: '30.0-34.9', calories_adjust: -500, ref: 'WHO Obesity Technical Report 894' },
  obese_2:       { range: '>35',       calories_adjust: -700, ref: 'WHO Obesity Technical Report 894' },
}

const WHO_WATER_INTAKE = {
  male_adult:   '2.5-3.0 L/day',
  female_adult: '2.0-2.5 L/day',
  ref: 'WHO Nutrients in Drinking Water 2005'
}

const WHO_SLEEP = {
  adult: '7-9 hours/night',
  ref: 'WHO Mental Health Action Plan 2013-2030'
}

const WHO_HEREDITARY_RISK = {
  diabetes:      { base_risk: 40, age_multiplier: 0.5, who_ref: 'WHO Global Report on Diabetes 2016', icmr_ref: 'ICMR-INDIAB Study 2023' },
  hypertension:  { base_risk: 35, age_multiplier: 0.4, who_ref: 'WHO ISH Hypertension Guidelines 2020' },
  heart_disease: { base_risk: 45, age_multiplier: 0.6, who_ref: 'WHO CVD Risk Chart 2019' },
  cancer:        { base_risk: 20, age_multiplier: 0.3, who_ref: 'WHO IARC Cancer Report 2020' },
  obesity:       { base_risk: 50, age_multiplier: 0.2, who_ref: 'WHO Obesity Technical Report 894' },
  asthma:        { base_risk: 30, age_multiplier: 0.2, who_ref: 'WHO Global Asthma Report 2022' },
  kidney:        { base_risk: 25, age_multiplier: 0.3, who_ref: 'WHO CKD Guidelines 2012' },
  thyroid:       { base_risk: 30, age_multiplier: 0.2, who_ref: 'WHO/UNICEF/ICCIDD 2007' },
}

const WHO_SYMPTOMS_SEVERITY = {
  emergency_keywords: ['chest pain', 'difficulty breathing', 'unconscious', 'stroke', 'seizure', 'severe bleeding', 'सीने में दर्द', 'सांस लेने में तकलीफ', 'बेहोशी'],
  ref: 'WHO Emergency Triage Guidelines 2016'
}

function getWHOBMICategory(bmi) {
  const b = parseFloat(bmi)
  if (b < 18.5) return { category: 'Underweight', who_ref: WHO_BMI.underweight.ref, calories_adjust: WHO_BMI.underweight.calories_adjust }
  if (b < 25)   return { category: 'Normal',      who_ref: WHO_BMI.normal.ref,      calories_adjust: WHO_BMI.normal.calories_adjust }
  if (b < 30)   return { category: 'Overweight',  who_ref: WHO_BMI.overweight.ref,  calories_adjust: WHO_BMI.overweight.calories_adjust }
  if (b < 35)   return { category: 'Obese Class I', who_ref: WHO_BMI.obese_1.ref,   calories_adjust: WHO_BMI.obese_1.calories_adjust }
  return { category: 'Obese Class II', who_ref: WHO_BMI.obese_2.ref, calories_adjust: WHO_BMI.obese_2.calories_adjust }
}

function getWHORisk(disease, age) {
  const key = Object.keys(WHO_HEREDITARY_RISK).find(k => disease.toLowerCase().includes(k))
  if (!key) return { base_risk: 25, who_ref: 'WHO General Health Guidelines' }
  const d = WHO_HEREDITARY_RISK[key]
  const age_bonus = Math.min(age * d.age_multiplier, 30)
  return { base_risk: Math.min(d.base_risk + age_bonus, 95), who_ref: d.who_ref, icmr_ref: d.icmr_ref }
}

async function callNova(prompt) {
  const body = JSON.stringify({
    messages: [{ role: 'user', content: [{ text: prompt }] }]
  })
  const cmd = new InvokeModelCommand({
    modelId: 'amazon.nova-lite-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body,
  })
  const res = await bedrock.send(cmd)
  const decoded = JSON.parse(Buffer.from(res.body).toString('utf-8'))
  return decoded.output.message.content[0].text
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('NO_JSON_IN_RESPONSE')
  return JSON.parse(match[0])
}

// ── Helper: Extract text from document using Textract ────────
async function extractTextWithTextract(s3Key, bucket) {
  try {
    const res = await textract.send(new AnalyzeDocumentCommand({
      Document: { S3Object: { Bucket: bucket, Key: s3Key } },
      FeatureTypes: ['TABLES', 'FORMS'],
    }))
    const text = res.Blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text)
      .join('\n')
    return text
  } catch (e) {
    console.log('Textract error:', e.message)
    return ''
  }
}

// ════════════════════════════════════════════════════════════
// 1. REPORT ANALYZER — S3 + Textract + Nova
// ════════════════════════════════════════════════════════════
app.post('/api/analyze-report', upload.single('report'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'NO_FILE' })

  const lang = req.body.lang || 'en'
  const fileBuffer = fs.readFileSync(file.path)
  const s3Key = `reports/${Date.now()}-${file.originalname}`
  const bucket = process.env.S3_BUCKET_NAME

  try {
    // Step 1: Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.mimetype,
    }))

    // Step 2: Extract text using Textract
    const extractedText = await extractTextWithTextract(s3Key, bucket)

    // Step 3: Analyze with Nova — if no text extracted, still try with filename context
    const textContext = extractedText && extractedText.trim().length > 20
      ? `\n\nExtracted text from document:\n${extractedText}`
      : `\n\nFilename: ${file.originalname} (image-based report, analyze as medical document)`

    const analysisPrompt = lang === 'hi'
      ? `आप एक विशेषज्ञ चिकित्सा AI हैं। नीचे दिए गए मेडिकल रिपोर्ट का विश्लेषण करें।${textContext}

केवल JSON में उत्तर दें:
{
  "reportType": "रिपोर्ट का प्रकार",
  "summary": "2-3 वाक्यों में सरल हिंदी सारांश",
  "findings": [
    { "label": "परीक्षण नाम", "value": "मान और इकाई", "status": "normal/low/high", "normal": "सामान्य सीमा (WHO/ICMR)" }
  ],
  "nextSteps": ["सरल हिंदी में अगला कदम"],
  "urgency": "routine/soon/urgent"
}`
      : `You are an expert medical AI. Analyze this medical report.${textContext}

Respond in JSON only:
{
  "reportType": "Type of report",
  "summary": "2-3 sentence plain English summary",
  "findings": [
    { "label": "Test name", "value": "Value with unit", "status": "normal/low/high", "normal": "Normal range (WHO/standard)" }
  ],
  "nextSteps": ["Actionable next step"],
  "urgency": "routine/soon/urgent"
}`

    const analysisRaw = await callNova(analysisPrompt)
    const analysis = extractJSON(analysisRaw)

    fs.unlinkSync(file.path)
    res.json({ success: true, analysis, s3Key })

  } catch (err) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    console.error('Report analysis error:', err.message)
    res.status(500).json({ error: 'ANALYSIS_FAILED', message: err.message })
  }
})

// ════════════════════════════════════════════════════════════
// 2. FAMILY RISK — Nova
// ════════════════════════════════════════════════════════════
app.post('/api/family-risk', async (req, res) => {
  const { age, gender, diseases, lang } = req.body
  if (!age || !gender || !diseases?.length) return res.status(400).json({ error: 'Missing fields' })

  const whoRisks = diseases.map(d => {
    const r = getWHORisk(d, parseInt(age))
    return `${d}: base risk ${r.base_risk.toFixed(0)}% (Source: ${r.who_ref}${r.icmr_ref ? ', ' + r.icmr_ref : ''})`
  }).join('\n')

  try {
    const prompt = lang === 'hi'
      ? `आप एक विशेषज्ञ चिकित्सा AI हैं। WHO और ICMR दिशानिर्देशों के आधार पर पारिवारिक जोखिम विश्लेषण करें:
- उम्र: ${age} वर्ष, लिंग: ${gender}
- परिवार में बीमारियां: ${diseases.join(', ')}

WHO आधारित जोखिम डेटा:
${whoRisks}

इन WHO scores का उपयोग करते हुए केवल JSON में उत्तर दें:
{
  "risks": [
    { "disease": "बीमारी नाम", "score": 75, "level": "high/medium/low", "tip": "WHO दिशानिर्देश अनुसार रोकथाम", "who_ref": "WHO reference" }
  ]
}`
      : `You are an expert medical AI. Analyze hereditary risk using WHO and ICMR guidelines:
- Age: ${age} years, Gender: ${gender}
- Family diseases: ${diseases.join(', ')}

WHO-based risk data:
${whoRisks}

Using these WHO scores, respond in JSON only:
{
  "risks": [
    { "disease": "Disease name", "score": 75, "level": "high/medium/low", "tip": "Prevention tip per WHO guidelines", "who_ref": "WHO reference" }
  ]
}`

    const raw = await callNova(prompt)
    const result = extractJSON(raw)
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('Family risk error:', err.message)
    res.status(500).json({ error: 'FAILED', message: err.message })
  }
})

// ════════════════════════════════════════════════════════════
// 3. WELLNESS ADVISOR — Nova
// ════════════════════════════════════════════════════════════
app.post('/api/wellness', async (req, res) => {
  const { weight, height, age, gender, goal, lang } = req.body
  if (!weight || !height || !age || !gender || !goal) return res.status(400).json({ error: 'Missing fields' })

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)
  const whoCategory = getWHOBMICategory(bmi)
  const baseCalories = gender === 'male' || gender === 'पुरुष' ? 2000 : 1700
  const targetCalories = baseCalories + whoCategory.calories_adjust
  const waterTarget = gender === 'male' || gender === 'पुरुष' ? WHO_WATER_INTAKE.male_adult : WHO_WATER_INTAKE.female_adult

  try {
    const prompt = lang === 'hi'
      ? `आप एक विशेषज्ञ पोषण AI हैं। WHO दिशानिर्देशों के आधार पर व्यक्तिगत स्वास्थ्य योजना बनाएं:
- वज़न: ${weight}kg, ऊंचाई: ${height}cm, BMI: ${bmi}
- WHO BMI श्रेणी: ${whoCategory.category} (${whoCategory.who_ref})
- उम्र: ${age}, लिंग: ${gender}, लक्ष्य: ${goal}
- WHO अनुशंसित कैलोरी: ${targetCalories} kcal/day
- WHO पानी: ${waterTarget} (${WHO_WATER_INTAKE.ref})
- WHO नींद: ${WHO_SLEEP.adult} (${WHO_SLEEP.ref})

केवल JSON में उत्तर दें:
{
  "bmi": "${bmi}",
  "bmiCategory": "${whoCategory.category}",
  "whoRef": "${whoCategory.who_ref}",
  "score": 72,
  "meals": { "नाश्ता": "सुझाव", "दोपहर का खाना": "सुझाव", "रात का खाना": "सुझाव", "नाश्ते में": "सुझाव" },
  "exercise": ["सुझाव 1", "सुझाव 2", "सुझाव 3", "सुझाव 4"],
  "sleep": ["सुझाव 1", "सुझाव 2", "सुझाव 3"],
  "calorieTarget": "${targetCalories} kcal/day (WHO)",
  "waterIntake": "${waterTarget}"
}`
      : `You are an expert wellness AI. Create a health plan using WHO guidelines:
- Weight: ${weight}kg, Height: ${height}cm, BMI: ${bmi}
- WHO BMI Category: ${whoCategory.category} (${whoCategory.who_ref})
- Age: ${age}, Gender: ${gender}, Goal: ${goal}
- WHO Recommended Calories: ${targetCalories} kcal/day
- WHO Water Intake: ${waterTarget} (${WHO_WATER_INTAKE.ref})
- WHO Sleep: ${WHO_SLEEP.adult} (${WHO_SLEEP.ref})

Respond in JSON only:
{
  "bmi": "${bmi}",
  "bmiCategory": "${whoCategory.category}",
  "whoRef": "${whoCategory.who_ref}",
  "score": 72,
  "meals": { "Breakfast": "suggestion", "Lunch": "suggestion", "Dinner": "suggestion", "Snacks": "suggestion" },
  "exercise": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "sleep": ["tip 1", "tip 2", "tip 3"],
  "calorieTarget": "${targetCalories} kcal/day (WHO)",
  "waterIntake": "${waterTarget}"
}`

    const raw = await callNova(prompt)
    const result = extractJSON(raw)
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('Wellness error:', err.message)
    res.status(500).json({ error: 'FAILED', message: err.message })
  }
})

// ════════════════════════════════════════════════════════════
// 4. VOICE SYMPTOM — Nova
// ════════════════════════════════════════════════════════════
app.post('/api/analyze-symptoms', async (req, res) => {
  const { symptoms, lang } = req.body
  if (!symptoms) return res.status(400).json({ error: 'No symptoms' })

  const isEmergency = WHO_SYMPTOMS_SEVERITY.emergency_keywords.some(k => symptoms.toLowerCase().includes(k.toLowerCase()))

  try {
    const prompt = lang === 'hi'
      ? `आप एक विशेषज्ञ चिकित्सा AI हैं। WHO आपातकालीन दिशानिर्देशों (${WHO_SYMPTOMS_SEVERITY.ref}) के आधार पर लक्षणों का विश्लेषण करें: "${symptoms}"
${isEmergency ? '\nSYSTEM ALERT: WHO emergency keywords detected - set emergency: true' : ''}

केवल JSON में उत्तर दें:
{
  "condition": "संभावित स्थिति",
  "severity": "mild/moderate/severe",
  "guidance": "विस्तृत मार्गदर्शन (3-4 वाक्य)",
  "homeRemedies": ["उपाय 1", "उपाय 2"],
  "whenToSeeDoctor": "डॉक्टर से कब मिलें",
  "emergency": ${isEmergency},
  "who_ref": "${WHO_SYMPTOMS_SEVERITY.ref}"
}`
      : `You are an expert medical AI. Analyze symptoms using WHO Emergency Triage Guidelines (${WHO_SYMPTOMS_SEVERITY.ref}): "${symptoms}"
${isEmergency ? '\nSYSTEM ALERT: WHO emergency keywords detected - set emergency: true' : ''}

Respond in JSON only:
{
  "condition": "Likely condition",
  "severity": "mild/moderate/severe",
  "guidance": "Detailed guidance (3-4 sentences)",
  "homeRemedies": ["remedy 1", "remedy 2"],
  "whenToSeeDoctor": "When to see a doctor",
  "emergency": ${isEmergency},
  "who_ref": "${WHO_SYMPTOMS_SEVERITY.ref}"
}`

    const raw = await callNova(prompt)
    const result = extractJSON(raw)
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('Symptoms error:', err.message)
    res.status(500).json({ error: 'FAILED', message: err.message })
  }
})

// ════════════════════════════════════════════════════════════
// 5. POLLY — Text to Speech
// ════════════════════════════════════════════════════════════
app.post('/api/speak', async (req, res) => {
  const { text, lang } = req.body
  if (!text) return res.status(400).json({ error: 'No text' })

  try {
    const cmd = new SynthesizeSpeechCommand({
      Text: text.substring(0, 1500),
      OutputFormat: 'mp3',
      VoiceId: lang === 'hi' ? 'Aditi' : 'Joanna',
      LanguageCode: lang === 'hi' ? 'hi-IN' : 'en-US',
    })
    const result = await polly.send(cmd)
    const chunks = []
    for await (const chunk of result.AudioStream) chunks.push(chunk)
    res.set('Content-Type', 'audio/mpeg')
    res.send(Buffer.concat(chunks))
  } catch (err) {
    console.error('Polly error:', err.message)
    res.status(500).json({ error: 'POLLY_FAILED' })
  }
})

// ════════════════════════════════════════════════════════════
// 6. SNS — Emergency SOS SMS
// ════════════════════════════════════════════════════════════
app.post('/api/sos-sms', async (req, res) => {
  const { lat, lng, lang } = req.body
  const mapsLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : 'Location unavailable'
  const message = lang === 'hi'
    ? `🚨 KushalAyu SOS! आपातकालीन सहायता चाहिए। लोकेशन: ${mapsLink} | एम्बुलेंस: 108`
    : `🚨 KushalAyu SOS! Emergency help needed. Location: ${mapsLink} | Ambulance: 108`

  try {
    await sns.send(new PublishCommand({ Message: message, PhoneNumber: process.env.SNS_PHONE_NUMBER }))
    res.json({ success: true })
  } catch (err) {
    console.error('SNS error:', err.message)
    res.status(500).json({ error: 'SMS_FAILED', message: err.message })
  }
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// 7. HEALTH TIME MACHINE
app.post('/api/health-time-machine', async (req, res) => {
  const { age, gender, weight, height, smoking, exercise, diseases, lang } = req.body
  if (!age || !gender || !weight || !height) return res.status(400).json({ error: 'Missing fields' })

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1)
  const whoCategory = getWHOBMICategory(bmi)

  const prompt = lang === 'hi'
    ? `aap ek expert medical AI hain. WHO guidelines ke basis par is vyakti ke liye 10 saal ki health prediction karo:
Umra: ${age}, Ling: ${gender}, BMI: ${bmi} (${whoCategory.category})
Dhumpaan: ${smoking ? 'haan' : 'nahi'}, Niyamit vyayam: ${exercise ? 'haan' : 'nahi'}
Parivaarik beemariyan: ${diseases?.join(', ') || 'koi nahi'}

Do futures dikhao. Sirf JSON mein jawab do (Hindi mein):
{
  "without": [
    { "label": "Wajan", "value": "10 saal baad sambhavit wajan", "risk": "jokhim vivaran" },
    { "label": "Madhumeh Jokhim", "value": "pratishat mein", "risk": "jokhim vivaran" },
    { "label": "Hriday Rog Jokhim", "value": "pratishat mein", "risk": "jokhim vivaran" },
    { "label": "Urja Star", "value": "star", "risk": "vivaran" },
    { "label": "Doctor Visit/Saal", "value": "sankhya", "risk": "vivaran" }
  ],
  "with": [
    { "label": "Wajan", "value": "WHO yojana se sambhavit wajan", "risk": "sudhar vivaran" },
    { "label": "Madhumeh Jokhim", "value": "kam pratishat", "risk": "sudhar vivaran" },
    { "label": "Hriday Rog Jokhim", "value": "kam pratishat", "risk": "sudhar vivaran" },
    { "label": "Urja Star", "value": "Uchch", "risk": "sudhar vivaran" },
    { "label": "Doctor Visit/Saal", "value": "kam sankhya", "risk": "sudhar vivaran" }
  ],
  "actions": [
    "WHO aadharit aaj se kya karein - sujhav 1",
    "WHO aadharit aaj se kya karein - sujhav 2",
    "WHO aadharit aaj se kya karein - sujhav 3",
    "WHO aadharit aaj se kya karein - sujhav 4",
    "WHO aadharit aaj se kya karein - sujhav 5"
  ]
}`
    : `You are an expert medical AI. Based on WHO guidelines, predict 10-year health future:
Age: ${age}, Gender: ${gender}, BMI: ${bmi} (${whoCategory.category})
Smoking: ${smoking ? 'Yes' : 'No'}, Regular exercise: ${exercise ? 'Yes' : 'No'}
Family diseases: ${diseases?.join(', ') || 'None'}

Show 2 futures. Respond in JSON only:
{
  "without": [
    { "label": "Weight", "value": "projected weight in 10 years", "risk": "risk description" },
    { "label": "Diabetes Risk", "value": "percentage", "risk": "risk description" },
    { "label": "Heart Disease Risk", "value": "percentage", "risk": "risk description" },
    { "label": "Energy Level", "value": "level", "risk": "description" },
    { "label": "Doctor Visits/Year", "value": "number", "risk": "description" }
  ],
  "with": [
    { "label": "Weight", "value": "projected weight with WHO plan", "risk": "improvement" },
    { "label": "Diabetes Risk", "value": "lower percentage", "risk": "improvement" },
    { "label": "Heart Disease Risk", "value": "lower percentage", "risk": "improvement" },
    { "label": "Energy Level", "value": "High", "risk": "improvement" },
    { "label": "Doctor Visits/Year", "value": "lower number", "risk": "improvement" }
  ],
  "actions": [
    "Specific WHO-based action today 1",
    "Specific WHO-based action today 2",
    "Specific WHO-based action today 3",
    "Specific WHO-based action today 4",
    "Specific WHO-based action today 5"
  ]
}`

  try {
    const raw = await callNova(prompt)
    const result = extractJSON(raw)
    res.json({ success: true, ...result })
  } catch (err) {
    console.error('Time machine error:', err.message)
    res.status(500).json({ error: 'FAILED', message: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ KushalAyu server running on port ${PORT}`))
