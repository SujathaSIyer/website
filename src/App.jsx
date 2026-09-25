import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Fingerprint,
  Linkedin,
  Menu,
  Mic2,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'

const FILTERS = [
  ['All', () => true],
  ['Writing & Media', r => r.type !== 'Patent / IP' && !/Event|Speaker/.test(r.type || '')],
  ['Speaking', r => /Event|Speaker/.test(r.type || '')],
  ['Patents', r => r.type === 'Patent / IP'],
]

const ARCHIVE_FILTERS = [
  ['All', () => true],
  ['Authored', r => r.type === 'Authored'],
  ['Interviews', r => /Interview|Quoted|Feature/.test(r.type || '')],
  ['Video & Podcast', r => /Video|Podcast/.test(`${r.type || ''} ${r.format || ''}`)],
  ['Speaking', r => /Event|Speaker/.test(r.type || '')],
  ['Patents', r => r.type === 'Patent / IP'],
]

function usePortfolio() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    fetch('/data.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`Could not load data.json (${r.status})`); return r.json() })
      .then(setData)
      .catch(setError)
  }, [])
  return { data, error }
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sujatha-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('sujatha-theme', theme)
  }, [theme])
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')]
}

function formatDate(value) {
  if (!value) return ''
  const p = String(value).split('-')
  if (p.length === 3) return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  if (p.length === 2) return new Date(`${value}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  return value
}

function categoryFor(r) {
  if (r.type === 'Patent / IP') return 'Patent'
  if (/Event|Speaker/.test(r.type || '')) return 'Speaking'
  if (/Podcast/.test(`${r.type || ''} ${r.format || ''}`)) return 'Podcast'
  if (/Video/.test(`${r.type || ''} ${r.format || ''}`)) return 'Video'
  if (r.type === 'Authored') return 'Article'
  return 'Interview'
}

function getHostname(value) {
  try { return new URL(value).hostname.replace(/^www\./, '') } catch { return '' }
}

function getYouTubeId(value) {
  try {
    const url = new URL(value)
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || ''
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/watch')) return url.searchParams.get('v') || ''
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || ''
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || ''
    }
  } catch {}
  return ''
}

function faviconFor(value, size = 128) {
  const host = getHostname(value)
  return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}` : '/favicon.png'
}

function previewFor(item) {
  if (item.preview_image) return { src: item.preview_image, kind: 'image' }
  const youtube = getYouTubeId(item.url || '')
  if (youtube) return { src: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`, kind: 'video' }
  const host = getHostname(item.url || '')
  const isSocial = /(^|\.)linkedin\.com$|(^|\.)x\.com$|(^|\.)twitter\.com$/.test(host)
  const isPdf = /\.pdf(?:$|\?)/i.test(item.url || '') || /pdf/i.test(item.format || '')
  const isPatent = item.type === 'Patent / IP'
  if (!host || isSocial || isPdf || isPatent) return { src: faviconFor(item.url, 256), kind: 'logo' }
  return {
    src: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(item.url)}?w=900&h=520`,
    kind: 'site',
  }
}

function SourceVisual({ item }) {
  const preview = useMemo(() => previewFor(item), [item.url, item.preview_image, item.format])
  const favicon = useMemo(() => faviconFor(item.url, 128), [item.url])
  const host = getHostname(item.url) || item.outlet
  const [stage, setStage] = useState(0)
  useEffect(() => setStage(0), [preview.src])
  const src = stage === 0 ? preview.src : stage === 1 ? favicon : '/favicon.png'
  const logoMode = preview.kind === 'logo' || stage > 0

  return <div className={`work-visual source-preview ${logoMode ? 'logo-mode' : ''}`}>
    <img
      className="preview-image"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setStage(v => Math.min(v + 1, 2))}
    />
    {!logoMode && <div className="preview-shade" />}
    <div className="source-chip">
      <img src={favicon} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />
      <span>{host}</span>
    </div>
    {preview.kind === 'video' && stage === 0 && <span className="media-badge">Video</span>}
  </div>
}

function visualClass(r) {
  const c = categoryFor(r).toLowerCase()
  if (c === 'patent') return 'visual-patent'
  if (c === 'speaking') return 'visual-speaking'
  if (c === 'podcast' || c === 'video') return 'visual-audio'
  if (/Quantum|AI Act|privacy/i.test(r.title || '')) return 'visual-orbit'
  if (/Philippine|bank/i.test(r.title || '')) return 'visual-city'
  return 'visual-grid'
}

function iconFor(r, size = 26) {
  const c = categoryFor(r)
  if (c === 'Patent') return <Fingerprint size={size} />
  if (c === 'Speaking') return <Mic2 size={size} />
  if (c === 'Podcast' || c === 'Video') return <Sparkles size={size} />
  if (c === 'Article') return <FileText size={size} />
  return <ShieldCheck size={size} />
}

function Header({ theme, toggleTheme, writingPage = false }) {
  const [open, setOpen] = useState(false)

  const go = (id) => {
    setOpen(false)
    if (writingPage) {
      window.location.href = `/#${id}`
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <div className="shell header-row">
        <a href="/" className="wordmark" onClick={() => setOpen(false)} aria-label="Sujatha S Iyer home"><span className="brand-script">SSI</span><span className="brand-name">Sujatha S Iyer</span></a>
        <nav className={`nav ${open ? 'is-open' : ''}`}>
          <button onClick={() => go('home')}>Home</button>
          <button onClick={() => go('about')}>About</button>
          <button onClick={() => go('work')}>Work</button>
          <button onClick={() => go('patents')}>Patents</button>
          <button onClick={() => go('speaking')}>Speaking</button>
          <a href="/writing.html" onClick={() => setOpen(false)}>Writing & Media</a>
          <button onClick={() => go('contact')}>Contact</button>
        </nav>
        <div className="header-actions">
          <button className="theme-switch" onClick={toggleTheme} aria-label="Toggle light and dark mode">
            <span className={theme === 'light' ? 'active' : ''}><Sun size={16} /></span>
            <span className={theme === 'dark' ? 'active' : ''}><Moon size={16} /></span>
          </button>
          <button className="menu-button" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
function Hero({ site }) {
  return (
    <section id="home" className="hero">
      <div className="hero-grid shell">
        <div className="hero-copy">
          <div className="kicker">{site.kicker}</div>
          <h1>{site.headline || site.name}</h1>
          <h2>{site.role}, {site.organization}</h2>
          <p>{site.intro}</p>
          <div className="hero-actions">
            <a className="button primary" href="#work">Explore my work <ArrowRight size={18} /></a>
            <a className="button ghost" href="#about">About me <ArrowDown size={18} /></a>
          </div>
        </div>
        <div className="portrait-stage" aria-label="Portrait of Sujatha S Iyer">
          <div className="portrait-orbit orbit-one" />
          <div className="portrait-orbit orbit-two" />
          <div className="dot-field" aria-hidden="true" />
          <img className="portrait" src={site.image?.src || '/profile.webp'} alt={site.image?.alt || site.name} />
          <div className="hero-note">{site.note}</div>
        </div>
      </div>
      <div className="shell focus-wrap">
        <div className="focus-grid">
          {site.focus?.map((item, i) => {
            const icons = [BrainCircuit, Database, ShieldCheck, CheckCircle2]
            const Icon = icons[i % icons.length]
            return <div className="focus-card" key={item.title}>
              <span className="focus-icon"><Icon size={24} /></span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
            </div>
          })}
        </div>
      </div>
    </section>
  )
}

function WorkCard({ item }) {
  return (
    <a className="work-card" href={item.url} target="_blank" rel="noreferrer">
      <SourceVisual item={item} />
      <div className="work-body">
        <div className="work-meta"><span className="type-pill">{categoryFor(item)}</span><span>{formatDate(item.date)}</span></div>
        <h3>{item.title}</h3>
        <p className="outlet">{item.outlet}</p>
        <ArrowUpRight className="card-arrow" size={19} />
      </div>
    </a>
  )
}

function SelectedWork({ data }) {
  const [active, setActive] = useState('All')
  const featured = useMemo(() => {
    const wanted = data.site?.featured_titles || []
    const chosen = wanted.map(t => data.records.find(r => r.title === t)).filter(Boolean)
    const extras = data.records.filter(r => !chosen.includes(r))
    return [...chosen, ...extras]
  }, [data])
  const predicate = FILTERS.find(([name]) => name === active)?.[1] || (() => true)
  const items = featured.filter(predicate).slice(0, 4)

  return (
    <section id="work" className="section selected-section">
      <div className="shell">
        <div className="section-heading split">
          <div><div className="eyebrow">Selected work</div><h2>Recent highlights</h2><p>A snapshot of my writing, interviews, speaking, patents and media coverage.</p></div>
          <div className="filter-row compact">
            {FILTERS.map(([name]) => <button key={name} className={active === name ? 'active' : ''} onClick={() => setActive(name)}>{name}</button>)}
            <a href="/writing.html" className="view-all">View all <ArrowRight size={17} /></a>
          </div>
        </div>
        <div className="work-grid">{items.map(item => <WorkCard key={`${item.url}-${item.title}`} item={item} />)}</div>
      </div>
    </section>
  )
}

function About({ site }) {
  return (
    <section id="about" className="section about-section">
      <div className="shell about-grid">
        <div><div className="eyebrow">About</div><h2>Research, engineering and production.</h2></div>
        <div className="about-copy">
          {(site.about || []).map((p, i) => <p key={i}>{p}</p>)}
          <div className="about-links">{site.links?.map(l => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label} <ArrowUpRight size={15} /></a>)}</div>
        </div>
      </div>
    </section>
  )
}

function PatentSection({ records }) {
  const patents = records.filter(r => r.type === 'Patent / IP').sort((a,b) => String(b.date).localeCompare(String(a.date)))
  return (
    <section id="patents" className="section patent-section">
      <div className="shell">
        <div className="section-heading"><div className="eyebrow">Patents</div><h2>Applied research translated into IP.</h2><p>Granted patents and published applications across document security, watermarking and privacy-preserving systems.</p></div>
        <div className="patent-list">
          {patents.map(p => <a href={p.url} target="_blank" rel="noreferrer" className="patent-row" key={`${p.url}-${p.title}`}>
            <div className="patent-mark"><Fingerprint size={22} /></div>
            <div className="patent-main"><div className="patent-status">{/granted/i.test(p.status || '') ? 'Granted' : p.format}</div><h3>{p.title}</h3><p>{p.patent_number || p.application_number || p.jurisdiction || p.outlet}</p></div>
            <div className="patent-date">{formatDate(p.grant_date || p.date)}</div>
            <ArrowUpRight size={18} />
          </a>)}
        </div>
      </div>
    </section>
  )
}

function SpeakingSection({ data }) {
  const titles = data.site?.speaking_titles || []
  const items = titles.map(t => data.records.find(r => r.title === t)).filter(Boolean).slice(0, 6)
  return (
    <section id="speaking" className="section speaking-section">
      <div className="shell speaking-grid">
        <div className="section-heading"><div className="eyebrow">Speaking</div><h2>Conversations on AI, security and enterprise systems.</h2><p>Selected conferences, panels and interviews.</p></div>
        <div className="speaking-list">
          {items.map(i => <a key={i.url} href={i.url} target="_blank" rel="noreferrer" className="speaking-item">
            <span>{formatDate(i.date)}</span><strong>{i.title}</strong><em>{i.outlet}</em><ArrowUpRight size={17} />
          </a>)}
        </div>
      </div>
    </section>
  )
}

function Contact({ site }) {
  return (
    <section id="contact" className="section contact-section">
      <div className="shell contact-card">
        <div><div className="eyebrow">Contact</div><h2>Connect with me.</h2><p>For conversations around AI security, enterprise AI, applied research and speaking.</p></div>
        <div className="contact-actions">
          <a className="button primary" href={site.links?.find(l => /linkedin/i.test(l.label))?.url || '#'} target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
          <a className="button ghost" href="/writing.html">Writing & media <ArrowRight size={18} /></a>
        </div>
      </div>
    </section>
  )
}

function Home({ data }) {
  return <>
    <Hero site={data.site} />
    <About site={data.site} />
    <SelectedWork data={data} />
    <PatentSection records={data.records} />
    <SpeakingSection data={data} />
    <Contact site={data.site} />
  </>
}

function Writing({ data }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState('All')
  const predicate = ARCHIVE_FILTERS.find(([name]) => name === active)?.[1] || (() => true)
  const rows = useMemo(() => data.records.filter(r => {
    if (!predicate(r)) return false
    const hay = [r.title, r.outlet, r.type, r.format, r.summary, ...(r.topics || [])].join(' ').toLowerCase()
    return !q.trim() || hay.includes(q.toLowerCase())
  }).sort((a,b) => String(b.date).localeCompare(String(a.date))), [data, q, active])

  return <main className="writing-page">
    <section className="writing-hero"><div className="shell"><div className="eyebrow">Writing & Media</div><h1>Work, ideas and conversations.</h1><p>{data.records.length} verified records across writing, interviews, speaking, video, podcasts and patents.</p></div></section>
    <section className="archive-section"><div className="shell">
      <div className="archive-toolbar">
        <label className="search-box"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search titles, outlets or topics" /></label>
        <div className="filter-row">{ARCHIVE_FILTERS.map(([name]) => <button key={name} className={active === name ? 'active' : ''} onClick={() => setActive(name)}>{name}</button>)}</div>
      </div>
      <div className="archive-count">{rows.length} result{rows.length === 1 ? '' : 's'}</div>
      <div className="archive-grid">{rows.map(item => <WorkCard item={item} key={`${item.url}-${item.title}`} />)}</div>
    </div></section>
  </main>
}

function Footer() {
  return <footer><div className="shell footer-row"><span>© {new Date().getFullYear()} Sujatha S Iyer</span><span>AI Security · Enterprise AI · Applied Research</span></div></footer>
}

function AppBody() {
  const { data, error } = usePortfolio()
  const [theme, toggleTheme] = useTheme()
  const writingPage = window.location.pathname.endsWith('/writing.html')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [writingPage])

  if (error) return <div className="load-state">Unable to load portfolio data: {error.message}</div>
  if (!data) return <div className="load-state">Loading portfolio…</div>
  return <>
    <Header theme={theme} toggleTheme={toggleTheme} writingPage={writingPage} />
    {writingPage ? <Writing data={data} /> : <Home data={data} />}
    <Footer />
  </>
}

export function App() {
  return <AppBody />
}
