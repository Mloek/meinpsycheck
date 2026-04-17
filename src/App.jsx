import { useState, useEffect, useRef } from 'react'
import lottie from 'lottie-web'

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

const PHQ4_FRAGEN = [
  { id: 'phq4_1', text: 'Wenig Interesse oder Freude an Ihren Tätigkeiten' },
  { id: 'phq4_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq4_3', text: 'Gefühle der Nervosität, Ängstlichkeit oder Anspannung' },
  { id: 'phq4_4', text: 'Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren' },
]

// PHQ9 hat jetzt nur noch 8 Fragen – die Suizid-Frage (Item 9) ist ein eigener Screen
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

const ANTWORTEN_GAD7 = [
  { wert: 0, label: 'Nie' },
  { wert: 1, label: 'An manchen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]

const ANTWORTEN_ASRS = [
  { wert: 0, label: 'Niemals' },
  { wert: 1, label: 'Selten' },
  { wert: 2, label: 'Manchmal' },
  { wert: 3, label: 'Oft' },
  { wert: 4, label: 'Sehr oft' },
]

const INSTRUMENTE = ['PHQ9', 'GAD7', 'ASRS']

const INSTRUMENT_CONFIG = {
  PHQ9: { fragen: PHQ9_FRAGEN, antworten: ANTWORTEN_STANDARD, zeitrahmen: 'In den letzten 2 Wochen:' },
  GAD7: { fragen: GAD7_FRAGEN, antworten: ANTWORTEN_GAD7, zeitrahmen: 'In den letzten 2 Wochen:' },
  ASRS: { fragen: ASRS_FRAGEN, antworten: ANTWORTEN_ASRS, zeitrahmen: 'In den letzten 6 Monaten:' },
}

// 4 (PHQ4) + 8 (PHQ9 ohne Suizid) + 7 (GAD7) + 6 (ASRS) + 1 (Suizid-Screen) = 26
const GESAMT_FRAGEN = 26

function berechneErgebnisse(antworten) {
  const ergebnisse = []

  const phq9Score = PHQ9_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0) + (antworten['phq9_9'] ?? 0)
  const phq9Chips = []
  if ((antworten['phq9_3'] ?? 0) >= 2) phq9Chips.push('Schlafprobleme')
  if ((antworten['phq9_6'] ?? 0) >= 2) phq9Chips.push('Grübeln')
  if ((antworten['phq9_4'] ?? 0) >= 2) phq9Chips.push('Antriebslosigkeit')
  if ((antworten['phq9_7'] ?? 0) >= 2) phq9Chips.push('Konzentration')
  if ((antworten['phq9_2'] ?? 0) >= 2) phq9Chips.push('Freudlosigkeit')
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

  const who5Intern = Math.round((
    (3 - Math.min(antworten['phq9_1'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_4'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_3'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_2'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_7'] ?? 0, 3))
  ) * (100 / 15))
  if (who5Intern <= 52) {
    ergebnisse.push({ instrument: 'WHO-5 (aus PHQ-9)', label: 'Chronischer Stress', score: who5Intern, cutOff: 52, stufe: who5Intern <= 28 ? 1 : 2, chips: ['Chronischer Stress'] })
  }

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
    text: 'MeinPsyCheck nutzt PHQ-9, GAD-7 und ASRS v1.1 – international standardisierte Instrumente aus der klinischen Praxis. Du beantwortest 26 Fragen. Das Ergebnis zeigt dir, ob deine Beschwerden eine professionelle Abklärung rechtfertigen.',
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
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes obEnter {
          from { opacity: 0; transform: translateY(28px) translateX(16px); }
          to { opacity: 1; transform: translate(0, 0); }
        }
        @keyframes obExit {
          from { opacity: 1; transform: translate(0, 0); }
          to { opacity: 0; transform: translateY(-20px) translateX(-12px); }
        }
        .ob-enter { animation: obEnter 600ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
        .ob-exit { animation: obExit 300ms ease-in forwards; }
      `}</style>

      <div ref={lottieRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 40px' }}>
        {step > 0 && (
          <p style={{ position: 'absolute', top: '52px', left: '24px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.5px' }}>MeinPsyCheck</p>
        )}
        <div key={step} className={animClass}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>{screen.label}</p>
          <h1 style={{ fontSize: screen.titelGross ? '42px' : '24px', fontWeight: screen.titelGross ? '700' : '600', color: '#fff', margin: '0 0 16px', textShadow: '0 1px 16px rgba(0,0,0,0.5)', lineHeight: 1.15 }}>{screen.titel}</h1>
          <p style={{ fontSize: '14px', color: 'rgba(220,240,220,0.9)', lineHeight: '1.75', margin: '0 0 32px' }}>{screen.text}</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', justifyContent: 'center' }}>
          {ONBOARDING_SCREENS.map((_, i) => (
            <div key={i} style={{ height: '4px', borderRadius: '4px', backgroundColor: i === step ? '#ffffff' : 'rgba(255,255,255,0.55)', width: i === step ? '22px' : '8px', transition: 'all 0.3s ease' }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {step > 0 && (
            <button onClick={() => goTo(step - 1)} style={{ flex: 1, padding: '16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              Zurück
            </button>
          )}
          {!isLast ? (
            <button onClick={() => goTo(step + 1)} style={{ flex: 1, padding: '16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              Weiter
            </button>
          ) : (
            <button onClick={onWeiter} style={{ flex: 1, padding: '16px', backgroundColor: '#2D6A4F', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              Starten
            </button>
          )}
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
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: 'linear-gradient(160deg, #E8EAF6 0%, #E1F5FE 35%, #F3E5F5 70%, #EDE7F6 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '52px', marginBottom: '8px' }}>
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

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 24px 40px', boxSizing: 'border-box', background: 'linear-gradient(to top, #E8EAF6 60%, transparent)' }}>
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
      <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '12px' }}>26 Fragen · ca. 5–10 Minuten · Alle Angaben bleiben auf deinem Gerät</p>
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
    <div style={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <button onClick={handleZurueck} style={{ background: 'none', border: 'none', color: '#5B6BC8', fontSize: '15px', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>

      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px' }}>
        <div style={{ height: '4px', backgroundColor: '#5B6BC8', borderRadius: '2px', width: `${prozent}%`, transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 32px' }}>Frage {aktuelleGesamt} von {GESAMT_FRAGEN}</p>

      <div style={{ flex: 1 }}>
        {zeitrahmen && (
          <p style={{ fontSize: '20px', fontWeight: '400', color: colors.textMuted, lineHeight: '1.5', margin: '0 0 8px' }}>{zeitrahmen}</p>
        )}
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 32px' }}>{aktuelleFrage.text}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
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

      <button onClick={handleWeiter} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? '#5B6BC8' : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '16px' }}>
        {istLetzte ? 'Abschließen' : 'Weiter'}
      </button>
    </div>
  )
}

function SuizidScreen({ onAntwort }) {
  const [ausgewaehlt, setAusgewaehlt] = useState(-1)

  return (
    <div style={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px' }}>
        <div style={{ height: '4px', backgroundColor: colors.primary, borderRadius: '2px', width: '100%' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 32px' }}>Frage 26 von 26</p>

      <div style={{ backgroundColor: colors.crisisBg, borderRadius: '10px', padding: '12px 14px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: colors.crisis, margin: 0, lineHeight: '1.5' }}>
          Bitte beantworten Sie die Frage bezogen auf die letzten 2 Wochen.
        </p>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 32px' }}>
          Gedanken, dass Sie lieber tot wären oder sich Leid zufügen möchten
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
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

      <button onClick={() => onAntwort(ausgewaehlt)} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? '#5B6BC8' : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '16px' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: config.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
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
// Ablauf: einstieg → phq4 → vertiefung (PHQ9, GAD7, ASRS) → suizid → ergebnis ODER krise
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
  // PHQ4=4 Fragen, dann PHQ9 startet bei Frage 5 (bisherFragen=4)
  // GAD7 startet bei Frage 13 (4 + 8 PHQ9-Fragen = 12, bisherFragen=12)
  // ASRS startet bei Frage 20 (4 + 8 + 7 = 19, bisherFragen=19)
  const bisherFragenProInstrument = [4, 12, 19]

  const handlePHQ4Fertig = (neueAntworten) => {
    setAlleAntworten(prev => ({ ...prev, ...neueAntworten }))
    setAktuellesInstrument(0)
    setPhase('vertiefung')
  }

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
    setPhase('ergebnis')
  }

  if (phase === 'einstieg') {
    return <ScreeningEinstieg symptomAuswahl={symptomAuswahl} setSymptomAuswahl={setSymptomAuswahl} onWeiter={() => setPhase('phq4')} onZurueck={onZurueck} />
  }

  if (phase === 'phq4') {
    return <ScreeningFragen fragen={PHQ4_FRAGEN} antworten={ANTWORTEN_STANDARD} zeitrahmen="In den letzten 2 Wochen:" onFertig={handlePHQ4Fertig} onZurueck={() => setPhase('einstieg')} bisherFragen={0} />
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
        else setPhase('phq4')
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

  if (phase === 'ergebnis') {
    return <ScreeningErgebnis ergebnisse={ergebnisse} suizidItem={suizidWert} onNeustart={() => { setPhase('einstieg'); setAlleAntworten({}); setSymptomAuswahl([]); setSuizidWert(0) }} onZurueck={onZurueck} />
  }

  return null
}

function DisclaimerScreen({ onWeiter }) {
  return (
    <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: colors.background }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: colors.crisisBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#FFCDD2', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: colors.crisis }}>!</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: colors.crisis, margin: '0 0 12px' }}>Hinweis zur Sicherheit</h2>
        <p style={{ fontSize: '15px', color: '#5D2D2D', lineHeight: '1.7', margin: 0 }}>Du hast angegeben, dass du in den letzten 2 Wochen Gedanken hattest, dir selbst Schaden zuzufügen. Das Screening endet an dieser Stelle. Bitte nutze jetzt eine der folgenden Kontaktmöglichkeiten.</p>
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
    lang: 'Der PHQ-9 ist einer der weltweit am häufigsten eingesetzten Fragebögen zur Erkennung depressiver Störungen. Die Fragen erfassen, wie oft du in den letzten zwei Wochen typische Symptome einer Depression erlebt hast – wie Antriebslosigkeit, Freudlosigkeit, Schlafprobleme oder das Gefühl, wertlos zu sein. Ein Wert über 10 bedeutet nicht, dass du „krank" bist. Er bedeutet, dass deine Beschwerden ein Ausmaß erreicht haben, bei dem professionelle Unterstützung sinnvoll und wirksam ist. Depressionen gehören zu den am besten behandelbaren psychischen Erkrankungen – mit Therapie sprechen über 60% der Betroffenen gut auf Behandlung an.',
  },
  'GAD-7': {
    kurz: 'Deine Angaben im Bereich Angst & innere Anspannung überschreiten den klinischen Grenzwert. Das deutet auf eine generalisierte Angststörung hin.',
    lang: 'Der GAD-7 wurde entwickelt um zu erfassen, wie stark Sorgen und Anspannung deinen Alltag belasten. Die Fragen fragen nicht nach einzelnen Angst-Momenten, sondern nach einem anhaltenden Muster über zwei Wochen. Generalisierte Angst bedeutet nicht, dass du Angst vor einer bestimmten Sache hast – es bedeutet, dass das Nervensystem dauerhaft in einem erhöhten Alarmzustand ist. Das kostet enorm viel Energie und beeinflusst Schlaf, Konzentration und soziale Kontakte. Auch hier gilt: Das ist behandelbar. Kognitive Verhaltenstherapie zeigt bei Angststörungen sehr gute Ergebnisse.',
  },
  'ASRS v1.1': {
    kurz: 'Deine Angaben im Bereich Konzentration & Impulsivität überschreiten den klinischen Grenzwert. Das deutet auf ADHS-Symptome im Erwachsenenalter hin.',
    lang: 'Der ASRS v1.1 wurde von der Weltgesundheitsorganisation entwickelt und erfasst typische ADHS-Symptome bei Erwachsenen – Schwierigkeiten beim Abschließen von Aufgaben, Probleme mit Organisation und Planung sowie motorische Unruhe. ADHS im Erwachsenenalter wird oft spät erkannt, weil die Symptome sich anders zeigen als bei Kindern. Viele Betroffene haben jahrelang das Gefühl, sich einfach „mehr anstrengen" zu müssen – ohne zu wissen, dass ein neurobiologischer Unterschied dahintersteckt. Eine Abklärung beim Psychiater oder einem spezialisierten Psychologen kann Klarheit bringen.',
  },
  'WHO-5 (aus PHQ-9)': {
    kurz: 'Deine Angaben deuten auf ein reduziertes allgemeines Wohlbefinden hin, das auf chronischen Stress oder emotionale Erschöpfung hinweisen kann.',
    lang: 'Der WHO-5 Wohlbefindens-Index misst, wie oft du dich in den letzten zwei Wochen aktiv, entspannt und positiv gestimmt gefühlt hast. Ein niedriger Wert ist kein Zeichen einer psychischen Störung – aber er ist ein ernstes Signal, das nicht ignoriert werden sollte. Chronischer Stress ist einer der am besten belegten Auslöser für eine Vielzahl von Erkrankungen – sowohl körperlich als auch psychisch. Dauerhafter Stress erhöht das Risiko für Herz-Kreislauf-Erkrankungen, Schlafstörungen, Immunschwäche und ist gleichzeitig einer der häufigsten Wegbereiter für Depressionen und Angststörungen. Du brauchst keine Diagnose, um dir Unterstützung zu suchen. Wer früh gegensteuert, schützt nicht nur seine psychische Gesundheit, sondern seinen gesamten Körper. Ein Gespräch mit dem Hausarzt oder einem Psychologen kann ein sinnvoller erster Schritt sein. Das Tagebuch in dieser App hilft dir, Muster zu erkennen – wann es dir besser geht, wann schlechter, und was den Unterschied macht.',
  },
}

const RESSOURCEN_KATALOG = {
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
    erklaerung: 'Chronischer Stress ist nicht Schwäche – er ist ein Signal des Körpers, dass das System überlastet ist. Es gibt gut belegte Techniken, um gezielt gegenzusteuern.',
    interventionen: [
      { titel: 'Progressive Muskelentspannung', text: 'Muskeln anspannen und loslassen – senkt Cortisol direkt', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: '4-7-8 Atemtechnik', text: '4 Sek. einatmen, 7 halten, 8 ausatmen' },
      { titel: 'MBSR-Kurzübung', text: '10 Min. Achtsamkeit täglich – über 500 Studien belegt', video: 'https://youtu.be/TSGOQaxu43o' },
      { titel: 'Stresstagebuch', text: 'Auslöser 1 Woche täglich notieren' },
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
    ? { grad: 'linear-gradient(to bottom, #9b7ec8 0%, #7b5ea7 45%, #2d1f4a 100%)', badge: 'AUFFÄLLIG', titel: 'Erhöhte Belastung erkannt', sub: 'Deine Angaben überschreiten in mindestens einem Bereich den klinischen Grenzwert validierter Screening-Instrumente. Wir empfehlen dir, das Gespräch mit einer psychologischen oder ärztlichen Fachkraft zu suchen.' }
    : höchsteStufe === 2
    ? { grad: 'linear-gradient(to bottom, #8b9ed8 0%, #5B6BC8 50%, #3a4a9a 100%)', badge: 'LEICHT ERHÖHT', titel: 'Leichte Auffälligkeiten', sub: 'Deine Werte liegen unterhalb des klinischen Grenzwerts, zeigen aber in einzelnen Bereichen subklinisch erhöhte Belastung. Bei anhaltenden Beschwerden empfehlen wir eine fachliche Abklärung.' }
    : { grad: 'linear-gradient(to bottom, #5a9e82 0%, #3d8068 45%, #1f4d3e 100%)', badge: 'UNAUFFÄLLIG', titel: 'Keine klinischen Hinweise', sub: 'Deine Angaben ergeben anhand der validierten Screening-Instrumente aktuell keine Hinweise auf eine behandlungsbedürftige psychische Störung. Das Screening kann nach 14 Tagen wiederholt werden.' }

  // Welche Karten anzeigen
  const karten = hatStufe1 ? stufe1 : stufe2

  // Chip → Katalog-Mapping für Ressourcen
  const chipToKatalog = {
    'Schlafprobleme': 'Schlafprobleme', 'Grübeln': 'Grübeln', 'Grübeln / Sorgen': 'Grübeln',
    'Antriebslosigkeit': 'Antriebslosigkeit', 'Konzentration': 'Konzentration',
    'Innere Unruhe': 'Innere Unruhe', 'Reizbarkeit': 'Reizbarkeit',
    'Chronischer Stress': 'Chronischer Stress', 'Sozialer Rückzug': 'Sozialer Rückzug',
    'Freudlosigkeit': 'Grübeln',
  }
  const alleRelevantChips = [...new Set(karten.flatMap(r => r.chips ?? []))]
  const relevanteKatalogKeys = [...new Set(alleRelevantChips.map(c => chipToKatalog[c]).filter(k => k && RESSOURCEN_KATALOG[k]))]

  const ressourcenConfig = [
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
    <div style={{ background: bg, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '40px' }}>
      <style>{`
        @keyframes bergDrift1 { 0%{transform:translateX(0)} 50%{transform:translateX(-18px)} 100%{transform:translateX(0)} }
        @keyframes bergDrift2 { 0%{transform:translateX(0)} 50%{transform:translateX(12px)} 100%{transform:translateX(0)} }
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
      <div style={{ height: '230px', background: hero.grad, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '28px' }}>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '70px', display: 'block', animation: 'bergDrift1 14s ease-in-out infinite', opacity: 0.6 }}>
          <polygon points="0,100 55,38 110,72 170,18 230,55 295,8 355,46 430,28 440,100" fill={bg} />
        </svg>
        <svg viewBox="0 0 430 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: '-10px', width: 'calc(100% + 20px)', height: '70px', display: 'block', animation: 'bergDrift2 18s ease-in-out infinite' }}>
          <polygon points="0,100 35,52 75,70 125,32 175,58 225,22 285,52 335,18 385,42 440,32 440,100" fill={bg} opacity="0.85" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.22)', borderRadius: '100px', fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginBottom: '10px' }}>{hero.badge}</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 10px', textShadow: '0 1px 12px rgba(0,0,0,0.35)', lineHeight: '1.15' }}>{hero.titel}</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: '1.55' }}>{hero.sub}</p>
        </div>
      </div>

      <div style={{ padding: '0 14px' }}>

        {/* ── Diagnosen-Karten (horizontal swipebar) ──────────────── */}
        {karten.length > 0 && (
          <>
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
                const istOffen = aufgeklappt === res.instrument
                return (
                  <div key={res.instrument} onClick={() => setAufgeklappt(istOffen ? null : res.instrument)}
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
                      <span style={{ fontSize: '20px', color: textS, flexShrink: 0, marginTop: '10px', transition: 'transform 0.2s', transform: istOffen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
                    </div>
                    {istOffen && info?.lang && (
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(91,107,200,0.08)' }}>
                        <p style={{ fontSize: '13px', color: textS, lineHeight: '1.75', margin: '14px 0 0' }}>{info.lang}</p>
                      </div>
                    )}
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
          </>
        )}

        {/* ── Ressourcen ──────────────────────────────────────────── */}
        {relevanteRessourcen.length > 0 && (
          <>
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
          </>
        )}

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <div style={{ background: 'rgba(91,107,200,0.06)', borderRadius: '12px', padding: '14px', margin: '20px 0 0', border: '1px solid rgba(91,107,200,0.1)' }}>
          <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.65' }}>
            {höchsteStufe === 1
              ? 'Diese Einschätzung basiert auf Selbstangaben und validierten Screening-Fragen. Sie ist keine Diagnose und ersetzt keine fachliche Abklärung.'
              : höchsteStufe === 2
              ? 'Diese Einschätzung basiert auf Selbstangaben und ist eine Momentaufnahme. Bei anhaltenden Beschwerden ist eine fachliche Abklärung sinnvoll.'
              : 'Diese Einschätzung basiert auf Selbstangaben und ist eine Momentaufnahme. Bei Bedarf kannst du das Screening nach 14 Tagen erneut durchführen.'}
          </p>
        </div>

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <button onClick={onZurueck} style={{ width: '100%', padding: '16px', background: accent, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' }}>Zur Startseite</button>
        <button onClick={onNeustart} style={{ width: '100%', padding: '14px', background: 'transparent', color: textS, border: '1px solid rgba(91,107,200,0.2)', borderRadius: '14px', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>Neues Screening starten</button>
      </div>

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

function HauptApp() {
  const [aktiveTab, setAktiveTab] = useState('home')
  const [tagebuchOffen, setTagebuchOffen] = useState(false)
  const [tagebuchStartAnsicht, setTagebuchStartAnsicht] = useState(null)
  const [screeningOffen, setScreeningOffen] = useState(false)
  const [testErgebnis, setTestErgebnis] = useState(null)
  const [verlassenDialog, setVerlassenDialog] = useState(null) // ziel-tab-id

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
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#dde1ee', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {aktiveTab === 'home' && !tagebuchOffen && !screeningOffen && <Hauptseite onTagebuchOeffnen={handleTagebuchOeffnen} onScreeningOeffnen={() => setScreeningOffen(true)} onTestErgebnis={IS_DEV ? handleTestErgebnis : undefined} />}
        {aktiveTab === 'home' && tagebuchOffen && <Tagebuch onZurueck={() => { setTagebuchOffen(false); setTagebuchStartAnsicht(null) }} startAnsicht={tagebuchStartAnsicht} />}
        {aktiveTab === 'home' && screeningOffen && (testErgebnis
          ? <ScreeningErgebnis ergebnisse={testErgebnis} suizidItem={0} onNeustart={() => { setScreeningOffen(false); setTestErgebnis(null) }} onZurueck={() => { setScreeningOffen(false); setTestErgebnis(null) }} />
          : <ScreeningFlow onZurueck={() => setScreeningOffen(false)} />
        )}
        {aktiveTab === 'therapeuten' && <TherapeutenPlatzhalter />}
        {aktiveTab === 'einstellungen' && <Einstellungen />}
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

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', backgroundColor: '#fff', borderTop: '1px solid rgba(91,107,200,0.12)', display: 'flex', zIndex: 100 }}>
        {[{ id: 'home', label: 'Hauptseite' }, { id: 'therapeuten', label: 'Therapeuten' }, { id: 'einstellungen', label: 'Einstellungen' }].map((tab) => (
          <button key={tab.id} onClick={() => handleTabKlick(tab.id)} style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', borderTop: `2px solid ${aktiveTab === tab.id ? '#5B6BC8' : 'transparent'}`, cursor: 'pointer', fontSize: '11px', fontWeight: aktiveTab === tab.id ? '600' : '400', color: aktiveTab === tab.id ? '#5B6BC8' : '#aab0c8' }}>
            {tab.label}
          </button>
        ))}
      </div>
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
  'Stress': 'Chronischer Stress',
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
    <div style={{ background: '#dde1ee', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
        <div style={{ background: '#fff', borderRadius: '18px', border: cardBorder, overflow: 'hidden' }}>
          <div onClick={onScreeningOeffnen} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #7b5ea7, #5B6BC8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="#fff" strokeWidth="1.8"/>
                <path d="M9 8h6M9 12h6M9 16h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: textP, margin: '0 0 2px' }}>Neues Screening starten</p>
              <p style={{ fontSize: '11px', color: textS, margin: 0 }}>26 Fragen · ca. 5–10 Min · wissenschaftlich validiert</p>
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
        <div style={{ background: '#fff', borderRadius: '18px', border: cardBorder, padding: '20px 16px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
      <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
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
        {!alleAusgewaehlt && <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '8px' }}>Bitte alle drei Ratings ausfüllen</p>}
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

function TherapeutenPlatzhalter() {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '40px', margin: '0 0 16px' }}>🗺️</p>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 10px' }}>Therapeutensuche</h2>
      <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.6' }}>Hier findest du bald Psychologen und Therapeuten in deiner Nähe.</p>
      <p style={{ fontSize: '13px', color: colors.textLight, marginTop: '16px' }}>Kommt in Version 2</p>
    </div>
  )
}

function Einstellungen() {
  const [offen, setOffen] = useState(null)

  const [detailAnsicht, setDetailAnsicht] = useState(null)

  const sektionen = [
    { titel: 'Konto', items: ['E-Mail-Adresse hinterlegen', 'App bewerten'] },
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
      text: 'Ein Cut-Off ist der Punktwert, ab dem ein Screening-Ergebnis als klinisch auffällig gilt. Diese Werte wurden nicht willkürlich gewählt – sie stammen aus den Originalpublikationen der Fragebogenentwickler und wurden in unabhängigen Studien für die deutsche Bevölkerung validiert.\nPHQ-9: Cut-Off ≥ 10 – Sensitivität 88%, Spezifität 88% für eine depressive Störung (Kroenke et al., 2001).\nGAD-7: Cut-Off ≥ 10 – Sensitivität 89%, Spezifität 82% für eine generalisierte Angststörung (Spitzer et al., 2006).\nASRS v1.1: ≥ 4 auffällige Antworten – entwickelt von der WHO (Kessler et al., 2005).\nEin positives Screening bedeutet nicht, dass eine Erkrankung vorliegt. Es bedeutet, dass deine Angaben in einem Bereich liegen, in dem professionelle Abklärung sinnvoll ist.',
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

  if (detailAnsicht === 'wissenschaft') {
    return (
      <div style={{ padding: '24px 16px 0' }}>
        <button onClick={() => { setDetailAnsicht(null); setOffen(null) }} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 24px' }}>Wissenschaftliche Grundlagen</h1>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {wissenschaft.map((item, i) => {
            const istOffen = offen === item.id
            return (
              <div key={item.id} style={{ borderBottom: i < wissenschaft.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                <div onClick={() => setOffen(istOffen ? null : item.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', color: colors.text, fontWeight: '600' }}>{item.titel}</span>
                  <span style={{ color: colors.textLight, fontSize: '16px', flexShrink: 0, marginLeft: '8px' }}>{istOffen ? '↑' : '↓'}</span>
                </div>
                {istOffen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    {item.text && (
                      <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 12px', whiteSpace: 'pre-line' }}>{item.text}</p>
                    )}
                    {item.quellen && item.quellen.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        {item.quellen.map((q, qi) => (
                          <p key={qi} style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 4px' }}>{q}</p>
                        ))}
                      </div>
                    )}
                    {item.instrumente && (
                      <div>
                        {item.instrumente.map((inst) => (
                          <div key={inst.name} style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 6px' }}>{inst.name}</p>
                            {inst.refs.map((ref, ri) => (
                              <p key={ri} style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 4px' }}>{ref}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 0' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 24px' }}>Einstellungen</h1>
      {sektionen.map((sektion) => (
        <div key={sektion.titel} style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 4px' }}>{sektion.titel}</p>
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {sektion.items.map((item, i) => (
              <div key={item} onClick={item === 'Wissenschaftliche Grundlagen' ? () => setDetailAnsicht('wissenschaft') : undefined} style={{ padding: '14px 16px', fontSize: '15px', color: colors.text, borderBottom: i < sektion.items.length - 1 ? `1px solid ${colors.border}` : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item}<span style={{ color: colors.textLight, fontSize: '16px' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('loading')
  useEffect(() => {
    const done = localStorage.getItem('onboarding_done')
    setScreen(done === 'true' ? 'app' : 'hallo')
  }, [])
  if (screen === 'loading') return null
  if (screen === 'hallo') return <OnboardingFlow onWeiter={() => setScreen('alter')} />
  if (screen === 'alter') return <AlterScreen onWeiter={() => setScreen('app')} onZurueck={() => setScreen('hallo')} />
  return <HauptApp />
}

export default App