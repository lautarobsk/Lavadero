import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWashRecord, getServices, getEmployees, getCurrentUser } from '../api/washRecords.api';

export default function WashRecordCreate() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [formData, setFormData] = useState<any>({
        vehicle: '',
        vehicle_plate: '',
        vehicle_type: 'AUTO',
        service: '',
        employees: [],
        extra_charge: 0,
    });
    const [services, setServices] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

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
                const user = userRes.data;
                setCurrentUser(user);

                if (!user.is_staff) {
                    setPermissionDenied(true);
                    setLoading(false);
                    return;
                }

                const [servicesRes, employeesRes] = await Promise.all([
                    getServices(),
                    getEmployees()
                ]);
                setServices(servicesRes.data.results || servicesRes.data);
                setEmployees(employeesRes.data.results || employeesRes.data);
            } catch (error: any) {
                console.error('Error al cargar datos:', error);
                if (error.response?.status === 401) {
                    setNotLoggedIn(true);
                } else {
                    setErrorMsg('Error al cargar los datos del formulario.');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoad();
    }, []);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData({ ...formData, employees: options });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.is_staff) {
            setErrorMsg('No tienes permisos de administrador para crear lavados.');
            return;
        }
        try {
            await createWashRecord(formData);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al crear el lavado');
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
                    Debes iniciar sesion con una cuenta autorizada para acceder a esta pagina.
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
                    No tienes permisos para registrar nuevos lavados. Esta accion esta reservada exclusivamente para administradores.
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
                <div>Cargando opciones...</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden my-4">
            <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600">
                <h2 className="text-2xl font-black tracking-tight">Agregar Nuevo Lavado</h2>
                <p className="text-francia-100 text-sm mt-1">Completa los datos del vehiculo y el servicio a realizar</p>
            </div>

            <div className="p-6 sm:p-8">
                {errorMsg && (
                    <div className="bg-rojo-50 border-l-4 border-rojo-600 p-4 rounded-xl text-rojo-700 text-sm font-medium mb-6">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Vehiculo</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                                placeholder="Ej: Toyota Hilux"
                                value={formData.vehicle}
                                onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Patente</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-mono font-bold"
                                placeholder="Ej: AB123CD"
                                value={formData.vehicle_plate}
                                onChange={e => setFormData({ ...formData, vehicle_plate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Tipo de Vehiculo</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                                value={formData.vehicle_type}
                                onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                            >
                                <option value="AUTO">Auto</option>
                                <option value="CAMIONETA">Camioneta / SUV</option>
                                <option value="MOTO">Moto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Servicio</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                                value={formData.service}
                                onChange={e => setFormData({ ...formData, service: e.target.value })}
                                required
                            >
                                <option value="">Seleccione un servicio</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Empleados Asignados</label>
                        <select
                            multiple
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium h-28"
                            value={formData.employees}
                            onChange={handleEmployeeChange}
                        >
                            {employees.map(e => (
                                <option key={e.id} value={e.id} className="py-1">
                                    {e.user?.first_name ? `${e.user.first_name} ${e.user.last_name || ''}`.trim() : (e.user?.username || e.id)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Tip: Manten presionado Ctrl (o Cmd en Mac) para seleccionar varios empleados.</p>
                    </div>

                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Cobro Extra ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                            value={formData.extra_charge}
                            onChange={e => setFormData({ ...formData, extra_charge: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 font-semibold px-6 py-2.5 rounded-xl shadow-sm transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-bold px-7 py-2.5 rounded-xl shadow-md transition"
                        >
                            Crear Lavado
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
