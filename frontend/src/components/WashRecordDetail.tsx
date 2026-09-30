import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWashRecord, updateWashRecord, deleteWashRecord } from '../api/washRecords.api';

export default function WashRecordDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editData, setEditData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadRecord = async () => {
            try {
                const response = await getWashRecord(id);
                setEditData({
                    vehicle: response.data.vehicle,
                    vehicle_plate: response.data.vehicle_plate,
                    vehicle_type: response.data.vehicle_type
                });
            } catch (error) {
                setErrorMsg('Error al cargar el lavado. Asegurate de tener sesión iniciada.');
            } finally {
                setLoading(false);
            }
        };
        loadRecord();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateWashRecord(id, editData);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.detail || 'Error al modificar. ¿Eres admin?');
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
                    <label className="block text-gray-700 font-semibold mb-2">Vehículo</label>
                    <input 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle || ''} 
                        onChange={e => setEditData({...editData, vehicle: e.target.value})} 
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Patente</label>
                    <input 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle_plate || ''} 
                        onChange={e => setEditData({...editData, vehicle_plate: e.target.value})} 
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editData.vehicle_type || ''} 
                        onChange={e => setEditData({...editData, vehicle_type: e.target.value})}
                    >
                        <option value="AUTO">Auto</option>
                        <option value="CAMIONETA">Camioneta / SUV</option>
                        <option value="MOTO">Moto</option>
                    </select>
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
