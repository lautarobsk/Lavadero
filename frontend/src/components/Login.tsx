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
            <div className="max-w-md mx-auto mt-14 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-center">
                <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600">
                    <h2 className="text-xl font-bold">Sesión Activa</h2>
                </div>
                <div className="p-8">
                    <p className="text-slate-600 mb-6 text-base">¿Estás seguro que deseas cerrar tu sesión actual?</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                        >
                            Volver al Inicio
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-rojo-600 hover:bg-rojo-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-14 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black">
                    🔑
                </div>
                <h2 className="text-2xl font-black tracking-tight">Iniciar Sesión</h2>
                <p className="text-francia-100 text-sm mt-1">Acceso al panel del lavadero</p>
            </div>

            <div className="p-8">
                {error && (
                    <div className="bg-rojo-50 border-l-4 border-rojo-600 p-3.5 rounded-xl text-rojo-700 text-sm font-medium mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nombre de usuario"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-1.5">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md transition mt-2"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
