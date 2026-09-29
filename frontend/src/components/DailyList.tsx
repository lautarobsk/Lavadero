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
                    <li key={record.id} className="flex gap-6 py-3 border-b border-gray-700 text-black">
                        <span>Vehiculo: {record.vehicle}</span>
                        <span>Tipo: {record.vehicle_type}</span>
                        <span>Servicio: {record.service_detail.name}</span>
                        <span>Precio: {record.price_charged}</span>
                        <span>Fecha: {record.date}</span>
                        <span>Empleados: {record.employees_detail?.map((emp: any) => emp.user.first_name ? `${emp.user.first_name} ${emp.user.last_name}` : emp.user.username).join(', ')}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

}
