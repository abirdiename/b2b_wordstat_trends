import express from "express";

const app = express();
app.use(express.json());

// ⚠️ СЮДА положи секреты (лучше через env, но для простоты пока так)
const WORDSTAT_TOKEN = process.env.WORDSTAT_TOKEN; // например токен
const WORDSTAT_URL = process.env.WORDSTAT_URL;     // базовый url API

if (!WORDSTAT_TOKEN || !WORDSTAT_URL) {
  console.warn("⚠️ Не заданы WORDSTAT_TOKEN или WORDSTAT_URL в переменных окружения");
}

// Пример endpoint для фронта
app.post("/api/wordstat", async (req, res) => {
  try {
    const { queries, from, to, granularity } = req.body;

    // 1) Сформируй payload как требует Wordstat
    // Ниже псевдо-пример — ты заменишь под реальный формат Wordstat
    const payload = {
      queries,
      from,
      to,
      granularity
    };

    // 2) Запрос в Wordstat API (замени headers/формат под реальный)
    const wsRes = await fetch(`${WORDSTAT_URL}/trend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${WORDSTAT_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!wsRes.ok) {
      const text = await wsRes.text();
      return res.status(502).json({ error: "Wordstat API error", details: text });
    }

    const wsJson = await wsRes.json();

    // 3) Нормализуем ответ в формат фронта:
    // [{date:"YYYY-MM-DD", value:number}, ...]
    const normalized = normalizeWordstat(wsJson, granularity);

    res.json(normalized);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

// ⚠️ Заглушка: здесь надо преобразовать реальный ответ Wordstat
function normalizeWordstat(wsJson, granularity) {
  // ПРИМЕР (замени после того, как увидим настоящий JSON):
  // допустим, wsJson = { points: [{ date: "2025-12-01", value: 123 }, ...] }
  if (wsJson?.points?.length) {
    return wsJson.points.map(p => ({ date: p.date, value: Number(p.value) || 0 }));
  }
  return [];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Proxy running on http://localhost:${PORT}`));
