import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoUniautonoma from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Función para verificar si la ruta está activa y aplicar estilos
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* LADO IZQUIERDO: LOGO Y NOMBRE */}
                    <div className="flex items-center gap-3 shrink-0 w-1/4">
                        <img 
                            src={logoUniautonoma} 
                            alt="Logo" 
                            className="h-12 w-auto object-contain drop-shadow-sm" 
                        />
                        <span className="text-blue-900 font-black text-xl tracking-tight leading-none uppercase">
                            Gestión de <br /> <span className="text-blue-600 text-sm">Nómina</span>
                        </span>
                    </div>

                    {/* CENTRO: NAVEGACIÓN CENTRADA */}
                    <div className="hidden md:flex grow justify-center">
                        <div className="flex space-x-1 bg-gray-100/50 p-1.5 rounded-2xl">
                            {[
                                { name: 'Inicio', path: '/dashboard' },
                                { name: 'Cargos', path: '/cargos' },
                                { name: 'Empleados', path: '/empleados' },
                                { name: 'Novedades / Nómina', path: '/nomina' },
                                { name: 'Reportes', path: '/reportes' },
                            ].map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                        isActive(item.path) 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-blue-600 hover:bg-white/50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* LADO DERECHO: USUARIO Y LOGOUT */}
                    <div className="flex items-center gap-4 justify-end w-1/4 relative">
                        <div className="text-right hidden lg:block">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Admin</p>
                            <p className="text-sm text-blue-950 font-extrabold">{user?.username}</p>
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                                className={`p-2.5 rounded-2xl transition-all border ${
                                    showLogoutConfirm 
                                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100' 
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-red-200 hover:text-red-500'
                                }`}
                                title="Cerrar Sesión"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>

                            {/* VENTANITA DE CONFIRMACIÓN (DROPDOWN) */}
                            {showLogoutConfirm && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowLogoutConfirm(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 px-4 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                                        <p className="text-sm font-bold text-gray-800 mb-3 text-center">¿Cerrar sesión ahora?</p>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-black transition-colors"
                                            >
                                                SÍ, SALIR
                                            </button>
                                            <button 
                                                onClick={() => setShowLogoutConfirm(false)}
                                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-xs font-bold transition-colors"
                                            >
                                                CANCELAR
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;