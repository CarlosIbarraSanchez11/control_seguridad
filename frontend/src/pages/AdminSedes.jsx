import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente para manejar clics en el mapa
function MapaClic({ setPosicion }) {
  useMapEvents({ click(e) { setPosicion(e.latlng); } });
  return null;
}

export default function AdminSedes() {
  const [listaSedes, setListaSedes] = useState([
    { id: 1, nombre: 'Sede ATE - Principal', lat: -12.0253, lng: -76.9201, radio: 50, activo: true },
    { id: 2, nombre: 'Pabellón B (Norte)', lat: -12.0280, lng: -76.9230, radio: 30, activo: false }
  ]);

  const [editandoId, setEditandoId] = useState(null);
  const [nombreSede, setNombreSede] = useState('');
  const [radio, setRadio] = useState(50);
  const [posicion, setPosicion] = useState(null);

  const centroInicial = [-12.05, -77.05];

  const guardarSede = (e) => {
    e.preventDefault();
    if (!nombreSede || !posicion) {
      alert('Por favor ingresa el nombre y selecciona un punto en el mapa.');
      return;
    }

    if (editandoId) {
      setListaSedes(listaSedes.map(s => s.id === editandoId ? { ...s, nombre: nombreSede, lat: posicion.lat, lng: posicion.lng, radio: Number(radio) } : s));
      setEditandoId(null);
    } else {
      const nuevaSede = {
        id: Date.now(), nombre: nombreSede, lat: posicion.lat, lng: posicion.lng, radio: Number(radio), activo: true
      };
      setListaSedes([...listaSedes, nuevaSede]);
    }
    setNombreSede('');
    setRadio(50);
    setPosicion(null);
  };

  const editarSede = (sede) => {
    setEditandoId(sede.id);
    setNombreSede(sede.nombre);
    setRadio(sede.radio);
    setPosicion({ lat: sede.lat, lng: sede.lng });
  };

  const toggleEstadoSede = (id) => {
    setListaSedes(listaSedes.map(s => s.id === id ? { ...s, activo: !s.activo } : s));
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      {/* Cabecera del Módulo */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
          🏢 Gestión de Sedes y Geocercas
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-2">
          Administra las ubicaciones donde el personal operativo podrá registrar su asistencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── COLUMNA IZQUIERDA: Formulario y Mapa ─── */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit relative overflow-hidden">
          
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${editandoId ? 'bg-amber-50 border border-amber-200' : 'bg-indigo-50 border border-indigo-200'}`}>
              {editandoId ? '✏️' : '📍'}
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              {editandoId ? 'Editar Sede' : 'Nueva Sede'}
            </h3>
          </div>
          
          <form onSubmit={guardarSede} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre del Pabellón</label>
              <input 
                type="text" 
                value={nombreSede} 
                onChange={(e) => setNombreSede(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all" 
                placeholder="Ej: Sede Principal ATE" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Radio Permitido (metros)</label>
              <input 
                type="number" 
                value={radio} 
                onChange={(e) => setRadio(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white transition-all" 
              />
            </div>
            
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex justify-between">
                 Ubicación en Mapa 
                 {posicion && <span className="text-indigo-500">Coordenadas fijadas ✓</span>}
               </label>
              <div className={`h-64 rounded-2xl overflow-hidden relative border-2 transition-colors ${posicion ? 'border-indigo-200 shadow-inner' : 'border-dashed border-gray-200'}`}>
                 {!posicion && (
                   <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm z-[400] flex flex-col items-center justify-center text-gray-500 font-bold text-xs pointer-events-none">
                     <span>Haz clic en el mapa</span>
                     <span>para fijar el punto de control</span>
                   </div>
                 )}
                 <MapContainer center={posicion || centroInicial} zoom={13} className="h-full w-full z-0">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapaClic setPosicion={setPosicion} />
                    {posicion && <Marker position={posicion}></Marker>}
                 </MapContainer>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className={`w-full text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${editandoId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/20'}`}>
                {editandoId ? '💾 Guardar Cambios' : '➕ Agregar Sede'}
              </button>
              {editandoId && (
                <button type="button" onClick={() => { setEditandoId(null); setNombreSede(''); setPosicion(null); }} className="w-full mt-3 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest transition-colors py-2">
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ─── COLUMNA DERECHA: Tabla de Registros ─── */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-lg font-black text-gray-900 tracking-tight">Sedes Registradas</h3>
             <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
               {listaSedes.length} Locales
             </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="p-5 border-b border-gray-100">Nombre de Sede</th>
                  <th className="p-5 border-b border-gray-100">Coordenadas</th>
                  <th className="p-5 border-b border-gray-100 text-center">Radio</th>
                  <th className="p-5 border-b border-gray-100 text-center">Estado</th>
                  <th className="p-5 border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {listaSedes.map((sede) => (
                  <tr key={sede.id} className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${!sede.activo ? 'opacity-50' : ''}`}>
                    <td className="p-5 font-black text-gray-900 text-sm">
                      {sede.nombre}
                    </td>
                    <td className="p-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono text-[10px] border border-gray-200">
                        <span>{sede.lat.toFixed(4)}</span>
                        <span className="text-gray-300">|</span>
                        <span>{sede.lng.toFixed(4)}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center font-bold text-gray-600">
                      {sede.radio}m
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${sede.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {sede.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button 
                        onClick={() => editarSede(sede)} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => toggleEstadoSede(sede.id)} 
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${sede.activo ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        title={sede.activo ? 'Inhabilitar' : 'Habilitar'}
                      >
                        {sede.activo ? '🛑' : '✅'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {listaSedes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">🏢</div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay sedes registradas todavía.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}