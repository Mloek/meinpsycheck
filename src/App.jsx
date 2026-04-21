import { useState, useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const colors = {
  primary: '#2D6A4F',
  primaryLight: '#E8F5E9',
  text: '#1a1a2e',
  textMuted: '#555',
  textLight: '#999',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E8E8E8',
  crisis: '#B71C1C',
  crisisBg: '#FFEBEE',
}

// PHQ9: 8 Fragen (Item 9 = Suizid ist ein eigener Screen)
const PHQ9_FRAGEN = [
  { id: 'phq9_1', text: 'Wenig Interesse oder Freude an Ihren Tätigkeiten' },
  { id: 'phq9_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq9_3', text: 'Schwierigkeiten, ein- oder durchzuschlafen, oder vermehrter Schlaf' },
  { id: 'phq9_4', text: 'Müdigkeit oder Gefühl, keine Energie zu haben' },
  { id: 'phq9_5', text: 'Verminderter Appetit oder übermäßiges Bedürfnis zu essen' },
  { id: 'phq9_6', text: 'Schlechte Meinung von sich selbst; Gefühl, ein Versager zu sein oder die Familie enttäuscht zu haben' },
  { id: 'phq9_7', text: 'Schwierigkeiten, sich auf etwas zu konzentrieren, z. B. beim Zeitungslesen oder Fernsehen' },
  { id: 'phq9_8', text: 'Waren Ihre Bewegungen oder Ihre Sprache so verlangsamt, dass es auch anderen auffallen würde? Oder waren Sie im Gegenteil \u201ezappelig\u201c oder ruhelos und hatten dadurch einen stärkeren Bewegungsdrang als sonst?' },
]

const GAD7_FRAGEN = [
  { id: 'gad7_1', text: 'Gefühle der Nervosität, Ängstlichkeit oder Anspannung' },
  { id: 'gad7_2', text: 'Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren' },
  { id: 'gad7_3', text: 'Übermäßige Sorgen bezüglich verschiedener Angelegenheiten' },
  { id: 'gad7_4', text: 'Schwierigkeiten, sich zu entspannen' },
  { id: 'gad7_5', text: 'So rastlos sein, dass das Stillsitzen schwer fällt' },
  { id: 'gad7_6', text: 'Schnelle Verärgerung oder Gereiztheit' },
  { id: 'gad7_7', text: 'Angstgefühle, so als könnte etwas Schreckliches passieren' },
]

const ASRS_FRAGEN = [
  { id: 'asrs_1', text: 'Wie oft haben Sie Probleme, die letzten Feinheiten einer Arbeit zum Abschluss zu bringen, nachdem Sie die wesentlichen Punkte erledigt haben?' },
  { id: 'asrs_2', text: 'Wie oft fällt es Ihnen schwer, Dinge in die Reihe zu bekommen, wenn Sie an einer Aufgabe arbeiten, bei der Organisation gefragt ist?' },
  { id: 'asrs_3', text: 'Wie oft haben Sie Probleme, sich an Termine oder Verabredungen zu erinnern?' },
  { id: 'asrs_4', text: 'Wie oft vermeiden Sie oder verzögern Sie, die Aufgabe zu beginnen, wenn Sie vor einer Aufgabe stehen, bei der sehr viel Denkvermögen gefragt ist?' },
  { id: 'asrs_5', text: 'Wie oft sind Ihre Hände bzw. Füße bei langem Sitzen in Bewegung?' },
  { id: 'asrs_6', text: 'Wie oft fühlen Sie sich übermäßig aktiv und verspüren den Drang Dinge zu tun, als ob Sie von einem Motor angetrieben würden?' },
]

const ANTWORTEN_STANDARD = [
  { wert: 0, label: 'Überhaupt nicht' },
  { wert: 1, label: 'An einzelnen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]

// GAD-7 verwendet laut Löwe et al. 2008 dieselben Labels wie PHQ-9
const ANTWORTEN_GAD7 = ANTWORTEN_STANDARD

const ANTWORTEN_ASRS = [
  { wert: 0, label: 'Niemals' },
  { wert: 1, label: 'Selten' },
  { wert: 2, label: 'Manchmal' },
  { wert: 3, label: 'Oft' },
  { wert: 4, label: 'Sehr oft' },
]

// WHO-5 Wellbeing Index – validierter deutscher Wortlaut (WHO, 1998)
// Skala 0–5 pro Item, Gesamtscore × 4 = 0–100 (höher = besser)
const WHO5_FRAGEN = [
  { id: 'who5_1', text: 'Ich bin froh und guter Stimmung gewesen' },
  { id: 'who5_2', text: 'Ich habe mich ruhig und entspannt gefühlt' },
  { id: 'who5_3', text: 'Ich habe mich aktiv und lebhaft gefühlt' },
  { id: 'who5_4', text: 'Ich bin ausgeruht aufgewacht und habe mich frisch gefühlt' },
  { id: 'who5_5', text: 'Mein Alltag ist voller Dinge, die mich interessieren' },
]

const ANTWORTEN_WHO5 = [
  { wert: 5, label: 'Die ganze Zeit' },
  { wert: 4, label: 'Meistens' },
  { wert: 3, label: 'Etwas mehr als die Hälfte der Zeit' },
  { wert: 2, label: 'Etwas weniger als die Hälfte der Zeit' },
  { wert: 1, label: 'Ab und zu' },
  { wert: 0, label: 'Zu keinem Zeitpunkt' },
]

// Reihenfolge: PHQ-9 → GAD-7 → WHO-5 (alle "letzte 2 Wochen") → ASRS ("letzte 6 Monate")
const INSTRUMENTE = ['PHQ9', 'GAD7', 'WHO5', 'ASRS']

const INSTRUMENT_CONFIG = {
  PHQ9: { fragen: PHQ9_FRAGEN, antworten: ANTWORTEN_STANDARD, zeitrahmen: 'In den letzten 2 Wochen:' },
  GAD7: { fragen: GAD7_FRAGEN, antworten: ANTWORTEN_GAD7, zeitrahmen: 'In den letzten 2 Wochen:' },
  WHO5: { fragen: WHO5_FRAGEN, antworten: ANTWORTEN_WHO5, zeitrahmen: 'In den letzten 2 Wochen:' },
  ASRS: { fragen: ASRS_FRAGEN, antworten: ANTWORTEN_ASRS, zeitrahmen: 'In den letzten 6 Monaten:' },
}

// 8 (PHQ-9) + 7 (GAD-7) + 5 (WHO-5) + 6 (ASRS) + 1 (Suizid) = 27
const GESAMT_FRAGEN = 27

function berechneErgebnisse(antworten) {
  const ergebnisse = []

  const phq9Score = PHQ9_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0) + (antworten['phq9_9'] ?? 0)
  const phq9Chips = []
  if ((antworten['phq9_1'] ?? 0) >= 2) phq9Chips.push('Freudlosigkeit') // Item 1 = Anhedonie – korrektes Mapping
  if ((antworten['phq9_3'] ?? 0) >= 2) phq9Chips.push('Schlafprobleme')
  if ((antworten['phq9_4'] ?? 0) >= 2) phq9Chips.push('Antriebslosigkeit')
  if ((antworten['phq9_6'] ?? 0) >= 2) phq9Chips.push('Grübeln')
  if ((antworten['phq9_7'] ?? 0) >= 2) phq9Chips.push('Konzentration')
  ergebnisse.push({ instrument: 'PHQ-9', label: 'Depression', score: phq9Score, cutOff: 10, stufe: phq9Score >= 10 ? 1 : phq9Score >= 5 ? 2 : 3, chips: phq9Chips })

  const gad7Score = GAD7_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0)
  const gad7Chips = []
  if ((antworten['gad7_1'] ?? 0) >= 2) gad7Chips.push('Innere Unruhe')
  if ((antworten['gad7_3'] ?? 0) >= 2) gad7Chips.push('Grübeln / Sorgen')
  if ((antworten['gad7_6'] ?? 0) >= 2) gad7Chips.push('Reizbarkeit')
  ergebnisse.push({ instrument: 'GAD-7', label: 'Angststörung', score: gad7Score, cutOff: 10, stufe: gad7Score >= 10 ? 1 : gad7Score >= 5 ? 2 : 3, chips: gad7Chips })

  const graueFelder = ASRS_FRAGEN.reduce((s, f, i) => {
    const grenze = i < 3 ? 2 : 3
    return s + ((antworten[f.id] ?? 0) >= grenze ? 1 : 0)
  }, 0)
  ergebnisse.push({ instrument: 'ASRS v1.1', label: 'ADHS', score: graueFelder, cutOff: 4, stufe: graueFelder >= 4 ? 1 : graueFelder >= 2 ? 2 : 3, chips: graueFelder >= 2 ? ['Konzentration', 'Innere Unruhe'] : [] })

  // WHO-5 Wellbeing Index (WHO, 1998) – Score 0–100, höher = besser
  // Cutoff ≤ 50 = reduziertes Wohlbefinden; ≤ 28 = stark reduziert (Kriterium für Depressions-Screening)
  const who5Score = WHO5_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0) * 4
  const who5Chips = who5Score <= 50 ? ['Chronischer Stress'] : []
  ergebnisse.push({ instrument: 'WHO-5', label: 'Allgemeines Wohlbefinden', score: who5Score, cutOff: 50, stufe: who5Score <= 28 ? 1 : who5Score <= 50 ? 2 : 3, chips: who5Chips, inverseScore: true })

  return ergebnisse
}

const ONBOARDING_SCREENS = [
  {
    label: 'Willkommen',
    titel: 'MeinPsyCheck',
    text: 'Ein wissenschaftlich fundiertes Screening-Tool zur ersten Einschätzung psychischer Beschwerden – kostenlos, anonym, ohne Konto.',
    titelGross: true,
  },
  {
    label: 'Wie es funktioniert',
    titel: 'Validierte Fragebögen. Klare Einschätzung.',
    text: 'MeinPsyCheck nutzt PHQ-9, GAD-7, WHO-5 und ASRS v1.1 – international standardisierte Instrumente aus der klinischen Praxis. Du beantwortest 27 Fragen. Das Ergebnis zeigt dir, ob Unterstützung für dich sinnvoll wäre.',
  },
  {
    label: 'Deine Privatsphäre',
    titel: 'Anonym. Lokal gespeichert. Keine Weitergabe.',
    text: 'Alle Daten bleiben ausschließlich auf deinem Gerät. Es gibt keine Registrierung, keinen Server und kein Tracking. Die App ist vollständig DSGVO-konform – du entscheidest, wann und ob du sie nutzt.',
  },
  {
    label: 'Bereit?',
    titel: 'Der Check dauert 5–10 Minuten.',
    text: 'Du kannst das Screening jederzeit unterbrechen. Nach dem Check erhältst du eine Einschätzung in drei Stufen – von unauffällig bis hin zur Empfehlung einer professionellen Abklärung.',
  },
]

function OnboardingFlow({ onWeiter }) {
  const [step, setStep] = useState(0)
  const [animClass, setAnimClass] = useState('ob-enter')
  const lottieRef = useRef(null)

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: lottieRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lottie/background.json',
    })
    return () => anim.destroy()
  }, [])

  const goTo = (next) => {
    setAnimClass('ob-exit')
    setTimeout(() => {
      setStep(next)
      setAnimClass('ob-enter')
    }, 300)
  }

  const screen = ONBOARDING_SCREENS[step]
  const isLast = step === ONBOARDING_SCREENS.length - 1

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', height: '100dvh', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #a8c5dc 0%, #b8b0cc 40%, #6b5b80 75%, #2e1f42 100%)' }}>
      <style>{`
        @keyframes obEnter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes obExit {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-16px); }
        }
        .ob-enter { animation: obEnter 500ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
        .ob-exit { animation: obExit 250ms ease-in forwards; }
      `}</style>

      {/* Lottie Hintergrund */}
      <div ref={lottieRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Oben: Blend vom Status-Bar-Ton (#a0bdd4) in den Lottie-Himmel */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '110px', background: 'linear-gradient(to bottom, #a0bdd4 0%, transparent 100%)', zIndex: 1 }} />

      {/* Unten: Gradient nur im unteren 50% – kein harter schwarzer Balken */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.72) 100%)', zIndex: 1 }} />

      {/* Content-Schicht */}
      <div style={{ position: 'relative', zIndex: 2, height: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Logo oben – immer zentriert, groß ── */}
        <div style={{ textAlign: 'center', paddingTop: 'max(52px, calc(env(safe-area-inset-top) + 16px))', paddingBottom: 8, flexShrink: 0 }}>
          <p style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.3px', textShadow: '0 1px 12px rgba(0,0,0,0.4)' }}>MeinPsyCheck</p>
        </div>

        {/* ── Freier Mittelbereich (Lottie sichtbar) ── */}
        <div style={{ flex: 1 }} />

        {/* ── Unteres Panel – Text + Buttons + Safe Area ── */}
        <div style={{ flexShrink: 0, padding: '0 24px', paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom) + 16px))' }}>
          <div key={step} className={animClass}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>{screen.label}</p>
            <h1 style={{ fontSize: screen.titelGross ? '40px' : '24px', fontWeight: '700', color: '#fff', margin: '0 0 12px', textShadow: '0 1px 16px rgba(0,0,0,0.6)', lineHeight: 1.15 }}>{screen.titel}</h1>
            <p style={{ fontSize: '14px', color: 'rgba(220,240,220,0.88)', lineHeight: '1.7', margin: '0 0 24px' }}>{screen.text}</p>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
            {ONBOARDING_SCREENS.map((_, i) => (
              <div key={i} style={{ height: '4px', borderRadius: '4px', backgroundColor: i === step ? '#ffffff' : 'rgba(255,255,255,0.45)', width: i === step ? '22px' : '8px', transition: 'all 0.3s ease' }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Zurück
              </button>
            )}
            {!isLast ? (
              <button onClick={() => goTo(step + 1)} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(255,255,255,0.22)', color: '#fff', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Weiter
              </button>
            ) : (
              <button onClick={onWeiter} style={{ flex: 1, padding: '15px', backgroundColor: '#2D6A4F', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Starten
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlterScreen({ onWeiter, onZurueck }) {
  const [name, setName] = useState('')
  const [alter, setAlter] = useState('')
  const [geschlecht, setGeschlecht] = useState('')
  const [fehler, setFehler] = useState('')

  const handleWeiter = () => {
    if (!name.trim()) { setFehler('Bitte gib deinen Namen ein.'); return }
    if (!alter || parseInt(alter) < 18 || parseInt(alter) > 99) { setFehler('Bitte gib ein gültiges Alter ein (18–99 Jahre).'); return }
    if (!geschlecht) { setFehler('Bitte wähle eine Option aus.'); return }
    localStorage.setItem('user_name', name.trim())
    localStorage.setItem('user_alter', alter)
    localStorage.setItem('user_geschlecht', geschlecht)
    localStorage.setItem('onboarding_done', 'true')
    onWeiter()
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', background: 'linear-gradient(160deg, #E8EAF6 0%, #E1F5FE 35%, #F3E5F5 70%, #EDE7F6 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top) + 16px))', marginBottom: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(90,80,130,0.7)', margin: '0 0 24px', letterSpacing: '0.5px' }}>MeinPsyCheck</p>
        <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: '#5C6BC0', fontSize: '15px', cursor: 'pointer', padding: '0 0 24px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#37474F', margin: '0 0 8px' }}>Kurz zu dir</h2>
      <p style={{ fontSize: '14px', color: '#78909C', margin: '0 0 32px', lineHeight: '1.6' }}>Diese Angaben helfen, deine Ergebnisse einzuordnen. Alles bleibt auf deinem Gerät.</p>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#546E7A', marginBottom: '8px' }}>Dein Name</label>
          <input type="text" placeholder="Vorname" value={name} onChange={(e) => { setName(e.target.value); setFehler('') }} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '1.5px solid rgba(92,107,192,0.3)', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', color: '#37474F', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#546E7A', marginBottom: '8px' }}>Dein Alter</label>
          <input type="number" min="18" max="99" placeholder="z. B. 28" value={alter} onChange={(e) => { setAlter(e.target.value); setFehler('') }} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '1.5px solid rgba(92,107,192,0.3)', borderRadius: '12px', outline: 'none', boxSizing: 'border-box', color: '#37474F', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }} />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#546E7A', marginBottom: '10px' }}>Geschlecht</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Weiblich', 'Männlich', 'Divers', 'Keine Angabe'].map((option) => (
              <button key={option} onClick={() => { setGeschlecht(option); setFehler('') }} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${geschlecht === option ? '#5C6BC0' : 'rgba(92,107,192,0.3)'}`, borderRadius: '12px', backgroundColor: geschlecht === option ? 'rgba(92,107,192,0.15)' : 'rgba(255,255,255,0.7)', color: geschlecht === option ? '#3949AB' : '#546E7A', cursor: 'pointer', fontWeight: geschlecht === option ? '600' : '400', backdropFilter: 'blur(4px)' }}>{option}</button>
            ))}
          </div>
        </div>

        {fehler && <p style={{ color: '#E53935', fontSize: '14px', margin: '0 0 16px' }}>{fehler}</p>}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 24px', paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 16px))', boxSizing: 'border-box', background: 'linear-gradient(to top, #E8EAF6 60%, transparent)' }}>
        <button onClick={handleWeiter} style={{ width: '100%', padding: '16px', backgroundColor: '#5C6BC0', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Weiter</button>
      </div>
    </div>
  )
}

function ScreeningEinstieg({ symptomAuswahl, setSymptomAuswahl, onWeiter, onZurueck }) {
  const [warnungBestaetigt, setWarnungBestaetigt] = useState(false)

  const optionen = [
    { id: 'leer', label: 'Ich fühle mich leer oder antriebslos' },
    { id: 'sorgen', label: 'Ich mache mir viele Sorgen oder bin innerlich unruhig' },
    { id: 'konzentration', label: 'Ich kann mich schlecht konzentrieren' },
    { id: 'erschoepfung', label: 'Ich bin erschöpft, egal wie viel ich schlafe' },
    { id: 'weissnicht', label: 'Ich weiß es nicht genau' },
  ]

  const toggleOption = (id) => {
    if (id === 'weissnicht') { setSymptomAuswahl(['weissnicht']); return }
    const ohneWeissNicht = symptomAuswahl.filter(s => s !== 'weissnicht')
    if (ohneWeissNicht.includes(id)) {
      setSymptomAuswahl(ohneWeissNicht.filter(s => s !== id))
    } else {
      setSymptomAuswahl([...ohneWeissNicht, id])
    }
  }

  const letztes = localStorage.getItem('screening_datum')
  const tageVergangen = letztes ? Math.floor((Date.now() - new Date(letztes)) / (1000 * 60 * 60 * 24)) : 999
  const zuFrüh = tageVergangen < 14
  const kannWeiter = symptomAuswahl.length > 0 && (!zuFrüh || warnungBestaetigt)

  return (
    <div style={{ padding: '16px' }}>
      <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: '#5B6BC8', fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 8px' }}>Screening starten</h2>
      <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>Wähle aus, welche Aussage(n) aktuell am ehesten zutreffen. Mehrfachauswahl ist möglich.</p>

      {zuFrüh && !warnungBestaetigt && (
        <div style={{ backgroundColor: '#FFF8E1', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #FFE082' }}>
          <p style={{ fontSize: '14px', color: '#F57F17', margin: '0 0 8px', fontWeight: '600' }}>Hinweis</p>
          <p style={{ fontSize: '13px', color: '#795548', margin: '0 0 12px', lineHeight: '1.6' }}>Vor {tageVergangen} Tag(en) wurde bereits ein Screening durchgeführt. Ein erneutes Screening ist in der Regel nach 14 Tagen sinnvoller.</p>
          <button onClick={() => setWarnungBestaetigt(true)} style={{ background: 'none', border: '1px solid #F57F17', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#F57F17', cursor: 'pointer' }}>Fortfahren</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {optionen.map((opt) => {
          const aktiv = symptomAuswahl.includes(opt.id)
          return (
            <button key={opt.id} onClick={() => toggleOption(opt.id)} style={{ padding: '16px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? '#5B6BC8' : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? '#eeeffa' : colors.background, color: aktiv ? '#5B6BC8' : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', lineHeight: '1.4' }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      <button onClick={onWeiter} disabled={!kannWeiter} style={{ width: '100%', padding: '16px', backgroundColor: kannWeiter ? '#5B6BC8' : colors.border, color: kannWeiter ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: kannWeiter ? 'pointer' : 'default' }}>Weiter</button>
      <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '12px' }}>27 Fragen · ca. 5–10 Minuten · Alle Angaben bleiben auf deinem Gerät</p>
    </div>
  )
}

function ScreeningFragen({ fragen, antworten: antwortOptionen, zeitrahmen, onFertig, onZurueck, bisherFragen }) {
  const [antworten, setAntworten] = useState({})
  const [aktuelleIndex, setAktuelleIndex] = useState(0)
  const [ausgewaehlt, setAusgewaehlt] = useState(-1)

  const aktuelleFrage = fragen[aktuelleIndex]
  if (!aktuelleFrage) return null
  const istLetzte = aktuelleIndex === fragen.length - 1
  const aktuelleGesamt = bisherFragen + aktuelleIndex + 1
  const prozent = Math.round((aktuelleGesamt / GESAMT_FRAGEN) * 100)

  const handleWeiter = () => {
    if (ausgewaehlt === -1) return
    const neueAntworten = { ...antworten, [aktuelleFrage.id]: ausgewaehlt }
    setAntworten(neueAntworten)
    setAusgewaehlt(-1)

    if (istLetzte) {
      onFertig(neueAntworten)
    } else {
      setAktuelleIndex(aktuelleIndex + 1)
    }
  }

  const handleZurueck = () => {
    if (aktuelleIndex > 0) {
      setAktuelleIndex(aktuelleIndex - 1)
      setAusgewaehlt(antworten[fragen[aktuelleIndex - 1].id] ?? -1)
    } else {
      onZurueck()
    }
  }

  return (
    <div style={{ padding: '16px', height: '100dvh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <button onClick={handleZurueck} style={{ background: 'none', border: 'none', color: '#5B6BC8', fontSize: '15px', cursor: 'pointer', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>← Zurück</button>

      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ height: '4px', backgroundColor: '#5B6BC8', borderRadius: '2px', width: `${prozent}%`, transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 16px', flexShrink: 0 }}>Frage {aktuelleGesamt} von {GESAMT_FRAGEN}</p>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {zeitrahmen && (
          <p style={{ fontSize: '20px', fontWeight: '400', color: colors.textMuted, lineHeight: '1.5', margin: '0 0 8px' }}>{zeitrahmen}</p>
        )}
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 24px' }}>{aktuelleFrage.text}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
          {antwortOptionen.map((opt) => {
            const aktiv = ausgewaehlt === opt.wert
            return (
              <button key={opt.wert} onClick={() => setAusgewaehlt(opt.wert)} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? '#5B6BC8' : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? '#eeeffa' : colors.background, color: aktiv ? '#5B6BC8' : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={handleWeiter} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? '#5B6BC8' : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginTop: '12px', flexShrink: 0 }}>
        Weiter
      </button>
    </div>
  )
}

function SuizidScreen({ onAntwort }) {
  const [ausgewaehlt, setAusgewaehlt] = useState(-1)

  return (
    <div style={{ padding: '16px', height: '100dvh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ height: '4px', backgroundColor: colors.primary, borderRadius: '2px', width: '100%' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 16px', flexShrink: 0 }}>Frage 27 von 27</p>

      <div style={{ backgroundColor: colors.crisisBg, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', flexShrink: 0 }}>
        <p style={{ fontSize: '13px', color: colors.crisis, margin: 0, lineHeight: '1.5' }}>
          Bitte beantworte die Frage mit Blick auf die letzten 2 Wochen.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 24px' }}>
          Gedanken, dass Sie lieber tot wären oder sich Leid zufügen möchten
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
          {ANTWORTEN_STANDARD.map((opt) => {
            const aktiv = ausgewaehlt === opt.wert
            return (
              <button key={opt.wert} onClick={() => setAusgewaehlt(opt.wert)} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? '#5B6BC8' : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? '#eeeffa' : colors.background, color: aktiv ? '#5B6BC8' : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={() => onAntwort(ausgewaehlt)} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? '#5B6BC8' : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginTop: '12px', flexShrink: 0 }}>
        Weiter
      </button>
    </div>
  )
}

function SuizidHinweisScreen({ wert, onWeiter }) {
  const config = {
    1: { bg: '#FFF8E1', border: '#FFE082', color: '#F57F17', titel: 'Hinweis', text: 'Du hast angegeben, dass dich solche Gedanken an einzelnen Tagen beschäftigt haben. Das ist ernst zu nehmen. Bitte sprich mit jemandem darüber.' },
    2: { bg: '#FFF3E0', border: '#FFCC80', color: '#E65100', titel: 'Wichtiger Hinweis', text: 'Du hast angegeben, dass dich solche Gedanken an mehr als der Hälfte der Tage beschäftigt haben. Bitte such dir Unterstützung – du musst das nicht alleine tragen.' },
    3: { bg: colors.crisisBg, border: '#FFCDD2', color: colors.crisis, titel: 'Bitte such dir jetzt Hilfe', text: 'Du hast angegeben, dass dich solche Gedanken beinahe jeden Tag beschäftigen. Das ist ein ernstes Warnsignal. Bitte nimm sofort Kontakt auf.' },
  }[wert]

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: config.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', paddingTop: 'max(32px, calc(env(safe-area-inset-top) + 16px))', paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 16px))' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: config.color, margin: '0 0 12px' }}>{config.titel}</h2>
      <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.7', margin: '0 0 28px' }}>{config.text}</p>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: `1px solid ${config.border}` }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: config.color, margin: '0 0 4px' }}>Telefonseelsorge</p>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 12px' }}>Kostenlos · anonym · 24/7 erreichbar</p>
        <a href="tel:08001110111" style={{ display: 'block', padding: '13px', backgroundColor: colors.crisis, color: '#fff', borderRadius: '10px', fontSize: '17px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>0800 111 0 111</a>
      </div>

      {wert === 3 && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '18px', marginBottom: '24px', border: `1px solid ${config.border}` }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: config.color, margin: '0 0 10px' }}>Notfall</p>
          <a href="tel:112" style={{ display: 'block', padding: '13px', backgroundColor: '#fff', color: colors.crisis, border: `2px solid ${colors.crisis}`, borderRadius: '10px', fontSize: '17px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>112 anrufen</a>
        </div>
      )}

      <button onClick={onWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: wert < 3 ? '8px' : '0' }}>
        Weiter zu den Ergebnissen
      </button>
    </div>
  )
}

// ─── SCREENING FLOW ───────────────────────────────────────────────────────────
// Ablauf: einstieg → vertiefung (PHQ-9, GAD-7, ASRS) → suizid → ergebnis ODER krise
const SCREENING_SPEICHER_KEY = 'screening_fortschritt'

function ScreeningFlow({ onZurueck }) {
  // Gespeicherten Fortschritt laden
  const gespeichert = (() => {
    try { return JSON.parse(localStorage.getItem(SCREENING_SPEICHER_KEY)) } catch { return null }
  })()

  const [phase, setPhase] = useState(gespeichert?.phase ?? 'einstieg')
  const [symptomAuswahl, setSymptomAuswahl] = useState(gespeichert?.symptomAuswahl ?? [])
  const [alleAntworten, setAlleAntworten] = useState(gespeichert?.alleAntworten ?? {})
  const [aktuellesInstrument, setAktuellesInstrument] = useState(gespeichert?.aktuellesInstrument ?? 0)
  const [ergebnisse, setErgebnisse] = useState([])
  const [suizidWert, setSuizidWert] = useState(gespeichert?.suizidWert ?? 0)

  // Fortschritt bei jeder Änderung speichern
  useEffect(() => {
    if (phase !== 'einstieg' && phase !== 'ergebnis' && phase !== 'disclaimer') {
      localStorage.setItem(SCREENING_SPEICHER_KEY, JSON.stringify({ phase, symptomAuswahl, alleAntworten, aktuellesInstrument, suizidWert }))
    }
    if (phase === 'einstieg' || phase === 'ergebnis') {
      localStorage.removeItem(SCREENING_SPEICHER_KEY)
    }
  }, [phase, alleAntworten, aktuellesInstrument, suizidWert])

  // Wie viele Fragen waren schon vor diesem Instrument?
  // PHQ-9 startet bei Frage 1  (bisherFragen=0)
  // GAD-7 startet bei Frage 9  (8 PHQ-9, bisherFragen=8)
  // WHO-5 startet bei Frage 16 (8+7=15, bisherFragen=15)
  // ASRS  startet bei Frage 21 (8+7+5=20, bisherFragen=20)
  const bisherFragenProInstrument = [0, 8, 15, 20]

  const handleVertiefungFertig = (neueAntworten) => {
    const merged = { ...alleAntworten, ...neueAntworten }
    setAlleAntworten(merged)

    const naechstesInstrument = aktuellesInstrument + 1

    if (naechstesInstrument < INSTRUMENTE.length) {
      // Noch mehr Instrumente → direkt mit dem neuen Index setzen
      setAktuellesInstrument(naechstesInstrument)
    } else {
      // Alle 25 normalen Fragen durch → jetzt kommt der Suizid-Screen
      setPhase('suizid')
    }
  }

  const handleSuizidAntwort = (wert) => {
    setSuizidWert(wert)
    const merged = { ...alleAntworten, phq9_9: wert }
    setAlleAntworten(merged)
    if (wert === 0) {
      setPhase('disclaimer')
    } else {
      setPhase('suizid_hinweis')
    }
  }

  const handleSuizidHinweisWeiter = () => {
    setPhase('disclaimer')
  }

  const handleDisclaimerWeiter = () => {
    setErgebnisse(berechneErgebnisse(alleAntworten))
    setPhase('laden')
  }

  if (phase === 'einstieg') {
    return <ScreeningEinstieg symptomAuswahl={symptomAuswahl} setSymptomAuswahl={setSymptomAuswahl} onWeiter={() => { setAktuellesInstrument(0); setPhase('vertiefung') }} onZurueck={onZurueck} />
  }

  if (phase === 'vertiefung') {
    const c = INSTRUMENT_CONFIG[INSTRUMENTE[aktuellesInstrument]]
    return <ScreeningFragen
      key={INSTRUMENTE[aktuellesInstrument]}
      fragen={c.fragen}
      antworten={c.antworten}
      zeitrahmen={c.zeitrahmen}
      onFertig={handleVertiefungFertig}
      onZurueck={() => {
        if (aktuellesInstrument > 0) setAktuellesInstrument(aktuellesInstrument - 1)
        else setPhase('einstieg')
      }}
      bisherFragen={bisherFragenProInstrument[aktuellesInstrument]}
    />
  }

  if (phase === 'suizid') {
    return <SuizidScreen onAntwort={handleSuizidAntwort} />
  }

  if (phase === 'suizid_hinweis') {
    return <SuizidHinweisScreen wert={suizidWert} onWeiter={handleSuizidHinweisWeiter} />
  }

  if (phase === 'disclaimer') {
    return <DisclaimerScreen onWeiter={handleDisclaimerWeiter} />
  }

  if (phase === 'laden') {
    return <LadeScreen onFertig={() => setPhase('ergebnis')} />
  }

  if (phase === 'ergebnis') {
    return <ScreeningErgebnis ergebnisse={ergebnisse} suizidItem={suizidWert} onNeustart={() => { setPhase('einstieg'); setAlleAntworten({}); setSymptomAuswahl([]); setSuizidWert(0) }} onZurueck={onZurueck} />
  }

  return null
}

function LadeScreen({ onFertig }) {
  const [textPhase, setTextPhase] = useState(1)
  const [textSichtbar, setTextSichtbar] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => {
      setTextSichtbar(false)
      setTimeout(() => { setTextPhase(2); setTextSichtbar(true) }, 280)
    }, 1500)
    const t2 = setTimeout(onFertig, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(160deg, #dde1ee 0%, #c9b8e8 60%, #b8a0d4 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @keyframes dotPulse { 0%,60%,100%{transform:translateY(0);opacity:0.3} 30%{transform:translateY(-9px);opacity:1} }
        @keyframes ladeFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ marginBottom: '36px', textAlign: 'center', padding: '0 40px' }}>
        <p key={textPhase} style={{ fontSize: '18px', fontWeight: '600', color: '#2a2a3e', margin: 0, lineHeight: '1.5', opacity: textSichtbar ? 1 : 0, transition: 'opacity 0.25s ease', animation: 'ladeFade 0.4s ease forwards' }}>
          {textPhase === 1 ? 'Deine Angaben werden ausgewertet\u2026' : 'Ergebnisse werden erstellt\u2026'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#5B6BC8', animation: `dotPulse 1.3s ease-in-out ${i * 0.22}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

function DisclaimerScreen({ onWeiter }) {
  return (
    <div style={{ padding: '24px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: colors.background }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px', lineHeight: '1.4' }}>
        Bevor du deine Ergebnisse siehst – ein kurzer Hinweis.
      </h2>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 16px' }}>
        Diese Auswertung ersetzt keine professionelle Diagnose – sie gibt dir jedoch eine erste Orientierung auf Basis wissenschaftlich validierter Screening-Instrumente.
      </p>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 16px' }}>
        Es ist möglich, dass in mehreren Bereichen erhöhte Werte erscheinen. Das ist häufig – psychische Beschwerden treten oft gemeinsam auf, weil sie sich gegenseitig beeinflussen.
      </p>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 40px' }}>
        Das Tagebuch in dieser App hilft dir, Veränderungen über Zeit zu beobachten.
      </p>
      <button onClick={onWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
        Zu meinen Ergebnissen
      </button>
    </div>
  )
}

function KrisenScreen() {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: colors.crisisBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#FFCDD2', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: colors.crisis }}>!</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: colors.crisis, margin: '0 0 12px' }}>Hinweis zur Sicherheit</h2>
        <p style={{ fontSize: '15px', color: '#5D2D2D', lineHeight: '1.7', margin: 0 }}>Du hast angegeben, dass dich solche Gedanken beschäftigen. Bitte ruf jetzt an – du musst das nicht alleine tragen.</p>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #FFCDD2' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: colors.crisis, margin: '0 0 6px' }}>Telefonseelsorge</p>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 14px' }}>Kostenlos · anonym · 24/7 erreichbar</p>
        <a href="tel:08001110111" style={{ display: 'block', padding: '14px', backgroundColor: colors.crisis, color: '#fff', borderRadius: '10px', fontSize: '18px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>0800 111 0 111</a>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #FFCDD2' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: colors.crisis, margin: '0 0 10px' }}>Notfall</p>
        <a href="tel:112" style={{ display: 'block', padding: '14px', backgroundColor: '#fff', color: colors.crisis, border: `2px solid ${colors.crisis}`, borderRadius: '10px', fontSize: '18px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>112 anrufen</a>
      </div>
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '24px', lineHeight: '1.6' }}>Wenn du dich aktuell in unmittelbarer Gefahr fühlst, rufe bitte den Notruf an.</p>
    </div>
  )
}

const STOERUNGSBILDER = {
  'PHQ-9': {
    kurz: 'Deine Angaben im Bereich Stimmung & Antrieb überschreiten den klinischen Grenzwert. Das deutet auf depressive Symptome hin.',
    lang: 'Der PHQ-9 ist einer der weltweit am häufigsten eingesetzten Fragebögen zur Erkennung depressiver Störungen. Die Fragen erfassen, wie oft du in den letzten zwei Wochen typische Symptome einer Depression erlebt hast – wie Antriebslosigkeit, Freudlosigkeit, Schlafprobleme oder das Gefühl, wertlos zu sein. Ein Wert über 10 bedeutet nicht, dass du „krank" bist. Er bedeutet, dass deine Beschwerden ein Ausmaß erreicht haben, bei dem professionelle Unterstützung sinnvoll und wirksam ist. Depressionen gehören zu den am besten behandelbaren psychischen Erkrankungen – über 60% aller Betroffenen fühlen sich mit Therapie deutlich besser.',
  },
  'GAD-7': {
    kurz: 'Deine Angaben im Bereich Angst & innere Anspannung überschreiten den klinischen Grenzwert. Das deutet auf eine generalisierte Angststörung hin.',
    lang: 'Der GAD-7 wurde entwickelt um zu erfassen, wie stark Sorgen und Anspannung deinen Alltag belasten. Die Fragen fragen nicht nach einzelnen Angst-Momenten, sondern nach einem anhaltenden Muster über zwei Wochen. Generalisierte Angst bedeutet nicht, dass du Angst vor einer bestimmten Sache hast – es bedeutet, dass das Nervensystem dauerhaft in einem erhöhten Alarmzustand ist. Das kostet enorm viel Energie und beeinflusst Schlaf, Konzentration und soziale Kontakte. Auch hier gilt: Das ist behandelbar. Kognitive Verhaltenstherapie zeigt bei Angststörungen sehr gute Ergebnisse.',
  },
  'ASRS v1.1': {
    kurz: 'Deine Angaben im Bereich Konzentration & Impulsivität überschreiten den klinischen Grenzwert. Das deutet auf ADHS-Symptome im Erwachsenenalter hin.',
    lang: 'Der ASRS v1.1 wurde von der Weltgesundheitsorganisation entwickelt und erfasst typische ADHS-Symptome bei Erwachsenen – Schwierigkeiten beim Abschließen von Aufgaben, Probleme mit Organisation und Planung sowie motorische Unruhe. ADHS im Erwachsenenalter wird oft spät erkannt, weil die Symptome sich anders zeigen als bei Kindern. Viele Betroffene haben jahrelang das Gefühl, sich einfach „mehr anstrengen" zu müssen – ohne zu wissen, dass ein neurobiologischer Unterschied dahintersteckt. Ein Gespräch mit einem Psychiater oder spezialisierten Psychologen kann Klarheit bringen.',
  },
  'WHO-5': {
    kurz: 'Dein allgemeines Wohlbefinden liegt unter dem klinischen Schwellenwert. Das kann ein Hinweis auf chronischen Stress, emotionale Erschöpfung oder ein erhöhtes Burnout-Risiko sein.',
    lang: 'Der WHO-5 Wohlbefindens-Index wurde von der Weltgesundheitsorganisation entwickelt und misst, wie oft du dich in den letzten zwei Wochen gut gestimmt, ruhig, aktiv, ausgeruht und interessiert gefühlt hast. Ein Wert ≤ 50 zeigt reduziertes Wohlbefinden an – nicht zwingend eine psychische Erkrankung, aber ein deutliches Signal, dass das System unter Druck steht. Chronischer Stress ist einer der häufigsten Wegbereiter für Depression und Angststörungen. Wer früh gegensteuert – durch Entspannungstechniken, Bewegung, soziale Verbindung oder professionelle Begleitung – schützt seine langfristige Gesundheit erheblich. Ein Gespräch mit dem Hausarzt oder einem Psychologen kann ein guter erster Schritt sein.',
  },
}

const RESSOURCEN_KATALOG = {
  'Freudlosigkeit': {
    erklaerung: 'Wenig Freude oder Interesse an Dingen, die früher Spaß gemacht haben – das ist eines der Kernsymptome einer depressiven Episode. Es ist kein Willensproblem, sondern ein neurobiologisches Signal.',
    interventionen: [
      { titel: 'Verhaltensaktivierung', text: 'Kleine angenehme Aktivitäten gezielt einplanen – auch wenn die Motivation fehlt. Der Antrieb folgt der Handlung, nicht umgekehrt.' },
      { titel: 'Positivtagebuch', text: 'Täglich 1–3 kleine positive Momente notieren – trainiert die Aufmerksamkeit für Freude' },
      { titel: 'Ausdauersport', text: 'Walking, Schwimmen, Radfahren – erhöht Dopamin und wirkt nachweislich antidepressiv' },
      { titel: 'Soziale Aktivität', text: 'Einen Menschen kontaktieren – auch wenn es sich nicht danach anfühlt' },
    ],
  },
  'Schlafprobleme': {
    erklaerung: 'Du hast angegeben, dass du an mehr als der Hälfte der Tage Schwierigkeiten beim Ein- oder Durchschlafen hast. Schlafprobleme sind eines der häufigsten und am besten behandelbaren Symptome.',
    interventionen: [
      { titel: 'Schlafhygiene', text: 'Feste Schlafzeiten, kein Bildschirm 45 Min. vor Schlaf, kühles Zimmer', video: 'https://youtu.be/l72IHVMcapk' },
      { titel: 'Progressive Muskelentspannung', text: 'Muskelgruppen anspannen und loslassen – Körperscan vor dem Schlafen', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: 'Stimulus-Kontrolle', text: 'Bett nur zum Schlafen nutzen, bei Wachheit aufstehen' },
      { titel: 'Schlaf-Apps', text: 'Sleep Cycle (kostenlos); 7Schläfer / TK-SchlafCoach (Kassenleistung)' },
    ],
  },
  'Grübeln': {
    erklaerung: 'Gedanken kreisen immer wieder um dieselben Themen. Grübeln fühlt sich produktiv an – ist es aber meist nicht. Es gibt konkrete Techniken, um den Kreis zu unterbrechen.',
    interventionen: [
      { titel: 'MBCT/MBSR-Einführung', text: 'Gedanken beobachten ohne zu bewerten', video: 'https://youtu.be/TSGOQaxu43o' },
      { titel: 'Worry-Time', text: '15 Min. täglich für Sorgen reservieren, Rest des Tages aktiv unterbrechen' },
      { titel: 'Verhaltensaktivierung', text: 'Kleine konkrete Aktivität planen – unterbricht den Grübelkreis' },
    ],
  },
  'Antriebslosigkeit': {
    erklaerung: 'Antriebslosigkeit ist nicht Faulheit. Es ist ein neurobiologisches Signal. Der Schlüssel ist nicht mehr Willenskraft, sondern kluge kleine Schritte.',
    interventionen: [
      { titel: 'Ausdauersport', text: 'Walking, Jogging, Radfahren – Dopamin-Anstieg, Cortisolabbau' },
      { titel: 'Krafttraining', text: 'Hantel oder Eigengewicht – wirkt nachweislich antidepressiv' },
      { titel: 'Verhaltensaktivierung', text: 'Eine Kleinstaufgabe heute, die sich machbar anfühlt' },
      { titel: 'Tagesstruktur aufbauen', text: 'Feste Aufstehzeit als erster Anker' },
    ],
  },
  'Konzentration': {
    erklaerung: 'Konzentrationsprobleme entstehen oft durch mentale Überlastung oder Schlafmangel – sie sind ein Symptom, kein Charakterfehler.',
    interventionen: [
      { titel: 'Pomodoro-Technik', text: '25 Min. fokussiert arbeiten, dann 5 Min. Pause', video: 'https://youtu.be/O8Y3WvWM42g' },
      { titel: '5-Minuten-Regel', text: 'Nur 5 Min. an einer Aufgabe starten – der Anfang ist die größte Hürde' },
      { titel: '5-4-3-2-1 Erdung', text: '5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken', video: 'https://youtu.be/TsIGZklzSyc' },
      { titel: 'Box Breathing', text: '4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten', video: 'https://youtu.be/wazCdqIBi2c' },
      { titel: '3-Minuten-Atemraum', text: 'Kurzmeditation aus der MBCT', video: 'https://youtu.be/JEmNFgt21qo' },
      { titel: 'STOPP-Technik', text: 'Stopp – Tief atmen – Beobachten – Perspektive – Weiter', video: 'https://youtu.be/Jj61HkABO7c' },
      { titel: 'Insight Timer', text: 'Kostenlose App für geführte Meditationen' },
    ],
  },
  'Innere Unruhe': {
    erklaerung: 'Innere Unruhe ist oft ein Zeichen, dass das Nervensystem im Alarmzustand ist – auch ohne sichtbaren Auslöser. Beruhigungstechniken wirken direkt auf die Körperebene.',
    interventionen: [
      { titel: 'Box Breathing', text: '4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten', video: 'https://youtu.be/wazCdqIBi2c' },
      { titel: '4-7-8 Atemtechnik', text: '4 Sek. einatmen, 7 halten, 8 ausatmen – aktiviert den Parasympathikus' },
      { titel: 'Progressive Muskelentspannung', text: 'Muskeln anspannen und loslassen – senkt Cortisol direkt', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: '5-4-3-2-1 Erdung', text: 'Sofort anwendbar bei akuter Unruhe', video: 'https://youtu.be/TsIGZklzSyc' },
    ],
  },
  'Reizbarkeit': {
    erklaerung: 'Reizbarkeit ist oft kein Charakterzug – sie ist ein Zeichen von Überlastung, Schlafmangel oder unterdrücktem Stress. Das Nervensystem reagiert schneller als der Verstand denken kann.',
    interventionen: [
      { titel: 'STOPP-Technik', text: 'Innehalten bevor man reagiert: Stopp – Atmen – Beobachten – Perspektive – Weiter', video: 'https://youtu.be/Jj61HkABO7c' },
      { titel: 'Stresstagebuch', text: 'Auslöser 1 Woche täglich notieren – Muster erkennen' },
      { titel: 'Schlafhygiene', text: 'Schlafmangel ist einer der stärksten Treiber von Reizbarkeit', video: 'https://youtu.be/l72IHVMcapk' },
      { titel: 'Grenzen setzen', text: 'Konkrete Übung: eine Anfrage diese Woche ablehnen' },
    ],
  },
  'Chronischer Stress': {
    erklaerung: 'Ein reduziertes Wohlbefinden ist oft ein Zeichen, dass das System dauerhaft unter Druck steht. Chronischer Stress ist kein Charakterfehler – er ist ein messbares Signal des Körpers.',
    interventionen: [
      { titel: 'Progressive Muskelentspannung', text: 'Muskeln anspannen und loslassen – senkt Cortisol nachweislich', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: '4-7-8 Atemtechnik', text: '4 Sek. einatmen, 7 halten, 8 ausatmen – aktiviert den Parasympathikus' },
      { titel: 'MBSR-Kurzübung', text: '10 Min. Achtsamkeit täglich – über 500 Studien belegt', video: 'https://youtu.be/TSGOQaxu43o' },
      { titel: 'Stresstagebuch', text: 'Auslöser 1 Woche täglich notieren – Muster erkennen' },
      { titel: 'Grenzen setzen', text: 'Konkrete Übung: eine Anfrage diese Woche ablehnen' },
    ],
  },
  'Sozialer Rückzug': {
    erklaerung: 'Sozialer Rückzug kann sich selbst verstärken. Nicht mehr Kontakte helfen – sondern die Gedanken darüber verändern.',
    interventionen: [
      { titel: 'Gedanken prüfen', text: 'Fehlbewertungen über soziale Situationen erkennen und hinterfragen' },
      { titel: 'Kleine soziale Handlung', text: 'Nicht \'Freunde finden\' – den Kassierer ansprechen genügt' },
      { titel: 'Strukturierte Gruppenaktivität', text: 'Kurs, Verein, Ehrenamt – ohne Beziehungsdruck' },
      { titel: 'Selbstmitgefühl', text: 'Innere Kritik bei sozialer Angst reduzieren' },
    ],
  },
}

function ScreeningErgebnis({ ergebnisse, suizidItem = 0, onNeustart, onZurueck }) {
  const höchsteStufe = Math.min(...ergebnisse.map(e => e.stufe))
  const stufe1 = ergebnisse.filter(e => e.stufe === 1)
  const stufe2 = ergebnisse.filter(e => e.stufe === 2)
  const hatStufe1 = stufe1.length > 0
  const [aufgeklappt, setAufgeklappt] = useState(null)
  const [openResKatalog, setOpenResKatalog] = useState(null)

  const accent = '#5B6BC8'
  const bg = '#dde1ee'
  const textP = '#2a2a3e'
  const textS = '#8a8faa'

  useEffect(() => {
    localStorage.setItem('screening_datum', new Date().toISOString())
    localStorage.setItem('screening_ergebnis', JSON.stringify(ergebnisse))
    const katalogToChip = {
      'Schlafprobleme': 'Schlaf', 'Grübeln': 'Grübeln', 'Grübeln / Sorgen': 'Grübeln',
      'Antriebslosigkeit': 'Antrieb', 'Konzentration': 'Konzentration',
      'Innere Unruhe': 'Innere Unruhe', 'Reizbarkeit': 'Reizbarkeit',
      'Chronischer Stress': 'Stress', 'Sozialer Rückzug': 'Sozialer Rückzug',
    }
    const alleChips = [...new Set(ergebnisse.flatMap(e => e.chips ?? []))]
    const mapped = [...new Set(alleChips.map(c => katalogToChip[c]).filter(Boolean))]
    localStorage.setItem('screening_relevant_resources', JSON.stringify(mapped))
  }, [])

  // Hero config
  const hero = hatStufe1
    ? { grad: 'linear-gradient(to bottom, #9b7ec8 0%, #7b5ea7 45%, #2d1f4a 100%)', badge: 'AUFFÄLLIG', titel: 'Erhöhte Belastung erkannt', sub: 'Deine Antworten überschreiten in mindestens einem Bereich den klinischen Schwellenwert. Ein Gespräch mit einer psychologischen oder ärztlichen Fachkraft wäre sinnvoll.' }
    : höchsteStufe === 2
    ? { grad: 'linear-gradient(to bottom, #8b9ed8 0%, #5B6BC8 50%, #3a4a9a 100%)', badge: 'LEICHT ERHÖHT', titel: 'Leichte Auffälligkeiten', sub: 'Deine Werte liegen unterhalb des klinischen Grenzwerts, zeigen aber in einzelnen Bereichen leicht erhöhte Belastung. Bei anhaltenden Beschwerden lohnt sich ein Gespräch mit einer Fachkraft.' }
    : { grad: 'linear-gradient(to bottom, #5a9e82 0%, #3d8068 45%, #1f4d3e 100%)', badge: 'UNAUFFÄLLIG', titel: 'Alles im grünen Bereich', sub: 'Deine Antworten zeigen aktuell keine auffälligen Muster – das ist eine gute Nachricht. Du kannst den Check nach 14 Tagen wiederholen.' }

  // Welche Karten anzeigen
  const karten = hatStufe1 ? stufe1 : stufe2

  // Chip → Katalog-Mapping für Ressourcen
  const chipToKatalog = {
    'Freudlosigkeit': 'Freudlosigkeit',
    'Schlafprobleme': 'Schlafprobleme', 'Grübeln': 'Grübeln', 'Grübeln / Sorgen': 'Grübeln',
    'Antriebslosigkeit': 'Antriebslosigkeit', 'Konzentration': 'Konzentration',
    'Innere Unruhe': 'Innere Unruhe', 'Reizbarkeit': 'Reizbarkeit',
    'Chronischer Stress': 'Chronischer Stress', 'Sozialer Rückzug': 'Sozialer Rückzug',
  }
  const alleRelevantChips = [...new Set(karten.flatMap(r => r.chips ?? []))]
  const relevanteKatalogKeys = [...new Set(alleRelevantChips.map(c => chipToKatalog[c]).filter(k => k && RESSOURCEN_KATALOG[k]))]

  const ressourcenConfig = [
    { katalog: 'Freudlosigkeit', label: 'Freudlosigkeit', farbe: '#e8d4f0', icon: 'spark' },
    { katalog: 'Schlafprobleme', label: 'Schlaf', farbe: '#b8d4f0', icon: 'moon' },
    { katalog: 'Grübeln', label: 'Grübeln', farbe: '#d4b8e8', icon: 'bulb' },
    { katalog: 'Antriebslosigkeit', label: 'Antrieb', farbe: '#b8e4d0', icon: 'bolt' },
    { katalog: 'Konzentration', label: 'Konzentration', farbe: '#c8d8f0', icon: 'target' },
    { katalog: 'Innere Unruhe', label: 'Innere Unruhe', farbe: '#f0b8c8', icon: 'wave' },
    { katalog: 'Reizbarkeit', label: 'Reizbarkeit', farbe: '#f0d4b8', icon: 'flame' },
    { katalog: 'Chronischer Stress', label: 'Stress', farbe: '#a8c8e0', icon: 'spiral' },
    { katalog: 'Sozialer Rückzug', label: 'Sozialer Rückzug', farbe: '#c8b8e8', icon: 'person' },
  ]
  const relevanteRessourcen = ressourcenConfig.filter(r => relevanteKatalogKeys.includes(r.katalog))

  return (
    <div style={{ background: bg, minHeight: '100dvh', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 20px))' }}>
      <style>{`
        @keyframes bergDrift1 { 0%{transform:translateX(0)} 50%{transform:translateX(-18px)} 100%{transform:translateX(0)} }
        @keyframes bergDrift2 { 0%{transform:translateX(0)} 50%{transform:translateX(12px)} 100%{transform:translateX(0)} }
        @keyframes ergebnisEin { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Suizid-Hinweis ───────────────────────────────────────── */}
      {suizidItem > 0 && (
        <div style={{ background: '#B71C1C', padding: '16px 16px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.25)"/><path d="M12 8v4M12 16h.01" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>Wichtiger Hinweis</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.88)', margin: '0 0 10px', lineHeight: '1.5' }}>Du hast Gedanken angegeben, dir selbst Schaden zuzufügen. Bitte such dir Unterstützung.</p>
            <a href="tel:08001110111" style={{ display: 'inline-block', padding: '8px 16px', background: '#fff', color: '#B71C1C', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Telefonseelsorge: 0800 111 0 111</a>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{ height: '230px', background: hero.grad, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '80px', animation: 'ergebnisEin 0.4s ease-out 0ms both' }}>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '70px', display: 'block', animation: 'bergDrift1 14s ease-in-out infinite', opacity: 0.6 }}>
          <polygon points="0,100 55,38 110,72 170,18 230,55 295,8 355,46 430,28 440,100" fill={bg} />
        </svg>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '70px', display: 'block', animation: 'bergDrift2 18s ease-in-out infinite' }}>
          <polygon points="0,100 35,52 75,70 125,32 175,58 225,22 285,52 335,18 385,42 440,32 440,100" fill={bg} opacity="0.85" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.22)', borderRadius: '100px', fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginBottom: '10px' }}>{hero.badge}</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 10px', textShadow: '0 1px 12px rgba(0,0,0,0.35)', lineHeight: '1.15' }}>{hero.titel}</h1>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0, lineHeight: '1.55' }}>{hero.sub}</p>
        </div>
      </div>

      <div style={{ padding: '0 14px' }}>

        {/* ── Diagnosen-Karten (horizontal swipebar) ──────────────── */}
        {karten.length > 0 && (
          <div style={{ animation: 'ergebnisEin 0.4s ease-out 150ms both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 4px 10px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                {hatStufe1 ? 'Auffällige Bereiche' : 'Leicht erhöhte Bereiche'}
              </p>
              {karten.length > 1 && <p style={{ fontSize: '11px', color: textS, margin: 0 }}>← swipen →</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', margin: '0 -14px', padding: '0 14px 8px' }}>
              <style>{`.diagnose-scroll::-webkit-scrollbar{display:none}`}</style>
              {karten.map((res) => {
                const info = STOERUNGSBILDER[res.instrument]
                return (
                  <div key={res.instrument} onClick={() => setAufgeklappt(res.instrument)}
                    className="diagnose-scroll"
                    style={{ background: '#fff', borderRadius: '16px', border: hatStufe1 ? '1px solid rgba(180,80,80,0.18)' : '1px solid rgba(91,107,200,0.12)', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, width: karten.length === 1 ? '100%' : 'calc(85vw)', maxWidth: '340px', scrollSnapAlign: 'start' }}>
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: hatStufe1 ? 'linear-gradient(135deg, #c87070, #9b3a3a)' : 'linear-gradient(135deg, #8b9ed8, #5B6BC8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: hatStufe1 ? '#9b3a3a' : accent, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{res.label}</p>
                        <p style={{ fontSize: '14px', color: textP, margin: 0, lineHeight: '1.5' }}>{info?.kurz ?? 'Deine Angaben liegen oberhalb des Schwellenwerts.'}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '14px' }}><path d="M9 18l6-6-6-6" stroke={textS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                )
              })}
            </div>
            {karten.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '4px 0 0' }}>
                {karten.map((_, i) => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? accent : 'rgba(91,107,200,0.25)' }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Ressourcen ──────────────────────────────────────────── */}
        {relevanteRessourcen.length > 0 && (
          <div style={{ animation: 'ergebnisEin 0.4s ease-out 300ms both' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 4px 10px' }}>Passende Ressourcen</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {relevanteRessourcen.map((res) => (
                <div key={res.katalog} onClick={() => setOpenResKatalog(openResKatalog === res.katalog ? null : res.katalog)}
                  style={{ background: '#fff', borderRadius: '14px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid rgba(91,107,200,0.1)', outline: openResKatalog === res.katalog ? `2px solid ${accent}` : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: res.farbe, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RessourceIcon typ={res.icon} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: textP, textAlign: 'center' }}>{res.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <div style={{ background: 'rgba(91,107,200,0.06)', borderRadius: '12px', padding: '14px', margin: '20px 0 0', border: '1px solid rgba(91,107,200,0.1)', animation: 'ergebnisEin 0.4s ease-out 450ms both' }}>
          <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.65' }}>
            {höchsteStufe === 1
              ? 'Dies ist kein Urteil, sondern ein Hinweis. Nur eine Fachkraft kann das wirklich einschätzen.'
              : höchsteStufe === 2
              ? 'Das ist ein Momentbild – kein dauerhaftes Urteil. Wenn die Beschwerden bleiben, lohnt sich ein Gespräch mit einer Fachkraft.'
              : 'Das ist ein Momentbild – kein dauerhaftes Urteil. Du kannst den Check nach 14 Tagen wiederholen.'}
          </p>
        </div>

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <div style={{ animation: 'ergebnisEin 0.4s ease-out 600ms both' }}>
          <button onClick={onZurueck} style={{ width: '100%', padding: '16px', background: accent, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' }}>Zur Startseite</button>
          <button onClick={onNeustart} style={{ width: '100%', padding: '14px', background: 'transparent', color: textS, border: '1px solid rgba(91,107,200,0.2)', borderRadius: '14px', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>Neues Screening starten</button>
        </div>
      </div>

      {/* ── Diagnose Detail Overlay ──────────────────────────────── */}
      {aufgeklappt && (() => {
        const res = karten.find(r => r.instrument === aufgeklappt)
        const info = res ? STOERUNGSBILDER[res.instrument] : null
        if (!res || !info?.lang) return null
        return (
          <>
            <div onClick={() => setAufgeklappt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,40,0.55)', zIndex: 200 }} />
            <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 28px)', maxWidth: '400px', background: '#fff', borderRadius: '20px', zIndex: 201, padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: hatStufe1 ? 'linear-gradient(135deg, #c87070, #9b3a3a)' : 'linear-gradient(135deg, #8b9ed8, #5B6BC8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: textP, margin: 0 }}>{res.label}</p>
                </div>
                <button onClick={() => setAufgeklappt(null)} style={{ background: '#f0f0f5', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', color: textS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <p style={{ fontSize: '13px', color: textS, lineHeight: '1.75', margin: 0 }}>{info.lang}</p>
            </div>
          </>
        )
      })()}

      {/* ── Ressource Detail Overlay ─────────────────────────────── */}
      {openResKatalog && RESSOURCEN_KATALOG[openResKatalog] && (
        <>
          <div onClick={() => setOpenResKatalog(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,40,0.55)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '20px', zIndex: 201, padding: '20px', maxHeight: '80vh', overflowY: 'auto', margin: '0 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', color: textP, margin: 0 }}>{openResKatalog}</p>
              <button onClick={() => setOpenResKatalog(null)} style={{ background: '#f0f0f5', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', color: textS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: textS, lineHeight: '1.7', margin: '0 0 14px' }}>{RESSOURCEN_KATALOG[openResKatalog].erklaerung}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {RESSOURCEN_KATALOG[openResKatalog].interventionen.map((inv) => (
                <div key={inv.titel} style={{ background: '#f6f7fb', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: textP, margin: '0 0 4px' }}>{inv.titel}</p>
                  <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.55' }}>{inv.text}</p>
                  {inv.video && <a href={inv.video} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: accent, textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>Video ansehen</a>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const IS_DEV = import.meta.env.DEV

const TOUR_SCHRITTE = [
  { tourKey: 'screening-karte', titel: 'Dein persönlicher Check', text: 'Hier beantwortest du 26 wissenschaftlich validierte Fragen. Je ehrlicher du antwortest, desto hilfreicher ist dein Ergebnis – es gibt keine richtigen oder falschen Antworten.' },
  { tourKey: 'tagebuch-widget', titel: 'Dein Tagebuch', text: 'Trage täglich ein, wie es dir geht. Mit der Zeit erkennst du Muster – und du kannst deinen Verlauf als PDF zum Therapeutengespräch mitbringen.' },
  { tourKey: 'therapeuten-tab', titel: 'Hilfe & Anlaufstellen', text: 'Hier findest du Therapeuten, Krisentelefone und weitere Anlaufstellen – für den Fall, dass du professionelle Unterstützung suchst.' },
  { tourKey: 'ressourcen-bereich', titel: 'Deine Ressourcen', text: 'Nach deinem Screening bekommst du passende Ressourcen vorgeschlagen – abgestimmt auf deine Ergebnisse.' },
]

const THERAPEUTEN_TOUR = [
  { tourKey: 'therapeuten-karte', titel: 'Therapeuten in deiner Nähe', text: 'Hier siehst du Psychotherapeuten in der Nähe. Filtere nach freien Terminen und tippe auf einen Eintrag für Details.' },
  { tourKey: 'therapeuten-liste', titel: 'Vergleichen auf einen Blick', text: 'Scrolle durch die Liste, um Bewertungen und Verfügbarkeit zu vergleichen. Tippe auf einen Therapeuten für mehr Details.' },
]

function TourOverlay({ schritte, schritt, onWeiter, onUeberspringen }) {
  if (schritt === null) return null
  const aktuell = schritte[schritt]
  const istLetzte = schritt === schritte.length - 1
  const accent = '#5B6BC8'

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px', zIndex: 10000,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '20px 20px',
        paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 16px))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 36, height: 4, background: '#e5e7ef', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {schritte.map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === schritt ? accent : 'rgba(91,107,200,0.2)', transition: 'background 0.2s' }} />
          ))}
        </div>
        <p style={{ fontSize: '17px', fontWeight: '700', color: '#2a2a3e', margin: '0 0 8px', textAlign: 'center' }}>{aktuell.titel}</p>
        <p style={{ fontSize: '14px', color: '#8a8faa', margin: '0 0 24px', lineHeight: '1.6', textAlign: 'center' }}>{aktuell.text}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onUeberspringen} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: '#aab0c8', fontSize: '14px', cursor: 'pointer' }}>Überspringen</button>
          <button onClick={onWeiter} style={{ flex: 2, padding: '12px', background: accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{istLetzte ? 'Verstanden' : 'Weiter'}</button>
        </div>
      </div>
    </>
  )
}

function HauptApp() {
  const [aktiveTab, setAktiveTab] = useState('home')
  const [tagebuchOffen, setTagebuchOffen] = useState(false)
  const [tagebuchStartAnsicht, setTagebuchStartAnsicht] = useState(null)
  const [screeningOffen, setScreeningOffen] = useState(false)
  const [testErgebnis, setTestErgebnis] = useState(null)
  const [verlassenDialog, setVerlassenDialog] = useState(null)
  const [tourSchritt, setTourSchritt] = useState(null)
  const [therapeutenTourSchritt, setTherapeutenTourSchritt] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('tour_completed')) {
      setTimeout(() => setTourSchritt(0), 700)
    }
  }, [])

  useEffect(() => {
    if (aktiveTab === 'therapeuten' && tourSchritt === null && !localStorage.getItem('therapeuten_tour_done')) {
      setTimeout(() => setTherapeutenTourSchritt(0), 500)
    }
  }, [aktiveTab])

  const handleTourWeiter = () => {
    if (tourSchritt < TOUR_SCHRITTE.length - 1) { setTourSchritt(s => s + 1) }
    else { setTourSchritt(null); localStorage.setItem('tour_completed', 'true') }
  }
  const handleTourUeberspringen = () => { setTourSchritt(null); localStorage.setItem('tour_completed', 'true') }

  const handleTherapeutenTourWeiter = () => {
    if (therapeutenTourSchritt < THERAPEUTEN_TOUR.length - 1) { setTherapeutenTourSchritt(s => s + 1) }
    else { setTherapeutenTourSchritt(null); localStorage.setItem('therapeuten_tour_done', 'true') }
  }
  const handleTherapeutenTourUeberspringen = () => { setTherapeutenTourSchritt(null); localStorage.setItem('therapeuten_tour_done', 'true') }

  const handleTourNeuStarten = () => {
    localStorage.removeItem('tour_completed')
    setAktiveTab('home')
    setTagebuchOffen(false)
    setScreeningOffen(false)
    setTimeout(() => setTourSchritt(0), 300)
  }

  const handleTagebuchOeffnen = (startAnsicht) => {
    setTagebuchStartAnsicht(startAnsicht || null)
    setTagebuchOffen(true)
  }

  const handleTestErgebnis = (ergebnisse) => {
    setTestErgebnis(ergebnisse)
    setScreeningOffen(true)
  }

  const handleTabKlick = (tabId) => {
    if (screeningOffen && !testErgebnis) {
      setVerlassenDialog(tabId)
    } else {
      setAktiveTab(tabId)
      setTagebuchOffen(false)
      setScreeningOffen(false)
    }
  }

  const handleSpeichern = () => {
    // Fortschritt bleibt in localStorage (ScreeningFlow hat bereits gespeichert)
    setScreeningOffen(false)
    setAktiveTab(verlassenDialog)
    setVerlassenDialog(null)
  }

  const handleVerwerfen = () => {
    localStorage.removeItem(SCREENING_SPEICHER_KEY)
    setScreeningOffen(false)
    setAktiveTab(verlassenDialog)
    setVerlassenDialog(null)
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', backgroundColor: '#dde1ee', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(70px + env(safe-area-inset-bottom))' }}>
        {aktiveTab === 'home' && !tagebuchOffen && !screeningOffen && <Hauptseite onTagebuchOeffnen={handleTagebuchOeffnen} onScreeningOeffnen={() => setScreeningOffen(true)} onTestErgebnis={IS_DEV ? handleTestErgebnis : undefined} />}
        {aktiveTab === 'home' && tagebuchOffen && <Tagebuch onZurueck={() => { setTagebuchOffen(false); setTagebuchStartAnsicht(null) }} startAnsicht={tagebuchStartAnsicht} />}
        {aktiveTab === 'home' && screeningOffen && (testErgebnis
          ? <ScreeningErgebnis ergebnisse={testErgebnis} suizidItem={0} onNeustart={() => { setScreeningOffen(false); setTestErgebnis(null) }} onZurueck={() => { setScreeningOffen(false); setTestErgebnis(null) }} />
          : <ScreeningFlow onZurueck={() => setScreeningOffen(false)} />
        )}
        {aktiveTab === 'therapeuten' && <TherapeutenPlatzhalter />}
        {aktiveTab === 'einstellungen' && <Einstellungen onTourNeuStarten={handleTourNeuStarten} />}
      </div>

      {/* ── Tab-Wechsel-Dialog ──────────────────────────────────── */}
      {verlassenDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,60,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 20px 36px', width: '100%', maxWidth: '430px' }}>
            <p style={{ fontSize: '17px', fontWeight: '700', color: '#2a2a3e', margin: '0 0 8px', textAlign: 'center' }}>Fragebogen pausieren?</p>
            <p style={{ fontSize: '14px', color: '#8a8faa', margin: '0 0 24px', textAlign: 'center', lineHeight: '1.5' }}>Dein Fortschritt wird gespeichert. Du kannst später weitermachen.</p>
            <button onClick={handleSpeichern} style={{ width: '100%', padding: '14px', background: '#5B6BC8', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
              Speichern &amp; später weitermachen
            </button>
            <button onClick={handleVerwerfen} style={{ width: '100%', padding: '14px', background: '#f0f1f8', color: '#5B6BC8', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
              Neu anfangen (Fortschritt löschen)
            </button>
            <button onClick={() => setVerlassenDialog(null)} style={{ width: '100%', padding: '14px', background: 'none', color: '#8a8faa', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
              Zurück zum Fragebogen
            </button>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', backgroundColor: '#fff', borderTop: '1px solid rgba(91,107,200,0.12)', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[{ id: 'home', label: 'Hauptseite' }, { id: 'therapeuten', label: 'Therapeuten' }, { id: 'einstellungen', label: 'Einstellungen' }].map((tab) => (
          <button key={tab.id} onClick={() => handleTabKlick(tab.id)} {...(tab.id === 'therapeuten' ? { 'data-tour': 'therapeuten-tab' } : {})} style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', borderTop: `2px solid ${aktiveTab === tab.id ? '#5B6BC8' : 'transparent'}`, cursor: 'pointer', fontSize: '11px', fontWeight: aktiveTab === tab.id ? '600' : '400', color: aktiveTab === tab.id ? '#5B6BC8' : '#aab0c8' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {tourSchritt !== null && (
        <TourOverlay schritte={TOUR_SCHRITTE} schritt={tourSchritt} onWeiter={handleTourWeiter} onUeberspringen={handleTourUeberspringen} />
      )}
      {therapeutenTourSchritt !== null && (
        <TourOverlay schritte={THERAPEUTEN_TOUR} schritt={therapeutenTourSchritt} onWeiter={handleTherapeutenTourWeiter} onUeberspringen={handleTherapeutenTourUeberspringen} />
      )}
    </div>
  )
}

const CHIP_TO_KATALOG = {
  'Schlaf': 'Schlafprobleme',
  'Grübeln': 'Grübeln',
  'Antrieb': 'Antriebslosigkeit',
  'Konzentration': 'Konzentration',
  'Innere Unruhe': 'Innere Unruhe',
  'Reizbarkeit': 'Reizbarkeit',
  'Sozialer Rückzug': 'Sozialer Rückzug',
}

function RessourceIcon({ typ }) {
  const s = { width: 20, height: 20 }
  if (typ === 'moon') return <svg style={s} viewBox="0 0 24 24" fill="white"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
  if (typ === 'bulb') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  if (typ === 'bolt') return <svg style={s} viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  if (typ === 'target') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="white"/></svg>
  if (typ === 'wave') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/></svg>
  if (typ === 'flame') return <svg style={s} viewBox="0 0 24 24" fill="white"><path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/></svg>
  if (typ === 'spiral') return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0"/><path d="M12 10V6M12 18v-4M10 12H6M18 12h-4"/></svg>
  if (typ === 'person') return <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" fill="white"/><path d="M6 20c0-4 2.7-6 6-6s6 2 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M3 12h3M18 12h3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
  return null
}

function Hauptseite({ onTagebuchOeffnen, onScreeningOeffnen, onTestErgebnis }) {
  const [openResName, setOpenResName] = useState(null)
  const hatFortschritt = !!localStorage.getItem(SCREENING_SPEICHER_KEY)

  const now = new Date()
  const hour = now.getHours()
  const userName = localStorage.getItem('user_name') || ''
  const grussFormel = hour >= 5 && hour < 11 ? 'Guten Morgen'
    : hour >= 11 && hour < 17 ? 'Guten Tag'
      : hour >= 17 && hour < 22 ? 'Guten Abend'
        : 'Hallo'
  const greetingText = (userName ? `${grussFormel}, ${userName}` : grussFormel).toUpperCase()

  const heuteKey = now.toISOString().split('T')[0]

  // Hero-Mode: Screening oder Tagebuch
  const lastScreening = localStorage.getItem('screening_datum')
  const daysSince = lastScreening ? (Date.now() - new Date(lastScreening)) / 86400000 : 999
  const heroMode = daysSince < 14 ? 'tagebuch' : 'screening'

  // Wochentage
  const montag = new Date(now)
  const tagInWoche = now.getDay() === 0 ? 7 : now.getDay()
  montag.setDate(now.getDate() - (tagInWoche - 1))
  montag.setHours(0, 0, 0, 0)
  const wochenTage = ['M','D','M','D','F','S','S'].map((k, i) => {
    const tag = new Date(montag)
    tag.setDate(montag.getDate() + i)
    const key = tag.toISOString().split('T')[0]
    return {
      kuerzel: k, key,
      istHeute: key === heuteKey,
      istVergangen: tag < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      hatEintrag: !!localStorage.getItem(`tagebuch_${key}`),
    }
  })
  const monatsName = now.toLocaleDateString('de-DE', { month: 'long' })

  // Letzte Ergebnisse
  const letztesDatum = localStorage.getItem('screening_datum')
  const letztesErgebnisRaw = localStorage.getItem('screening_ergebnis')
  let ergebnisZeile = 'Noch kein Screening durchgeführt'
  if (letztesDatum && letztesErgebnisRaw) {
    try {
      const datum = new Date(letztesDatum).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
      const ergs = JSON.parse(letztesErgebnisRaw)
      const höchsteStufe = Math.min(...ergs.map(e => e.stufe))
      ergebnisZeile = `${datum} · Stufe ${höchsteStufe}`
    } catch {}
  }
  const hatErgebnis = !!letztesDatum

  // Ressourcen-Highlighting
  const relevantRaw = localStorage.getItem('screening_relevant_resources')
  const relevantChips = relevantRaw ? JSON.parse(relevantRaw) : null
  const hatScreening = !!letztesDatum

  const ressourcen = [
    { name: 'Freudlosigkeit',   farbe: '#e8d4f0', icon: 'spark'  },
    { name: 'Schlaf',           farbe: '#b8d4f0', icon: 'moon'   },
    { name: 'Grübeln',          farbe: '#d4b8e8', icon: 'bulb'   },
    { name: 'Antrieb',          farbe: '#b8e4d0', icon: 'bolt'   },
    { name: 'Konzentration',    farbe: '#c8d8f0', icon: 'target' },
    { name: 'Innere Unruhe',    farbe: '#f0b8c8', icon: 'wave'   },
    { name: 'Reizbarkeit',      farbe: '#f0d4b8', icon: 'flame'  },
    { name: 'Stress',           farbe: '#a8c8e0', icon: 'spiral' },
    { name: 'Sozialer Rückzug', farbe: '#c8b8e8', icon: 'person' },
  ]

  const accent = '#5B6BC8'
  const bg = '#dde1ee'
  const textP = '#2a2a3e'
  const textS = '#8a8faa'
  const cardBorder = '1px solid rgba(91,107,200,0.1)'

  return (
    <div style={{ background: '#dde1ee', minHeight: '100dvh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @keyframes bergDrift1 {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(-18px); }
          100% { transform: translateX(0); }
        }
        @keyframes bergDrift2 {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(12px); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ height: '185px', background: 'linear-gradient(to bottom, #a8c8e8 0%, #c9a8d4 45%, #7b5ea7 75%, #2d1f4a 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '22px' }}>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '80px', display: 'block', animation: 'bergDrift1 14s ease-in-out infinite' }}>
          <polygon points="0,100 55,38 110,72 170,18 230,55 295,8 355,46 430,28 440,100" fill="#2d1f4a" />
        </svg>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '80px', display: 'block', animation: 'bergDrift2 18s ease-in-out infinite' }}>
          <polygon points="0,100 35,52 75,70 125,32 175,58 225,22 285,52 335,18 385,42 440,32 440,100" fill="#1e1235" opacity="0.65" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2.5px', color: 'rgba(255,255,255,0.72)', margin: '0 0 5px', textTransform: 'uppercase' }}>{greetingText}</p>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 16px', textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}>Wie geht es dir heute?</h1>
          <button
            onClick={heroMode === 'screening' ? onScreeningOeffnen : () => onTagebuchOeffnen('eintrag')}
            style={{ padding: '10px 28px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: '100px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            {heroMode === 'screening' ? 'Screening starten' : 'Tagebuch eintragen'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 14px 40px' }}>

        {/* ── Fortschritt-Banner ───────────────────────────────── */}
        {hatFortschritt && (
          <div onClick={onScreeningOeffnen} style={{ margin: '14px 0 0', background: 'linear-gradient(135deg, #5B6BC8, #7b5ea7)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>Screening fortsetzen</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>Du hast noch einen offenen Fragebogen</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}

        {/* ── Screening ────────────────────────────────────────── */}
        <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 4px 8px' }}>Screening</p>
        <div data-tour="screening-karte" style={{ background: '#fff', borderRadius: '18px', border: cardBorder, overflow: 'hidden' }}>
          <div onClick={onScreeningOeffnen} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #7b5ea7, #5B6BC8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="#fff" strokeWidth="1.8"/>
                <path d="M9 8h6M9 12h6M9 16h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: textP, margin: '0 0 2px' }}>Neues Screening starten</p>
              <p style={{ fontSize: '11px', color: textS, margin: 0 }}>27 Fragen · ca. 5–10 Min · wissenschaftlich validiert</p>
            </div>
            <span style={{ fontSize: '18px', color: '#c0c5dd', flexShrink: 0 }}>›</span>
          </div>
          <div style={{ height: '0.5px', background: 'rgba(91,107,200,0.08)', margin: '0 16px' }} />
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: textP, margin: '0 0 2px' }}>Letzte Ergebnisse</p>
              <p style={{ fontSize: '11px', color: hatErgebnis ? textS : '#aab0c8', margin: 0 }}>{ergebnisZeile}</p>
            </div>
            <span style={{ fontSize: '18px', color: '#c0c5dd', flexShrink: 0 }}>›</span>
          </div>
        </div>

        {/* ── Tagebuch ─────────────────────────────────────────── */}
        <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 4px 8px' }}>Tagebuch</p>
        <div data-tour="tagebuch-widget" style={{ background: '#fff', borderRadius: '18px', border: cardBorder, padding: '20px 16px' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: textP, margin: '0 0 2px', textAlign: 'center' }}>Mein Tagebuch</p>
          <p style={{ fontSize: '11px', color: textS, margin: '0 0 14px', textAlign: 'center' }}>Befinden · Energie · Schlaf</p>
          <p style={{ fontSize: '13px', fontWeight: '600', color: textP, margin: '0 0 10px', textAlign: 'center' }}>{monatsName}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px' }}>
            {wochenTage.map((tag) => {
              const dotBg = tag.hatEintrag ? '#2d6a4f' : tag.istVergangen ? '#e57373' : '#d0d5e8'
              return (
                <div key={tag.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', color: tag.istHeute ? textP : textS, fontWeight: tag.istHeute ? '700' : '400' }}>{tag.kuerzel}</span>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: dotBg,
                    border: tag.istHeute ? `2.5px solid ${accent}` : '2.5px solid transparent',
                    opacity: tag.istVergangen || tag.istHeute || tag.hatEintrag ? 1 : 0.45,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {tag.hatEintrag && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />}
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={() => onTagebuchOeffnen('eintrag')} style={{ width: '100%', padding: '13px', background: '#5B6BC8', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Heute eintragen
          </button>
        </div>

        {/* ── Ressourcen ───────────────────────────────────────── */}
        <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 4px 8px' }}>Ressourcen für dich</p>
        <div data-tour="ressourcen-bereich" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {ressourcen.map((res) => {
            const istRelevant = relevantChips && relevantChips.includes(res.name)
            const istGedimmt = hatScreening && relevantChips && !istRelevant
            const katalogKey = CHIP_TO_KATALOG[res.name]
            return (
              <div
                key={res.name}
                onClick={() => RESSOURCEN_KATALOG[katalogKey] ? setOpenResName(openResName === res.name ? null : res.name) : null}
                style={{
                  background: '#fff', borderRadius: '14px', padding: '10px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  border: cardBorder,
                  opacity: istGedimmt ? 0.35 : 1,
                  filter: istGedimmt ? 'grayscale(0.5)' : 'none',
                  transform: istRelevant ? 'scale(1.04)' : 'scale(1)',
                  cursor: RESSOURCEN_KATALOG[katalogKey] ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  outline: openResName === res.name ? `2px solid ${accent}` : 'none',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: res.farbe, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RessourceIcon typ={res.icon} />
                </div>
                <span style={{ fontSize: '8px', fontWeight: '700', color: textP, textAlign: 'center', lineHeight: '1.3' }}>{res.name}</span>
                {istRelevant && (
                  <span style={{ fontSize: '8px', fontWeight: '700', color: accent, background: '#ede9f7', borderRadius: '6px', padding: '1px 5px' }}>Für dich</span>
                )}
              </div>
            )
          })}
        </div>
        {openResName && RESSOURCEN_KATALOG[CHIP_TO_KATALOG[openResName]] && (
          <>
            <div onClick={() => setOpenResName(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,40,0.55)', zIndex: 200 }} />
            <div style={{ position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '402px', zIndex: 201, padding: '0 14px', boxSizing: 'border-box' }}>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: textP, margin: 0 }}>{openResName}</p>
                  <button onClick={() => setOpenResName(null)} style={{ background: '#f0f0f5', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', color: textS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <p style={{ fontSize: '13px', color: textS, lineHeight: '1.7', margin: '0 0 14px' }}>{RESSOURCEN_KATALOG[CHIP_TO_KATALOG[openResName]].erklaerung}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {RESSOURCEN_KATALOG[CHIP_TO_KATALOG[openResName]].interventionen.map((inv) => (
                    <div key={inv.titel} style={{ background: '#f5f6fa', borderRadius: '10px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: textP, margin: '0 0 3px' }}>{inv.titel}</p>
                      <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.5' }}>{inv.text}</p>
                      {inv.video && <a href={inv.video} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: accent, textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>Video ansehen</a>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Dev Shortcuts ────────────────────────────────────── */}
        {onTestErgebnis && (
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#F3E5F5', borderRadius: '14px', border: '1px dashed #9C27B0' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#7B1FA2', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Dev · Test-Shortcuts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Test: Stufe 1', ergebnisse: berechneErgebnisse({ phq9_1:3,phq9_2:3,phq9_3:2,phq9_4:2,phq9_5:1,phq9_6:2,phq9_7:1,phq9_8:1,phq9_9:0, gad7_1:2,gad7_2:2,gad7_3:2,gad7_4:2,gad7_5:2,gad7_6:1,gad7_7:1, asrs_1:1,asrs_2:1,asrs_3:1,asrs_4:1,asrs_5:1,asrs_6:1 }) },
                { label: 'Test: Stufe 2', ergebnisse: berechneErgebnisse({ phq9_1:1,phq9_2:2,phq9_3:1,phq9_4:2,phq9_5:1,phq9_6:0,phq9_7:1,phq9_8:0,phq9_9:0, gad7_1:1,gad7_2:1,gad7_3:1,gad7_4:1,gad7_5:0,gad7_6:1,gad7_7:0, asrs_1:1,asrs_2:1,asrs_3:0,asrs_4:1,asrs_5:0,asrs_6:0 }) },
                { label: 'Test: Stufe 3', ergebnisse: berechneErgebnisse({ phq9_1:0,phq9_2:0,phq9_3:0,phq9_4:0,phq9_5:0,phq9_6:0,phq9_7:0,phq9_8:0,phq9_9:0, gad7_1:0,gad7_2:0,gad7_3:0,gad7_4:0,gad7_5:0,gad7_6:0,gad7_7:0, asrs_1:0,asrs_2:0,asrs_3:0,asrs_4:0,asrs_5:0,asrs_6:0 }) },
              ].map(({ label, ergebnisse }) => (
                <button key={label} onClick={() => onTestErgebnis(ergebnisse)} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#7B1FA2', backgroundColor: '#fff', border: '1px solid #CE93D8', borderRadius: '10px', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Tagebuch({ onZurueck, startAnsicht }) {
  const [ansicht, setAnsicht] = useState(startAnsicht || 'eintrag')
  const [gewaehlterTag, setGewaehlterTag] = useState(null)
  const [kalenderMonat, setKalenderMonat] = useState(new Date().getMonth())
  const [kalenderJahr, setKalenderJahr] = useState(new Date().getFullYear())
  const [werte, setWerte] = useState({ befinden: 0, energie: 0, schlaf: 0 })
  const [notiz, setNotiz] = useState('')
  const [formularOffen, setFormularOffen] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)

  const heute = new Date().toISOString().split('T')[0]
  const hatHeuteEintrag = !!localStorage.getItem(`tagebuch_${heute}`)

  const kategorien = [
    { key: 'befinden', label: 'Befinden', links: 'Schlecht', rechts: 'Sehr gut' },
    { key: 'energie', label: 'Energie', links: 'Wenig', rechts: 'Viel' },
    { key: 'schlaf', label: 'Schlaf', links: 'Schlecht', rechts: 'Gut' },
  ]

  const leseEintrag = (datum) => {
    const raw = localStorage.getItem(`tagebuch_${datum}`)
    if (!raw) return null
    const e = JSON.parse(raw)
    return {
      befinden: e.befinden ?? e.werte?.befinden ?? 0,
      energie: e.energie ?? e.werte?.energie ?? 0,
      schlaf: e.schlaf ?? e.werte?.schlaf ?? 0,
      notiz: e.notiz || '',
      datum: e.datum || datum,
    }
  }

  const ladeHeutigenEintrag = () => {
    const e = leseEintrag(heute)
    if (e) {
      setWerte({ befinden: e.befinden, energie: e.energie, schlaf: e.schlaf })
      setNotiz(e.notiz)
    }
    setFormularOffen(true)
  }

  const handleSpeichern = () => {
    localStorage.setItem(`tagebuch_${heute}`, JSON.stringify({
      befinden: werte.befinden,
      energie: werte.energie,
      schlaf: werte.schlaf,
      notiz,
      datum: heute,
    }))
    setGespeichert(true)
    setTimeout(() => onZurueck(), 2000)
  }

  const alleAusgewaehlt = werte.befinden > 0 && werte.energie > 0 && werte.schlaf > 0

  const padZwei = (n) => String(n).padStart(2, '0')

  const renderPunkte = (wert) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: n === wert ? colors.primary : colors.border }} />
      ))}
    </div>
  )

  // ─── GESPEICHERT-BESTÄTIGUNG ─────────────────────────────────────────────────
  if (gespeichert) {
    return (
      <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', backgroundColor: colors.background, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20L17 27L30 13" stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 8px' }}>Eintrag gespeichert</p>
        <p style={{ fontSize: '14px', color: colors.textLight, margin: 0 }}>Gut gemacht – bleib dran.</p>
      </div>
    )
  }

  // ─── ANSICHT 1: Tageseintrag ────────────────────────────────────────────────
  if (ansicht === 'eintrag') {
    // Fall B: Heute bereits Eintrag vorhanden, Formular nicht geöffnet → Eintrag anzeigen
    if (hatHeuteEintrag && !formularOffen) {
      const heutigerEintrag = leseEintrag(heute)
      return (
        <div style={{ padding: '16px' }}>
          <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>Dein Eintrag</h2>
          <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 24px' }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
            {[
              { label: 'Befinden', wert: heutigerEintrag?.befinden ?? 0 },
              { label: 'Energie', wert: heutigerEintrag?.energie ?? 0 },
              { label: 'Schlaf', wert: heutigerEintrag?.schlaf ?? 0 },
            ].map((kat) => (
              <div key={kat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{kat.label}</span>
                {renderPunkte(kat.wert)}
              </div>
            ))}
          </div>
          {heutigerEintrag?.notiz && (
            <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px' }}>Notiz</p>
              <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{heutigerEintrag.notiz}</p>
            </div>
          )}
          <button onClick={ladeHeutigenEintrag} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
            Eintrag bearbeiten
          </button>
          <button onClick={() => setAnsicht('kalender')} style={{ width: '100%', padding: '16px', backgroundColor: colors.background, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Alle Einträge
          </button>
        </div>
      )
    }

    // Fall A: Kein Eintrag heute ODER Formular-Modus (Eintrag ergänzen)
    return (
      <div style={{ padding: '16px' }}>
        <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>Tagebuch</h2>
        <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 24px' }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 20px' }}>Wie geht es dir heute?</p>
          {kategorien.map((kat) => (
            <div key={kat.key} style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{kat.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: colors.textLight, width: '48px' }}>{kat.links}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} onClick={() => setWerte({ ...werte, [kat.key]: n })} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: werte[kat.key] === n ? colors.primary : colors.border, cursor: 'pointer', transition: 'background 0.15s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: colors.textLight, width: '48px', textAlign: 'right' }}>{kat.rechts}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 10px' }}>Notiz</p>
          <textarea value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Was beschäftigt dich heute? Was war gut, was war schwer?" rows={4} style={{ width: '100%', fontSize: '14px', color: colors.text, border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', lineHeight: '1.6', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }} />
        </div>
        <button onClick={handleSpeichern} disabled={!alleAusgewaehlt} style={{ width: '100%', padding: '16px', backgroundColor: alleAusgewaehlt ? colors.primary : colors.border, color: alleAusgewaehlt ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: alleAusgewaehlt ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '10px' }}>
          Speichern
        </button>
        <button onClick={() => setAnsicht('kalender')} style={{ width: '100%', padding: '16px', backgroundColor: colors.background, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          Mein Tagebuch
        </button>
        {!alleAusgewaehlt && <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '8px' }}>Bitte alle drei Bereiche ausfüllen</p>}
      </div>
    )
  }

  // ─── ANSICHT 2: Kalender ────────────────────────────────────────────────────
  if (ansicht === 'kalender') {
    const eintraegeTage = Object.keys(localStorage)
      .filter(k => k.startsWith('tagebuch_'))
      .map(k => k.replace('tagebuch_', ''))

    const ersterTag = new Date(kalenderJahr, kalenderMonat, 1)
    const letzterTag = new Date(kalenderJahr, kalenderMonat + 1, 0)
    const startWochentag = (ersterTag.getDay() + 6) % 7 // Montag = 0
    const anzahlTage = letzterTag.getDate()
    const monatName = ersterTag.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

    const vorherigerMonat = () => {
      if (kalenderMonat === 0) { setKalenderMonat(11); setKalenderJahr(j => j - 1) }
      else setKalenderMonat(m => m - 1)
    }
    const naechsterMonat = () => {
      if (kalenderMonat === 11) { setKalenderMonat(0); setKalenderJahr(j => j + 1) }
      else setKalenderMonat(m => m + 1)
    }

    const handleTagKlick = (tag) => {
      const datum = `${kalenderJahr}-${padZwei(kalenderMonat + 1)}-${padZwei(tag)}`
      const hatEintrag = eintraegeTage.includes(datum)
      if (hatEintrag) {
        setGewaehlterTag(datum)
        setAnsicht('lesen')
      } else if (datum === heute) {
        setAnsicht('eintrag')
      }
    }

    const exportierePDF = async () => {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`MeinPsyCheck \u2013 Tagebuchverlauf ${monatName}`, 14, 20)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Zur pers\u00f6nlichen Orientierung erstellt. Kein medizinisches Dokument.', 14, 27)
      doc.setTextColor(0, 0, 0)
      const punkte = (wert) => wert > 0 ? '\u25cf'.repeat(wert) + '\u25cb'.repeat(5 - wert) : ''
      const rows = []
      for (let d = 1; d <= anzahlTage; d++) {
        const datum = `${kalenderJahr}-${padZwei(kalenderMonat + 1)}-${padZwei(d)}`
        const datumText = new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
        const eintrag = leseEintrag(datum)
        rows.push({ data: [datumText, punkte(eintrag?.befinden ?? 0), punkte(eintrag?.energie ?? 0), punkte(eintrag?.schlaf ?? 0), eintrag?.notiz || ''], hatEintrag: !!eintrag })
      }
      autoTable(doc, {
        startY: 32,
        head: [['Datum', 'Befinden', 'Energie', 'Schlaf', 'Notiz']],
        body: rows.map(r => r.data),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [91, 107, 200], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 22 }, 2: { cellWidth: 22 }, 3: { cellWidth: 22 }, 4: { cellWidth: 'auto' } },
        didParseCell: (data) => {
          if (data.section === 'body' && !rows[data.row.index].hatEintrag) {
            data.cell.styles.fillColor = [245, 245, 245]
            data.cell.styles.textColor = [180, 180, 180]
          }
        },
        didDrawPage: (data) => {
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text('Alle Daten lokal auf deinem Ger\u00e4t gespeichert. Keine \u00dcbertragung an Server.', data.settings.margin.left, doc.internal.pageSize.height - 8)
          doc.setTextColor(0, 0, 0)
        },
      })
      doc.save(`MeinPsyCheck_Tagebuch_${monatName.replace(' ', '_')}.pdf`)
    }

    return (
      <div style={{ padding: '16px' }}>
        <button onClick={() => setAnsicht('eintrag')} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px' }}>Mein Tagebuch</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={vorherigerMonat} style={{ background: 'none', border: 'none', fontSize: '20px', color: colors.primary, cursor: 'pointer', padding: '4px 8px' }}>←</button>
          <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>{monatName}</span>
          <button onClick={naechsterMonat} style={{ background: 'none', border: 'none', fontSize: '20px', color: colors.primary, cursor: 'pointer', padding: '4px 8px' }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((t) => (
            <div key={t} style={{ fontSize: '12px', color: colors.textLight, padding: '8px 0', fontWeight: '600' }}>{t}</div>
          ))}

          {Array.from({ length: startWochentag }).map((_, i) => (
            <div key={`leer-${i}`} />
          ))}

          {Array.from({ length: anzahlTage }).map((_, i) => {
            const tag = i + 1
            const datum = `${kalenderJahr}-${padZwei(kalenderMonat + 1)}-${padZwei(tag)}`
            const hatEintrag = eintraegeTage.includes(datum)
            const istHeute = datum === heute

            return (
              <div key={tag} onClick={() => handleTagKlick(tag)} style={{ padding: '8px 0', cursor: hatEintrag || datum === heute ? 'pointer' : 'default', borderRadius: '10px', backgroundColor: istHeute ? colors.primaryLight : 'transparent', position: 'relative' }}>
                <span style={{ fontSize: '14px', color: istHeute ? colors.primary : colors.text, fontWeight: istHeute ? '700' : '400' }}>{tag}</span>
                {hatEintrag && (
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: colors.primary, margin: '3px auto 0' }} />
                )}
              </div>
            )
          })}
        </div>
        <button onClick={exportierePDF} style={{ width: '100%', padding: '14px', backgroundColor: colors.background, color: '#5B6BC8', border: '1.5px solid #5B6BC8', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}>
          Monat als PDF exportieren
        </button>
      </div>
    )
  }

  // ─── ANSICHT 3: Eintrag lesen ───────────────────────────────────────────────
  if (ansicht === 'lesen' && gewaehlterTag) {
    const eintrag = leseEintrag(gewaehlterTag)
    if (!eintrag) { setAnsicht('kalender'); return null }

    const datumObj = new Date(gewaehlterTag + 'T12:00:00')
    const datumText = datumObj.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div style={{ padding: '16px' }}>
        <button onClick={() => setAnsicht('kalender')} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück zum Kalender</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px', textTransform: 'capitalize' }}>{datumText}</h2>

        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          {[
            { label: 'Befinden', wert: eintrag.befinden },
            { label: 'Energie', wert: eintrag.energie },
            { label: 'Schlaf', wert: eintrag.schlaf },
          ].map((kat) => (
            <div key={kat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{kat.label}</span>
              {renderPunkte(kat.wert)}
            </div>
          ))}
        </div>

        {eintrag.notiz && (
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px' }}>Notiz</p>
            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{eintrag.notiz}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

const DEMO_THERAPEUTEN = [
  { id: 1, name: 'Dr. Sarah Müller', titel: 'Psychologische Psychotherapeutin', spezial: ['Depression', 'Angststörungen'], bewertung: 4.8, bewertungen: 34, frei: true, wartezeit: 'ca. 2 Wochen', lat: 0.002, lng: 0.003 },
  { id: 2, name: 'Thomas Becker', titel: 'Verhaltenstherapeut', spezial: ['Burnout', 'Stress'], bewertung: 4.5, bewertungen: 21, frei: true, wartezeit: 'ca. 4 Wochen', lat: -0.003, lng: -0.002 },
  { id: 3, name: 'Dr. Anna Fischer', titel: 'Tiefenpsychologin', spezial: ['Trauma', 'ADHS'], bewertung: 4.9, bewertungen: 52, frei: false, wartezeit: 'ca. 3 Monate', lat: 0.005, lng: -0.004 },
  { id: 4, name: 'Michael Weber', titel: 'Systemischer Therapeut', spezial: ['Beziehungen', 'Angst'], bewertung: 4.3, bewertungen: 18, frei: true, wartezeit: 'ca. 1 Woche', lat: -0.005, lng: 0.006 },
  { id: 5, name: 'Dr. Julia Schneider', titel: 'Kognitive Verhaltenstherapie', spezial: ['Depression', 'Zwang'], bewertung: 4.7, bewertungen: 41, frei: false, wartezeit: 'ca. 6 Wochen', lat: 0.001, lng: -0.007 },
]

function SterneBewertung({ wert }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(wert) ? '#f5a623' : '#dde1ee'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  )
}

function TherapeutenPlatzhalter() {
  const accent = '#5B6BC8'
  const textP = '#2a2a3e'
  const textS = '#8a8faa'
  const mapRef = useRef(null)
  const mapObjRef = useRef(null)
  const markersRef = useRef([])
  const [ausgewählt, setAusgewählt] = useState(null)
  const [filter, setFilter] = useState('alle')

  const KARTEN_MITTE = [48.1374, 11.5755] // München, fest

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      maxBounds: L.latLngBounds(
        [KARTEN_MITTE[0] - 0.02, KARTEN_MITTE[1] - 0.03],
        [KARTEN_MITTE[0] + 0.02, KARTEN_MITTE[1] + 0.03]
      ),
      maxBoundsViscosity: 1.0,
      minZoom: 13,
      maxZoom: 15,
    }).setView(KARTEN_MITTE, 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map)
    L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map)

    // Statischer User-Punkt in der Mitte
    L.circleMarker(KARTEN_MITTE, {
      radius: 10, fillColor: accent, color: '#fff', weight: 3, fillOpacity: 1,
      className: 'user-dot'
    }).addTo(map)
    // Blauer Pulsring
    const pulseIcon = L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;border-radius:50%;background:rgba(91,107,200,0.18);border:2px solid rgba(91,107,200,0.4);"></div>`,
      iconAnchor: [16, 16],
    })
    L.marker(KARTEN_MITTE, { icon: pulseIcon, interactive: false }).addTo(map)

    mapObjRef.current = map
    return () => { map.remove(); mapObjRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapObjRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const gefilterteT = filter === 'frei' ? DEMO_THERAPEUTEN.filter(t => t.frei) : DEMO_THERAPEUTEN
    gefilterteT.forEach((t) => {
      const pos = [KARTEN_MITTE[0] + t.lat, KARTEN_MITTE[1] + t.lng]
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${t.frei ? accent : '#aab0c8'};color:white;border-radius:50%;width:38px;height:38px;font-size:11px;font-weight:800;font-family:system-ui;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;"><span style="font-size:12px;">★</span><span>${t.bewertung}</span></div>`,
        iconAnchor: [19, 19],
      })
      const marker = L.marker(pos, { icon }).addTo(map)
      marker.on('click', () => setAusgewählt(t))
      markersRef.current.push(marker)
    })
  }, [filter])

  const gefilterteT = filter === 'frei' ? DEMO_THERAPEUTEN.filter(t => t.frei) : DEMO_THERAPEUTEN

  return (
    <div style={{ background: '#dde1ee', minHeight: 'calc(100vh - 70px)', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 16px', background: '#dde1ee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: 0 }}>Therapeuten finden</h2>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B6BC8', background: 'rgba(91,107,200,0.12)', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap', flexShrink: 0 }}>Kommt in V2</span>
        </div>
        <p style={{ fontSize: '13px', color: textS, margin: 0, lineHeight: '1.5' }}>Vorschau · Die Daten sind Beispieldaten und noch nicht live.</p>
      </div>

      {/* ── Karte ────────────────────────────────────────────────── */}
      <div data-tour="therapeuten-karte" style={{ position: 'relative', margin: '0 16px', borderRadius: '18px', overflow: 'hidden', height: '240px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {/* Filter-Bar über der Karte */}
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', gap: '6px', background: '#fff', borderRadius: '100px', padding: '3px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          {['alle', 'frei'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: '100px', border: 'none', background: filter === f ? accent : 'transparent', color: filter === f ? '#fff' : textS, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {f === 'alle' ? 'Alle' : 'Termine frei'}
            </button>
          ))}
        </div>
      </div>

      {/* Demo-Hinweis zwischen Karte und Liste */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 0' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: textS, background: 'rgba(138,143,170,0.15)', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.2px' }}>
          Demo-Vorschau · keine echten Daten
        </span>
      </div>

      {/* ── Therapeuten-Liste ────────────────────────────────────── */}
      <div data-tour="therapeuten-liste" style={{ flex: 1, background: '#fff', margin: '12px 16px 0', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(91,107,200,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#dde1ee' }} />
        </div>

        {ausgewählt ? (
          <div style={{ padding: '4px 16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: textP, margin: '0 0 2px' }}>{ausgewählt.name}</p>
                <p style={{ fontSize: '13px', color: textS, margin: 0 }}>{ausgewählt.titel}</p>
              </div>
              <button onClick={() => setAusgewählt(null)} style={{ background: '#f0f1f8', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: textS, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <SterneBewertung wert={ausgewählt.bewertung} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: textP }}>{ausgewählt.bewertung}</span>
              <span style={{ fontSize: '12px', color: textS }}>({ausgewählt.bewertungen} Bewertungen)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {ausgewählt.spezial.map(s => (
                <span key={s} style={{ padding: '4px 10px', background: '#eef0fa', borderRadius: '100px', fontSize: '12px', color: accent, fontWeight: '500' }}>{s}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '10px 12px', background: ausgewählt.frei ? '#eef9f2' : '#fef2f2', borderRadius: '10px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: ausgewählt.frei ? '#2d7a4f' : '#b71c1c', margin: '0 0 2px' }}>{ausgewählt.frei ? 'Termin verfügbar' : 'Warteliste'}</p>
                <p style={{ fontSize: '12px', color: textS, margin: 0 }}>Wartezeit: {ausgewählt.wartezeit}</p>
              </div>
              <button style={{ padding: '10px 18px', background: accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Kontakt</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 16px 16px', overflowY: 'auto', maxHeight: '260px' }}>
            {gefilterteT.map(t => (
              <div key={t.id} onClick={() => setAusgewählt(t)}
                style={{ background: '#f8f9fe', borderRadius: '14px', padding: '12px 14px', cursor: 'pointer', border: '1.5px solid rgba(91,107,200,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: textP, margin: 0 }}>{t.name}</p>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', background: t.frei ? '#eef9f2' : '#fef2f2', color: t.frei ? '#2d7a4f' : '#b71c1c', borderRadius: '6px', flexShrink: 0 }}>{t.frei ? 'Frei' : 'Warteliste'}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: textS, margin: '0 0 5px' }}>{t.titel}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SterneBewertung wert={t.bewertung} />
                    <span style={{ fontSize: '12px', color: textP, fontWeight: '600' }}>{t.bewertung}</span>
                    <span style={{ fontSize: '11px', color: textS }}>({t.bewertungen})</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" stroke="#aab0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Einstellungen({ onTourNeuStarten }) {
  const [offen, setOffen] = useState(null)
  const [detailAnsicht, setDetailAnsicht] = useState(null)
  const [email, setEmail] = useState(localStorage.getItem('user_email') || '')
  const [emailGespeichert, setEmailGespeichert] = useState(false)
  const [tourDialog, setTourDialog] = useState(false)

  const accent = '#5B6BC8'
  const textP = '#2a2a3e'
  const textS = '#8a8faa'
  const bg = '#dde1ee'

  const sektionen = [
    { titel: 'Konto', items: ['E-Mail-Adresse hinterlegen', 'App bewerten', 'App-Tour wiederholen'] },
    { titel: 'Info', items: ['Neuigkeiten & Updates', 'Datenschutz', 'Impressum', 'Hilfe & FAQ', 'Wissenschaftliche Grundlagen'] },
  ]

  const wissenschaft = [
    {
      id: 'frageboegen',
      titel: 'Warum validierte Fragebögen?',
      text: 'MeinPsyCheck verwendet ausschließlich psychometrisch validierte Screening-Instrumente. Das bedeutet: Die Fragen wurden in klinischen Studien an tausenden von Menschen getestet – auf ihre Zuverlässigkeit (Reliabilität), ihre Genauigkeit (Validität) sowie ihre Fähigkeit, Betroffene zu erkennen (Sensitivität) und Gesunde nicht fälschlicherweise als krank einzustufen (Spezifität).\nDie verwendeten Cut-Off-Werte gelten ausschließlich für den exakten Originalwortlaut der Fragen. Schon eine kleine Änderung einer Formulierung würde die Normwerte ungültig machen. Deswegen sind alle Fragen in dieser App gesperrt und werden niemals verändert.',
      quellen: [
        'Kroenke K, Spitzer RL, Williams JB (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.',
        'Spitzer RL, Kroenke K, Williams JB, Löwe B (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, 166(10), 1092–1097.',
        'Kessler RC et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychological Medicine, 35(2), 245–256.',
      ],
    },
    {
      id: 'cutoff',
      titel: 'Warum diese Cut-Off-Werte?',
      text: 'Ein Cut-Off ist der Punktwert, ab dem ein Screening-Ergebnis als klinisch auffällig gilt. Diese Werte wurden nicht willkürlich gewählt – sie stammen aus den Originalpublikationen der Fragebogenentwickler und wurden in unabhängigen Studien für die deutsche Bevölkerung validiert.\nPHQ-9: Cut-Off ≥ 10 – Sensitivität 88%, Spezifität 88% für eine depressive Störung (Kroenke et al., 2001).\nGAD-7: Cut-Off ≥ 10 – Sensitivität 89%, Spezifität 82% für eine generalisierte Angststörung (Spitzer et al., 2006).\nWHO-5: Cut-Off ≤ 50 (Skala 0–100) – Score ≤ 28 als Depressions-Screening-Kriterium (WHO, 1998).\nASRS v1.1: ≥ 4 auffällige Antworten – entwickelt von der WHO (Kessler et al., 2005).\nEin positives Screening bedeutet nicht, dass eine Erkrankung vorliegt. Es bedeutet, dass deine Angaben in einem Bereich liegen, in dem professionelle Abklärung sinnvoll ist.',
      quellen: [
        'Löwe B et al. (2004). Diagnosing ICD-10 depressive episodes: superior criterion validity of the Patient Health Questionnaire. Psychother Psychosom, 73(6), 386–390.',
        'Löwe B et al. (2008). Validation and standardization of the GAD-7 in the general population. Medical Care, 46(3), 266–274.',
      ],
    },
    {
      id: 'tagebuch',
      titel: 'Warum ein Tagebuch?',
      text: 'Das Führen eines Stimmungstagebuchs ist ein etablierter Bestandteil der kognitiven Verhaltenstherapie. Es hilft dabei, Muster zu erkennen – wann fühle ich mich schlechter, wann besser, was beeinflusst meine Stimmung?\nDer Psychologe James Pennebaker (Universität Texas) hat seit 1986 in über 400 Studien gezeigt, dass das regelmäßige Aufschreiben von Gedanken und Gefühlen die psychische und körperliche Gesundheit messbar verbessert: weniger Stress, weniger depressive Symptome, stärkeres Immunsystem.\nDas Tagebuch in dieser App ist bewusst einfach gehalten – drei kurze Ratings und ein Freitextfeld. Es soll eine tägliche Reflexion ermöglichen, keine Belastung darstellen.',
      quellen: [
        'Pennebaker JW, Beall SK (1986). Confronting a traumatic event: Toward an understanding of inhibition and disease. Journal of Abnormal Psychology, 95(3), 274–281.',
        'Pennebaker JW (1997). Writing about emotional experiences as a therapeutic process. Psychological Science, 8(3), 162–166.',
      ],
    },
    {
      id: 'diagnose',
      titel: 'Warum kein Diagnose-Anspruch?',
      text: 'Diese App ist kein Medizinprodukt und stellt keine Diagnose. Das ist keine rechtliche Absicherung – es ist eine inhaltliche Wahrheit.\nPsychische Störungen werden durch klinische Fachleute diagnostiziert: durch Gespräche, Beobachtung über Zeit, Ausschluss körperlicher Ursachen und die Einschätzung des Funktionsniveaus. Ein Fragebogen alleine kann das nicht leisten.\nWas ein validiertes Screening leisten kann: Es zeigt, ob deine Beschwerden ein Ausmaß erreicht haben, das eine professionelle Abklärung rechtfertigt. Das ist der einzige Anspruch dieser App – und er ist wissenschaftlich begründet.\nRechtliche Grundlage: Die App ist als Informations- und Orientierungsangebot konzipiert, nicht als Medizinprodukt nach MDR/MPDG. Grundlage: OLG Hamburg 2024 – Zweckbestimmung durch den Hersteller.',
      quellen: [],
    },
    {
      id: 'instrumente',
      titel: 'Alle verwendeten Instrumente mit Quellenangaben',
      instrumente: [
        {
          name: 'PHQ-9 – Depression',
          refs: [
            'Originalentwicklung: Kroenke K, Spitzer RL, Williams JB (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.',
            'Deutsche Version: Löwe B, Zipfel S, Herzog W. Übersetzung des PHQ-9. Medizinische Universitätsklinik Heidelberg. © 2002 Pfizer GmbH.',
            'Validierung DE: Löwe B et al. (2004). Psychother Psychosom, 73(6), 386–390.',
            'Lizenz: Public Domain. Pfizer Inc. via phqscreeners.com.',
          ],
        },
        {
          name: 'GAD-7 – Angst',
          refs: [
            'Originalentwicklung: Spitzer RL, Kroenke K, Williams JB, Löwe B (2006). Archives of Internal Medicine, 166(10), 1092–1097.',
            'Validierung DE: Löwe B et al. (2008). Medical Care, 46(3), 266–274.',
            'Lizenz: Public Domain. Pfizer Inc. via phqscreeners.com.',
          ],
        },
        {
          name: 'ASRS v1.1 – ADHS',
          refs: [
            'Originalentwicklung: Kessler RC et al. (2005). Psychological Medicine, 35(2), 245–256.',
            'Entwickler: WHO / Adler L, Kessler RC, Spencer T. © New York University & Harvard Medical School.',
            'Validierung DE: Buchli-Kammermann J et al. (2011). Z Psychiatrie Psychol Psychother, 59(4), 273–281.',
          ],
        },
        {
          name: 'Suizidprotokoll',
          refs: [
            'Basis: PHQ-9 Item 9. Leitlinie: S3-Leitlinie/Nationale VersorgungsLeitlinie Unipolare Depression. DGPPN, BÄK, KBV, AWMF. Version 3.0, 2022. DOI: 10.6101/AZQ/000493.',
            'Krisenhotline: Telefonseelsorge Deutschland, 0800 111 0 111 (kostenlos, 24/7, anonym).',
          ],
        },
        {
          name: 'Tagebuch',
          refs: [
            'Pennebaker JW, Beall SK (1986). Journal of Abnormal Psychology, 95(3), 274–281.',
            'Pennebaker JW (1997). Psychological Science, 8(3), 162–166.',
          ],
        },
      ],
    },
  ]

  const zurueck = () => { setDetailAnsicht(null); setOffen(null) }
  const ZurueckBtn = () => (
    <button onClick={zurueck} style={{ background: 'none', border: 'none', color: accent, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>← Zurück</button>
  )
  const KardBox = ({ children }) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(91,107,200,0.1)', overflow: 'hidden', marginBottom: '16px' }}>{children}</div>
  )
  const TextBlock = ({ children }) => (
    <p style={{ fontSize: '14px', color: textS, lineHeight: '1.75', margin: 0, whiteSpace: 'pre-line' }}>{children}</p>
  )

  // ── E-Mail ────────────────────────────────────────────────────
  if (detailAnsicht === 'email') {
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 8px' }}>E-Mail hinterlegen</h1>
        <p style={{ fontSize: '14px', color: textS, margin: '0 0 24px', lineHeight: '1.6' }}>Hinterlege deine E-Mail-Adresse, um bei neuen Funktionen und wichtigen Updates benachrichtigt zu werden. Deine Adresse wird nur auf deinem Gerät gespeichert.</p>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <input
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailGespeichert(false) }}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(91,107,200,0.2)', borderRadius: '12px', fontSize: '15px', color: textP, outline: 'none', boxSizing: 'border-box', background: '#f8f9fe', fontFamily: 'system-ui' }}
            />
            <button
              onClick={() => { localStorage.setItem('user_email', email); setEmailGespeichert(true) }}
              style={{ width: '100%', marginTop: '12px', padding: '14px', background: accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              {emailGespeichert ? '✓ Gespeichert' : 'Speichern'}
            </button>
          </div>
        </KardBox>
        <p style={{ fontSize: '12px', color: textS, textAlign: 'center', lineHeight: '1.6' }}>Deine E-Mail wird ausschließlich lokal auf deinem Gerät gespeichert und nicht an Server übertragen.</p>
      </div>
    )
  }

  // ── App bewerten ──────────────────────────────────────────────
  if (detailAnsicht === 'bewerten') {
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 8px' }}>App bewerten</h1>
        <p style={{ fontSize: '14px', color: textS, margin: '0 0 24px', lineHeight: '1.6' }}>Dein Feedback hilft dabei, MeinPsyCheck besser zu machen — für dich und für alle, die psychische Unterstützung suchen.</p>
        <KardBox>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>⭐</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: textP, margin: '0 0 6px' }}>MeinPsyCheck bewerten</p>
            <p style={{ fontSize: '13px', color: textS, margin: '0 0 16px', lineHeight: '1.5' }}>Die App ist aktuell als Web-App verfügbar. Eine native App für iOS & Android ist in Planung.</p>
            <a href="https://www.meinpsycheck.de" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '13px', background: accent, color: '#fff', borderRadius: '12px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
              Zur Website
            </a>
          </div>
        </KardBox>
      </div>
    )
  }

  // ── Neuigkeiten & Updates ─────────────────────────────────────
  if (detailAnsicht === 'neuigkeiten') {
    const updates = [
      { version: '1.2', datum: 'April 2026', neu: ['Therapeutensuche mit interaktiver Karte', 'Ergebnisseite neu gestaltet mit Hero-Banner', 'Screening-Fortschritt wird gespeichert – du kannst jederzeit weitermachen', 'Ressourcen-Overlay auf der Hauptseite'] },
      { version: '1.1', datum: 'März 2026', neu: ['Onboarding-Flow überarbeitet', 'Tagebuch-Widget auf der Hauptseite', 'Neue Farbwelt & Berg-Animation', 'Fragebogen-Farben angepasst'] },
      { version: '1.0', datum: 'Februar 2026', neu: ['Erster Launch von MeinPsyCheck', 'Screening mit PHQ-9, GAD-7 und ASRS', 'Tagestagebuch', 'Wissenschaftliche Grundlagen'] },
    ]
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 8px' }}>Neuigkeiten & Updates</h1>
        <p style={{ fontSize: '14px', color: textS, margin: '0 0 24px', lineHeight: '1.6' }}>Was ist neu in MeinPsyCheck?</p>
        {updates.map((u, i) => (
          <KardBox key={u.version}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: accent }}>Version {u.version}</span>
                <span style={{ fontSize: '12px', color: textS }}>{u.datum}</span>
              </div>
              {u.neu.map((n, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: accent, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✦</span>
                  <p style={{ fontSize: '13px', color: textP, margin: 0, lineHeight: '1.5' }}>{n}</p>
                </div>
              ))}
            </div>
          </KardBox>
        ))}
      </div>
    )
  }

  // ── Datenschutz ───────────────────────────────────────────────
  if (detailAnsicht === 'datenschutz') {
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 24px' }}>Datenschutzerklärung</h1>
        {[
          { titel: 'Deine Daten bleiben auf deinem Gerät', text: 'MeinPsyCheck speichert alle Daten ausschließlich lokal auf deinem Gerät (localStorage des Browsers). Es werden keine personenbezogenen Daten an Server übertragen, gespeichert oder verarbeitet. Es gibt keine Nutzerkonten, keine Registrierung und keine Cloud-Synchronisation.' },
          { titel: 'Welche Daten werden gespeichert?', text: 'Lokal auf deinem Gerät werden gespeichert:\n• Dein Vorname (freiwillig, aus dem Onboarding)\n• Dein ungefähres Alter (aus dem Onboarding)\n• Tagebucheinträge (Befinden, Energie, Schlaf, Freitext)\n• Screening-Ergebnisse und -Datum\n• Relevante Ressourcen aus dem letzten Screening\n• E-Mail-Adresse (falls freiwillig hinterlegt)\n\nAlle Daten können jederzeit durch Löschen des Browser-Caches entfernt werden.' },
          { titel: 'Keine Weitergabe an Dritte', text: 'Da keine Daten das Gerät verlassen, findet keine Weitergabe an Dritte statt. Es werden keine Analyse-Tools, Tracking-Dienste oder Werbenetzwerke eingesetzt.' },
          { titel: 'Hosting', text: 'Diese Web-App wird über Netlify (Netlify Inc., 44 Montgomery Street, Suite 300, San Francisco, CA 94104, USA) bereitgestellt. Beim Aufruf der Website werden durch Netlify serverseitig Standard-Logfiles (IP-Adresse, Zeitstempel, aufgerufene URL) gespeichert. Diese Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb). Weitere Infos: netlify.com/privacy' },
          { titel: 'Karte (Therapeutensuche)', text: 'Die Karte in der Therapeutensuche verwendet OpenStreetMap-Kartendaten, die über Leaflet.js eingebunden werden. Beim Laden der Karte werden Kartenkacheln von openstreetmap.org abgerufen. Dabei kann die IP-Adresse des Nutzers übertragen werden. Datenschutzerklärung OpenStreetMap: osmfoundation.org/wiki/Privacy_Policy' },
          { titel: 'Deine Rechte', text: 'Da keine personenbezogenen Daten auf Servern gespeichert werden, sind klassische DSGVO-Auskunfts- und Löschrechte gegenüber dem Betreiber nicht anwendbar. Du kannst deine Daten jederzeit selbst durch Löschen des Browser-Caches entfernen.' },
          { titel: 'Kontakt', text: 'Bei Fragen zum Datenschutz wende dich an: info@meinpsycheck.de' },
        ].map(({ titel, text }) => (
          <KardBox key={titel}>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: textP, margin: '0 0 8px' }}>{titel}</p>
              <TextBlock>{text}</TextBlock>
            </div>
          </KardBox>
        ))}
      </div>
    )
  }

  // ── Impressum ─────────────────────────────────────────────────
  if (detailAnsicht === 'impressum') {
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 24px' }}>Impressum</h1>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Angaben gemäß § 5 TMG</p>
            <TextBlock>{'Midhad Lök\nErich-Ollenhauer Straße 6b\n65203 Wiesbaden\nDeutschland'}</TextBlock>
          </div>
        </KardBox>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Kontakt</p>
            <TextBlock>{'kontakt@meinpsycheck.de'}</TextBlock>
          </div>
        </KardBox>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</p>
            <TextBlock>{'Midhad Lök\nErich-Ollenhauer Straße 6b\n65203 Wiesbaden'}</TextBlock>
          </div>
        </KardBox>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Haftungsausschluss</p>
            <TextBlock>{'MeinPsyCheck ist kein Medizinprodukt und stellt keine medizinische Diagnose. Die App dient ausschließlich der Orientierung und ersetzt keine professionelle psychologische oder ärztliche Beratung.\n\nBei akuten psychischen Krisen wende dich an die Telefonseelsorge: 0800 111 0 111 (kostenlos, 24/7).'}</TextBlock>
          </div>
        </KardBox>
        <KardBox>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Urheberrecht</p>
            <TextBlock>{'Die verwendeten Fragebögen (PHQ-9, GAD-7, ASRS v1.1) stehen unter Public Domain (Pfizer Inc. / WHO). Alle übrigen Inhalte dieser App sind urheberrechtlich geschützt.'}</TextBlock>
          </div>
        </KardBox>
      </div>
    )
  }

  // ── Hilfe & FAQ ───────────────────────────────────────────────
  if (detailAnsicht === 'faq') {
    const faqs = [
      { f: 'Was ist MeinPsyCheck?', a: 'MeinPsyCheck ist ein kostenloser, anonymer Screening-Test für psychische Gesundheit. Die App verwendet wissenschaftlich validierte Fragebögen (PHQ-9, GAD-7, ASRS), um einzuschätzen, ob professionelle Unterstützung für dich sinnvoll sein könnte.' },
      { f: 'Stellt die App eine Diagnose?', a: 'Nein. Die App stellt keine Diagnose. Sie zeigt, ob deine Antworten auf eine Belastung hindeuten, die es lohnt, mit einer Fachkraft zu besprechen – das ist ein Hinweis, keine Diagnose.' },
      { f: 'Wo werden meine Daten gespeichert?', a: 'Alle Daten bleiben ausschließlich auf deinem Gerät. Nichts wird an Server übertragen. Du bist anonym – es gibt kein Konto, keine Registrierung.' },
      { f: 'Wie oft kann ich das Screening machen?', a: 'Das Screening kann nach 14 Tagen erneut durchgeführt werden. Häufigere Wiederholungen sind möglich, spiegeln aber meist keine echte Veränderung wider.' },
      { f: 'Was passiert, wenn ich ein Screening abbricht?', a: 'Dein Fortschritt wird automatisch gespeichert. Wenn du zurück zur Hauptseite gehst, siehst du oben einen Banner "Screening fortsetzen". Du kannst auch neu anfangen.' },
      { f: 'Was tun, wenn ich mich in einer Krise befinde?', a: 'Ruf sofort die Telefonseelsorge an: 0800 111 0 111 (kostenlos, 24 Stunden, 7 Tage die Woche, anonym). Bei akuter Gefahr: Notruf 112.' },
      { f: 'Wann kommt die native App?', a: 'Eine native App für iOS und Android ist geplant. Du kannst die Web-App jetzt schon auf deinem Startbildschirm speichern – sie funktioniert dann wie eine App.' },
    ]
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 8px' }}>Hilfe & FAQ</h1>
        <p style={{ fontSize: '14px', color: textS, margin: '0 0 24px', lineHeight: '1.6' }}>Häufig gestellte Fragen</p>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(91,107,200,0.1)', overflow: 'hidden' }}>
          {faqs.map((item, i) => {
            const istOffen = offen === i
            return (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid rgba(91,107,200,0.08)' : 'none' }}>
                <div onClick={() => setOffen(istOffen ? null : i)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: textP, fontWeight: '600', lineHeight: '1.4' }}>{item.f}</span>
                  <span style={{ color: textS, fontSize: '18px', flexShrink: 0, transition: 'transform 0.2s', transform: istOffen ? 'rotate(180deg)' : 'rotate(0)' }}>⌄</span>
                </div>
                {istOffen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <p style={{ fontSize: '13px', color: textS, lineHeight: '1.7', margin: 0 }}>{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Wissenschaftliche Grundlagen ──────────────────────────────
  if (detailAnsicht === 'wissenschaft') {
    return (
      <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
        <ZurueckBtn />
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 24px' }}>Wissenschaftliche Grundlagen</h1>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(91,107,200,0.1)', overflow: 'hidden' }}>
          {wissenschaft.map((item, i) => {
            const istOffen = offen === item.id
            return (
              <div key={item.id} style={{ borderBottom: i < wissenschaft.length - 1 ? '1px solid rgba(91,107,200,0.08)' : 'none' }}>
                <div onClick={() => setOffen(istOffen ? null : item.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: textP, fontWeight: '600', lineHeight: '1.4', flex: 1 }}>{item.titel}</span>
                  <span style={{ color: textS, fontSize: '18px', flexShrink: 0, marginLeft: '8px', transition: 'transform 0.2s', transform: istOffen ? 'rotate(180deg)' : 'rotate(0)' }}>⌄</span>
                </div>
                {istOffen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    {item.text && <p style={{ fontSize: '13px', color: textS, lineHeight: '1.75', margin: '0 0 12px', whiteSpace: 'pre-line' }}>{item.text}</p>}
                    {item.quellen?.length > 0 && item.quellen.map((q, qi) => (
                      <p key={qi} style={{ fontSize: '11px', color: textS, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 4px', opacity: 0.8 }}>{q}</p>
                    ))}
                    {item.instrumente && item.instrumente.map((inst) => (
                      <div key={inst.name} style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: textP, margin: '0 0 6px' }}>{inst.name}</p>
                        {inst.refs.map((ref, ri) => (
                          <p key={ri} style={{ fontSize: '11px', color: textS, fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 4px', opacity: 0.8 }}>{ref}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Hauptansicht ──────────────────────────────────────────────
  const itemToDetail = {
    'E-Mail-Adresse hinterlegen': 'email',
    'App bewerten': 'bewerten',
    'App-Tour wiederholen': 'tour',
    'Neuigkeiten & Updates': 'neuigkeiten',
    'Datenschutz': 'datenschutz',
    'Impressum': 'impressum',
    'Hilfe & FAQ': 'faq',
    'Wissenschaftliche Grundlagen': 'wissenschaft',
  }

  return (
    <div style={{ padding: '24px 16px 40px', background: bg, minHeight: '100dvh' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: textP, margin: '0 0 24px' }}>Einstellungen</h1>
      {sektionen.map((sektion) => (
        <div key={sektion.titel} style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: textS, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 4px' }}>{sektion.titel}</p>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(91,107,200,0.1)', overflow: 'hidden' }}>
            {sektion.items.map((item, i) => (
              <div key={item} onClick={() => { if (itemToDetail[item] === 'tour') { setTourDialog(true) } else { setDetailAnsicht(itemToDetail[item]) } }}
                style={{ padding: '16px', fontSize: '15px', color: textP, borderBottom: i < sektion.items.length - 1 ? '1px solid rgba(91,107,200,0.08)' : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={textS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: '11px', color: textS, textAlign: 'center', marginTop: '8px', lineHeight: '1.7', opacity: 0.7, whiteSpace: 'pre-line' }}>
        {'\u00a9 2026 Midhad L\u00f6k \u2013 MeinPsyCheck\nAlle Rechte vorbehalten.'}
      </p>

      {tourDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,60,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setTourDialog(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 20px 36px', width: '100%', maxWidth: '430px' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '17px', fontWeight: '700', color: '#2a2a3e', margin: '0 0 8px', textAlign: 'center' }}>App-Tour wiederholen?</p>
            <p style={{ fontSize: '14px', color: '#8a8faa', margin: '0 0 24px', textAlign: 'center', lineHeight: '1.5' }}>Die Tour zeigt dir alle Funktionen der App. Du wirst zur Hauptseite weitergeleitet.</p>
            <button onClick={() => { setTourDialog(false); onTourNeuStarten?.() }} style={{ width: '100%', padding: '14px', background: '#5B6BC8', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
              Ja, Tour starten
            </button>
            <button onClick={() => setTourDialog(false)} style={{ width: '100%', padding: '14px', background: 'none', color: '#8a8faa', border: 'none', fontSize: '15px', cursor: 'pointer' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const SCREEN_ORDER = ['hallo', 'alter', 'app']

function App() {
  const [screen, setScreen] = useState('loading')
  const [prevScreen, setPrevScreen] = useState(null)
  useEffect(() => {
    const done = localStorage.getItem('onboarding_done')
    setScreen(done === 'true' ? 'app' : 'hallo')
  }, [])

  const goTo = (next) => {
    setPrevScreen(screen)
    setScreen(next)
  }

  if (screen === 'loading') return null

  // Vorwärts = slide von rechts, Rückwärts = slide von links
  const forward = prevScreen ? SCREEN_ORDER.indexOf(screen) > SCREEN_ORDER.indexOf(prevScreen) : true
  const anim = forward
    ? 'screenSlideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) forwards'
    : 'screenSlideInLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94) forwards'

  return (
    <>
      <style>{`
        @keyframes screenSlideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes screenSlideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div key={screen} style={{ animation: anim, willChange: 'transform, opacity', height: '100dvh', overflow: 'hidden' }}>
        {screen === 'hallo' && <OnboardingFlow onWeiter={() => goTo('alter')} />}
        {screen === 'alter' && <AlterScreen onWeiter={() => goTo('app')} onZurueck={() => goTo('hallo')} />}
        {screen === 'app' && <HauptApp />}
      </div>
    </>
  )
}

export default App