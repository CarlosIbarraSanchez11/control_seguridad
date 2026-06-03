import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Swal from 'sweetalert2';
import { sedesAPI } from '../services/api'; // ✨ Conectamos a las sedes reales

export default function AdminUsuarios() {
  // ─── ESTADOS DE DATOS ───
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // ─── ESTADOS DEL FORMULARIO ───
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [perfil, setPerfil] = useState('FIJO'); 
  const [sedeAsignada, setSedeAsignada] = useState('');

  // ─── ESTADOS DE BIOMETRÍA ───
  const [capturando, setCapturando] = useState(false);
  const [modelosCargados, setModelosCargados] = useState(false);
  const [descriptorGenerado, setDescriptorGenerado] = useState(null);
  const [mensajeIA, setMensajeIA] = useState('Esperando para iniciar IA...');

  const videoRef = useRef(null);
  const canvasRef = useRef(null); 
  const intervalRef = useRef(null); 

  // ✨ CARGAR SEDES DESDE MYSQL AL INICIAR
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const respuesta = await sedesAPI.obtenerTodas();
        // Filtramos para mostrar solo las sedes activas
        setSedesDisponibles(respuesta.data.filter(s => s.activo));
      } catch (error) {
        console.error("Error al cargar sedes:", error);
      }
    };
    cargarSedes();
  }, []);

  // ✨ CARGAR MODELOS DE FACE-API
  useEffect(() => {
    const cargarModelos = async () => {
      try {
        setMensajeIA('Cargando redes neuronales...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelosCargados(true);
        setMensajeIA('✅ IA Biométrica Lista.');
      } catch (error) {
        console.error("Error al cargar modelos:", error);
        setMensajeIA('❌ Error en IA. Faltan los archivos en /models');
      }
    };
    cargarModelos();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ─── LÓGICA DE BIOMETRÍA ───
  const iniciarCamara = () => {
    if (!modelosCargados) {
      Swal.fire({ icon: 'warning', title: 'Aún no', text: 'Espera a que los modelos de IA terminen de cargar.' });
      return;
    }
    setCapturando(true);
    setDescriptorGenerado(null);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { 
        videoRef.current.srcObject = stream; 
        videoRef.current.onplay = () => dibujarRostroEnTiempoReal();
      })
      .catch(err => {
        console.error("Error cámara:", err);
        Swal.fire({ icon: 'error', title: 'Sin Cámara', text: 'Permite el acceso a la cámara en tu navegador.' });
        setCapturando(false);
      });
  };

  const dibujarRostroEnTiempoReal = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2 });
      const detections = await faceapi.detectAllFaces(videoRef.current, opciones).withFaceLandmarks();
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
    }, 100);
  };

  const capturarHuellaFacial = async () => {
    if (!videoRef.current) return;
    setMensajeIA('Analizando geometría facial... ¡No te muevas!');

    try {
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(videoRef.current, opciones)
                                     .withFaceLandmarks()
                                     .withFaceDescriptor();

      if (detection) {
        const descriptorArray = Array.from(detection.descriptor);
        setDescriptorGenerado(descriptorArray);
        setMensajeIA('✅ Huella Facial Encriptada con éxito.');
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setCapturando(false);
      } else {
        setMensajeIA('❌ Rostro no detectado. Mira de frente a la cámara.');
      }
    } catch (error) {
      console.error("Error analizando:", error);
      setMensajeIA('Error durante el escaneo.');
    }
  };

  // ─── GUARDADO Y VALIDACIÓN ───
  const handlePerfilChange = (e) => {
    const nuevoPerfil = e.target.value;
    setPerfil(nuevoPerfil);
    if (nuevoPerfil !== 'FIJO') {
      setSedeAsignada(''); // Los retenes/descanseros no tienen sede fija
    }
  };

  const guardarUsuario = (e) => {
    e.preventDefault();
    if (!descriptorGenerado) {
      Swal.fire({ icon: 'warning', title: 'Falta Biometría', text: 'Debes capturar el rostro del guardia antes de guardarlo.' });
      return;
    }

    if (perfil === 'FIJO' && !sedeAsignada) {
      Swal.fire({ icon: 'warning', title: 'Sede Requerida', text: 'Los perfiles FIJOS deben tener una sede asignada.' });
      return;
    }

    const nuevoGuardia = { 
      id: Date.now(), 
      nombre, 
      dni, 
      perfil, 
      sedeId: perfil === 'FIJO' ? sedeAsignada : null, 
      sedeNombre: perfil === 'FIJO' ? sedesDisponibles.find(s => s.id.toString() === sedeAsignada)?.nombre : 'ASIGNACIÓN DINÁMICA',
      facialListo: true, 
      descriptor: descriptorGenerado
    };
    
    // TODO: Aquí luego reemplazaremos con guardiasAPI.crear(nuevoGuardia)
    setListaUsuarios([...listaUsuarios, nuevoGuardia]);
    
    Swal.fire({ icon: 'success', title: '¡Guardia Enrolado!', timer: 1500, showConfirmButton: false });

    // Limpiar formulario
    setNombre(''); 
    setDni(''); 
    setPerfil('FIJO'); 
    setSedeAsignada(''); 
    setDescriptorGenerado(null); 
    setMensajeIA('✅ IA Biométrica Lista.');
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      {/* ─── CABECERA ─── */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
          👥 Enrolamiento de Personal
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-2">
          Registra a los guardias, asigna sus perfiles operativos y captura su biometría facial para marcación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── COLUMNA IZQUIERDA: FORMULARIO ─── */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-lg">
              👨‍✈️
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Nuevo Registro</h3>
          </div>
          
          <form onSubmit={guardarUsuario} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 focus:bg-white transition-all" required placeholder="Ej: Carlos Ibarra" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">DNI / Documento</label>
              <input type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 focus:bg-white transition-all" required placeholder="Número de identidad" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Perfil Operativo</label>
              <select value={perfil} onChange={handlePerfilChange} className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 focus:bg-white transition-all" required>
                <option value="FIJO">🛡️ Guardia FIJO (Requiere Sede)</option>
                <option value="DESCANSERO">🔄 Guardia DESCANSERO (Volante)</option>
                <option value="RETÉN">⚡ Guardia RETÉN (Emergencias)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Sede de Trabajo</label>
              <select 
                value={sedeAsignada} 
                onChange={e => setSedeAsignada(e.target.value)} 
                disabled={perfil !== 'FIJO'}
                className={`w-full px-4 py-3 border border-gray-100 rounded-xl font-bold text-sm outline-none transition-all ${perfil !== 'FIJO' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-900 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 focus:bg-white'}`} 
                required={perfil === 'FIJO'}
              >
                {perfil === 'FIJO' ? (
                  <>
                    <option value="">-- Selecciona una Sede Fija --</option>
                    {sedesDisponibles.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </>
                ) : (
                  <option value="">ASIGNACIÓN DINÁMICA (VOLANTE)</option>
                )}
              </select>
            </div>

            {/* ─── ÁREA BIOMÉTRICA ─── */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex justify-between">
                Escaneo Facial 
                <span className={descriptorGenerado ? 'text-emerald-500' : 'text-amber-500'}>
                  {descriptorGenerado ? '✓ Capturado' : 'Pendiente'}
                </span>
              </label>
              
              <div className="bg-slate-900 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">{mensajeIA}</p>
                
                {!capturando && !descriptorGenerado && (
                  <button type="button" onClick={iniciarCamara} disabled={!modelosCargados} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${modelosCargados ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}>
                    📸 Activar Cámara
                  </button>
                )}

                {capturando && (
                  <div className="relative w-full rounded-xl bg-black overflow-hidden aspect-square border border-slate-700 mb-3">
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1] pointer-events-none"></canvas>
                    <button type="button" onClick={capturarHuellaFacial} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/50 active:scale-95 transition-all">
                      🎯 Extraer Rostro
                    </button>
                  </div>
                )}

                {descriptorGenerado && !capturando && (
                  <div className="py-6">
                    <div className="text-emerald-400 mb-2 text-4xl">✓</div>
                    <button type="button" onClick={iniciarCamara} className="text-[10px] font-bold text-slate-400 hover:text-white underline mt-2 uppercase tracking-widest">
                      Escanear de nuevo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={!descriptorGenerado} className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all flex justify-center items-center gap-2 ${descriptorGenerado ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                💾 Enrolar Guardia
              </button>
            </div>
          </form>
        </div>

        {/* ─── COLUMNA DERECHA: TABLA ─── */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-lg font-black text-gray-900 tracking-tight">Personal Enrolado</h3>
             <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
               {listaUsuarios.length} Registros
             </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="p-5 border-b border-gray-100">Guardia</th>
                  <th className="p-5 border-b border-gray-100">Perfil y Asignación</th>
                  <th className="p-5 border-b border-gray-100 text-center">Estado Biomédico</th>
                  <th className="p-5 border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {listaUsuarios.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-gray-900 text-sm">{u.nombre}</div>
                      <div className="text-gray-400 font-mono text-[10px] mt-1">DNI: {u.dni}</div>
                    </td>
                    
                    <td className="p-5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border mb-1.5 ${u.perfil === 'FIJO' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {u.perfil}
                      </span>
                      <div className="text-[10px] font-bold text-gray-600">{u.sedeNombre}</div>
                    </td>

                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-black uppercase tracking-widest">
                        ✓ Verificado
                      </span>
                    </td>

                    <td className="p-5 text-right space-x-2">
                      <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {listaUsuarios.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">👨‍✈️</div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay personal enrolado aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}