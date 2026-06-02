import React, { useState, useEffect } from 'react';

export default function ModalAsignarGuardia({ isOpen, onClose, onSave, usuariosEnrolados = [], infoHueco }) {
  const [guardiaSeleccionado, setGuardiaSeleccionado] = useState('');
  const [diaDescanso, setDiaDescanso] = useState('');

  // Diccionario interno para saber si el perfil exige descanso
  const perfilesHorario = {
    P1: { reqDescanso: false, dias: ['lu','ma','mi','ju','vi'] },
    P2: { reqDescanso: true, dias: ['lu','ma','mi','ju','vi','sa'] },
    P3: { reqDescanso: true, dias: ['lu','ma','mi','ju','vi','sa','do'] },
    P4: { reqDescanso: false, dias: ['lu','ma','mi','ju','vi'] },
    P5: { reqDescanso: true, dias: ['lu','ma','mi','ju','vi','sa'] },
    P6: { reqDescanso: true, dias: ['lu','ma','mi','ju','vi','sa','do'] },
    P8: { reqDescanso: false, dias: ['lu','ma','mi'] },
    P9: { reqDescanso: false, dias: ['ju','vi','sa'] },
  };

  const diasSemana = [
    { id: 'lu', label: 'L' }, { id: 'ma', label: 'M' }, { id: 'mi', label: 'M' },
    { id: 'ju', label: 'J' }, { id: 'vi', label: 'V' }, { id: 'sa', label: 'S' }, { id: 'do', label: 'D' }
  ];

  useEffect(() => {
    if (isOpen) {
      setGuardiaSeleccionado('');
      setDiaDescanso('');
    }
  }, [isOpen]);

  if (!isOpen || !infoHueco) return null;

  // ✨ AHORA SOLO DEJAMOS PASAR A LOS FIJOS
  const fijosDelAmbiente = usuariosEnrolados.filter(u => u.perfil === 'FIJO' && u.sede === infoHueco.emplazamiento);
  const fijosOtros = usuariosEnrolados.filter(u => u.perfil === 'FIJO' && u.sede !== infoHueco.emplazamiento);

  const reqPerfil = perfilesHorario[infoHueco.perfilRequerido];
  const necesitaDescanso = reqPerfil ? reqPerfil.reqDescanso : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guardiaSeleccionado) return;
    
    const usuarioData = usuariosEnrolados.find(u => u.nombre === guardiaSeleccionado);
    
    // Mandamos el Fijo Y su día de descanso elegido
    onSave({ 
      idFila: infoHueco.id, 
      guardia: usuarioData.nombre, 
      perfilGuardia: usuarioData.perfil,
      diaDescanso: diaDescanso // Puede ir vacío si es P1, P8, P9
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-indigo-100 bg-indigo-50 flex justify-between items-center">
          <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <span>👤</span> Asignar Guardia Fijo
          </h3>
          <button onClick={onClose} type="button" className="text-indigo-400 hover:text-rose-500 bg-white hover:bg-rose-50 w-8 h-8 flex items-center justify-center rounded-full">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Requerimiento del Ambiente</p>
            <h4 className="text-sm font-black text-gray-900 uppercase">{infoHueco.emplazamiento}</h4>
            <div className="mt-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Perfil {infoHueco.perfilRequerido} • {infoHueco.turno}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Seleccionar Guardia Fijo
            </label>
            <select required value={guardiaSeleccionado} onChange={(e) => setGuardiaSeleccionado(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer">
              <option value="">-- ELEGIR PERSONAL --</option>
              {fijosDelAmbiente.length > 0 && (
                <optgroup label={`📋 FIJOS DE ${infoHueco.emplazamiento}`}>
                  {fijosDelAmbiente.map(u => <option key={u.id} value={u.nombre}>✓ {u.nombre}</option>)}
                </optgroup>
              )}
              {fijosOtros.length > 0 && (
                <optgroup label="🏢 FIJOS DE OTROS AMBIENTES">
                  {fijosOtros.map(u => <option key={u.id} value={u.nombre}>{u.nombre} (De: {u.sede})</option>)}
                </optgroup>
              )}
            </select>
          </div>

          {/* ✨ SELECTOR DE DESCANSO (Solo aparece si el perfil requiere descanso) */}
          {necesitaDescanso && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>🗓️</span> Día de Descanso del Fijo
              </label>
              <div className="flex gap-2">
                {diasSemana.map((dia) => {
                  const esDiaDeTrabajo = reqPerfil.dias.includes(dia.id);
                  const isSelected = diaDescanso === dia.id;

                  return (
                    <button
                      key={dia.id} type="button" 
                      onClick={() => esDiaDeTrabajo && setDiaDescanso(dia.id)}
                      disabled={!esDiaDeTrabajo}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${
                        !esDiaDeTrabajo 
                          ? 'bg-gray-100 text-gray-300 opacity-50 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-indigo-600 text-white shadow-md scale-105' 
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-indigo-50'
                      }`}
                    >
                      {dia.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
             <button type="submit" disabled={!guardiaSeleccionado || (necesitaDescanso && !diaDescanso)} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95">
               Asignar Guardia
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}