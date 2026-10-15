import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWashRecords } from '../api/washRecords.api';

export default function DailyList() {
    const [records, setRecords] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadWashRecords = async () => {
            try {
                const response = await getAllWashRecords(selectedDate);
                setRecords(response.data.results || response.data);
            } catch (error) {
                console.error('Error al cargar los registros:', error);
            }
        }
        loadWashRecords();
    }, [selectedDate]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Registros de Lavados</h2>
                        <p className="text-xs text-slate-500 font-medium">Filtrar por fecha</p>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-50 px-3.5 py-2 border border-slate-300 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition"
                    />
                </div>
                <button
                    onClick={() => navigate('/lavado/nuevo')}
                    className="w-full sm:w-auto bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                    <span className="text-lg leading-none">+</span>
                    <span>Agregar Lavado</span>
                </button>
            </div>

            {records.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Sin registros para esta fecha</h3>
                    <p className="text-sm text-slate-500">Seleccioná otra fecha o agregá un nuevo lavado con el botón superior.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            onClick={() => navigate(`/lavado/${record.id}`)}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-francia-500 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                            <div className="flex items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-francia-700 transition-colors">
                                            {record.vehicle}
                                        </h3>
                                        {record.vehicle_plate && (
                                            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-300">
                                                {record.vehicle_plate}
                                            </span>
                                        )}
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${record.vehicle_type === 'AUTO'
                                            ? 'bg-francia-100 text-francia-800'
                                            : record.vehicle_type === 'CAMIONETA'
                                                ? 'bg-rojo-100 text-rojo-700'
                                                : 'bg-slate-200 text-slate-700'
                                            }`}>
                                            {record.vehicle_type}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>
                                            <strong className="text-slate-700">Servicio:</strong> {record.service_detail?.name}
                                        </span>
                                        {record.employees_detail && record.employees_detail.length > 0 && (
                                            <span>
                                                <strong className="text-slate-700">Empleados:</strong> {record.employees_detail.map((emp: any) =>
                                                    emp.user?.first_name ? `${emp.user.first_name} ${emp.user.last_name || ''}` : emp.user?.username
                                                ).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                <div className="text-xl font-black text-francia-700 group-hover:text-rojo-600 transition-colors">
                                    ${record.price_charged}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    {record.date?.substring(0, 10)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
