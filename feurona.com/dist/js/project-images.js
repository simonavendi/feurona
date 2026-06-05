(function () {
  function injectBackToPortfolio() {
    if (!document.getElementById("project-modules")) return;
    if (document.getElementById("project-back-link")) return;

    var link = document.createElement("a");
    link.id = "project-back-link";
    link.className = "project-back-link";
    link.href = "index.html#portfolio";
    link.setAttribute("aria-label", "Back to portfolio");
    link.innerHTML =
      '<span class="project-back-link__icon" aria-hidden="true">←</span>' +
      '<span class="project-back-link__text">Portfolio</span>';

    document.body.appendChild(link);
  }

  function resolveCdnUrl(url) {
    if (!url) return "";
    return url.replace(/^\.\.\/cdn\.myportfolio\.com\//, "https://cdn.myportfolio.com/");
  }

  function projectSlug() {
    return (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  }

  function localCandidates() {
    var slug = projectSlug();
    if (!slug) return [];
    return ["dist/images/projects/" + slug + ".jpg", "dist/images/projects/" + slug + ".png"];
  }

  function markLoaded(img) {
    img.classList.add("image-loaded");
    img.removeAttribute("height");
    img.removeAttribute("style");
  }

  function hideModule(img) {
    var mod = img.closest(".project-module");
    if (mod) mod.style.display = "none";
  }

  function showModule(img) {
    var mod = img.closest(".project-module");
    if (mod) mod.style.display = "";
  }

  function setCover(img, paths, index) {
    if (index >= paths.length) {
      hideModule(img);
      return;
    }
    img.removeAttribute("srcset");
    img.onload = function () {
      if (img.naturalWidth > 1) {
        markLoaded(img);
        showModule(img);
      } else {
        setCover(img, paths, index + 1);
      }
    };
    img.onerror = function () {
      setCover(img, paths, index + 1);
    };
    img.src = paths[index];
  }

  function applyLocalGallery() {
    var host = document.getElementById("project-modules");
    if (!host || host.getAttribute("data-local-gallery") !== "true") return false;

    host.querySelectorAll(".local-gallery-image").forEach(function (img) {
      markLoaded(img);
      showModule(img);
      var lightbox = img.closest(".js-lightbox");
      if (lightbox) {
        var src = img.getAttribute("src") || "";
        if (src) lightbox.setAttribute("data-src", src);
      }
    });
    return true;
  }

  function applyProjectImages() {
    try {
      if (applyLocalGallery()) return;

      document.querySelectorAll(".js-lightbox[data-src]").forEach(function (el) {
        el.setAttribute("data-src", resolveCdnUrl(el.getAttribute("data-src")));
      });

      var imgs = Array.prototype.slice.call(
        document.querySelectorAll("#project-modules img.js-lazy[data-src], #project-modules img[data-src]")
      );
      if (!imgs.length) return;

      var locals = localCandidates();

      imgs.forEach(function (img, index) {
        if (index > 0) {
          hideModule(img);
          return;
        }
        if (!locals.length) {
          hideModule(img);
          return;
        }
        var src = img.getAttribute("src") || "";
        if (src.indexOf("dist/images/projects/") !== -1 && img.naturalWidth > 1) {
          markLoaded(img);
          showModule(img);
          return;
        }
        setCover(img, locals, 0);
      });
    } catch (e) {
      // no-op
    }
  }

  injectBackToPortfolio();
  applyProjectImages();
  window.addEventListener("load", function () {
    injectBackToPortfolio();
    applyProjectImages();
  });
  setTimeout(applyProjectImages, 50);
  setTimeout(applyProjectImages, 300);

  var host = document.getElementById("project-modules");
  if (host && window.MutationObserver) {
    new MutationObserver(function () {
      applyProjectImages();
    }).observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "style", "class"],
    });
  }
})();
