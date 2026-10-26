import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWashRecords, getCurrentUser } from '../api/washRecords.api';

export default function DailyList() {
    const [records, setRecords] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const navigate = useNavigate();

    const isAdmin = currentUser?.is_staff || false;

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                const match = dateString.match(/(\d{2}:\d{2})/);
                return match ? `${match[1]} hs` : dateString;
            }
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) + ' hs';
        } catch {
            return '';
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setNotLoggedIn(true);
            setLoading(false);
            return;
        }

        const checkAuthAndLoad = async () => {
            try {
                setLoading(true);
                const userRes = await getCurrentUser();
                setCurrentUser(userRes.data);

                const response = await getAllWashRecords(selectedDate);
                setRecords(response.data.results || response.data);
            } catch (error: any) {
                console.error('Error al cargar datos:', error);
                if (error.response?.status === 401) {
                    setNotLoggedIn(true);
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoad();
    }, [selectedDate]);

    if (notLoggedIn) {
        return (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-francia-100 text-francia-700 font-bold text-lg flex items-center justify-center mx-auto">
                    LP
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
                <p className="text-sm text-slate-500">
                    El registro diario de lavados es exclusivo para el personal del lavadero. Para acceder, debes iniciar sesion con tu cuenta.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex-1 bg-francia-600 hover:bg-francia-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
                    >
                        Iniciar Sesion
                    </button>
                    <button
                        onClick={() => navigate('/contacto')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                    >
                        Ir a Contacto
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-francia-700 font-bold text-base space-y-3">
                <div className="w-6 h-6 rounded-full bg-francia-600 animate-ping"></div>
                <div>Cargando listado de lavados...</div>
            </div>
        );
    }

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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!isAdmin ? (
                        <button
                            onClick={() => navigate('/sueldos')}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center text-sm"
                        >
                            Ver Mi Sueldo
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/lavado/nuevo')}
                            className="w-full sm:w-auto bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>Agregar Lavado</span>
                        </button>
                    )}
                </div>
            </div>

            {records.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Sin registros para esta fecha</h3>
                    <p className="text-sm text-slate-500">
                        {isAdmin
                            ? 'Selecciona otra fecha o agrega un nuevo lavado con el boton superior.'
                            : 'No hay lavados registrados en la fecha seleccionada.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAdmin ? 'hover:border-francia-300' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold text-slate-900 text-lg">
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
                                                <strong className="text-slate-700">Empleados:</strong> {record.employees_detail.map((emp: any) => {
                                                    const name = emp.user?.first_name ? `${emp.user.first_name} ${emp.user.last_name || ''}`.trim() : '';
                                                    return name || (emp.user?.username ? `DNI: ${emp.user.username}` : `Empleado ${emp.id}`);
                                                }).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                <div className="text-right">
                                    <div className="text-xl font-black text-francia-700">
                                        ${record.price_charged}
                                    </div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                        <span>{formatTime(record.date)}</span>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/lavado/${record.id}`)}
                                        className="bg-slate-100 hover:bg-francia-600 hover:text-white text-slate-700 font-bold px-3.5 py-1.5 rounded-xl text-xs transition"
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
