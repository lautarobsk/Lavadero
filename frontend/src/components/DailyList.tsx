import { useState, useEffect } from 'react';
import { getAllWashRecords } from '../api/washRecords.api';

export default function DailyList() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const loadWashRecords = async () => {
            try {
                const response = await getAllWashRecords();
                setRecords(response.data.results || response.data);
            } catch (error) {
                console.error('Error al cargar los registros:', error);
            }
        }
        loadWashRecords();
    }, []);

    return (
        <div>
            <ul>
                {records.map((record) => (
                    <li key={record.id} className="flex gap-6 py-3 border-b border-gray-700 text-blue-300">
                        <span>Vehiculo: {record.vehicle}</span>
                        <span>Tipo: {record.vehicle_type}</span>
                        <span>Servicio: {record.service_detail.name}</span>
                        <span>Precio: {record.price_charged}</span>
                        <span>Fecha: {record.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

}
