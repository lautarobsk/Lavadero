import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWashRecords, getEmployees, getCurrentUser } from '../api/washRecords.api';

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
    startDateStr: string;
    endDateStr: string;
    label: string;
    dateRangeLabel: string;
    payoutLabel: string;
    isCurrent: boolean;
}

const getEmployeeDisplayName = (user?: EmployeeUser | any, fallbackId?: number): string => {
    if (!user) return fallbackId ? `Empleado ${fallbackId}` : 'Empleado';
    const first = user.first_name?.trim() || '';
    const last = user.last_name?.trim() || '';
    if (first || last) {
        return `${first} ${last}`.trim();
    }
    if (user.dni || user.username) {
        return `DNI ${user.dni || user.username}`;
    }
    return fallbackId ? `Empleado ${fallbackId}` : 'Empleado';
};

export default function SalaryPanel() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [records, setRecords] = useState<WashRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('ALL');

    const isAdmin = currentUser?.is_staff || false;
    const currentEmployeeId = currentUser?.employee_id;

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setNotLoggedIn(true);
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setErrorMsg('');

                const userRes = await getCurrentUser();
                const user = userRes.data;
                setCurrentUser(user);

                if (user.is_staff) {
                    const [recordsRes, employeesRes] = await Promise.all([
                        getAllWashRecords({ panel: 'true' }),
                        getEmployees()
                    ]);
                    setRecords(recordsRes.data.results || recordsRes.data || []);
                    setEmployees(employeesRes.data.results || employeesRes.data || []);
                } else {
                    const recordsRes = await getAllWashRecords({ mine: 'true', panel: 'true' });
                    setRecords(recordsRes.data.results || recordsRes.data || []);
                    setEmployees([]);
                }
            } catch (err: any) {
                console.error('Error al cargar datos del panel:', err);
                if (err.response?.status === 401) {
                    setNotLoggedIn(true);
                } else {
                    setErrorMsg('Error al cargar datos de sueldos y lavados. Verifique la conexion.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const weekOptions = useMemo<WeekOption[]>(() => {
        const weeks: WeekOption[] = [];
        const baseStart = new Date(2026, 8, 27);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const monthShortNames = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const totalWeeks = 8;

        for (let i = 0; i < totalWeeks; i++) {
            const start = new Date(baseStart);
            start.setDate(baseStart.getDate() + i * 7);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
            const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

            const isCurrent = todayStr >= startStr && todayStr <= endStr;

            weeks.push({
                weekNumber: i + 1,
                startDateStr: startStr,
                endDateStr: endStr,
                label: `Semana ${i + 1}`,
                dateRangeLabel: `${start.getDate()} ${monthShortNames[start.getMonth()]} al ${end.getDate()} ${monthShortNames[end.getMonth()]}`,
                payoutLabel: `Liquidacion: Sabado ${end.getDate()} de ${monthNames[end.getMonth()]}`,
                isCurrent
            });
        }
        return weeks;
    }, []);

    useEffect(() => {
        if (!isAdmin && currentEmployeeId && records.length > 0) {
            for (let i = weekOptions.length - 1; i >= 0; i--) {
                const w = weekOptions[i];
                const hasWashes = records.some(r => {
                    const rDate = getRecordLocalDate(r.date);
                    return rDate >= w.startDateStr && rDate <= w.endDateStr && (r.employees || []).map(Number).includes(Number(currentEmployeeId));
                });
                if (hasWashes) {
                    setSelectedWeekNumber(w.weekNumber);
                    return;
                }
            }
        }
        const current = weekOptions.find(w => w.isCurrent);
        if (current) {
            setSelectedWeekNumber(current.weekNumber);
        } else if (weekOptions.length > 0) {
            setSelectedWeekNumber(weekOptions[weekOptions.length - 1].weekNumber);
        }
    }, [weekOptions, records, isAdmin, currentEmployeeId]);

    const activeWeek = useMemo(() => {
        return weekOptions.find(w => w.weekNumber === selectedWeekNumber) || weekOptions[0];
    }, [weekOptions, selectedWeekNumber]);

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
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        } catch {
            return dateStr.substring(0, 10);
        }
    };

    const weekRecords = useMemo(() => {
        if (!activeWeek) return [];
        return records.filter(r => {
            const rDate = getRecordLocalDate(r.date);
            return rDate >= activeWeek.startDateStr && rDate <= activeWeek.endDateStr;
        });
    }, [records, activeWeek]);

    const weekSalaries = useMemo(() => {
        const map: Record<number, number> = {};
        if (!currentEmployeeId) return map;
        weekOptions.forEach(w => {
            const wRecords = records.filter(r => {
                const rDate = getRecordLocalDate(r.date);
                return rDate >= w.startDateStr && rDate <= w.endDateStr && (r.employees || []).map(Number).includes(Number(currentEmployeeId));
            });
            let sum = 0;
            wRecords.forEach(r => {
                const price = parseFloat(String(r.price_charged || 0));
                const totalComm = parseFloat(String(r.total_commission || price * 0.40));
                const count = (r.employees && r.employees.length > 0) ? r.employees.length : 1;
                sum += Math.round((totalComm / count) * 100) / 100;
            });
            map[w.weekNumber] = Math.round(sum * 100) / 100;
        });
        return map;
    }, [weekOptions, records, currentEmployeeId]);

    const myWashesDetailed = useMemo(() => {
        if (!currentEmployeeId) {
            return {
                washes: [],
                totalSalary: 0,
                count: 0,
                averagePerWash: 0
            };
        }

        const myWashes = weekRecords.filter(r => (r.employees || []).map(Number).includes(Number(currentEmployeeId)));

        let totalSalary = 0;
        const list = myWashes.map(r => {
            const priceCharged = parseFloat(String(r.price_charged || 0));
            const totalComm = parseFloat(String(r.total_commission || priceCharged * 0.40));
            const count = (r.employees && r.employees.length > 0) ? r.employees.length : 1;
            const myShare = Math.round((totalComm / count) * 100) / 100;
            totalSalary += myShare;

            const coworkers = (r.employees_detail || [])
                .filter(c => c.id !== currentEmployeeId)
                .map(c => getEmployeeDisplayName(c.user, c.id));

            return {
                wash: r,
                priceCharged,
                totalComm,
                employeeCount: count,
                myShare,
                coworkers
            };
        });

        return {
            washes: list,
            totalSalary: Math.round(totalSalary * 100) / 100,
            count: list.length,
            averagePerWash: list.length > 0 ? Math.round((totalSalary / list.length) * 100) / 100 : 0
        };
    }, [weekRecords, currentEmployeeId]);

    const adminSelectedEmployeeData = useMemo(() => {
        if (!isAdmin || selectedEmployeeFilter === 'ALL') return null;

        const empId = parseInt(selectedEmployeeFilter, 10);
        const targetEmp = employees.find(e => e.id === empId);
        if (!targetEmp) return null;

        const empWashes = weekRecords.filter(r => (r.employees || []).includes(empId));

        let totalSalary = 0;
        const list = empWashes.map(r => {
            const priceCharged = parseFloat(String(r.price_charged || 0));
            const totalComm = parseFloat(String(r.total_commission || priceCharged * 0.40));
            const count = (r.employees && r.employees.length > 0) ? r.employees.length : 1;
            const myShare = Math.round((totalComm / count) * 100) / 100;
            totalSalary += myShare;

            const coworkers = (r.employees_detail || [])
                .filter(c => c.id !== empId)
                .map(c => getEmployeeDisplayName(c.user, c.id));

            return {
                wash: r,
                priceCharged,
                totalComm,
                employeeCount: count,
                myShare,
                coworkers
            };
        });

        const empName = getEmployeeDisplayName(targetEmp.user, targetEmp.id);

        return {
            employee: targetEmp,
            name: empName,
            washes: list,
            totalSalary: Math.round(totalSalary * 100) / 100,
            count: list.length,
            averagePerWash: list.length > 0 ? Math.round((totalSalary / list.length) * 100) / 100 : 0
        };
    }, [isAdmin, selectedEmployeeFilter, employees, weekRecords]);

    const adminAllEmployeesPayroll = useMemo(() => {
        if (!isAdmin) return [];

        return employees.map(emp => {
            const empWashes = weekRecords.filter(r => (r.employees || []).includes(emp.id));

            let totalSalary = 0;
            const detailed = empWashes.map(r => {
                const priceCharged = parseFloat(String(r.price_charged || 0));
                const totalComm = parseFloat(String(r.total_commission || priceCharged * 0.40));
                const count = (r.employees && r.employees.length > 0) ? r.employees.length : 1;
                const myShare = Math.round((totalComm / count) * 100) / 100;
                totalSalary += myShare;

                const coworkers = (r.employees_detail || [])
                    .filter(c => c.id !== emp.id)
                    .map(c => getEmployeeDisplayName(c.user, c.id));

                return {
                    wash: r,
                    priceCharged,
                    totalComm,
                    employeeCount: count,
                    myShare,
                    coworkers
                };
            });

            const empName = getEmployeeDisplayName(emp.user, emp.id);

            return {
                employee: emp,
                name: empName,
                totalSalary: Math.round(totalSalary * 100) / 100,
                washesCount: empWashes.length,
                averagePerWash: empWashes.length > 0 ? Math.round((totalSalary / empWashes.length) * 100) / 100 : 0,
                detailed
            };
        }).sort((a, b) => b.totalSalary - a.totalSalary);
    }, [isAdmin, employees, weekRecords]);

    const adminWeekSummary = useMemo(() => {
        if (!isAdmin) return null;

        let totalCharged = 0;
        let totalCommission = 0;

        weekRecords.forEach(r => {
            const charged = parseFloat(String(r.price_charged || 0));
            const comm = parseFloat(String(r.total_commission || charged * 0.40));
            totalCharged += isNaN(charged) ? 0 : charged;
            totalCommission += isNaN(comm) ? 0 : comm;
        });

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
    }, [isAdmin, weekRecords]);

    if (notLoggedIn) {
        return (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-francia-100 text-francia-700 font-bold text-lg flex items-center justify-center mx-auto">
                    LP
                </div>
                <h2 className="text-xl font-bold text-slate-800">Acceso Requerido</h2>
                <p className="text-sm text-slate-500">
                    Para consultar el registro de lavados y el calculo de sueldo semanal, debes iniciar sesion con tu cuenta.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-francia-600 hover:bg-francia-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
                >
                    Ir a Iniciar Sesion
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-francia-700 font-bold text-base space-y-3">
                <div className="w-6 h-6 rounded-full bg-francia-600 animate-ping"></div>
                <div>Cargando datos de sueldos y lavados...</div>
            </div>
        );
    }

    if (!isAdmin && !currentEmployeeId) {
        return (
            <div className="max-w-lg mx-auto my-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rojo-100 text-rojo-700 font-bold text-lg flex items-center justify-center mx-auto">
                    AV
                </div>
                <h2 className="text-xl font-bold text-slate-800">Sin Perfil de Empleado</h2>
                <p className="text-sm text-slate-600">
                    Tu usuario no se encuentra vinculado a un perfil de empleado activo. Consulta con el administrador del lavadero.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-6 bg-rojo-500 rounded-sm"></span>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {isAdmin ? 'Panel de Sueldos y Registro de Lavados' : 'Mi Registro de Lavados y Sueldo Semanal'}
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {isAdmin
                            ? 'Administracion de liquidaciones semanales y registro de lavados por empleado'
                            : `Registro personal de ${getEmployeeDisplayName(currentUser)}`}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isAdmin
                        ? 'bg-rojo-50 text-rojo-700 border-rojo-200'
                        : 'bg-francia-50 text-francia-700 border-francia-200'
                        }`}>
                        {isAdmin ? 'Modo Administrador' : 'Empleado'}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => window.print()}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-1.5 rounded-xl text-xs transition"
                            title="Imprimir resumen de liquidacion"
                        >
                            Imprimir Liquidacion
                        </button>
                    )}
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
                    <h3 className="font-bold text-slate-800 text-sm">
                        Seleccionar Semana de Pago
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">
                        {activeWeek?.payoutLabel}
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {weekOptions.map(week => {
                        const isSelected = week.weekNumber === selectedWeekNumber;
                        const empSalaryForWeek = weekSalaries[week.weekNumber] || 0;
                        return (
                            <button
                                key={week.weekNumber}
                                onClick={() => setSelectedWeekNumber(week.weekNumber)}
                                className={`px-4 py-2.5 rounded-xl text-left shrink-0 transition-all border ${isSelected
                                    ? 'bg-francia-700 text-white border-francia-800 shadow-md font-bold'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="text-sm font-extrabold">{week.label}</span>
                                    {week.isCurrent && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-white text-francia-800' : 'bg-emerald-600 text-white'
                                            }`}>
                                            Actual
                                        </span>
                                    )}
                                    {!isAdmin && empSalaryForWeek > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                            ${empSalaryForWeek.toLocaleString('es-AR')}
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

            {/* VISTA PARA EL EMPLEADO (Solo ve su registro y su sueldo semanal) */}
            {!isAdmin && (
                <div className="space-y-6">
                    {myWashesDetailed.count === 0 && (
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600">
                            <strong className="text-slate-800">Semana sin lavados: </strong>
                            En este periodo no registras actividad. Puedes utilizar los botones de semanas superiores para consultar tus liquidaciones anteriores.
                        </div>
                    )}

                    {/* Tarjetas de Resumen del Empleado */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-francia-700 to-francia-800 text-white p-5 rounded-2xl shadow-sm border border-francia-900/20">
                            <div className="text-francia-200 text-xs font-bold uppercase tracking-wider mb-1">
                                Mi Sueldo Semanal
                            </div>
                            <div className="text-3xl font-black">
                                ${myWashesDetailed.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-francia-200 text-xs mt-1.5">
                                {activeWeek?.payoutLabel}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                Mis Lavados Realizados
                            </div>
                            <div className="text-3xl font-black text-slate-800">
                                {myWashesDetailed.count}
                            </div>
                            <div className="text-slate-400 text-xs mt-1.5">
                                Vehiculos en los que participaste esta semana
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                Promedio por Lavado
                            </div>
                            <div className="text-3xl font-black text-slate-800">
                                ${myWashesDetailed.averagePerWash.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-slate-400 text-xs mt-1.5">
                                Ganancia promedio por vehiculo lavado
                            </div>
                        </div>
                    </div>

                    {/* Explicacion del calculo */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <strong className="text-slate-800 font-bold">Criterio de liquidacion: </strong>
                            Los sueldos se liquidan los sabados. Corresponde al 40% del valor cobrado en cada lavado, repartido en partes iguales entre los empleados participantes.
                        </div>
                        <div className="shrink-0 text-francia-700 font-bold">
                            Periodo: {activeWeek?.dateRangeLabel}
                        </div>
                    </div>

                    {/* Lista detallada de lavados del empleado */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    Registro de Mis Lavados ({myWashesDetailed.count})
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Detalle y calculo de cada lavado en el que trabajaste durante la semana
                                </p>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                                Total Acumulado: ${myWashesDetailed.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {myWashesDetailed.washes.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <h4 className="font-bold text-slate-700">Sin lavados registrados esta semana</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    No tienes lavados asignados en el periodo del {activeWeek?.dateRangeLabel}.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myWashesDetailed.washes.map(({ wash, priceCharged, totalComm, employeeCount, myShare, coworkers }) => (
                                    <div
                                        key={wash.id}
                                        className="p-4 rounded-xl border border-slate-200 hover:border-francia-400 transition bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-slate-900 text-base">
                                                    {wash.vehicle}
                                                </span>
                                                {wash.vehicle_plate && (
                                                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                                                        {wash.vehicle_plate}
                                                    </span>
                                                )}
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${wash.vehicle_type === 'AUTO'
                                                    ? 'bg-francia-100 text-francia-800'
                                                    : wash.vehicle_type === 'CAMIONETA'
                                                        ? 'bg-rojo-100 text-rojo-700'
                                                        : 'bg-slate-200 text-slate-700'
                                                    }`}>
                                                    {wash.vehicle_type}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium ml-1">
                                                    {formatDateShort(wash.date)}, {formatTime(wash.date)}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                                <span>
                                                    <strong className="text-slate-700">Servicio:</strong> {wash.service_detail?.name || 'Servicio General'}
                                                </span>
                                                <span>
                                                    <strong className="text-slate-700">Cobrado al cliente:</strong> ${priceCharged.toLocaleString('es-AR')}
                                                </span>
                                                {parseFloat(String(wash.extra_charge || 0)) > 0 && (
                                                    <span>
                                                        <strong className="text-slate-700">Cobro extra:</strong> ${parseFloat(String(wash.extra_charge)).toLocaleString('es-AR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Caja de Calculo */}
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 lg:min-w-[420px]">
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                    Calculo de Comision:
                                                </span>
                                                <div className="font-mono text-xs text-slate-800 font-semibold">
                                                    40% de ${priceCharged.toLocaleString('es-AR')} = ${totalComm.toLocaleString('es-AR')}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {employeeCount === 1 ? (
                                                        <span>Trabajo individual (100% de la comision)</span>
                                                    ) : (
                                                        <span>Dividido entre {employeeCount} empleados {coworkers.length > 0 && `(con: ${coworkers.join(', ')})`}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-3">
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                                    Mi Ganancia:
                                                </span>
                                                <span className="text-lg font-black text-emerald-600 font-mono">
                                                    +${myShare.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VISTA PARA EL ADMINISTRADOR (Puede ver el registro de cualquier empleado) */}
            {isAdmin && (
                <div className="space-y-6">
                    {/* Filtro de Empleado para Administrador */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="font-black text-slate-800 text-base">
                                Registro por Empleado
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Selecciona cualquier empleado para revisar su registro de lavados y sueldo semanal
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600">Ver empleado:</span>
                            <select
                                value={selectedEmployeeFilter}
                                onChange={e => setSelectedEmployeeFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-francia-600"
                            >
                                <option value="ALL">Todos los empleados ({employees.length})</option>
                                {employees.map(emp => {
                                    const fullName = getEmployeeDisplayName(emp.user, emp.id);
                                    const dniText = emp.user?.username ? ` - DNI: ${emp.user.username}` : '';
                                    return (
                                        <option key={emp.id} value={emp.id}>
                                            {fullName}{dniText}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Caso 1: Administrador selecciono un empleado especifico */}
                    {adminSelectedEmployeeData ? (
                        <div className="space-y-6">
                            {/* Tarjeta de Datos del Empleado Seleccionado */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-francia-100 text-francia-700 font-black text-lg flex items-center justify-center border border-francia-200">
                                        {adminSelectedEmployeeData.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-900 text-xl leading-tight">
                                                {adminSelectedEmployeeData.name}
                                            </h4>
                                            {adminSelectedEmployeeData.employee.user?.username && (
                                                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                                    DNI: {adminSelectedEmployeeData.employee.user.username}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            ID Empleado: {adminSelectedEmployeeData.employee.id}
                                            {adminSelectedEmployeeData.employee.phone && `, Tel: ${adminSelectedEmployeeData.employee.phone}`}
                                            {adminSelectedEmployeeData.employee.user?.email && `, Email: ${adminSelectedEmployeeData.employee.user.email}`}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedEmployeeFilter('ALL')}
                                    className="text-xs font-bold text-francia-700 bg-francia-50 hover:bg-francia-100 px-3.5 py-2 rounded-xl border border-francia-200 transition self-start sm:self-auto"
                                >
                                    Ver todos los empleados
                                </button>
                            </div>

                            {/* Metricas del Empleado Seleccionado */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/20">
                                    <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
                                        Sueldo Semanal a Pagar
                                    </div>
                                    <div className="text-3xl font-black">
                                        ${adminSelectedEmployeeData.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-emerald-100 text-xs mt-1.5">
                                        {activeWeek?.payoutLabel}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                        Lavados Realizados
                                    </div>
                                    <div className="text-3xl font-black text-slate-800">
                                        {adminSelectedEmployeeData.count}
                                    </div>
                                    <div className="text-slate-400 text-xs mt-1.5">
                                        Participaciones en la semana
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                        Promedio por Lavado
                                    </div>
                                    <div className="text-3xl font-black text-slate-800">
                                        ${adminSelectedEmployeeData.averagePerWash.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-slate-400 text-xs mt-1.5">
                                        Comision promedio por vehiculo
                                    </div>
                                </div>
                            </div>

                            {/* Lista Detallada de Lavados para este empleado */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">
                                            Registro de Lavados de {adminSelectedEmployeeData.name} ({adminSelectedEmployeeData.count})
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Detalle de cada lavado realizado por este empleado durante la semana seleccionada
                                        </p>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                                        Total Liquidado: ${adminSelectedEmployeeData.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>

                                {adminSelectedEmployeeData.washes.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <h4 className="font-bold text-slate-700">Sin lavados en esta semana</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Este empleado no tiene registros de lavados entre el {activeWeek?.dateRangeLabel}.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {adminSelectedEmployeeData.washes.map(({ wash, priceCharged, totalComm, employeeCount, myShare, coworkers }) => (
                                            <div
                                                key={wash.id}
                                                className="p-4 rounded-xl border border-slate-200 hover:border-francia-400 transition bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-black text-slate-900 text-base">
                                                            {wash.vehicle}
                                                        </span>
                                                        {wash.vehicle_plate && (
                                                            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                                                                {wash.vehicle_plate}
                                                            </span>
                                                        )}
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${wash.vehicle_type === 'AUTO'
                                                            ? 'bg-francia-100 text-francia-800'
                                                            : wash.vehicle_type === 'CAMIONETA'
                                                                ? 'bg-rojo-100 text-rojo-700'
                                                                : 'bg-slate-200 text-slate-700'
                                                            }`}>
                                                            {wash.vehicle_type}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-medium ml-1">
                                                            {formatDateShort(wash.date)}, {formatTime(wash.date)}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                                        <span>
                                                            <strong className="text-slate-700">Servicio:</strong> {wash.service_detail?.name || 'Servicio General'}
                                                        </span>
                                                        <span>
                                                            <strong className="text-slate-700">Cobrado al cliente:</strong> ${priceCharged.toLocaleString('es-AR')}
                                                        </span>
                                                        {parseFloat(String(wash.extra_charge || 0)) > 0 && (
                                                            <span>
                                                                <strong className="text-slate-700">Cobro extra:</strong> ${parseFloat(String(wash.extra_charge)).toLocaleString('es-AR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 lg:min-w-[420px]">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                            Calculo de Comision:
                                                        </span>
                                                        <div className="font-mono text-xs text-slate-800 font-semibold">
                                                            40% de ${priceCharged.toLocaleString('es-AR')} = ${totalComm.toLocaleString('es-AR')}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500">
                                                            {employeeCount === 1 ? (
                                                                <span>Trabajo individual</span>
                                                            ) : (
                                                                <span>Dividido entre {employeeCount} empleados {coworkers.length > 0 && `(con: ${coworkers.join(', ')})`}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-3">
                                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                                            Corresponde:
                                                        </span>
                                                        <span className="text-lg font-black text-emerald-600 font-mono">
                                                            +${myShare.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Caso 2: Administrador viendo el resumen de TODOS los empleados */
                        <div className="space-y-6">
                            {/* KPIs Generales del Lavadero */}
                            {adminWeekSummary && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-francia-700 to-francia-800 text-white p-5 rounded-2xl shadow-sm border border-francia-900/20">
                                        <div className="text-francia-200 text-xs font-bold uppercase tracking-wider mb-1">
                                            Total Sueldos a Pagar
                                        </div>
                                        <div className="text-3xl font-black">
                                            ${adminWeekSummary.totalCommission.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-francia-200 text-xs mt-1.5">
                                            40% de la facturacion semanal
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Lavados de la Semana
                                        </div>
                                        <div className="text-3xl font-black text-slate-800">
                                            {adminWeekSummary.washesCount}
                                        </div>
                                        <div className="text-slate-400 text-xs mt-1.5">
                                            Vehiculos registrados en la semana
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Empleados con Actividad
                                        </div>
                                        <div className="text-3xl font-black text-slate-800">
                                            {adminWeekSummary.activeEmployeesCount} <span className="text-base font-normal text-slate-400">/ {employees.length}</span>
                                        </div>
                                        <div className="text-slate-400 text-xs mt-1.5">
                                            Empleados que realizaron lavados
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Facturacion Lavadero
                                        </div>
                                        <div className="text-3xl font-black text-slate-800">
                                            ${adminWeekSummary.totalCharged.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-slate-400 text-xs mt-1.5">
                                            Total cobrado antes de comisiones
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tarjetas de Liquidacion por Empleado */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-800">
                                        Liquidacion por Empleado ({activeWeek?.label})
                                    </h3>
                                    <span className="text-xs text-slate-500 font-medium">
                                        Haz click en Ver Registro para inspeccionar a un empleado
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {adminAllEmployeesPayroll.map(item => (
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
                                                                {item.employee.user?.username && (
                                                                    <>DNI: <span className="font-mono font-medium">{item.employee.user.username}</span></>
                                                                )}
                                                                {item.employee.phone && `, Tel: ${item.employee.phone}`}
                                                                {item.employee.user?.email && `, Mail: ${item.employee.user.email}`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                                                            Sueldo
                                                        </span>
                                                        <span className="text-2xl font-black text-emerald-600">
                                                            ${item.totalSalary.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>

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
                                                            ${item.averagePerWash.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedEmployeeFilter(String(item.employee.id))}
                                                    className="w-full py-2 px-3 text-xs font-bold text-francia-700 hover:bg-francia-50 rounded-xl transition flex items-center justify-between"
                                                >
                                                    <span>Ver registro completo de sus {item.washesCount} lavados</span>
                                                    <span className="text-francia-600 font-extrabold">Ver detalle</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lista General de Lavados de la Semana */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">
                                            Todos los Lavados de la {activeWeek?.label} ({weekRecords.length})
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Registro integral de lavados y comisiones aplicadas en la semana
                                        </p>
                                    </div>
                                    {adminWeekSummary && (
                                        <div className="text-xs font-semibold text-francia-700 bg-francia-50 px-3 py-1.5 rounded-xl border border-francia-200 self-start sm:self-auto">
                                            Total Liquidado: ${adminWeekSummary.totalCommission.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>

                                {weekRecords.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <h4 className="font-bold text-slate-700">Sin lavados registrados en esta semana</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            No se encontraron lavados entre el {activeWeek?.dateRangeLabel}.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {weekRecords.map((record) => {
                                            const priceCharged = parseFloat(String(record.price_charged || 0));
                                            const totalComm = parseFloat(String(record.total_commission || priceCharged * 0.40));
                                            const empCount = (record.employees && record.employees.length > 0) ? record.employees.length : 1;
                                            const sharePerEmployee = Math.round((totalComm / empCount) * 100) / 100;

                                            return (
                                                <div
                                                    key={record.id}
                                                    className="p-4 rounded-xl border border-slate-200 hover:border-francia-400 hover:shadow-sm transition bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                                >
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
                                                            <span className="text-xs text-slate-500 font-medium ml-1">
                                                                {formatDateShort(record.date)}, {formatTime(record.date)}
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
                                                                        getEmployeeDisplayName(e.user, e.id)
                                                                    ).join(', ')
                                                                ) : (
                                                                    <span className="text-amber-600 font-semibold">Sin empleados asignados</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 lg:min-w-[420px]">
                                                        <div className="space-y-0.5">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                                                Calculo Realizado:
                                                            </span>
                                                            <div className="font-mono text-xs text-slate-800 font-semibold">
                                                                40% de ${priceCharged.toLocaleString('es-AR')} = ${totalComm.toLocaleString('es-AR')}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-slate-500">
                                                                ${totalComm.toLocaleString('es-AR')} / {empCount} {empCount === 1 ? 'empleado' : 'empleados'}
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
                    )}
                </div>
            )}
        </div>
    );
}
