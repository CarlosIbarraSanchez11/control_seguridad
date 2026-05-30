import React, { useState } from 'react';

export default function ModalAsignacionRapida({ isOpen, onClose, onSave, turnos, usuariosEnrolados, infoHueco }) {
  const [guardiaSeleccionado, setGuardiaSeleccionado] = useState('');

  if (!isOpen || !infoHueco) return null;

  const { emplazamiento, diaId, diaNombre, turnoBase, horaInicio, horaFin } = infoHueco;

  const descanserosLibres = usuariosEnrolados.filter(u => {
    if (u.perfil === 'FIJO') return false; 
    const yaTrabajaEseDia = turnos.some(t => t.guardia === u.nombre && t[diaId] !== '-' && t[diaId] !== 'DESC');
    return !yaTrabajaEseDia;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guardiaSeleccionado) return;
    const usuarioData = usuariosEnrolados.find(u => u.nombre === guardiaSeleccionado);
    onSave({ emplazamiento, diaFaltante: diaId, guardia: usuarioData.nombre, perfil: usuarioData.perfil, turno: turnoBase, horaInicio, horaFin });
    setGuardiaSeleccionado(''); onClose();
  };

  // ✨ NUEVO: ACCIÓN PARA MARCAR DÍA SIN SERVICIO
  const handleCerrarDia = () => {
    onSave({
      emplazamiento, diaFaltante: diaId, guardia: 'SIN SERVICIO', perfil: 'CERRADO', turno: turnoBase, horaInicio: '--:--', horaFin: '--:--'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b bg-rose-50"><h3 className="text-lg font-black text-rose-600">⚠️ Cubrir Hueco</h3></div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50 p-4 rounded-2xl border text-xs font-bold text-gray-700 text-center">
            {emplazamiento} • {diaNombre} • {turnoBase}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Seleccionar Descansero Libre</label>
            <select required value={guardiaSeleccionado} onChange={(e) => setGuardiaSeleccionado(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-white font-bold text-sm">
              <option value="">-- ELEGIR PERSONAL --</option>
              {descanserosLibres.map(u => <option key={u.id} value={u.nombre}>{u.nombre} ({u.perfil})</option>)}
            </select>
          </div>

          <div className="flex gap-2">
             <button type="submit" disabled={!guardiaSeleccionado} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm disabled:bg-gray-300">Asignar</button>
          </div>
          
          {/* ✨ BOTÓN PARA CERRAR EL DÍA */}
          <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold">O TAMBIÉN</span><div className="flex-grow border-t border-gray-200"></div></div>
          
          <button type="button" onClick={handleCerrarDia} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md flex justify-center items-center gap-2">
            🛑 Marcar como CERRADO (Sin Servicio)
          </button>
        </form>
      </div>
    </div>
  );
}