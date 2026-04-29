import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await clienteAxios.post('/auth/login', credentials);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4">
            <div className="max-w-5xl w-full bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-150">
                
                {/* LADO IZQUIERDO: Branding e Info Dinámica */}
                <div className="md:w-1/2 bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decoración abstracta de fondo */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center md:text-left">
                        <img 
                            src={logo} 
                            alt="Logo Uniautonoma" 
                            className="h-32 w-auto mb-8 mx-auto md:mx-0 drop-shadow-2xl" 
                        />
                        <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight">
                            GESTIÓN DE <br /> NÓMINA
                        </h1>
                        <div className="h-1 w-20 bg-blue-400 mb-8 mx-auto md:mx-0 rounded-full"></div>
                        
                        <ul className="space-y-4 text-blue-100">
                            {[
                                'Control total de novedades y cargos',
                                'Reportes detallados en tiempo real',
                                'Generación masiva de desprendibles',
                                'Gestión segura de talento humano'
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="bg-blue-400/20 p-1 rounded-full">
                                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-blue-400/30 text-center md:text-left">
                        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">
                            Talento Humano Uniautonoma
                        </p>
                    </div>
                </div>

                {/* LADO DERECHO: Formulario */}
                <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Bienvenido</h2>
                        <p className="text-slate-500 font-medium">Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-bounce">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Usuario o Email
                            </label>
                            <input 
                                type="text" 
                                name="username" 
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                placeholder="ejemplo@talentohumano.com" 
                                required 
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Contraseña
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                placeholder="••••••••" 
                                required 
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validando...
                                </span>
                            ) : 'INGRESAR AL SISTEMA'}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 text-xs font-medium">
                            &copy; {new Date().getFullYear()} Software de Nómina | Uniautonoma del Cauca
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;