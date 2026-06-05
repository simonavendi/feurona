(function () {
  const CDN = "../cdn.myportfolio.com/8f9e97e6-b4e9-4f72-a8ba-dc4a7e833406";
  const LOGO = `${CDN}/7d88e3ff-c57a-4cc4-aa43-afb505810f66_rwc_0x0x700x700x40969014.png`;

  function projectSlug(href) {
    return href.replace(/\.html$/, "");
  }

  function getAssetBase() {
    const link = document.querySelector('link[href*="portfolio.css"]');
    if (!link) return "";
    const href = link.getAttribute("href") || "";
    const distIndex = href.indexOf("dist/");
    return distIndex === -1 ? "" : href.slice(0, distIndex);
  }

  function assetUrl(relativePath) {
    const clean = relativePath.replace(/^\//, "");
    return `${getAssetBase()}${clean}`;
  }

  function projectImage(href, imagePath) {
    if (imagePath) return imagePath;
    return `dist/images/projects/${projectSlug(href)}.jpg`;
  }

  function displayTitle(rawTitle) {
    return (rawTitle || "")
      .replace(/^Feurona\s*[-—]\s*/i, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .trim();
  }

  const projectsBySlug = new Map();
  let projectDetails = {};
  let registryPromise = null;

  function ensureProjectRegistry() {
    if (!registryPromise) {
      registryPromise = loadProjectRegistry().catch((err) => {
        registryPromise = null;
        throw err;
      });
    }
    return registryPromise;
  }

  function normalizeProject(entry, slug) {
    const details = projectDetails[slug] || {};
    const image = entry.image || projectImage(entry.href || `${slug}.html`, null);
    const gallery =
      details.gallery || entry.gallery || (image ? [image] : [`dist/images/projects/${slug}.jpg`]);
    return {
      slug,
      title: displayTitle(entry.title || slug),
      desc: details.desc || entry.desc || "",
      image,
      gallery,
      previewFit: details.previewFit || entry.previewFit || "",
    };
  }

  function getRegistryProject(slug) {
    return projectsBySlug.get(slug) || null;
  }

  function projectFromCarouselItem(item) {
    if (item.modalSlug) return getRegistryProject(item.modalSlug) || normalizeProject(item, item.modalSlug);
    if (item.href && !item.external && !/^https?:\/\//i.test(item.href)) {
      const slug = projectSlug(item.href);
      return getRegistryProject(slug) || normalizeProject(item, slug);
    }
    return null;
  }

  function isInternalPortfolioHref(href) {
    return Boolean(href && !/^https?:\/\//i.test(href) && /\.html$/i.test(href));
  }

  const featuredWebsiteProjects = [
    {
      title: "Amare",
      href: "https://amarespa.com/",
      external: true,
      image: "dist/images/projects/amare.jpg",
      desc: "E-commerce website for Amare Spa Therapy — clean product-focused layout, Bulgarian storefront, and brand-led UX for professional beauty cosmetics.",
    },
    {
      title: "Zodiatherapy",
      href: "https://zodiatherapy.com/",
      external: true,
      image: "dist/images/projects/zodiatherapy.jpg",
      desc: "Luxury e-commerce for zodiac-themed gift boxes — personalized product curation, premium brand identity, and a warm, high-conversion storefront.",
    },
    {
      title: "Storyland",
      href: "https://www.storyland.bg/",
      external: true,
      image: "dist/images/projects/storyland.jpg",
      desc: "Personalized children's book platform — fairytale landing experience, name-driven book creation flow, and a warm, family-friendly Bulgarian storefront.",
    },
    {
      title: "UEBN · UE Varna",
      href: "https://uebn.ue-varna.bg/",
      external: true,
      image: "dist/images/projects/uebn.jpg",
      desc: "UEBN (UE Varna) website — UI/UX support and online presence design for an educational platform.",
    },
  ];

  const featuredAppsProjects = [
    {
      title: "Час За",
      modalSlug: "chas-za",
      href: "chas-za.html",
      image: "dist/images/projects/chas-za-logo.png",
      previewFit: "contain",
      gallery: [
        "dist/images/projects/chas-za-logo.png",
        "dist/images/projects/chas-za/03-Intro 1  [intro_always] [statusbar_light]].png",
        "dist/images/projects/chas-za/04-Intro 2 [statusbar_light].png",
        "dist/images/projects/chas-za/05-Intro 3 [statusbar_light].png",
        "dist/images/projects/chas-za/07-Job Details.png",
        "dist/images/projects/chas-za/09-Profile.png",
        "dist/images/projects/chas-za/21-schedule-1.png",
        "dist/images/projects/chas-za/22-schedule.png",
        "dist/images/projects/chas-za/23-Бизнес профил.png",
        "dist/images/projects/chas-za/17-business.png",
      ],
      desc: "End-to-end UX/UI and branding for a Bulgarian appointment-booking app — onboarding, business profiles, scheduling, and a calm mobile-first experience for salons and service providers.",
    },
  ];

  const featuredInstagramProjects = [
    {
      title: "@uevarna",
      href: "https://www.instagram.com/uevarna/",
      external: true,
      image: "dist/images/projects/uebn.jpg",
      video: "dist/videos/uevarna-screen-recording.mp4",
      instagramIcon: true,
      desc: "Instagram content produced by me for UEV (UE Varna).",
    },
    {
      title: "@zodiatherapy",
      href: "https://www.instagram.com/zodiatherapy/",
      external: true,
      image: "dist/images/projects/zodiatherapy.jpg",
      video: "dist/videos/zodiatherapy-screen-recording.mp4",
      instagramIcon: true,
      desc: "Instagram content produced by me for Zodiatherapy.",
    },
  ];

  const careerCompany = {
    company: "University of Economics — Varna",
    years: 5,
    startLabel: "2021",
    endLabel: "Present",
    bars: 5,
    link: "https://www.ue-varna.bg/",
    portfolioLink: { slug: "ue-varna", text: "See UEV portfolio" },
    desc: "Print and digital materials for institutional communication — from admissions campaigns to academic publications and event branding. I also create university presentations, support the university's apps and websites, and work on its overall online presence. I collaborate with the marketing team on Meta + Google campaigns and podcasts (Ux/UI podcast), including video editing and content posting. We analyze results together and build full marketing plans—many times I lead the strategy. I'm currently a Master's marketing student.",
    bullets: [
      "Great presenter: confident communication in meetings and presentations",
      "Interested in user psychology",
      "Huge interest in building apps and websites",
      "Strong understanding of Human-Centered Design principles, UX methodologies, and user research",
      "Hands-on experience across the full UX process—from information architecture and journey mapping to personas, wireframes, prototypes, and interactive design",
      "Experience working with international teams and global enterprise products",
      'Worked closely with a marketing team on Meta/Google campaigns, podcasts (Ux/UI <a href="https://www.youtube.com/watch?v=bP4NODrFjzA" target="_blank" rel="noopener noreferrer">podcast</a>), video editing, and content posting',
      "Analyze performance and build full marketing plans (often leading)",
      "Presented at Erasmus universities across Europe and coordinated with their marketing teams; strong references from Newton University Prague team",
    ],
    roles: [
      { title: "Graphic Designer — FIL Advertising Agency", period: "2026 — Present", link: "http://www.filbg.com/" },
      { title: "Graphic Designer — UE Varna", period: "2021 — Present", link: "https://ue-varna.bg/" },
      { title: "Freelance Graphic Designer", period: "2021 — Present" },
      { title: "Studio Bonbon LTD — Graphic & Interior Design", period: "Previous", link: "https://www.bonbon.studio/" },
      { title: "Bultag LTD — Web Design & Marketing", period: "Previous", link: "https://bultag.com/" },
      { title: "CARROT LTD — Illustrations & Prepress Internship", period: "Previous", link: "https://carrot-bg.com/" },
    ],
  };

  const greetings = ["Hello.", "Hi.", "Hey."];
  const taglines = [
    "I design meaningful visuals.",
    "I craft brand experiences.",
    "I build clean interfaces.",
  ];

  let greetingIndex = 0;
  let taglineIndex = 0;

  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function $$(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function initCarousel(root, projects, itemLabel = "Project") {
    if (!root || !projects.length) return;

    let index = 0;
    const stage = root.querySelector(".carousel-stage");
    const dotsEl = root.querySelector(".carousel-dots");
    const prevBtn = root.querySelector(".carousel-btn.prev");
    const nextBtn = root.querySelector(".carousel-btn.next");
    const controls = root.querySelector(".carousel-controls");
    if (!stage || !dotsEl) return;

    if (projects.length === 1) {
      if (controls) controls.hidden = true;
      dotsEl.hidden = true;
    }

    function projectLinkAttrs(project) {
      if (project.external || /^https?:\/\//i.test(project.href)) {
        return `href="${project.href}" target="_blank" rel="noopener noreferrer"`;
      }
      return `href="${project.href}"`;
    }

    function renderProjectViewControl(project) {
      const modalProject = projectFromCarouselItem(project);
      if (modalProject) {
        return `<button type="button" class="project-card-link" data-open-project="${modalProject.slug}">View ↗</button>`;
      }
      return `<a class="project-card-link" ${projectLinkAttrs(project)}>View ↗</a>`;
    }

    const INSTAGRAM_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`;
    const galleryIndices = new Map();

    function getProjectGallery(project) {
      if (Array.isArray(project.gallery) && project.gallery.length) return project.gallery;
      if (project.image && !project.image.includes("placeholder")) return [project.image];
      return [];
    }

    function getGalleryIndex(projectIndex, galleryLength) {
      const current = galleryIndices.get(projectIndex) || 0;
      if (!galleryLength) return 0;
      return ((current % galleryLength) + galleryLength) % galleryLength;
    }

    function renderPreview(project, imgSrc) {
      const fitClass = project.previewFit === "contain" ? " project-card-cover--contain" : "";
      if (project.video) {
        const posterAttr = project.image ? ` poster="${imgSrc}"` : "";
        return `<video class="project-card-cover project-card-video" src="${assetUrl(project.video)}"${posterAttr} autoplay muted loop playsinline aria-label="${project.title} video preview"></video>`;
      }
      return `<img class="project-card-cover${fitClass}" src="${imgSrc}" alt="${project.title}" loading="lazy" />`;
    }

    function renderGalleryNav(project, projectIndex, isActive) {
      const gallery = getProjectGallery(project);
      if (gallery.length <= 1) return "";
      const galleryIndex = getGalleryIndex(projectIndex, gallery.length);
      return `
          <div class="project-card-gallery-nav"${isActive ? "" : ' hidden'}>
            <button type="button" class="carousel-btn prev project-card-gallery-prev" aria-label="Previous preview for ${project.title}">←</button>
            <span class="project-card-gallery-count" aria-live="polite">${galleryIndex + 1} / ${gallery.length}</span>
            <button type="button" class="carousel-btn next project-card-gallery-next" aria-label="Next preview for ${project.title}">→</button>
          </div>`;
    }

    function bindGalleryNav(wrap, project, projectIndex) {
      const gallery = getProjectGallery(project);
      if (gallery.length <= 1) return;

      const prevGal = wrap.querySelector(".project-card-gallery-prev");
      const nextGal = wrap.querySelector(".project-card-gallery-next");
      const countEl = wrap.querySelector(".project-card-gallery-count");
      const cover = wrap.querySelector(".project-card-cover");

      const updateGalleryPreview = () => {
        const galleryIndex = getGalleryIndex(projectIndex, gallery.length);
        if (cover?.tagName === "IMG") {
          cover.src = assetUrl(gallery[galleryIndex]);
        }
        if (countEl) countEl.textContent = `${galleryIndex + 1} / ${gallery.length}`;
      };

      const stepGallery = (delta) => (e) => {
        e.stopPropagation();
        const galleryIndex = getGalleryIndex(projectIndex, gallery.length);
        galleryIndices.set(projectIndex, (galleryIndex + delta + gallery.length) % gallery.length);
        updateGalleryPreview();
      };

      prevGal?.addEventListener("click", stepGallery(-1));
      nextGal?.addEventListener("click", stepGallery(1));
      wrap.querySelector(".project-card-gallery-nav")?.addEventListener("click", (e) => e.stopPropagation());
    }

    function renderInstagramIcon(project) {
      if (!project.instagramIcon) return "";
      return `<a class="project-card-instagram" ${projectLinkAttrs(project)} aria-label="View ${project.title} on Instagram">${INSTAGRAM_ICON_SVG}</a>`;
    }

    function renderCarousel() {
      stage.innerHTML = "";
      projects.forEach((project, i) => {
        const offset = i - index;
        const abs = Math.abs(offset);
        const wrap = document.createElement("div");
        wrap.className = "carousel-card-wrap";
        wrap.style.zIndex = String(30 - abs * 10);
        wrap.style.opacity = abs > 2 ? "0" : String(1 - abs * 0.29);
        wrap.style.filter = abs ? `blur(${abs * 10}px)` : "none";
        wrap.style.pointerEvents = offset === 0 ? "auto" : offset === 1 || offset === -1 ? "auto" : "none";
        wrap.style.transform = `translateX(calc(-50% + ${offset * 72}%)) scale(${offset ? 0.86 : 1}) rotateY(${offset * -10}deg)`;
        if (offset !== 0) {
          wrap.setAttribute("role", "button");
          wrap.tabIndex = 0;
          wrap.addEventListener("click", () => {
            index = i;
            renderCarousel();
            renderDots();
          });
        }

        const gallery = getProjectGallery(project);
        const galleryIndex = getGalleryIndex(i, gallery.length);
        const previewImage = gallery[galleryIndex] || project.image;
        const imgSrc = assetUrl(
          previewImage?.includes("placeholder")
            ? projects.find((p) => !p.image.includes("placeholder"))?.image || LOGO
            : previewImage || project.image
        );

        wrap.innerHTML = `
        <article class="project-card${gallery.length > 1 ? " project-card--has-gallery" : ""}">
          <div class="project-card-top">
            <div class="project-card-preview">
              ${renderPreview(project, imgSrc)}
              ${renderInstagramIcon(project)}
            </div>
            ${renderProjectViewControl(project)}
          </div>
          <div class="project-card-body">
            <p class="project-card-index">${String(i + 1).padStart(2, "0")} / ${itemLabel}</p>
            <h3 class="project-card-title">${project.title}</h3>
            <p class="project-card-desc">${project.desc}</p>
          </div>
          ${renderGalleryNav(project, i, offset === 0)}
        </article>`;
        wrap.querySelector(".project-card-instagram")?.addEventListener("click", (e) => e.stopPropagation());
        if (offset === 0) bindGalleryNav(wrap, project, i);
        stage.appendChild(wrap);
      });
    }

    function renderDots() {
      dotsEl.innerHTML = projects
        .map(
          (_, i) => `
      <button type="button" class="carousel-dot-btn" aria-label="Show ${projects[i].title}">
        <span class="carousel-dot ${i === index ? "active" : ""}"></span>
      </button>`
        )
        .join("");
      $$(".carousel-dot-btn", dotsEl).forEach((btn, i) => {
        btn.addEventListener("click", () => {
          index = i;
          renderCarousel();
          renderDots();
        });
      });
    }

    prevBtn?.addEventListener("click", () => {
      index = (index - 1 + projects.length) % projects.length;
      renderCarousel();
      renderDots();
    });
    nextBtn?.addEventListener("click", () => {
      index = (index + 1) % projects.length;
      renderCarousel();
      renderDots();
    });

    renderCarousel();
    renderDots();
  }

  function initCarousels() {
    initCarousel($("#websites"), featuredWebsiteProjects, "Project");
    initCarousel($("#apps"), featuredAppsProjects, "App");
    initCarousel($("#instagram"), featuredInstagramProjects, "Page");
  }

  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".reveal, .marquee-section").forEach((el) => observer.observe(el));
  }

  function initNav() {
    const sections = [
      { id: "hero", label: "Home" },
      { id: "about", label: "About" },
      { id: "websites", label: "Work" },
      { id: "portfolio", label: "Work" },
      { id: "instagram", label: "Work" },
      { id: "contact", label: "Contact" },
    ];

    const navSectionId = (id) => (id === "portfolio" || id === "instagram" ? "websites" : id);

    const sideNav = $(".side-nav");
    const mobileNav = $(".mobile-nav");
    const sideBtns = $$(".side-nav .nav-btn");
    const mobileBtns = $$(".mobile-nav .nav-btn");

    function setActive(sectionId) {
      sideBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === sectionId);
        btn.setAttribute("aria-current", btn.dataset.section === sectionId ? "page" : "false");
      });
      mobileBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === sectionId);
        btn.setAttribute("aria-current", btn.dataset.section === sectionId ? "page" : "false");
      });
    }

    function scrollToSection(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    [...sideBtns, ...mobileBtns].forEach((btn) => {
      btn.addEventListener("click", () => scrollToSection(btn.dataset.section));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          .forEach((entry) => setActive(navSectionId(entry.target.id)));
      },
      { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -55% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener(
      "scroll",
      () => {
        const show = window.scrollY > window.innerHeight * 0.35;
        sideNav.classList.toggle("visible", show);
        mobileNav.classList.toggle("visible", show);
      },
      { passive: true }
    );
  }

  function initHero() {
    const greetingEl = $(".hero-greeting-text");
    const taglineEl = $(".hero-tagline-text");
    const greetingBtn = $(".hero-greeting-btn");

    function cycleGreeting() {
      greetingIndex = (greetingIndex + 1) % greetings.length;
      taglineIndex = (taglineIndex + 1) % taglines.length;
      if (greetingEl) greetingEl.textContent = greetings[greetingIndex];
      if (taglineEl) taglineEl.textContent = taglines[taglineIndex];
    }

    greetingBtn?.addEventListener("click", cycleGreeting);
    setInterval(cycleGreeting, 5000);
  }

  const PORTFOLIO_INITIAL_COUNT = 10;

  function renderPortfolioItem(p, hidden) {
    const slug = projectSlug(p.href);
    const title = displayTitle(p.title);
    return `
        <button type="button" class="portfolio-item${hidden ? " portfolio-item--hidden" : ""}" data-open-project="${slug}" aria-label="Open ${title}">
          <img src="${assetUrl(p.image)}" alt="${title}" loading="lazy" decoding="async" />
          <div class="portfolio-item-overlay">
            <span class="portfolio-item-title">${p.title}</span>
          </div>
        </button>`;
  }

  async function loadProjectRegistry() {
    const [projectsRes, detailsRes] = await Promise.all([
      fetch(assetUrl("dist/js/projects-data.json")),
      fetch(assetUrl("dist/js/project-details.json")),
    ]);
    if (!projectsRes.ok) throw new Error("projects-data.json failed");
    const projects = await projectsRes.json();
    if (detailsRes.ok) projectDetails = await detailsRes.json();
    projectsBySlug.clear();
    projects.forEach((p) => {
      const slug = projectSlug(p.href);
      projectsBySlug.set(slug, normalizeProject(p, slug));
    });
    featuredAppsProjects.forEach((p) => {
      if (!p.modalSlug) return;
      projectsBySlug.set(
        p.modalSlug,
        normalizeProject(
          {
            title: p.title,
            href: `${p.modalSlug}.html`,
            image: p.image,
            gallery: p.gallery,
            desc: p.desc,
            previewFit: p.previewFit,
          },
          p.modalSlug
        )
      );
    });
    return projects;
  }

  async function initPortfolioGrid() {
    const grid = $(".portfolio-grid");
    const moreWrap = $(".portfolio-grid-more");
    const countEl = $("#portfolio-count");
    if (!grid) return;
    try {
      const projects = await ensureProjectRegistry();
      const hasMore = projects.length > PORTFOLIO_INITIAL_COUNT;

      if (countEl) {
        countEl.textContent = `${projects.length} selected works`;
      }

      grid.innerHTML = projects
        .map((p, i) => renderPortfolioItem(p, hasMore && i >= PORTFOLIO_INITIAL_COUNT))
        .join("");

      if (moreWrap) {
        moreWrap.innerHTML = "";
        if (hasMore) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "primary-btn portfolio-view-more";
          btn.textContent = `View more (${projects.length - PORTFOLIO_INITIAL_COUNT})`;
          btn.addEventListener("click", () => {
            $$(".portfolio-item--hidden", grid).forEach((item) => item.classList.remove("portfolio-item--hidden"));
            moreWrap.innerHTML = "";
          });
          moreWrap.appendChild(btn);
        }
      }
    } catch (e) {
      grid.innerHTML = `<p style="color:rgba(0,0,0,.5);font-weight:600;">Portfolio loading…</p>`;
      if (moreWrap) moreWrap.innerHTML = "";
    }
  }

  function renderCareer() {
    const data = careerCompany;
    const left = $(".career-left");
    if (!left || !data) return;

    const linkHtml = data.link
      ? `<a class="career-link" href="${data.link}" target="_blank" rel="noopener noreferrer">Site ↗</a>`
      : "";

    const portfolioBtnHtml = data.portfolioLink
      ? `<button type="button" class="primary-btn career-portfolio-btn" data-open-project="${data.portfolioLink.slug}">${data.portfolioLink.text}</button>`
      : "";

    const bars = Array.from({ length: 9 }, (_, i) => {
      const active = i >= 9 - data.bars;
      const label = i === 0 ? data.startLabel : i === 8 ? data.endLabel : "&nbsp;";
      return `
        <div class="career-bar-col">
          <div class="career-bar"><div class="career-bar-fill ${active ? "active" : ""}"></div></div>
          <span class="career-bar-label">${label}</span>
        </div>`;
    }).join("");

    left.innerHTML = `
      <div class="career-header">
        <div>
          <p class="career-label">Corporate Experience</p>
          <p class="career-company">${data.company}</p>
        </div>
        ${linkHtml}
      </div>
      <div class="career-bars">${bars}</div>
      <p class="career-years">
        <span class="career-years-num">${data.years}</span>
        <span class="career-years-text">years at ${data.company.split(" — ")[0]}</span>
      </p>
      <div class="career-desc">${data.desc}</div>
      <p class="career-list-label">This gave me strong experience with:</p>
      <ul class="career-list">${data.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      ${portfolioBtnHtml}`;

    const timeline = $(".timeline-items");
    if (timeline) {
      timeline.innerHTML = data.roles
        .map(
          (role, i) => `
        <div class="timeline-item ${i === 0 ? "active" : ""}" tabindex="0">
          <span class="timeline-dot"><span class="timeline-dot-inner"></span></span>
          <div class="timeline-content">
            <div class="timeline-row">
              <p class="timeline-date">${role.period}</p>
              <p class="timeline-role">${
                role.link
                  ? `<a class="timeline-role-link" href="${role.link}" target="_blank" rel="noopener noreferrer">${role.title}</a>`
                  : role.title
              }</p>
            </div>
          </div>
        </div>`
        )
        .join("");
      $$(".timeline-item", timeline).forEach((item) => {
        item.addEventListener("click", () => {
          $$(".timeline-item", timeline).forEach((el) => el.classList.remove("active"));
          item.classList.add("active");
          updateTimelineProgress();
        });
      });
      $$(".timeline-role-link", timeline).forEach((link) => {
        link.addEventListener("click", (e) => e.stopPropagation());
      });
      updateTimelineProgress();
    }
  }

  function updateTimelineProgress() {
    const progress = $(".timeline-progress");
    const line = $(".timeline-line");
    const items = $$(".timeline-item");
    if (!progress || !line || !items.length) return;
    const active = $(".timeline-item.active") || items[items.length - 1];
    const lineRect = line.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const height = activeRect.top + activeRect.height / 2 - lineRect.top;
    progress.style.height = `${Math.max(0, height)}px`;
  }

  function initCareer() {
    renderCareer();
    window.addEventListener("resize", updateTimelineProgress);
  }

  let modalGalleryIndex = 0;
  let modalProject = null;

  function parseProjectHash() {
    const match = location.hash.match(/^#project\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setProjectHash(slug) {
    const base = location.pathname + location.search;
    if (slug) {
      history.replaceState(null, "", `${base}#project/${encodeURIComponent(slug)}`);
    } else if (/^#project\//.test(location.hash)) {
      history.replaceState(null, "", base);
    }
  }

  function lockBodyScroll(lock) {
    document.body.classList.toggle("project-modal-open", lock);
  }

  function getModalGallery(project) {
    if (!project) return [];
    if (Array.isArray(project.gallery) && project.gallery.length) return project.gallery;
    if (project.image) return [project.image];
    return [`dist/images/projects/${project.slug}.jpg`, `dist/images/projects/${project.slug}.png`];
  }

  function renderModalSlide() {
    const modal = $("#project-modal");
    if (!modal || !modalProject) return;

    const gallery = getModalGallery(modalProject);
    const total = gallery.length;
    const index = total ? ((modalGalleryIndex % total) + total) % total : 0;
    modalGalleryIndex = index;

    const titleEl = $("#project-modal-title");
    const descEl = $("#project-modal-desc");
    const imgEl = $(".project-modal-image", modal);
    const counterEl = $(".project-modal-counter", modal);
    const prevBtn = $(".project-modal-nav.prev", modal);
    const nextBtn = $(".project-modal-nav.next", modal);
    const stage = $(".project-modal-stage", modal);

    if (titleEl) titleEl.textContent = modalProject.title;
    if (descEl) {
      if (modalProject.desc) {
        descEl.textContent = modalProject.desc;
        descEl.hidden = false;
      } else {
        descEl.textContent = "";
        descEl.hidden = true;
      }
    }

    if (stage) {
      stage.classList.toggle("project-modal-stage--contain", modalProject.previewFit === "contain");
    }

    if (imgEl && total) {
      const path = gallery[index];
      imgEl.alt = modalProject.title;
      imgEl.removeAttribute("srcset");
      imgEl.onload = () => imgEl.classList.add("is-loaded");
      imgEl.onerror = () => {
        if (index === 0 && modalProject.image && path !== modalProject.image) {
          imgEl.src = assetUrl(modalProject.image);
          return;
        }
        imgEl.classList.add("is-error");
      };
      imgEl.classList.remove("is-loaded", "is-error");
      imgEl.src = assetUrl(path);
    }

    if (counterEl) counterEl.textContent = total > 1 ? `${index + 1} / ${total}` : "";
    if (prevBtn) prevBtn.hidden = total <= 1;
    if (nextBtn) nextBtn.hidden = total <= 1;
  }

  function stepModalGallery(delta) {
    const gallery = getModalGallery(modalProject);
    if (gallery.length <= 1) return;
    modalGalleryIndex = (modalGalleryIndex + delta + gallery.length) % gallery.length;
    renderModalSlide();
  }

  function resolveModalProject(slugOrProject) {
    if (typeof slugOrProject !== "string") return slugOrProject;
    const registered = getRegistryProject(slugOrProject);
    if (registered) return registered;
    return normalizeProject(
      {
        href: `${slugOrProject}.html`,
        image: `dist/images/projects/${slugOrProject}.jpg`,
        title: slugOrProject,
      },
      slugOrProject
    );
  }

  function openProjectModal(slugOrProject) {
    ensureProjectRegistry()
      .catch(() => {})
      .finally(() => {
        const project = resolveModalProject(slugOrProject);
        if (!project) return;

        const modal = $("#project-modal");
        if (!modal) return;

        modalProject = project;
        modalGalleryIndex = 0;
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        lockBodyScroll(true);
        renderModalSlide();
        setProjectHash(project.slug);
        $(".project-modal-close", modal)?.focus();
      });
  }

  function closeProjectModal() {
    const modal = $("#project-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    lockBodyScroll(false);
    modalProject = null;
    setProjectHash(null);
  }

  function initProjectModal() {
    const modal = $("#project-modal");
    if (!modal) return;

    $(".project-modal-close", modal)?.addEventListener("click", closeProjectModal);
    $(".project-modal-backdrop", modal)?.addEventListener("click", closeProjectModal);
    $(".project-modal-nav.prev", modal)?.addEventListener("click", () => stepModalGallery(-1));
    $(".project-modal-nav.next", modal)?.addEventListener("click", () => stepModalGallery(1));

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") closeProjectModal();
      if (e.key === "ArrowLeft") stepModalGallery(-1);
      if (e.key === "ArrowRight") stepModalGallery(1);
    });

    window.addEventListener("hashchange", () => {
      const slug = parseProjectHash();
      if (slug) openProjectModal(slug);
      else if (!modal.hidden) closeProjectModal();
    });
  }

  function initContact() {
    const email = "feurona@gmail.com";
    $(".copy-email-btn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
        const btn = $(".copy-email-btn");
        if (btn) btn.setAttribute("aria-label", "Copied!");
        setTimeout(() => btn?.setAttribute("aria-label", "Copy email address"), 2000);
      } catch (_) {}
    });
    $(".say-hello-btn")?.addEventListener("click", () => {
      window.location.href = `mailto:${email}?subject=Hello%20Feurona`;
    });
    $(".back-top")?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  async function notifyNtfyVisit() {
    try {
      const url = "https://ntfy.sh/feurona123";
      const sessionKey = "feurona_ntfy_visit_sent_day";
      const day = new Date().toISOString().slice(0, 10);

      // Avoid spamming: only once per day per browser session/tab.
      if (sessionStorage.getItem(sessionKey) === day) return;
      sessionStorage.setItem(sessionKey, day);

      const payload = [
        `New website visit: ${location.origin}${location.pathname}${location.search}`,
        `Time: ${new Date().toISOString()}`,
        `Referrer: ${document.referrer || "-"}`,
        `User-Agent: ${navigator.userAgent}`,
      ].join("\n");

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: payload,
      });
    } catch (_) {
      // Ignore errors (CORS/network blockers shouldn't break the site).
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initNav();
    initHero();
    initProjectModal();
    initCarousels();
    initPortfolioGrid().finally(() => {
      const slug = parseProjectHash();
      if (slug) openProjectModal(slug);
    });
    initCareer();
    document.body.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-project]");
      if (!trigger || trigger.closest("#project-modal")) return;
      e.preventDefault();
      openProjectModal(trigger.getAttribute("data-open-project"));
    });
    initContact();
    notifyNtfyVisit();
    setTimeout(updateTimelineProgress, 800);
    const hash = window.location.hash;
    if (hash && !hash.startsWith("#project/")) {
      const target = document.querySelector(hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 300);
    }
  });
})();
