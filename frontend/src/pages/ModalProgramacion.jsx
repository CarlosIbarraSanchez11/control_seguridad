import React, { useState } from 'react';

export default function ModalProgramacion({ isOpen, onClose, onSave, turnos = [], usuariosEnrolados = [], semanaProgramada }) {
  const [formData, setFormData] = useState({
    emplazamiento: '',
    turno: 'DÍA',
    guardia: '',
    horaInicio: '07:00',
    horaFin: '19:00'
  });

  const [diaDescanso, setDiaDescanso] = useState('');
  const [plantillaGuardia, setPlantillaGuardia] = useState('');

  // 🧠 DICCIONARIO DE PLANTILLAS
  const perfilesHorario = {
    P1: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi'], reqDescanso: false, desc: 'Lunes a Viernes' },
    P2: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi','sa'], reqDescanso: true, desc: 'Lunes a Sábado' },
    P3: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi','sa','do'], reqDescanso: true, desc: 'Lunes a Domingo' },
    P4: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi'], reqDescanso: false, desc: 'Lunes a Viernes' },
    P5: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi','sa'], reqDescanso: true, desc: 'Lunes a Sábado' },
    P6: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi','sa','do'], reqDescanso: true, desc: 'Lunes a Domingo' },
    P8: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi'], reqDescanso: false, desc: 'Lunes a Miércoles' },
    P9: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['ju','vi','sa'], reqDescanso: false, desc: 'Jueves a Sábado' },
  };

  const sedesDisponibles = [...new Set(usuariosEnrolados.filter(u => u.perfil === 'FIJO' && u.sede).map(u => u.sede))];

  const guardiasDisponibles = usuariosEnrolados.filter(u => {
    if (u.perfil !== 'FIJO' || !formData.emplazamiento || u.sede !== formData.emplazamiento) return false;
    const datosPlantilla = perfilesHorario[u.plantilla];
    if (!datosPlantilla || datosPlantilla.turno !== formData.turno) return false;
    if (turnos.some(t => t.guardia === u.nombre && t.emplazamiento === formData.emplazamiento)) return false;
    return true; 
  });

  if (!isOpen) return null;

  const diasSemana = [
    { id: 'lu', label: 'L', nombre: 'Lunes' }, { id: 'ma', label: 'M', nombre: 'Martes' }, { id: 'mi', label: 'M', nombre: 'Miércoles' },
    { id: 'ju', label: 'J', nombre: 'Jueves' }, { id: 'vi', label: 'V', nombre: 'Viernes' }, { id: 'sa', label: 'S', nombre: 'Sábado' }, { id: 'do', label: 'D', nombre: 'Domingo' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'emplazamiento' || name === 'turno') {
      setFormData({ ...formData, [name]: value, guardia: '', horaInicio: value === 'DÍA' ? '07:00' : '19:00', horaFin: value === 'DÍA' ? '19:00' : '07:00' });
      setPlantillaGuardia(''); setDiaDescanso(''); return;
    }

    if (name === 'guardia') {
      const g = usuariosEnrolados.find(u => u.nombre === value);
      if (g) {
        const p = g.plantilla;
        const d = perfilesHorario[p];
        setPlantillaGuardia(p);
        setFormData({ ...formData, guardia: value, horaInicio: d ? d.inicio : '07:00', horaFin: d ? d.fin : '19:00' });
        setDiaDescanso('');
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let diasProgramados = { lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-' };
    let diasTotales = 0;
    const p = perfilesHorario[plantillaGuardia];
    
    diasSemana.forEach(dia => {
      if (p.dias.includes(dia.id) && dia.id !== diaDescanso) {
        diasProgramados[dia.id] = 'OK';
        diasTotales++;
      } else {
        diasProgramados[dia.id] = 'DESC';
      }
    });

    onSave({ ...formData, perfil: 'FIJO', ...diasProgramados, prog: diasTotales });
    setFormData({ emplazamiento: '', turno: 'DÍA', guardia: '', horaInicio: '07:00', horaFin: '19:00' });
    setPlantillaGuardia(''); setDiaDescanso(''); onClose();
  };

  const reqDesc = plantillaGuardia ? perfilesHorario[plantillaGuardia].reqDescanso : false;

  // Lógica de títulos dinámicos
  let tituloDescanso = 'Régimen de Cobertura Semanal';
  if (plantillaGuardia) {
    const req = perfilesHorario[plantillaGuardia].tipoDescanso;
    if (req === 'ELEGIR_LS') tituloDescanso = 'Seleccione 1 Día de Descanso (Lun - Sáb)';
    if (req === 'ELEGIR_LD') tituloDescanso = 'Seleccione 1 Día de Descanso (Lun - Dom)';
  }

  const tipoD = plantillaGuardia ? perfilesHorario[plantillaGuardia].tipoDescanso : null;
  const disableSubmit = (tipoD === 'ELEGIR_LS' || tipoD === 'ELEGIR_LD') && !diaDescanso;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-indigo-600">➕</span> Asignar Guardia Fijo
            </h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 bg-indigo-50 inline-block px-2 py-0.5 rounded">
              Para la {semanaProgramada}
            </p>
          </div>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-rose-500 bg-white hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors border border-gray-200 shadow-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ambiente / Puesto</label>
              <select required name="emplazamiento" value={formData.emplazamiento} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all uppercase cursor-pointer">
                <option value="">-- SELECCIONE UN AMBIENTE --</option>
                {sedesDisponibles.map((sede, idx) => (
                  <option key={idx} value={sede}>{sede}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Turno</label>
              <select name="turno" value={formData.turno} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer">
                <option value="DÍA">DÍA (07:00 - 19:00)</option>
                <option value="NOCHE">NOCHE (19:00 - 07:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre del Guardia (Fijos)</label>
              <select required name="guardia" value={formData.guardia} onChange={handleChange} disabled={!formData.emplazamiento} className={`w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all ${!formData.emplazamiento ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer'}`}>
                <option value="">-- SELECCIONE GUARDIA --</option>
                {guardiasDisponibles.map(u => (
                  <option key={u.id} value={u.nombre}>{u.nombre}</option>
                ))}
              </select>
              {formData.emplazamiento && guardiasDisponibles.length === 0 && (
                <p className="text-[9px] text-rose-500 mt-1 uppercase font-bold">No hay fijos disponibles en este turno.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Perfil Operativo</label>
              <div className={`w-full px-4 py-2 border rounded-xl font-black text-sm flex flex-col justify-center shadow-inner min-h-[50px] transition-colors ${formData.guardia ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
                {formData.guardia && plantillaGuardia ? (
                  <>
                    <span className="text-indigo-800">{formData.perfil}</span>
                    <span className="text-[10px] text-indigo-500 uppercase mt-0.5 tracking-wider">
                      {plantillaGuardia} - {perfilesHorario[plantillaGuardia]?.desc}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">...</span>
                )}
              </div>
            </div>

            {/* ─── SECCIÓN DE CALENDARIO INTELIGENTE CON DETECCIÓN DE ASIGNACIÓN ─── */}
            <div className="col-span-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-2">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <span>🗓️</span> {tituloDescanso}
                </label>
                {plantillaGuardia && (
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    {plantillaGuardia}: {perfilesHorario[plantillaGuardia].desc}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const diasTrabajo = plantillaGuardia ? perfilesHorario[plantillaGuardia].dias : [];
                  const esDiaDeTrabajo = diasTrabajo.includes(dia.id);
                  const isSelectable = reqDesc && esDiaDeTrabajo; 
                  const isSelected = isSelectable ? diaDescanso === dia.id : !esDiaDeTrabajo;

                  // 🔍 INTERCEPCIÓN EN TIEMPO REAL: ¿Este día ya está ocupado en la matriz para este ambiente?
                  const estaOcupadoEnAmbiente = formData.emplazamiento 
                    ? turnos.some(t => t.emplazamiento === formData.emplazamiento && t.turno === formData.turno && t[dia.id] === 'OK')
                    : false;

                  return (
                    <div key={dia.id} className="flex flex-col items-center gap-1">
                      {/* Pequeño texto superior que avisa si el día ya está tomado en el Ambiente */}
                      <span className={`text-[8px] font-black uppercase tracking-tight h-3 transition-opacity ${estaOcupadoEnAmbiente ? 'text-amber-600 opacity-100' : 'opacity-0'}`}>
                        Lleno
                      </span>

                      <button
                        key={dia.id} 
                        type="button" 
                        onClick={() => isSelectable && setDiaDescanso(dia.id)}
                        disabled={!isSelectable}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all relative overflow-hidden ${
                          estaOcupadoEnAmbiente && esDiaDeTrabajo
                            ? 'bg-amber-50 text-amber-700 border-2 border-amber-200 line-through' // Día ocupado en el ambiente (Tachado)
                            : !esDiaDeTrabajo 
                              ? 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed' // Fuera de plantilla
                              : isSelected 
                                ? 'bg-indigo-600 text-white shadow-md scale-105' // Descanso elegido
                                : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-indigo-50 shadow-sm' // Día libre/laboral disponible
                        }`}
                        title={estaOcupadoEnAmbiente ? "Este día ya está asignado a otro guardia en este ambiente" : ""}
                      >
                        {dia.label}
                        
                        {/* Rayita roja diagonal estética si el día está ocupado en el ambiente */}
                        {estaOcupadoEnAmbiente && esDiaDeTrabajo && (
                          <div className="absolute inset-0 border-t border-rose-400/60 transform rotate-12 pointer-events-none top-1/2"></div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 col-span-2">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hora Inicio</label>
                <input type="time" name="horaInicio" value={formData.horaInicio} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 cursor-not-allowed outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hora Fin</label>
                <input type="time" name="horaFin" value={formData.horaFin} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 cursor-not-allowed outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-sm transition-all active:scale-95 border border-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={disableSubmit} className="flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-xl shadow-gray-900/20 active:scale-95">
              Guardar Asignación
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}