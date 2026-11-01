// Detects crawlers, link previews, monitors and scripts so they are never counted as visitors.
const BOT_RE = /bot|crawl|spider|slurp|scrap|fetch|preview|monitor|uptime|pingdom|lighthouse|pagespeed|headless|phantom|puppeteer|playwright|selenium|curl|wget|python|java\/|go-http|okhttp|axios|node-|undici|libwww|httpclient|vercel|facebookexternalhit|whatsapp|telegram|discord|slack|twitter|linkedin|embedly|quora|pinterest|ahrefs|semrush|mj12|dotbot|petal|yandex|baidu|duckduck|gptbot|chatgpt|claude|anthropic|perplexity|ccbot|bytespider|amazonbot/i;

export function isBot(ua) {
  const s = String(ua || "").trim();
  if (s.length < 20) return true; // real browsers send long user-agent strings
  return BOT_RE.test(s);
}
