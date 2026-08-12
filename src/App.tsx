import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Download,
  Layers3,
  Lightbulb,
  Menu,
  Play,
  Video,
  X,
} from "lucide-react";
import { layout } from "./config/design";
import {
  assets,
  creativeSkills,
  featuredProjects,
  projects,
  services,
  socials,
  software,
  stats,
  visualArchive,
  type Project,
} from "./data/portfolio";
import { useRouteScroll } from "./hooks/useRouteScroll";

const { heroPortrait, aboutPortrait, logo, cv } = assets;
const { wrap, eyebrow, button } = layout;
const serviceIcons = {
  photography: Camera,
  videography: Video,
  events: CalendarDays,
  direction: Lightbulb,
} as const;
const archiveFilters: ReadonlyArray<{
  label: string;
  matches: (project: Project) => boolean;
}> = [
  { label: "All Works", matches: () => true },
  { label: "Event", matches: (project) => project.category === "Events" },
  {
    label: "Portrait",
    matches: (project) =>
      project.category === "Portraits" || project.category === "Fashion",
  },
  { label: "Club", matches: (project) => project.category === "Club" },
  { label: "Car", matches: (project) => project.category === "Automotive" },
  { label: "Airbnb", matches: (project) => project.category === "Airbnb" },
  { label: "Videos", matches: (project) => project.type === "video" },
];

const archivePageSize = 8;

// Lead with the strongest, most varied frames; deterministically mix the rest so
// All Works feels editorial rather than grouped by category on every visit.
const allWorksHighlights = [
  "nocturne",
  "portrait-direction",
  "confetti-night",
  "garden-wedding",
  "blue-impreza",
  "airbnb-city-view",
  "fashion-form",
  "nightlife-energy",
  "poolside-portrait",
  "red-civic-motion",
  "editorial-story",
  "friends-at-the-bar",
] as const;

const stableProjectHash = (id: string) =>
  [...id].reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );

const curateAllWorks = (items: Project[]) => {
  const priority = new Map<string, number>(
    allWorksHighlights.map((id, index) => [id, index]),
  );
  return [...items].sort((a, b) => {
    const aPriority = priority.get(a.id);
    const bPriority = priority.get(b.id);
    if (aPriority !== undefined || bPriority !== undefined)
      return (
        (aPriority ?? Number.MAX_SAFE_INTEGER) -
        (bPriority ?? Number.MAX_SAFE_INTEGER)
      );
    return stableProjectHash(a.id) - stableProjectHash(b.id);
  });
};

export default function App() {
  useRouteScroll();
  return (
    <>
      <PageProgress />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/portfolio" element={<Projects />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

function PageProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current)
        bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      frame = null;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      ref={bar}
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left scale-x-0 bg-[#e9e6df] mix-blend-difference"
    />
  );
}

function CustomCursor() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return undefined;
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;
    let frame: number | null = null;
    let visible = true;
    const move = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      dot.current?.style.setProperty(
        "transform",
        `translate3d(${x}px,${y}px,0)`,
      );
    };
    const animate = () => {
      rx += (x - rx) * 0.14;
      ry += (y - ry) * 0.14;
      ring.current?.style.setProperty(
        "transform",
        `translate3d(${rx}px,${ry}px,0)`,
      );
      frame = requestAnimationFrame(animate);
    };
    const over = (event: MouseEvent) =>
      ring.current?.classList.toggle(
        "is-active",
        Boolean(
          (event.target as Element | null)?.closest(
            "a,button,figure,[data-cursor]",
          ),
        ),
      );
    const visibility = () => {
      visible = !document.hidden;
      if (visible && !frame) animate();
      else if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("visibilitychange", visibility);
    animate();
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("visibilitychange", visibility);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <>
      <span ref={dot} className="cursor-dot" />
      <span ref={ring} className="cursor-ring">
        View
      </span>
    </>
  );
}

function Header({ projectsPage = false }: { projectsPage?: boolean }) {
  const [open, setOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<number | null>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigationGroups: ReadonlyArray<{
    label: string;
    active: boolean;
    links: ReadonlyArray<readonly [string, string]>;
  }> = [
    {
      label: "Home",
      active: !projectsPage,
      links: [
        ["Overview", projectsPage ? "/#hero" : "#hero"],
        ["About Shawn", projectsPage ? "/#about" : "#about"],
        ["Experience", projectsPage ? "/#experience" : "#experience"],
        ["Services", projectsPage ? "/#services" : "#services"],
        ["Featured Work", projectsPage ? "/#featured-work" : "#featured-work"],
        ["Contact", projectsPage ? "/#contact" : "#contact"],
      ],
    },
    {
      label: "Projects",
      active: projectsPage || ["/projects", "/portfolio"].includes(pathname),
      links: [
        ["Overview", "/projects#projects-overview"],
        ["Featured Projects", "/projects#projects-featured"],
        ["Complete Archive", "/projects#archive"],
        ["Contact", "/projects#contact"],
      ],
    },
  ];
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setScrolled(window.scrollY > 12);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      setScrolled(currentScrollY > 12);

      if (Math.abs(delta) >= 4) {
        if (hideTimer.current) window.clearTimeout(hideTimer.current);

        if (delta > 0) {
          setNavVisible(true);
        } else {
          hideTimer.current = window.setTimeout(
            () => setNavVisible(false),
            300,
          );
        }

        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const showNav = !scrolled || navVisible || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${showNav ? "translate-y-0" : "-translate-y-full"} ${scrolled || projectsPage ? "border-white/10 bg-[#151514]/80 backdrop-blur-md" : "border-transparent bg-transparent"}`}
    >
      <div className={`${wrap} flex h-24 items-center justify-between`}>
        <Link
          to={projectsPage ? "/" : "#hero"}
          aria-label="Aghimuan Creatives home"
          onClick={() => setOpen(false)}
          className="relative z-50"
        >
          <img
            src={logo}
            alt="Aghimuan Creatives"
            width="125"
            height="74"
            decoding="async"
            className="h-[74px] w-[125px] object-contain"
          />
        </Link>
        <nav
          ref={navigationRef}
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`${open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"} absolute left-0 top-0 z-40 flex h-dvh w-screen flex-col justify-start overflow-y-auto bg-[#151514] px-6 pb-10 pt-28 transition duration-300 md:pointer-events-auto md:static md:h-auto md:w-auto md:flex-row md:translate-x-0 md:items-center md:gap-10 md:overflow-visible md:bg-transparent md:p-0 md:opacity-100`}
        >
          {navigationGroups.map((group) => (
            <details
              key={group.label}
              className="group relative border-b border-white/15 first:border-t md:border-0"
              onToggle={(event) => {
                const currentGroup = event.currentTarget;
                if (!currentGroup.open) return;

                navigationRef.current
                  ?.querySelectorAll<HTMLDetailsElement>("details[open]")
                  .forEach((dropdown) => {
                    if (dropdown !== currentGroup) dropdown.open = false;
                  });
              }}
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-sans text-2xl font-medium tracking-[-.02em] transition-colors marker:hidden md:py-3 md:text-[10px] md:font-normal md:uppercase md:tracking-[.16em] ${group.active ? "text-white" : "text-[#c8c3ba] hover:text-white"}`}
              >
                {group.label}
                <ArrowDown
                  size={15}
                  className="transition-transform duration-200 group-open:rotate-180 md:size-3"
                />
              </summary>
              <div className="grid gap-1 pb-4 md:absolute md:right-0 md:top-full md:min-w-52 md:border md:border-white/15 md:bg-[#151514] md:p-3 md:shadow-2xl">
                {group.links.map(([label, to]) => (
                  <Link
                    key={`${group.label}-${label}`}
                    to={to}
                    onClick={(event) => {
                      setOpen(false);
                      event.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    }}
                    className="px-3 py-2.5 text-sm text-[#aaa69d] transition-colors hover:bg-white/[.06] hover:text-white md:whitespace-nowrap md:text-[10px] md:uppercase md:tracking-[.12em]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </nav>
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
          className="relative z-50 grid size-10 place-items-center border border-white/20 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

function Home() {
  return (
    <main className="overflow-x-clip bg-[#151514] text-[#e9e6df]">
      <section
        id="hero"
        className="relative min-h-[760px] overflow-hidden bg-[radial-gradient(circle_at_52%_48%,rgba(105,105,102,.24),transparent_35%)] md:min-h-dvh"
      >
        <Header />
        <div className={`${wrap} relative min-h-[760px] md:min-h-dvh`}>
          <div className="absolute left-0 top-[15%] z-20 md:top-[25%]">
            <h1 className="font-display text-[clamp(58px,18vw,84px)] uppercase leading-[.88] tracking-[-.055em] md:text-[clamp(78px,10.2vw,158px)]">
              <span className="block">Shawn</span>
              <span className="block">Camara</span>
            </h1>
            <p className="mt-4 text-[17px] text-[#d1cdc5] md:ml-2 md:mt-7 md:text-2xl">
              Photographer &amp;{" "}
              <em className="font-display text-white">multimedia creative</em>
            </p>
            <span className="mt-4 block w-16 border-t border-white/80 md:ml-2 md:mt-7 md:w-24" />
          </div>
          <div className="absolute bottom-[4%] left-[5%] top-[23%] z-10 w-[96%] md:bottom-0 md:left-[25%] md:top-[16%] md:w-[57%]">
            <img
              src={heroPortrait}
              alt="Shawn seated in a tailored jacket"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-contain object-bottom grayscale"
            />
          </div>
          <aside className="absolute bottom-[8%] right-0 z-30 hidden w-[48%] md:bottom-auto md:top-[43%] md:block md:w-[min(25vw,350px)]">
            <p className="text-[15px] leading-relaxed text-[#e5e1da] md:text-[clamp(19px,1.55vw,26px)]">
              Photography and video for events, nightlife, portraits, brands,
              cars, and properties.
            </p>
            <span className="my-5 block w-12 border-t border-white/30 md:my-9 md:w-20" />
            <p className="hidden text-[11px] uppercase leading-[2.15] tracking-[.2em] text-[#c4c0b8] md:block">
              Based in Quezon City and available for freelance projects.
            </p>
          </aside>
          <a
            href="#stats"
            className="absolute bottom-[7%] left-0 z-30 hidden animate-bounce flex-col gap-4 text-[9px] uppercase tracking-[.28em] text-[#d0cbc2] md:flex"
          >
            View portfolio <ArrowDown size={20} />
          </a>
        </div>
      </section>

      <section id="stats" className="border-y border-white/15 bg-white/[.02]">
        <div className={`${wrap} grid grid-cols-2 md:grid-cols-4`}>
          {stats.map(([value, label], i) => (
            <div
              key={label}
              className={`flex min-h-28 flex-col items-center justify-center py-6 text-center md:min-h-0 md:py-7 ${i % 2 === 0 ? "border-r border-white/15" : ""} ${i < 2 ? "border-b border-white/15 md:border-b-0" : ""} ${i === 1 ? "md:border-r" : ""}`}
            >
              <strong className="font-display text-3xl font-normal md:text-4xl">
                {value}
              </strong>
              <span className="mt-2 max-w-24 text-[7px] uppercase leading-relaxed tracking-[.15em] text-[#aaa69d] md:text-[9px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-label="Creative services"
        className="overflow-hidden border-b border-white/15 py-5"
      >
        <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10 whitespace-nowrap font-display text-4xl uppercase tracking-[-.04em] text-[#dad6ce] md:text-7xl">
          <span>Photography</span>
          <span className="text-[#6f6b64]">✦</span>
          <span>Videography</span>
          <span className="text-[#6f6b64]">✦</span>
          <span>Event Coverage</span>
          <span className="text-[#6f6b64]">✦</span>
          <span>Creative Direction</span>
          <span className="text-[#6f6b64]">✦</span>
          <span aria-hidden="true">Photography</span>
          <span className="text-[#6f6b64]">✦</span>
          <span aria-hidden="true">Videography</span>
          <span className="text-[#6f6b64]">✦</span>
        </div>
      </section>

      <section id="about" className="border-b border-white/15 py-20 md:py-36">
        <div
          className={`${wrap} grid items-start gap-12 md:grid-cols-[.85fr_1fr] md:gap-20`}
        >
          <div className="group aspect-[4/5] max-w-[540px] overflow-hidden border border-white/15 bg-[#0d0d0c]">
            <img
              src={aboutPortrait}
              alt="Shawn speaking on a telephone"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:ease-out md:group-hover:scale-[1.02] md:group-hover:grayscale-0"
            />
          </div>
          <div>
            <span className={eyebrow}>About Shawn</span>
            <h2 className="mt-5 font-display text-[36px] leading-[1.04] tracking-[-.045em] md:text-[clamp(46px,5vw,72px)]">
              Photography, video,
              <br />
              <em className="text-[#b7b0a3]">and design.</em>
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#c9c5bd] md:text-[15px] md:leading-8">
              I&apos;m{" "}
              <strong className="font-medium text-white">
                Shawn James N. Camara
              </strong>
              , a Quezon City-based multimedia creative and 2026 Multimedia Arts
              graduate from STI College Novaliches, specializing in{" "}
              <strong className="font-medium text-white">
                photography, videography, editing, graphic design, filmmaking,
                and creative direction
              </strong>
              .
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#c9c5bd] md:text-[15px] md:leading-8">
              Working independently since{" "}
              <strong className="font-medium text-white">2019</strong>, I take
              projects from concept and shooting through editing and delivery,
              including films, short-form content, client work, and Airbnb and
              real-estate photography.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className={`${button} bg-[#e9e6df] text-[#151514] hover:bg-transparent hover:text-white`}
              >
                View projects <ArrowRight size={16} />
              </Link>
              <a href={cv} download className={button}>
                Download CV <Download size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Experience />

      <VisualArchive />

      <section
        id="services"
        className="border-b border-white/15 py-20 md:py-28"
      >
        <div className={wrap}>
          <div className="mb-14 text-center">
            <span className={eyebrow}>What I do</span>
            <h2 className="mt-3 font-display text-5xl">Services</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-12">
            {services.map(([icon, title, description]) => {
              const Icon = serviceIcons[icon];
              return (
                <article
                  key={title}
                  className="group flex flex-col items-center text-center"
                >
                  <Icon
                    size={32}
                    strokeWidth={1.2}
                    className="mb-6 text-[#dcd8cf] transition group-hover:-translate-y-1 group-hover:text-white"
                  />
                  <h3 className="text-base">{title}</h3>
                  <p className="mt-3 max-w-48 text-xs leading-5 text-[#9f9a90]">
                    {description}
                  </p>
                  <span className="mt-6 w-7 border-t border-white/20 transition-all group-hover:w-11 group-hover:border-white/50" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedWork />

      <section className="border-b border-white/15 md:min-h-[430px]">
        <div
          className={`${wrap} flex flex-col items-center justify-center p-8 text-center md:px-[clamp(45px,8vw,130px)]`}
        >
          <span className={eyebrow}>Available for freelance work</span>
          <h2 className="my-4 font-display text-5xl leading-none tracking-[-.04em] md:text-7xl">
            Have a project
            <br />
            in mind?
          </h2>
          <p className="mb-8 max-w-md text-sm leading-6 text-[#aaa69d]">
            Send the project details, preferred date, location, and expected
            deliverables.
          </p>
          <a href="mailto:camarashawnjames@gmail.com" className={button}>
            Send an inquiry <ArrowRight size={15} />
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function FeaturedWork() {
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const activeItem =
    activeImage === null ? null : featuredProjects[activeImage];
  const closeViewer = () => setActiveImage(null);
  const showPrevious = () =>
    setActiveImage((current) =>
      current === null
        ? null
        : (current - 1 + featuredProjects.length) % featuredProjects.length,
    );
  const showNext = () =>
    setActiveImage((current) =>
      current === null ? null : (current + 1) % featuredProjects.length,
    );

  return (
    <section id="featured-work" className={`${wrap} py-20 md:py-32`}>
      <div className="flex items-end justify-between">
        <div>
          <span className={eyebrow}>Featured projects</span>
          <h2 className="mt-4 font-display text-5xl tracking-[-.05em] md:text-7xl">
            Selected <em>work.</em>
          </h2>
        </div>
        <Link
          to="/projects"
          className="group hidden items-center gap-3 text-[9px] uppercase tracking-[.15em] transition-colors duration-300 hover:text-white md:flex"
        >
          View all projects{" "}
          <ArrowRight
            size={14}
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
        </Link>
      </div>
      <div className="mobile-swipe -mx-5 mt-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
        {featuredProjects.map((item, index) => (
          <FeaturedProjectCard
            key={item.id}
            item={item}
            onClick={() => setActiveImage(index)}
          />
        ))}
      </div>
      <div className="swipe-prompt mt-5 flex items-center justify-between overflow-hidden border-y border-white/15 py-3 md:hidden">
        <span className={eyebrow}>Swipe to view</span>
        <span className="swipe-prompt__arrow" aria-hidden="true">
          <ArrowRight size={16} />
        </span>
        <Link
          to="/projects"
          className="text-[9px] uppercase tracking-[.15em] transition-colors hover:text-white"
        >
          View all
        </Link>
      </div>
      {activeItem && (
        <ImageViewer
          src={activeItem.image}
          alt={activeItem.alt}
          label={`${activeItem.title} / ${activeItem.category}`}
          counter={String((activeImage ?? 0) + 1).padStart(2, "0")}
          total={featuredProjects.length}
          onClose={closeViewer}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      )}
    </section>
  );
}

function Experience() {
  const chapters: ExperienceChapterProps[] = [
    {
      number: "01",
      eyebrow: "Freelance work / 2019—Present",
      title: (
        <>
          Event and nightlife
          <br />
          <em>coverage.</em>
        </>
      ),
      copy: "Photography, reels, promotional videos, and event visuals for models, brands, Alibi Music Lounge, Corte Ibiza, and other clients.",
      image: "/assets/nightlife-dj.webp",
      imageFit: "cover",
      tags: ["Nightlife", "Events", "Reels", "Photography"],
    },
    {
      number: "02",
      eyebrow: "Short film / PASANIN",
      title: (
        <>
          Short film
          <br />
          <em>production.</em>
        </>
      ),
      copy: "A capstone short film about the challenges faced by family breadwinners, developed from concept and planning through production and editing.",
      image: "/assets/pasanin-screening.webp",
      tags: ["Narrative", "Direction", "Production", "Post"],
    },
    {
      number: "03",
      eyebrow: "Education / STI Novaliches",
      title: (
        <>
          Multimedia arts
          <br />
          <em>training.</em>
        </>
      ),
      copy: "Bachelor of Multimedia Arts, July 2026. Training included design, publishing, photography, film, interactive media, and 2D/3D animation.",
      image: "/assets/pasanin-poster.webp",
      tags: software,
    },
  ];
  return (
    <section id="experience" className="experience-story bg-[#0e0e0e]">
      <div
        className={`${wrap} flex min-h-[70vh] flex-col justify-end py-20 md:min-h-screen md:py-28`}
      >
        <span className={eyebrow}>Experience and education</span>
        <h2 className="mt-5 font-display text-[clamp(60px,11vw,160px)] uppercase leading-[.72] tracking-[-.08em]">
          Work history.
          <br />
          <em className="text-[#8e8980]">Skills and training.</em>
        </h2>
        <div className="mt-12 flex animate-bounce items-center gap-5 text-[9px] uppercase tracking-[.2em] text-[#79766f]">
          <ArrowDown size={17} /> Scroll to view experience
        </div>
      </div>
      {chapters.map((chapter) => (
        <ExperienceChapter key={chapter.number} {...chapter} />
      ))}
      <div
        className={`${wrap} grid gap-10 border-t border-white/15 py-20 md:grid-cols-[.6fr_1.4fr] md:py-28`}
      >
        <div>
          <span className={`${eyebrow} flex items-center gap-3`}>
            <Layers3 size={17} /> Production skills
          </span>
          <h3 className="mt-5 font-display text-4xl leading-none md:text-6xl">
            Planning through
            <br />
            <em>final delivery.</em>
          </h3>
        </div>
        <div className="grid gap-x-10 md:grid-cols-2">
          {creativeSkills.map((skill, i) => (
            <div
              key={skill}
              className="skill-line group flex items-center gap-4 border-b border-white/10 py-5"
            >
              <span className="font-mono text-[9px] text-[#69665f]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="m-0 text-sm text-[#bdb8af] transition group-hover:translate-x-2 group-hover:text-white">
                {skill}
              </p>
              <ArrowUpRight
                size={13}
                className="ml-auto opacity-0 transition group-hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ExperienceChapterProps {
  number: string;
  eyebrow: string;
  title: ReactNode;
  copy: string;
  image: string;
  imageFit?: "cover" | "contain" | "fill";
  tags: string[];
}

function ExperienceChapter({
  number,
  eyebrow: label,
  title,
  copy,
  image,
  imageFit = "cover",
  tags,
}: ExperienceChapterProps) {
  const scene = useRef<HTMLElement>(null);
  const media = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      innerWidth < 768
    )
      return undefined;
    let frame: number | null = null;
    let active = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry?.isIntersecting ?? false;
      },
      { rootMargin: "100% 0px" },
    );
    if (scene.current) observer.observe(scene.current);
    const onScroll = () => {
      if (!active || frame) return;
      frame = requestAnimationFrame(() => {
        if (!scene.current || !media.current) return;
        const rect = scene.current.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)),
        );
        media.current.style.transform = `scale(${1.06 - progress * 0.06}) translate3d(0,${(progress - 0.5) * 3}%,0)`;
        frame = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <article
      ref={scene}
      className="relative h-[180vh] border-t border-white/15 md:h-[220vh]"
    >
      <div className="group sticky top-0 h-screen overflow-hidden bg-[#111]">
        <img
          ref={media}
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full ${imageFit === "contain" ? "object-contain" : imageFit === "fill" ? "object-fill" : "object-cover"} grayscale transition-[filter] duration-500 group-hover:grayscale-0 md:will-change-transform`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div
          className={`${wrap} relative z-10 flex h-full flex-col justify-between py-20 md:py-24`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[.22em] text-white/70">
              {label}
            </span>
            <span className="font-display text-4xl italic text-white/60">
              {number}
            </span>
          </div>
          <div className="max-w-4xl">
            <h3 className="font-display text-[clamp(52px,8vw,116px)] leading-[.82] tracking-[-.065em]">
              {title}
            </h3>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/75 md:text-base">
              {copy}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/30 bg-black/15 px-3 py-2 text-[8px] uppercase tracking-[.16em] backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/20">
          <span className="chapter-progress block h-full origin-left bg-white" />
        </div>
      </div>
    </article>
  );
}

function VisualArchive() {
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const activeArchiveItem =
    activeImage === null ? null : visualArchive[activeImage];
  const closeViewer = () => setActiveImage(null);
  const showPrevious = () =>
    setActiveImage((current) =>
      current === null
        ? null
        : (current - 1 + visualArchive.length) % visualArchive.length,
    );
  const showNext = () =>
    setActiveImage((current) =>
      current === null ? null : (current + 1) % visualArchive.length,
    );

  return (
    <section className="overflow-hidden border-b border-white/15 bg-[#101010] py-20 md:py-32">
      <div className={wrap}>
        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <span className={eyebrow}>Portfolio overview / 2019—2026</span>
            <h2 className="mt-5 max-w-4xl font-display text-[clamp(56px,9vw,132px)] uppercase leading-[.76] tracking-[-.075em]">
              Photography.
              <br />
              <em className="text-[#9f9a90]">Video and design.</em>
            </h2>
          </div>
          <p className="max-w-sm pb-2 text-sm leading-7 text-[#969188] md:justify-self-end">
            A selection of nightlife, portraits, fashion, live events, film
            production, and interior photography.
          </p>
        </div>
      </div>

      <div className="mt-16 grid auto-rows-[170px] grid-cols-2 gap-1 px-1 md:auto-rows-[260px] md:grid-flow-dense md:grid-cols-12">
        {visualArchive.map(([src, label, number], index) => {
          const layout = [
            "col-span-2 row-span-3 md:col-span-5 md:row-span-3",
            "row-span-2 md:col-span-3 md:row-span-2",
            "row-span-2 md:col-span-4 md:row-span-2",
            "col-span-2 md:col-span-3 md:row-span-1",
            "col-span-2 row-span-2 md:col-span-4 md:row-span-2",
            "row-span-2 md:col-span-2 md:row-span-2",
            "row-span-2 md:col-span-3 md:row-span-2",
            "col-span-2 row-span-2 md:col-span-3 md:row-span-2",
            "col-span-2 row-span-2 md:col-span-4 md:row-span-1",
          ][index];
          return (
            <button
              key={number}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`${layout} group relative m-0 cursor-zoom-in overflow-hidden bg-[#20201f] text-left`}
              aria-label={`View ${label}`}
            >
              <img
                src={src}
                alt={label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:ease-out md:group-hover:scale-[1.035] md:group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-70 transition group-hover:opacity-40" />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between text-[8px] uppercase tracking-[.18em] text-white/80 md:inset-x-6 md:bottom-5">
                <span>{label}</span>
                <span>{number}</span>
              </figcaption>
            </button>
          );
        })}
      </div>

      <div
        className={`${wrap} mt-14 flex items-center justify-between border-t border-white/15 pt-7`}
      >
        <p className="font-display text-2xl italic text-[#aaa69d] md:text-4xl">
          More work is available in the full archive.
        </p>
        <Link
          to="/projects"
          className="flex items-center gap-3 text-[9px] uppercase tracking-[.18em]"
        >
          View all projects <ArrowUpRight size={15} />
        </Link>
      </div>
      {activeArchiveItem && (
        <ImageViewer
          src={activeArchiveItem[0]}
          alt={activeArchiveItem[1]}
          label={activeArchiveItem[1]}
          counter={activeArchiveItem[2]}
          total={visualArchive.length}
          onClose={closeViewer}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      )}
    </section>
  );
}

function ImageViewer({
  src,
  alt,
  label,
  counter,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  src: string;
  alt: string;
  label: string;
  counter: string;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, [onClose, onPrevious, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${alt}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5 md:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white transition hover:bg-white/15 hover:text-white"
        aria-label="Close image viewer"
      >
        <X size={20} />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 hover:text-white md:left-7"
        aria-label="Previous image"
      >
        <ArrowLeft size={21} />
      </button>
      <figure
        className="relative m-0 flex h-full w-full max-w-6xl flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[calc(100vh-9rem)] max-w-full object-contain"
        />
        <figcaption className="mt-4 flex w-full items-center justify-between text-[10px] uppercase tracking-[.18em] text-white/80">
          <span>{label}</span>
          <span>
            {counter} / {String(total).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 hover:text-white md:right-7"
        aria-label="Next image"
      >
        <ArrowRight size={21} />
      </button>
    </div>
  );
}

function Projects() {
  const [filter, setFilter] = useState("All Works");
  const [page, setPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<Project | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const archiveGrid = useRef<HTMLDivElement>(null);
  const filteredProjects = useMemo(() => {
    const matches =
      archiveFilters.find(({ label }) => label === filter)?.matches ??
      (() => true);
    const matchingProjects = projects.filter(matches);
    return filter === "All Works"
      ? curateAllWorks(matchingProjects)
      : matchingProjects;
  }, [filter]);
  const viewableProjects = useMemo(
    () => filteredProjects.filter((project) => project.type !== "video"),
    [filteredProjects],
  );
  const activeImageIndex = activeImageId
    ? viewableProjects.findIndex((project) => project.id === activeImageId)
    : -1;
  const activeImage =
    activeImageIndex >= 0 ? viewableProjects[activeImageIndex] : undefined;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / archivePageSize),
  );
  const shown = useMemo(() => {
    const start = (page - 1) * archivePageSize;
    return filteredProjects.slice(start, start + archivePageSize);
  }, [filteredProjects, page]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setActiveImageId(null);
  }, [filter]);

  const changePage = (nextPage: number) => {
    const target = Math.min(Math.max(nextPage, 1), totalPages);
    if (target === page) return;
    setPage(target);
    requestAnimationFrame(() =>
      archiveGrid.current?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      }),
    );
  };

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#101010] text-[#e9e6df]">
      <Header projectsPage />
      <ProjectsHero />
      <div id="projects-featured">
        <HorizontalProjects
          items={projects.filter(({ id }) =>
            [
              "nocturne",
              "after-hours",
              "geometry",
              "soft-focus",
              "city",
            ].includes(id),
          )}
        />
      </div>

      <section id="archive" className="border-t border-white/15 pt-20 md:pt-32">
        <div className={wrap}>
          <div className="grid items-end gap-8 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className={eyebrow}>Complete archive</span>
              <h2 className="mt-5 font-display text-[clamp(58px,9vw,126px)] uppercase leading-[.74] tracking-[-.075em]">
                All projects.
                <br />
                <em className="text-[#8e8980]">Sorted by category.</em>
              </h2>
            </div>
            <p className="max-w-sm pb-2 text-sm leading-7 text-[#969188] md:justify-self-end">
              Choose a category, browse the pages, and click any photo or video
              to view it at full size.
            </p>
          </div>
          <div className="sticky top-0 z-30 mt-14 flex items-center justify-between gap-6 border-y border-white/15 bg-[#101010]/95 py-3 backdrop-blur-xl">
            <div className="mobile-swipe flex min-w-0 flex-nowrap items-center gap-6 overflow-x-auto md:gap-8">
              {archiveFilters.map(({ label }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    setFilter(label);
                    setPage(1);
                  }}
                  className={`relative shrink-0 py-2 text-[9px] uppercase tracking-[.14em] transition ${filter === label ? "text-white" : "text-[#69665f] hover:text-white"}`}
                >
                  <span>{label}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-500 ${filter === label ? "scale-x-100" : "scale-x-0"}`}
                  />
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <ArchivePagination
                page={page}
                totalPages={totalPages}
                onChange={changePage}
                compact
              />
            )}
          </div>
        </div>
        <div
          ref={archiveGrid}
          className="archive-editorial mt-1 grid scroll-mt-20 grid-cols-2 gap-1 px-1 md:auto-rows-[180px] md:grid-cols-12"
        >
          {shown.map((item, index) =>
            item.video ? (
              <EditorialProject
                key={item.id}
                item={item}
                index={index}
                onPlay={() => setActiveVideo(item)}
              />
            ) : (
              <EditorialProject
                key={item.id}
                item={item}
                index={index}
                onView={() => setActiveImageId(item.id)}
              />
            ),
          )}
        </div>
        {totalPages > 1 && (
          <div className={`${wrap} py-10 md:py-14`}>
            <ArchivePagination
              page={page}
              totalPages={totalPages}
              onChange={changePage}
              label={`${filter} archive pages`}
            />
          </div>
        )}
      </section>
      {activeVideo?.video && (
        <VideoViewer
          src={activeVideo.video}
          poster={activeVideo.image}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
      {activeImage && (
        <ImageViewer
          src={activeImage.image}
          alt={activeImage.alt}
          label={activeImage.title}
          counter={String(activeImageIndex + 1).padStart(2, "0")}
          total={viewableProjects.length}
          onClose={() => setActiveImageId(null)}
          onPrevious={() =>
            setActiveImageId(
              viewableProjects[
                (activeImageIndex - 1 + viewableProjects.length) %
                  viewableProjects.length
              ]?.id ?? null,
            )
          }
          onNext={() =>
            setActiveImageId(
              viewableProjects[(activeImageIndex + 1) % viewableProjects.length]
                ?.id ?? null,
            )
          }
        />
      )}

      <section className="relative mt-12 min-h-[75vh] overflow-hidden border-t border-white/15 md:mt-20 md:min-h-screen">
        <img
          src={heroPortrait}
          alt="Shawn, creative director"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
        <div
          className={`${wrap} relative z-10 flex min-h-[75vh] flex-col justify-center py-20 md:min-h-screen`}
        >
          <span className={eyebrow}>Book a project</span>
          <h2 className="mt-6 max-w-5xl font-display text-[clamp(54px,9vw,128px)] leading-[.78] tracking-[-.07em]">
            Need photo or
            <br />
            <em className="text-[#aaa69d]">video coverage?</em>
          </h2>
          <a
            href="mailto:camarashawnjames@gmail.com"
            className={`${button} mt-10 self-start bg-white text-black`}
          >
            Send an inquiry <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function ArchivePagination({
  page,
  totalPages,
  onChange,
  compact = false,
  label = "Archive pages",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  compact?: boolean;
  label?: string;
}) {
  const visibleCount = Math.min(4, totalPages);
  const start = Math.min(
    Math.max(page - 1, 1),
    Math.max(1, totalPages - visibleCount + 1),
  );
  const pages = Array.from(
    { length: visibleCount },
    (_, index) => start + index,
  );
  const size = compact ? "size-8 md:size-9" : "size-11";
  return (
    <nav
      aria-label={label}
      className={`flex shrink-0 items-center justify-center ${compact ? "gap-1" : "gap-2"}`}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous archive page"
        className={`grid ${size} place-items-center border border-white/25 text-white transition duration-300 hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/25 disabled:hover:bg-transparent disabled:hover:text-white`}
      >
        <ArrowLeft size={compact ? 13 : 16} />
      </button>
      <div className={`flex ${compact ? "gap-1" : "gap-2"}`}>
        {pages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
            aria-label={`Go to archive page ${pageNumber}`}
            aria-current={page === pageNumber ? "page" : undefined}
            className={`grid ${size} place-items-center border text-[9px] tracking-[.12em] transition duration-300 ${page === pageNumber ? "border-white bg-white text-black" : "border-white/25 text-white hover:border-white"}`}
          >
            {String(pageNumber).padStart(2, "0")}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next archive page"
        className={`grid ${size} place-items-center border border-white/25 text-white transition duration-300 hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/25 disabled:hover:bg-transparent disabled:hover:text-white`}
      >
        <ArrowRight size={compact ? 13 : 16} />
      </button>
    </nav>
  );
}

function ProjectsHero() {
  const media = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      innerWidth < 768
    )
      return undefined;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        if (media.current)
          media.current.style.transform = `translate3d(0,${Math.min(scrollY * 0.12, 110)}px,0) scale(${1 + Math.min(scrollY / 10000, 0.05)})`;
        frame = null;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section
      id="projects-overview"
      className="group relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-white/15"
    >
      <img
        ref={media}
        src="/assets/projects-hero-portrait.webp"
        alt="Portrait of a woman holding a celebration cake"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0 md:will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
      <div
        className={`${wrap} relative z-10 flex min-h-[calc(100vh-6rem)] flex-col justify-between py-12 md:py-16`}
      >
        <div className="flex justify-between">
          <span className={eyebrow}>Project archive / 2019—Present</span>
          <span className={eyebrow}>Photography + Video</span>
        </div>
        <div>
          <h1 className="font-display text-[clamp(68px,13vw,190px)] uppercase leading-[.68] tracking-[-.09em]">
            Project
            <br />
            <em className="text-[#b7b0a3]">archive.</em>
          </h1>
          <div className="mt-9 flex items-end justify-between">
            <p className="max-w-sm text-sm leading-7 text-white/70">
              Browse portraits, events, nightlife, automotive, property,
              fashion, and video projects.
            </p>
            <span className="hidden items-center gap-3 text-[9px] uppercase tracking-[.2em] md:flex">
              Scroll to view featured projects{" "}
              <ArrowDown size={16} className="animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HorizontalProjects({ items }: { items: Project[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    let frame: number | null = null;
    let active = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry?.isIntersecting ?? false;
      },
      { rootMargin: "100% 0px" },
    );
    if (section.current) observer.observe(section.current);
    const update = () => {
      if (innerWidth < 768) {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
        track.current?.style.removeProperty("transform");
        return;
      }
      if (!active || frame) return;
      frame = requestAnimationFrame(() => {
        if (!section.current || !track.current) {
          frame = null;
          return;
        }
        if (innerWidth < 768) {
          track.current.style.removeProperty("transform");
          frame = null;
          return;
        }
        const rect = section.current.getBoundingClientRect();
        const travel = track.current.scrollWidth - innerWidth;
        const progress = Math.max(
          0,
          Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)),
        );
        track.current.style.transform = `translate3d(${-travel * progress}px,0,0)`;
        frame = null;
      });
    };
    const onResize = () => update();
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      track.current?.style.removeProperty("transform");
    };
  }, []);
  return (
    <section ref={section} className="relative py-1 md:h-[420vh] md:py-0">
      <div className="md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div
          ref={track}
          className="mobile-swipe flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 md:h-full md:w-max md:snap-none md:items-stretch md:overflow-visible md:px-0 md:will-change-transform"
        >
          {items.map((item, index) => (
            <figure
              key={item.id}
              data-cursor
              className="group relative m-0 h-[68svh] w-[88vw] shrink-0 snap-center overflow-hidden bg-[#222] md:h-full md:w-[72vw] lg:w-[58vw]"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover md:grayscale md:transition-transform md:duration-500 md:group-hover:scale-[1.035] md:group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              <figcaption className="absolute inset-x-5 bottom-6 flex items-end justify-between md:inset-x-10 md:bottom-10">
                <div>
                  <span className={eyebrow}>
                    {String(index + 1).padStart(2, "0")} / {item.category}
                  </span>
                  <h2 className="mt-3 font-display text-4xl tracking-[-.05em] md:text-7xl">
                    {item.title}
                  </h2>
                </div>
                <span className="font-display text-2xl italic text-white/60 md:text-3xl">
                  {item.year}
                </span>
              </figcaption>
              {item.type === "video" && (
                <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 md:size-20 md:backdrop-blur-md">
                  <Play size={18} fill="currentColor" />
                </span>
              )}
            </figure>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 py-5 text-[8px] uppercase tracking-[.2em] text-[#8e8980] md:hidden">
          Swipe through projects <ArrowRight size={14} />
        </div>
      </div>
    </section>
  );
}

function EditorialProject({
  item,
  index,
  onPlay,
  onView,
}: {
  item: Project;
  index: number;
  onPlay?: () => void;
  onView?: () => void;
}) {
  const layouts = [
    "col-span-2 md:col-span-5 md:row-span-2",
    "col-span-1 md:col-span-3 md:row-span-2",
    "col-span-1 md:col-span-4 md:row-span-2",
    "col-span-2 md:col-span-4 md:row-span-2",
    "col-span-1 md:col-span-3 md:row-span-2",
    "col-span-1 md:col-span-5 md:row-span-2",
    "col-span-2 md:col-span-6 md:row-span-3",
    "col-span-2 md:col-span-6 md:row-span-3",
  ];
  const action = onPlay ?? onView;
  return (
    <figure
      data-cursor
      className={`${layouts[index % layouts.length] ?? layouts[0]} archive-tile group relative m-0 min-h-[270px] overflow-hidden bg-[#222] sm:min-h-[340px] md:min-h-0`}
    >
      <img
        src={item.image}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover md:grayscale md:transition-[transform,filter] md:duration-300 md:ease-out md:group-hover:scale-[1.02] md:group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {action && (
        <button
          type="button"
          onClick={action}
          className={`absolute inset-0 z-10 ${onPlay ? "cursor-pointer" : "cursor-zoom-in"}`}
          aria-label={`${onPlay ? "Play" : "View"} ${item.title}`}
        >
          {onPlay && (
            <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-black/20 backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-white group-hover:text-black">
              <Play size={16} fill="currentColor" />
            </span>
          )}
        </button>
      )}
      <figcaption className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-end justify-between md:inset-x-5 md:bottom-5">
        <div>
          <span className="text-[7px] uppercase tracking-[.16em] text-white/60 md:text-[8px]">
            {item.category}
          </span>
          <h3 className="mt-1 max-w-28 font-display text-xl leading-none md:mt-2 md:max-w-none md:text-3xl">
            {item.title}
          </h3>
        </div>
        <div className="grid size-8 shrink-0 place-items-center rounded-full border border-white/40 transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black md:size-10">
          {item.type === "video" ? (
            <Play size={13} fill="currentColor" />
          ) : (
            <ArrowUpRight size={14} />
          )}
        </div>
      </figcaption>
    </figure>
  );
}

function VideoViewer({
  src,
  poster,
  title,
  onClose,
}: {
  src: string;
  poster: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${title}`}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/95 p-4 md:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center text-white transition hover:bg-white/15"
        aria-label="Close video"
      >
        <X size={20} />
      </button>
      <figure
        className="m-0 flex h-full max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="min-h-0 max-h-[calc(100vh-6rem)] max-w-full bg-black object-contain"
        />
        <figcaption className="mt-3 text-[10px] uppercase tracking-[.18em] text-white/70">
          {title} · 1080p
        </figcaption>
      </figure>
    </div>
  );
}

function FeaturedProjectCard({
  item,
  onClick,
}: {
  item: Project;
  onClick: () => void;
}) {
  const [src, setSrc] = useState(item.image);
  return (
    <article className="group w-[76vw] shrink-0 snap-center md:w-auto">
      <button
        type="button"
        onClick={onClick}
        className="block w-full cursor-zoom-in text-left"
        aria-label={`View ${item.title}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#23221f] md:aspect-square">
          <img
            src={src}
            onError={() => setSrc(heroPortrait)}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover md:grayscale md:transition md:duration-500 md:group-hover:scale-[1.04] md:group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute inset-x-5 bottom-4 flex translate-y-0 items-end justify-between opacity-100 transition md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <div>
              <h3 className="font-display text-xl">{item.title}</h3>
              <span className="text-[8px] uppercase tracking-[.12em] text-white/70">
                {item.category}
              </span>
            </div>
            <span className="text-[8px] tracking-[.1em] text-white/70">
              {item.year}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

function Footer() {
  return (
    <footer id="contact" className="border-t border-white/15">
      <div
        className={`${wrap} grid grid-cols-2 gap-x-5 gap-y-10 py-14 md:grid-cols-[1.25fr_1.45fr_1fr_1.1fr_auto]`}
      >
        <div className="col-span-2 md:col-span-1">
          <img
            src={logo}
            alt="Aghimuan Creatives"
            loading="lazy"
            decoding="async"
            className="h-16 w-32 object-contain"
          />
          <p className="mt-4 font-display italic text-[#79766f]">
            Photography, video, editing, and design.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2 break-words text-[11px] text-[#aaa69d]">
          <span className={eyebrow}>Contact</span>
          <a href="mailto:camarashawnjames@gmail.com">
            camarashawnjames@gmail.com
          </a>
          <a href="mailto:aghimuanfilms@gmail.com">aghimuanfilms@gmail.com</a>
          <a href="tel:+639995606454">+63 999 560 6454</a>
        </div>
        <div className="flex flex-col gap-2 text-[11px] text-[#aaa69d]">
          <span className={eyebrow}>Location</span>
          <span>Quezon City, Philippines</span>
          <span>Available for freelance work</span>
        </div>
        <div>
          <span className={eyebrow}>Links</span>
          <div className="mt-4 flex flex-col items-start gap-3 text-[11px] text-[#aaa69d]">
            {socials.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="hover:text-white"
              >
                {label}
              </a>
            ))}
            <a href={cv} download className="hover:text-white">
              Download CV
            </a>
          </div>
        </div>
        <a
          href="mailto:camarashawnjames@gmail.com"
          className={`${button} col-span-2 justify-center self-start md:col-span-1`}
        >
          Send an inquiry <ArrowUpRight size={14} />
        </a>
      </div>
      <div
        className={`${wrap} flex justify-between border-t border-white/15 py-4 text-[8px] uppercase tracking-[.12em] text-[#79766f]`}
      >
        <span>© {new Date().getFullYear()} Aghimuan Creatives</span>
        <span>Quezon City, Philippines</span>
      </div>
    </footer>
  );
}
