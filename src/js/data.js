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
  };
})();
