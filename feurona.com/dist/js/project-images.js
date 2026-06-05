(function () {
  var DEBOUNCE_MS = 16;
  var applying = false;
  var debounceTimer;

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

  function isBrokenSrc(src) {
    return (
      !src ||
      src.indexOf("data:image/") === 0 ||
      src.indexOf("cdn.myportfolio.com") !== -1
    );
  }

  function applyCover(img, paths, index) {
    if (index >= paths.length) return;
    img.removeAttribute("srcset");
    img.removeAttribute("data-srcset");
    img.onload = function () {
      if (img.naturalWidth > 1) {
        markLoaded(img);
      } else if (index + 1 < paths.length) {
        applyCover(img, paths, index + 1);
      }
    };
    img.onerror = function () {
      if (index + 1 < paths.length) applyCover(img, paths, index + 1);
    };
    img.src = paths[index];
  }

  function applyProjectImages() {
    if (applying) return;
    applying = true;
    try {
      var modules = Array.prototype.slice.call(
        document.querySelectorAll("#project-modules .project-module")
      );
      if (!modules.length) return;

      modules.forEach(function (mod, index) {
        mod.style.display = index === 0 ? "" : "none";
      });

      var firstImg = modules[0].querySelector("img");
      if (!firstImg) return;

      var locals = localCandidates();
      if (!locals.length) return;

      var src = firstImg.getAttribute("src") || "";
      if (src.indexOf("dist/images/projects/") !== -1 && firstImg.naturalWidth > 1) {
        markLoaded(firstImg);
        return;
      }

      if (isBrokenSrc(src) || firstImg.naturalWidth <= 1) {
        applyCover(firstImg, locals, 0);
      }
    } catch (e) {
      // no-op
    } finally {
      applying = false;
    }
  }

  function scheduleApply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyProjectImages, DEBOUNCE_MS);
  }

  applyProjectImages();
  window.addEventListener("load", applyProjectImages);
  [50, 300, 800, 1500].forEach(function (ms) {
    setTimeout(applyProjectImages, ms);
  });

  var host = document.getElementById("project-modules");
  if (host && window.MutationObserver) {
    new MutationObserver(scheduleApply).observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "style", "class"],
    });
  }
})();
