import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function AdminUsuarios() {
  const sedesDisponibles = [
    { id: 1, nombre: 'Sede ATE - Principal' },
    { id: 2, nombre: 'Pabellón B' },
    { id: 3, nombre: 'Almacén Central' },
    { id: 4, nombre: 'SURQUILLO 1' },
    { id: 5, nombre: 'WASHINGTON 2A' },
    { id: 6, nombre: 'USIL' }
  ];

  const [listaUsuarios, setListaUsuarios] = useState([
    { id: 1, nombre: 'Juan Pérez', dni: '77889900', perfil: 'FIJO', plantilla: 'P1', sede: 'SURQUILLO 1', facialListo: true, descriptor: null },
  ]);

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [perfil, setPerfil] = useState('FIJO'); 
  const [sedeAsignada, setSedeAsignada] = useState('');
  
  // ✨ NUEVO: Estado para la Plantilla de Horario
  const [plantilla, setPlantilla] = useState(''); 
  
  const [capturando, setCapturando] = useState(false);
  const [modelosCargados, setModelosCargados] = useState(false);
  const [descriptorGenerado, setDescriptorGenerado] = useState(null);
  const [mensajeIA, setMensajeIA] = useState('Esperando para iniciar IA...');

  const videoRef = useRef(null);
  const canvasRef = useRef(null); 
  const intervalRef = useRef(null); 

  useEffect(() => {
    const cargarModelos = async () => {
      try {
        setMensajeIA('Cargando modelos de IA...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        console.log("🧠 ¡Éxito: Los 3 modelos de IA se han cargado en memoria!");
        setModelosCargados(true);
        setMensajeIA('Modelos de IA listos.');
      } catch (error) {
        console.error("Error al cargar modelos:", error);
        setMensajeIA('Error al cargar la IA. Revisa la consola.');
      }
    };
    cargarModelos();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const iniciarCamara = () => {
    if (!modelosCargados) {
      alert("Por favor, espera a que los modelos de IA se carguen.");
      return;
    }
    setCapturando(true);
    setDescriptorGenerado(null);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { 
        videoRef.current.srcObject = stream; 
        videoRef.current.onplay = () => dibujarRostroEnTiempoReal();
      })
      .catch(err => console.error("Error cámara:", err));
  };

  const dibujarRostroEnTiempoReal = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    intervalRef.current = setInterval(async () => {
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
    setMensajeIA('Analizando rostro... ¡Mantente quieto!');

    try {
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(videoRef.current, opciones)
                                     .withFaceLandmarks()
                                     .withFaceDescriptor();

      if (detection) {
        const descriptorArray = Array.from(detection.descriptor);
        setDescriptorGenerado(descriptorArray);
        setMensajeIA('✅ Descriptor Facial capturado correctamente.');
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        setCapturando(false);
      } else {
        setMensajeIA('❌ No se detectó ningún rostro claro. Mejora la iluminación o mira de frente.');
      }
    } catch (error) {
      console.error("Error analizando rostro:", error);
      setMensajeIA('Error durante el análisis.');
    }
  };

  const guardarUsuario = (e) => {
    e.preventDefault();
    if (!descriptorGenerado) {
      alert("¡Debes capturar la huella facial antes de guardar el usuario!");
      return;
    }
    
    // Validación de plantilla si es Fijo
    if (perfil === 'FIJO' && !plantilla) {
      alert("¡Debes seleccionar una Plantilla de Horario para el perfil FIJO!");
      return;
    }

    const nuevo = { 
      id: Date.now(), 
      nombre, 
      dni, 
      perfil, 
      plantilla: perfil === 'FIJO' ? plantilla : '-', // Solo los fijos tienen plantilla base
      sede: sedeAsignada, 
      facialListo: true, 
      descriptor: descriptorGenerado
    };
    
    setListaUsuarios([...listaUsuarios, nuevo]);
    setNombre(''); 
    setDni(''); 
    setPerfil('FIJO'); 
    setSedeAsignada(''); 
    setPlantilla('');
    setDescriptorGenerado(null); 
    setMensajeIA('Modelos de IA listos.');
  };

  const handlePerfilChange = (e) => {
    const nuevoPerfil = e.target.value;
    setPerfil(nuevoPerfil);
    if (nuevoPerfil !== 'FIJO') {
      setSedeAsignada('MÚLTIPLES SEDES (VOLANTE)');
      setPlantilla(''); // Limpiamos la plantilla si no es fijo
    } else {
      setSedeAsignada('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* FORMULARIO DE REGISTRO */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className="text-xl font-bold mb-4">Registrar Nuevo Guardia</h2>
        <form onSubmit={guardarUsuario} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">DNI / ID</label>
            <input type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Perfil Operativo</label>
            <select value={perfil} onChange={handlePerfilChange} className="w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="FIJO">FIJO</option>
              <option value="DESCANSERO">DESCANSERO</option>
              <option value="RETÉN">RETÉN</option>
            </select>
          </div>

          {/* ✨ NUEVO: Selector de Plantilla (Se muestra solo si es FIJO) */}
          {perfil === 'FIJO' && (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <label className="block text-sm font-bold text-blue-800">Plantilla Base (Horario)</label>
              <select 
                value={plantilla} 
                onChange={e => setPlantilla(e.target.value)} 
                className="w-full mt-1 border border-blue-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                required
              >
                <option value="">Seleccione una plantilla...</option>
                <option value="P1">P1 (L-V | DÍA | 07:00 a 19:00)</option>
                <option value="P2">P2 (L-S | DÍA | 07:00 a 19:00)</option>
                <option value="P3">P3 (L-D | DÍA | 07:00 a 19:00)</option>
                <option value="P4">P4 (L-V | NOCHE | 19:00 a 07:00)</option>
                <option value="P5">P5 (L-S | NOCHE | 19:00 a 07:00)</option>
                <option value="P6">P6 (L-D | NOCHE | 19:00 a 07:00)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Sede Asignada</label>
            <select 
              value={sedeAsignada} 
              onChange={e => setSedeAsignada(e.target.value)} 
              disabled={perfil !== 'FIJO'}
              className={`w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${perfil !== 'FIJO' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
              required
            >
              {perfil === 'FIJO' ? (
                <>
                  <option value="">Seleccione una sede...</option>
                  {sedesDisponibles.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                </>
              ) : (
                <option value="MÚLTIPLES SEDES (VOLANTE)">MÚLTIPLES SEDES (VOLANTE)</option>
              )}
            </select>
          </div>

          {/* ÁREA DE CAPTURA BIOMÉTRICA */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-bold text-gray-800 mb-2">Biometría Facial</label>
            <p className="text-xs text-gray-500 mb-2">{mensajeIA}</p>
            
            {!capturando && !descriptorGenerado && (
              <button type="button" onClick={iniciarCamara} disabled={!modelosCargados} className={`w-full py-4 rounded-lg border-2 border-dashed font-medium ${modelosCargados ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                📸 Iniciar Cámara para Foto Base
              </button>
            )}

            {capturando && (
              <div className="space-y-3 relative flex flex-col items-center">
                 <div className="relative w-full rounded-lg bg-black overflow-hidden aspect-video flex justify-center items-center">
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover"></video>
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"></canvas>
                </div>
                <button type="button" onClick={capturarHuellaFacial} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors">
                  🎯 Extraer Descriptor Facial
                </button>
              </div>
            )}

            {descriptorGenerado && !capturando && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 mb-2"><i className="fa-solid fa-check-circle fa-2x"></i></div>
                <p className="text-sm font-bold text-green-800">Huella Facial Capturada</p>
                <button type="button" onClick={iniciarCamara} className="text-xs text-blue-600 mt-2 underline">
                  Volver a tomar foto
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={!descriptorGenerado} className={`w-full py-3 rounded-lg font-bold shadow-lg mt-4 transition-colors ${descriptorGenerado ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-300 text-blue-50 cursor-not-allowed'}`}>
            Guardar Usuario en MySQL
          </button>
        </form>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className="text-xl font-bold mb-4">Personal Enrolado</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="p-4 font-semibold">Nombre / DNI</th>
                <th className="p-4 font-semibold">Perfil y Sede</th>
                <th className="p-4 font-semibold text-center">Plantilla Base</th>
                <th className="p-4 font-semibold text-center">Biometría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaUsuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{u.nombre}</div>
                    <div className="text-xs text-gray-500 mt-1">DNI: {u.dni}</div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block ${u.perfil === 'FIJO' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                      {u.perfil}
                    </span>
                    <div className="text-xs text-gray-600 mt-1 font-medium">{u.sede}</div>
                  </td>
                  
                  {/* ✨ NUEVO: Mostramos la plantilla asignada */}
                  <td className="p-4 text-center">
                    <span className="font-mono text-sm font-bold text-gray-700">{u.plantilla}</span>
                  </td>

                  <td className="p-4 text-center">
                    {u.facialListo ? 
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        ✓ REGISTRADO
                      </span> :
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold">
                        PENDIENTE
                      </span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}