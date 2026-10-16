import { useState, useEffect, useMemo } from 'react';
import { getAllWashRecords, getEmployees } from '../api/washRecords.api';

interface EmployeeUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface Employee {
    id: number;
    user: EmployeeUser;
    phone?: string;
}

interface WashRecord {
    id: number;
    date: string;
    vehicle: string;
    vehicle_plate: string;
    vehicle_type: string;
    service: number;
    service_detail?: {
        id: number;
        name: string;
    };
    employees: number[];
    employees_detail?: Employee[];
    extra_charge: string | number;
    price_charged: string | number;
    total_commission: string | number;
    commission_per_employee: string | number;
}

interface WeekOption {
    weekNumber: number;
    startDateStr: string; // YYYY-MM-DD
    endDateStr: string;   // YYYY-MM-DD (Saturday)
    label: string;
    dateRangeLabel: string;
    payoutLabel: string;
    isCurrent: boolean;
}

export default function SalaryPanel() {
    const [records, setRecords] = useState<WashRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('ALL');
    const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);

    // Cargar datos
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [recordsRes, employeesRes] = await Promise.all([
                    getAllWashRecords(),
                    getEmployees()
                ]);
                const loadedRecords: WashRecord[] = recordsRes.data.results || recordsRes.data || [];
                const loadedEmployees: Employee[] = employeesRes.data.results || employeesRes.data || [];
                setRecords(loadedRecords);
                setEmployees(loadedEmployees);
            } catch (err: any) {
                console.error('Error al cargar datos:', err);
                setErrorMsg('Error al cargar datos de sueldos y lavados. Asegurate de tener la sesión iniciada.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Generador de semanas: Empiezan el Domingo 11 / Lunes 12 de Octubre de 2026.
    // Los pagos son los sábados (Lunes a Sábado).
    const weekOptions = useMemo<WeekOption[]>(() => {
        const weeks: WeekOption[] = [];
        // Base: Domingo 11 de Octubre de 2026
        const baseStart = new Date(2026, 9, 11); // Mes 9 = Octubre en JS (0-indexed)
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Generamos al menos 8 semanas o hasta semanas futuras
        const totalWeeksToGenerate = 8;

        for (let i = 0; i < totalWeeksToGenerate; i++) {
            const start = new Date(baseStart);
            start.setDate(baseStart.getDate() + i * 7);

            const end = new Date(start);
            end.setDate(start.getDate() + 6); // Sábado

            const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
            const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

            const isCurrent = todayStr >= startStr && todayStr <= endStr;

            const formatShort = (d: Date) => `${d.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()]}`;

            weeks.push({
                weekNumber: i + 1,
                startDateStr: startStr,
                endDateStr: endStr,
                label: `Semana ${i + 1}`,
                dateRangeLabel: `${formatShort(start)} al ${formatShort(end)}`,
                payoutLabel: `Pago: Sábado ${end.getDate()} de ${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][end.getMonth()]}`,
                isCurrent
            });
        }
        return weeks;
    }, []);

    // Seleccionar automáticamente la semana actual al iniciar
    useEffect(() => {
        const current = weekOptions.find(w => w.isCurrent);
        if (current) {
            setSelectedWeekNumber(current.weekNumber);
        } else if (weekOptions.length > 0) {
            setSelectedWeekNumber(weekOptions[0].weekNumber);
        }
    }, [weekOptions]);

    const activeWeek = useMemo(() => {
        return weekOptions.find(w => w.weekNumber === selectedWeekNumber) || weekOptions[0];
    }, [weekOptions, selectedWeekNumber]);

    // Extraer fecha local YYYY-MM-DD de un registro
    const getRecordLocalDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr.substring(0, 10);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return dateStr.substring(0, 10);
        }
    };

    // Formatear hora de un registro
    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                const match = dateStr.match(/(\d{2}:\d{2})/);
                return match ? `${match[1]} hs` : dateStr;
            }
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) + ' hs';
        } catch {
            return '';
        }
    };

    const formatDateShort = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr.substring(0, 10);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        } catch {
            return dateStr.substring(0, 10);
        }
    };

    // Filtrar lavados que caen en la semana seleccionada
    const weekRecords = useMemo(() => {
        if (!activeWeek) return [];
        return records.filter(r => {
            const rDate = getRecordLocalDate(r.date);
            return rDate >= activeWeek.startDateStr && rDate <= activeWeek.endDateStr;
        });
    }, [records, activeWeek]);

    // Resumen financiero de la semana
    const weekSummary = useMemo(() => {
        let totalCharged = 0;
        let totalCommission = 0;

        weekRecords.forEach(r => {
            const charged = parseFloat(String(r.price_charged || 0));
            const comm = parseFloat(String(r.total_commission || charged * 0.40));
            totalCharged += isNaN(charged) ? 0 : charged;
            totalCommission += isNaN(comm) ? 0 : comm;
        });

        // Contar empleados únicos que trabajaron
        const activeEmpIds = new Set<number>();
        weekRecords.forEach(r => {
            (r.employees || []).forEach(empId => activeEmpIds.add(empId));
        });

        return {
            totalCharged,
            totalCommission,
            washesCount: weekRecords.length,
            activeEmployeesCount: activeEmpIds.size
        };
    }, [weekRecords]);

    // Desglose y cálculo por empleado en la semana seleccionada
    const employeePayrolls = useMemo(() => {
        return employees.map(emp => {
            // Lavados en los que participó este empleado
            const empWashes = weekRecords.filter(r => (r.employees || []).includes(emp.id));

            // Sumar comisiones asignadas a este empleado
            let totalSalary = 0;
            const washesDetailed = empWashes.map(r => {
                const priceCharged = parseFloat(String(r.price_charged || 0));
                const totalComm = parseFloat(String(r.total_commission || priceCharged * 0.40));
                const count = (r.employees && r.employees.length > 0) ? r.employees.length : 1;
                // Cuánto le corresponde: comisión total / compañeros
                const myShare = Math.round((totalComm / count) * 100) / 100;
                totalSalary += myShare;

                // Compañeros con los que compartió el lavado
                const coworkers = (r.employees_detail || [])
                    .filter(coworker => coworker.id !== emp.id)
                    .map(coworker => coworker.user?.first_name || coworker.user?.username || `ID ${coworker.id}`);

                return {
                    wash: r,
                    priceCharged,
                    totalComm,
                    employeeCount: count,
                    myShare,
                    coworkers
                };
            });

            const empName = emp.user?.first_name
                ? `${emp.user.first_name} ${emp.user.last_name || ''}`.trim()
                : emp.user?.username || `Empleado #${emp.id}`;

            return {
                employee: emp,
                name: empName,
                totalSalary: Math.round(totalSalary * 100) / 100,
                washesCount: empWashes.length,
                washesDetailed
            };
        }).sort((a, b) => b.totalSalary - a.totalSalary);
    }, [employees, weekRecords]);

    // Filtrar la lista de lavados si se selecciona un empleado específico
    const displayedWeekRecords = useMemo(() => {
        if (selectedEmployeeFilter === 'ALL') return weekRecords;
        const empId = parseInt(selectedEmployeeFilter);
        return weekRecords.filter(r => (r.employees || []).includes(empId));
    }, [weekRecords, selectedEmployeeFilter]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-francia-700 font-bold text-lg">
                <span className="w-6 h-6 rounded-full bg-francia-600 animate-ping mb-4"></span>
                <span>Cargando panel de liquidación de sueldos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Encabezado Principal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-rojo-500 rounded-sm"></span>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Sueldos y Liquidación Semanal</h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Liquidación de comisiones de lavados de Lunes a Sábado
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5"
                        title="Imprimir resumen de liquidación"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Imprimir Liquidación</span>
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-rojo-50 border-l-4 border-rojo-600 p-4 rounded-xl text-rojo-700 text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            {/* Selector de Semanas */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        <span>Seleccionar Semana de Pago</span>
                        {activeWeek?.isCurrent && (
                            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                ● Semana en Curso
                            </span>
                        )}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">
                        Fecha base de inicio: <strong className="text-slate-700">11 de Octubre de 2026</strong>
                    </div>
                </div>

                {/* Tabs de semanas */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {weekOptions.map(week => {
                        const isSelected = week.weekNumber === selectedWeekNumber;
                        return (
                            <button
                                key={week.weekNumber}
                                onClick={() => setSelectedWeekNumber(week.weekNumber)}
                                className={`px-4 py-2.5 rounded-xl text-left shrink-0 transition-all border ${isSelected
                                    ? 'bg-francia-700 text-white border-francia-800 shadow-md shadow-francia-700/20 font-bold scale-[1.02]'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-medium'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-sm font-extrabold">{week.label}</span>
                                    {week.isCurrent && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white text-francia-800' : 'bg-green-500 text-white'
                                            }`}>
                                            HOY
                                        </span>
                                    )}
                                </div>
                                <div className={`text-xs ${isSelected ? 'text-francia-100' : 'text-slate-500'}`}>
                                    {week.dateRangeLabel}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* KPIs de la semana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-francia-700 to-francia-800 text-white p-5 rounded-2xl shadow-sm border border-francia-900/20">
                    <div className="text-francia-200 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Sueldos a Pagar
                    </div>
                    <div className="text-3xl font-black">
                        ${weekSummary.totalCommission.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-francia-200 text-xs mt-1.5">
                        40% de la facturación semanal
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Lavados de la Semana
                    </div>
                    <div className="text-3xl font-black text-slate-800">
                        {weekSummary.washesCount}
                    </div>
                    <div className="text-slate-400 text-xs mt-1.5">
                        Vehículos registrados en la semana
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Empleados con Actividad
                    </div>
                    <div className="text-3xl font-black text-slate-800">
                        {weekSummary.activeEmployeesCount} <span className="text-base font-normal text-slate-400">/ {employees.length}</span>
                    </div>
                    <div className="text-slate-400 text-xs mt-1.5">
                        Empleados que participaron en lavados
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Facturación Total Lavadero
                    </div>
                    <div className="text-3xl font-black text-slate-800">
                        ${weekSummary.totalCharged.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-slate-400 text-xs mt-1.5">
                        100% cobrado antes de comisiones
                    </div>
                </div>
            </div>

            {/* Sección: Sueldo por Empleado */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">
                            Liquidación por Empleado ({activeWeek?.label})
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Sueldo a pagar este sábado por cada trabajador
                        </p>
                    </div>
                    {employees.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Filtrar empleado:</span>
                            <select
                                value={selectedEmployeeFilter}
                                onChange={e => setSelectedEmployeeFilter(e.target.value)}
                                className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-francia-600"
                            >
                                <option value="ALL">Todos los empleados ({employees.length})</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.user?.first_name ? `${emp.user.first_name} ${emp.user.last_name || ''}` : emp.user?.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {employeePayrolls.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
                        No hay empleados registrados en el sistema.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employeePayrolls
                            .filter(ep => selectedEmployeeFilter === 'ALL' || String(ep.employee.id) === selectedEmployeeFilter)
                            .map(item => {
                                const isExpanded = expandedEmployeeId === item.employee.id;
                                return (
                                    <div
                                        key={item.employee.id}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-francia-400 transition flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-francia-100 text-francia-700 font-black text-base flex items-center justify-center border border-francia-200">
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg leading-tight">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500">
                                                            Usuario: <span className="font-mono">{item.employee.user?.username}</span>
                                                            {item.employee.phone && ` • Tel: ${item.employee.phone}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                                                        Sueldo Semana
                                                    </span>
                                                    <span className="text-2xl font-black text-emerald-600">
                                                        ${item.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mini métricas */}
                                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs mb-3">
                                                <div>
                                                    <span className="text-slate-500 block">Lavados Realizados</span>
                                                    <strong className="text-slate-800 text-sm font-bold">
                                                        {item.washesCount} {item.washesCount === 1 ? 'lavado' : 'lavados'}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block">Promedio x Lavado</span>
                                                    <strong className="text-slate-800 text-sm font-bold">
                                                        ${item.washesCount > 0
                                                            ? (item.totalSalary / item.washesCount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                            : '0.00'}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón para expandir/ver desglose */}
                                        <div className="pt-2 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedEmployeeId(isExpanded ? null : item.employee.id)}
                                                className="w-full py-2 px-3 text-xs font-bold text-francia-700 hover:bg-francia-50 rounded-xl transition flex items-center justify-between"
                                            >
                                                <span>
                                                    {isExpanded ? 'Ocultar cálculo detallado' : `Ver cálculo de los ${item.washesCount} lavados`}
                                                </span>
                                                <span>{isExpanded ? '▲' : '▼'}</span>
                                            </button>

                                            {/* Desglose expandido */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                                                    <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                                        Cálculo de cada lavado realizado:
                                                    </div>
                                                    {item.washesDetailed.length === 0 ? (
                                                        <p className="text-xs text-slate-400 italic">No participó en ningún lavado esta semana.</p>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                            {item.washesDetailed.map(({ wash, priceCharged, totalComm, employeeCount, myShare, coworkers }) => (
                                                                <div
                                                                    key={wash.id}
                                                                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex flex-col gap-1"
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-bold text-slate-800">
                                                                            {wash.vehicle} ({wash.vehicle_plate})
                                                                        </span>
                                                                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                            +${myShare.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-slate-500 flex justify-between items-center text-[11px]">
                                                                        <span>
                                                                            {formatDateShort(wash.date)} • {formatTime(wash.date)} • {wash.service_detail?.name || 'Servicio'}
                                                                        </span>
                                                                        <span>Cobro: ${priceCharged.toLocaleString('es-AR')}</span>
                                                                    </div>
                                                                    <div className="bg-white px-2 py-1 rounded text-[11px] font-mono text-slate-600 border border-slate-200 flex items-center justify-between">
                                                                        <span>
                                                                            40% de ${priceCharged.toLocaleString('es-AR')} = ${totalComm.toLocaleString('es-AR')} ÷ {employeeCount} {employeeCount === 1 ? 'empleado' : 'empleados'}
                                                                        </span>
                                                                        {coworkers.length > 0 && (
                                                                            <span className="text-slate-400 truncate max-w-[120px]" title={`Compartido con: ${coworkers.join(', ')}`}>
                                                                                con {coworkers.join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Sección: Lista Completa de Lavados de la Semana con Cálculo Realizado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">
                            Lista de Lavados de la {activeWeek?.label} ({displayedWeekRecords.length})
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Detalle de cada lavado realizado y el cálculo de comisión aplicado a los empleados participantes
                        </p>
                    </div>
                    <div className="text-xs font-semibold text-francia-700 bg-francia-50 px-3 py-1.5 rounded-xl border border-francia-200 self-start sm:self-auto">
                        Total Liquidado: ${weekSummary.totalCommission.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {displayedWeekRecords.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <h4 className="font-bold text-slate-700">Sin lavados registrados en esta semana</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            No se encontraron lavados entre el {activeWeek?.dateRangeLabel}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayedWeekRecords.map((record) => {
                            const priceCharged = parseFloat(String(record.price_charged || 0));
                            const totalComm = parseFloat(String(record.total_commission || priceCharged * 0.40));
                            const empCount = (record.employees && record.employees.length > 0) ? record.employees.length : 1;
                            const sharePerEmployee = Math.round((totalComm / empCount) * 100) / 100;

                            return (
                                <div
                                    key={record.id}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-francia-400 hover:shadow-sm transition bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                >
                                    {/* Info del vehículo y servicio */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-slate-900 text-base">
                                                {record.vehicle}
                                            </span>
                                            {record.vehicle_plate && (
                                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                                                    {record.vehicle_plate}
                                                </span>
                                            )}
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${record.vehicle_type === 'AUTO'
                                                ? 'bg-francia-100 text-francia-800'
                                                : record.vehicle_type === 'CAMIONETA'
                                                    ? 'bg-rojo-100 text-rojo-700'
                                                    : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                {record.vehicle_type}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium ml-1">
                                                📅 {formatDateShort(record.date)} • {formatTime(record.date)}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                            <span>
                                                <strong className="text-slate-700">Servicio:</strong> {record.service_detail?.name || 'Servicio'}
                                            </span>
                                            <span>
                                                <strong className="text-slate-700">Cobrado:</strong> ${priceCharged.toLocaleString('es-AR')}
                                            </span>
                                            <span>
                                                <strong className="text-slate-700">Participantes ({empCount}):</strong>{' '}
                                                {record.employees_detail && record.employees_detail.length > 0 ? (
                                                    record.employees_detail.map((e: any) =>
                                                        e.user?.first_name ? `${e.user.first_name} ${e.user.last_name || ''}` : e.user?.username
                                                    ).join(', ')
                                                ) : (
                                                    <span className="text-amber-600 font-semibold">Sin empleados asignados</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Box del Cálculo Realizado */}
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 lg:min-w-[420px]">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                Cálculo Realizado:
                                            </span>
                                            <div className="font-mono text-xs text-slate-800 font-semibold">
                                                ${priceCharged.toLocaleString('es-AR')} × 40% = ${totalComm.toLocaleString('es-AR')}
                                            </div>
                                            <div className="font-mono text-[11px] text-slate-500">
                                                ${totalComm.toLocaleString('es-AR')} ÷ {empCount} {empCount === 1 ? 'empleado' : 'empleados'}
                                            </div>
                                        </div>

                                        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-3">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                                A cada empleado:
                                            </span>
                                            <span className="text-lg font-black text-emerald-600 font-mono">
                                                +${sharePerEmployee.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
