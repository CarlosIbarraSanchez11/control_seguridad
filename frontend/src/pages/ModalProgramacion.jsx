import React, { useState } from 'react';

export default function ModalProgramacion({ isOpen, onClose, onSave, semanaProgramada, catalogoSedes = [], turnos = [] }) {
  const [formData, setFormData] = useState({
    unidad: '', 
    emplazamiento: '', 
    turno: 'DÍA', // Se guardará internamente, ya no se muestra en un select
    plantilla: '',
    horaInicio: '07:00',
    horaFin: '19:00'
  });

  const perfilesHorario = {
    P1: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi'], desc: 'Lunes a Viernes' },
    P2: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi','sa'], desc: 'Lunes a Sábado' },
    P3: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi','ju','vi','sa','do'], desc: 'Lunes a Domingo' },
    P4: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi'], desc: 'Lunes a Viernes' },
    P5: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi','sa'], desc: 'Lunes a Sábado' },
    P6: { turno: 'NOCHE', inicio: '19:00', fin: '07:00', dias: ['lu','ma','mi','ju','vi','sa','do'], desc: 'Lunes a Domingo' },
    P8: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['lu','ma','mi'], desc: 'Lunes a Miércoles' },
    P9: { turno: 'DÍA', inicio: '07:00', fin: '19:00', dias: ['ju','vi','sa'], desc: 'Jueves a Sábado' },
  };

  if (!isOpen) return null;

  const diasSemana = [
    { id: 'lu', label: 'L', nombre: 'Lunes' }, { id: 'ma', label: 'M', nombre: 'Martes' }, { id: 'mi', label: 'M', nombre: 'Miércoles' },
    { id: 'ju', label: 'J', nombre: 'Jueves' }, { id: 'vi', label: 'V', nombre: 'Viernes' }, { id: 'sa', label: 'S', nombre: 'Sábado' }, { id: 'do', label: 'D', nombre: 'Domingo' }
  ];

  const sedeSeleccionada = catalogoSedes.find(s => s.nombre === formData.unidad);
  const ambientesDisponibles = sedeSeleccionada ? sedeSeleccionada.ambientes : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'unidad') {
      setFormData({ ...formData, unidad: value, emplazamiento: '' });
      return;
    }

    if (name === 'plantilla') {
      const d = perfilesHorario[value];
      setFormData({ 
        ...formData, 
        plantilla: value, 
        horaInicio: d ? d.inicio : '07:00', 
        horaFin: d ? d.fin : '19:00',
        turno: d ? d.turno : 'DÍA' // ✨ El turno se asigna automáticamente aquí
      });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let diasProgramados = { lu: '-', ma: '-', mi: '-', ju: '-', vi: '-', sa: '-', do: '-' };
    let diasTotales = 0;
    const p = perfilesHorario[formData.plantilla];
    
    diasSemana.forEach(dia => {
      if (p.dias.includes(dia.id)) {
        diasProgramados[dia.id] = 'SIN_ASIGNAR';
        diasTotales++;
      } else {
        diasProgramados[dia.id] = 'CERRADO';
      }
    });

    onSave({ 
      ...formData, 
      perfilRequerido: formData.plantilla, 
      ...diasProgramados, 
      prog: diasTotales, 
      guardia: null, 
      perfilGuardia: null 
    });
    
    setFormData({ unidad: '', emplazamiento: '', turno: 'DÍA', plantilla: '', horaInicio: '07:00', horaFin: '19:00' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="text-indigo-600">🏗️</span> Configurar Ambiente
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
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Sede Principal</label>
              <select required name="unidad" value={formData.unidad} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all uppercase cursor-pointer">
                <option value="">-- SEDE --</option>
                {catalogoSedes.map((sede, idx) => (
                  <option key={idx} value={sede.nombre}>{sede.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ambiente / Puesto</label>
              <select required name="emplazamiento" value={formData.emplazamiento} onChange={handleChange} disabled={!formData.unidad} className={`w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all uppercase ${!formData.unidad ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer'}`}>
                <option value="">-- AMBIENTE --</option>
                {ambientesDisponibles.map((ambiente, idx) => (
                  <option key={idx} value={ambiente}>{ambiente}</option>
                ))}
              </select>
            </div>

            {/* ✨ PASO 1: PERFIL SOLICITADO AHORA OCUPA LAS 2 COLUMNAS Y MUESTRA EL TURNO */}
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Perfil Operativo</label>
              <select required name="plantilla" value={formData.plantilla} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white text-gray-900 cursor-pointer">
                <option value="">-- SELECCIONE EL PERFIL --</option>
                {Object.entries(perfilesHorario).map(([clave, datos]) => (
                  <option key={clave} value={clave}>
                    {clave} - {datos.desc} | {datos.turno} ({datos.inicio} a {datos.fin})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-2">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <span>🗓️</span> Vista Previa de Cobertura
                </label>
                {formData.plantilla && (
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    {formData.plantilla}: {perfilesHorario[formData.plantilla].desc}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const diasTrabajo = formData.plantilla ? perfilesHorario[formData.plantilla].dias : [];
                  const esDiaDeTrabajo = diasTrabajo.includes(dia.id);

                  const estaOcupadoEnAmbiente = formData.emplazamiento 
                    ? turnos.some(t => t.unidad === formData.unidad && t.emplazamiento === formData.emplazamiento && t.turno === formData.turno && (t[dia.id] === 'OK' || t[dia.id] === 'SIN_ASIGNAR' || t[dia.id] === 'FALTA'))
                    : false;

                  return (
                    <div key={dia.id} className="flex flex-col items-center gap-1">
                      <span className={`text-[8px] font-black uppercase tracking-tight h-3 transition-opacity ${estaOcupadoEnAmbiente ? 'text-amber-600 opacity-100' : 'opacity-0'}`}>
                        Lleno
                      </span>

                      <div className={`w-full py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center transition-all relative overflow-hidden ${
                          estaOcupadoEnAmbiente && esDiaDeTrabajo
                            ? 'bg-amber-50 text-amber-700 border-2 border-amber-200 line-through' 
                            : !esDiaDeTrabajo 
                              ? 'bg-gray-100 text-gray-300 border border-gray-200' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' 
                        }`}
                        title={estaOcupadoEnAmbiente ? "Ya existe un requerimiento creado para este día" : ""}
                      >
                        {dia.label}
                        
                        {estaOcupadoEnAmbiente && esDiaDeTrabajo && (
                          <div className="absolute inset-0 border-t border-rose-400/60 transform rotate-12 pointer-events-none top-1/2"></div>
                        )}
                      </div>
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
            <button type="submit" disabled={!formData.emplazamiento || !formData.plantilla} className="flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-xl shadow-gray-900/20 active:scale-95">
              Guardar Requerimiento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}