// Arreglo para almacenar las citas en memoria
let citas = [];

// Referencias a los elementos del DOM
const formulario = document.getElementById('formulario-cita');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const btnExportar = document.getElementById('btn-exportar');

// Evento para guardar una nueva cita
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault(); // Evita que la página se recargue

    // Obtener los valores de los inputs
    const mascota = document.getElementById('mascota').value;
    const dueno = document.getElementById('dueno').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const motivo = document.getElementById('motivo').value;
    const esTelemedicina = document.getElementById('telemedicina').checked;

    // Crear objeto de la cita
    const nuevaCita = {
        Mascota: mascota,
        Dueño: dueno,
        Fecha: fecha,
        Hora: hora,
        Motivo: motivo,
        Modalidad: esTelemedicina ? 'Telemedicina' : 'Presencial'
    };

    // Agregar al arreglo principal
    citas.push(nuevaCita);

    // Actualizar la interfaz
    renderizarTabla();
    
    // Limpiar el formulario
    formulario.reset();
});

// Función para mostrar las citas en la tabla HTML
function renderizarTabla() {
    cuerpoTabla.innerHTML = ''; // Limpiar contenido previo

    citas.forEach(cita => {
        const fila = document.createElement('tr');

        // Formatear la etiqueta visual según la modalidad
        const claseEtiqueta = cita.Modalidad === 'Telemedicina' ? 'etiqueta-telemedicina' : 'etiqueta-presencial';

        fila.innerHTML = `
            <td>${cita.Mascota}</td>
            <td>${cita.Dueño}</td>
            <td>${cita.Fecha}</td>
            <td>${cita.Hora}</td>
            <td>${cita.Motivo}</td>
            <td><span class="${claseEtiqueta}">${cita.Modalidad}</span></td>
        `;

        cuerpoTabla.appendChild(fila);
    });
}

// Función para exportar los datos a Excel usando SheetJS
btnExportar.addEventListener('click', function() {
    if (citas.length === 0) {
        alert("No hay citas registradas para exportar.");
        return;
    }

    // 1. Convertir el arreglo de objetos (JSON) a una hoja de trabajo de Excel
    const hojaDeTrabajo = XLSX.utils.json_to_sheet(citas);

    // 2. Ajustar el ancho de las columnas para que sea "cómodo y entendible"
    const anchoColumnas = [
        { wch: 15 }, // Mascota
        { wch: 20 }, // Dueño
        { wch: 12 }, // Fecha
        { wch: 10 }, // Hora
        { wch: 30 }, // Motivo
        { wch: 15 }  // Modalidad
    ];
    hojaDeTrabajo['!cols'] = anchoColumnas;

    // 3. Crear un nuevo libro de trabajo y añadir la hoja
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Citas Veterinarias");

    // 4. Escribir y descargar el archivo Excel
    XLSX.writeFile(libroDeTrabajo, "Citas_Veterinaria_Telemedicina.xlsx");
});