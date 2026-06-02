import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AdminSedes from './pages/AdminSedes';
import AdminUsuarios from './pages/AdminUsuarios';
import GuardiaAsistencia from './pages/GuardiaAsistencia';
import AdminProgramacion from './pages/AdminProgramacion';

// ✨ IMPORTAMOS NUESTRA API CENTRALIZADA
import { authAPI } from './services/api'; 

/* ── Definición de Colores Pastel Reutilizables ── */
const C = {
  activeBg: 'bg-emerald-50', 
  activeText: 'text-emerald-800', 
  activeBorder: 'border-emerald-500', 
  buttonSolid: 'bg-emerald-600 hover:bg-emerald-700 text-white', 
  buttonGuardia: 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100', 
  buttonAdmin: 'bg-indigo-50 text-indigo-800 border border-indigo-100 hover:bg-indigo-100', 
  danger: 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100', 
  divider: 'border-gray-100', 
};

export default function App() {
  // ✨ ESTADOS INICIALIZADOS CON LOCALSTORAGE
  const [vista, setVista] = useState(() => {
    return localStorage.getItem('app_vista') || 'seleccion';
  });
  
  const [tab, setTab] = useState(() => {
    return localStorage.getItem('app_tab') || 'sedes';
  });

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  // ✨ EFECTOS PARA SINCRONIZAR CON LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('app_vista', vista);
  }, [vista]);

  useEffect(() => {
    localStorage.setItem('app_tab', tab);
  }, [tab]);


  const handleLogin = async (e, tipoDestino) => {
    e.preventDefault();
    
    if (tipoDestino === 'panel-admin') {
      try {
        const respuesta = await authAPI.loginAdmin({ usuario, password });
        
        // ALERTA DE ÉXITO
        Swal.fire({
          icon: 'success',
          title: '¡Acceso Concedido!',
          text: `Bienvenido al sistema, ${respuesta.data.usuario.nombre}`,
          confirmButtonColor: '#059669', // emerald-600
          timer: 2000,
          showConfirmButton: false
        });

        setVista(tipoDestino);
        setUsuario('');
        setPassword('');
        
      } catch (error) {
        const mensajeError = error.response?.data?.error || "Error al conectar con el servidor";
        
        // ALERTA DE ERROR
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: mensajeError,
          confirmButtonColor: '#e11d48' // rose-600
        });
      }
    } else {
      console.log(`Iniciando sesión operativa:`, usuario);
      setVista(tipoDestino);
      setUsuario('');
      setPassword('');
    }
  };

  // --- PANTALLA 1: Selección de Módulo ---
  if (vista === 'seleccion') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className={`bg-white rounded-2xl shadow-sm ${C.divider} border p-12 w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-200`}>
          <div className="flex justify-center mb-6">
            <div className={`w-14 h-14 ${C.activeBg} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
              <span className={`text-3xl ${C.activeText}`}>🛡️</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-950 mb-3 tracking-tighter">Sistema de Control</h1>
          <p className="text-gray-600 font-medium mb-10 max-w-sm mx-auto">Bienvenido, por favor selecciona tu portal de acceso dedicado.</p>
          
          <div className="space-y-5">
            <button 
              onClick={() => setVista('login-guardia')}
              className={`w-full ${C.buttonGuardia} text-[13px] font-black uppercase tracking-widest py-5 px-6 rounded-2xl shadow-lg shadow-emerald-500/5 transition-all flex items-center justify-center gap-3 active:scale-95`}
            >
              <span>🚪</span> Portal del Guardia (Marcación)
            </button>
            <button 
              onClick={() => setVista('login-admin')}
              className={`w-full ${C.buttonAdmin} text-[13px] font-black uppercase tracking-widest py-5 px-6 rounded-2xl shadow-lg shadow-indigo-500/5 transition-all flex items-center justify-center gap-3 active:scale-95`}
            >
              <span>⚙️</span> Portal Administrativo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA 2: Formularios de Login ---
  if (vista === 'login-admin' || vista === 'login-guardia') {
    const esAdmin = vista === 'login-admin';
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className={`bg-white rounded-2xl shadow-sm ${C.divider} border p-12 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200`}>
          <button onClick={() => setVista('seleccion')} className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-bold mb-6 group transition-colors">
            <span className="transition-transform group-hover:-translate-x-1">&larr;</span> Volver a selección
          </button>
          <div className="flex items-center gap-4 mb-10">
            <div className={`w-12 h-12 ${esAdmin ? C.buttonAdmin : C.buttonGuardia} rounded-xl flex items-center justify-center text-2xl border-2 border-white shadow-md`}>
              {esAdmin ? '⚙️' : '👨‍✈️'}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tighter">
              Acceso {esAdmin ? 'Administrativo' : 'Guardia'}
            </h2>
          </div>
          
          <form onSubmit={(e) => handleLogin(e, esAdmin ? 'panel-admin' : 'panel-guardia')} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Usuario / DNI</label>
              <input 
                type="text" required value={usuario} onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario..."
                className={`w-full px-5 py-3.5 border ${C.divider} rounded-xl bg-gray-50/50 font-medium text-sm text-gray-950 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:bg-white transition-all`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className={`w-full px-5 py-3.5 border ${C.divider} rounded-xl bg-gray-50/50 font-medium text-sm text-gray-950 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 focus:bg-white transition-all`}
              />
            </div>
            <button type="submit" className={`w-full ${C.buttonSolid} text-xs font-black rounded-xl uppercase tracking-widest py-4 px-6 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4`}>
              ✓ Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- PANTALLA 3: Los Módulos Reales ---
  if (vista === 'panel-admin') {
    return (
      <div className="min-h-screen bg-white">
        <nav className={`bg-white text-gray-950 p-4 px-6 flex justify-between items-center shadow-sm border-b ${C.divider}`}>
          <div className="flex items-center gap-10">
            <div className={`font-black text-xl tracking-tighter ${C.activeText}`}><span className='font-light text-gray-400 ml-1'>ADMIN</span></div>
            <div className="flex gap-1.5">
              
              <button 
                onClick={() => setTab('sedes')} 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2.5 ${tab === 'sedes' ? `${C.activeBg} ${C.activeText} shadow-inner` : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={tab === 'sedes' ? '' : 'opacity-50'}>🏢</span> Gestionar Sedes
              </button>
              
              <button 
                onClick={() => setTab('usuarios')} 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2.5 ${tab === 'usuarios' ? `${C.activeBg} ${C.activeText} shadow-inner` : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={tab === 'usuarios' ? '' : 'opacity-50'}>👥</span> Gestionar Usuarios
              </button>

              <button 
                onClick={() => setTab('programacion')} 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2.5 ${tab === 'programacion' ? `${C.activeBg} ${C.activeText} shadow-inner` : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={tab === 'programacion' ? '' : 'opacity-50'}>📅</span> Matriz de Turnos
              </button>

            </div>
          </div>
          {/* ✨ BOTÓN DE CERRAR SESIÓN LIMPIA EL LOCALSTORAGE */}
          <button 
            onClick={() => { 
              localStorage.removeItem('app_vista'); 
              localStorage.removeItem('app_tab');
              setVista('seleccion'); 
              setTab('sedes'); 
            }} 
            className={`${C.danger} px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95`}
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </nav>
        
        <div className="p-8">
          {tab === 'sedes' && <AdminSedes />}
          {tab === 'usuarios' && <AdminUsuarios />}
          {tab === 'programacion' && <AdminProgramacion />}
        </div>
      </div>
    );
  }

  if (vista === 'panel-guardia') {
    return (
      <div className="min-h-screen bg-white">
        <nav className={`bg-white text-gray-950 p-4 px-6 flex justify-between items-center shadow-sm border-b ${C.divider}`}>
          <div className={`font-black text-lg tracking-tighter ${C.activeText}`}><span className='font-light text-gray-400 ml-1.5'>OPERATIVO</span></div>
          <button 
            onClick={() => {
              localStorage.removeItem('app_vista'); 
              setVista('seleccion');
            }} 
            className={`${C.danger} px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95`}
          >
            <span>🚪</span> Salir de Portal
          </button>
        </nav>
        <div className="p-8">
          <GuardiaAsistencia />
        </div>
      </div>
    );
  }

  return null;
}