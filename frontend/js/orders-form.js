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
 * - Prompted to submit order create/edit forms through backend stored-procedure endpoints.
 * - Prompted to replace existing order items on edit by deleting prior lines and creating the submitted set.
 */

/**
 * Inline order-items table: add/remove rows; derive price, line totals, and order total.
 */
(function (global) {
  /**
   * Escapes HTML special characters in a string for safe insertion into markup.
   * @param {*} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Looks up an item by itemId in the catalog array.
   * @param {object[]} items
   * @param {number|string} itemId
   * @returns {object|null}
   */
  function getItem(items, itemId) {
    if (!itemId) return null;
    return items.find(function (it) {
      return Number(it.itemId) === Number(itemId);
    });
  }

  /**
   * Formats a number as USD currency for display, or em dash when invalid.
   * @param {*} n
   * @returns {string}
   */
  function formatMoney(n) {
    if (n === null || n === undefined || n === "" || Number.isNaN(Number(n))) return "—";
    return "$" + Number(n).toFixed(2);
  }

  /**
   * Parses a currency display string back to a number.
   * @param {*} text
   * @returns {number}
   */
  function parseMoney(text) {
    if (!text) return NaN;
    var cleaned = String(text).replace(/[^0-9.-]/g, "");
    return Number(cleaned);
  }

  /**
   * Builds `<option>` HTML for the item select in an order line row.
   * @param {object[]} items
   * @param {number|string|null|undefined} selectedId
   * @returns {string}
   */
  function buildItemSelectOptions(items, selectedId) {
    var parts = [];
    parts.push('<option value="">— Select item —</option>');
    items.forEach(function (it) {
      var sel =
        selectedId != null && Number(selectedId) === Number(it.itemId)
          ? " selected"
          : "";
      parts.push(
        '<option value="' +
          it.itemId +
          '"' +
          sel +
          ">" +
          escapeHtml(it.title) +
          "</option>"
      );
    });
    return parts.join("");
  }

  /**
   * Coerces quantity input to a positive integer (minimum 1).
   * @param {*} raw
   * @returns {number}
   */
  function normalizeQty(raw) {
    var q = raw === "" || raw === null ? 1 : parseInt(raw, 10);
    if (!Number.isFinite(q) || q < 1) q = 1;
    return q;
  }

  /**
   * Recalculates unit price, line total, and order total for one order-item row.
   * @param {HTMLTableRowElement} tr
   * @param {object[]} items
   * @param {HTMLElement|null} orderTotalEl
   */
  function recalcRow(tr, items, orderTotalEl) {
    var select = tr.querySelector(".oi-item");
    var qtyInput = tr.querySelector(".oi-qty");
    var priceEl = tr.querySelector(".oi-price");
    var lineEl = tr.querySelector(".oi-line");
    if (!select || !qtyInput || !priceEl || !lineEl) return;

    var itemId = select.value;
    var it = itemId ? getItem(items, itemId) : null;
    var priceNum = it != null ? Number(it.price) : NaN;

    qtyInput.min = "1";
    qtyInput.step = "1";

    priceEl.textContent = formatMoney(priceNum);

    var qty = normalizeQty(qtyInput.value);
    qtyInput.value = String(qty);

    var line = !Number.isNaN(priceNum) ? priceNum * qty : NaN;
    lineEl.textContent = formatMoney(line);

    recalcOrderTotal(orderTotalEl, items);
  }

  /**
   * Sums line totals across all order-item rows into the order total display.
   * @param {HTMLElement|null} orderTotalEl
   * @param {object[]} items
   */
  function recalcOrderTotal(orderTotalEl, items) {
    if (!orderTotalEl) return;
    var sum = 0;
    document.querySelectorAll(".order-item-row").forEach(function (tr) {
      var select = tr.querySelector(".oi-item");
      var qtyInput = tr.querySelector(".oi-qty");
      if (!select || !select.value || !qtyInput) return;
      var it = getItem(items, select.value);
      var priceNum = it != null ? Number(it.price) : NaN;
      if (Number.isNaN(priceNum)) return;
      sum += priceNum * normalizeQty(qtyInput.value);
    });
    orderTotalEl.textContent = formatMoney(sum);
  }

  /**
   * Shows or hides the empty-state row based on whether any line rows exist.
   * @param {HTMLTableSectionElement} tbody
   */
  function updateEmptyFlag(tbody) {
    var emptyRow = tbody.querySelector("#order-empty-msg");
    if (!emptyRow) return;
    var count = tbody.querySelectorAll(".order-item-row").length;
    emptyRow.classList.toggle("hidden", count > 0);
  }

  /**
   * Appends a new editable order-item row to the table body.
   * @param {HTMLTableSectionElement} tbody
   * @param {object[]} items
   * @param {HTMLElement|null} orderTotalEl
   * @param {number|string|null|undefined} [itemIdPref]
   * @param {number|string|null|undefined} [qtyPref]
   */
  function appendRow(tbody, items, orderTotalEl, itemIdPref, qtyPref) {
    var qtyVal = qtyPref != null ? normalizeQty(qtyPref) : 1;
    var tr = document.createElement("tr");
    tr.className = "order-item-row";
    tr.innerHTML =
      '<td class="px-2 py-2">' +
      '<select class="oi-item w-full rounded-md border border-gray-300 px-2 py-2 text-sm">' +
      buildItemSelectOptions(items, itemIdPref) +
      "</select>" +
      "</td>" +
      '<td class="w-28 whitespace-nowrap px-2 py-2">' +
      '<input type="number" class="oi-qty w-full rounded-md border border-gray-300 px-2 py-2 text-sm" min="1" step="1" value="' +
      qtyVal +
      '" />' +
      "</td>" +
      '<td class="px-2 py-2">' +
      '<span class="oi-price inline-block min-w-[5rem] rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-500">—</span>' +
      "</td>" +
      '<td class="px-2 py-2">' +
      '<span class="oi-line inline-block min-w-[5rem] rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-500">—</span>' +
      "</td>" +
      '<td class="whitespace-nowrap px-2 py-2 text-right">' +
      '<button type="button" class="oi-remove font-medium text-red-500 hover:text-red-700">Remove</button>' +
      "</td>";

    tbody.appendChild(tr);

    updateEmptyFlag(tbody);
    recalcRow(tr, items, orderTotalEl);
  }

  /**
   * Reads order line payloads from the inline table for API submission.
   * @param {HTMLTableSectionElement} tbody
   * @param {object[]} items
   * @returns {{itemId: number, quantity: number, price: number, lineTotal: number}[]}
   */
  function collectOrderLines(tbody, items) {
    var lines = [];
    tbody.querySelectorAll(".order-item-row").forEach(function (tr) {
      var select = tr.querySelector(".oi-item");
      var qtyInput = tr.querySelector(".oi-qty");
      if (!select || !select.value || !qtyInput) return;
      var itemId = Number(select.value);
      var quantity = normalizeQty(qtyInput.value);
      var it = getItem(items, itemId);
      var price = it != null ? Number(it.price) : NaN;
      if (Number.isNaN(price)) return;
      lines.push({
        itemId: itemId,
        quantity: quantity,
        price: price,
        lineTotal: price * quantity,
      });
    });
    return lines;
  }

  /**
   * Replaces all order lines for an order by deleting existing rows then creating new ones.
   * @param {number|string} orderId
   * @param {object[]} lines
   * @returns {Promise<void>}
   */
  function replaceOrderItems(orderId, lines) {
    return AppApi.fetchOrderItems().then(function (rows) {
      var existing = rows.filter(function (row) {
        return Number(row.orderId) === Number(orderId);
      });
      return existing
        .reduce(function (chain, row) {
          return chain.then(function () {
            return AppApi.deleteOrderItem(row.orderItemId);
          });
        }, Promise.resolve())
        .then(function () {
          return lines.reduce(function (chain, line) {
            return chain.then(function () {
              return AppApi.createOrderItem({
                orderId: orderId,
                itemId: line.itemId,
                quantity: line.quantity,
                price: line.price,
                lineTotal: line.lineTotal,
              });
            });
          }, Promise.resolve());
        });
    });
  }

  /**
   * Wires up the order create/edit form: inline items table, totals, and submit handler.
   * @param {{mode:'create'|'edit', order?:object, orderItems?:object[], items:object[]}} opts
   */
  global.initOrdersForm = function initOrdersForm(opts) {
    var mode = opts.mode;
    var order = opts.order || null;
    var items = opts.items || [];

    var form = document.getElementById("form-order");
    var tbody = document.getElementById("order-items-body");
    var orderTotalEl = document.getElementById("order-total-display");
    var btnAdd = document.getElementById("btn-add-order-item");

    if (!form || !tbody || !orderTotalEl || !btnAdd) return;

    /** Recalculates a single order-item row and the order total. */
    function recalc(tr) {
      recalcRow(tr, items, orderTotalEl);
    }

    tbody.addEventListener("change", function (ev) {
      var tr = ev.target.closest(".order-item-row");
      if (!tr || !tbody.contains(tr)) return;
      if (
        ev.target.classList.contains("oi-item") ||
        ev.target.classList.contains("oi-qty")
      )
        recalc(tr);
    });

    tbody.addEventListener("input", function (ev) {
      var tr = ev.target.closest(".order-item-row");
      if (!tr || !tbody.contains(tr)) return;
      if (ev.target.classList.contains("oi-qty")) recalc(tr);
    });

    tbody.addEventListener("click", function (ev) {
      var rm = ev.target.closest(".oi-remove");
      if (!rm || !tbody.contains(rm)) return;
      var tr = rm.closest(".order-item-row");
      if (!tr) return;
      tr.remove();
      updateEmptyFlag(tbody);
      recalcOrderTotal(orderTotalEl, items);
    });

    btnAdd.addEventListener("click", function () {
      appendRow(tbody, items, orderTotalEl);
    });

    if (mode === "edit" && order) {
      var lines = (opts.orderItems || []).filter(function (oi) {
        return Number(oi.orderId) === Number(order.orderId);
      });
      lines.forEach(function (oi) {
        appendRow(tbody, items, orderTotalEl, oi.itemId, oi.quantity);
      });
    }

    updateEmptyFlag(tbody);
    recalcOrderTotal(orderTotalEl, items);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var customerId = Number(fd.get("customerId"));
      var statusId = Number(fd.get("statusId"));
      var orderTotal = parseMoney(orderTotalEl.textContent.trim());
      var lines = collectOrderLines(tbody, items);

      if (!Number.isFinite(customerId) || !Number.isFinite(statusId)) {
        alert("Customer and status are required.");
        return;
      }

      if (Number.isNaN(orderTotal)) orderTotal = 0;

      var submitPromise;
      if (mode === "create") {
        submitPromise = AppApi.createOrder({
          customerId: customerId,
          statusId: statusId,
          orderTimestamp: AppUtils.currentTimestamp(),
          orderTotal: orderTotal,
        }).then(function (result) {
          return lines.reduce(function (chain, line) {
            return chain.then(function () {
              return AppApi.createOrderItem({
                orderId: result.insertId,
                itemId: line.itemId,
                quantity: line.quantity,
                price: line.price,
                lineTotal: line.lineTotal,
              });
            });
          }, Promise.resolve());
        });
      } else if (order) {
        submitPromise = AppApi.updateOrder(order.orderId, {
          customerId: customerId,
          statusId: statusId,
          orderTimestamp: order.orderTimestamp,
          orderTotal: orderTotal,
        }).then(function () {
          return replaceOrderItems(order.orderId, lines);
        });
      } else {
        return;
      }

      submitPromise
        .then(function () {
          window.location.href = "./orders.html";
        })
        .catch(function (err) {
          alert(err.message || "Failed to save order.");
        });
    });
  };
})(window);
