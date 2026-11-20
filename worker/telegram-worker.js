/**
 * Cloudflare Worker: принимает заявки с сайта «Железно!» и пересылает их в Telegram.
 * Токен бота хранится здесь, в секретах Cloudflare, а не на сайте — так его никто не украдёт.
 *
 * Переменные (Settings → Variables and Secrets):
 *   BOT_TOKEN       — токен от @BotFather (тип Secret)
 *   CHAT_ID         — ваш chat id (узнать у @userinfobot)
 *   ALLOWED_ORIGIN  — адрес сайта, например https://mishpip31-droid.github.io
 */

const LABELS = {
  formType: "📋 Тип", product: "🛒 Товар", item: "🔧 Изделие", size: "📐 Размеры",
  color: "🎨 Цвет", details: "📝 Описание", budget: "💰 Бюджет",
  name: "👤 Имя", phone: "📞 Телефон", contactVia: "💬 Связь",
};
const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024;

const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
    const okOrigin = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": okOrigin ? origin || "*" : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
    if (!okOrigin) return json({ ok: false, error: "origin" }, 403);

    let fd;
    try { fd = await request.formData(); } catch { return json({ ok: false, error: "bad form" }, 400); }
    if (fd.get("website")) return json({ ok: true }); // ловушка для ботов

    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    if (!name || phone.replace(/\D/g, "").length < 9) return json({ ok: false, error: "required" }, 400);

    const lines = ["<b>🔥 Новая заявка — Железно!</b>", ""];
    for (const key of Object.keys(LABELS)) {
      const v = fd.get(key);
      if (typeof v === "string" && v.trim()) lines.push(`${LABELS[key]}: ${escapeHtml(v.trim().slice(0, 1500))}`);
    }

    const api = `https://api.telegram.org/bot${env.BOT_TOKEN}`;
    const msg = await fetch(`${api}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text: lines.join("\n"), parse_mode: "HTML" }),
    });
    if (!msg.ok) return json({ ok: false, error: "telegram" }, 502);

    const files = fd.getAll("photos")
      .filter((f) => f && typeof f === "object" && f.size > 0 && f.size <= MAX_SIZE && /^image\//.test(f.type))
      .slice(0, MAX_FILES);
    for (const file of files) {
      const body = new FormData();
      body.append("chat_id", env.CHAT_ID);
      body.append("document", file, file.name || "photo.jpg");
      body.append("caption", `📎 Фото к заявке от ${name}`);
      await fetch(`${api}/sendDocument`, { method: "POST", body });
    }

    return json({ ok: true });
  },
};
