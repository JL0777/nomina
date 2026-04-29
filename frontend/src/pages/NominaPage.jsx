import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import Swal from 'sweetalert2'; // Importamos SweetAlert

const NominaPage = () => {
    const [empleados, setEmpleados] = useState([]);
    const [novedadesLista, setNovedadesLista] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [novedad, setNovedad] = useState({
        id_empleado: '',
        horas_extras_diurnas: 0,
        horas_extras_nocturnas: 0,
        bonificaciones: 0,
        otros_descuentos: 0
    });
    const [loading, setLoading] = useState(false);

    const cargarDatos = async () => {
        try {
            // CAMBIO AQUÍ: Llamamos a la nueva ruta de activos para el select
            const resEmp = await clienteAxios.get('/empleados/activos'); 
            setEmpleados(resEmp.data);
            
            // El resto sigue igual
            const resNov = await clienteAxios.get('/nomina/novedades');
            setNovedadesLista(resNov.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleRegistrarNovedad = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await clienteAxios.put(`/nomina/novedades/${editandoId}`, novedad);
                // Alerta de actualización exitosa
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'La novedad ha sido modificada correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await clienteAxios.post('/nomina/novedades', { ...novedad, mes, anio });
                // Alerta de registro exitoso
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: 'Novedades registradas para este empleado.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            setEditandoId(null);
            setNovedad({ id_empleado: '', horas_extras_diurnas: 0, horas_extras_nocturnas: 0, bonificaciones: 0, otros_descuentos: 0 });
            cargarDatos();
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la novedad.', 'error');
        }
    };

    const handleEliminarNovedad = async (id) => {
        // Alerta de confirmación antes de borrar
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await clienteAxios.delete(`/nomina/novedades/${id}`);
                // Confirmación de borrada
                Swal.fire('Eliminado', 'La novedad ha sido eliminada.', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la novedad.', 'error');
            }
        }
    };

    const prepararEdicion = (nov) => {
        setEditandoId(nov.id_novedad);
        setNovedad({
            id_empleado: nov.id_empleado,
            horas_extras_diurnas: nov.horas_extras_diurnas,
            horas_extras_nocturnas: nov.horas_extras_nocturnas,
            bonificaciones: nov.bonificaciones,
            otros_descuentos: nov.otros_descuentos
        });
        
        // Alerta informativa de que entró en modo edición
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Modo edición activado',
            showConfirmButton: false,
            timer: 1500
        });
    };

    const handleGenerarNominaTotal = async () => {
        const result = await Swal.fire({
            title: '¿Liquidar Nómina?',
            text: `Se generará la nómina de todos los empleados para el periodo ${mes}/${anio}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, generar nómina',
            cancelButtonText: 'No, cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await clienteAxios.post('/nomina/calcular', { mes, anio });
            Swal.fire('¡Éxito!', res.data.message, 'success');
        } catch (error) {
            Swal.fire('Error', 'Ocurrió un problema al generar la nómina.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 space-y-10">
            <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 uppercase">Procesamiento de Nómina</h2>
                <p className="text-gray-500 mt-2">Periodo actual: {mes}/{anio}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BLOQUE 1: REGISTRO DE NOVEDADES */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <span className="bg-blue-100 p-2 rounded-lg">1</span> 
                        {editandoId ? 'Editando Novedad' : 'Registro de Novedades'}
                    </h3>
                    <form onSubmit={handleRegistrarNovedad} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Empleado</label>
                            <select 
                                className="w-full mt-1 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
                                value={novedad.id_empleado}
                                onChange={(e) => setNovedad({...novedad, id_empleado: e.target.value})}
                                disabled={!!editandoId}
                                required
                            >
                                <option value="">Seleccione un empleado...</option>
                                {empleados.map(emp => (
                                    <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} {emp.apellido}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">H. Extras Diurnas</label>
                                <input type="number" className="w-full mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl"
                                    value={novedad.horas_extras_diurnas} onChange={(e) => setNovedad({...novedad, horas_extras_diurnas: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">H. Extras Nocturnas</label>
                                <input type="number" className="w-full mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl"
                                    value={novedad.horas_extras_nocturnas} onChange={(e) => setNovedad({...novedad, horas_extras_nocturnas: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Bonificaciones</label>
                                <input type="number" className="w-full mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-green-600 font-bold"
                                    value={novedad.bonificaciones} onChange={(e) => setNovedad({...novedad, bonificaciones: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Otros Descuentos</label>
                                <input type="number" className="w-full mt-1 px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-red-600 font-bold"
                                    value={novedad.otros_descuentos} onChange={(e) => setNovedad({...novedad, otros_descuentos: e.target.value})} />
                            </div>
                        </div>
                        <button type="submit" className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg ${editandoId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editandoId ? 'ACTUALIZAR CAMBIOS' : 'GUARDAR NOVEDADES DEL MES'}
                        </button>
                        {editandoId && (
                            <button type="button" onClick={() => {setEditandoId(null); setNovedad({id_empleado:'', horas_extras_diurnas:0, horas_extras_nocturnas:0, bonificaciones:0, otros_descuentos:0})}} className="w-full text-gray-500 font-bold py-2">Cancelar Edición</button>
                        )}
                    </form>
                </div>

                {/* BLOQUE 2: LIQUIDACIÓN MASIVA */}
                <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                            <span className="bg-emerald-500 p-2 rounded-lg text-white">2</span> Liquidación Total
                        </h3>
                        <p className="opacity-90 mb-6">
                            Al presionar este botón, el sistema tomará los salarios base de todos los empleados, sumará las novedades y generará desprendibles.
                        </p>
                        <div className="flex gap-4 mb-8">
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase opacity-70 mb-1">Mes</label>
                                <input type="number" min="1" max="12" className="w-full bg-emerald-700 border-none rounded-lg p-2 outline-none text-white" 
                                    value={mes} onChange={(e) => setMes(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase opacity-70 mb-1">Año</label>
                                <input type="number" className="w-full bg-emerald-700 border-none rounded-lg p-2 outline-none text-white" 
                                    value={anio} onChange={(e) => setAnio(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerarNominaTotal}
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all ${loading ? 'bg-gray-400' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}
                    >
                        {loading ? 'Procesando...' : 'GENERAR NÓMINA GENERAL'}
                    </button>
                </div>
            </div>

            {/* TABLA DE NOVEDADES */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Listado de Novedades Registradas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500">Empleado</th>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500">Periodo</th>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500 text-center">Extras (D/N)</th>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500">Bonos</th>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500">Desc.</th>
                                <th className="p-4 text-xs font-bold uppercase text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {novedadesLista.map(nov => (
                                <tr key={nov.id_novedad} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-gray-900">{nov.nombre} {nov.apellido}</td>
                                    <td className="p-4 text-sm text-gray-600">{nov.mes}/{nov.anio}</td>
                                    <td className="p-4 text-sm text-center font-mono text-blue-600">{nov.horas_extras_diurnas} / {nov.horas_extras_nocturnas}</td>
                                    <td className="p-4 text-sm text-green-600 font-bold">${nov.bonificaciones}</td>
                                    <td className="p-4 text-sm text-red-600 font-bold">${nov.otros_descuentos}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => prepararEdicion(nov)} className="text-orange-500 hover:bg-orange-50 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200 transition-all">Editar</button>
                                        <button onClick={() => handleEliminarNovedad(nov.id_novedad)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-bold border border-red-200 transition-all">Borrar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NominaPage;