import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWashRecord, updateWashRecord, deleteWashRecord, getServices, getEmployees } from '../api/washRecords.api';

export default function WashRecordDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editData, setEditData] = useState<any>({});
    const [services, setServices] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
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
            } catch (error) {
                setErrorMsg('Error al cargar el lavado. Asegurate de tener sesión iniciada.');
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
        try {
            await updateWashRecord(id, editData);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al modificar');
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este lavado?')) return;
        try {
            await deleteWashRecord(id);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al eliminar. ¿Eres admin?');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Panel del Lavado #{id}</h2>

            {errorMsg && <p className="text-red-500 mb-6 bg-red-50 p-4 rounded">{errorMsg}</p>}

            <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Fecha y Hora</label>
                    <input
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.date || ''}
                        onChange={e => setEditData({ ...editData, date: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Vehículo</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle || ''}
                        onChange={e => setEditData({ ...editData, vehicle: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Patente</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle_plate || ''}
                        onChange={e => setEditData({ ...editData, vehicle_plate: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle_type || ''}
                        onChange={e => setEditData({ ...editData, vehicle_type: e.target.value })}
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
                        value={editData.service || ''}
                        onChange={e => setEditData({ ...editData, service: e.target.value })}
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
                        value={editData.employees || []}
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Cobro Extra</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editData.extra_charge || ''}
                            onChange={e => setEditData({ ...editData, extra_charge: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Precio Cobrado</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editData.price_charged || ''}
                            onChange={e => setEditData({ ...editData, price_charged: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition shadow"
                    >
                        Eliminar Lavado
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition shadow"
                        >
                            Volver
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
