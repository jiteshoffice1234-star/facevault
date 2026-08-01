import { useCallback, useEffect, useRef, useState } from 'react'
import type { FaceAnalysis } from '../lib/analysis'
import { requestAIAdvice } from '../lib/ai'
import type { AIAdviceResult } from '../lib/ai'
import { css, btn, Pill } from './ui'
import { SparkIcon, RefreshIcon, LockIcon, CheckIcon } from './icons'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface AiReportProps {
  result: FaceAnalysis
}

/**
 * "AI Coach" card: sends ONLY numeric metrics to the backend advisor and shows
 * the personalized AI advice. Includes a Compare toggle so users can judge the
 * rule-based "glow-up plan" against the AI version side by side.
 */
export default function AiReport({ result }: AiReportProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [data, setData] = useState<AIAdviceResult | null>(null)
  const [view, setView] = useState<'ai' | 'rule'>('ai')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Reset when a new analysis arrives.
    setStatus('idle')
    setData(null)
    setView('ai')
    abortRef.current?.abort()
  }, [result])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const generate = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    try {
      const res = await requestAIAdvice(result, controller.signal)
      setData(res)
      setStatus(res.available ? 'done' : 'error')
      setView('ai')
    } catch (e) {
      if (controller.signal.aborted) return
      setStatus('error')
      setData({
        available: false,
        reason: 'malformed',
        message: `Could not reach the AI advisor: ${e instanceof Error ? e.message : String(e)}`,
      })
    }
  }, [result])

  const seg = (label: string, id: 'ai' | 'rule') => (
    <button
      onClick={() => setView(id)}
      style={{
        flex: 1,
        padding: '7px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: 'inherit',
        color: view === id ? '#fff' : 'var(--text2)',
        background: view === id ? 'var(--primary)' : 'transparent',
        transition: 'background .18s ease, color .18s ease',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ ...css.glass, padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h4 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--primary)' }}>
            <SparkIcon size={17} />
          </span>
          AI Coach
        </h4>
        {data?.available && data.provider && <Pill tone="primary">{data.provider}</Pill>}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 'var(--space-md)' }}>
        <LockIcon size={13} style={{ verticalAlign: -2, marginRight: 4, color: 'var(--success)' }} />
        Only your numeric measurements leave the device — never your photo. A language model turns them into
        personalized guidance.
      </p>

      {status === 'idle' && (
        <button style={{ ...btn('primary', 'md'), width: '100%' }} onClick={() => void generate()}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SparkIcon size={16} /> Generate AI advice
          </span>
        </button>
      )}

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
          <div
            style={{
              width: 18,
              height: 18,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: 13.5, color: 'var(--text2)' }}>AI is personalizing your advice…</span>
        </div>
      )}

      {status === 'error' && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--surface2) 60%, transparent)' }}>
            {data.message}
          </p>
          {data.reason === 'not-configured' && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              The rule-based glow-up plan below still uses your real measurements. To enable AI, the backend needs{' '}
              <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 4px', borderRadius: 4 }}>AI_API_KEY</code> and{' '}
              <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 4px', borderRadius: 4 }}>AI_BASE_URL</code>.
            </p>
          )}
          {data.reason !== 'not-configured' && (
            <button style={{ ...btn('outline', 'sm'), alignSelf: 'flex-start' }} onClick={() => void generate()}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RefreshIcon size={14} /> Try again
              </span>
            </button>
          )}
        </div>
      )}

      {status === 'done' && data && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 3,
              borderRadius: 10,
              background: 'color-mix(in srgb, var(--surface2) 70%, transparent)',
            }}
          >
            {seg('AI advice', 'ai')}
            {seg('Glow-up plan', 'rule')}
          </div>

          {view === 'ai' ? (
            <>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text)' }}>{data.summary}</p>

              {data.priorities && data.priorities.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.priorities.map((p, i) => (
                    <div
                      key={`${p.area}-${i}`}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'color-mix(in srgb, var(--surface2) 55%, transparent)',
                        borderLeft: '3px solid var(--primary)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{p.area}</span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: p.score >= 55 ? 'var(--danger)' : p.score >= 40 ? 'var(--warning)' : 'var(--success)',
                            background: 'color-mix(in srgb, var(--surface2) 80%, transparent)',
                            padding: '2px 7px',
                            borderRadius: 99,
                          }}
                        >
                          opp. {p.score}/100
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>{p.why}</p>
                      <p style={{ fontSize: 12.5, color: 'var(--text)', marginTop: 4, lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>→ </span>
                        {p.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {data.quickWins && data.quickWins.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Quick wins
                  </span>
                  {data.quickWins.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }}>
                        <CheckIcon size={14} />
                      </span>
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <RuleAdvice result={result} />
          )}
        </div>
      )}
    </div>
  )
}

/** Re-renders the existing rule-based glow-up plan inside the Compare toggle. */
function RuleAdvice({ result }: { result: FaceAnalysis }) {
  if (result.advice.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6 }}>
        No rule-based tips — all your metrics are above threshold. Try the AI advice for a deeper read.
      </p>
    )
  }
  return (
    <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
      {result.advice.map((a) => (
        <li
          key={a.metricId}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--surface2) 55%, transparent)',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: '#fff',
              background: a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
            }}
          >
            {a.severity === 'high' ? '!' : a.severity === 'medium' ? 'i' : '✓'}
          </span>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text2)' }}>{a.message}</div>
        </li>
      ))}
    </ol>
  )
}
