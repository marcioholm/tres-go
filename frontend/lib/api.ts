import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-tres-go.onrender.com/api";

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Tratar bloqueio de Workspace (Assinatura Inadimplente)
        if (error.response && error.response.status === 402) {
            if (typeof window !== 'undefined') {
                window.location.href = '/blocked';
            }
        }
        return Promise.reject(error);
    }
);
