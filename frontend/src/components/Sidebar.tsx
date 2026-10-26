import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/washRecords.api';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            getCurrentUser()
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                });
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        navigate('/login');
    };

    const isLinkActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-francia-800 via-francia-700 to-francia-900 text-white min-h-screen flex flex-col p-6 shadow-2xl shrink-0 border-r border-francia-900/40">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-2.5 h-6 bg-rojo-500 rounded-sm"></div>
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Menú</h2>
            </div>

            <nav className="flex-1">
                <ul className="space-y-2.5">
                    {user && (
                        <li>
                            <Link
                                to="/"
                                className={`block px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isLinkActive('/')
                                    ? 'bg-white text-francia-800 font-bold shadow-md shadow-black/10'
                                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                Lavados
                            </Link>
                        </li>
                    )}

                    {user?.is_staff && (
                        <li>
                            <Link
                                to="/lavado/nuevo"
                                className={`block px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isLinkActive('/lavado/nuevo')
                                    ? 'bg-white text-francia-800 font-bold shadow-md shadow-black/10'
                                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                Agregar Lavado
                            </Link>
                        </li>
                    )}

                    {user && (
                        <li>
                            <Link
                                to="/sueldos"
                                className={`block px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isLinkActive('/sueldos')
                                    ? 'bg-white text-francia-800 font-bold shadow-md shadow-black/10'
                                    : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                {user.is_staff ? 'Panel de Sueldos' : 'Mi Sueldo'}
                            </Link>
                        </li>
                    )}

                    <li>
                        <Link
                            to="/contacto"
                            className={`block px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isLinkActive('/contacto')
                                ? 'bg-white text-francia-800 font-bold shadow-md shadow-black/10'
                                : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            Contacto
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Sección de Usuario / Sesión */}
            <div className="pt-4 border-t border-white/20 mt-auto">
                {user ? (
                    <div className="space-y-3">
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/20 font-bold text-white flex items-center justify-center shrink-0 text-sm">
                                {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-bold text-xs text-white truncate">
                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user.dni ? `DNI ${user.dni}` : user.username)}
                                </div>
                                <span className={`inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                    user.is_staff 
                                        ? 'bg-rojo-500 text-white' 
                                        : 'bg-white/20 text-francia-100'
                                }`}>
                                    {user.is_staff ? 'Admin' : 'Empleado'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-rojo-600/80 border border-white/15 transition flex items-center justify-center"
                        >
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className={`block px-4 py-2.5 rounded-xl transition-colors font-medium text-center text-xs border ${isLinkActive('/login')
                            ? 'bg-rojo-600 border-rojo-600 text-white font-bold'
                            : 'border-white/20 text-white/90 hover:bg-rojo-600 hover:border-rojo-600 hover:text-white'
                            }`}
                    >
                        Iniciar Sesión / Registrarse
                    </Link>
                )}
            </div>
        </aside>
    );
}
