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

  /**
   * Coerces null or undefined to an empty string; otherwise returns String(value).
   * @param {*} value
   * @returns {string}
   */
  function emptyStr(value) {
    return value == null ? "" : String(value);
  }

  /**
   * Normalizes an order timestamp to `YYYY-MM-DD HH:MM:SS` for display.
   * @param {*} value
   * @returns {string}
   */
  function formatOrderTimestamp(value) {
    if (value == null || value === "") return "";
    var str = String(value);
    if (str.indexOf("T") !== -1) {
      return str.slice(0, 19).replace("T", " ");
    }
    return str;
  }

  /**
   * Returns a copy of a row with the given keys filled via emptyStr.
   * @param {object} row
   * @param {string[]} keys
   * @returns {object}
   */
  function fillFields(row, keys) {
    var out = Object.assign({}, row);
    keys.forEach(function (key) {
      out[key] = emptyStr(out[key]);
    });
    return out;
  }

  /**
   * GETs a list endpoint and optionally maps each row.
   * @param {string} url - Path relative to API_BASE (e.g. `/artist/`).
   * @param {function(object): object} [mapper]
   * @returns {Promise<object[]>}
   */
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

  /**
   * DELETEs a resource by slug and id.
   * @param {string} slug - Resource path segment (e.g. `artist`).
   * @param {number|string} id
   * @returns {Promise<{ok: true}|{ok: false, message: string}>}
   */
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

  /**
   * POSTs a new resource and returns the created payload (includes insertId).
   * @param {string} slug
   * @param {object} body
   * @returns {Promise<{insertId: number}>}
   */
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

  /**
   * PUTs an updated resource by slug and id.
   * @param {string} slug
   * @param {number|string} id
   * @param {object} body
   * @returns {Promise<{rowsAffected: number}>}
   */
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

  /** HTTP client for the record-store backend REST API. */
  window.AppApi = {
    baseUrl: API_BASE,

    /** Fetches all artists with display fields normalized. */
    fetchArtists: function () {
      return fetchList("/artist/", function (row) {
        return fillFields(row, ["artistId", "name", "country", "bio"]);
      });
    },

    /** Fetches all genres with display fields normalized. */
    fetchGenres: function () {
      return fetchList("/genre/", function (row) {
        return fillFields(row, ["genreId", "name", "description"]);
      });
    },

    /** Fetches all customers with display fields normalized. */
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

    /** Fetches all order statuses for dropdowns and display. */
    fetchStatuses: function () {
      return fetchList("/status/", function (row) {
        return fillFields(row, ["statusId", "statusCode", "description"]);
      });
    },

    /** Fetches all items with artist/genre names and display fields normalized. */
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

    /** Fetches all orders with customer name, status code, and formatted timestamp. */
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

    /** Fetches order-item rows without joining related entities. */
    fetchOrderItemsRaw: function () {
      return fetchList("/order-item/");
    },

    /** Fetches order items enriched with order label and item title. */
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

    /** Creates an artist via `create_artist`. */
    createArtist: function (body) {
      return createResource("artist", body);
    },
    /** Updates an artist via `update_artist`. */
    updateArtist: function (id, body) {
      return updateResource("artist", id, body);
    },
    /** Deletes an artist by id. */
    deleteArtist: function (id) {
      return deleteResource("artist", id);
    },

    /** Creates a genre via `create_genre`. */
    createGenre: function (body) {
      return createResource("genre", body);
    },
    /** Updates a genre via `update_genre`. */
    updateGenre: function (id, body) {
      return updateResource("genre", id, body);
    },
    /** Deletes a genre by id. */
    deleteGenre: function (id) {
      return deleteResource("genre", id);
    },

    /** Creates a customer via `create_customer`. */
    createCustomer: function (body) {
      return createResource("customer", body);
    },
    /** Updates a customer via `update_customer`. */
    updateCustomer: function (id, body) {
      return updateResource("customer", id, body);
    },
    /** Deletes a customer by id. */
    deleteCustomer: function (id) {
      return deleteResource("customer", id);
    },

    /** Creates an item via `create_item`. */
    createItem: function (body) {
      return createResource("item", body);
    },
    /** Updates an item via `update_item`. */
    updateItem: function (id, body) {
      return updateResource("item", id, body);
    },
    /** Deletes an item by id. */
    deleteItem: function (id) {
      return deleteResource("item", id);
    },

    /** Creates an order via `create_order`. */
    createOrder: function (body) {
      return createResource("order", body);
    },
    /** Updates an order via `update_order`. */
    updateOrder: function (id, body) {
      return updateResource("order", id, body);
    },
    /** Deletes an order by id. */
    deleteOrder: function (id) {
      return deleteResource("order", id);
    },

    /** Creates an order line via `create_order_item`. */
    createOrderItem: function (body) {
      return createResource("order-item", body);
    },
    /** Updates an order line via `update_order_item`. */
    updateOrderItem: function (id, body) {
      return updateResource("order-item", id, body);
    },
    /** Deletes an order line by id. */
    deleteOrderItem: function (id) {
      return deleteResource("order-item", id);
    },

    /** Resets the database to initial sample data via `POST /reset`. */
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
