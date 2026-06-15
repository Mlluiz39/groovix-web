import { useEffect, useMemo, useRef, useState } from 'react'

const API = import.meta.env.VITE_API_URL
const PROFILE_KEY = 'Groovix-Web'
const RECENT_SEARCHES_KEY = 'Groovix-Recent-Searches'

const genres = [
  ['hip hop', 'Hip Hop', 'from-purple-950/80 to-cyan/50'],
  ['samba e pagode', 'Samba e Pagode', 'from-amber-950/80 to-yellow-300/60'],
  ['funk brasileiro', 'Funk', 'from-rose-950/80 to-pink-400/70'],
  ['sertanejo', 'Sertanejo', 'from-emerald-950/80 to-lime-300/60'],
  ['melhores de 2026', 'Melhores de 2026', 'from-cyan/30 to-purple/70'],
]

const brazilianMusicSearches = [
  'músicas brasileiras 2026',
  'funk brasileiro 2026',
  'sertanejo brasileiro 2026',
  'pagode brasileiro 2026',
  'samba brasileiro 2026',
  'piseiro brasileiro 2026',
]

function Icon({ children, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{children}</span>
  )
}

function fmtTime(s) {
  if (!Number.isFinite(s) || Number.isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

function loadRecentSearches() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveRecentSearches(searches) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function genDefaultAvatar(name) {
  const initials =
    name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  const hue = ((name.charCodeAt(0) || 80) * 7) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="hsl(${hue},60%,35%)" width="80" height="80"/><text x="40" y="52" text-anchor="middle" fill="white" font-family="sans-serif" font-size="28" font-weight="bold">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

async function apiSearch(q) {
  const r = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`)
  if (!r.ok) throw new Error(await r.text())
  const d = await r.json()
  return d.results || []
}

async function apiAudio(url) {
  const r = await fetch(`${API}/api/audio?url=${encodeURIComponent(url)}`)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function apiBrazilianMusic() {
  const batches = await Promise.all(
    brazilianMusicSearches.map(term => apiSearch(term).catch(() => [])),
  )
  const seen = new Set()
  return batches.flat().filter(track => {
    const key = track.id || track.url || track.title
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function Header({ onBack, profile, onProfile, right }) {
  const avatar = profile.avatar || genDefaultAvatar(profile.name)
  return (
    <header className="app-header">
      <button
        className="header-btn"
        onClick={onBack || undefined}
        aria-label={onBack ? 'Voltar' : 'Menu'}
      >
        <Icon>{onBack ? 'arrow_back' : 'menu'}</Icon>
      </button>
      <span className="header-logo">Groovix</span>
      {right || (
        <button
          className="header-avatar"
          onClick={onProfile}
          aria-label="Perfil"
        >
          <img src={avatar} alt="Avatar" />
        </button>
      )}
    </header>
  )
}

function TrackItem({
  track,
  active,
  liked,
  onPlay,
  onAction,
  actionIcon = 'add',
}) {
  return (
    <div
      className={`track-item ${active ? 'playlist-track playing' : ''}`}
      onClick={onPlay}
    >
      <div className="track-item-album">
        <img src={track.thumbnail || ''} alt="" />
        {active ? (
          <div className="viz">
            <div className="v" />
            <div className="v" />
            <div className="v" />
          </div>
        ) : (
          <div className="play-overlay">
            <Icon>play_arrow</Icon>
          </div>
        )}
      </div>
      <div className="track-item-info">
        <div className="track-item-title">{track.title || 'Desconhecida'}</div>
        <div className="track-item-meta">
          {track.channel || 'Desconhecido'} · {fmtTime(track.duration || 0)}
        </div>
      </div>
      {onAction && (
        <button
          className="track-item-more"
          onClick={e => {
            e.stopPropagation()
            onAction()
          }}
          aria-label="Ação da faixa"
        >
          <Icon className={liked ? 'filled text-[var(--tertiary-ct)]' : ''}>
            {liked ? 'favorite' : actionIcon}
          </Icon>
        </button>
      )}
    </div>
  )
}

function HomeScreen({
  profile,
  onProfile,
  onScreen,
  tracks,
  loading,
  featured,
  onPlayTrack,
  onAdd,
  onGenre,
}) {
  return (
    <section className="screen active">
      <Header profile={profile} onProfile={onProfile} />
      <div className="greeting">
        <h2>
          {getGreeting()}, <span className="name">{profile.name}</span>
        </h2>
        <p>Seu universo sonoro te espera.</p>
      </div>
      <button
        className="featured-banner text-left"
        onClick={() => featured && onPlayTrack(featured)}
      >
        {featured?.thumbnail && <img src={featured.thumbnail} alt="" />}
        <div className="overlay" />
        <div className="content">
          <div>
            <span className="featured-badge">EM DESTAQUE</span>
            <h3 className="featured-title">{featured?.title || '—'}</h3>
            <p className="featured-subtitle">
              {featured
                ? `${featured.channel || ''} · ${fmtTime(featured.duration || 0)}`
                : '—'}
            </p>
          </div>
          <span className="featured-play">
            <Icon className="filled">play_arrow</Icon>
          </span>
        </div>
      </button>
      <SectionHeader title="Frequências" />
      <div className="categories-grid">
        {genres.map(([key, label]) => (
          <button
            key={key}
            className="category-card"
            onClick={() => onGenre(key)}
          >
            <span className="category-label">{label}</span>
          </button>
        ))}
      </div>
      <SectionHeader
        title="Em Alta no Brasil 2026"
        subtitle="Músicas do Brasil"
        action="Ver Tudo"
        onAction={() => onScreen('playlist')}
      />
      <div className="track-list">
        {tracks.map(t => (
          <TrackItem
            key={t.id || t.url || t.title}
            track={t}
            onPlay={() => onPlayTrack(t)}
            onAction={() => onAdd(t)}
          />
        ))}
      </div>
      {loading && <Loading text="Carregando faixas..." />}
    </section>
  )
}

function SearchScreen({
  profile,
  onBack,
  onProfile,
  query,
  setQuery,
  results,
  searching,
  searchError,
  recent,
  onClearRecent,
  onGenre,
  onPlayTrack,
  onAdd,
}) {
  const showResults = query.trim().length > 0
  return (
    <section className="screen active">
      <Header profile={profile} onBack={onBack} onProfile={onProfile} />
      <div className="search-wrap">
        <Icon className="search-icon">search</Icon>
        <input
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou gêneros..."
          autoComplete="off"
        />
        <button className="search-mic">
          <Icon>mic</Icon>
        </button>
      </div>
      {!showResults ? (
        <>
          <SectionHeader
            title="Últimas Buscas"
            action="Limpar"
            onAction={onClearRecent}
          />
          {recent.length > 0 ? (
            <div className="chips-row">
              {recent.map(s => (
                <button key={s} className="chip" onClick={() => setQuery(s)}>
                  <Icon className="chip-icon">history</Icon>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <Empty icon="history" text="Suas últimas buscas aparecerão aqui." />
          )}
        </>
      ) : (
        <div className="search-results active">
          <SectionHeader title="Resultados" />
          {searching && <Loading text="Buscando..." />}
          {!searching &&
            results.map(t => (
              <TrackItem
                key={t.id || t.url || t.title}
                track={t}
                onPlay={() => onPlayTrack(t)}
                onAction={() => onAdd(t)}
              />
            ))}
          {!searching && (searchError || results.length === 0) && (
            <Empty
              icon="search_off"
              text={searchError || 'Nada encontrado nas frequências.'}
            />
          )}
        </div>
      )}
    </section>
  )
}

function PlaylistScreen({
  profile,
  onBack,
  library,
  currentIdx,
  liked,
  onPlay,
  onToggleLike,
  onPlayAll,
  onLikeAll,
}) {
  const totalDur = library.reduce((s, t) => s + (t.duration || 0), 0)
  return (
    <section className="screen active">
      <Header
        profile={profile}
        onBack={onBack}
        right={
          <button className="header-btn">
            <Icon>more_vert</Icon>
          </button>
        }
      />
      <div className="playlist-header">
        <div className="playlist-art-wrap neon-border">
          <div className="playlist-art-fallback" />
          <div className="playlist-art-overlay" />
        </div>
        <div className="playlist-info">
          <h2>Minha Biblioteca</h2>
          <p>Busque e adicione faixas para montar sua coleção.</p>
          <div className="playlist-meta">
            <Icon className="text-base">library_music</Icon>
            <span>{library.length} músicas</span>
            <span className="dot" />
            <Icon className="text-base">schedule</Icon>
            <span>{Math.floor(totalDur / 60)}m</span>
          </div>
        </div>
        <div className="playlist-actions">
          <button className="playlist-action-btn">
            <Icon>download</Icon>
          </button>
          <button className="playlist-play-btn" onClick={onPlayAll}>
            <Icon className="filled text-4xl">play_arrow</Icon>
          </button>
          <button className="playlist-action-btn" onClick={onLikeAll}>
            <Icon>favorite</Icon>
          </button>
        </div>
      </div>
      <SectionHeader title="Lista de Faixas" />
      <div className="track-list">
        {library.map((t, i) => (
          <TrackItem
            key={t.id || t.url || i}
            track={t}
            active={i === currentIdx}
            liked={t.id && liked.has(t.id)}
            onPlay={() => onPlay(i)}
            onAction={() => onToggleLike(t)}
            actionIcon="more_vert"
          />
        ))}
      </div>
      {library.length === 0 && (
        <Empty
          icon="library_music"
          text="Sua biblioteca está vazia. Busque e adicione músicas!"
        />
      )}
    </section>
  )
}

function ProfileScreen({ profile, setProfile, onBack, library, liked, toast }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar)
  const totalSec = library.reduce((s, t) => s + (t.duration || 0), 0)
  const likedCount = [...liked].filter(id =>
    library.some(t => t.id === id),
  ).length
  const avatarSrc = profile.avatar || genDefaultAvatar(profile.name)

  function handleSave() {
    if (!name.trim()) return toast('Digite um nome.')
    const next = { name: name.trim(), avatar: avatar.trim() }
    saveProfile(next)
    setProfile(next)
    setEditing(false)
    toast('Perfil salvo!')
  }

  function logout() {
    const next = { name: 'Explorador', avatar: '' }
    saveProfile(next)
    setProfile(next)
    setName(next.name)
    setAvatar('')
    toast('Perfil removido.')
  }

  return (
    <section className="screen active">
      <Header
        profile={profile}
        onBack={onBack}
        right={
          <button className="header-btn" onClick={logout}>
            <Icon>logout</Icon>
          </button>
        }
      />
      <div className="profile-section">
        {!editing ? (
          <div className="profile-card">
            <div className="profile-avatar">
              <img src={avatarSrc} alt="Avatar" />
            </div>
            <div className="profile-name">{profile.name}</div>
            <button
              className="profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <div className="profile-form active">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              maxLength={30}
            />
            <input
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="URL do avatar (opcional)"
            />
            <button className="save-btn" onClick={handleSave}>
              SALVAR
            </button>
          </div>
        )}
        <div className="profile-stats">
          <Stat num={library.length} label="Na Biblioteca" />
          <Stat num={likedCount} label="Favoritas" />
          <Stat
            num={
              totalSec >= 3600
                ? `${Math.floor(totalSec / 3600)}h`
                : `${Math.floor(totalSec / 60)}m`
            }
            label="Tempo Total"
          />
        </div>
      </div>
    </section>
  )
}

function NowPlaying({
  profile,
  track,
  playing,
  liked,
  currentTime,
  duration,
  shuffle,
  repeat,
  onClose,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleLike,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
}) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let raf
    const dpr = window.devicePixelRatio || 1
    const draw = () => {
      const r = canvas.parentElement.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = r.width,
        h = r.height,
        bars = 64,
        t = Date.now() / 1000
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < bars; i++) {
        const amp = playing
          ? Math.abs(
              Math.sin(t * 2.5 + i * 0.17) * 0.6 +
                Math.sin(t * 4 + i * 0.31) * 0.3,
            )
          : Math.abs(Math.sin(t + i)) * 0.25
        const bw = (w / bars) * 0.7
        const bh = Math.max(3, amp * h)
        ctx.fillStyle = `hsla(${190 + (i / bars) * 80},85%,55%,${0.45 + amp * 0.5})`
        ctx.fillRect(i * (w / bars), h - bh, bw, bh)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [playing])

  if (!track) return null
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  return (
    <section className="screen-now-playing active">
      <div className="np-bg" />
      <header className="np-header">
        <button className="header-btn" onClick={onClose}>
          <Icon>keyboard_arrow_down</Icon>
        </button>
        <div className="np-hcenter">
          <p className="np-hlabel">Tocando Agora</p>
          <p className="np-hsub">{profile.name} · Cyber City Radio</p>
        </div>
        <button className="header-btn">
          <Icon>more_vert</Icon>
        </button>
      </header>
      <div className="np-artwork">
        <div className="pulse-halo" />
        <div className="np-art">
          <img src={track.thumbnail || ''} alt="" />
          <div className="np-art-vignette" />
        </div>
      </div>
      <div className="viz-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div className="np-track-info">
        <div className="np-track-left">
          <h1 className="np-title">{track.title || 'Desconhecida'}</h1>
          <p className="np-artist">
            {track.channel || 'Desconhecido'} · {fmtTime(track.duration || 0)}
          </p>
        </div>
        <button
          className={`np-like ${liked ? 'liked' : ''}`}
          onClick={onToggleLike}
        >
          <Icon className={liked ? 'filled' : ''}>favorite</Icon>
        </button>
      </div>
      <Progress
        pct={pct}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
      <div className="controls-row">
        <button
          className={`ctrl-btn ${shuffle ? 'active' : ''}`}
          onClick={onToggleShuffle}
        >
          <Icon>shuffle</Icon>
        </button>
        <div className="flex items-center gap-4">
          <button className="ctrl-btn" onClick={onPrev}>
            <Icon className="filled text-4xl">skip_previous</Icon>
          </button>
          <button className="ctrl-play" onClick={onTogglePlay}>
            <Icon className="filled text-5xl">
              {playing ? 'pause' : 'play_arrow'}
            </Icon>
          </button>
          <button className="ctrl-btn" onClick={onNext}>
            <Icon className="filled text-4xl">skip_next</Icon>
          </button>
        </div>
        <button
          className={`ctrl-btn ${repeat ? 'active' : ''}`}
          onClick={onToggleRepeat}
        >
          <Icon>repeat</Icon>
        </button>
      </div>
      <div className="lyrics-teaser">
        <div className="lyrics-drag" />
        <p className="lyrics-line">
          "Perdido no brilho das telas estáticas, perseguindo fantasmas nas
          correntes digitais..."
        </p>
        <p className="lyrics-hint">Deslize para a Letra</p>
      </div>
    </section>
  )
}

function MiniPlayer({
  track,
  playing,
  liked,
  progress,
  onOpen,
  onTogglePlay,
  onToggleLike,
}) {
  if (!track) return null
  return (
    <div className="mini-player" onClick={onOpen}>
      <div className="mini-player-progress" style={{ width: `${progress}%` }} />
      <div className={`mini-album ${playing ? 'playing' : ''}`}>
        <img src={track.thumbnail || ''} alt="" />
        <div className="mini-album-hole" />
      </div>
      <div className="mini-info">
        <div className="mini-title">{track.title || 'Desconhecida'}</div>
        <div className="mini-artist">{track.channel || 'Desconhecido'}</div>
      </div>
      <div className="mini-actions">
        <button
          className={`mini-btn ${liked ? 'liked' : ''}`}
          onClick={e => {
            e.stopPropagation()
            onToggleLike()
          }}
        >
          <Icon className={liked ? 'filled' : ''}>favorite</Icon>
        </button>
        <button
          className="mini-btn play-btn"
          onClick={e => {
            e.stopPropagation()
            onTogglePlay()
          }}
        >
          <Icon className="filled">{playing ? 'pause' : 'play_arrow'}</Icon>
        </button>
      </div>
    </div>
  )
}

function BottomNav({ screen, setScreen, hidden }) {
  if (hidden) return null
  const items = [
    ['home', 'home', 'Início'],
    ['search', 'search', 'Buscar'],
    ['playlist', 'library_music', 'Biblioteca'],
    ['profile', 'person', 'Perfil'],
  ]
  return (
    <nav className="bottom-nav">
      {items.map(([key, icon, label]) => (
        <button
          key={key}
          className={`nav-item ${screen === key ? 'active' : ''}`}
          onClick={() => setScreen(key)}
        >
          <Icon className="nav-icon">{icon}</Icon>
          {label}
        </button>
      ))}
    </nav>
  )
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  )
}
function Loading({ text }) {
  return (
    <div className="loading">
      <Icon>sync</Icon>
      <p>{text}</p>
    </div>
  )
}
function Empty({ icon, text }) {
  return (
    <div className="empty-state">
      <Icon>{icon}</Icon>
      <p>{text}</p>
    </div>
  )
}
function Stat({ num, label }) {
  return (
    <div className="stat-card">
      <span className="stat-num">{num}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
function Progress({ pct, currentTime, duration, onSeek }) {
  return (
    <div className="progress-section">
      <div
        className="progress-bar-wrap"
        onClick={e => {
          const r = e.currentTarget.getBoundingClientRect()
          onSeek(((e.clientX - r.left) / r.width) * duration)
        }}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        <div className="progress-thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="progress-times">
        <span>{fmtTime(currentTime)}</span>
        <span>{fmtTime(duration)}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [profile, setProfile] = useState(() => ({
    name: 'Explorador',
    avatar: '',
    ...loadProfile(),
  }))
  const [library, setLibrary] = useState([])
  const [liked, setLiked] = useState(() => new Set())
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [homeTracks, setHomeTracks] = useState([])
  const [homeLoading, setHomeLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [recent, setRecent] = useState(loadRecentSearches)
  const [toastMsg, setToastMsg] = useState('')
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const currentTrack = library[currentIdx] || null
  const featured = homeTracks[0]

  const toast = msg => {
    setToastMsg(msg)
    window.clearTimeout(toast.timer)
    toast.timer = window.setTimeout(() => setToastMsg(''), 2000)
  }

  useEffect(() => {
    apiBrazilianMusic()
      .then(setHomeTracks)
      .catch(() => toast('Falha ao carregar. A API está rodando?'))
      .finally(() => setHomeLoading(false))
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setSearchError('')
      return undefined
    }
    setSearching(true)
    setSearchError('')
    const id = window.setTimeout(() => {
      apiSearch(q)
        .then(r => {
          setResults(r)
          setRecent(old => {
            const next = [q, ...old.filter(item => item !== q)].slice(0, 8)
            saveRecentSearches(next)
            return next
          })
        })
        .catch(() => setSearchError('Erro na busca. A API está rodando?'))
        .finally(() => setSearching(false))
    }, 400)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        playNext()
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        playPrev()
      }
      if (e.code === 'Escape' && screen === 'now-playing') setScreen('home')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  useEffect(() => () => stopAudio(), [])

  const progress = useMemo(
    () => (duration > 0 ? (currentTime / duration) * 100 : 0),
    [currentTime, duration],
  )

  function stopFallbackTimer() {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }
  function startFallbackTimer() {
    stopFallbackTimer()
    timerRef.current = window.setInterval(
      () =>
        setCurrentTime(t => {
          if (t + 0.25 >= duration) {
            handleTrackEnd()
            return duration
          }
          return t + 0.25
        }),
      250,
    )
  }
  function stopAudio() {
    stopFallbackTimer()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }
  function ensureInLibrary(track) {
    const ix = library.findIndex(t => t.id === track.id)
    if (ix >= 0) return ix
    setLibrary(old => [...old, track])
    return library.length
  }
  function addToLibrary(track) {
    if (library.some(t => t.id === track.id))
      return toast('Já está na biblioteca')
    setLibrary(old => [...old, track])
    toast('Adicionada à biblioteca')
  }
  function playTrackByObject(track) {
    playTrack(ensureInLibrary(track), track)
  }
  function playTrack(idx, immediateTrack) {
    const track = immediateTrack || library[idx]
    if (!track) return
    stopAudio()
    setCurrentIdx(idx)
    setCurrentTime(0)
    setDuration(track.duration || 180)
    setPlaying(true)
    apiAudio(track.url)
      .then(info => {
        if (!info?.streamUrl) {
          startFallbackTimer()
          return
        }
        const audio = new Audio(info.streamUrl)
        audioRef.current = audio
        audio.addEventListener('timeupdate', () =>
          setCurrentTime(audio.currentTime),
        )
        audio.addEventListener('ended', handleTrackEnd)
        audio.addEventListener(
          'loadedmetadata',
          () => audio.duration && setDuration(audio.duration),
        )
        audio.play().catch(() => startFallbackTimer())
      })
      .catch(() => startFallbackTimer())
  }
  function togglePlay() {
    if (!currentTrack) return
    setPlaying(p => {
      const next = !p
      if (next) {
        audioRef.current
          ? audioRef.current.play().catch(() => startFallbackTimer())
          : startFallbackTimer()
      } else {
        audioRef.current?.pause()
        stopFallbackTimer()
      }
      return next
    })
  }
  function handleTrackEnd() {
    if (repeat) {
      setCurrentTime(0)
      if (audioRef.current) audioRef.current.currentTime = 0
      else startFallbackTimer()
      return
    }
    playNext()
  }
  function playNext() {
    if (!library.length) return
    playTrack(
      shuffle
        ? Math.floor(Math.random() * library.length)
        : (currentIdx + 1) % library.length,
    )
  }
  function playPrev() {
    if (!library.length) return
    if (currentTime > 3) {
      seek(0)
      return
    }
    playTrack(
      shuffle
        ? Math.floor(Math.random() * library.length)
        : (currentIdx - 1 + library.length) % library.length,
    )
  }
  function toggleLike(track = currentTrack) {
    if (!track?.id) return
    setLiked(old => {
      const next = new Set(old)
      next.has(track.id) ? next.delete(track.id) : next.add(track.id)
      return next
    })
    toast(
      liked.has(track.id)
        ? 'Removida dos favoritos'
        : 'Adicionada aos favoritos',
    )
  }
  function seek(value) {
    const next = Math.max(0, Math.min(duration, value || 0))
    setCurrentTime(next)
    if (audioRef.current) audioRef.current.currentTime = next
  }
  function selectGenre(g) {
    setQuery(g)
    setScreen('search')
  }
  function likeAll() {
    if (!library.length) return
    const allLiked = library.every(t => t.id && liked.has(t.id))
    setLiked(
      allLiked ? new Set() : new Set(library.map(t => t.id).filter(Boolean)),
    )
    toast(allLiked ? 'Todas desmarcadas' : 'Todas favoritadas')
  }

  return (
    <div id="app">
      {screen === 'home' && (
        <HomeScreen
          profile={profile}
          onProfile={() => setScreen('profile')}
          onScreen={setScreen}
          tracks={homeTracks.slice(0, 5)}
          loading={homeLoading}
          featured={featured}
          onPlayTrack={playTrackByObject}
          onAdd={addToLibrary}
          onGenre={selectGenre}
        />
      )}
      {screen === 'search' && (
        <SearchScreen
          profile={profile}
          onBack={() => setScreen('home')}
          onProfile={() => setScreen('profile')}
          query={query}
          setQuery={setQuery}
          results={results}
          searching={searching}
          searchError={searchError}
          recent={recent}
          onClearRecent={() => {
            setRecent([])
            saveRecentSearches([])
          }}
          onGenre={selectGenre}
          onPlayTrack={playTrackByObject}
          onAdd={addToLibrary}
        />
      )}
      {screen === 'playlist' && (
        <PlaylistScreen
          profile={profile}
          onBack={() => setScreen('home')}
          library={library}
          currentIdx={currentIdx}
          liked={liked}
          onPlay={playTrack}
          onToggleLike={toggleLike}
          onPlayAll={() => library.length && playTrack(0)}
          onLikeAll={likeAll}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          profile={profile}
          setProfile={setProfile}
          onBack={() => setScreen('home')}
          library={library}
          liked={liked}
          toast={toast}
        />
      )}
      {screen === 'now-playing' && (
        <NowPlaying
          profile={profile}
          track={currentTrack}
          playing={playing}
          liked={currentTrack?.id && liked.has(currentTrack.id)}
          currentTime={currentTime}
          duration={duration}
          shuffle={shuffle}
          repeat={repeat}
          onClose={() => setScreen('home')}
          onTogglePlay={togglePlay}
          onNext={playNext}
          onPrev={playPrev}
          onToggleLike={() => toggleLike()}
          onToggleShuffle={() => {
            setShuffle(s => !s)
            toast(!shuffle ? 'Aleatório ativado' : 'Aleatório desativado')
          }}
          onToggleRepeat={() => {
            setRepeat(r => !r)
            toast(!repeat ? 'Repetir ativado' : 'Repetir desativado')
          }}
          onSeek={seek}
        />
      )}
      {screen !== 'now-playing' && (
        <MiniPlayer
          track={currentTrack}
          playing={playing}
          liked={currentTrack?.id && liked.has(currentTrack.id)}
          progress={progress}
          onOpen={() => setScreen('now-playing')}
          onTogglePlay={togglePlay}
          onToggleLike={() => toggleLike()}
        />
      )}
      <BottomNav
        screen={screen}
        setScreen={setScreen}
        hidden={screen === 'now-playing'}
      />
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  )
}
