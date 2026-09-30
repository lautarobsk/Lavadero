import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col p-6 shadow-xl shrink-0">
            <h2 className="text-2xl font-bold mb-8 text-blue-400">Menú</h2>
            <nav className="flex-1">
                <ul className="space-y-4">
                    <li>
                        <Link
                            to="/"
                            className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Lavados
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/contacto"
                            className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Contacto
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="pt-4 border-t border-gray-700 mt-auto">
                <Link
                    to="/login"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Cerrar / Iniciar Sesión
                </Link>
            </div>
        </aside>
    );
}
