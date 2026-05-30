import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente para manejar clics en el mapa
function MapaClic({ setPosicion }) {
  useMapEvents({ click(e) { setPosicion(e.latlng); } });
  return null;
}

export default function AdminSedes() {
  // Simulamos datos que vendrían de tu base de datos MySQL
  const [listaSedes, setListaSedes] = useState([
    { id: 1, nombre: 'Sede ATE - Principal', lat: -12.0253, lng: -76.9201, radio: 50, activo: true },
    { id: 2, nombre: 'Pabellón B (Norte)', lat: -12.0280, lng: -76.9230, radio: 30, activo: false }
  ]);

  // Estados del formulario
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
      // Actualizar sede existente
      setListaSedes(listaSedes.map(s => s.id === editandoId ? { ...s, nombre: nombreSede, lat: posicion.lat, lng: posicion.lng, radio: Number(radio) } : s));
      setEditandoId(null);
    } else {
      // Crear nueva sede
      const nuevaSede = {
        id: Date.now(), nombre: nombreSede, lat: posicion.lat, lng: posicion.lng, radio: Number(radio), activo: true
      };
      setListaSedes([...listaSedes, nuevaSede]);
    }

    // Limpiar formulario
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario y Mapa */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editandoId ? '✏️ Editar Sede' : '📍 Nueva Sede'}
          </h2>
          
          <form onSubmit={guardarSede} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Pabellón</label>
              <input type="text" value={nombreSede} onChange={(e) => setNombreSede(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 outline-none" placeholder="Ej: Sede ATE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Radio Permitido (metros)</label>
              <input type="number" value={radio} onChange={(e) => setRadio(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="h-48 border rounded-lg overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full bg-gray-800 text-white text-xs text-center py-1 z-[400]">
                  Clic en el mapa para ubicar
               </div>
               <MapContainer center={posicion || centroInicial} zoom={13} className="h-full w-full z-0">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapaClic setPosicion={setPosicion} />
                  {posicion && <Marker position={posicion}></Marker>}
               </MapContainer>
            </div>

            <button type="submit" className={`w-full text-white font-bold py-2 rounded-lg ${editandoId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editandoId ? 'Guardar Cambios' : 'Agregar Sede'}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setNombreSede(''); setPosicion(null); }} className="w-full mt-2 text-gray-500 underline text-sm">
                Cancelar Edición
              </button>
            )}
          </form>
        </div>

        {/* COLUMNA DERECHA: Tabla de Registros */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sedes Registradas</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Coordenadas</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Radio</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listaSedes.map((sede) => (
                  <tr key={sede.id} className={`hover:bg-gray-50 transition-colors ${!sede.activo ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="py-3 px-4 font-medium text-gray-800">{sede.nombre}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                      {sede.lat.toFixed(4)}, {sede.lng.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{sede.radio}m</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${sede.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sede.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button onClick={() => editarSede(sede)} className="text-blue-600 hover:text-blue-800 font-medium">
                        Editar
                      </button>
                      <button onClick={() => toggleEstadoSede(sede.id)} className={`${sede.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium`}>
                        {sede.activo ? 'Inhabilitar' : 'Habilitar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {listaSedes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay sedes registradas todavía.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}