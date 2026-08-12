import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, AtSign, BriefcaseBusiness, CalendarDays, Camera, Download, Layers3, Lightbulb, Menu, Play, Sparkles, Video, X } from 'lucide-react'
import { layout } from './config/design'
import { assets, creativeSkills, projects, services, socials, software, stats, visualArchive, type Project } from './data/portfolio'
import { useRouteScroll } from './hooks/useRouteScroll'

const { heroPortrait, aboutPortrait, logo, cv } = assets
const { wrap, eyebrow, button } = layout
const serviceIcons = { photography: Camera, videography: Video, events: CalendarDays, direction: Lightbulb } as const
const socialIcons = { instagram: AtSign, behance: Sparkles, linkedin: BriefcaseBusiness } as const

export default function App() {
  useRouteScroll()
  return <><PageProgress /><CustomCursor /><Routes><Route path="/" element={<Home />} /><Route path="/projects" element={<Projects />} /><Route path="/portfolio" element={<Projects />} /><Route path="*" element={<Home />} /></Routes></>
}

function PageProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame: number | null = null
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      frame = null
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [])
  return <div ref={bar} className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left scale-x-0 bg-[#e9e6df] mix-blend-difference" />
}

function CustomCursor() {
  const dot = useRef<HTMLSpanElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return undefined
    let x = 0; let y = 0; let rx = 0; let ry = 0; let frame: number | null = null; let visible = true
    const move = (event: MouseEvent) => { x = event.clientX; y = event.clientY; dot.current?.style.setProperty('transform', `translate3d(${x}px,${y}px,0)`) }
    const animate = () => { rx += (x - rx) * .14; ry += (y - ry) * .14; ring.current?.style.setProperty('transform', `translate3d(${rx}px,${ry}px,0)`); frame = requestAnimationFrame(animate) }
    const over = (event: MouseEvent) => ring.current?.classList.toggle('is-active', Boolean((event.target as Element | null)?.closest('a,button,figure,[data-cursor]')))
    const visibility = () => { visible = !document.hidden; if (visible && !frame) animate(); else if (!visible && frame) { cancelAnimationFrame(frame); frame = null } }
    window.addEventListener('mousemove', move, { passive: true }); document.addEventListener('mouseover', over); document.addEventListener('visibilitychange', visibility); animate()
    return () => { window.removeEventListener('mousemove', move); document.removeEventListener('mouseover', over); document.removeEventListener('visibilitychange', visibility); if (frame) cancelAnimationFrame(frame) }
  }, [])
  return <><span ref={dot} className="cursor-dot" /><span ref={ring} className="cursor-ring">View</span></>
}

function Header({ projectsPage = false }: { projectsPage?: boolean }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const links: ReadonlyArray<readonly [string, string]> = [
    ['Home', projectsPage ? '/' : '#hero'],
    ['Projects', '/projects'],
    ['About', projectsPage ? '/#about' : '#about'],
    ['Experience', projectsPage ? '/#experience' : '#experience'],
    ['Contact', projectsPage ? '/#contact' : '#contact'],
  ]
  return <header className={`${projectsPage ? 'relative border-b border-white/15' : 'absolute inset-x-0 top-0'} z-50 mx-auto flex h-24 w-[calc(100%-2.5rem)] max-w-[1400px] items-center justify-between md:w-[calc(100%-7rem)]`}>
    <Link to={projectsPage ? '/' : '#hero'} aria-label="Aghimuan Creatives home" onClick={() => setOpen(false)}><img src={logo} alt="Aghimuan Creatives" width="125" height="74" decoding="async" className="h-[74px] w-[125px] object-contain" /></Link>
    <nav aria-label="Primary navigation" className={`${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'} fixed inset-0 z-40 flex flex-col justify-center gap-7 bg-[#151514]/98 p-10 transition duration-300 md:pointer-events-auto md:static md:flex-row md:items-center md:gap-10 md:bg-transparent md:p-0 md:opacity-100 md:translate-x-0`}>
      {links.map(([label, to]) => <Link key={label} to={to} onClick={() => setOpen(false)} className={`font-display text-4xl md:font-sans md:text-[10px] md:uppercase md:tracking-[.16em] ${pathname === to || (label === 'Projects' && ['/projects', '/portfolio'].includes(pathname)) ? 'text-white' : 'text-[#aaa69d] hover:text-white'}`}>{label}</Link>)}
    </nav>
    <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)} className="relative z-50 grid size-10 place-items-center border border-white/20 md:hidden">{open ? <X size={20} /> : <Menu size={21} />}</button>
  </header>
}

function Home() {
  return <main className="overflow-x-clip bg-[#151514] text-[#e9e6df]">
    <section id="hero" className="relative min-h-[760px] overflow-hidden bg-[radial-gradient(circle_at_52%_48%,rgba(105,105,102,.24),transparent_35%)] md:min-h-dvh">
      <Header />
      <div className={`${wrap} relative min-h-[760px] md:min-h-dvh`}>
        <div className="absolute left-0 top-[15%] z-20 md:top-[25%]">
          <h1 className="font-display text-[clamp(58px,18vw,84px)] uppercase leading-[.88] tracking-[-.055em] md:text-[clamp(78px,10.2vw,158px)]"><span className="block">My Life</span><span className="block">Story</span></h1>
          <p className="mt-4 text-[17px] text-[#d1cdc5] md:ml-2 md:mt-7 md:text-2xl">Hey, I&apos;m <em className="font-display text-white">Shawn</em></p><span className="mt-4 block w-16 border-t border-white/80 md:ml-2 md:mt-7 md:w-24" />
        </div>
        <div className="absolute bottom-[4%] left-[5%] top-[23%] z-10 w-[96%] md:bottom-0 md:left-[25%] md:top-[16%] md:w-[57%]"><img src={heroPortrait} alt="Shawn seated in a tailored jacket" fetchPriority="high" decoding="async" className="h-full w-full object-contain object-bottom grayscale" /></div>
        <aside className="absolute bottom-[8%] right-0 z-30 hidden w-[48%] md:bottom-auto md:top-[43%] md:block md:w-[min(25vw,350px)]">
          <p className="text-[15px] leading-relaxed text-[#e5e1da] md:text-[clamp(19px,1.55vw,26px)]">Capturing authentic moments through minimalist, emotive photography.</p><span className="my-5 block w-12 border-t border-white/30 md:my-9 md:w-20" /><p className="hidden text-[11px] uppercase leading-[2.15] tracking-[.2em] text-[#c4c0b8] md:block">Creating timeless visuals that tell meaningful stories and leave a lasting impression.</p>
        </aside>
        <a href="#stats" className="absolute bottom-[7%] left-0 z-30 hidden flex-col gap-4 text-[9px] uppercase tracking-[.28em] text-[#d0cbc2] md:flex">Scroll to discover <ArrowDown size={20} /></a>
      </div>
    </section>

    <section id="stats" className="border-y border-white/15 bg-white/[.02]"><div className={`${wrap} grid grid-cols-2 md:grid-cols-4`}>{stats.map(([value, label], i) => <div key={label} className={`flex min-h-28 flex-col items-center justify-center py-6 text-center md:min-h-0 md:py-7 ${i % 2 === 0 ? 'border-r border-white/15' : ''} ${i < 2 ? 'border-b border-white/15 md:border-b-0' : ''} ${i === 1 ? 'md:border-r' : ''}`}><strong className="font-display text-3xl font-normal md:text-4xl">{value}</strong><span className="mt-2 max-w-24 text-[7px] uppercase leading-relaxed tracking-[.15em] text-[#aaa69d] md:text-[9px]">{label}</span></div>)}</div></section>

    <section aria-label="Creative disciplines" className="overflow-hidden border-b border-white/15 py-5"><div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10 whitespace-nowrap font-display text-4xl uppercase tracking-[-.04em] text-[#dad6ce] md:text-7xl"><span>Photography</span><span className="text-[#6f6b64]">✦</span><span>Film Production</span><span className="text-[#6f6b64]">✦</span><span>Creative Direction</span><span className="text-[#6f6b64]">✦</span><span>Visual Stories</span><span className="text-[#6f6b64]">✦</span><span aria-hidden="true">Photography</span><span className="text-[#6f6b64]">✦</span><span aria-hidden="true">Film Production</span><span className="text-[#6f6b64]">✦</span></div></section>

    <section id="about" className="border-b border-white/15 py-20 md:py-36"><div className={`${wrap} grid items-center gap-12 md:grid-cols-[.85fr_1fr] md:gap-20`}>
      <div className="group aspect-[4/5] max-w-[540px] overflow-hidden border border-white/15 bg-[#0d0d0c]"><img src={aboutPortrait} alt="Shawn speaking on a telephone" loading="lazy" decoding="async" className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:ease-out md:group-hover:scale-[1.02] md:group-hover:grayscale-0" /></div>
      <div><span className={eyebrow}>About the artist</span><h2 className="mt-5 font-display text-[42px] leading-[1.04] tracking-[-.045em] md:text-[clamp(46px,5vw,72px)]">Capturing Truth.<br /><em className="text-[#b7b0a3]">Telling Stories.</em></h2><p className="mt-8 max-w-xl text-[15px] leading-8 text-[#c9c5bd]">I&apos;m <strong className="font-medium text-white">Shawn James N. Camara</strong> — a Quezon City-based multimedia creative working across photography, videography, graphic art, editing, and visual storytelling.</p><p className="mt-4 max-w-xl text-[15px] leading-8 text-[#c9c5bd]">Since 2019, I&apos;ve developed purposeful media from concept to final output—balancing strong visual communication, disciplined production, and stories grounded in real people and social experience.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/projects" className={`${button} bg-[#e9e6df] text-[#151514] hover:bg-transparent hover:text-white`}>View my projects <ArrowRight size={16} /></Link><a href={cv} download className={button}>Download CV <Download size={15} /></a></div></div>
    </div></section>

    <Experience />

    <VisualArchive />

    <section className="border-b border-white/15 py-20 md:py-28"><div className={wrap}><div className="mb-14 text-center"><span className={eyebrow}>What I do</span><h2 className="mt-3 font-display text-5xl">Services</h2></div><div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-12">{services.map(([icon, title, description]) => { const Icon = serviceIcons[icon]; return <article key={title} className="group flex flex-col items-center text-center"><Icon size={32} strokeWidth={1.2} className="mb-6 text-[#dcd8cf] transition group-hover:-translate-y-1 group-hover:text-white" /><h3 className="text-base">{title}</h3><p className="mt-3 max-w-48 text-xs leading-5 text-[#9f9a90]">{description}</p><span className="mt-6 w-7 border-t border-white/20 transition-all group-hover:w-11 group-hover:border-white/50" /></article> })}</div></div></section>

    <section className={`${wrap} py-20 md:py-32`}><div className="flex items-end justify-between"><div><span className={eyebrow}>04 — Selected frames</span><h2 className="mt-4 font-display text-5xl tracking-[-.05em] md:text-7xl">Featured <em>work.</em></h2></div><Link to="/projects" className="hidden items-center gap-3 text-[9px] uppercase tracking-[.15em] md:flex">View all projects <ArrowRight size={14} /></Link></div><div className="mobile-swipe -mx-5 mt-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">{projects.map(item => <ProjectCard key={item.id} item={item} featured mobileRail />)}</div><div className="mt-5 flex items-center justify-between md:hidden"><span className={eyebrow}>Swipe to explore</span><ArrowRight size={16} /><Link to="/projects" className="text-[9px] uppercase tracking-[.15em]">View all</Link></div></section>

    <section className="border-b border-white/15 md:min-h-[430px]"><div className={`${wrap} flex flex-col items-center justify-center p-8 text-center md:px-[clamp(45px,8vw,130px)]`}><span className={eyebrow}>Your story, beautifully told</span><h2 className="my-4 font-display text-5xl leading-none tracking-[-.04em] md:text-7xl">Let’s Create<br />Something Memorable.</h2><p className="mb-8 max-w-md text-sm leading-6 text-[#aaa69d]">Have a project in mind? I’d love to hear about it and bring your vision to life.</p><a href="mailto:camarashawnjames@gmail.com" className={button}>Let’s work together <ArrowRight size={15} /></a></div></section>
    <Footer />
  </main>
}

function Experience() {
  const chapters: ExperienceChapterProps[] = [
    {
      number: '01', eyebrow: 'Freelance practice / 2019—Present', title: <>Making nights<br /><em>feel eternal.</em></>,
      copy: 'Photography, reels, promotional films and event visuals for models, brands, Alibi Music Lounge, Corte Ibiza and more.',
      image: '/assets/nightlife-dj.webp',
      imageFit: 'cover',
      inset: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=90',
      showInset: false,
      tags: ['Nightlife', 'Events', 'Reels', 'Photography'],
    },
    {
      number: '02', eyebrow: 'Featured film / PASANIN', title: <>Stories with<br /><em>something at stake.</em></>,
      copy: 'A narrative capstone short about breadwinner struggles—developed from concept through planning, production, editing and final output.',
      image: '/assets/pasanin-screening.webp',
      inset: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=90',
      showInset: false,
      tags: ['Narrative', 'Direction', 'Production', 'Post'],
    },
    {
      number: '03', eyebrow: 'Multimedia arts / STI Novaliches', title: <>One practice.<br /><em>Many forms.</em></>,
      copy: 'Bachelor of Multimedia Arts, July 2026. Trained across design, publishing, photography, film, interactive media, and 2D/3D animation.',
      image: '/assets/pasanin-poster.webp',
      inset: '/assets/pasanin-poster.webp',
      showInset: false,
      tags: software,
    },
  ]
  return <section id="experience" className="experience-story bg-[#0e0e0e]">
    <div className={`${wrap} flex min-h-[70vh] flex-col justify-end py-20 md:min-h-screen md:py-28`}>
      <span className={eyebrow}>Experience, told visually</span>
      <h2 className="mt-5 font-display text-[clamp(60px,11vw,160px)] uppercase leading-[.72] tracking-[-.08em]">Not a résumé.<br /><em className="text-[#8e8980]">A body of work.</em></h2>
      <div className="mt-12 flex items-center gap-5 text-[9px] uppercase tracking-[.2em] text-[#79766f]"><ArrowDown size={17} /> Scroll through the chapters</div>
    </div>
    {chapters.map(chapter => <ExperienceChapter key={chapter.number} {...chapter} />)}
    <div className={`${wrap} grid gap-10 border-t border-white/15 py-20 md:grid-cols-[.6fr_1.4fr] md:py-28`}>
      <div><span className={`${eyebrow} flex items-center gap-3`}><Layers3 size={17} /> Across the workflow</span><h3 className="mt-5 font-display text-4xl leading-none md:text-6xl">Concept to<br /><em>final frame.</em></h3></div>
      <div className="grid gap-x-10 md:grid-cols-2">{creativeSkills.map((skill, i) => <div key={skill} className="skill-line group flex items-center gap-4 border-b border-white/10 py-5"><span className="font-mono text-[9px] text-[#69665f]">{String(i + 1).padStart(2, '0')}</span><p className="m-0 text-sm text-[#bdb8af] transition group-hover:translate-x-2 group-hover:text-white">{skill}</p><ArrowUpRight size={13} className="ml-auto opacity-0 transition group-hover:opacity-100" /></div>)}</div>
    </div>
  </section>
}

interface ExperienceChapterProps {
  number: string
  eyebrow: string
  title: ReactNode
  copy: string
  image: string
  imageFit?: 'cover' | 'contain' | 'fill'
  inset: string
  showInset?: boolean
  tags: string[]
}

function ExperienceChapter({ number, eyebrow: label, title, copy, image, imageFit = 'cover', inset, showInset = true, tags }: ExperienceChapterProps) {
  const scene = useRef<HTMLElement>(null)
  const media = useRef<HTMLImageElement>(null)
  const insetMedia = useRef<HTMLElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 768) return undefined
    let frame: number | null = null; let active = false
    const observer = new IntersectionObserver(([entry]) => { active = entry?.isIntersecting ?? false }, { rootMargin: '100% 0px' })
    if (scene.current) observer.observe(scene.current)
    const onScroll = () => {
      if (!active || frame) return
      frame = requestAnimationFrame(() => {
        if (!scene.current || !media.current) return
        const rect = scene.current.getBoundingClientRect()
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)))
        media.current.style.transform = `scale(${1.06 - progress * .06}) translate3d(0,${(progress - .5) * 3}%,0)`
        if (insetMedia.current) insetMedia.current.style.transform = `translate3d(0,${(progress - .5) * -28}px,0)`
        frame = null
      })
    }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [])
  return <article ref={scene} className="relative h-[180vh] border-t border-white/15 md:h-[220vh]">
    <div className="group sticky top-0 h-screen overflow-hidden bg-[#111]">
      <img ref={media} src={image} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full ${imageFit === 'contain' ? 'object-contain' : imageFit === 'fill' ? 'object-fill' : 'object-cover'} grayscale transition-[filter] duration-500 group-hover:grayscale-0 md:will-change-transform`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <div className={`${wrap} relative z-10 flex h-full flex-col justify-between py-20 md:py-24`}>
        <div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[.22em] text-white/70">{label}</span><span className="font-display text-4xl italic text-white/60">{number}</span></div>
        <div className="max-w-4xl"><h3 className="font-display text-[clamp(52px,8vw,116px)] leading-[.82] tracking-[-.065em]">{title}</h3><p className="mt-7 max-w-xl text-sm leading-7 text-white/75 md:text-base">{copy}</p><div className="mt-7 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="border border-white/30 bg-black/15 px-3 py-2 text-[8px] uppercase tracking-[.16em] backdrop-blur-md">{tag}</span>)}</div></div>
      </div>
      {showInset && <figure ref={insetMedia} data-cursor className="absolute right-[5%] top-[17%] hidden aspect-[3/4] w-[18vw] overflow-hidden border border-white/30 bg-[#222] shadow-2xl md:block md:will-change-transform"><img src={inset} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover grayscale transition-transform duration-500 hover:scale-105 hover:grayscale-0" /></figure>}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/20"><span className="chapter-progress block h-full origin-left bg-white" /></div>
    </div>
  </article>
}

function VisualArchive() {
  const [activeImage, setActiveImage] = useState<number | null>(null)
  const activeArchiveItem = activeImage === null ? null : visualArchive[activeImage]
  const closeViewer = () => setActiveImage(null)
  const showPrevious = () => setActiveImage(current => current === null ? null : (current - 1 + visualArchive.length) % visualArchive.length)
  const showNext = () => setActiveImage(current => current === null ? null : (current + 1) % visualArchive.length)

  useEffect(() => {
    if (activeImage === null) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeImage])

  return <section className="overflow-hidden border-b border-white/15 bg-[#101010] py-20 md:py-32">
    <div className={wrap}>
      <div className="grid items-end gap-8 md:grid-cols-[1.2fr_.8fr]">
        <div><span className={eyebrow}>Visual language / 2019—2026</span><h2 className="mt-5 max-w-4xl font-display text-[clamp(56px,9vw,132px)] uppercase leading-[.76] tracking-[-.075em]">Light. Motion.<br /><em className="text-[#9f9a90]">Human stories.</em></h2></div>
        <p className="max-w-sm pb-2 text-sm leading-7 text-[#969188] md:justify-self-end">An evolving practice shaped by nightlife, portraiture, fashion, live events, film, and the quiet geometry found between moments.</p>
      </div>
    </div>

    <div className="mt-16 grid auto-rows-[170px] grid-cols-2 gap-1 px-1 md:auto-rows-[260px] md:grid-flow-dense md:grid-cols-12">
      {visualArchive.map(([src, label, number], index) => {
        const layout = [
          'col-span-2 row-span-3 md:col-span-5 md:row-span-3',
          'row-span-2 md:col-span-3 md:row-span-2',
          'row-span-2 md:col-span-4 md:row-span-2',
          'col-span-2 md:col-span-3 md:row-span-1',
          'col-span-2 row-span-2 md:col-span-4 md:row-span-2',
          'row-span-2 md:col-span-2 md:row-span-2',
          'row-span-2 md:col-span-3 md:row-span-2',
          'col-span-2 row-span-2 md:col-span-3 md:row-span-2',
          'col-span-2 row-span-2 md:col-span-4 md:row-span-1',
        ][index]
        return <button key={number} type="button" onClick={() => setActiveImage(index)} className={`${layout} group relative m-0 cursor-zoom-in overflow-hidden bg-[#20201f] text-left`} aria-label={`View ${label}`}>
          <img src={src} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:ease-out md:group-hover:scale-[1.035] md:group-hover:grayscale-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-70 transition group-hover:opacity-40" />
          <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between text-[8px] uppercase tracking-[.18em] text-white/80 md:inset-x-6 md:bottom-5"><span>{label}</span><span>{number}</span></figcaption>
        </button>
      })}
    </div>

    <div className={`${wrap} mt-14 flex items-center justify-between border-t border-white/15 pt-7`}><p className="font-display text-2xl italic text-[#aaa69d] md:text-4xl">Every frame should feel lived in.</p><Link to="/projects" className="flex items-center gap-3 text-[9px] uppercase tracking-[.18em]">Explore the archive <ArrowUpRight size={15} /></Link></div>
    {activeArchiveItem && <div role="dialog" aria-modal="true" aria-label={`Viewing ${activeArchiveItem[1]}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5 md:p-10" onClick={closeViewer}>
      <button type="button" onClick={closeViewer} className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white transition hover:bg-white/15 hover:text-white" aria-label="Close image viewer"><X size={20} /></button>
      <button type="button" onClick={event => { event.stopPropagation(); showPrevious() }} className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 hover:text-white md:left-7" aria-label="Previous image"><ArrowLeft size={21} /></button>
      <figure className="relative m-0 flex h-full w-full max-w-6xl flex-col items-center justify-center" onClick={event => event.stopPropagation()}>
        <img src={activeArchiveItem[0]} alt={activeArchiveItem[1]} className="max-h-[calc(100vh-9rem)] max-w-full object-contain" />
        <figcaption className="mt-4 flex w-full items-center justify-between text-[10px] uppercase tracking-[.18em] text-white/80"><span>{activeArchiveItem[1]}</span><span>{activeArchiveItem[2]} / {String(visualArchive.length).padStart(2, '0')}</span></figcaption>
      </figure>
      <button type="button" onClick={event => { event.stopPropagation(); showNext() }} className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 hover:text-white md:right-7" aria-label="Next image"><ArrowRight size={21} /></button>
    </div>}
  </section>
}

function Projects() {
  const [filter, setFilter] = useState('All Works')
  const filters = ['All Works', 'Portraits', 'Events', 'Street', 'Brand']
  const shown = useMemo(() => filter === 'All Works' ? projects : projects.filter(p => p.category === filter), [filter])
  return <main className="min-h-dvh overflow-x-clip bg-[#101010] text-[#e9e6df]">
    <Header projectsPage />
    <ProjectsHero />
    <HorizontalProjects items={projects.slice(0, 5)} />

    <section className="border-t border-white/15 py-20 md:py-32">
      <div className={wrap}>
        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_.8fr]"><div><span className={eyebrow}>The complete archive</span><h2 className="mt-5 font-display text-[clamp(58px,9vw,126px)] uppercase leading-[.74] tracking-[-.075em]">Every project.<br /><em className="text-[#8e8980]">A new world.</em></h2></div><p className="max-w-sm pb-2 text-sm leading-7 text-[#969188] md:justify-self-end">Filter the archive, then move through image, motion, atmosphere and character.</p></div>
        <div className="mobile-swipe sticky top-0 z-30 mt-14 flex flex-nowrap items-center gap-6 overflow-x-auto border-y border-white/15 bg-[#101010]/95 py-4 backdrop-blur-xl md:gap-8"><span className={`${eyebrow} shrink-0`}>View</span>{filters.map(f => <button type="button" key={f} onClick={() => setFilter(f)} className={`relative shrink-0 py-2 text-[9px] uppercase tracking-[.14em] transition ${filter === f ? 'text-white' : 'text-[#69665f] hover:text-white'}`}><span>{f}</span><span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-500 ${filter === f ? 'scale-x-100' : 'scale-x-0'}`} /></button>)}<span className={`${eyebrow} ml-auto hidden shrink-0 md:block`}>{String(shown.length).padStart(2, '0')} frames</span></div>
      </div>
      <div className="archive-editorial mt-1 grid grid-cols-2 gap-1 px-1 md:grid-cols-12">{shown.map((item, index) => <EditorialProject key={item.id} item={item} index={index} />)}</div>
    </section>

    <section className="relative min-h-[75vh] overflow-hidden border-t border-white/15 md:min-h-screen"><img src={heroPortrait} alt="Shawn, creative director" className="absolute inset-0 h-full w-full object-cover object-[center_35%] grayscale" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" /><div className={`${wrap} relative z-10 flex min-h-[75vh] flex-col justify-center py-20 md:min-h-screen`}><span className={eyebrow}>Next project starts here</span><h2 className="mt-6 max-w-5xl font-display text-[clamp(54px,9vw,128px)] leading-[.78] tracking-[-.07em]">Bring me the idea.<br /><em className="text-[#aaa69d]">We’ll give it a pulse.</em></h2><a href="mailto:camarashawnjames@gmail.com" className={`${button} mt-10 self-start bg-white text-black`}>Start a conversation <ArrowUpRight size={15} /></a></div></section>
    <Footer />
  </main>
}

function ProjectsHero() {
  const media = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 768) return undefined
    let frame: number | null = null
    const onScroll = () => { if (frame) return; frame = requestAnimationFrame(() => { if (media.current) media.current.style.transform = `translate3d(0,${Math.min(scrollY * .12, 110)}px,0) scale(${1 + Math.min(scrollY / 10000, .05)})`; frame = null }) }
    onScroll(); addEventListener('scroll', onScroll, { passive: true }); return () => { removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame) }
  }, [])
  return <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-white/15">
    <img ref={media} src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=82" alt="Fashion editorial project" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover grayscale md:will-change-transform" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-black/20" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
    <div className={`${wrap} relative z-10 flex min-h-[calc(100vh-6rem)] flex-col justify-between py-12 md:py-16`}><div className="flex justify-between"><span className={eyebrow}>Project archive / 2019—Present</span><span className={eyebrow}>Photography + Motion</span></div><div><h1 className="font-display text-[clamp(68px,13vw,190px)] uppercase leading-[.68] tracking-[-.09em]">Selected<br /><em className="text-[#b7b0a3]">worlds.</em></h1><div className="mt-9 flex items-end justify-between"><p className="max-w-sm text-sm leading-7 text-white/70">Portraits, nightlife, fashion, brands, film and the moments that only happen once.</p><span className="hidden items-center gap-3 text-[9px] uppercase tracking-[.2em] md:flex">Scroll to move sideways <ArrowDown size={16} /></span></div></div></div>
  </section>
}

function HorizontalProjects({ items }: { items: Project[] }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 768) return undefined
    let frame: number | null = null; let active = false
    const observer = new IntersectionObserver(([entry]) => { active = entry?.isIntersecting ?? false }, { rootMargin: '100% 0px' })
    if (section.current) observer.observe(section.current)
    const update = () => {
      if (!active || frame) return
      frame = requestAnimationFrame(() => {
        if (!section.current || !track.current) return
        const rect = section.current.getBoundingClientRect(); const travel = track.current.scrollWidth - innerWidth
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)))
        track.current.style.transform = `translate3d(${-travel * progress}px,0,0)`
        frame = null
      })
    }
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update)
    return () => { observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); if (frame) cancelAnimationFrame(frame) }
  }, [])
  return <section ref={section} className="relative py-1 md:h-[420vh] md:py-0"><div className="md:sticky md:top-0 md:h-screen md:overflow-hidden"><div ref={track} className="mobile-swipe flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 md:h-full md:w-max md:snap-none md:items-stretch md:overflow-visible md:px-0 md:will-change-transform">{items.map((item, index) => <figure key={item.id} data-cursor className="group relative m-0 h-[68svh] w-[88vw] shrink-0 snap-center overflow-hidden bg-[#222] md:h-full md:w-[72vw] lg:w-[58vw]"><img src={item.image} alt={item.alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:group-hover:scale-[1.035] md:group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" /><figcaption className="absolute inset-x-5 bottom-6 flex items-end justify-between md:inset-x-10 md:bottom-10"><div><span className={eyebrow}>{String(index + 1).padStart(2, '0')} / {item.category}</span><h2 className="mt-3 font-display text-4xl tracking-[-.05em] md:text-7xl">{item.title}</h2></div><span className="font-display text-2xl italic text-white/60 md:text-3xl">{item.year}</span></figcaption>{item.type === 'video' && <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 md:size-20 md:backdrop-blur-md"><Play size={18} fill="currentColor" /></span>}</figure>)}</div><div className="flex items-center justify-center gap-3 py-5 text-[8px] uppercase tracking-[.2em] text-[#8e8980] md:hidden">Swipe through projects <ArrowRight size={14} /></div></div></section>
}

function EditorialProject({ item, index }: { item: Project; index: number }) {
  const layouts = ['col-span-2 md:col-span-5 md:row-span-3', 'col-span-1 md:col-span-3 md:row-span-2', 'col-span-1 md:col-span-4 md:row-span-2', 'col-span-2 md:col-span-4 md:row-span-2', 'col-span-1 md:col-span-3 md:row-span-3', 'col-span-1 md:col-span-5 md:row-span-2', 'col-span-2 md:col-span-4 md:row-span-2', 'col-span-2 md:col-span-8 md:row-span-2']
  return <figure data-cursor className={`${layouts[index % layouts.length] ?? layouts[0]} group relative m-0 min-h-[270px] overflow-hidden bg-[#222] sm:min-h-[340px] md:min-h-[520px]`}><img src={item.image} alt={item.alt} loading="lazy" decoding="async" className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:ease-out md:group-hover:scale-[1.035] md:group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between md:inset-x-5 md:bottom-5"><div><span className="text-[7px] uppercase tracking-[.16em] text-white/60 md:text-[8px]">{item.category}</span><h3 className="mt-1 max-w-28 font-display text-xl leading-none md:mt-2 md:max-w-none md:text-3xl">{item.title}</h3></div><div className="grid size-8 shrink-0 place-items-center rounded-full border border-white/40 transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black md:size-10"><ArrowUpRight size={14} /></div></figcaption></figure>
}

interface ProjectCardProps {
  item: Project
  featured?: boolean
  archive?: boolean
  mobileRail?: boolean
}

function ProjectCard({ item, featured = false, archive = false, mobileRail = false }: ProjectCardProps) {
  const [src, setSrc] = useState(item.image)
  const height = featured ? 'aspect-[4/5] md:aspect-square' : item.size === 'tall' ? 'min-h-[520px]' : item.size === 'wide' ? 'min-h-[350px]' : 'min-h-[390px]'
  return <article className={`${archive ? 'mb-2 break-inside-avoid' : ''} ${mobileRail ? 'w-[76vw] shrink-0 snap-center md:w-auto' : ''} group`}><div className={`relative overflow-hidden bg-[#23221f] ${height}`}><img src={src} onError={() => setSrc(heroPortrait)} alt={item.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover md:grayscale md:transition md:duration-500 md:group-hover:scale-[1.04] md:group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />{item.type === 'video' && <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-white/60"><Play size={12} fill="currentColor" /></span>}<div className={`absolute inset-x-5 bottom-4 flex items-end justify-between transition ${archive ? 'opacity-100' : 'md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100'}`}><div><h3 className="font-display text-xl">{item.title}</h3><span className="text-[8px] uppercase tracking-[.12em] text-white/70">{item.category}</span></div><span className="text-[8px] tracking-[.1em] text-white/70">{item.year}</span></div></div></article>
}

function Footer() {
  return <footer id="contact" className="border-t border-white/15"><div className={`${wrap} grid grid-cols-2 gap-x-5 gap-y-10 py-14 md:grid-cols-[1.25fr_1.45fr_1fr_1.1fr_auto]`}><div className="col-span-2 md:col-span-1"><img src={logo} alt="Aghimuan Creatives" className="h-16 w-32 object-contain" /><p className="mt-4 font-display italic text-[#79766f]">Frames with feeling.<br />Stories with staying power.</p></div><div className="flex min-w-0 flex-col gap-2 break-words text-[11px] text-[#aaa69d]"><span className={eyebrow}>Get in touch</span><a href="mailto:camarashawnjames@gmail.com">camarashawnjames@gmail.com</a><a href="mailto:aghimuanfilms@gmail.com">aghimuanfilms@gmail.com</a><a href="tel:+639995606454">+63 999 560 6454</a></div><div className="flex flex-col gap-2 text-[11px] text-[#aaa69d]"><span className={eyebrow}>Based in</span><span>Quezon City, Philippines</span><span>Available for creative work</span></div><div><span className={eyebrow}>Follow the work</span><div className="mt-4 flex gap-4">{socials.map(([icon, label, href]) => { const Icon = socialIcons[icon]; return <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon size={16} /></a> })}</div><a href={cv} download className="mt-5 inline-flex items-center gap-2 text-[9px] uppercase tracking-[.14em] text-[#aaa69d] hover:text-white">Download CV <Download size={13} /></a></div><a href="mailto:camarashawnjames@gmail.com" className={`${button} col-span-2 justify-center self-start md:col-span-1`}>Let’s work together <ArrowUpRight size={14} /></a></div><div className={`${wrap} flex justify-between border-t border-white/15 py-4 text-[8px] uppercase tracking-[.12em] text-[#79766f]`}><span>© {new Date().getFullYear()} Aghimuan Creatives</span><span>Built with intention.</span></div></footer>
}
