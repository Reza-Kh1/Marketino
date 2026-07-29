import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL_API,
    withCredentials: true,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiForm = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL_API,
    withCredentials: true,
    timeout: 15000,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

export const apiClientForm = {
    get: <T>(url: string) =>
        apiForm.get<T>(url).then((res) => res.data),

    post: <T>(url: string, data?: any,) =>
        apiForm.post<T>(url, data),

    put: <T>(url: string, data?: any) =>
        apiForm.put<T>(url, data).then((res) => res.data),

    delete: <T>(url: string) =>
        apiForm.delete<T>(url).then((res) => res.data),
};

export const apiClient = {
    get: <T>(url: string) =>
        api.get<T>(url).then((res) => res.data),

    post: <T>(url: string, data?: any,) =>
        api.post<T>(url, data),

    put: <T>(url: string, data?: any) =>
        api.put<T>(url, data).then((res) => res.data),

    delete: <T>(url: string) =>
        api.delete<T>(url).then((res) => res.data),

    patch: <T>(url: string, data?: any) =>
        api.patch<T>(url, data).then((res) => res.data),
};

export const apiCustom = {
    auth: {
        login: (data: any) => api.post("/auth/login", data),
        me: () => api.get("/auth/me"),
    },

    blog: {
        list: () => api.get("/posts"),
        create: (data: any) => api.post("/posts", data),
    },

    chat: {
        rooms: () => api.get("/chat/rooms"),
        sendMessage: (data: any) => api.post("/chat/send", data),
    },
};

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;

        // Network error
        if (!status) {
            console.error("Network error");
        }

        // Unauthorized
        if (status === 401) {
            window.location.href = "/login";
        }

        // Forbidden
        if (status === 403) {
            console.warn("No permission");
        }

        // Server error
        if (status >= 500) {
            console.error("Server error");
        }

        return Promise.reject(err);
    }
);