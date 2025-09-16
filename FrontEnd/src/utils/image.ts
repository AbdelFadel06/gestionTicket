export const getCorrectImageUrl = (url?: string | null): string => {
  if (!url) return ""

  // Si c’est déjà une URL complète
  if (url.startsWith("http")) {
    return url
  }

  // Construire l’URL complète depuis ton backend Django
  const baseURL = "http://127.0.0.1:8000" // ⚡ adapte si besoin
  let cleanPath = url.startsWith("/") ? url : `/${url}`
  cleanPath = cleanPath.replace(/\/+/g, "/")

  return `${baseURL}${cleanPath}`
}
