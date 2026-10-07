import axios from "axios";

const washRecordsApi = axios.create({
    baseURL: "http://localhost:8000/api/",
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
    return washRecordsApi.get('washrecords/');
}

export const getServices = () => {
    return washRecordsApi.get('services/');
}

export const getEmployees = () => {
    return washRecordsApi.get('employees/');
}

export const getWashRecord = (id) => {
    return washRecordsApi.get(`washrecords/${id}/`);
}

export const updateWashRecord = (id, data) => {
    return washRecordsApi.patch(`washrecords/${id}/`, data);
}

export const deleteWashRecord = (id) => {
    return washRecordsApi.delete(`washrecords/${id}/`);
}