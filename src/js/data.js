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
