export const getCorrectImageUrl = (url?: string | null): string => {
  if (!url) return ""

  // Si c’est déjà une URL complète
  if (url.startsWith("http")) {
    return url
  }

  // Construire l’URL complète depuis ton backend Django
  const baseURL = "https://gestionticket-3.onrender.com" // ⚡ adapte si besoin
  let cleanPath = url.startsWith("/") ? url : `/${url}`
  cleanPath = cleanPath.replace(/\/+/g, "/")

  return `${baseURL}${cleanPath}`
}
