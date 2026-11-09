let citas = [];

// Elementos principales
const formulario = document.getElementById('formulario-cita');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const btnExportar = document.getElementById('btn-exportar');

// ---- FUNCIONES AUXILIARES DE FORMATEO ----

// Auto-formato de fecha DD/MM/AAAA
function formatearFecha(e) {
    let valor = e.target.value.replace(/\D/g, ''); // Quita no-números
    if (valor.length > 8) valor = valor.substring(0, 8);
    
    if (valor.length >= 5) {
        e.target.value = `${valor.substring(0,2)}/${valor.substring(2,4)}/${valor.substring(4,8)}`;
    } else if (valor.length >= 3) {
        e.target.value = `${valor.substring(0,2)}/${valor.substring(2)}`;
    } else {
        e.target.value = valor;
    }
}
document.getElementById('fecha').addEventListener('input', formatearFecha);
document.getElementById('edit-fecha').addEventListener('input', formatearFecha);

// Lógica de conversión de hora (24h a 12h y autoselección AM/PM)
function formatearHora(e, selectId) {
    let val = e.target.value;
    let match = val.match(/^(\d{1,2})[:]?(\d{2})?$/);
    
    if(match) {
        let h = parseInt(match[1]);
        let m = match[2] || '00';
        let ampmSelect = document.getElementById(selectId);
        
        if(h >= 12) {
            ampmSelect.value = 'PM';
            if(h > 12) h -= 12;
        } else {
            ampmSelect.value = 'AM';
            if(h === 0) h = 12;
        }
        e.target.value = `${h.toString().padStart(2, '0')}:${m}`;
    }
}
document.getElementById('hora').addEventListener('blur', (e) => formatearHora(e, 'ampm'));
document.getElementById('edit-hora').addEventListener('blur', (e) => formatearHora(e, 'edit-ampm'));

// Convierte fecha y hora en objeto Date de JS para poder ordenarlos
function convertirADate(fechaStr, horaStr, ampm) {
    const partesFecha = fechaStr.split('/');
    if(partesFecha.length !== 3) return new Date(9999, 11, 31); // Al final si hay error
    
    const dia = parseInt(partesFecha[0]);
    const mes = parseInt(partesFecha[1]) - 1;
    const ano = parseInt(partesFecha[2]);
    
    let partesHora = horaStr.split(':');
    let h = parseInt(partesHora[0]) || 0;
    let m = parseInt(partesHora[1]) || 0;
    
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    return new Date(ano, mes, dia, h, m);
}


// ---- LÓGICA PRINCIPAL (GUARDAR Y DIBUJAR) ----

formulario.addEventListener('submit', function(e) {
    e.preventDefault();

    const nuevaCita = {
        id: Date.now().toString(), // ID único
        Mascota: document.getElementById('mascota').value,
        Dueño: document.getElementById('dueno').value,
        Teléfono: document.getElementById('telefono').value,
        Fecha: document.getElementById('fecha').value,
        Hora: document.getElementById('hora').value,
        AMPM: document.getElementById('ampm').value,
        Motivo: document.getElementById('motivo').value,
        Modalidad: document.getElementById('telemedicina').checked ? 'Telemedicina' : 'Presencial'
    };

    citas.push(nuevaCita);
    renderizarTabla();
    formulario.reset();
});

function renderizarTabla() {
    cuerpoTabla.innerHTML = '';

    // 1. Ordenar arreglo de menor fecha/hora a mayor
    citas.sort((a, b) => {
        let dateA = convertirADate(a.Fecha, a.Hora, a.AMPM);
        let dateB = convertirADate(b.Fecha, b.Hora, b.AMPM);
        return dateA - dateB; 
    });

    // 2. Dibujar filas
    citas.forEach(cita => {
        const fila = document.createElement('tr');
        const claseEtiqueta = cita.Modalidad === 'Telemedicina' ? 'etiqueta-telemedicina' : 'etiqueta-presencial';

        fila.innerHTML = `
            <td>${cita.Mascota}</td>
            <td>${cita.Dueño} <br><small>${cita.Teléfono}</small></td>
            <td>${cita.Fecha}</td>
            <td>${cita.Hora} ${cita.AMPM}</td>
            <td>${cita.Motivo}</td>
            <td><span class="${claseEtiqueta}">${cita.Modalidad}</span></td>
            <td class="btn-acciones">
                <button class="btn-editar" onclick="abrirEditar('${cita.id}')">Editar</button>
                <button class="btn-borrar" onclick="abrirBorrar('${cita.id}')">Borrar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}


// ---- LÓGICA DE MODALES (EDITAR Y BORRAR) ----

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

// EDITAR
function abrirEditar(id) {
    const cita = citas.find(c => c.id === id);
    if(cita) {
        document.getElementById('edit-id').value = cita.id;
        document.getElementById('edit-mascota').value = cita.Mascota;
        document.getElementById('edit-dueno').value = cita.Dueño;
        document.getElementById('edit-telefono').value = cita.Teléfono;
        document.getElementById('edit-fecha').value = cita.Fecha;
        document.getElementById('edit-hora').value = cita.Hora;
        document.getElementById('edit-ampm').value = cita.AMPM;
        document.getElementById('edit-motivo').value = cita.Motivo;
        document.getElementById('edit-telemedicina').checked = (cita.Modalidad === 'Telemedicina');
        
        document.getElementById('modal-editar').style.display = 'flex';
    }
}

document.getElementById('formulario-editar').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const index = citas.findIndex(c => c.id === id);
    
    if(index !== -1) {
        citas[index] = {
            id: id,
            Mascota: document.getElementById('edit-mascota').value,
            Dueño: document.getElementById('edit-dueno').value,
            Teléfono: document.getElementById('edit-telefono').value,
            Fecha: document.getElementById('edit-fecha').value,
            Hora: document.getElementById('edit-hora').value,
            AMPM: document.getElementById('edit-ampm').value,
            Motivo: document.getElementById('edit-motivo').value,
            Modalidad: document.getElementById('edit-telemedicina').checked ? 'Telemedicina' : 'Presencial'
        };
        renderizarTabla();
        cerrarModal('modal-editar');
    }
});

// BORRAR
function abrirBorrar(id) {
    document.getElementById('delete-id').value = id;
    document.getElementById('modal-borrar').style.display = 'flex';
}

document.getElementById('btn-confirmar-borrar').addEventListener('click', function() {
    const id = document.getElementById('delete-id').value;
    citas = citas.filter(c => c.id !== id);
    renderizarTabla();
    cerrarModal('modal-borrar');
});


// ---- EXPORTAR EXCEL ----
btnExportar.addEventListener('click', function() {
    if (citas.length === 0) return alert("No hay citas registradas para exportar.");

    // Formatear la data antes de exportar para que sea legible en Excel
    const datosExportar = citas.map(c => ({
        Mascota: c.Mascota,
        Dueño: c.Dueño,
        Teléfono: c.Teléfono,
        Fecha: c.Fecha,
        Hora: `${c.Hora} ${c.AMPM}`,
        Motivo: c.Motivo,
        Modalidad: c.Modalidad
    }));

    const hojaDeTrabajo = XLSX.utils.json_to_sheet(datosExportar);
    const anchoColumnas = [
        { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 15 }
    ];
    hojaDeTrabajo['!cols'] = anchoColumnas;

    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Citas Veterinarias");
    XLSX.writeFile(libroDeTrabajo, "Citas_Veterinaria_Telemedicina.xlsx");
});