import React, { useState, Fragment } from 'react';
import ModalProgramacion from './ModalProgramacion';
import ModalAsignacionRapida from './ModalAsignacionRapida';

// ─── MOCK 1: MATRIZ CON EJEMPLOS DE PERFILES ───
const dataSimulada = [
  // Ejemplo 1: Un P1 (Lunes a Viernes). Sábado y Domingo no trabaja.
  { id: 1, unidad: 'USIL', emplazamiento: 'PUERTA PRINCIPAL', perfil: 'FIJO', guardia: 'Juan Perez', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'OK', ma: 'OK', mi: 'OK', ju: 'OK', vi: 'OK', sa: 'DESC', do: 'DESC', prog: 5, reales: 5, faltas: 0, tardanza: '0m' },
  
  // Ejemplo 2: P8 (Lun-Mié) y P9 (Jue-Sáb) compartiendo el ambiente Recepción. El domingo queda libre.
  { id: 2, unidad: 'USIL', emplazamiento: 'RECEPCIÓN', perfil: 'FIJO', guardia: 'Pedro Ruiz', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'OK', ma: 'OK', mi: 'OK', ju: 'DESC', vi: 'DESC', sa: 'DESC', do: 'DESC', prog: 3, reales: 3, faltas: 0, tardanza: '0m' },
  { id: 3, unidad: 'USIL', emplazamiento: 'RECEPCIÓN', perfil: 'FIJO', guardia: 'Maria Paz', turno: 'DÍA', horaInicio: '07:00', horaFin: '19:00', lu: 'DESC', ma: 'DESC', mi: 'DESC', ju: 'OK', vi: 'OK', sa: 'OK', do: 'DESC', prog: 3, reales: 3, faltas: 0, tardanza: '0m' },
];

// ─── MOCK 2: BASE DE DATOS DE RRHH ───
const usuariosMock = [
  // 📍 FIJOS (Ahora están asignados por AMBIENTE)
  { id: 101, nombre: 'Juan Perez', dni: '77889901', perfil: 'FIJO', sede: 'PUERTA PRINCIPAL', plantilla: 'P1' }, 
  { id: 102, nombre: 'Diana Rami', dni: '77889902', perfil: 'FIJO', sede: 'PUERTA PRINCIPAL', plantilla: 'P5' }, 
  
  { id: 108, nombre: 'Pedro Ruiz', dni: '77889908', perfil: 'FIJO', sede: 'RECEPCIÓN', plantilla: 'P8' }, 
  { id: 109, nombre: 'Maria Paz', dni: '77889909', perfil: 'FIJO', sede: 'RECEPCIÓN', plantilla: 'P9' }, 

  { id: 103, nombre: 'Jhon Vale', dni: '77889903', perfil: 'FIJO', sede: 'SÓTANO 1', plantilla: 'P3' }, 
  { id: 104, nombre: 'James Jhon', dni: '77889904', perfil: 'FIJO', sede: 'SÓTANO 1', plantilla: 'P6' }, 

  // 📍 DESCANSEROS
  { id: 105, nombre: 'Ian Vasq', dni: '77889905', perfil: 'DESCANSERO', sede: 'MÚLTIPLES SEDES (VOLANTE)', plantilla: '-' },
  { id: 106, nombre: 'Samuel Vil', dni: '77889906', perfil: 'DESCANSERO', sede: 'MÚLTIPLES SEDES (VOLANTE)', plantilla: '-' },
];

export default function AdminProgramacion() {
  const [turnos, setTurnos] = useState(dataSimulada);
  const [usuariosEnrolados] = useState(usuariosMock); 
  const [detalleModal, setDetalleModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [infoAsignacionRapida, setInfoAsignacionRapida] = useState(null);

  const [semanaActiva, setSemanaActiva] = useState('Semana 1');

  const diasSemana = [
    { id: 'lu', label: 'L', nombre: 'Lunes' }, { id: 'ma', label: 'M', nombre: 'Martes' }, { id: 'mi', label: 'M', nombre: 'Miércoles' },
    { id: 'ju', label: 'J', nombre: 'Jueves' }, { id: 'vi', label: 'V', nombre: 'Viernes' }, { id: 'sa', label: 'S', nombre: 'Sábado' }, { id: 'do', label: 'D', nombre: 'Domingo' }
  ];

  const emplazamientosUnicos = [...new Set(turnos.map((t) => t.emplazamiento))];

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'OK': return 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-200 cursor-pointer shadow-sm';
      case 'DESC': return 'bg-gray-100 text-gray-400 font-bold border border-gray-200 cursor-default';
      case 'FALTA': return 'bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer animate-pulse hover:bg-rose-200 shadow-sm';
      case 'CERRADO': return 'bg-slate-800 text-white font-bold border border-slate-900 cursor-default shadow-sm';
      case '-': return 'text-gray-300 cursor-default';
      default: return 'text-gray-600 cursor-default';
    }
  };

  const abrirDetalle = (fila, diaStr) => {
    if (fila[diaStr] === '-' || fila[diaStr] === 'DESC' || fila[diaStr] === 'CERRADO') return;
    setDetalleModal({
      guardia: fila.guardia, emplazamiento: fila.emplazamiento, dia: diaStr.toUpperCase(), estado: fila[diaStr],
      programado: `${fila.horaInicio} a ${fila.horaFin}`, ingresoReal: fila[diaStr] === 'FALTA' ? '--:--' : '07:55',
      salidaReal: fila[diaStr] === 'FALTA' ? '--:--' : '20:05', tardanzaCalculada: fila[diaStr] === 'FALTA' ? '0m' : fila.tardanza,
    });
  };

  const handleGuardarNuevoTurno = (nuevoDato) => {
    const nuevoTurno = {
      id: Date.now(), unidad: 'SISTEMA', emplazamiento: nuevoDato.emplazamiento, perfil: nuevoDato.perfil,
      guardia: nuevoDato.guardia, turno: nuevoDato.turno, horaInicio: nuevoDato.horaInicio, horaFin: nuevoDato.horaFin,
      lu: nuevoDato.lu, ma: nuevoDato.ma, mi: nuevoDato.mi, ju: nuevoDato.ju, vi: nuevoDato.vi, sa: nuevoDato.sa, do: nuevoDato.do,
      prog: nuevoDato.prog, reales: 0, faltas: 0, tardanza: '0m'
    };
    setTurnos([...turnos, nuevoTurno]);
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
      const nuevoTurno = {
        id: Date.now(), unidad: 'SISTEMA', emplazamiento: datoRapido.emplazamiento, perfil: datoRapido.perfil,
        guardia: datoRapido.guardia, turno: datoRapido.turno, horaInicio: datoRapido.horaInicio, horaFin: datoRapido.horaFin,
        lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-',
        [datoRapido.diaFaltante]: estadoAsignar, 
        prog: estadoAsignar === 'OK' ? 1 : 0, reales: 0, faltas: 0, tardanza: '0m'
      };
      setTurnos([...turnos, nuevoTurno]);
    }
  };

  // ✨ NUEVO: FUNCIÓN PARA CERRAR EL DÍA DIRECTAMENTE DESDE LA TABLA
  const handleCerrarDiaDirecto = (ambiente, diaId, turnoBase) => {
    const indexExistente = turnos.findIndex(t => t.guardia === 'SIN SERVICIO' && t.emplazamiento === ambiente);
    
    if (indexExistente >= 0) {
      const nuevosTurnos = [...turnos];
      nuevosTurnos[indexExistente][diaId] = 'CERRADO';
      setTurnos(nuevosTurnos);
    } else {
      const nuevoTurno = {
        id: Date.now(), unidad: 'SISTEMA', emplazamiento: ambiente, perfil: 'CERRADO',
        guardia: 'SIN SERVICIO', turno: turnoBase, horaInicio: '--:--', horaFin: '--:--',
        lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-',
        [diaId]: 'CERRADO', 
        prog: 0, reales: 0, faltas: 0, tardanza: '0m'
      };
      setTurnos([...turnos, nuevoTurno]);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            📊 Matriz de Control Operativo
            <select 
              value={semanaActiva} onChange={(e) => setSemanaActiva(e.target.value)}
              className="ml-2 text-sm bg-white border border-gray-200 text-indigo-700 font-black rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer shadow-sm"
            >
              <option value="Semana 1">Semana 1 (1-7 Jun)</option>
              <option value="Semana 2">Semana 2 (8-14 Jun)</option>
              <option value="Semana 3">Semana 3 (15-21 Jun)</option>
              <option value="Semana 4">Semana 4 (22-28 Jun)</option>
            </select>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-2">Programación de la <strong>{semanaActiva}</strong>. Haz clic en "CUBRIR" o "CERRAR" según corresponda.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsAddModalOpen(true)} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center gap-2">
             <span>➕</span> Asignar FIJO
          </button>
          <button className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-2">
             <span>📥</span> Descargar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="p-5 border-b border-gray-100">Datos del Servicio</th>
              <th className="p-5 border-b border-gray-100 text-center">Horario</th>
              {diasSemana.map((dia, idx) => (
                 <th key={dia.id} className={`p-5 border-b border-gray-100 text-center bg-gray-100/30 ${idx === 0 ? 'border-l' : ''} ${dia.id === 'sa' || dia.id === 'do' ? 'bg-blue-50/50 text-blue-500' : ''}`}>{dia.label}</th>
              ))}
              <th className="p-5 border-b border-gray-100 text-center bg-emerald-50/50 text-emerald-700 border-l">Prog</th>
              <th className="p-5 border-b border-gray-100 text-center bg-emerald-50/50 text-emerald-700">Real</th>
              <th className="p-5 border-b border-gray-100 text-center bg-rose-50/50 text-rose-700">Faltas</th>
              <th className="p-5 border-b border-gray-100 text-center bg-orange-50/50 text-orange-700">Tard.</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium">
            
            {emplazamientosUnicos.map((emplazamiento) => {
              const equipoPuesto = turnos.filter(t => t.emplazamiento === emplazamiento);

              return (
                <Fragment key={emplazamiento}>
                  <tr>
                    {/* ✨ VISUALMENTE AHORA DICE "AMBIENTE" */}
                    <td colSpan="13" className="bg-gray-100/50 text-[10px] font-black text-indigo-700 uppercase tracking-widest px-5 py-2 border-y border-gray-200/50">
                      📍 AMBIENTE: {emplazamiento}
                    </td>
                  </tr>

                  {equipoPuesto.map((fila) => (
                    <tr key={fila.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-gray-950 font-black text-sm tracking-tight">{fila.guardia}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{fila.perfil}</span>
                        </div>
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
                            disabled={fila[dia.id] === '-' || fila[dia.id] === 'DESC' || fila[dia.id] === 'CERRADO'}
                            className={`inline-block w-full py-1.5 px-1 rounded-lg text-[9px] uppercase tracking-tighter transition-transform active:scale-90 ${getEstadoBadge(fila[dia.id])}`}
                          >
                            {fila[dia.id]}
                          </button>
                        </td>
                      ))}

                      <td className="p-5 text-center bg-emerald-50/20 font-black text-gray-700 border-l border-emerald-100">{fila.prog}</td>
                      <td className={`p-5 text-center bg-emerald-50/20 font-black border-l border-emerald-100 ${fila.reales < fila.prog ? 'text-rose-600' : 'text-emerald-600'}`}>{fila.reales}</td>
                      <td className={`p-5 text-center bg-rose-50/20 font-black border-l border-rose-100 ${fila.faltas > 0 ? 'text-rose-600' : 'text-gray-300'}`}>{fila.faltas}</td>
                      <td className={`p-5 text-center bg-orange-50/20 font-black border-l border-orange-100 ${fila.tardanza !== '0m' ? 'text-orange-600' : 'text-gray-300'}`}>{fila.tardanza}</td>
                    </tr>
                  ))}

                  <tr className="bg-amber-50/30">
                    <td colSpan="2" className="p-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Auditoría de Cobertura ➡️
                    </td>
                    
                    {diasSemana.map((dia, index) => {
                      const turnosEnSede = [...new Set(equipoPuesto.map(g => g.turno))];
                      const cuposNecesarios = turnosEnSede.length; 
                      
                      const cuposCubiertos = equipoPuesto.filter(g => g[dia.id] === 'OK' || g[dia.id] === 'FALTA' || g[dia.id] === 'CERRADO').length;
                      const huecosFaltantes = cuposNecesarios - cuposCubiertos;
                      
                      return (
                        <td key={`auditoria-${dia.id}`} className={`p-1.5 text-center border-x border-amber-100/50 ${index === 0 ? 'border-l-amber-200' : ''}`}>
                          {huecosFaltantes <= 0 ? (
                            <span className="text-emerald-500 font-bold text-xs">✓</span>
                          ) : (
                            // ✨ AQUÍ ESTÁN LOS 2 BOTONES RÁPIDOS
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => setInfoAsignacionRapida({ 
                                  emplazamiento, diaId: dia.id, diaNombre: dia.nombre, 
                                  turnoBase: equipoPuesto[0]?.turno || 'DÍA', 
                                  horaInicio: equipoPuesto[0]?.horaInicio || '08:00', 
                                  horaFin: equipoPuesto[0]?.horaFin || '20:00' 
                                })}
                                className="bg-rose-500 text-white text-[9px] font-black uppercase py-1 px-1 rounded shadow-sm hover:bg-rose-600 transition-all w-full flex items-center justify-center gap-1"
                              >
                                ⚠️ {huecosFaltantes > 1 ? `FALTAN ${huecosFaltantes}` : 'CUBRIR'}
                              </button>
                              <button 
                                onClick={() => handleCerrarDiaDirecto(emplazamiento, dia.id, equipoPuesto[0]?.turno || 'DÍA')}
                                className="bg-gray-800 text-white text-[8px] font-black uppercase py-1 px-1 rounded shadow-sm hover:bg-black transition-all w-full flex items-center justify-center"
                              >
                                🛑 CERRAR
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td colSpan="4" className="border-l border-amber-200"></td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── MODAL DETALLE DE HORA EXACTA ─── */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">{detalleModal.guardia}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Día: {detalleModal.dia} • {detalleModal.emplazamiento}</p>
              </div>
              <button onClick={() => setDetalleModal(null)} className="text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Turno Prog.</span>
                <span className="font-black text-gray-700">{detalleModal.programado}</span>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Ingreso Real</span>
                  <span className={`text-2xl font-black ${detalleModal.tardanzaCalculada !== '0m' ? 'text-orange-600' : 'text-emerald-700'}`}>
                    {detalleModal.ingresoReal}
                  </span>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest mb-1">Salida Real</span>
                  <span className="text-2xl font-black text-blue-700">{detalleModal.salidaReal}</span>
                </div>
              </div>

              {detalleModal.estado === 'FALTA' ? (
                <div className="bg-rose-100 text-rose-700 p-3 rounded-xl text-xs font-bold text-center border border-rose-200">
                  ⚠️ Infracción: Inasistencia injustificada.
                </div>
              ) : detalleModal.tardanzaCalculada !== '0m' ? (
                <div className="bg-orange-100 text-orange-700 p-3 rounded-xl text-xs font-bold text-center border border-orange-200">
                  ⏱️ Penalidad: Tardanza de {detalleModal.tardanzaCalculada} en el ingreso.
                </div>
              ) : (
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl text-xs font-bold text-center border border-emerald-200">
                  ✅ Turno completado sin infracciones.
                </div>
              )}
            </div>

            <button onClick={() => setDetalleModal(null)} className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg">
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {/* MODAL PRINCIPAL DE ASIGNACIÓN (FIJOS) */}
      <ModalProgramacion 
        isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} 
        onSave={handleGuardarNuevoTurno} turnos={turnos} usuariosEnrolados={usuariosEnrolados} 
        semanaProgramada={semanaActiva} 
      />

      {/* MINI MODAL DE ASIGNACIÓN RÁPIDA (HUECOS / CERRADO) */}
      <ModalAsignacionRapida 
        isOpen={!!infoAsignacionRapida} onClose={() => setInfoAsignacionRapida(null)}
        onSave={handleGuardarAsignacionRapida} turnos={turnos} usuariosEnrolados={usuariosEnrolados}
        infoHueco={infoAsignacionRapida}
      />

    </div>
  );
}