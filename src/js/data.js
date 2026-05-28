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
 */

/**
 * Loads mock JSON under /data into window.AppData.
 * Registers Handlebars helpers when Handlebars is available.
 */
(function () {
  /** @typedef {typeof window.AppData} AppDataShape */

  if (typeof Handlebars !== "undefined") {
    Handlebars.registerHelper("selected", function (a, b) {
      var x = Number(a);
      var y = Number(b);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        return x === y ? "selected" : "";
      }
      return String(a) === String(b) ? "selected" : "";
    });
    Handlebars.registerHelper("checked", function (a, b) {
      return String(a) === String(b) ? "checked" : "";
    });
    Handlebars.registerHelper("currency", function (n) {
      if (n === null || n === undefined || n === "") return "—";
      var num = Number(n);
      if (Number.isNaN(num)) return String(n);
      return "$" + num.toFixed(2);
    });
  }

  var DATA_FILES = [
    { key: "artists", url: "./data/artists.json", transform: null },
    {
      key: "genres",
      url: "./data/genres.json",
      transform: null,
    },
    {
      key: "customers",
      url: "./data/customers.json",
      transform: function (rows) {
        return rows.map(function (c) {
          var o = Object.assign({}, c);
          delete o.password;
          return o;
        });
      },
    },
    { key: "items", url: "./data/items.json", transform: null },
    {
      key: "orders",
      url: "./data/orders.json",
      transform: function (rows) {
        return rows.map(function (o) {
          var copy = Object.assign({}, o);
          if ("timestamp" in copy && copy.orderTimestamp == null) {
            copy.orderTimestamp = copy.timestamp;
            delete copy.timestamp;
          }
          return copy;
        });
      },
    },
    { key: "orderItems", url: "./data/order_items.json", transform: null },
    { key: "statuses", url: "./data/statuses.json", transform: null },
  ];

  /**
   * @type {AppDataShape}
   */
  window.AppData = {
    artists: [],
    genres: [],
    customers: [],
    items: [],
    orders: [],
    orderItems: [],
    statuses: [],
  };

  window.dataReady = Promise.all(
    DATA_FILES.map(function (def) {
      return fetch(def.url)
        .then(function (res) {
          if (!res.ok) throw new Error("Failed " + def.url + ": " + res.status);
          return res.json();
        })
        .then(function (data) {
          window.AppData[def.key] = def.transform ? def.transform(data) : data;
        });
    })
  );

  window.AppUtils = {
    findById: function (arr, idKey, id) {
      var n = Number(id);
      return arr.find(function (r) {
        return Number(r[idKey]) === n;
      });
    },
    customerLabel: function (c) {
      if (!c) return "";
      return c.firstName + " " + c.lastName + " — " + c.email;
    },
    customerShortName: function (c) {
      if (!c) return "";
      return c.firstName + " " + c.lastName;
    },
    /**
     * Order label for Order Items UI: `<customer email>-<order timestamp>`.
     * @param {object} order — row from AppData.orders (orderTimestamp normalized in loader)
     */
    orderItemOrderLabel: function (order) {
      if (!order) return "—";
      var c = AppUtils.findById(
        window.AppData.customers,
        "customerId",
        order.customerId
      );
      var email = c && c.email ? c.email : "?";
      var ts =
        order.orderTimestamp != null
          ? order.orderTimestamp
          : order.timestamp != null
            ? order.timestamp
            : "?";
      return email + "-" + ts;
    },
  };

  /**
   * In-memory-only mutations for client-side list deletes. JSON on disk is unchanged;
   * a full page reload re-fetches sample data.
   */
  window.AppUiMutations = {
    removeByIdKey: function (collectionKey, idKey, id) {
      var arr = window.AppData[collectionKey];
      if (!arr || !Array.isArray(arr)) return false;
      var n = Number(id);
      for (var i = 0; i < arr.length; i++) {
        if (Number(arr[i][idKey]) === n) {
          arr.splice(i, 1);
          return true;
        }
      }
      return false;
    },
    /** Removes the order and any in-memory order lines for that order (UI consistency only). */
    removeOrderInMemory: function (orderId) {
      if (!this.removeByIdKey("orders", "orderId", orderId)) return false;
      var n = Number(orderId);
      window.AppData.orderItems = window.AppData.orderItems.filter(function (oi) {
        return Number(oi.orderId) !== n;
      });
      return true;
    },
  };
})();
