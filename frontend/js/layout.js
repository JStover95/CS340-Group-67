/** Date: 05/06/2026
 * AI tools were used to generate this code (Cursor Composer 2).
 *
 * Summary of prompts:
 * - Prompted for design of an administrator-facing frontend specification in `frontend-spec.md` using `database-outline.md` as the source of schema and relationship requirements.
 * - Prompted for enforcement of scope constraints: VPN-only access, no authentication/session state, no backend requests, and alert-based no-op submit behavior.
 * - Prompted for coverage of full CRUD UI requirements for `Artists`, `Genres`, `Customers`, `Items`, and `Orders`, with `Statuses` excluded from CRUD management.
 * - Prompted for clarification and confirmation of UI/UX decisions, including MPA architecture, `Items.type` radio inputs, `Customers.shippingAddress` textarea usage, and header text selection.
 * - Prompted for inclusion of relationship-driven UI behavior: artist/genre dropdowns on items, customer/status dropdowns on orders, and inline editable order items table on order create/edit pages.
 * - Prompted for treatment of derived/display-only order fields (`orderTimestamp`, `orderTotal`, `OrderItems.price`, `OrderItems.lineTotal`) as non-editable with distinctive styling.
 * - Prompted for read-table display normalization from IDs to human-readable values (customer name/status code in orders, artist/genre names in items).
 * - Prompted for delete confirmation behavior via user confirmation dialogs, with FK/cascade warnings deferred out of scope but documented for future backend integration.
 * - Prompted for explicit empty-state handling with `No records found.` messaging in list tables and no image preview requirement on item edit.
 * - Prompted for implementation of the approved MPA plan end-to-end, with fake data loaded from `data/*.json` for read/edit rendering only, and create/update/delete behavior retained as no-op alert flows.
 * - Prompted for todo-driven execution discipline: existing plan todos marked in progress/completed sequentially without recreating plan tasks.
 * - Prompted for brief task-status communication when the smoke-test local server job ended in aborted state, with no further action required.
 * - Prompted for final concise recap request for conversation prompts and requirement discussion points.
 *
 * Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to add a reset button at the bottom of the left navigation that calls `POST /reset`.
 * - Prompted to refresh the page on success and show an alert on failure.
 */

/**
 * Injects shared header and sidebar navigation.
 * Marks the active entity based on pathname (matches any page for that entity).
 */
(function () {
  var ENTITY_FILES = [
    "artists",
    "genres",
    "customers",
    "items",
    "orders",
    "order-items",
  ];
  var LABELS = {
    artists: "Artists",
    genres: "Genres",
    customers: "Customers",
    items: "Items",
    orders: "Orders",
    "order-items": "Order Items",
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
      navEl.classList.add("flex", "flex-col");

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
        '<div class="flex min-h-0 flex-1 flex-col">' +
        '<div class="flex-1 overflow-y-auto p-4 space-y-1">' +
        linksHtml +
        "</div>" +
        '<div class="shrink-0 border-t border-gray-200 p-4">' +
        '<button type="button" id="btn-reset-db" class="w-full rounded-md border border-red-700 bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">' +
        "Reset Database" +
        "</button>" +
        "</div>" +
        "</div>";

      var resetBtn = document.getElementById("btn-reset-db");
      if (resetBtn) {
        resetBtn.addEventListener("click", onResetDatabaseClick);
      }
    }
  }

  function onResetDatabaseClick() {
    if (
      !confirm(
        "Reset the database to initial sample data? This cannot be undone."
      )
    ) {
      return;
    }

    var resetPromise =
      window.AppApi && window.AppApi.resetDatabase
        ? window.AppApi.resetDatabase()
        : fetch("http://classwork.engr.oregonstate.edu:3712/reset", { method: "POST" }).then(
            function (res) {
              if (!res.ok) {
                return res.json().then(function (body) {
                  throw new Error(
                    (body && body.message) || "Failed to reset database."
                  );
                });
              }
              return res.json();
            }
          );

    resetPromise
      .then(function () {
        window.location.reload();
      })
      .catch(function (err) {
        alert(err.message || "Failed to reset database.");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
