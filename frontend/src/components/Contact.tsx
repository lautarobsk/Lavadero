export default function Contact() {
    const latitude = -28.470863;
    const longitude = -65.767511;
    const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=16&output=embed`;
    const googleMapsDirectUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header de la sección */}
            <div className="bg-gradient-to-r from-francia-700 via-francia-800 to-francia-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border-b-4 border-rojo-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="text-xs uppercase tracking-widest font-black text-rojo-400 bg-white/10 px-3 py-1 rounded-full">
                        Atención al Cliente
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                        Lavadero La Costanera
                    </h1>
                    <p className="text-francia-100 mt-1 text-sm sm:text-base">
                        Tu vehículo en las mejores manos. Visitanos o contactanos para coordinar tu turno.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Columna Izquierda: Tarjetas de Información */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Tarjeta Ubicación */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div>
                                <p className="text-xs text-slate-800 font-medium">Nuestra Ubicación</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                            Estamos ubicados sobre la Av. Costanera, con fácil acceso y amplio espacio para la recepción de vehículos.
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-between">
                            <a
                                href={googleMapsDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-francia-700 font-bold hover:underline"
                            >
                                Abrir mapa
                            </a>
                        </div>
                    </div>

                    {/* Tarjeta Horarios */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Horarios de Atención</h3>
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex justify-between py-1 border-b border-slate-100">
                                <span className="font-medium text-slate-700">Lunes a Sabados</span>
                                <span className="font-bold text-francia-700">08:00 - 19:00 hs</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                <img src="/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contacto</span>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800 text-lg">WhatsApp:</h3>
                                    <span className="font-bold text-francia-700 text-lg">3834-XXXXXXX</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Mapa embebido y Contacto WhatsApp */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Contenedor del Mapa */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="w-full h-80 sm:h-96 relative bg-slate-100">
                            <iframe
                                title="Ubicación Lavadero La Costanera"
                                src={mapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
