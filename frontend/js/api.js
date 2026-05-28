/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to connect list pages to the backend GET and DELETE endpoints instead of `frontend/data/` JSON files.
 * - Prompted to refresh list tables after successful delete and show an alert warning when delete is unsuccessful.
 * - Prompted to use empty strings for table columns when backend rows omit expected display fields.
 * - Prompted to add `resetDatabase()` for `POST /reset` used by the navigation reset button.
 */

(function () {
  var API_BASE = "http://localhost:3001";

  function emptyStr(value) {
    return value == null ? "" : String(value);
  }

  function fillFields(row, keys) {
    var out = Object.assign({}, row);
    keys.forEach(function (key) {
      out[key] = emptyStr(out[key]);
    });
    return out;
  }

  function fetchList(url, mapper) {
    return fetch(API_BASE + url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("GET " + url + " failed: " + res.status);
        }
        return res.json();
      })
      .then(function (rows) {
        if (!Array.isArray(rows)) return [];
        return mapper ? rows.map(mapper) : rows;
      });
  }

  function deleteResource(slug, id) {
    return fetch(API_BASE + "/" + slug + "/" + encodeURIComponent(id), {
      method: "DELETE",
    }).then(function (res) {
      if (res.status === 204) {
        return { ok: true };
      }
      if (res.status === 404) {
        return res.json().then(function (body) {
          return {
            ok: false,
            message:
              (body && body.message) || "Resource not found.",
          };
        });
      }
      throw new Error("DELETE " + slug + "/" + id + " failed: " + res.status);
    });
  }

  window.AppApi = {
    baseUrl: API_BASE,

    fetchArtists: function () {
      return fetchList("/artist/", function (row) {
        return fillFields(row, ["artistId", "name", "country", "bio"]);
      });
    },

    fetchGenres: function () {
      return fetchList("/genre/", function (row) {
        return fillFields(row, ["genreId", "name", "description"]);
      });
    },

    fetchCustomers: function () {
      return fetchList("/customer/", function (row) {
        return fillFields(row, [
          "customerId",
          "firstName",
          "lastName",
          "email",
          "shippingAddress",
        ]);
      });
    },

    fetchItems: function () {
      return fetchList("/item/", function (row) {
        return fillFields(row, [
          "itemId",
          "type",
          "title",
          "description",
          "image",
          "artistName",
          "genreName",
        ]);
      });
    },

    fetchOrders: function () {
      return fetchList("/order/", function (row) {
        var first = emptyStr(row.firstName);
        var last = emptyStr(row.lastName);
        var customerName = (first + " " + last).trim();
        return {
          orderId: row.orderId,
          customerName: customerName,
          statusCode: emptyStr(row.statusCode),
          orderTimestamp: emptyStr(row.timestamp),
          orderTotal: row.orderTotal,
        };
      });
    },

    fetchOrderItems: function () {
      return fetchList("/order-item/", function (row) {
        return {
          orderItemId: row.orderItemId,
          orderId: emptyStr(row.orderId),
          itemId: "",
          orderLabel: "",
          itemTitle: emptyStr(row.title),
          quantity: row.quantity,
          derivedPrice: row.price,
          derivedLineTotal: row.lineTotal,
        };
      });
    },

    deleteArtist: function (id) {
      return deleteResource("artist", id);
    },
    deleteGenre: function (id) {
      return deleteResource("genre", id);
    },
    deleteCustomer: function (id) {
      return deleteResource("customer", id);
    },
    deleteItem: function (id) {
      return deleteResource("item", id);
    },
    deleteOrder: function (id) {
      return deleteResource("order", id);
    },
    deleteOrderItem: function (id) {
      return deleteResource("order-item", id);
    },

    resetDatabase: function () {
      return fetch(API_BASE + "/reset", { method: "POST" }).then(function (res) {
        if (!res.ok) {
          return res.json().then(function (body) {
            throw new Error(
              (body && body.message) || "Failed to reset database."
            );
          });
        }
        return res.json();
      });
    },
  };
})();
