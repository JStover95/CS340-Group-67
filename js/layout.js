/**
 * Injects shared header and sidebar navigation.
 * Marks the active entity based on pathname (matches any page for that entity).
 */
(function () {
  var ENTITY_FILES = ["artists", "genres", "customers", "items", "orders"];
  var LABELS = {
    artists: "Artists",
    genres: "Genres",
    customers: "Customers",
    items: "Items",
    orders: "Orders",
  };

  function getActiveSlug() {
    var path =
      typeof window.location !== "undefined" ? window.location.pathname : "";
    var file = path.split("/").pop() || "";
    for (var i = 0; i < ENTITY_FILES.length; i++) {
      var slug = ENTITY_FILES[i];
      if (file.indexOf(slug) === 0) return slug;
    }
    return null;
  }

  function inject() {
    var headerEl = document.getElementById("site-header");
    var navEl = document.getElementById("site-nav");
    var activeSlug = getActiveSlug();

    if (headerEl) {
      headerEl.innerHTML =
        '<div class="mx-auto flex h-14 max-w-none items-center px-6 lg:px-8">' +
        '<h1 class="text-lg font-semibold tracking-tight">OSU Record Store Database Dashboard</h1>' +
        "</div>";
    }

    if (navEl) {
      var linksHtml = ENTITY_FILES.map(function (slug) {
        var active = slug === activeSlug;
        var cls =
          "block rounded-md px-3 py-2 text-sm font-medium " +
          (active
            ? "bg-indigo-100 text-indigo-700 font-semibold"
            : "text-gray-700 hover:bg-gray-200");
        return (
          '<a href="' +
          slug +
          '.html" class="' +
          cls +
          '">' +
          LABELS[slug] +
          "</a>"
        );
      }).join("");
      navEl.innerHTML =
        '<div class="p-4 space-y-1 border-b border-gray-200">' +
        linksHtml +
        "</div>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
