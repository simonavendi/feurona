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
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
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
      previewPosition: details.previewPosition || entry.previewPosition || "",
      previewScale: details.previewScale ?? entry.previewScale ?? null,
      modalLogo: details.modalLogo || details.logo || entry.modalLogo || entry.logo || "",
      modalTitle: displayTitle(details.modalTitle || entry.modalTitle || ""),
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

  function cdnToLocalMirror(url) {
    if (!url) return null;
    if (url.startsWith("../cdn.myportfolio.com/")) return url;
    const match = url.match(/cdn\.myportfolio\.com\/(.+)$/);
    return match ? `../cdn.myportfolio.com/${match[1]}` : null;
  }

  function getProjectCoverPath(project) {
    if (!project?.image) return null;
    return project.image;
  }

  function bindImageLoadState(img, opts = {}) {
    const host =
      opts.container ||
      img?.closest?.(".portfolio-item, .project-card-preview, .project-modal-stage") ||
      img?.parentElement;
    if (!img || !host) return () => {};

    const markLoaded = () => {
      img.classList.remove("is-loading");
      host.classList.remove("is-loading", "is-error");
      img.classList.remove("is-error");
      img.classList.add("is-loaded");
      opts.onLoad?.();
    };

    const markError = () => {
      if (opts.onError?.() === false) return;
      img.classList.remove("is-loading");
      host.classList.remove("is-loading");
      img.classList.remove("is-loaded");
      img.classList.add("is-error");
      host.classList.add("is-error");
    };

    img.classList.remove("is-loaded", "is-error");
    host.classList.remove("is-error");
    img.classList.add("is-loading");
    host.classList.add("is-loading");
    img.onload = markLoaded;
    img.onerror = markError;

    return () => {
      if (img.complete && img.naturalWidth) markLoaded();
      else if (img.complete && img.src) markError();
    };
  }

  function bindImageLoadStates(scope) {
    const root = scope || document;
    $$(".portfolio-item img, img.project-card-cover", root).forEach((img) => bindImageLoadState(img)());
  }

  const featuredWebsiteProjects = [
    {
      title: "Amare",
      href: "https://amarespa.com/",
      external: true,
      image: "dist/images/projects/amare-logo.svg",
      previewFit: "contain",
      desc: "E-commerce website for Amare Spa Therapy — clean product-focused layout, Bulgarian storefront, and brand-led UX for professional beauty cosmetics.",
    },
    {
      title: "Zodia Therapy",
      href: "https://zodiatherapy.com/",
      external: true,
      image: "dist/images/projects/zodiatherapy-logo.svg",
      previewFit: "contain",
      previewScale: 0.6,
      desc: "Luxury e-commerce for zodiac-themed gift boxes — personalized product curation, premium brand identity, and a warm, high-conversion storefront.",
    },
    {
      title: "Storyland",
      href: "https://www.storyland.bg/",
      external: true,
      image: "dist/images/projects/storyland-logo.svg",
      previewFit: "contain",
      desc: "Personalized children's book platform — fairytale landing experience, name-driven book creation flow, and a warm, family-friendly Bulgarian storefront.",
    },
    {
      title: "UEBN · UE Varna",
      href: "https://uebn.ue-varna.bg/",
      external: true,
      image: "dist/images/projects/uebn-logo.svg",
      previewFit: "contain",
      desc: "UEBN (UE Varna) website — UI/UX support and online presence design for an educational platform.",
    },
    {
      title: "Metrica Labs",
      href: "https://metrica-labs.vercel.app/",
      external: true,
      image: "dist/images/projects/metrica-logo.svg",
      previewFit: "contain",
      desc: "Metrica Labs website — product-focused landing experience and brand-led UX for a modern analytics and experimentation platform.",
    },
  ];

  const featuredAppsProjects = [
    {
      title: "helt.ty — Здраве. Ежедневно. Ти.",
      href: "https://heltty.vercel.app/",
      external: true,
      viewLabel: "APP simulation",
      image: "dist/images/projects/helt-ty-logo.png",
      previewFit: "contain",
      gallery: [
        "dist/images/projects/helt-ty/01-dashboard.png",
        "dist/images/projects/helt-ty/02-activity.png",
        "dist/images/projects/helt-ty/03-nutrition.png",
        "dist/images/projects/helt-ty/04-profile.png",
      ],
      desc: "Bulgarian health & wellness app UI — daily dashboard with steps, calories, and water, plus activity tracking, food diary with macros, and profile settings in a minimal iOS-style green theme.",
    },
    {
      title: "Час За (still under construction)",
      modalSlug: "chas-za",
      href: "chas-za.html",
      websiteUrl: "https://chas-za.vercel.app/",
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
      image: "dist/images/projects/ue-varna/Logo-UE_Blue.png",
      previewFit: "contain",
      instagramIcon: true,
      desc: "Instagram content produced by me for UEV (UE Varna).",
    },
    {
      title: "@zodiatherapy",
      href: "https://www.instagram.com/zodiatherapy/",
      external: true,
      image: "dist/images/projects/zodiatherapy-logo.svg",
      previewFit: "contain",
      previewScale: 0.6,
      instagramIcon: true,
      desc: "Instagram content produced by me for Zodiatherapy.",
    },
  ];

  const CAREER_UE_VARNA_INDEX = 1;

  const careerCompany = {
    roles: [
      {
        title: "Graphic Designer — FIL Advertising Agency",
        period: "2026 — Present",
        link: "http://www.filbg.com/",
        label: "Agency Experience",
        summary:
          "Creative design for FIL Advertising Agency across brand identity, campaign visuals, and client deliverables in print and digital. I work closely with account and creative leads to translate briefs into polished, on-brand assets on fast timelines. The role builds on my marketing and UX background—bringing clarity, consistency, and a user-aware eye to agency output.",
      },
      {
        id: "ue-varna",
        title: "Graphic Designer — UE Varna",
        period: "2021 — Present",
        link: "https://www.ue-varna.bg/",
        label: "Corporate Experience",
        company: "University of Economics — Varna",
        years: 5,
        startLabel: "2021",
        endLabel: "Present",
        bars: 5,
        portfolioLink: { slug: "ue-varna", text: "See UEV portfolio" },
        summary:
          "Print and digital materials for institutional communication—from admissions campaigns and academic publications to event branding. I create university presentations, support apps and websites, and shape the university's online presence. With the marketing team I run Meta and Google campaigns, <a href=\"https://www.youtube.com/watch?v=bP4NODrFjzA\" target=\"_blank\" rel=\"noopener noreferrer\">podcasts</a> (including Ux/UI), video, and content; we review performance and build marketing plans, and I often lead strategy.",
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
      },
      {
        title: "Freelance Graphic Designer",
        period: "2021 — Present",
        label: "Independent Work",
        summary:
          "Freelance graphic design for brands, startups, and individuals—logos, social kits, print, and light web visuals. I scope projects with clients, present concepts clearly, and iterate until the work fits brand and audience. Freelancing keeps my process flexible and sharp across industries while I grow agency and in-house experience.",
      },
      {
        title: "Studio Bonbon LTD — Graphic & Interior Design",
        period: "Previous",
        link: "https://www.bonbon.studio/",
        label: "Studio Experience",
        summary:
          "Graphic and interior design support at Studio Bonbon—visual systems, presentation materials, and spatial branding touches for client projects. I balanced aesthetic detail with practical production constraints and learned to align design choices with how spaces and materials read in the real world.",
      },
      {
        title: "Bultag LTD — Web Design & Marketing",
        period: "Previous",
        link: "https://bultag.com/",
        label: "Web & Marketing",
        summary:
          "Web design and marketing assets at Bultag—landing layouts, campaign graphics, and content that supported product and sales goals. I collaborated on messaging hierarchy and visual consistency across channels, gaining early experience connecting design decisions to conversion and brand trust.",
      },
      {
        title: "CARROT LTD — Illustrations & Prepress Internship",
        period: "Previous",
        link: "https://carrot-bg.com/",
        label: "Internship",
        summary:
          "Illustration and prepress internship at CARROT—preparing files for print, checking color and bleed, and supporting editorial-style illustration work. It grounded my technical foundation in production-ready artwork and attention to detail before client-facing roles.",
      },
    ],
  };

  let careerActiveIndex = CAREER_UE_VARNA_INDEX;

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

  function initCarousel(root, projects, itemLabel = "Project", viewBelowCard = false) {
    if (!root || !projects.length) return;

    let index = 0;
    const stage = root.querySelector(".carousel-stage");
    const dotsEl = root.querySelector(".carousel-dots");
    const prevBtn = root.querySelector(".carousel-btn.prev");
    const nextBtn = root.querySelector(".carousel-btn.next");
    const controls = root.querySelector(".carousel-controls");
    if (!stage || !dotsEl) return;

    if (viewBelowCard) {
      stage.classList.add("carousel-stage--view-below");
      dotsEl.classList.add("carousel-dots--view-below");
    }

    if (controls) controls.hidden = viewBelowCard || projects.length === 1;
    if (projects.length === 1) dotsEl.hidden = true;

    function projectLinkAttrs(project) {
      if (project.external || /^https?:\/\//i.test(project.href)) {
        return `href="${project.href}" target="_blank" rel="noopener noreferrer"`;
      }
      return `href="${project.href}"`;
    }

    function renderProjectViewControl(project, belowCard = false) {
      const modalProject = projectFromCarouselItem(project);
      const classes = belowCard ? "primary-btn project-card-view-btn" : "project-card-link";
      const label = project.viewLabel || "View ↗";
      if (modalProject) {
        return `<button type="button" class="${classes}" data-open-project="${modalProject.slug}">${label}</button>`;
      }
      return `<a class="${classes}" ${projectLinkAttrs(project)}>${label}</a>`;
    }

    function renderProjectWebsiteLink(project, belowCard = false) {
      if (!project.websiteUrl) return "";
      const classes = belowCard ? "project-card-website-btn" : "project-card-link";
      return `<a class="${classes}" href="${project.websiteUrl}" target="_blank" rel="noopener noreferrer">Website ↗</a>`;
    }

    function renderProjectCardActions(project, belowCard = false) {
      const view = renderProjectViewControl(project, belowCard);
      const website = renderProjectWebsiteLink(project, belowCard);
      if (!belowCard || !website) return view;
      return `<div class="project-card-actions">${view}${website}</div>`;
    }

    const INSTAGRAM_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`;

    function getCoverImage(project) {
      if (project.image && !project.image.includes("placeholder")) return project.image;
      if (Array.isArray(project.gallery) && project.gallery.length) return project.gallery[0];
      return project.image;
    }

    function getPreviewScaleAttrs(project) {
      return project.previewScale
        ? ` data-preview-scale="${project.previewScale}" style="--preview-scale: ${project.previewScale}"`
        : "";
    }

    function renderPreview(project, imgSrc) {
      const fitClass = project.previewFit === "contain" ? " project-card-cover--contain" : "";
      const posStyle = project.previewPosition
        ? ` style="object-position: ${project.previewPosition}"`
        : "";
      if (project.video) {
        const posterAttr = project.image ? ` poster="${imgSrc}"` : "";
        return `<video class="project-card-cover project-card-video" src="${assetUrl(project.video)}"${posterAttr} autoplay muted loop playsinline aria-label="${project.title} video preview"></video>`;
      }
      const logo = project.previewLogo
        ? `<img class="project-card-preview-logo" src="${assetUrl(project.previewLogo)}" alt="" aria-hidden="true" />`
        : "";
      return `<img class="project-card-cover${fitClass}" src="${imgSrc}" alt="${project.title}" loading="lazy"${posStyle} />${logo}`;
    }

    function renderProjectNav(isActive) {
      if (!viewBelowCard || projects.length <= 1) return "";
      return `
          <div class="project-card-gallery-nav"${isActive ? "" : ' hidden'}>
            <button type="button" class="carousel-btn prev project-card-gallery-prev" aria-label="Previous ${itemLabel.toLowerCase()}">←</button>
            <span class="project-card-gallery-count" aria-live="polite">${index + 1} / ${projects.length}</span>
            <button type="button" class="carousel-btn next project-card-gallery-next" aria-label="Next ${itemLabel.toLowerCase()}">→</button>
          </div>`;
    }

    function bindProjectNav(wrap) {
      if (!viewBelowCard || projects.length <= 1) return;

      const prevBtn = wrap.querySelector(".project-card-gallery-prev");
      const nextBtn = wrap.querySelector(".project-card-gallery-next");

      const stepProject = (delta) => (e) => {
        e.stopPropagation();
        index = (index + delta + projects.length) % projects.length;
        renderCarousel();
        renderDots();
      };

      prevBtn?.addEventListener("click", stepProject(-1));
      nextBtn?.addEventListener("click", stepProject(1));
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

        const coverImage = getCoverImage(project);
        const imgSrc = assetUrl(
          coverImage?.includes("placeholder")
            ? projects.find((p) => !p.image.includes("placeholder"))?.image || LOGO
            : coverImage
        );

        wrap.innerHTML = `
        <article class="project-card${viewBelowCard ? " project-card--view-below" : ""}">
          <div class="project-card-top">
            <div class="project-card-preview"${getPreviewScaleAttrs(project)}>
              ${renderPreview(project, imgSrc)}
              ${renderInstagramIcon(project)}
            </div>
            ${viewBelowCard ? "" : renderProjectCardActions(project)}
          </div>
          <div class="project-card-body">
            <p class="project-card-index">${String(i + 1).padStart(2, "0")} / ${itemLabel}</p>
            <h3 class="project-card-title">${project.title}</h3>
          </div>
          ${renderProjectNav(offset === 0)}
          ${viewBelowCard ? renderProjectCardActions(project, true) : ""}
        </article>`;
        wrap.querySelector(".project-card-instagram")?.addEventListener("click", (e) => e.stopPropagation());
        wrap.querySelector("button.project-card-view-btn")?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const slug = e.currentTarget.getAttribute("data-open-project");
          if (slug) openProjectModal(slug);
        });
        if (offset === 0) bindProjectNav(wrap);
        const cover = wrap.querySelector("img.project-card-cover");
        if (cover) bindImageLoadState(cover)();
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
    initCarousel($("#websites"), featuredWebsiteProjects, "Project", true);
    initCarousel($("#apps"), featuredAppsProjects, "App", true);
    initCarousel($("#instagram"), featuredInstagramProjects, "Instagram");
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

  const PORTFOLIO_INITIAL_COUNT = 6;

  function renderPortfolioItem(p, hidden) {
    const slug = projectSlug(p.href);
    const project = getRegistryProject(slug) || normalizeProject(p, slug);
    const title = displayTitle(p.title);
    const fitClass = project.previewFit === "contain" ? " portfolio-item--contain" : "";
    const posAttr = project.previewPosition
      ? ` data-preview-position="${project.previewPosition}"`
      : "";
    const scaleAttr = project.previewScale
      ? ` data-preview-scale="${project.previewScale}" style="--preview-scale: ${project.previewScale}"`
      : "";
    return `
        <button type="button" class="portfolio-item${fitClass}${hidden ? " portfolio-item--hidden" : ""}" data-open-project="${slug}" aria-label="Open ${title}"${posAttr}${scaleAttr}>
          <img src="${assetUrl(project.image)}" alt="${title}" loading="lazy" decoding="async" />
          <div class="portfolio-item-overlay">
            <span class="portfolio-item-title">${title}</span>
          </div>
        </button>`;
  }

  async function loadProjectRegistry() {
    const [projectsRes, detailsRes] = await Promise.all([
      fetch(assetUrl("dist/js/projects-data.json?v=12")),
      fetch(assetUrl("dist/js/project-details.json?v=48")),
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
      bindImageLoadStates(grid);

      if (moreWrap) {
        moreWrap.innerHTML = "";
        if (hasMore) {
          const hiddenCount = projects.length - PORTFOLIO_INITIAL_COUNT;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "primary-btn portfolio-view-more";
          btn.setAttribute("aria-expanded", "false");
          btn.textContent = `View more (${hiddenCount})`;
          btn.addEventListener("click", () => {
            const expanded = btn.getAttribute("aria-expanded") === "true";
            const items = $$(".portfolio-item", grid);
            if (expanded) {
              items.forEach((item, i) => {
                if (i >= PORTFOLIO_INITIAL_COUNT) item.classList.add("portfolio-item--hidden");
              });
              btn.textContent = `View more (${hiddenCount})`;
              btn.setAttribute("aria-expanded", "false");
              document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              items.forEach((item) => item.classList.remove("portfolio-item--hidden"));
              btn.textContent = "View less";
              btn.setAttribute("aria-expanded", "true");
            }
          });
          moreWrap.appendChild(btn);
        }
      }
    } catch (e) {
      grid.innerHTML = `<p style="color:rgba(0,0,0,.5);font-weight:600;">Portfolio loading…</p>`;
      if (moreWrap) moreWrap.innerHTML = "";
    }
  }

  function renderCareerLeft(index) {
    const left = $(".career-left");
    const role = careerCompany.roles[index];
    if (!left || !role) return;

    const linkHtml = role.link
      ? `<a class="career-link" href="${role.link}" target="_blank" rel="noopener noreferrer">Site ↗</a>`
      : "";

    const headerTitle = role.company || role.title;
    const isUeVarna = role.id === "ue-varna";

    if (isUeVarna) {
      const portfolioBtnHtml = role.portfolioLink
        ? `<button type="button" class="primary-btn career-portfolio-btn" data-open-project="${role.portfolioLink.slug}">${role.portfolioLink.text}</button>`
        : "";

      const bars = Array.from({ length: 9 }, (_, i) => {
        const active = i >= 9 - role.bars;
        const label = i === 0 ? role.startLabel : i === 8 ? role.endLabel : "&nbsp;";
        return `
        <div class="career-bar-col">
          <div class="career-bar"><div class="career-bar-fill ${active ? "active" : ""}"></div></div>
          <span class="career-bar-label">${label}</span>
        </div>`;
      }).join("");

      const companyShort = role.company.split(" — ")[0];

      left.innerHTML = `
      <div class="career-header">
        <div>
          <p class="career-label">${role.label || "Experience"}</p>
          <p class="career-company">${role.company}</p>
        </div>
        ${linkHtml}
      </div>
      <div class="career-bars">${bars}</div>
      <p class="career-years">
        <span class="career-years-num">${role.years}</span>
        <span class="career-years-text">years at ${companyShort}</span>
      </p>
      <div class="career-desc">${role.summary}</div>
      <p class="career-list-label">This gave me strong experience with:</p>
      <ul class="career-list">${role.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      ${portfolioBtnHtml}`;
      return;
    }

    left.innerHTML = `
      <div class="career-header">
        <div>
          <p class="career-label">${role.label || "Experience"}</p>
          <p class="career-company">${headerTitle}</p>
          <p class="career-period">${role.period}</p>
        </div>
        ${linkHtml}
      </div>
      <div class="career-desc">${role.summary}</div>`;
  }

  function setCareerActiveIndex(index) {
    const roles = careerCompany.roles;
    if (!roles.length) return;
    careerActiveIndex = ((index % roles.length) + roles.length) % roles.length;

    const timeline = $(".timeline-items");
    if (timeline) {
      $$(".timeline-item", timeline).forEach((el, i) => {
        el.classList.toggle("active", i === careerActiveIndex);
      });
    }

    renderCareerLeft(careerActiveIndex);
    updateTimelineProgress();
  }

  function renderCareer() {
    const data = careerCompany;
    const timeline = $(".timeline-items");
    if (!data?.roles?.length) return;

    renderCareerLeft(careerActiveIndex);

    if (timeline) {
      timeline.innerHTML = data.roles
        .map(
          (role, i) => `
        <div class="timeline-item ${i === careerActiveIndex ? "active" : ""}" tabindex="0" role="button" aria-pressed="${i === careerActiveIndex}">
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
      $$(".timeline-item", timeline).forEach((item, i) => {
        const activate = () => setCareerActiveIndex(i);
        item.addEventListener("click", activate);
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
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
    const logoEl = $(".project-modal-logo", modal);
    const descEl = $("#project-modal-desc");
    const imgEl = $(".project-modal-image", modal);
    const counterEl = $(".project-modal-counter", modal);
    const prevBtn = $(".project-modal-nav.prev", modal);
    const nextBtn = $(".project-modal-nav.next", modal);
    const stage = $(".project-modal-stage", modal);

    if (titleEl) titleEl.textContent = modalProject.modalTitle || modalProject.title;
    if (logoEl) {
      const logoPath = modalProject.modalLogo;
      if (logoPath) {
        logoEl.src = assetUrl(logoPath);
        logoEl.alt = "";
        logoEl.hidden = false;
      } else {
        logoEl.removeAttribute("src");
        logoEl.hidden = true;
      }
    }
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
      const coverPath = getProjectCoverPath(modalProject);
      const mirrorPath = cdnToLocalMirror(path);
      const tried = new Set();
      imgEl.alt = modalProject.title;
      imgEl.removeAttribute("srcset");

      const tryNextSource = () => {
        const candidates = [mirrorPath, coverPath].filter(Boolean);
        for (const candidate of candidates) {
          if (candidate === path || tried.has(candidate)) continue;
          tried.add(candidate);
          imgEl.src = assetUrl(candidate);
          return false;
        }
      };

      const commitLoad = bindImageLoadState(imgEl, {
        container: stage,
        onError: tryNextSource,
      });
      imgEl.src = assetUrl(path);
      commitLoad();
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
    document.body.addEventListener(
      "click",
      (e) => {
        const trigger = e.target.closest("[data-open-project]");
        if (!trigger || trigger.closest("#project-modal")) return;
        e.preventDefault();
        openProjectModal(trigger.getAttribute("data-open-project"));
      },
      true
    );
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
