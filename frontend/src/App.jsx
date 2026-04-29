import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import CargosPage from './pages/CargosPage';
import EmpleadosPage from './pages/EmpleadosPage';
import NominaPage from './pages/NominaPage';
import ReportesPage from './pages/ReportesPage';

// IMPORTACIÓN DE ASSETS
import imgEmpleados from './assets/empleados.png';
import imgCargos from './assets/cargos.png';
import imgNomina from './assets/nomina.png';
import imgReportes from './assets/reporte.png'; // Asegúrate de tener esta imagen en src/assets

const Dashboard = () => {
    const cards = [
        {
            title: 'Empleados',
            desc: 'Gestión de personal y perfiles.',
            path: '/empleados',
            color: 'bg-blue-600',
            shadow: 'shadow-blue-200',
            img: imgEmpleados
        },
        {
            title: 'Cargos',
            desc: 'Roles y escalas salariales.',
            path: '/cargos',
            color: 'bg-indigo-600',
            shadow: 'shadow-indigo-200',
            img: imgCargos
        },
        {
            title: 'Nómina',
            desc: 'Pagos y horas extras.',
            path: '/nomina',
            color: 'bg-emerald-600',
            shadow: 'shadow-emerald-200',
            img: imgNomina
        },
        {
            title: 'Reportes',
            desc: 'Análisis y PDF detallados.',
            path: '/reportes',
            color: 'bg-amber-500',
            shadow: 'shadow-amber-100',
            img: imgReportes
        }
    ];

    return (
        <div className="max-w-400 mx-auto py-12 px-6">
            {/* Encabezado */}
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                    Panel de <span className="text-blue-600">Control</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium">
                    Bienvenido al ecosistema administrativo de Uniautónoma.
                </p>
            </div>
            
            {/* Rejilla de 4 Columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <Link 
                        key={index} 
                        to={card.path}
                        className="group relative flex flex-col h-full"
                    >
                        {/* Bloque de Texto Superior */}
                        <div className={`
                            ${card.color} ${card.shadow} 
                            p-6 rounded-t-4xl text-white 
                            transform group-hover:-translate-y-2 group-hover:scale-[1.02] 
                            transition-all duration-300 z-10 relative shadow-xl
                        `}>
                            <h3 className="text-2xl font-black mb-2">{card.title}</h3>
                            <p className="text-sm text-blue-50 font-medium opacity-90 leading-snug">
                                {card.desc}
                            </p>
                        </div>

                        {/* Bloque de Imagen Inferior (Ajustado para no recortar) */}
                        <div className="overflow-hidden rounded-b-4xl bg-white shadow-lg border-x border-b border-slate-100 grow flex items-center justify-center p-4">
                            <img 
                                src={card.img} 
                                alt={card.title}
                                className="w-full h-40 object-contain transform group-hover:scale-110 transition-transform duration-500 ease-out"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer Informativo */}
            <div className="mt-16 p-8 bg-linear-to-r from-blue-50 to-indigo-50 rounded-4xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="text-blue-900 font-black text-xl">Gestión Centralizada</h4>
                    <p className="text-blue-700 font-medium">Accede a todos los módulos administrativos desde un solo lugar.</p>
                </div>
                <div className="flex gap-4">
                    <span className="bg-white/50 px-4 py-2 rounded-xl text-xs font-bold text-blue-800 border border-blue-100">v2.0 Stable</span>
                </div>
            </div>
        </div>
    );
};

// --- ESTRUCTURA DE RUTAS ---
const AuthLayout = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      {user && <Navbar />}
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cargos" element={<CargosPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/nomina" element={<NominaPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthLayout />
    </BrowserRouter>
  );
}

export default App;