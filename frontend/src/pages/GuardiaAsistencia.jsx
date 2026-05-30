import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- CONFIGURACIÓN DE GEOFENCE (RANGO GPS) ---
// Coordenadas de Sede ATE Principal
const SEDE_LAT = -12.0253;
const SEDE_LNG = -76.9026;
const RANGO_METROS = 50; // Radio permitido en metros

// Arreglo para los íconos de Leaflet en React (evita el bug del ícono roto)
const iconoSede = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const iconoUsuario = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function GuardiaAsistencia() {
  const [paso, setPaso] = useState(0); 
  const [mensaje, setMensaje] = useState('Sube una foto tuya para simular la Base de Datos.');
  const [modelosCargados, setModelosCargados] = useState(false);
  
  const [descriptorBase, setDescriptorBase] = useState(null); 
  const [resultadoMatch, setResultadoMatch] = useState(null); 

  // Estados para el GPS
  const [ubicacionUser, setUbicacionUser] = useState(null);
  const [distanciaSede, setDistanciaSede] = useState(null);
  const [estadoGps, setEstadoGps] = useState('esperando'); // esperando, calculando, dentro, fuera

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const cargarModelos = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelosCargados(true);
      } catch (error) {
        console.error("Error al cargar modelos de IA:", error);
      }
    };
    cargarModelos();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const manejarSubidaFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMensaje('Analizando la foto cargada...');
    const imgUrl = URL.createObjectURL(file);
    imgRef.current.src = imgUrl;

    imgRef.current.onload = async () => {
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 });
      const detection = await faceapi.detectSingleFace(imgRef.current, opciones)
                                     .withFaceLandmarks()
                                     .withFaceDescriptor();
      
      if (detection) {
        setDescriptorBase(detection.descriptor);
        setMensaje('✅ Foto base registrada con éxito. Pasa a validar tu ubicación.');
        setPaso(1);
      } else {
        setMensaje('❌ No encontré un rostro en esa foto. Sube otra.');
      }
    };
  };

  // --- FÓRMULA DE HAVERSINE PARA MEDIR DISTANCIA REAL ---
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la tierra en metros
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const iniciarVerificacionGps = () => {
    setEstadoGps('calculando');
    setMensaje('📍 Conectando con satélites...');

    if (!navigator.geolocation) {
      setMensaje('❌ Tu navegador no soporta GPS.');
      setEstadoGps('fuera');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Tus coordenadas reales (las comentamos por ahora)
        // const userLat = position.coords.latitude;
        // const userLng = position.coords.longitude;

        // 🚨 TRUCO VIP: Te teletransportamos a 22 metros de la Sede ATE
        const userLat = SEDE_LAT + 0.0002; 
        const userLng = SEDE_LNG;

        setUbicacionUser({ lat: userLat, lng: userLng });

        // CÁLCULO REAL CONTRA LA SEDE ATE:
        const distancia = calcularDistancia(userLat, userLng, SEDE_LAT, SEDE_LNG);
        
        setDistanciaSede(distancia);

        if (distancia <= RANGO_METROS) {
          setEstadoGps('dentro');
          setMensaje(`✅ Estás a ${Math.round(distancia)}m de la sede. Rango aceptado.`);
          setTimeout(() => {
            setPaso(2);
            iniciarCamara();
          }, 3500); // Te dejo 3.5 segundos para que aprecies tu mapa verde jeje
        } else {
          setEstadoGps('fuera');
          setMensaje(`❌ Estás a ${Math.round(distancia)}m de la sede. Acércate más (Máx ${RANGO_METROS}m).`);
        }
      },
      (error) => {
        console.warn("Detalle del error GPS:", error);
        
        // Mensajes dinámicos según el tipo de error real
        if (error.code === 1) {
            setMensaje('❌ Permiso denegado por el navegador o Windows.');
        } else if (error.code === 2) {
            setMensaje('❌ Ubicación no disponible (PC sin GPS o falla de red).');
        } else if (error.code === 3) {
            setMensaje('❌ Tiempo de espera agotado. Intenta de nuevo.');
        } else {
            setMensaje(`❌ Error GPS: ${error.message}`);
        }
        setEstadoGps('fuera');
      },
      // Ajuste clave para PC: quitamos la precisión estricta y damos un tiempo límite
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    );
  };

  const iniciarCamara = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { 
        if (videoRef.current) {
          videoRef.current.srcObject = stream; 
          videoRef.current.onplay = () => dibujarRostroEnTiempoReal();
        }
      })
      .catch(err => setMensaje('❌ Error al acceder a la cámara.'));
  };

  const dibujarRostroEnTiempoReal = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) {
        clearInterval(intervalRef.current);
        return;
      }
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2 });
      const detections = await faceapi.detectAllFaces(videoRef.current, opciones).withFaceLandmarks();
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
    }, 100);
  };

  const validarAsistencia = async () => {
    if (!videoRef.current || !descriptorBase) return;
    setMensaje('Comparando rostros... ¡Mantente quieto!');

    try {
      const opciones = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 });
      const detectionVivo = await faceapi.detectSingleFace(videoRef.current, opciones)
                                         .withFaceLandmarks()
                                         .withFaceDescriptor();

      if (detectionVivo) {
        const descriptorLive = detectionVivo.descriptor;
        const distancia = faceapi.euclideanDistance(descriptorBase, descriptorLive);
        setResultadoMatch(distancia);
        const umbralMaximo = 0.45;

        if (distancia < umbralMaximo) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          setMensaje(`✅ Identidad confirmada.`);
          setPaso(3); 
        } else {
          setMensaje(`❌ Rostro no coincide. (Distancia: ${distancia.toFixed(2)})`);
        }
      } else {
        setMensaje('❌ No se detectó rostro en la cámara. Mejora la luz.');
      }
    } catch (error) {
      setMensaje('Error técnico al analizar.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Control de Asistencia</h2>
        <p className="text-sm font-medium text-gray-600 mb-6 min-h-[40px] flex items-center justify-center">
          {mensaje}
        </p>

        <img ref={imgRef} alt="Oculto" className="hidden" />

        {/* --- PASO 0: CARGAR FOTO --- */}
        {paso === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <div className="text-gray-400 mb-3"><i className="fa-solid fa-cloud-arrow-up fa-3x"></i></div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Seleccionar Foto Base (Simular BD)
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={manejarSubidaFoto}
              disabled={!modelosCargados}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {!modelosCargados && <p className="text-xs text-red-500 mt-2">Cargando IA, un momento...</p>}
          </div>
        )}

        {/* --- PASO 1: MAPA GPS DINÁMICO --- */}
        {paso === 1 && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            {estadoGps === 'esperando' && (
              <button 
                onClick={iniciarVerificacionGps}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mb-4"
              >
                <i className="fa-solid fa-location-crosshairs"></i> Obtener mi Ubicación
              </button>
            )}

            {estadoGps === 'calculando' && (
              <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center border animate-pulse">
                <span className="text-gray-500"><i className="fa-solid fa-satellite-dish animate-bounce"></i> Satélites...</span>
              </div>
            )}

            {/* SE MUESTRA EL MAPA CUANDO HAY COORDENADAS */}
            {ubicacionUser && (estadoGps === 'dentro' || estadoGps === 'fuera') && (
              <div className={`relative w-full h-64 rounded-xl overflow-hidden shadow-inner border-4 transition-all duration-500 ${estadoGps === 'dentro' ? 'border-green-500 shadow-green-200' : 'border-red-500 shadow-red-200'}`}>
                
                <MapContainer center={[SEDE_LAT, SEDE_LNG]} zoom={17} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Marcador de la Sede */}
                  <Marker position={[SEDE_LAT, SEDE_LNG]} icon={iconoSede}>
                    <Popup>Sede ATE Principal</Popup>
                  </Marker>
                  
                  {/* Círculo de Rango (Cambia color) */}
                  <Circle 
                    center={[SEDE_LAT, SEDE_LNG]} 
                    radius={RANGO_METROS} 
                    pathOptions={{ 
                      color: estadoGps === 'dentro' ? '#22c55e' : '#ef4444', 
                      fillColor: estadoGps === 'dentro' ? '#22c55e' : '#ef4444', 
                      fillOpacity: 0.2 
                    }} 
                  />

                  {/* Marcador del Usuario */}
                  <Marker position={[ubicacionUser.lat, ubicacionUser.lng]} icon={iconoUsuario}>
                    <Popup>Tú estás aquí</Popup>
                  </Marker>
                </MapContainer>
                
                {/* Etiqueta superpuesta */}
                <div className="absolute bottom-2 left-0 right-0 z-[1000] flex justify-center">
                    <span className={`px-4 py-1 text-xs font-black text-white rounded-full shadow-lg ${estadoGps === 'dentro' ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}>
                        {estadoGps === 'dentro' ? 'RANGO AUTORIZADO' : 'FUERA DE RANGO'}
                    </span>
                </div>
              </div>
            )}

            {estadoGps === 'fuera' && (
              <button 
                onClick={iniciarVerificacionGps}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors border"
              >
                <i className="fa-solid fa-rotate-right"></i> Reintentar GPS
              </button>
            )}
          </div>
        )}

        {/* --- PASO 2: CÁMARA --- */}
        {paso === 2 && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="relative w-full rounded-lg bg-black overflow-hidden aspect-video flex justify-center items-center mb-6 shadow-inner">
              <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover"></video>
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"></canvas>
            </div>
            
            <button 
              onClick={validarAsistencia}
              className="w-full py-4 rounded-lg font-bold shadow-md transition-colors bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-face-viewfinder"></i> 2. Comparar Rostro Vivo vs Foto
            </button>
          </div>
        )}

        {/* --- PASO 3: ÉXITO --- */}
        {paso === 3 && (
          <div className="flex flex-col items-center animate-fade-in py-6">
            <div className="text-green-500 mb-4 animate-bounce">
              <i className="fa-solid fa-circle-check fa-5x"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Asistencia Registrada!</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg w-full p-4 text-left mb-4">
              <p className="text-sm text-green-800 text-center font-bold">✅ MATCH DE ROSTRO Y UBICACIÓN</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg w-full p-4 text-left">
              <p className="text-sm text-gray-600 mb-1"><strong>Usuario:</strong> carlos@ips.pe</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Sede:</strong> Sede ATE - Principal</p>
              <p className="text-sm text-gray-600"><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}