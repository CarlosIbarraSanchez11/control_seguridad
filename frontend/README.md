# 🛡️ Sistema de Control de Seguridad

Sistema web para la gestión integral de personal de seguridad, con módulos de administración y marcación de asistencia biométrica con geolocalización.

---

## 📋 Descripción

Esta aplicación está diseñada para empresas de seguridad privada. Permite administrar sedes, registrar guardias con reconocimiento facial, programar turnos semanales y registrar asistencia en tiempo real mediante GPS + biometría facial.

---

## 🚀 Funcionalidades

### 🔐 Portal del Guardia (Marcación)
- **Reconocimiento facial** con `face-api.js` para verificar identidad
- **Geofencing GPS** con fórmula de Haversine para validar que el guardia está dentro del radio autorizado de la sede
- **Mapa interactivo** (Leaflet) que muestra la posición del guardia vs. la sede
- Flujo de 3 pasos: carga de foto base → validación GPS → verificación de rostro en vivo

### ⚙️ Portal Administrativo
Contiene 3 módulos:

#### 📍 Gestión de Sedes
- Crear, editar y habilitar/inhabilitar sedes
- Selección de coordenadas mediante clic en mapa interactivo
- Configuración de radio de geofence por sede

#### 👥 Gestión de Usuarios (Guardias)
- Registro de guardias con datos: nombre, DNI, perfil operativo y sede
- Captura de huella facial en tiempo real con detección de rostro
- Perfiles: **FIJO**, **DESCANSERO**, **RETÉN**
- Asignación de plantilla de horario (P1–P6) para guardias fijos

#### 📅 Matriz de Turnos (Programación)
- Vista de programación semanal por emplazamiento/ambiente
- Asignación de guardias fijos con validación de plantilla y turno
- Auditoría de cobertura diaria con alertas de huecos
- Asignación rápida de descanseros para cubrir ausencias
- Opción de marcar días como "Cerrado / Sin Servicio"
- Registro de tardanzas, faltas y días programados vs. reales

---

## 🧰 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| React 19 | Framework principal (JSX) |
| Vite 8 | Build tool y dev server |
| Tailwind CSS 4 | Estilos |
| face-api.js | Reconocimiento facial con IA |
| Leaflet + react-leaflet | Mapas interactivos y geofencing |

---

## 📁 Estructura del Proyecto

```
control_seguridad/
└── frontend/
    ├── public/
    │   └── models/         # Modelos de IA (face-api.js)
    ├── src/
    │   ├── App.jsx          # Navegación principal y control de vistas
    │   ├── pages/
    │   │   ├── Login.jsx              # (Componente pendiente)
    │   │   ├── AdminSedes.jsx         # Gestión de sedes con mapa
    │   │   ├── AdminUsuarios.jsx      # Registro biométrico de guardias
    │   │   ├── AdminProgramacion.jsx  # Matriz de turnos semanal
    │   │   ├── GuardiaAsistencia.jsx  # Marcación GPS + facial
    │   │   ├── ModalProgramacion.jsx  # Modal para asignar guardia fijo
    │   │   └── ModalAsignacionRapida.jsx # Modal para cubrir huecos
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Instalación y Uso

### Prerrequisitos
- Node.js >= 18
- npm >= 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/CarlosIbarraSanchez11/control_seguridad.git
cd control_seguridad/frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | Análisis de código con ESLint |

### Modelos de IA requeridos

Para que el reconocimiento facial funcione, los modelos de `face-api.js` deben estar en `public/models/`. Se requieren:

- `tiny_face_detector_model`
- `face_landmark_68_model`
- `face_recognition_model`

Puedes descargarlos desde el repositorio oficial de [face-api.js](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).

---

## 🗺️ Flujo de la Aplicación

```
Inicio
├── Portal del Guardia
│   ├── Paso 1: Subir foto base (simula la BD)
│   ├── Paso 2: Validación GPS (geofence 50m)
│   └── Paso 3: Reconocimiento facial en vivo → Asistencia registrada
└── Portal Administrativo
    ├── Gestionar Sedes
    ├── Gestionar Usuarios (con biometría)
    └── Matriz de Turnos
```

---

## 📌 Estado del Proyecto

> ⚠️ **En desarrollo activo.** El frontend está funcional con datos simulados (mock). Aún no está conectado a un backend o base de datos real (MySQL).

### Pendiente
- [ ] Conexión a API backend (Node.js / Laravel)
- [ ] Integración con base de datos MySQL
- [ ] Autenticación real (JWT)
- [ ] Completar `Login.jsx`
- [ ] Persistencia de modelos faciales en base de datos

---

## 👨‍💻 Autor

**Carlos Ibarra Sánchez**  
GitHub: [@CarlosIbarraSanchez11](https://github.com/CarlosIbarraSanchez11)
