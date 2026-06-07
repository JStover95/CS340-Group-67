/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to connect list pages to the backend GET and DELETE endpoints instead of `frontend/data/` JSON files.
 * - Prompted to refresh list tables after successful delete and show an alert warning when delete is unsuccessful.
 * - Prompted to use empty strings for table columns when backend rows omit expected display fields.
 * - Prompted to add `resetDatabase()` for `POST /reset` used by the navigation reset button.
 */

/** Date: 06/07/2026
 * AI tools were used to generate this code (Cursor Composer 2.5).
 *
 * Summary of prompts:
 * - Prompted to add create and update API helpers for every backend stored-procedure endpoint.
 * - Prompted to fetch statuses and enrich list rows with foreign-key fields needed by edit forms.
 */

(function () {
  var API_BASE = "http://localhost:3712";

  function emptyStr(value) {
    return value == null ? "" : String(value);
  }

  function formatOrderTimestamp(value) {
    if (value == null || value === "") return "";
    var str = String(value);
    if (str.indexOf("T") !== -1) {
      return str.slice(0, 19).replace("T", " ");
    }
    return str;
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
            message: (body && body.message) || "Resource not found.",
          };
        });
      }
      throw new Error("DELETE " + slug + "/" + id + " failed: " + res.status);
    });
  }

  function createResource(slug, body) {
    return fetch(API_BASE + "/" + slug + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (res.status === 201) {
        return res.json();
      }
      return res.json().then(function (payload) {
        throw new Error(
          (payload && payload.message) || "Failed to create " + slug + "."
        );
      });
    });
  }

  function updateResource(slug, id, body) {
    return fetch(API_BASE + "/" + slug + "/" + encodeURIComponent(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (res.status === 200) {
        return res.json();
      }
      if (res.status === 404) {
        return res.json().then(function (payload) {
          throw new Error(
            (payload && payload.message) || "Resource not found."
          );
        });
      }
      return res.json().then(function (payload) {
        throw new Error(
          (payload && payload.message) || "Failed to update " + slug + "."
        );
      });
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

    fetchStatuses: function () {
      return fetchList("/status/", function (row) {
        return fillFields(row, ["statusId", "statusCode", "description"]);
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
          "artistId",
          "genreId",
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
          customerId: row.customerId,
          statusId: row.statusId,
          email: emptyStr(row.email),
          customerName: customerName,
          statusCode: emptyStr(row.statusCode),
          orderTimestamp: formatOrderTimestamp(row.orderTimestamp),
          orderTotal: row.orderTotal,
        };
      });
    },

    fetchOrderItemsRaw: function () {
      return fetchList("/order-item/");
    },

    fetchOrderItems: function () {
      return Promise.all([
        fetchList("/order-item/"),
        fetchList("/order/"),
        fetchList("/customer/"),
      ]).then(function (results) {
        var rows = results[0];
        var orders = results[1];
        var customers = results[2];

        return rows.map(function (row) {
          var order = AppUtils.findById(orders, "orderId", row.orderId);
          return {
            orderItemId: row.orderItemId,
            orderId: row.orderId,
            itemId: row.itemId,
            orderLabel: AppUtils.orderItemOrderLabel(order, customers),
            itemTitle: emptyStr(row.title),
            quantity: row.quantity,
            derivedPrice: row.price,
            derivedLineTotal: row.lineTotal,
          };
        });
      });
    },

    createArtist: function (body) {
      return createResource("artist", body);
    },
    updateArtist: function (id, body) {
      return updateResource("artist", id, body);
    },
    deleteArtist: function (id) {
      return deleteResource("artist", id);
    },

    createGenre: function (body) {
      return createResource("genre", body);
    },
    updateGenre: function (id, body) {
      return updateResource("genre", id, body);
    },
    deleteGenre: function (id) {
      return deleteResource("genre", id);
    },

    createCustomer: function (body) {
      return createResource("customer", body);
    },
    updateCustomer: function (id, body) {
      return updateResource("customer", id, body);
    },
    deleteCustomer: function (id) {
      return deleteResource("customer", id);
    },

    createItem: function (body) {
      return createResource("item", body);
    },
    updateItem: function (id, body) {
      return updateResource("item", id, body);
    },
    deleteItem: function (id) {
      return deleteResource("item", id);
    },

    createOrder: function (body) {
      return createResource("order", body);
    },
    updateOrder: function (id, body) {
      return updateResource("order", id, body);
    },
    deleteOrder: function (id) {
      return deleteResource("order", id);
    },

    createOrderItem: function (body) {
      return createResource("order-item", body);
    },
    updateOrderItem: function (id, body) {
      return updateResource("order-item", id, body);
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
