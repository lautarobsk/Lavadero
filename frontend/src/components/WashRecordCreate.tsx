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

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Agregar Nuevo Lavado</h2>

            {errorMsg && <p className="text-red-500 mb-6 bg-red-50 p-4 rounded">{errorMsg}</p>}

            <form onSubmit={handleCreate} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Vehículo</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.vehicle}
                        onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Patente</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.vehicle_plate}
                        onChange={e => setFormData({ ...formData, vehicle_plate: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.vehicle_type}
                        onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                    >
                        <option value="AUTO">Auto</option>
                        <option value="CAMIONETA">Camioneta / SUV</option>
                        <option value="MOTO">Moto</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Servicio</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Empleados</label>
                    <select
                        multiple
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.employees}
                        onChange={handleEmployeeChange}
                    >
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.user?.first_name ? `${e.user.first_name} ${e.user.last_name}` : (e.user?.username || e.id)}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd) para seleccionar múltiples.</p>
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Cobro Extra</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.extra_charge}
                        onChange={e => setFormData({ ...formData, extra_charge: e.target.value })}
                    />
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition shadow"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow"
                    >
                        Crear Lavado
                    </button>
                </div>
            </form>
        </div>
    );
}
