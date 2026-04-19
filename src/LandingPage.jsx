import { useState, useEffect, useRef } from 'react'

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
    { icon: '🧭', title: 'Safari öffnen', desc: 'Diese Seite in Safari aufrufen – nicht Chrome oder Firefox' },
    { icon: '⬆', title: 'Teilen antippen', desc: 'Das Teilen-Symbol unten in der Mitte antippen (Quadrat mit Pfeil nach oben)' },
    { icon: '📲', title: '"Zum Home-Bildschirm" wählen', desc: 'In der Liste runterscrollen und "Zum Home-Bildschirm" antippen' },
    { icon: '✅', title: '"Hinzufügen" tippen', desc: 'Oben rechts auf "Hinzufügen" tippen – fertig!' },
  ],
  android: [
    { icon: '🌐', title: 'Chrome öffnen', desc: 'Diese Seite in Chrome aufrufen' },
    { icon: '⋮', title: 'Menü öffnen', desc: 'Die drei Punkte oben rechts antippen' },
    { icon: '📲', title: '"Zum Startbildschirm hinzufügen"', desc: 'Diesen Eintrag in der Liste antippen' },
    { icon: '✅', title: '"Hinzufügen" tippen', desc: 'Im Dialog bestätigen – fertig!' },
  ],
}

function InstallModal({ onClose }) {
  const [tab, setTab] = useState('ios')
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
          {['ios', 'android'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'background 0.2s',
              background: tab === t ? '#6d28d9' : 'transparent', color: '#fff',
            }}>
              {t === 'ios' ? '🍎  iPhone' : '🤖  Android'}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '14px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: 16,
            }}>
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
          ))}
        </div>

        {/* Tip */}
        <div style={{
          marginTop: 18, padding: '12px 16px',
          background: 'rgba(109,40,217,0.3)', borderRadius: 14,
          border: '1px solid rgba(109,40,217,0.5)',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            {tab === 'ios'
              ? 'Nach der Installation startet die App direkt ohne Browser – kein App Store nötig.'
              : 'Kein Play Store nötig. Die App läuft direkt auf deinem Homebildschirm.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false)
  const vw = useWindowWidth()
  const isMobile = vw < 680

  const phoneW = isMobile ? `${Math.round(vw * 0.38)}px` : `${Math.round(Math.min(vw * 0.22, 240))}px`
  const phonWTherapie = isMobile ? `${Math.round(vw * 0.7)}px` : `${Math.round(Math.min(vw * 0.26, 280))}px`

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
        <button onClick={() => setShowModal(true)} style={{
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

      {showModal && <InstallModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
