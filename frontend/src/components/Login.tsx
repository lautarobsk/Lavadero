import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username, 
                password
            });

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Credenciales inválidas');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate(0);
    };

    const isLoggedIn = !!localStorage.getItem('access_token');

    if (isLoggedIn) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">¿Seguro que desea cerrar sesión?</h2>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Iniciar Sesión</h2>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                >
                    Ingresar
                </button>
            </form>
        </div>
    );
}
