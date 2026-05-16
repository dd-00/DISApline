'use client'

export type MoodKey = 'calm' | 'confident' | 'focused' | 'neutral' | 'anxious' | 'frustrated' | 'tired' | 'energized'

interface MoodFaceProps {
  mood: MoodKey
  size?: number
  color?: string
}

const MOOD_LABELS: Record<MoodKey, string> = {
  calm: 'Calm',
  confident: 'Confident',
  focused: 'Focused',
  neutral: 'Neutral',
  anxious: 'Anxious',
  frustrated: 'Frustrated',
  tired: 'Tired',
  energized: 'Energized',
}

const MOOD_COLOR: Record<MoodKey, string> = {
  calm: '#7EB8E8',
  confident: '#5DB87A',
  focused: '#C9A227',
  neutral: '#9898A6',
  anxious: '#E0A85C',
  frustrated: '#E05C5C',
  tired: '#7A7A8A',
  energized: '#C9A227',
}

function Face({ mood, size = 32 }: { mood: MoodKey; size: number }) {
  const c = MOOD_COLOR[mood]
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r = s * 0.44

  const faces: Record<MoodKey, React.ReactNode> = {
    calm: (
      <>
        {/* Brows - relaxed flat */}
        <path d={`M${cx-8} ${cy-6} L${cx-3} ${cy-6}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+3} ${cy-6} L${cx+8} ${cy-6}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Eyes - half closed arcs */}
        <path d={`M${cx-8} ${cy-1} Q${cx-5} ${cy-4} ${cx-2} ${cy-1}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-1} Q${cx+5} ${cy-4} ${cx+8} ${cy-1}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Mouth - gentle smile */}
        <path d={`M${cx-5} ${cy+5} Q${cx} ${cy+9} ${cx+5} ${cy+5}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),
    confident: (
      <>
        {/* Brows - raised cheerful */}
        <path d={`M${cx-8} ${cy-7} Q${cx-5} ${cy-9} ${cx-2} ${cy-7}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-7} Q${cx+5} ${cy-9} ${cx+8} ${cy-7}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Eyes - bright circles */}
        <circle cx={cx-5} cy={cy-2} r="2.5" fill={c}/>
        <circle cx={cx+5} cy={cy-2} r="2.5" fill={c}/>
        <circle cx={cx-4} cy={cy-3} r="0.9" fill="rgba(255,255,255,0.8)"/>
        <circle cx={cx+6} cy={cy-3} r="0.9" fill="rgba(255,255,255,0.8)"/>
        {/* Mouth - big smile */}
        <path d={`M${cx-7} ${cy+4} Q${cx} ${cy+11} ${cx+7} ${cy+4}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),
    focused: (
      <>
        {/* Brows - furrowed, angled */}
        <path d={`M${cx-9} ${cy-6} L${cx-2} ${cy-8}`} stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-8} L${cx+9} ${cy-6}`} stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Eyes - squinted */}
        <path d={`M${cx-8} ${cy-1} Q${cx-5} ${cy-3.5} ${cx-2} ${cy-1}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-1} Q${cx+5} ${cy-3.5} ${cx+8} ${cy-1}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Mouth - determined, slight upward */}
        <path d={`M${cx-4} ${cy+6} Q${cx} ${cy+7} ${cx+4} ${cy+6}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),
    neutral: (
      <>
        {/* Brows - flat */}
        <path d={`M${cx-8} ${cy-6} L${cx-3} ${cy-6}`} stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+3} ${cy-6} L${cx+8} ${cy-6}`} stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Eyes - simple dots */}
        <circle cx={cx-5} cy={cy-2} r="2" fill={c}/>
        <circle cx={cx+5} cy={cy-2} r="2" fill={c}/>
        {/* Mouth - flat line */}
        <path d={`M${cx-5} ${cy+5} L${cx+5} ${cy+5}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),
    anxious: (
      <>
        {/* Brows - one raised, worried */}
        <path d={`M${cx-9} ${cy-6} Q${cx-5} ${cy-9} ${cx-2} ${cy-7}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-7} Q${cx+5} ${cy-9} ${cx+9} ${cy-6}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Eyes - wide open */}
        <circle cx={cx-5} cy={cy-1.5} r="2.8" fill="none" stroke={c} strokeWidth="1.5"/>
        <circle cx={cx+5} cy={cy-1.5} r="2.8" fill="none" stroke={c} strokeWidth="1.5"/>
        <circle cx={cx-5} cy={cy-1.5} r="1.2" fill={c}/>
        <circle cx={cx+5} cy={cy-1.5} r="1.2" fill={c}/>
        {/* Mouth - wavy frown */}
        <path d={`M${cx-5} ${cy+7} Q${cx-2} ${cy+5} ${cx} ${cy+7} Q${cx+2} ${cy+9} ${cx+5} ${cy+7}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </>
    ),
    frustrated: (
      <>
        {/* Brows - angry, downward outer */}
        <path d={`M${cx-9} ${cy-5} L${cx-2} ${cy-8}`} stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-8} L${cx+9} ${cy-5}`} stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Eyes - squinted angry */}
        <path d={`M${cx-8} ${cy-1} Q${cx-5} ${cy-3} ${cx-2} ${cy-1}`} stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-1} Q${cx+5} ${cy-3} ${cx+8} ${cy-1}`} stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* Mouth - frown */}
        <path d={`M${cx-6} ${cy+8} Q${cx} ${cy+4} ${cx+6} ${cy+8}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),
    tired: (
      <>
        {/* Brows - droopy */}
        <path d={`M${cx-8} ${cy-6} L${cx-3} ${cy-5}`} stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+3} ${cy-5} L${cx+8} ${cy-6}`} stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Eyes - heavy/droopy lids */}
        <path d={`M${cx-8} ${cy} Q${cx-5} ${cy-2} ${cx-2} ${cy}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy} Q${cx+5} ${cy-2} ${cx+8} ${cy}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Bottom eyelid drooping */}
        <path d={`M${cx-7} ${cy} Q${cx-5} ${cy+1.5} ${cx-3} ${cy}`} stroke={c} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d={`M${cx+3} ${cy} Q${cx+5} ${cy+1.5} ${cx+7} ${cy}`} stroke={c} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
        {/* Mouth - slight frown */}
        <path d={`M${cx-4} ${cy+7} Q${cx} ${cy+6} ${cx+4} ${cy+7}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      </>
    ),
    energized: (
      <>
        {/* Brows - raised high */}
        <path d={`M${cx-8} ${cy-8} Q${cx-5} ${cy-10} ${cx-2} ${cy-8}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d={`M${cx+2} ${cy-8} Q${cx+5} ${cy-10} ${cx+8} ${cy-8}`} stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Eyes - wide bright */}
        <circle cx={cx-5} cy={cy-2} r="3" fill={c}/>
        <circle cx={cx+5} cy={cy-2} r="3" fill={c}/>
        <circle cx={cx-3.5} cy={cy-3.5} r="1" fill="rgba(255,255,255,0.9)"/>
        <circle cx={cx+6.5} cy={cy-3.5} r="1" fill="rgba(255,255,255,0.9)"/>
        {/* Mouth - huge open smile */}
        <path d={`M${cx-8} ${cy+4} Q${cx} ${cy+12} ${cx+8} ${cy+4}`} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Cheek blush dots */}
        <circle cx={cx-9} cy={cy+3} r="2.5" fill={c} opacity="0.2"/>
        <circle cx={cx+9} cy={cy+3} r="2.5" fill={c} opacity="0.2"/>
      </>
    ),
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)" stroke={c} strokeWidth="1.2" opacity="0.5"/>
      {faces[mood]}
    </svg>
  )
}

export const ALL_MOODS: MoodKey[] = ['calm', 'confident', 'focused', 'neutral', 'anxious', 'frustrated', 'tired', 'energized']

export function MoodPicker({ value, onChange }: { value: MoodKey | null; onChange: (m: MoodKey) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {ALL_MOODS.map(mood => (
        <button
          key={mood}
          onClick={() => onChange(mood)}
          title={MOOD_LABELS[mood]}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            background: value === mood ? `${MOOD_COLOR[mood]}15` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${value === mood ? MOOD_COLOR[mood] : 'var(--bdr)'}`,
            borderRadius: '10px', padding: '10px 8px', cursor: 'pointer',
            transition: 'all 0.15s', minWidth: '56px',
          }}
        >
          <Face mood={mood} size={32} />
          <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '8px', fontWeight: 300, color: value === mood ? MOOD_COLOR[mood] : 'var(--smoke)', letterSpacing: '0.06em' }}>
            {MOOD_LABELS[mood]}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function MoodFace({ mood, size = 32 }: MoodFaceProps) {
  return <Face mood={mood as MoodKey} size={size} />
}

export { MOOD_LABELS, MOOD_COLOR }
