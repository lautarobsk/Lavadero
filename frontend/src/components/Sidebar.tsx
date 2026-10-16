import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

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
                    <li>
                        <Link
                            to="/sueldos"
                            className={`block px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${isLinkActive('/sueldos')
                                ? 'bg-white text-francia-800 font-bold shadow-md shadow-black/10'
                                : 'text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            Administración
                        </Link>
                    </li>
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

            <div className="pt-4 border-t border-white/20 mt-auto">
                <Link
                    to="/login"
                    className={`block px-4 py-2.5 rounded-xl transition-colors font-medium text-center border ${isLinkActive('/login')
                        ? 'bg-rojo-600 border-rojo-600 text-white font-bold'
                        : 'border-white/20 text-white/90 hover:bg-rojo-600 hover:border-rojo-600 hover:text-white'
                        }`}
                >
                    Cerrar / Iniciar Sesión
                </Link>
            </div>
        </aside>
    );
}
