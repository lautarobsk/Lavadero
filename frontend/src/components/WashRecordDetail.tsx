import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWashRecord, updateWashRecord, deleteWashRecord, getServices, getEmployees, getCurrentUser } from '../api/washRecords.api';

export default function WashRecordDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [services, setServices] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setNotLoggedIn(true);
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const userRes = await getCurrentUser();
                const user = userRes.data;
                setCurrentUser(user);

                // El empleado no debe poder ingresar al panel de edicion
                if (!user.is_staff) {
                    setPermissionDenied(true);
                    setLoading(false);
                    return;
                }

                const [recordRes, servicesRes, employeesRes] = await Promise.all([
                    getWashRecord(id),
                    getServices(),
                    getEmployees()
                ]);
                setServices(servicesRes.data.results || servicesRes.data);
                setEmployees(employeesRes.data.results || employeesRes.data);

                const response = recordRes;
                setEditData({
                    vehicle: response.data.vehicle,
                    vehicle_plate: response.data.vehicle_plate,
                    vehicle_type: response.data.vehicle_type,
                    service: response.data.service,
                    employees: response.data.employees,
                    extra_charge: response.data.extra_charge,
                    price_charged: response.data.price_charged,
                    date: response.data.date ? response.data.date.substring(0, 16) : ''
                });
            } catch (error: any) {
                console.error('Error al cargar datos:', error);
                if (error.response?.status === 401) {
                    setNotLoggedIn(true);
                } else {
                    setErrorMsg('Error al cargar el lavado. Asegurate de tener sesion iniciada.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setEditData({ ...editData, employees: options });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.is_staff) {
            setErrorMsg('No tienes permisos de administrador para modificar lavados.');
            return;
        }
        try {
            await updateWashRecord(id, editData);
            setSuccessMsg('Lavado actualizado correctamente.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al modificar el lavado.');
        }
    };

    const handleDelete = async () => {
        if (!currentUser?.is_staff) {
            setErrorMsg('No tienes permisos de administrador para eliminar lavados.');
            return;
        }
        if (!confirm('Deseas eliminar este registro de lavado?')) return;
        try {
            await deleteWashRecord(id);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al eliminar. Requiere permisos de administrador.');
        }
    };

    if (notLoggedIn) {
        return (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-francia-100 text-francia-700 font-bold text-lg flex items-center justify-center mx-auto">
                    LP
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
                <p className="text-sm text-slate-500">
                    Debes iniciar sesion con una cuenta autorizada para acceder al panel.
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

    if (permissionDenied) {
        return (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-sm border border-rojo-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rojo-100 text-rojo-700 font-bold text-lg flex items-center justify-center mx-auto">
                    AD
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Denegado</h2>
                <p className="text-sm text-slate-600">
                    No tienes permisos para ingresar al panel de edicion de lavados. Esta seccion es exclusiva para administradores.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-francia-600 hover:bg-francia-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
                >
                    Volver al Listado de Lavados
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-francia-700 font-bold text-base space-y-3">
                <div className="w-6 h-6 rounded-full bg-francia-600 animate-ping"></div>
                <div>Cargando panel de edicion...</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden my-4">
            <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Editar Lavado #{id}</h2>
                    <p className="text-francia-100 text-sm mt-1">
                        Actualiza la informacion del vehiculo o servicio
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition"
                >
                    Volver
                </button>
            </div>

            <div className="p-6 sm:p-8">
                {errorMsg && (
                    <div className="bg-rojo-50 border-l-4 border-rojo-600 p-4 rounded-xl text-rojo-700 text-sm font-medium mb-6">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-xl text-emerald-700 text-sm font-medium mb-6">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium"
                            value={editData.date || ''}
                            onChange={e => setEditData({ ...editData, date: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Vehiculo</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium"
                                value={editData.vehicle || ''}
                                onChange={e => setEditData({ ...editData, vehicle: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Patente</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-mono font-bold uppercase"
                                value={editData.vehicle_plate || ''}
                                onChange={e => setEditData({ ...editData, vehicle_plate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Tipo</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium"
                                value={editData.vehicle_type || ''}
                                onChange={e => setEditData({ ...editData, vehicle_type: e.target.value })}
                            >
                                <option value="AUTO">Auto</option>
                                <option value="CAMIONETA">Camioneta / SUV</option>
                                <option value="MOTO">Moto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Servicio</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium"
                                value={editData.service || ''}
                                onChange={e => setEditData({ ...editData, service: e.target.value })}
                            >
                                <option value="">Seleccione un servicio</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Empleados Participantes</label>
                        <select
                            multiple
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium h-28"
                            value={editData.employees || []}
                            onChange={handleEmployeeChange}
                        >
                            {employees.map(e => {
                                const fullName = e.user?.first_name ? `${e.user.first_name} ${e.user.last_name || ''}`.trim() : '';
                                const label = fullName || (e.user?.username ? `DNI: ${e.user.username}` : `Empleado ${e.id}`);
                                return (
                                    <option key={e.id} value={e.id} className="py-1">
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Tip: Manten presionado Ctrl (o Cmd en Mac) para seleccionar multiples.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Cobro Extra ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium"
                                value={editData.extra_charge || ''}
                                onChange={e => setEditData({ ...editData, extra_charge: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Precio Cobrado ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-bold text-francia-700"
                                value={editData.price_charged || ''}
                                onChange={e => setEditData({ ...editData, price_charged: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full sm:w-auto bg-rojo-600 hover:bg-rojo-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition"
                        >
                            Eliminar Lavado
                        </button>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition text-center"
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition text-center"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
