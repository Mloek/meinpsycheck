import { useState, useEffect, useRef, useMemo } from 'react'

// Platform detection
function detectPlatform() {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'ios' // Desktop-Fallback: iOS-Tab zeigen
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function PhoneMockup({ src, alt, tilt = 0, width }) {
  return (
    <div style={{ transform: `rotate(${tilt}deg)`, flexShrink: 0, filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.45))' }}>
      <div style={{
        width, height: `calc(${width} * 2.1)`,
        borderRadius: 28, border: '4px solid rgba(255,255,255,0.22)',
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', zIndex: 10,
        }} />
        {src
          ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)' }} />
        }
      </div>
    </div>
  )
}

const INSTALL_STEPS = {
  ios: [
    {
      title: 'Safari öffnen',
      desc: 'Diese Seite in Safari aufrufen – nicht Chrome oder Firefox',
    },
    {
      title: 'Teilen-Symbol antippen',
      desc: 'Das Symbol unten in der Mitte antippen (Quadrat mit Pfeil nach oben)',
      // Kein Bild – das bisherige Bild zeigte fälschlicherweise das 3-Punkte-Menü
    },
    {
      title: '"Zum Home-Bildschirm" wählen',
      desc: 'In der Liste runterscrollen und "Zum Home-Bildschirm" antippen',
      img: '/install_ios_homescreen.png',
      showLabel: 'Beispiel anzeigen',
    },
    {
      title: '"Hinzufügen" tippen – fertig!',
      desc: 'Oben rechts auf "Hinzufügen" tippen',
    },
  ],
  android: [
    {
      title: 'Chrome öffnen',
      desc: 'Diese Seite in Chrome aufrufen – nicht Samsung Browser oder Firefox',
    },
    {
      title: 'Drei Punkte oben rechts antippen',
      desc: 'Das Menü oben rechts öffnen',
      img: '/install_samsung_dots.jpg',
      showLabel: 'Wie sieht das aus?',
    },
    {
      title: '"Zum Startbildschirm hinzufügen" wählen',
      desc: 'Diesen Eintrag in der Liste antippen',
      img: '/install_android_menu.jpg',
      showLabel: 'Wie sieht das aus?',
    },
    {
      title: '"Hinzufügen" tippen – fertig!',
      desc: 'Im Dialog bestätigen',
    },
  ],
}

function InstallModal({ onClose, defaultTab }) {
  const [tab, setTab] = useState(defaultTab || 'ios')
  const [expandedSteps, setExpandedSteps] = useState({})
  const startY = useRef(0)
  const steps = INSTALL_STEPS[tab]

  // Bilder beim Tab-Wechsel einklappen
  const handleTabChange = (newTab) => {
    setTab(newTab)
    setExpandedSteps({})
  }
  const toggleStep = (i) => setExpandedSteps(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { startY.current = e.touches[0].clientY }}
        onTouchEnd={e => { if (e.changedTouches[0].clientY - startY.current > 80) onClose() }}
        style={{
          background: '#1e0a3c', borderRadius: '28px 28px 0 0',
          padding: '20px 20px 40px', width: '100%', maxWidth: 520,
          border: '1px solid rgba(124,58,237,0.4)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Swipe handle */}
        <div style={{ width: 44, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)', margin: '0 auto 20px', cursor: 'grab' }} />

        <h2 style={{ fontSize: 21, fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: 18 }}>
          App installieren
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 4, marginBottom: 22 }}>
          <button onClick={() => handleTabChange('ios')} style={{
            flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 15, transition: 'background 0.2s',
            background: tab === 'ios' ? '#6d28d9' : 'transparent', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            {/* Apple-style icon – generic apple silhouette, not Apple Inc. trademark */}
            <svg width="15" height="18" viewBox="0 0 15 18" fill="currentColor">
              <path d="M12.27 9.54c-.02-2.07 1.7-3.07 1.78-3.12-0.97-1.42-2.48-1.61-3.02-1.63-1.29-.13-2.52.76-3.17.76-.65 0-1.66-.74-2.73-.72-1.4.02-2.7.82-3.42 2.08-1.46 2.53-.37 6.28 1.05 8.33.7 1.01 1.53 2.14 2.62 2.1 1.05-.04 1.45-.68 2.72-.68 1.27 0 1.63.68 2.74.66 1.13-.02 1.85-1.03 2.54-2.04.8-1.17 1.13-2.3 1.15-2.36-.03-.01-2.24-.86-2.26-3.38zM10.18 3.17c.58-.71.97-1.69.86-2.67-.83.03-1.84.55-2.43 1.25-.53.62-.99 1.62-.87 2.57.93.07 1.87-.47 2.44-1.15z"/>
            </svg>
            iPhone
          </button>
          <button onClick={() => handleTabChange('android')} style={{
            flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 15, transition: 'background 0.2s',
            background: tab === 'android' ? '#6d28d9' : 'transparent', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            {/* Android robot – CC BY 3.0 Google */}
            <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
              <path d="M1.5 6.5C.67 6.5 0 7.17 0 8v4c0 .83.67 1.5 1.5 1.5S3 12.83 3 12V8c0-.83-.67-1.5-1.5-1.5zm13 0C13.67 6.5 13 7.17 13 8v4c0 .83.67 1.5 1.5 1.5S16 12.83 16 12V8c0-.83-.67-1.5-1.5-1.5zM3.5 14c0 .55.45 1 1 1h.5v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V15h1v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V15h.5c.55 0 1-.45 1-1V6.5h-9V14zM8 0C5.24 0 2.92 1.66 2.06 4h11.88C13.08 1.66 10.76 0 8 0zm-1.5 2.75c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm3 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
            </svg>
            Android
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              padding: '14px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: 16,
            }}>
              {/* Nummer + Text */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: '#6d28d9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 3 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
              {/* Screenshot: nur auf Wunsch einblenden */}
              {s.img && s.showLabel && (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => toggleStep(i)}
                    style={{
                      background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8, padding: '5px 12px', color: 'rgba(255,255,255,0.6)',
                      fontSize: 12, cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    {expandedSteps[i] ? '▲ Ausblenden' : `▼ ${s.showLabel}`}
                  </button>
                  {expandedSteps[i] && (
                    <img
                      src={s.img}
                      alt={s.title}
                      style={{
                        display: 'block', marginTop: 10, width: '100%', borderRadius: 10,
                        objectFit: 'contain', maxHeight: 220,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(0,0,0,0.3)',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tip / Chrome-Hinweis */}
        <div style={{
          marginTop: 18, padding: '12px 16px',
          background: 'rgba(109,40,217,0.3)', borderRadius: 14,
          border: '1px solid rgba(109,40,217,0.5)',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            {tab === 'ios'
              ? 'Wichtig: Diese Seite muss in Safari geöffnet sein – nicht in Chrome oder Firefox. Sonst erscheint die Option nicht.'
              : 'Wichtig: Diese Seite muss in Chrome geöffnet sein. Falls die Option nicht erscheint, einfach die Adresse in Chrome eingeben.'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Fragen & Scoring (identisch zur App) ─────────────────────────────────
const WEB_PHQ9 = [
  { id: 'phq9_1', text: 'Wenig Interesse oder Freude an Ihren Tätigkeiten' },
  { id: 'phq9_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq9_3', text: 'Schwierigkeiten, ein- oder durchzuschlafen, oder vermehrter Schlaf' },
  { id: 'phq9_4', text: 'Müdigkeit oder Gefühl, keine Energie zu haben' },
  { id: 'phq9_5', text: 'Verminderter Appetit oder übermäßiges Bedürfnis zu essen' },
  { id: 'phq9_6', text: 'Schlechte Meinung von sich selbst; Gefühl, ein Versager zu sein' },
  { id: 'phq9_7', text: 'Schwierigkeiten, sich auf etwas zu konzentrieren' },
  { id: 'phq9_8', text: 'Ungewöhnlich langsame Bewegungen oder Sprache – oder im Gegenteil Unruhe und Zappeligkeit' },
  { id: 'phq9_9', text: 'Gedanken, dass es besser wäre, tot zu sein, oder sich selbst Schaden zuzufügen' },
]
const WEB_GAD7 = [
  { id: 'gad7_1', text: 'Gefühle der Nervosität, Ängstlichkeit oder Anspannung' },
  { id: 'gad7_2', text: 'Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren' },
  { id: 'gad7_3', text: 'Übermäßige Sorgen bezüglich verschiedener Angelegenheiten' },
  { id: 'gad7_4', text: 'Schwierigkeiten, sich zu entspannen' },
  { id: 'gad7_5', text: 'So rastlos sein, dass das Stillsitzen schwer fällt' },
  { id: 'gad7_6', text: 'Schnelle Verärgerung oder Gereiztheit' },
  { id: 'gad7_7', text: 'Angstgefühle, so als könnte etwas Schreckliches passieren' },
]
const WEB_WHO5 = [
  { id: 'who5_1', text: 'Ich bin froh und guter Stimmung gewesen' },
  { id: 'who5_2', text: 'Ich habe mich ruhig und entspannt gefühlt' },
  { id: 'who5_3', text: 'Ich habe mich aktiv und lebhaft gefühlt' },
  { id: 'who5_4', text: 'Ich bin ausgeruht aufgewacht und habe mich frisch gefühlt' },
  { id: 'who5_5', text: 'Mein Alltag ist voller Dinge, die mich interessieren' },
]
const WEB_ASRS = [
  { id: 'asrs_1', text: 'Probleme, die letzten Feinheiten einer Arbeit abzuschließen, nachdem Sie die wesentlichen Punkte erledigt haben?' },
  { id: 'asrs_2', text: 'Schwierigkeiten bei der Organisation einer Aufgabe, bei der Organisation gefragt ist?' },
  { id: 'asrs_3', text: 'Probleme, sich an Termine oder Verabredungen zu erinnern?' },
  { id: 'asrs_4', text: 'Vermeiden oder Verzögern von Aufgaben, die sehr viel Denkvermögen erfordern?' },
  { id: 'asrs_5', text: 'Hände oder Füße in Bewegung bei langem Sitzen?' },
  { id: 'asrs_6', text: 'Übermäßig aktiv und von einem Motor angetrieben fühlen?' },
]
const ANT_STD = [
  { wert: 0, label: 'Überhaupt nicht' },
  { wert: 1, label: 'An einzelnen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]
const ANT_WHO5 = [
  { wert: 5, label: 'Die ganze Zeit' },
  { wert: 4, label: 'Meistens' },
  { wert: 3, label: 'Etwas mehr als die Hälfte der Zeit' },
  { wert: 2, label: 'Etwas weniger als die Hälfte der Zeit' },
  { wert: 1, label: 'Ab und zu' },
  { wert: 0, label: 'Zu keinem Zeitpunkt' },
]
const ANT_ASRS = [
  { wert: 0, label: 'Niemals' },
  { wert: 1, label: 'Selten' },
  { wert: 2, label: 'Manchmal' },
  { wert: 3, label: 'Oft' },
  { wert: 4, label: 'Sehr oft' },
]

// Alle Fragen flach in Reihenfolge
const WEB_ALLE_FRAGEN = [
  ...WEB_PHQ9.map(f => ({ ...f, antworten: ANT_STD, zeitrahmen: 'In den letzten 2 Wochen:' })),
  ...WEB_GAD7.map(f => ({ ...f, antworten: ANT_STD, zeitrahmen: 'In den letzten 2 Wochen:' })),
  ...WEB_WHO5.map(f => ({ ...f, antworten: ANT_WHO5, zeitrahmen: 'In den letzten 2 Wochen:' })),
  ...WEB_ASRS.map(f => ({ ...f, antworten: ANT_ASRS, zeitrahmen: 'In den letzten 6 Monaten:' })),
]

function berechneWebErgebnisse(a) {
  const phq9 = WEB_PHQ9.reduce((s, f) => s + (a[f.id] ?? 0), 0) + (a['phq9_9'] ?? 0)
  const gad7 = WEB_GAD7.reduce((s, f) => s + (a[f.id] ?? 0), 0)
  const who5 = WEB_WHO5.reduce((s, f) => s + (a[f.id] ?? 0), 0) * 4
  const asrs = WEB_ASRS.reduce((s, f, i) => s + ((a[f.id] ?? 0) >= (i < 3 ? 2 : 3) ? 1 : 0), 0)
  return [
    { label: 'Depression', instrument: 'PHQ-9', score: phq9, cutOff: 10, auffaellig: phq9 >= 10, grenzwertig: phq9 >= 5 && phq9 < 10 },
    { label: 'Angststörung', instrument: 'GAD-7', score: gad7, cutOff: 10, auffaellig: gad7 >= 10, grenzwertig: gad7 >= 5 && gad7 < 10 },
    { label: 'Wohlbefinden', instrument: 'WHO-5', score: who5, cutOff: 50, auffaellig: who5 <= 28, grenzwertig: who5 > 28 && who5 <= 50, invertiert: true },
    { label: 'ADHS-Hinweise', instrument: 'ASRS v1.1', score: asrs, cutOff: 4, auffaellig: asrs >= 4, grenzwertig: asrs >= 2 && asrs < 4 },
  ]
}

// ── Nudge-Modal ───────────────────────────────────────────────────────────
function AnamneseNudgeModal({ onWeiter, onInstall, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#1a0a30', borderRadius: 24,
        padding: '32px 24px', width: '100%', maxWidth: 420,
        border: '1px solid rgba(124,58,237,0.4)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 16 }}>🧠</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', color: '#fff', margin: '0 0 14px', lineHeight: 1.3 }}>
          Du fragst dich, wie es dir wirklich geht.
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 20px', textAlign: 'center' }}>
          Das ist keine Kleinigkeit. Viele tragen diese Frage still mit sich, ohne Antworten zu finden – weil die Wartezimmer voll sind und das Internet voller Halbwahrheiten steckt.
        </p>
        <div style={{
          background: 'rgba(109,40,217,0.2)', borderRadius: 14,
          padding: '14px 16px', marginBottom: 24,
          border: '1px solid rgba(124,58,237,0.35)',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: '#c4b5fd' }}>In der App</strong> werden deine Ergebnisse gespeichert, du kannst deinen Verlauf beobachten, ein Tagebuch führen und passende Ressourcen für dich entdecken – alles anonym, kein Konto nötig.
          </p>
        </div>
        <button onClick={onInstall} style={{
          width: '100%', padding: '15px', marginBottom: 10,
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: '#fff', border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
        }}>
          App holen – kostenlos & anonym
        </button>
        <button onClick={onWeiter} style={{
          width: '100%', padding: '13px',
          background: 'none', color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
          fontSize: 14, cursor: 'pointer',
        }}>
          Trotzdem hier durchführen (ohne Speichern)
        </button>
      </div>
    </div>
  )
}

// ── Anamnese Web-Flow ─────────────────────────────────────────────────────
function AnamneseWebFlow({ onInstall, onClose }) {
  const [index, setIndex] = useState(0)
  const [antworten, setAntworten] = useState({})
  const [ergebnis, setErgebnis] = useState(null)

  const frage = WEB_ALLE_FRAGEN[index]
  const gesamt = WEB_ALLE_FRAGEN.length
  const fortschritt = index / gesamt

  const handleAntwort = (wert) => {
    const neu = { ...antworten, [frage.id]: wert }
    setAntworten(neu)
    if (index < gesamt - 1) {
      setIndex(index + 1)
    } else {
      setErgebnis(berechneWebErgebnisse(neu))
    }
  }

  if (ergebnis) {
    const hatAuffaellig = ergebnis.some(r => r.auffaellig)
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto',
        background: 'linear-gradient(160deg, #1a0a30 0%, #2e1065 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>
            {hatAuffaellig ? '⚠️' : '✅'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', color: '#fff', margin: '0 0 8px' }}>
            Dein Screening-Ergebnis
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px' }}>
            Wird nicht gespeichert · Kein Medizinprodukt · Keine Diagnose
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {ergebnis.map(r => {
              const farbe = r.auffaellig ? '#f87171' : r.grenzwertig ? '#fbbf24' : '#4ade80'
              const text = r.auffaellig ? 'Auffällig' : r.grenzwertig ? 'Grenzwertig' : 'Unauffällig'
              return (
                <div key={r.instrument} style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: 14,
                  padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: `1px solid ${farbe}30`,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{r.instrument}</div>
                  </div>
                  <div style={{ background: farbe + '22', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: farbe }}>
                    {text}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{
            background: 'rgba(109,40,217,0.25)', borderRadius: 16,
            padding: '20px', marginBottom: 20,
            border: '1px solid rgba(124,58,237,0.4)',
          }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 16px', textAlign: 'center' }}>
              {hatAuffaellig
                ? 'Deine Antworten deuten auf Bereiche hin, bei denen eine professionelle Einschätzung sinnvoll wäre. In der App kannst du deinen Verlauf beobachten und wirst direkt mit passenden Ressourcen verbunden.'
                : 'Deine Werte liegen aktuell im unauffälligen Bereich. Gut, dass du geschaut hast. In der App kannst du regelmäßig einchecken und Veränderungen früh erkennen.'}
            </p>
            <button onClick={onInstall} style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              Ergebnisse in App speichern & behalten
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 20px' }}>
            Bei akuten Krisen: Telefonseelsorge 0800 111 0 111 (kostenlos, 24/7, anonym)
          </p>
          <button onClick={onClose} style={{
            display: 'block', width: '100%', padding: '12px',
            background: 'none', color: 'rgba(255,255,255,0.35)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            fontSize: 14, cursor: 'pointer',
          }}>
            Schließen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'linear-gradient(160deg, #1a0a30 0%, #2e1065 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: `${fortschritt * 100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{index + 1} / {gesamt}</span>
      </div>

      {/* Frage */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', textTransform: 'uppercase' }}>
            {frage.zeitrahmen}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.5, margin: '0 0 32px' }}>
            {frage.text}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {frage.antworten.map(ant => (
              <button
                key={ant.wert}
                onClick={() => handleAntwort(ant.wert)}
                style={{
                  padding: '16px 20px', textAlign: 'left',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14, color: '#fff', fontSize: 15,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                {ant.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false)
  const [anamnesePhase, setAnamnesePhase] = useState(null) // null | 'nudge' | 'flow'
  const [installPrompt, setInstallPrompt] = useState(null)
  const vw = useWindowWidth()
  const isMobile = vw < 680
  const platform = useMemo(() => detectPlatform(), [])

  const phoneW = isMobile ? `${Math.round(vw * 0.38)}px` : `${Math.round(Math.min(vw * 0.22, 240))}px`
  const phonWTherapie = isMobile ? `${Math.round(vw * 0.7)}px` : `${Math.round(Math.min(vw * 0.26, 280))}px`

  // Android: nativer Install-Dialog abfangen
  useEffect(() => {
    const handler = e => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
    } else {
      setShowModal(true)
    }
  }

  const handleAnamneseInstall = async () => {
    setAnamnesePhase(null)
    await new Promise(r => setTimeout(r, 100))
    handleInstallClick()
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden', color: '#fff' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(160deg, #3b0764 0%, #6d28d9 100%)', width: '100%', boxSizing: 'border-box', padding: isMobile ? '40px 20px 48px' : '60px 40px 72px' }}>

        {/* Logo + badge */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 44 }}>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, marginBottom: 14 }}>MeinPsyCheck</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', fontSize: isMobile ? 11 : 13, fontWeight: 700, letterSpacing: 1.5 }}>
            KOSTENLOS · ANONYM · WISSENSCHAFTLICH
          </div>
        </div>

        {isMobile ? (
          /* ── MOBILE: Headline → Phones → Steps ── */
          <>
            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, textAlign: 'center', margin: '0 0 16px' }}>
              Orientierung für deine psychische Gesundheit
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
              Wissenschaftlich validierte Fragebögen. Sofortige Einschätzung. Keine Registrierung.
            </p>

            {/* Two phones side by side */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 36, alignItems: 'flex-end' }}>
              <PhoneMockup src="/hauptseite.png" alt="Hauptseite" tilt={-5} width={phoneW} />
              <PhoneMockup src="/ergebnis.png" alt="Ergebnis" tilt={5} width={phoneW} />
            </div>

            {/* Steps below */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto' }}>
              {[
                { n: '1', title: '27 validierte Fragen', desc: 'PHQ-9, GAD-7, WHO-5, ASRS – klinisch geprüfte Instrumente' },
                { n: '2', title: 'Sofortige Einschätzung', desc: 'Drei Stufen – von unauffällig bis klinisch relevant' },
                { n: '3', title: 'Passende Ressourcen', desc: 'Konkrete nächste Schritte für deine Situation' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── DESKTOP: Phone | Steps | Phone ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
            <PhoneMockup src="/hauptseite.png" alt="Hauptseite" tilt={-6} width={phoneW} />
            <div style={{ flex: '1 1 200px', maxWidth: 380 }}>
              <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 20px', textAlign: 'center' }}>
                Orientierung für deine psychische Gesundheit
              </h1>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
                Wissenschaftlich validierte Fragebögen. Sofortige Einschätzung. Keine Registrierung.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { n: '1', title: '27 validierte Fragen', desc: 'PHQ-9, GAD-7, WHO-5, ASRS – klinisch geprüfte Instrumente aus der Psychiatrie' },
                  { n: '2', title: 'Sofortige Einschätzung', desc: 'Drei Stufen – von unauffällig bis klinisch relevant' },
                  { n: '3', title: 'Passende Ressourcen', desc: 'Schlaf, Antrieb, Stress – konkrete nächste Schritte' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PhoneMockup src="/ergebnis.png" alt="Ergebnis" tilt={6} width={phoneW} />
          </div>
        )}
      </div>

      {/* ── THERAPEUTEN ── */}
      <div style={{ background: 'linear-gradient(160deg, #5b21b6 0%, #7c3aed 100%)', width: '100%', boxSizing: 'border-box', padding: isMobile ? '48px 20px' : '64px 40px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 32 : 60, maxWidth: 1100, margin: '0 auto' }}>
          {!isMobile && <PhoneMockup src="/therapeuten.png" alt="Therapeuten" tilt={-3} width={phonWTherapie} />}
          <div style={{ flex: '1 1 260px', maxWidth: 460, textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>KOMMT IN VERSION 2</div>
            <h2 style={{ fontSize: isMobile ? 24 : 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px' }}>
              Therapeuten in deiner Nähe finden
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 'clamp(14px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0 }}>
              Nach dem Screening siehst du, welche Unterstützung zu dir passt – und findest direkt Therapeuten mit freien Terminen in deiner Stadt.
            </p>
          </div>
          {isMobile && <PhoneMockup src="/therapeuten.png" alt="Therapeuten" tilt={2} width={phonWTherapie} />}
        </div>
      </div>

      {/* ── ANAMNESE ── */}
      <div style={{ background: 'linear-gradient(160deg, #1e0a3c 0%, #3b0764 100%)', width: '100%', boxSizing: 'border-box', padding: isMobile ? '48px 20px' : '64px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.15)', borderRadius: 100, padding: '6px 18px', fontSize: isMobile ? 11 : 12, fontWeight: 700, letterSpacing: 1.5, color: '#c4b5fd', marginBottom: 20 }}>
            KOSTENLOS · ANONYM · 5–10 MINUTEN
          </div>
          <h2 style={{ fontSize: isMobile ? 24 : 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2 }}>
            Anamnese jetzt durchführen
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 32px' }}>
            27 wissenschaftlich validierte Fragen. Sofortige Einschätzung in drei Stufen – von unauffällig bis zur Empfehlung professioneller Abklärung.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setAnamnesePhase('nudge')} style={{
              background: '#fff', color: '#3b0764', border: 'none', borderRadius: 100,
              padding: isMobile ? '16px 36px' : '18px 56px',
              fontSize: isMobile ? 17 : 19, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
              width: isMobile ? '100%' : 'auto',
            }}>
              Anamnese starten →
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            PHQ-9 · GAD-7 · WHO-5 · ASRS v1.1 – klinisch validierte Instrumente
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: '#2e1065', width: '100%', boxSizing: 'border-box', padding: isMobile ? '48px 20px' : '72px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: isMobile ? 24 : 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, marginBottom: 14 }}>Jetzt kostenlos starten</h2>
        <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.6)', marginBottom: 36, lineHeight: 1.6 }}>
          Kein App Store. Kein Konto. Direkt auf deinen Homebildschirm.
        </p>
        <button onClick={handleInstallClick} style={{
          background: '#fff', color: '#3b0764', border: 'none', borderRadius: 100,
          padding: isMobile ? '18px 40px' : '20px 72px',
          fontSize: isMobile ? 18 : 22, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          width: isMobile ? '100%' : 'auto', maxWidth: 440,
        }}>
          App jetzt installieren
        </button>
        <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Orientierungsangebot – kein Medizinprodukt · © 2026 MeinPsyCheck
        </p>
      </div>

      {showModal && <InstallModal onClose={() => setShowModal(false)} defaultTab={platform} />}
      {anamnesePhase === 'nudge' && (
        <AnamneseNudgeModal
          onWeiter={() => setAnamnesePhase('flow')}
          onInstall={handleAnamneseInstall}
          onClose={() => setAnamnesePhase(null)}
        />
      )}
      {anamnesePhase === 'flow' && (
        <AnamneseWebFlow
          onInstall={handleAnamneseInstall}
          onClose={() => setAnamnesePhase(null)}
        />
      )}
    </div>
  )
}
