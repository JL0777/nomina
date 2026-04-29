import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import Swal from 'sweetalert2';

const EmpleadosPage = () => {
    const [empleados, setEmpleados] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [busqueda, setBusqueda] = useState(''); // Estado para el buscador
    const [nuevoEmp, setNuevoEmp] = useState({
        documento: '', nombre: '', apellido: '', email: '', id_cargo: '', fecha_ingreso: '', estado: 'Activo'
    });
    
    const [editando, setEditando] = useState(null);

    const fetchData = async () => {
        try {
            const [resEmp, resCar] = await Promise.all([
                clienteAxios.get('/empleados'),
                clienteAxios.get('/cargos')
            ]);
            setEmpleados(resEmp.data);
            setCargos(resCar.data);
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Lógica del buscador
    const empleadosFiltrados = empleados.filter(emp => 
        emp.documento.toLowerCase().includes(busqueda.toLowerCase()) ||
        `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.nombre_cargo.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await clienteAxios.put(`/empleados/${editando}`, nuevoEmp);
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Información del empleado actualizada',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await clienteAxios.post('/empleados', nuevoEmp);
                Swal.fire({
                    icon: 'success',
                    title: 'Registrado',
                    text: 'Empleado registrado con éxito',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            cancelarEdicion();
            fetchData();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al procesar la solicitud. Verifica los datos.'
            });
        }
    };

    const prepararEdicion = (emp) => {
        setEditando(emp.id_empleado);
        setNuevoEmp({
            documento: emp.documento,
            nombre: emp.nombre,
            apellido: emp.apellido,
            email: emp.email,
            id_cargo: emp.id_cargo,
            fecha_ingreso: emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : '',
            estado: emp.estado
        });
    };

    const cancelarEdicion = () => {
        setEditando(null);
        setNuevoEmp({ documento: '', nombre: '', apellido: '', email: '', id_cargo: '', fecha_ingreso: '', estado: 'Activo' });
    };

    const desactivarEmpleado = async (id) => {
        const result = await Swal.fire({
            title: '¿Desea desactivar este empleado?',
            text: "El empleado pasará a estado Inactivo en el sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await clienteAxios.delete(`/empleados/${id}`);
                Swal.fire('¡Baja Procesada!', 'El empleado ahora está Inactivo.', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('Error', 'No se pudo procesar la baja del empleado.', 'error');
            }
        }
    };

    // NUEVA FUNCIÓN: ELIMINAR PERMANENTE
    const eliminarPermanente = async (id) => {
        const result = await Swal.fire({
            title: '¿ELIMINAR DEFINITIVAMENTE?',
            text: "Esta acción borrará al empleado y su historial de la base de datos. ¡No se puede deshacer!",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#FF0000',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SÍ, BORRAR TODO',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Asegúrate de tener esta ruta configurada en tu index/router de express
                await clienteAxios.delete(`/empleados/fuerza/${id}`); 
                Swal.fire('Eliminado', 'El registro ha sido borrado físicamente.', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar. El empleado podría tener nóminas asociadas.', 'error');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h2 className="text-3xl font-black text-gray-900 mb-8">Gestión de Empleados</h2>
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-10">
                <h3 className="text-xl font-bold text-blue-700 mb-6">
                    {editando ? 'Editar Información de Empleado' : 'Registrar Nuevo Empleado'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input 
                        className={`w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 ${editando ? 'opacity-50' : ''}`}
                        placeholder="Documento"
                        value={nuevoEmp.documento}
                        onChange={(e) => setNuevoEmp({...nuevoEmp, documento: e.target.value})}
                        required
                        disabled={editando} 
                    />
                    <input 
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                        placeholder="Nombres"
                        value={nuevoEmp.nombre}
                        onChange={(e) => setNuevoEmp({...nuevoEmp, nombre: e.target.value})}
                        required
                    />
                    <input 
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                        placeholder="Apellidos"
                        value={nuevoEmp.apellido}
                        onChange={(e) => setNuevoEmp({...nuevoEmp, apellido: e.target.value})}
                        required
                    />
                    <input 
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                        placeholder="Email Institucional"
                        value={nuevoEmp.email}
                        onChange={(e) => setNuevoEmp({...nuevoEmp, email: e.target.value})}
                        required
                    />
                    <select 
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                        value={nuevoEmp.id_cargo}
                        onChange={(e) => setNuevoEmp({...nuevoEmp, id_cargo: e.target.value})}
                        required
                    >
                        <option value="">Seleccione un Cargo</option>
                        {cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>)}
                    </select>

                    {editando ? (
                        <select 
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                            value={nuevoEmp.estado}
                            onChange={(e) => setNuevoEmp({...nuevoEmp, estado: e.target.value})}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    ) : (
                        <input 
                            type="text"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!nuevoEmp.fecha_ingreso) e.target.type = "text" }}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500"
                            placeholder="Fecha Ingreso"
                            value={nuevoEmp.fecha_ingreso}
                            onChange={(e) => setNuevoEmp({...nuevoEmp, fecha_ingreso: e.target.value})}
                            required
                        />
                    )}

                    <div className="md:col-span-3 flex gap-4">
                        <button type="submit" className={`flex-1 ${editando ? 'bg-indigo-600' : 'bg-blue-600'} hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg transition-all`}>
                            {editando ? 'ACTUALIZAR DATOS' : 'REGISTRAR EMPLEADO EN EL SISTEMA'}
                        </button>
                        {editando && (
                            <button type="button" onClick={cancelarEdicion} className="px-8 bg-gray-100 text-gray-600 font-bold rounded-xl">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="mb-6">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar por documento, nombre o cargo..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-100 rounded-2xl shadow-sm outline-none focus:border-blue-400 transition-all"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Documento</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Nombre Completo</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Cargo</th>
                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {empleadosFiltrados.map(emp => (
                            <tr key={emp.id_empleado} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.documento}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-bold">{emp.nombre} {emp.apellido}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{emp.nombre_cargo}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${emp.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {emp.estado.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => prepararEdicion(emp)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold hover:bg-indigo-100">Editar</button>
                                    <button onClick={() => desactivarEmpleado(emp.id_empleado)} className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-100">Baja</button>
                                    <button onClick={() => eliminarPermanente(emp.id_empleado)} className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-100">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {empleadosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No se encontraron empleados con ese criterio.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmpleadosPage;