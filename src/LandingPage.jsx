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
      img: '/install_ios_share.png',
    },
    {
      title: '"Zum Home-Bildschirm" wählen',
      desc: 'In der Liste runterscrollen und "Zum Home-Bildschirm" antippen',
      img: '/install_ios_homescreen.png',
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
    },
    {
      title: '"Zum Startbildschirm hinzufügen" wählen',
      desc: 'Diesen Eintrag in der Liste antippen',
      img: '/install_android_menu.jpg',
    },
    {
      title: '"Hinzufügen" tippen – fertig!',
      desc: 'Im Dialog bestätigen',
    },
  ],
}

function InstallModal({ onClose, defaultTab }) {
  const [tab, setTab] = useState(defaultTab || 'ios')
  const startY = useRef(0)
  const steps = INSTALL_STEPS[tab]

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
          <button onClick={() => setTab('ios')} style={{
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
          <button onClick={() => setTab('android')} style={{
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
              {/* Screenshot falls vorhanden */}
              {s.img && (
                <img
                  src={s.img}
                  alt={s.title}
                  style={{
                    marginTop: 10, width: '100%', borderRadius: 10,
                    objectFit: 'cover', maxHeight: 180,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                />
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

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false)
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
      // Android: nativer Dialog direkt auslösen
      installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
    } else {
      // iOS: manuelle Anleitung zeigen
      setShowModal(true)
    }
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
                { n: '1', title: '26 validierte Fragen', desc: 'PHQ-9, GAD-7, ASRS – klinisch geprüfte Instrumente' },
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
                  { n: '1', title: '26 validierte Fragen', desc: 'PHQ-9, GAD-7, ASRS – klinisch geprüfte Instrumente aus der Psychiatrie' },
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
    </div>
  )
}
