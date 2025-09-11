import axios from "axios";

const API_URL = "http://127.0.0.1:8000/";

const api = axios.create({
  baseURL: API_URL,
});

// 👉 Intercepteur pour attacher le token avant chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 Intercepteur pour gérer l'expiration du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérifie si c'est une erreur 401 et que ce n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Récupère le refresh token
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          console.error("Pas de refresh token, redirection login");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Demande un nouveau access token
        const response = await axios.post(`${API_URL}api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Met à jour localStorage
        localStorage.setItem("access", newAccessToken);

        // Met à jour l'en-tête Authorization
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Relance la requête initiale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expiré, redirection login");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
