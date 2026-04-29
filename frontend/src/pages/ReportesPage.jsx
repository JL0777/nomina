import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUniautonoma from '../assets/logo.png'; 

const ReportesPage = () => {
    const [historial, setHistorial] = useState([]);
    const [filtroMes, setFiltroMes] = useState('');
    const [loading, setLoading] = useState(true);
    
    // --- NUEVOS ESTADOS ---
    const [empleadosLista, setEmpleadosLista] = useState([]);
    const [filtroEmpleado, setFiltroEmpleado] = useState('');
    const [empleadosActivos, setEmpleadosActivos] = useState(0);

    // --- FETCH MODIFICADO PARA TRAER HISTORIAL Y EMPLEADOS ---
    const fetchData = async () => {
        try {
            // 1. Traer historial
            const resHistorial = await clienteAxios.get('/nomina/historial');
            setHistorial(resHistorial.data);

            // 2. Traer empleados (para el filtro y conteo de activos)
            const resEmpleados = await clienteAxios.get('/empleados');
            setEmpleadosLista(resEmpleados.data);
            
            // Calculamos los activos (Ajusta 'Activo' según como lo devuelva tu BD: puede ser 1, 'ACTIVO', true, etc.)
            const activos = resEmpleados.data.filter(emp => emp.estado === 'Activo' || emp.estado === 'ACTIVO').length;
            // Si tu BD no tiene un campo estado y asumes que todos los que devuelve están activos, usa: resEmpleados.data.length
            setEmpleadosActivos(activos > 0 ? activos : resEmpleados.data.length);

            setLoading(false);
        } catch (error) {
            console.error("Error al obtener datos", error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatearMoneda = (valor) => 
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

    // --- LA LÓGICA DEL PDF QUEDA INTACTA ---
    const generarPDF = (reg) => {
        const doc = new jsPDF();
        
        const azulOscuro = [0, 51, 102];
        const verdeExito = [5, 150, 105];
        const rojoError = [220, 38, 38];

        try {
            doc.addImage(logoUniautonoma, 'PNG', 15, 12, 25, 25);
        } catch (e) {
            console.warn("No se pudo cargar el logo en el PDF", e);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.text("CORPORACIÓN UNIVERSITARIA AUTÓNOMA DEL CAUCA", 45, 22);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("NIT: 891.500.311-1 | Sistema de Gestión de Nómina", 45, 28);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 45, 33);

        doc.setDrawColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 40, 195, 40);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("COMPROBANTE INDIVIDUAL DE PAGO", 105, 50, { align: "center" });

        doc.setFontSize(10);
        doc.text("DATOS DEL EMPLEADO", 15, 60);
        doc.setFont("helvetica", "normal");
        doc.text(`Nombre: ${reg.nombre} ${reg.apellido}`, 15, 66);
        doc.text(`Identificación: ${reg.documento}`, 15, 71);
        doc.text(`Periodo Pagado: ${reg.mes} / ${reg.anio}`, 130, 66);
        doc.text(`Salario Básico: ${formatearMoneda(reg.salario_basico_mes)}`, 130, 71);

        const deduccionesTotales = parseFloat(reg.descuento_salud) + parseFloat(reg.descuento_pension) + parseFloat(reg.otros_deducidos);

        autoTable(doc, {
            startY: 80,
            head: [['DESCRIPCIÓN DE INGRESOS', 'VALOR', 'DESCRIPCIÓN DE EGRESOS', 'VALOR']],
            body: [
                ['Salario Mensual', formatearMoneda(reg.salario_basico_mes), 'Salud (4%)', formatearMoneda(reg.descuento_salud)],
                ['Auxilio de Transporte', formatearMoneda(reg.auxilio_transporte), 'Pensión (4%)', formatearMoneda(reg.descuento_pension)],
                [`Extras Diurnas (${reg.horas_extras_diurnas || 0})`, formatearMoneda((reg.horas_extras_diurnas || 0) * ((reg.salario_basico_mes / 240) * 1.25)), 'Otros Descuentos', formatearMoneda(reg.otros_deducidos)],
                [`Extras Nocturnas (${reg.horas_extras_nocturnas || 0})`, formatearMoneda((reg.horas_extras_nocturnas || 0) * ((reg.salario_basico_mes / 240) * 1.75)), '', ''],
                ['Bonificaciones', formatearMoneda(reg.bonificaciones || 0), '', ''],
                [
                    { content: 'TOTAL DEVENGADO', styles: { fontStyle: 'bold', textColor: verdeExito } },
                    { content: formatearMoneda(reg.total_devengado), styles: { fontStyle: 'bold', textColor: verdeExito } },
                    { content: 'TOTAL DEDUCCIONES', styles: { fontStyle: 'bold', textColor: rojoError } },
                    { content: formatearMoneda(deduccionesTotales), styles: { fontStyle: 'bold', textColor: rojoError } }
                ]
            ],
            theme: 'striped',
            headStyles: { fillColor: azulOscuro, fontSize: 9 },
            styles: { fontSize: 8, cellPadding: 4 }
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFillColor(azulOscuro[0], azulOscuro[1], azulOscuro[2]);
        doc.roundedRect(130, finalY, 65, 18, 3, 3, 'F');
        
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("NETO A PAGAR:", 135, finalY + 7);
        doc.setFontSize(14);
        doc.text(formatearMoneda(reg.neto_pagar), 135, finalY + 14);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Este documento es un soporte electrónico de pago y no requiere firma autógrafa.", 105, 280, { align: "center" });

        doc.save(`Nomina_${reg.apellido}_${reg.mes}_${reg.anio}.pdf`);
    };

    // --- LA LÓGICA DEL MODAL QUEDA INTACTA ---
    const mostrarDetalle = (reg) => {
        const valorHoraBase = parseFloat(reg.salario_basico_mes) / 240;
        const totalExtrasDiurnas = (reg.horas_extras_diurnas || 0) * (valorHoraBase * 1.25);
        const totalExtrasNocturnas = (reg.horas_extras_nocturnas || 0) * (valorHoraBase * 1.75);

        Swal.fire({
            title: `<span style="font-size: 1.4rem; font-weight: 900;">Detalle de Nómina</span>`,
            html: `
                <div style="text-align: left; font-family: 'Inter', sans-serif; padding: 10px;">
                    <div style="background: #f8fafc; padding: 10px; border-radius: 12px; margin-bottom: 15px;">
                        <p style="margin: 0;"><b>Colaborador:</b> ${reg.nombre} ${reg.apellido}</p>
                        <p style="margin: 0;"><b>Periodo:</b> ${reg.mes}/${reg.anio}</p>
                    </div>

                    <h4 style="color: #059669; border-bottom: 2px solid #ecfdf5; padding-bottom: 5px;">+ INGRESOS (Devengado)</h4>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Salario Base:</span> <b>${formatearMoneda(reg.salario_basico_mes)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Auxilio Transporte:</span> <b>${formatearMoneda(reg.auxilio_transporte)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Extras Diurnas (${reg.horas_extras_diurnas || 0}h):</span> <b>${formatearMoneda(totalExtrasDiurnas)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Extras Nocturnas (${reg.horas_extras_nocturnas || 0}h):</span> <b>${formatearMoneda(totalExtrasNocturnas)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Bonificaciones:</span> <b>${formatearMoneda(reg.bonificaciones || 0)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: bold; color: #065f46;"><span>Total Devengado:</span> <span>${formatearMoneda(reg.total_devengado)}</span></div>

                    <h4 style="color: #dc2626; border-bottom: 2px solid #fef2f2; padding-bottom: 5px; margin-top: 20px;">- EGRESOS (Deducciones)</h4>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Salud (4%):</span> <b>${formatearMoneda(reg.descuento_salud)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Pensión (4%):</span> <b>${formatearMoneda(reg.descuento_pension)}</b></div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Otros Descuentos:</span> <b>${formatearMoneda(reg.otros_deducidos)}</b></div>
                    
                    <div style="margin-top: 25px; padding: 15px; background: #4f46e5; color: white; border-radius: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">NETO A PAGAR:</span>
                        <span style="font-size: 1.3rem; font-weight: 900;">${formatearMoneda(reg.neto_pagar)}</span>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#4f46e5',
            width: '500px',
            borderRadius: '25px'
        });
    };

    // --- NUEVA LÓGICA DE FILTRADO DOBLE ---
    const datosFiltrados = historial.filter(reg => {
        const coincideMes = filtroMes ? reg.mes === parseInt(filtroMes) : true;
        const coincideEmpleado = filtroEmpleado ? reg.documento === filtroEmpleado : true;
        return coincideMes && coincideEmpleado;
    });

    const totalPagadoPeriodo = datosFiltrados.reduce((acc, curr) => acc + parseFloat(curr.neto_pagar), 0);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Historial de Nómina</h2>
                    <p className="text-gray-500">Consulta los pagos realizados y genera balances.</p>
                </div>
                
                {/* --- NUEVA ZONA DE FILTROS --- */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-600">Mes:</label>
                        <select 
                            className="bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i+1} value={i+1}>Mes {i+1}</option>
                            ))}
                        </select>
                    </div>

                    {/* Divisor visual entre filtros */}
                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-600">Empleado:</label>
                        <select 
                            className="bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
                            value={filtroEmpleado}
                            onChange={(e) => setFiltroEmpleado(e.target.value)}
                        >
                            <option value="">Todos los empleados</option>
                            {empleadosLista.map((emp) => (
                                <option key={emp.documento} value={emp.documento}>
                                    {emp.nombre} {emp.apellido} ({emp.documento})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- SE AÑADIÓ LA TERCERA TARJETA --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-indigo-600">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Desembolsado</p>
                    {/* Este valor ahora se recalcula automáticamente si filtras por un empleado */}
                    <p className="text-3xl font-black text-indigo-700">{formatearMoneda(totalPagadoPeriodo)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-emerald-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Registros Encontrados</p>
                    <p className="text-3xl font-black text-emerald-600">{datosFiltrados.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-amber-500">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Empleados Activos</p>
                    <p className="text-3xl font-black text-amber-600">{empleadosActivos}</p>
                </div>
            </div>

            {/* TABLA DE REGISTROS (Queda exactamente igual) */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Colaborador</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Periodo</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Salario Base</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Extras</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-red-500 uppercase">Deducciones</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Neto Pagado</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-400 italic">Cargando historial...</td></tr>
                            ) : datosFiltrados.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-400 italic">No hay registros de pago.</td></tr>
                            ) : (
                                datosFiltrados.map((reg) => (
                                    <tr key={reg.id_nomina} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{reg.nombre} {reg.apellido}</div>
                                            <div className="text-xs text-gray-400">{reg.documento}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.mes}/{reg.anio}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatearMoneda(reg.salario_basico_mes)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">+{formatearMoneda(reg.valor_horas_extras)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">-{formatearMoneda(parseFloat(reg.descuento_salud) + parseFloat(reg.descuento_pension) + parseFloat(reg.otros_deducidos))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">{formatearMoneda(reg.neto_pagar)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            <button 
                                                onClick={() => mostrarDetalle(reg)}
                                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                Ver Detalle
                                            </button>
                                            <button 
                                                onClick={() => generarPDF(reg)}
                                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                Desprendible
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;