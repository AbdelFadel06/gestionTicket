// import axios from "axios";

// const API_URL = "https://gestionticket-3.onrender.com/";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// // 👉 Intercepteur pour attacher le token avant chaque requête
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");
//   console.log('Token envoyé:', token);
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   console.log('Headers:', config.headers);
//   return config;
// });

// // 👉 Intercepteur pour gérer l'expiration du token
// // // Dans api.ts - version améliorée
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refresh");
//         if (!refreshToken) {
//           // Pas de refresh token, on supprime les tokens et on laisse le composant gérer la redirection
//           localStorage.removeItem("access");
//           localStorage.removeItem("refresh");
//           return Promise.reject(error);
//         }

//         const response = await axios.post(`${API_URL}api/token/refresh/`, {
//           refresh: refreshToken,
//         });

//         const newAccessToken = response.data.access;
//         localStorage.setItem("access", newAccessToken);
//         api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

//         return api(originalRequest);
//       } catch (refreshError) {
//         // En cas d'erreur, on nettoie et on reject l'erreur
//         localStorage.removeItem("access");
//         localStorage.removeItem("refresh");
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// FrontEnd/src/services/api.js
import axios from 'axios'

const API_URL = 'https://gestionticket-3.onrender.com/'

const api = axios.create({
    baseURL: API_URL,
    withCredentials: false, // ✅ ne pas envoyer les cookies cross-site ici
})

// 👉 Intercepteur : ajout du token à chaque requête
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 👉 Intercepteur : rafraîchissement du token en cas de 401
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh')
                if (!refreshToken) throw new Error('No refresh token')

                const response = await axios.post(`${API_URL}token/refresh/`, {
                    refresh: refreshToken,
                })

                const newAccessToken = response.data.access
                localStorage.setItem('access', newAccessToken)
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

                return api(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
