/**
 * Inline order-items table: add/remove rows; derive price, line totals, and order total.
 * Submit uses alert(...) only until backend wiring (see FK / cascade notes on list-page delete handlers).
 */
(function (global) {
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getItem(items, itemId) {
    if (!itemId) return null;
    return items.find(function (it) {
      return Number(it.itemId) === Number(itemId);
    });
  }

  function formatMoney(n) {
    if (n === null || n === undefined || n === "" || Number.isNaN(Number(n))) return "—";
    return "$" + Number(n).toFixed(2);
  }

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

  function normalizeQty(raw) {
    var q = raw === "" || raw === null ? 1 : parseInt(raw, 10);
    if (!Number.isFinite(q) || q < 1) q = 1;
    return q;
  }

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

  function updateEmptyFlag(tbody) {
    var emptyRow = tbody.querySelector("#order-empty-msg");
    if (!emptyRow) return;
    var count = tbody.querySelectorAll(".order-item-row").length;
    emptyRow.classList.toggle("hidden", count > 0);
  }

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
   * @param {{mode:'create'|'edit', order?:object}} opts
   */
  global.initOrdersForm = function initOrdersForm(opts) {
    var mode = opts.mode;
    var order = opts.order || null;

    var form = document.getElementById("form-order");
    var tbody = document.getElementById("order-items-body");
    var orderTotalEl = document.getElementById("order-total-display");
    var btnAdd = document.getElementById("btn-add-order-item");
    var items = AppData.items;

    if (!form || !tbody || !orderTotalEl || !btnAdd) return;

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
      var lines = AppData.orderItems.filter(function (oi) {
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
      var payload = {};

      fd.forEach(function (v, k) {
        payload[k] = v;
      });

      payload.orderLines = [];

      tbody.querySelectorAll(".order-item-row").forEach(function (tr) {
        var sid = tr.querySelector(".oi-item").value;
        if (!sid) return;
        var qRaw = tr.querySelector(".oi-qty").value;
        payload.orderLines.push({
          itemId: Number(sid),
          quantity: normalizeQty(qRaw),
        });
      });

      var timestampEl = document.getElementById("order-timestamp-display");
      if (timestampEl)
        payload.orderTimestampDisplayNote = timestampEl.textContent.trim();

      payload.orderTotalDerivedDisplay = orderTotalEl.textContent.trim();

      if (mode === "edit" && order) payload.orderId = order.orderId;

      var actionLabel = mode === "edit" ? "Update Order" : "Create Order";

      alert(
        actionLabel + " (no backend yet):\n\n" + JSON.stringify(payload, null, 2)
      );
    });
  };
})(window);
