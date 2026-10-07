import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWashRecords } from '../api/washRecords.api';

export default function DailyList() {
    const [records, setRecords] = useState<any[]>([]);
    const navigate = useNavigate();

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
            <ul className="bg-white rounded-lg shadow p-4">
                {records.map((record) => (
                    <li
                        key={record.id}
                        onClick={() => navigate(`/lavado/${record.id}`)}
                        className="flex flex-wrap gap-6 py-4 border-b border-gray-200 text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
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
