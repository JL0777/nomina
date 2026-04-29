import { useState, useEffect } from 'react';
import clienteAxios from '../api/axios';
import Swal from 'sweetalert2';

const CargosPage = () => {
    const [cargos, setCargos] = useState([]);
    const [nuevoCargo, setNuevoCargo] = useState({ nombre_cargo: '', salario_base: '' });
    const [editando, setEditando] = useState(null);

    const fetchCargos = async () => {
        try {
            const res = await clienteAxios.get('/cargos');
            setCargos(res.data);
        } catch (error) {
            console.error("Error al obtener cargos", error);
        }
    };

    useEffect(() => { fetchCargos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await clienteAxios.put(`/cargos/${editando}`, nuevoCargo);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Cargo actualizado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await clienteAxios.post('/cargos', nuevoCargo);
                Swal.fire({
                    icon: 'success',
                    title: '¡Creado!',
                    text: 'Cargo creado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            cancelarEdicion();
            fetchCargos();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al procesar la solicitud'
            });
        }
    };

    const prepararEdicion = (cargo) => {
        setEditando(cargo.id_cargo);
        setNuevoCargo({ 
            nombre_cargo: cargo.nombre_cargo, 
            salario_base: cargo.salario_base 
        });
    };

    const cancelarEdicion = () => {
        setEditando(null);
        setNuevoCargo({ nombre_cargo: '', salario_base: '' });
    };

    const eliminarCargo = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto y eliminarás el registro del cargo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await clienteAxios.delete(`/cargos/${id}`);
                Swal.fire('¡Eliminado!', 'El cargo ha sido borrado.', 'success');
                fetchCargos();
            } catch (error) {
                Swal.fire("Error", "No se puede eliminar un cargo que tiene empleados asignados.", "error");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black text-gray-900 sm:truncate">Gestión de Cargos</h2>
                    <p className="text-gray-500 mt-1">Define los roles y salarios base de la institución.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
                    <h3 className="text-xl font-bold text-blue-700 mb-6">
                        {editando ? 'Editar Cargo' : 'Crear Nuevo Cargo'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cargo</label>
                            <input 
                                type="text" 
                                value={nuevoCargo.nombre_cargo}
                                onChange={(e) => setNuevoCargo({...nuevoCargo, nombre_cargo: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                                placeholder="Ej: Docente Tiempo Completo" required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Salario Mensual Base</label>
                            <input 
                                type="number" 
                                value={nuevoCargo.salario_base}
                                onChange={(e) => setNuevoCargo({...nuevoCargo, salario_base: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                                placeholder="0.00" required 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <button type="submit" className={`w-full ${editando ? 'bg-indigo-600' : 'bg-blue-600'} hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg transition-all`}>
                                {editando ? 'ACTUALIZAR CARGO' : 'GUARDAR CARGO'}
                            </button>
                            {editando && (
                                <button type="button" onClick={cancelarEdicion} className="w-full bg-gray-100 text-gray-600 font-bold py-2 rounded-xl">
                                    Cancelar Edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Nombre del Cargo</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Salario Base</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {cargos.map((cargo) => (
                                <tr key={cargo.id_cargo} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{cargo.nombre_cargo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        ${new Intl.NumberFormat('es-CO').format(cargo.salario_base)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <button 
                                            onClick={() => prepararEdicion(cargo)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => eliminarCargo(cargo.id_cargo)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-full transition-colors"
                                        >
                                            Eliminar
                                        </button>
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

export default CargosPage;