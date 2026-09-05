const defaultOrigins = [
  "http://localhost:8080",
  "http://localhost:3101",
  "https://autotick.com.br",
  "https://izing.autotick.com.br"
];

export const getAllowedOrigins = (configured?: string): string[] => {
  const candidates = configured?.trim() ? configured.split(",") : defaultOrigins;
  const origins = new Set<string>();

  candidates.forEach(candidate => {
    const origin = candidate.trim();
    try {
      const parsed = new URL(origin);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.origin === origin
      ) {
        origins.add(origin);
      }
    } catch {
      // Valores inválidos são negados.
    }
  });

  return [...origins];
};
