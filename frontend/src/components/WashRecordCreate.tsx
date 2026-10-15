import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWashRecord, getServices, getEmployees } from '../api/washRecords.api';

export default function WashRecordCreate() {
    const navigate = useNavigate();
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
        const loadData = async () => {
            try {
                const [servicesRes, employeesRes] = await Promise.all([
                    getServices(),
                    getEmployees()
                ]);
                setServices(servicesRes.data.results || servicesRes.data);
                setEmployees(employeesRes.data.results || employeesRes.data);
            } catch (error) {
                setErrorMsg('Error al cargar datos. Asegurate de tener sesión iniciada.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData({ ...formData, employees: options });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createWashRecord(formData);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al crear el lavado');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-16 text-francia-700 font-bold text-lg">
            <span className="w-4 h-4 rounded-full bg-francia-600 animate-ping mr-3"></span>
            Cargando opciones...
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden my-4">
            <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600">
                <h2 className="text-2xl font-black tracking-tight">Agregar Nuevo Lavado</h2>
                <p className="text-francia-100 text-sm mt-1">Completa los datos del vehículo y el servicio a realizar</p>
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
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Vehículo</label>
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
                            <label className="block text-slate-700 text-sm font-bold mb-1.5">Tipo de Vehículo</label>
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
                                    {e.user?.first_name ? `${e.user.first_name} ${e.user.last_name || ''}` : (e.user?.username || e.id)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Tip: Mantén presionado Ctrl (o Cmd en Mac) para seleccionar varios empleados.</p>
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
