import axios from "axios";

const washRecordsApi = axios.create({
    baseURL: "http://localhost:8000/api/washrecords/",

});

export const getAllWashRecords = () => {
    return washRecordsApi.get('/');
}