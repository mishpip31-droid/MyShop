(function () {
  "use strict";

  const CFG = window.SHOP_CONFIG || {};
  const PRODUCTS = window.PRODUCTS || [];
  const CATS = { interior: "Для интерьера", garden: "Для сада" };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Рисованные заглушки ---------- */
  const ICONS = {
    candle: '<path d="M30 100h60M40 100V70h40v30M50 70V40M70 70V50M60 70V30"/><path class="glow" d="M50 40c-4-6 0-12 0-14 4 4 4 10 0 14M70 50c-4-6 0-12 0-14 4 4 4 10 0 14M60 30c-4-6 0-12 0-14 4 4 4 10 0 14"/>',
    lamp: '<path d="M35 102h50M60 102V88M38 30h44v58H38zM38 50h44M38 70h44M60 30v58"/><path class="glow" d="M60 46a8 10 0 1 0 .1 0M60 16v14"/>',
    lantern: '<path d="M40 30h40l-6-12H46zM42 30v56h36V30M36 86h48M60 86v20M48 106h24M54 18V10h12v8"/><path class="glow" d="M60 50c-5 7-3 16 0 20 3-4 5-13 0-20z"/>',
    bench: '<path d="M14 60h92M14 70h92M14 40h92M14 50h92M22 40v58M98 40v58M22 78h76M16 98h14M90 98h14"/>',
    table: '<path d="M10 44h100v8H10zM20 52l12 50M100 52l-12 50M32 102h-10M88 102h10M26 76h68"/>',
    bird: '<path d="M30 46 60 22l30 24M36 46v40h48V46M30 86h60M60 86v24M46 66h28"/><path class="glow" d="M56 60c0-6 8-6 8 0s-4 4-4 4 6 1 8 4"/>',
    shoehorn: '<path d="M58 10h4v22M50 10h20M60 32c0 0-6 6-6 22v40c0 10 6 16 6 16s6-6 6-16V54c0-16-6-22-6-22z"/><path class="glow" d="M60 110v4"/>',
    art: '<path d="M60 108V60M60 60c0-20 20-30 34-34M60 72C50 56 30 52 20 52M60 86c10-10 26-10 34-6M80 36c4-6 10-8 14-10-2 6-6 10-14 10zM34 54c-6-4-12-4-16-2 4 4 10 6 16 2zM86 82c4 2 6 6 8 10-6-2-8-6-8-10z"/><circle class="glow" cx="60" cy="60" r="3"/>',
  };

  function placeholder(p) {
    return `<div class="ph" role="img" aria-label="${esc(p.name)}"><svg viewBox="0 0 120 120">${ICONS[p.icon] || ICONS.art}</svg><span class="ph__label">Фото скоро</span></div>`;
  }
  function mediaHTML(p, i = 0) {
    return p.images && p.images.length
      ? `<img src="${esc(p.images[i])}" alt="${esc(p.name)}" loading="lazy">`
      : placeholder(p);
  }
  function priceHTML(p) {
    if (p.price == null) return `<span class="price"><small>Цена по запросу</small></span>`;
    return `<span class="price">${p.priceFrom ? "<small>от</small> " : ""}${p.price} <small>${esc(CFG.currency || "BYN")}</small></span>`;
  }
  function priceText(p) {
    if (p.price == null) return "цена по запросу";
    return `${p.priceFrom ? "от " : ""}${p.price} ${CFG.currency || "BYN"}`;
  }

  /* ---------- Мессенджеры ---------- */
  const SVG = {
    tg: '<svg viewBox="0 0 24 24"><path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1.1-1 .2-1.5L20.6 2.7c.9-.3 1.6.2 1.3 1.6z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.8-.7 13.6 13.6 0 0 1-5.1-4.6c-.6-.8-1.2-2-1.2-3.2s.6-1.8.9-2.1c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2.1 1.3 2.4 1.4.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.2 1.5z"/></svg>',
    vb: '<svg viewBox="0 0 24 24"><path d="M11.4 1.6C8.6 1.7 3.5 2.2 2.2 7c-.6 2.5-.7 5.5-.3 8.2.5 3 2.4 4.6 4.5 5.3v2.6c0 .5.6.7.9.4l2.4-2.6c2.7.2 5.3-.1 7.2-.6 4.1-1.2 5-4.6 5.2-8.8.2-4.6-.5-7.7-2.7-8.9C17.6 1.8 14.8 1.5 11.4 1.6zm4.9 14.1c-.4.6-1.2 1-1.9.9-2.6-.6-5.4-3.2-6.6-5.8-.4-.9-.6-1.6 0-2.3.4-.4 1.2-.9 1.6-.4l1.2 1.6c.3.4.2 1-.2 1.3-.3.3-.4.6-.1 1 .7 1.2 1.6 2.1 2.9 2.7.4.2.7.1 1-.3.4-.5.9-.5 1.4-.2l1.4 1c.4.3.4.8-.7.5z"/></svg>',
  };

  function waLink(text) {
    const t = text ? `?text=${encodeURIComponent(text)}` : "";
    return `https://wa.me/${CFG.phone}${t}`;
  }
  function messengerLinks(text) {
    const out = [];
    if (CFG.telegram) out.push({ cls: "tg", name: "Telegram", href: `https://t.me/${encodeURIComponent(CFG.telegram)}` });
    if (CFG.phone) {
      out.push({ cls: "vb", name: "Viber", href: `viber://chat?number=%2B${CFG.phone}` });
      out.push({ cls: "wa", name: "WhatsApp", href: waLink(text) });
    }
    return out
      .map((m) => `<a class="msg msg--${m.cls}" href="${esc(m.href)}" target="_blank" rel="noopener" aria-label="${m.name}">${SVG[m.cls]}<span>${m.name}</span></a>`)
      .join("");
  }

  /* ---------- Каталог ---------- */
  const grid = $("#grid");
  function renderGrid(filter = "all") {
    const list = PRODUCTS.filter((p) => filter === "all" || p.category === filter);
    grid.innerHTML = list
      .map(
        (p) => `
      <article class="product" tabindex="0" data-id="${esc(p.id)}" aria-label="${esc(p.name)}">
        <div class="product__media">
          ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ""}
          ${mediaHTML(p)}
        </div>
        <div class="product__body">
          <span class="product__cat">${esc(CATS[p.category] || "")}</span>
          <h3 class="product__name">${esc(p.name)}</h3>
          <p class="product__desc">${esc(p.description)}</p>
          <div class="product__foot">${priceHTML(p)}<span class="product__more">Подробнее →</span></div>
        </div>
      </article>`
      )
      .join("");
  }

  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderGrid(btn.dataset.filter);
    })
  );

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product");
    if (card) openModal(card.dataset.id);
  });
  grid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".product");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(card.dataset.id); }
  });

  /* ---------- Окно товара ---------- */
  const modal = $("#modal");
  let lastFocus = null;

  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    lastFocus = document.activeElement;

    const media = $("#mMedia");
    media.innerHTML = `<div class="main">${mediaHTML(p)}</div>` +
      (p.images && p.images.length > 1
        ? `<div class="thumbs">${p.images.map((src, i) => `<img src="${esc(src)}" alt="" data-i="${i}" class="${i ? "" : "is-active"}">`).join("")}</div>`
        : "");
    $$(".thumbs img", media).forEach((t) =>
      t.addEventListener("click", () => {
        $(".main", media).innerHTML = mediaHTML(p, +t.dataset.i);
        $$(".thumbs img", media).forEach((x) => x.classList.toggle("is-active", x === t));
      })
    );

    $("#mCat").textContent = CATS[p.category] || "";
    $("#mTitle").textContent = p.name;
    $("#mPrice").innerHTML = priceHTML(p);
    $("#mDesc").textContent = p.description;
    $("#mSpecs").innerHTML = [["Размер", p.size], ["Цвет", p.color]]
      .filter(([, v]) => v)
      .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`)
      .join("");

    const form = $("#orderForm");
    form.reset();
    form.product.value = `${p.name} (${priceText(p)})`;
    $("#mMessengers").innerHTML = messengerLinks(`Здравствуйте! Хочу заказать: ${p.name} (${priceText(p)}).`);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });

  /* ---------- Уведомления ---------- */
  const toast = $("#toast");
  let toastTimer;
  function notify(msg, isError) {
    toast.textContent = msg;
    toast.classList.toggle("is-error", !!isError);
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 5000);
  }

  /* ---------- Отправка заявок ---------- */
  const MAX_FILES = 3;
  const MAX_SIZE = 10 * 1024 * 1024;

  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach((el) => {
      let bad = !el.value.trim();
      if (el.type === "tel") bad = el.value.replace(/\D/g, "").length < 9;
      el.classList.toggle("is-invalid", bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    const files = form.photos ? Array.from(form.photos.files) : [];
    if (files.length > MAX_FILES) { notify(`Можно прикрепить не больше ${MAX_FILES} фото`, true); return false; }
    if (files.some((f) => f.size > MAX_SIZE)) { notify("Одно из фото больше 10 МБ", true); return false; }
    if (!ok) notify("Заполните обязательные поля", true);
    return ok;
  }

  const LABELS = {
    formType: "Тип", product: "Товар", item: "Изделие", size: "Размеры", color: "Цвет",
    details: "Описание", budget: "Бюджет", name: "Имя", phone: "Телефон", contactVia: "Связь",
  };
  function toText(form) {
    const fd = new FormData(form);
    const lines = [];
    for (const [k, v] of fd.entries()) {
      if (LABELS[k] && typeof v === "string" && v.trim()) lines.push(`${LABELS[k]}: ${v.trim()}`);
    }
    return lines.join("\n");
  }

  async function submit(form) {
    if (form.website && form.website.value) return; // спам-бот
    if (!validate(form)) return;

    const btn = $("button[type=submit]", form);
    const label = btn.textContent;

    // Сервер для Telegram не настроен — открываем WhatsApp с готовым текстом
    if (!CFG.orderEndpoint) {
      const text = "Здравствуйте! Заявка с сайта «Железно!»\n" + toText(form);
      window.open(waLink(text), "_blank", "noopener");
      notify("Откроется WhatsApp с готовым сообщением — просто нажмите «Отправить».");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Отправляем…";
    try {
      const res = await fetch(CFG.orderEndpoint, { method: "POST", body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || res.status);
      form.reset();
      const hint = $("#fileHint");
      if (hint) hint.textContent = "JPG/PNG, до 10 МБ каждый";
      notify("Спасибо! Заявка отправлена — скоро свяжусь с вами 🔥");
      if (form.id === "orderForm") setTimeout(closeModal, 1200);
    } catch (err) {
      notify("Не удалось отправить. Напишите, пожалуйста, в мессенджер.", true);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  $$("#orderForm, #customForm").forEach((f) => {
    f.addEventListener("submit", (e) => { e.preventDefault(); submit(f); });
    f.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  });

  const photos = $("#customForm input[type=file]");
  if (photos) photos.addEventListener("change", () => {
    const n = photos.files.length;
    $("#fileHint").textContent = n ? `Выбрано файлов: ${n}${n > MAX_FILES ? ` (максимум ${MAX_FILES})` : ""}` : "JPG/PNG, до 10 МБ каждый";
  });

  /* ---------- Контакты из настроек ---------- */
  $$("[data-phone]").forEach((el) => (el.textContent = CFG.phoneDisplay || ""));
  $$("[data-phone-link]").forEach((el) => (el.href = `tel:+${CFG.phone}`));
  $$("[data-city]").forEach((el) => (el.textContent = CFG.city || ""));
  $$("[data-hours]").forEach((el) => (el.textContent = CFG.workHours || ""));
  $$("[data-pickup]").forEach((el) => (el.textContent = CFG.pickupAddress || ""));
  $$("[data-delivery]").forEach((el) => (el.textContent = CFG.deliveryInfo || ""));
  $$("[data-messengers], [data-messengers-float]").forEach((el) => (el.innerHTML = messengerLinks("Здравствуйте! Пишу с сайта «Железно!»")));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Мобильное меню ---------- */
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Искры на главном экране ---------- */
  const sparks = $(".hero__sparks");
  if (sparks && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = Math.random() * 100 + "%";
      s.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
      s.style.animationDuration = (6 + Math.random() * 8).toFixed(1) + "s";
      s.style.animationDelay = (Math.random() * 10).toFixed(1) + "s";
      sparks.appendChild(s);
    }
  }

  renderGrid();
})();
