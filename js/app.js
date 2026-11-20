(function () {
  "use strict";

  const CFG = window.SHOP_CONFIG || {};
  const PRODUCTS = window.PRODUCTS || [];
  const CATS = { interior: "Для дома", garden: "Для сада" };
  const ORDERS_OPEN = CFG.ordersOpen !== false;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.documentElement.classList.add("js");

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

  const placeholder = (p) =>
    `<div class="ph ph--${esc(p.category)}" role="img" aria-label="${esc(p.name)}"><svg viewBox="0 0 120 120">${ICONS[p.icon] || ICONS.art}</svg><span class="ph__label">фото скоро</span></div>`;
  const mediaHTML = (p, i = 0) =>
    p.images && p.images.length ? `<img src="${esc(p.images[i])}" alt="${esc(p.name)}" loading="lazy">` : placeholder(p);
  const cur = () => esc(CFG.currency || "BYN");
  function priceHTML(p) {
    if (p.price == null) return `<span class="price"><small>по запросу</small></span>`;
    return `<span class="price">${p.priceFrom ? "<small>от</small> " : ""}${p.price} <small>${cur()}</small></span>`;
  }
  function priceText(p) {
    if (p.price == null) return "цена по запросу";
    return `${p.priceFrom ? "от " : ""}${p.price} ${CFG.currency || "BYN"}`;
  }

  /* ---------- Мессенджеры ---------- */
  const SVG = {
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1.1-1 .2-1.5L20.6 2.7c.9-.3 1.6.2 1.3 1.6z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.8-.7 13.6 13.6 0 0 1-5.1-4.6c-.6-.8-1.2-2-1.2-3.2s.6-1.8.9-2.1c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2.1 1.3 2.4 1.4.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.2 1.5z"/></svg>',
    vb: '<svg viewBox="0 0 24 24"><path d="M11.4 1.6C8.6 1.7 3.5 2.2 2.2 7c-.6 2.5-.7 5.5-.3 8.2.5 3 2.4 4.6 4.5 5.3v2.6c0 .5.6.7.9.4l2.4-2.6c2.7.2 5.3-.1 7.2-.6 4.1-1.2 5-4.6 5.2-8.8.2-4.6-.5-7.7-2.7-8.9C17.6 1.8 14.8 1.5 11.4 1.6zm4.9 14.1c-.4.6-1.2 1-1.9.9-2.6-.6-5.4-3.2-6.6-5.8-.4-.9-.6-1.6 0-2.3.4-.4 1.2-.9 1.6-.4l1.2 1.6c.3.4.2 1-.2 1.3-.3.3-.4.6-.1 1 .7 1.2 1.6 2.1 2.9 2.7.4.2.7.1 1-.3.4-.5.9-.5 1.4-.2l1.4 1c.4.3.4.8-.7.5z"/></svg>',
  };
  const waLink = (text) => `https://wa.me/${CFG.phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  function messengerLinks(text) {
    const out = [];
    const tg = CFG.telegram ? encodeURIComponent(CFG.telegram) : CFG.phone ? `+${CFG.phone}` : "";
    if (tg) out.push({ cls: "tg", name: "Telegram", href: `https://t.me/${tg}` });
    if (CFG.phone) {
      out.push({ cls: "vb", name: "Viber", href: `viber://chat?number=%2B${CFG.phone}` });
      out.push({ cls: "wa", name: "WhatsApp", href: waLink(text) });
    }
    return out
      .map((m) => `<a class="msg msg--${m.cls}" href="${esc(m.href)}" target="_blank" rel="noopener" aria-label="${m.name}">${SVG[m.cls]}<span>${m.name}</span></a>`)
      .join("");
  }

  /* ---------- Появление при прокрутке ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }), { rootMargin: "0px 0px -6% 0px" })
    : null;
  function observeReveals(root = document) {
    $$(".reveal:not(.is-in)", root).forEach((el, i) => {
      if (!io) return el.classList.add("is-in");
      if (el.closest(".grid, .process, .hero__content")) el.style.transitionDelay = (i % 4) * 90 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Каталог ---------- */
  const grid = $("#grid");
  function renderGrid(filter = "all") {
    grid.innerHTML = PRODUCTS.filter((p) => filter === "all" || p.category === filter)
      .map((p) => `
      <article class="product reveal" tabindex="0" data-id="${esc(p.id)}" aria-label="${esc(p.name)}">
        <div class="product__media">
          ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ""}
          ${mediaHTML(p)}
          <span class="product__open" aria-hidden="true">→</span>
        </div>
        <div class="product__body">
          <div class="product__top"><h3 class="product__name">${esc(p.name)}</h3>${priceHTML(p)}</div>
          <p class="product__meta">${esc(CATS[p.category] || "")}${p.size ? " · " + esc(p.size) : ""}</p>
        </div>
      </article>`)
      .join("");
    observeReveals(grid);
  }
  function setFilter(f) {
    $$(".filter").forEach((b) => b.classList.toggle("is-active", b.dataset.filter === f));
    renderGrid(f);
  }
  $$(".filter").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  $$(".cat[data-cat]").forEach((c) => c.addEventListener("click", () => setFilter(c.dataset.cat)));

  const plural = (n) =>
    n % 10 === 1 && n % 100 !== 11 ? "изделие" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "изделия" : "изделий";
  $$("[data-count]").forEach((el) => {
    const n = PRODUCTS.filter((p) => p.category === el.dataset.count).length;
    el.textContent = `${n} ${plural(n)} в каталоге`;
  });

  grid.addEventListener("click", (e) => { const c = e.target.closest(".product"); if (c) openModal(c.dataset.id); });
  grid.addEventListener("keydown", (e) => {
    const c = e.target.closest(".product");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(c.dataset.id); }
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
    $$(".thumbs img", media).forEach((t) => t.addEventListener("click", () => {
      $(".main", media).innerHTML = mediaHTML(p, +t.dataset.i);
      $$(".thumbs img", media).forEach((x) => x.classList.toggle("is-active", x === t));
    }));
    $("#mCat").textContent = CATS[p.category] || "";
    $("#mTitle").textContent = p.name;
    $("#mPrice").innerHTML = priceHTML(p);
    $("#mDesc").textContent = p.description;
    $("#mSpecs").innerHTML = [["Размер", p.size], ["Цвет", p.color], ["Изготовление", "ручная работа, Минск"]]
      .filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
    const form = $("#orderForm");
    form.reset();
    form.product.value = `${p.name} (${priceText(p)})`;
    $("#mMessengers").innerHTML = messengerLinks(ORDERS_OPEN
      ? `Здравствуйте! Хочу заказать: ${p.name} (${priceText(p)}).`
      : `Здравствуйте! Вопрос про ${p.name}.`) +
      (CFG.phone ? `<a class="msg msg--call" href="tel:+${esc(CFG.phone)}">${SVG.call}<span>${esc(CFG.phoneDisplay || "+" + CFG.phone)}</span></a>` : "");
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

  /* ---------- Заявки ---------- */
  const MAX_FILES = 3, MAX_SIZE = 10 * 1024 * 1024;
  const FILE_HINT = "До 3 фото, JPG/PNG, до 10 МБ каждое";
  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach((el) => {
      const bad = el.type === "tel" ? el.value.replace(/\D/g, "").length < 9 : !el.value.trim();
      el.classList.toggle("is-invalid", bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    const files = form.photos ? Array.from(form.photos.files) : [];
    if (files.length > MAX_FILES) { notify(`Можно прикрепить не больше ${MAX_FILES} фото`, true); return false; }
    if (files.some((f) => f.size > MAX_SIZE)) { notify("Одно из фото больше 10 МБ", true); return false; }
    if (!ok) notify("Заполните обязательные поля", true);
    return ok;
  }
  const LABELS = { formType: "Тип", product: "Товар", item: "Изделие", size: "Размеры", color: "Цвет",
    details: "Описание", budget: "Бюджет", name: "Имя", phone: "Телефон", contactVia: "Связь" };
  function toText(form) {
    const lines = [];
    for (const [k, v] of new FormData(form).entries())
      if (LABELS[k] && typeof v === "string" && v.trim()) lines.push(`${LABELS[k]}: ${v.trim()}`);
    return lines.join("\n");
  }
  async function submit(form) {
    if (!ORDERS_OPEN) return;
    if (form.website && form.website.value) return;
    if (!validate(form)) return;
    if (!CFG.orderEndpoint) {
      window.open(waLink("Здравствуйте! Заявка с сайта «Железно!»\n" + toText(form)), "_blank", "noopener");
      notify("Откроется WhatsApp с готовым сообщением — просто нажмите «Отправить».");
      return;
    }
    const btn = $("button[type=submit]", form), label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Отправляем…";
    try {
      const res = await fetch(CFG.orderEndpoint, { method: "POST", body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || res.status);
      form.reset();
      const hint = $("#fileHint"); if (hint) hint.textContent = FILE_HINT;
      notify("Спасибо! Заявка отправлена — скоро свяжусь с вами.");
      if (form.id === "orderForm") setTimeout(closeModal, 1200);
    } catch (err) {
      notify("Не удалось отправить. Напишите, пожалуйста, в мессенджер.", true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  }
  $$("#orderForm, #customForm").forEach((f) => {
    f.addEventListener("submit", (e) => { e.preventDefault(); submit(f); });
    f.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  });
  const photos = $("#customForm input[type=file]");
  if (photos) photos.addEventListener("change", () => {
    const n = photos.files.length;
    $("#fileHint").textContent = n ? `Выбрано файлов: ${n}${n > MAX_FILES ? ` (максимум ${MAX_FILES})` : ""}` : FILE_HINT;
  });

  /* ---------- Контакты из настроек ---------- */
  const setText = (sel, v) => $$(sel).forEach((el) => (el.textContent = v || ""));
  setText("[data-phone]", CFG.phoneDisplay);
  $$("[data-phone-link]").forEach((el) => (el.href = `tel:+${CFG.phone}`));
  setText("[data-city]", CFG.city);
  setText("[data-hours]", CFG.workHours);
  setText("[data-pickup]", CFG.pickupAddress);
  setText("[data-delivery]", CFG.deliveryInfo);
  setText("[data-faq-delivery]", `Самовывоз: ${CFG.pickupAddress || ""}. ${CFG.deliveryInfo || ""} Оплата наличными или переводом при получении, для изделий на заказ — предоплата 30–50%.`);
  $$("[data-messengers], [data-messengers-float]").forEach((el) => (el.innerHTML = messengerLinks("Здравствуйте! Пишу с сайта «Железно!»")));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Плашка «сайт в разработке» ---------- */
  const notice = $("#notice");
  if (notice && CFG.notice) {
    let hidden = false;
    try { hidden = sessionStorage.getItem("noticeHidden") === "1"; } catch (e) {}
    if (!hidden) {
      $(".notice__text", notice).textContent = CFG.notice;
      notice.hidden = false;
      $(".notice__close", notice).addEventListener("click", () => {
        notice.hidden = true;
        try { sessionStorage.setItem("noticeHidden", "1"); } catch (e) {}
      });
    }
  }

  /* ---------- Заказы ещё не принимаются ---------- */
  if (!ORDERS_OPEN) {
    document.documentElement.classList.add("orders-closed");
    $$("#orderForm, #customForm").forEach((f) => {
      $$("input, select, textarea, button", f).forEach((el) => (el.disabled = true));
      const btn = $("button[type=submit]", f);
      btn.textContent = "Приём заказов скоро откроется";
      const note = document.createElement("p");
      note.className = "form__closed";
      note.textContent = "Мастерская готовится к открытию, заказы пока не принимаются. Вопросы можно задать в мессенджерах.";
      f.prepend(note);
    });
    $(".modal__or").textContent = "Есть вопрос? Напишите";
  }

  /* ---------- Мобильное меню ---------- */
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => burger.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Шапка и плавающие кнопки ---------- */
  const header = $(".header"), floatMsg = $(".float-msg");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", scrollY > 10);
    floatMsg.classList.toggle("is-visible", scrollY > innerHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Светлячки ---------- */
  const sparks = $(".hero__sparks");
  if (sparks && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = Math.random() * 100 + "%";
      s.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
      s.style.animationDuration = (7 + Math.random() * 8).toFixed(1) + "s";
      s.style.animationDelay = (Math.random() * 10).toFixed(1) + "s";
      sparks.appendChild(s);
    }
  }

  renderGrid();
  observeReveals();
})();
