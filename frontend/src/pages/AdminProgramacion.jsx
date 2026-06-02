import React, { useState, Fragment } from 'react';
import ModalProgramacion from './ModalProgramacion';
import ModalAsignarGuardia from './ModalAsignarGuardia'; 
import ModalAsignacionRapida from './ModalAsignacionRapida'; 

// ─── CATÁLOGO MAESTRO DE SEDES Y AMBIENTES ───
const catalogoSedesMock = [
  { nombre: 'USIL', ambientes: ['PUERTA PRINCIPAL', 'RECEPCIÓN', 'SÓTANO 1', 'ESTACIONAMIENTO', 'BIBLIOTECA'] },
  { nombre: 'TELEFÓNICA', ambientes: ['SURQUILLO 1', 'WASHINGTON 2A', 'CENTRO DE CONTROL'] },
  { nombre: 'BCP', ambientes: ['BÓVEDA', 'LOBBY PRINCIPAL', 'PUERTA TRASERA'] }
];

const dataSimulada = [
  { id: 1, unidad: 'USIL', emplazamiento: 'PUERTA PRINCIPAL', perfilRequerido: 'P1', guardia: 'Juan Perez', perfilGuardia: 'FIJO', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'OK', ma: 'OK', mi: 'OK', ju: 'OK', vi: 'OK', sa: 'CERRADO', do: 'CERRADO', prog: 5, reales: 5, faltas: 0, tardanza: '0m' },
  { id: 2, unidad: 'USIL', emplazamiento: 'ESTACIONAMIENTO', perfilRequerido: 'P3', guardia: 'Pedro Ruiz', perfilGuardia: 'FIJO', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'OK', ma: 'OK', mi: 'OK', ju: 'OK', vi: 'DESC', sa: 'OK', do: 'OK', prog: 6, reales: 6, faltas: 0, tardanza: '0m' },
  { id: 3, unidad: 'USIL', emplazamiento: 'BIBLIOTECA', perfilRequerido: 'P8', guardia: 'Maria Paz', perfilGuardia: 'FIJO', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'OK', ma: 'OK', mi: 'OK', ju: 'CERRADO', vi: 'CERRADO', sa: 'CERRADO', do: 'CERRADO', prog: 3, reales: 3, faltas: 0, tardanza: '0m' },
  { id: 4, unidad: 'USIL', emplazamiento: 'BIBLIOTECA', perfilRequerido: 'P9', guardia: 'Luis Torres', perfilGuardia: 'FIJO', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'CERRADO', ma: 'CERRADO', mi: 'CERRADO', ju: 'OK', vi: 'OK', sa: 'OK', do: 'CERRADO', prog: 3, reales: 3, faltas: 0, tardanza: '0m' },
];

const usuariosMock = [
  { id: 101, nombre: 'Juan Perez', perfil: 'FIJO', sede: 'PUERTA PRINCIPAL', plantilla: 'P1' }, 
  { id: 102, nombre: 'Pedro Ruiz', perfil: 'FIJO', sede: 'ESTACIONAMIENTO', plantilla: 'P3' }, 
  { id: 103, nombre: 'Maria Paz', perfil: 'FIJO', sede: 'BIBLIOTECA', plantilla: 'P8' }, 
  { id: 104, nombre: 'Luis Torres', perfil: 'FIJO', sede: 'BIBLIOTECA', plantilla: 'P9' }, 
  
  { id: 901, nombre: 'Ian Vasq', perfil: 'DESCANSERO', sede: 'MÚLTIPLES SEDES', plantilla: '-' },
  
  { id: 991, nombre: 'Tito Reten', perfil: 'RETÉN', sede: 'MÚLTIPLES SEDES', plantilla: '-' },
  { id: 992, nombre: 'Alan Reemplazo', perfil: 'RETÉN', sede: 'MÚLTIPLES SEDES', plantilla: '-' },
];

export default function AdminProgramacion() {
  const [turnos, setTurnos] = useState(dataSimulada);
  const [usuariosEnrolados] = useState(usuariosMock); 
  const [catalogoSedes] = useState(catalogoSedesMock); 
  
  const [detalleModal, setDetalleModal] = useState(null); 
  const [reemplazoSeleccionado, setReemplazoSeleccionado] = useState(''); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [infoHuecoModal, setInfoHuecoModal] = useState(null);  
  const [infoAsignacionRapida, setInfoAsignacionRapida] = useState(null); 

  // ✨ NUEVO: ESTADOS DE TIEMPO (Para el Tareo Mensual)
  const [mesActivo, setMesActivo] = useState('2026-06');
  const [semanaActiva, setSemanaActiva] = useState('sem-1');

  const diasSemana = [
    { id: 'lu', label: 'L', nombre: 'Lunes' }, { id: 'ma', label: 'M', nombre: 'Martes' }, { id: 'mi', label: 'M', nombre: 'Miércoles' },
    { id: 'ju', label: 'J', nombre: 'Jueves' }, { id: 'vi', label: 'V', nombre: 'Viernes' }, { id: 'sa', label: 'S', nombre: 'Sábado' }, { id: 'do', label: 'D', nombre: 'Domingo' }
  ];

  const sedesActivas = [...new Set(turnos.map((t) => t.unidad))];

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'OK': return 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 shadow-sm cursor-pointer hover:bg-emerald-200';
      case 'SIN_ASIGNAR': return 'bg-amber-100 text-amber-700 font-black border border-amber-300 animate-pulse shadow-sm';
      case 'CERRADO': return 'bg-slate-800 text-white font-bold border border-slate-900 cursor-default shadow-sm';
      case 'FALTA': return 'bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer animate-pulse shadow-sm';
      case 'VAC': return 'bg-sky-100 text-sky-700 font-black border border-sky-300 cursor-pointer shadow-sm'; // ✨ NUEVO: Color Vacaciones
      case 'DESC': return 'bg-gray-100 text-gray-400 font-bold border border-gray-200 cursor-default';
      case '-': return 'text-gray-300 cursor-default';
      default: return 'bg-gray-100 text-gray-400 font-bold cursor-default';
    }
  };

  const abrirDetalle = (fila, diaStr) => {
    if (fila[diaStr] === '-' || fila[diaStr] === 'DESC' || fila[diaStr] === 'CERRADO' || fila[diaStr] === 'SIN_ASIGNAR') return;
    setReemplazoSeleccionado(''); 
    setDetalleModal({
      filaId: fila.id, 
      diaId: diaStr,
      guardia: fila.guardia, 
      perfilGuardia: fila.perfilGuardia, 
      emplazamiento: fila.emplazamiento, dia: diaStr.toUpperCase(), estado: fila[diaStr],
      programado: `${fila.horaInicio} a ${fila.horaFin}`
    });
  };

  // ✨ FUNCIÓN UNIFICADA: Maneja Faltas y Vacaciones
  const handleModificarTurno = (idFilaOriginal, diaId, nuevoEstado, nombreReemplazo = false) => {
    let nuevosTurnos = [...turnos];
    const turnoOriginal = nuevosTurnos.find(t => t.id === idFilaOriginal);

    if (turnoOriginal[diaId] !== 'FALTA' && turnoOriginal[diaId] !== 'VAC') {
      turnoOriginal[diaId] = nuevoEstado; // Puede ser 'FALTA' o 'VAC'
      turnoOriginal.reales -= 1; 
      if (nuevoEstado === 'FALTA') turnoOriginal.faltas += 1;
    }

    if (nombreReemplazo) {
      const usuarioData = usuariosEnrolados.find(u => u.nombre === nombreReemplazo);
      const indexExistente = nuevosTurnos.findIndex(t => t.guardia === usuarioData.nombre && t.emplazamiento === turnoOriginal.emplazamiento);

      if (indexExistente >= 0) {
        nuevosTurnos[indexExistente][diaId] = 'OK';
        nuevosTurnos[indexExistente].prog += 1;
        nuevosTurnos[indexExistente].reales += 1;
        nuevosTurnos[indexExistente].reemplazos = { 
          ...nuevosTurnos[indexExistente].reemplazos, 
          [diaId]: turnoOriginal.guardia 
        };
      } else {
        const nuevoTurno = {
          id: Date.now(), unidad: turnoOriginal.unidad, emplazamiento: turnoOriginal.emplazamiento, 
          perfilRequerido: null, perfilGuardia: usuarioData.perfil, guardia: usuarioData.nombre, 
          turno: turnoOriginal.turno, horaInicio: turnoOriginal.horaInicio, horaFin: turnoOriginal.horaFin,
          lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-',
          [diaId]: 'OK', 
          prog: 1, reales: 1, faltas: 0, tardanza: '0m',
          reemplazos: { [diaId]: turnoOriginal.guardia } 
        };
        nuevosTurnos.push(nuevoTurno);
      }
    }

    setTurnos(nuevosTurnos);
    setDetalleModal(null);
  };

  const handleGuardarRequerimiento = (nuevoDato) => {
    const nuevoTurno = { id: Date.now(), ...nuevoDato, reales: 0, faltas: 0, tardanza: '0m' };
    setTurnos([...turnos, nuevoTurno]);
  };

  const handleRellenarGuardia = ({ idFila, guardia, perfilGuardia, diaDescanso }) => {
    const nuevosTurnos = turnos.map(turno => {
      if (turno.id === idFila) {
        let diasActualizados = {};
        diasSemana.forEach(d => {
          if (turno[d.id] === 'SIN_ASIGNAR') {
            diasActualizados[d.id] = (d.id === diaDescanso) ? 'DESC' : 'OK'; 
          }
        });
        return { ...turno, guardia, perfilGuardia, ...diasActualizados };
      }
      return turno;
    });
    setTurnos(nuevosTurnos);
  };

  const handleGuardarAsignacionRapida = (datoRapido) => {
    const indexExistente = turnos.findIndex(t => t.guardia === datoRapido.guardia && t.emplazamiento === datoRapido.emplazamiento);
    const estadoAsignar = datoRapido.perfil === 'CERRADO' ? 'CERRADO' : 'OK';

    if (indexExistente >= 0) {
      const nuevosTurnos = [...turnos];
      nuevosTurnos[indexExistente][datoRapido.diaFaltante] = estadoAsignar;
      if (estadoAsignar === 'OK') nuevosTurnos[indexExistente].prog += 1;
      setTurnos(nuevosTurnos);
    } else {
      const sede = turnos.find(t => t.emplazamiento === datoRapido.emplazamiento)?.unidad || 'SISTEMA';
      const nuevoTurno = {
        id: Date.now(), unidad: sede, emplazamiento: datoRapido.emplazamiento, 
        perfilRequerido: null, perfilGuardia: datoRapido.perfil, guardia: datoRapido.guardia, 
        turno: datoRapido.turno, horaInicio: datoRapido.horaInicio, horaFin: datoRapido.horaFin,
        lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-',
        [datoRapido.diaFaltante]: estadoAsignar, 
        prog: estadoAsignar === 'OK' ? 1 : 0, reales: 0, faltas: 0, tardanza: '0m'
      };
      setTurnos([...turnos, nuevoTurno]);
    }
  };

  const reemplazoDelDetalle = detalleModal 
    ? turnos.find(t => t.emplazamiento === detalleModal.emplazamiento && t.reemplazos && t.reemplazos[detalleModal.diaId] === detalleModal.guardia)
    : null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* ✨ PANEL DE CONTROL: TAREO MENSUAL */}
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3 mb-2">
            📊 Tareo y Requerimientos
          </h2>
          <div className="flex gap-2">
            <select value={mesActivo} onChange={(e) => setMesActivo(e.target.value)} className="text-xs bg-white border border-gray-200 text-gray-700 font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer shadow-sm">
              <option value="2026-05">Mayo 2026</option>
              <option value="2026-06">Junio 2026</option>
            </select>
            <select value={semanaActiva} onChange={(e) => setSemanaActiva(e.target.value)} className="text-xs bg-white border border-gray-200 text-indigo-700 font-black rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer shadow-sm">
              <option value="sem-1">Semana 1 (1 al 7)</option>
              <option value="sem-2">Semana 2 (8 al 14)</option>
              <option value="sem-3">Semana 3 (15 al 21)</option>
              <option value="sem-4">Semana 4 (22 al 28)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm active:scale-95 flex items-center gap-2">
             <span>⬇️</span> Descargar Tareo Mensual
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center gap-2">
             <span>🏗️</span> Configurar Ambiente
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="p-5 border-b border-gray-100">Datos del Servicio (Guardia)</th>
              <th className="p-5 border-b border-gray-100 text-center">Horario</th>
              {diasSemana.map((dia, idx) => (
                 <th key={dia.id} className={`p-5 border-b border-gray-100 text-center bg-gray-100/30 ${idx === 0 ? 'border-l' : ''} ${dia.id === 'sa' || dia.id === 'do' ? 'bg-blue-50/50 text-blue-500' : ''}`}>{dia.label}</th>
              ))}
              <th className="p-5 border-b border-gray-100 text-center bg-emerald-50/50 text-emerald-700 border-l">Prog</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium">
            
            {sedesActivas.map((sede) => {
              const turnosDeSede = turnos.filter(t => t.unidad === sede);
              const ambientesEnSede = [...new Set(turnosDeSede.map(t => t.emplazamiento))];

              return (
                <Fragment key={sede}>
                  <tr>
                    <td colSpan="10" className="bg-indigo-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 border-y border-indigo-950">
                      🏢 SEDE: {sede}
                    </td>
                  </tr>

                  {ambientesEnSede.map(ambiente => {
                    const equipoPuesto = turnosDeSede.filter(t => t.emplazamiento === ambiente);

                    return (
                      <Fragment key={`${sede}-${ambiente}`}>
                        <tr>
                          <td colSpan="10" className="bg-gray-100/80 text-[10px] font-black text-indigo-700 uppercase tracking-widest px-8 py-2 border-b border-gray-200">
                            📍 AMBIENTE: {ambiente}
                          </td>
                        </tr>

                        {equipoPuesto.map((fila) => (
                          <tr key={fila.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                            
                            <td className="p-5 pl-8">
                              {fila.guardia ? (
                                <div className="flex flex-col items-start">
                                  <span className="text-gray-950 font-black text-sm tracking-tight">{fila.guardia}</span>
                                  <span className="text-[10px] text-indigo-500 uppercase font-bold">
                                    {fila.perfilRequerido ? `${fila.perfilRequerido} • ` : ''}{fila.perfilGuardia}
                                  </span>
                                  
                                  {fila.reemplazos && Object.keys(fila.reemplazos).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {Object.entries(fila.reemplazos).map(([dia, nombreOriginal]) => (
                                        <span key={dia} className="bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider" title={`Reemplazó a ${nombreOriginal}`}>
                                          🚑 {dia}: {nombreOriginal.split(' ')[0]}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setInfoHuecoModal(fila)}
                                  className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm flex items-center gap-2"
                                >
                                  👤 Asignar Guardia
                                </button>
                              )}
                            </td>
                            
                            <td className="p-5 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100/50 rounded-lg border border-gray-100">
                                <span className="font-bold text-gray-600">{fila.horaInicio}</span>
                                <span className="text-gray-400 text-[10px]">&rarr;</span>
                                <span className="font-bold text-gray-600">{fila.horaFin}</span>
                              </div>
                            </td>
                            
                            {diasSemana.map((dia, index) => (
                              <td key={dia.id} className={`p-2 text-center border-x border-gray-50/30 ${index === 0 ? 'border-l-gray-100' : ''}`}>
                                <button 
                                  onClick={() => abrirDetalle(fila, dia.id)}
                                  disabled={fila[dia.id] === '-' || fila[dia.id] === 'DESC' || fila[dia.id] === 'CERRADO' || fila[dia.id] === 'SIN_ASIGNAR'}
                                  className={`inline-block w-full py-1.5 px-1 rounded-lg text-[9px] uppercase tracking-tighter transition-transform active:scale-90 ${getEstadoBadge(fila[dia.id])}`}
                                >
                                  {fila[dia.id] === 'SIN_ASIGNAR' ? 'VACÍO' : fila[dia.id]}
                                </button>
                              </td>
                            ))}

                            <td className="p-5 text-center bg-emerald-50/20 font-black text-gray-700 border-l border-emerald-100">{fila.prog}</td>
                          </tr>
                        ))}

                        <tr className="bg-amber-50/30">
                          <td colSpan="2" className="p-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Auditoría de Cobertura ➡️
                          </td>
                          
                          {diasSemana.map((dia, index) => {
                            const target = equipoPuesto.filter(f => f.perfilRequerido && f[dia.id] !== 'CERRADO').length;
                            // ✨ IMPORTANTE: La Auditoría IGNORA las FALTAS y VACACIONES, obligándote a cubrirlas
                            const covered = equipoPuesto.filter(f => f[dia.id] === 'OK' || (f.guardia === 'SIN SERVICIO' && f[dia.id] === 'CERRADO')).length;
                            const huecosFaltantes = target - covered;
                            
                            return (
                              <td key={`auditoria-${dia.id}`} className={`p-1.5 text-center border-x border-amber-100/50 ${index === 0 ? 'border-l-amber-200' : ''}`}>
                                {huecosFaltantes <= 0 ? (
                                  <span className="text-emerald-500 font-bold text-xs">✓</span>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <button 
                                      onClick={() => setInfoAsignacionRapida({ 
                                        emplazamiento: ambiente, diaId: dia.id, diaNombre: dia.nombre, 
                                        turnoBase: equipoPuesto[0]?.turno || 'DÍA', 
                                        horaInicio: equipoPuesto[0]?.horaInicio || '08:00', horaFin: equipoPuesto[0]?.horaFin || '20:00' 
                                      })}
                                      className="bg-rose-500 text-white text-[9px] font-black uppercase py-1 px-1 rounded shadow-sm hover:bg-rose-600 transition-all w-full flex items-center justify-center gap-1"
                                    >
                                      ⚠️ CUBRIR
                                    </button>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="border-l border-amber-200"></td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL DETALLE: FALTAS Y VACACIONES ─── */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">{detalleModal.guardia}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Día: {detalleModal.dia} • {detalleModal.emplazamiento}</p>
              </div>
              <button onClick={() => setDetalleModal(null)} className="text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Turno Prog.</span>
                <span className="font-black text-gray-700">{detalleModal.programado}</span>
              </div>
              
              {/* ✨ MENÚ ÁGIL PARA MODIFICAR ESTADO Y ASIGNAR RETÉN */}
              {detalleModal.perfilGuardia === 'FIJO' && !reemplazoDelDetalle && (detalleModal.estado === 'OK' || detalleModal.estado === 'FALTA' || detalleModal.estado === 'VAC') && (
                <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Modificar Estado o Reemplazar
                  </label>
                  
                  <select 
                    value={reemplazoSeleccionado} 
                    onChange={(e) => setReemplazoSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-200 mb-3 bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="">-- SELECCIONAR RETÉN --</option>
                    {usuariosEnrolados.filter(u => u.perfil === 'RETÉN').map(u => (
                      <option key={u.id} value={u.nombre}>{u.nombre}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2 mb-2">
                    {detalleModal.estado === 'OK' && (
                      <>
                        <button 
                          onClick={() => handleModificarTurno(detalleModal.filaId, detalleModal.diaId, 'FALTA', false)}
                          className="flex-1 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-black py-2.5 rounded-xl text-[10px] uppercase transition-all"
                        >
                          Marcar Falta
                        </button>
                        <button 
                          onClick={() => handleModificarTurno(detalleModal.filaId, detalleModal.diaId, 'VAC', false)}
                          className="flex-1 bg-white text-sky-600 border border-sky-200 hover:bg-sky-50 font-black py-2.5 rounded-xl text-[10px] uppercase transition-all"
                        >
                          Vacaciones
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleModificarTurno(detalleModal.filaId, detalleModal.diaId, 'FALTA', reemplazoSeleccionado)}
                    disabled={!reemplazoSeleccionado}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-[10px] uppercase shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    🚑 Aplicar Retén
                  </button>
                </div>
              )}

              {/* MENSAJES DE ESTADO */}
              {detalleModal.estado === 'FALTA' && (
                <div className="bg-rose-100 text-rose-700 p-3 rounded-xl text-xs font-bold text-center border border-rose-200">
                  ⚠️ Infracción: Inasistencia registrada.
                </div>
              )}
              
              {detalleModal.estado === 'VAC' && (
                <div className="bg-sky-100 text-sky-700 p-3 rounded-xl text-xs font-bold text-center border border-sky-200">
                  🌴 Personal de Vacaciones.
                </div>
              )}

              {reemplazoDelDetalle && (
                <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl text-xs font-bold text-center border border-indigo-200 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-indigo-400">Turno Cubierto por Retén</span>
                  <span className="text-sm">🚑 {reemplazoDelDetalle.guardia}</span>
                </div>
              )}

            </div>

            <button onClick={() => setDetalleModal(null)} className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 shadow-lg">
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {/* OTROS MODALES */}
      <ModalProgramacion isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleGuardarRequerimiento} semanaProgramada={semanaActiva} catalogoSedes={catalogoSedes} turnos={turnos} />
      <ModalAsignarGuardia isOpen={!!infoHuecoModal} onClose={() => setInfoHuecoModal(null)} onSave={handleRellenarGuardia} usuariosEnrolados={usuariosEnrolados} infoHueco={infoHuecoModal} />
      <ModalAsignacionRapida isOpen={!!infoAsignacionRapida} onClose={() => setInfoAsignacionRapida(null)} onSave={handleGuardarAsignacionRapida} turnos={turnos} usuariosEnrolados={usuariosEnrolados} infoHueco={infoAsignacionRapida} />
    </div>
  );
}