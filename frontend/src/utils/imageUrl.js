export function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^(data:|blob:)/i.test(raw)) return raw;

  let url = raw.startsWith("//") ? `https:${raw}` : raw;

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "drive.google.com") {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || parsed.searchParams.get("id");
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }

    return parsed.href;
  } catch {
    return url.replace(/\s/g, "%20");
  }
}
