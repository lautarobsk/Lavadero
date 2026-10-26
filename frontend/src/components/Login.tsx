import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getCurrentUser } from '../api/washRecords.api';

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

    // Estado del formulario de Login
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Estado del formulario de Registro
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regDni, setRegDni] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    const isLoggedIn = !!localStorage.getItem('access_token');

    // Cargar información del usuario actual si está logueado
    useEffect(() => {
        if (isLoggedIn) {
            getCurrentUser()
                .then(res => setCurrentUser(res.data))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setCurrentUser(null);
                });
        }
    }, [isLoggedIn]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const raw = loginUsername.trim();
            const cleanDni = raw.replace(/[\s.-]/g, '');
            // Si el usuario ingresó un DNI (sólo dígitos, opcionalmente con puntos/guiones)
            const usernameToSend = /^\d+$/.test(cleanDni) ? cleanDni : raw;
            const response = await loginUser(usernameToSend, loginPassword);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/');
        } catch (err: any) {
            console.error('Error al iniciar sesión:', err);
            setError(err.response?.data?.detail || 'DNI o contraseña incorrectos.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!regFirstName.trim()) {
            setError('Por favor, ingresá tu nombre.');
            return;
        }

        if (!regLastName.trim()) {
            setError('Por favor, ingresá tu apellido.');
            return;
        }

        const cleanDni = regDni.trim().replace(/[\s.-]/g, '');
        if (!cleanDni) {
            setError('Por favor, ingresá tu DNI.');
            return;
        }

        if (!/^\d{6,10}$/.test(cleanDni)) {
            setError('El DNI debe contener únicamente entre 6 y 10 números.');
            return;
        }

        if (regPassword.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        if (regPassword !== regConfirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const response = await registerUser({
                first_name: regFirstName.trim(),
                last_name: regLastName.trim(),
                dni: cleanDni,
                phone: regPhone.trim(),
                email: regEmail.trim(),
                password: regPassword,
            });

            if (response.data?.tokens) {
                localStorage.setItem('access_token', response.data.tokens.access);
                localStorage.setItem('refresh_token', response.data.tokens.refresh);
            }
            navigate('/');
        } catch (err: any) {
            console.error('Error al registrar cuenta:', err);
            const errData = err.response?.data;
            if (errData?.dni) {
                setError(Array.isArray(errData.dni) ? errData.dni[0] : errData.dni);
            } else if (errData?.username) {
                setError(Array.isArray(errData.username) ? errData.username[0] : errData.username);
            } else if (errData?.first_name) {
                setError(Array.isArray(errData.first_name) ? errData.first_name[0] : errData.first_name);
            } else if (errData?.last_name) {
                setError(Array.isArray(errData.last_name) ? errData.last_name[0] : errData.last_name);
            } else if (errData?.email) {
                setError(Array.isArray(errData.email) ? errData.email[0] : errData.email);
            } else if (errData?.phone) {
                setError(Array.isArray(errData.phone) ? errData.phone[0] : errData.phone);
            } else if (errData?.password) {
                setError(Array.isArray(errData.password) ? errData.password[0] : errData.password);
            } else if (errData?.detail) {
                setError(errData.detail);
            } else {
                setError('Error al registrar la cuenta. Verificá los datos ingresados.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate(0);
    };

    // Si ya está logueado, mostrar panel de sesión activa
    if (isLoggedIn) {
        return (
            <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-center">
                <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                        {currentUser?.first_name ? currentUser.first_name.charAt(0).toUpperCase() : (currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <h2 className="text-2xl font-black">Sesión Activa</h2>
                    <p className="text-francia-100 text-sm mt-1">
                        Has iniciado sesión correctamente
                    </p>
                </div>
                <div className="p-8 space-y-5">
                    {currentUser && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-sm space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Nombre:</span>
                                <strong className="text-slate-800 font-bold">
                                    {currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : currentUser.username}
                                </strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">DNI:</span>
                                <span className="font-mono font-semibold text-slate-700">{currentUser.dni || currentUser.username}</span>
                            </div>
                            {currentUser.phone && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Celular:</span>
                                    <span className="text-slate-700 font-semibold">{currentUser.phone}</span>
                                </div>
                            )}
                            {currentUser.email && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Mail:</span>
                                    <span className="text-slate-700 font-semibold">{currentUser.email}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                                <span className="text-slate-500 font-medium">Rol:</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentUser.is_staff
                                    ? 'bg-rojo-100 text-rojo-700'
                                    : 'bg-francia-100 text-francia-800'
                                    }`}>
                                    {currentUser.is_staff ? 'Administrador' : 'Empleado'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded-xl shadow-sm transition active:scale-95 text-sm"
                        >
                            Ir a Lavados
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex-1 bg-rojo-600 hover:bg-rojo-700 active:scale-95 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            {/* Header con tabs */}
            <div className="bg-gradient-to-r from-francia-700 to-francia-800 p-6 text-white border-b-4 border-rojo-600 text-center">
                <h2 className="text-2xl font-black tracking-tight">
                    {mode === 'LOGIN' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>

                {/* Botones de alternancia Iniciar Sesión / Registrarse */}
                <div className="flex bg-black/20 p-1 rounded-xl mt-4 max-w-xs mx-auto border border-white/10">
                    <button
                        type="button"
                        onClick={() => { setMode('LOGIN'); setError(''); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'LOGIN'
                            ? 'bg-white text-francia-800 shadow-sm'
                            : 'text-white/80 hover:text-white'
                            }`}
                    >
                        Ingresar
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('REGISTER'); setError(''); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'REGISTER'
                            ? 'bg-white text-francia-800 shadow-sm'
                            : 'text-white/80 hover:text-white'
                            }`}
                    >
                        Crear Cuenta
                    </button>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                {error && (
                    <div className="bg-rojo-50 border-l-4 border-rojo-600 p-3.5 rounded-xl text-rojo-700 text-xs sm:text-sm font-medium mb-5">
                        {error}
                    </div>
                )}

                {mode === 'LOGIN' ? (
                    /* FORMULARIO DE INICIO DE SESIÓN */
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                DNI o Usuario
                            </label>
                            <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                placeholder="Ingresá tu DNI o usuario"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Contraseña"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 focus:border-francia-600 transition font-medium text-sm"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md transition mt-2 disabled:opacity-60 text-sm"
                        >
                            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                ) : (
                    /* FORMULARIO DE REGISTRO */
                    <form onSubmit={handleRegister} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={regFirstName}
                                    onChange={(e) => setRegFirstName(e.target.value)}
                                    placeholder="Ej: Juan"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    value={regLastName}
                                    onChange={(e) => setRegLastName(e.target.value)}
                                    placeholder="Ej: Pérez"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                DNI <span className="text-slate-400 font-normal lowercase">(sin puntos)</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={regDni}
                                onChange={(e) => setRegDni(e.target.value)}
                                placeholder="Ej: 38123456"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Celular <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    placeholder="Ej: 341 555-1234"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Mail <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="Ej: juan@ejemplo.com"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    placeholder="Mín. 4 caracteres"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                                    Repetir Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={regConfirmPassword}
                                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                                    placeholder="Repetir contraseña"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600 transition font-medium text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-francia-600 hover:bg-francia-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md transition mt-2 disabled:opacity-60 text-sm"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
