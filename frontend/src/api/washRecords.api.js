import axios from "axios";

const washRecordsApi = axios.create({
    baseURL: "http://localhost:8000/api/washrecords/",
});

washRecordsApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAllWashRecords = () => {
    return washRecordsApi.get('/');
}

export const getWashRecord = (id) => {
    return washRecordsApi.get(`/${id}/`);
}

export const updateWashRecord = (id, data) => {
    return washRecordsApi.patch(`/${id}/`, data);
}

export const deleteWashRecord = (id) => {
    return washRecordsApi.delete(`/${id}/`);
}