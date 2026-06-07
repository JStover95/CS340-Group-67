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
 * Date: 06/07/2026
 * AI tools were used to generate this code (Cursor Composer 2.5).
 *
 * Summary of prompts:
 * - Prompted to remove in-memory JSON loading from `frontend/data/` and keep only shared Handlebars helpers and lookup utilities for server-backed pages.
 */

/**
 * Registers Handlebars helpers and shared lookup utilities.
 */
(function () {
  if (typeof Handlebars !== "undefined") {
    /** Renders the `selected` attribute when two option values match. */
    Handlebars.registerHelper("selected", function (a, b) {
      var x = Number(a);
      var y = Number(b);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        return x === y ? "selected" : "";
      }
      return String(a) === String(b) ? "selected" : "";
    });
    /** Renders the `checked` attribute when two radio values match. */
    Handlebars.registerHelper("checked", function (a, b) {
      return String(a) === String(b) ? "checked" : "";
    });
    /** Formats a number as USD currency for templates, or em dash when invalid. */
    Handlebars.registerHelper("currency", function (n) {
      if (n === null || n === undefined || n === "") return "—";
      var num = Number(n);
      if (Number.isNaN(num)) return String(n);
      return "$" + num.toFixed(2);
    });
  }

  window.AppUtils = {
    /**
     * Finds the first array element whose idKey matches id (numeric compare).
     * @param {object[]} arr
     * @param {string} idKey
     * @param {number|string} id
     * @returns {object|undefined}
     */
    findById: function (arr, idKey, id) {
      var n = Number(id);
      return arr.find(function (r) {
        return Number(r[idKey]) === n;
      });
    },
    /**
     * Full customer label for dropdowns: `First Last — email`.
     * @param {object|null|undefined} c
     * @returns {string}
     */
    customerLabel: function (c) {
      if (!c) return "";
      return c.firstName + " " + c.lastName + " — " + c.email;
    },
    /**
     * Short customer display name: `First Last`.
     * @param {object|null|undefined} c
     * @returns {string}
     */
    customerShortName: function (c) {
      if (!c) return "";
      return c.firstName + " " + c.lastName;
    },
    /**
     * Order label for Order Items UI: `<customer email>-<order timestamp>`.
     */
    orderItemOrderLabel: function (order, customers) {
      if (!order) return "—";
      var email = order.email;
      if (!email && customers) {
        var c = AppUtils.findById(customers, "customerId", order.customerId);
        email = c && c.email ? c.email : "?";
      }
      if (!email) email = "?";
      var ts =
        order.orderTimestamp != null
          ? order.orderTimestamp
          : order.timestamp != null
            ? order.timestamp
            : "?";
      return email + "-" + ts;
    },
    /**
     * Returns the current local time as MySQL `YYYY-MM-DD HH:MM:SS`.
     * @returns {string}
     */
    currentTimestamp: function () {
      var now = new Date();
      var pad = function (n) {
        return String(n).padStart(2, "0");
      };
      return (
        now.getFullYear() +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        pad(now.getDate()) +
        " " +
        pad(now.getHours()) +
        ":" +
        pad(now.getMinutes()) +
        ":" +
        pad(now.getSeconds())
      );
    },
  };
})();
