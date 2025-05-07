const daysContainer = document.getElementById("days");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Añadir funcionalidad para expandir/colapsar categorías
  document.getElementById('therapist-filter').addEventListener('change', function() {
    if (this.value === 'View All') {
      // Mostrar todas las categorías expandidas
      document.querySelectorAll('.category').forEach(cat => {
        cat.classList.add('expanded');
      });

      document.querySelectorAll('.subcategory').forEach(subcat => {
        subcat.classList.add('visible');
      });
    }
    // Aquí se pueden añadir más condiciones si se añaden más opciones al select
  });

  // Funcionalidad para seleccionar pacientes
  document.querySelectorAll('.patient-item').forEach(patient => {
    patient.addEventListener('click', function() {
      document.querySelectorAll('.patient-item').forEach(p => {
        p.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });

  // Implementar la búsqueda de terapeutas
  document.querySelector('input[placeholder="Search Doctors..."]').addEventListener('input', function() {
    let searchTerm = this.value.toLowerCase();
    document.querySelectorAll('.subcategory div').forEach(therapist => {
      let name = therapist.textContent.toLowerCase();
      if (name.includes(searchTerm)) {
        therapist.style.display = 'block';
        // Asegurarse de que la categoría padre esté expandida
        let category = therapist.parentElement.previousElementSibling;
        category.classList.add('expanded');
        therapist.parentElement.classList.add('visible');
      } else {
        therapist.style.display = 'none';
      }
    });
  });

  // Implementar la búsqueda de pacientes
  document.querySelector('input[placeholder="Search Patients..."]').addEventListener('input', function() {
    let searchTerm = this.value.toLowerCase();
    document.querySelectorAll('.patient-item').forEach(patient => {
      let name = patient.textContent.toLowerCase();
      if (name.includes(searchTerm)) {
        patient.style.display = 'block';
      } else {
        patient.style.display = 'none';
      }
    });
  });

  // Funcionalidad para el botón "View All"
  document.querySelector('.view-all').addEventListener('click', function() {
    // Mostrar todas las categorías expandidas
    document.querySelectorAll('.category').forEach(cat => {
      cat.classList.add('expanded');
    });

    document.querySelectorAll('.subcategory').forEach(subcat => {
      subcat.classList.add('visible');
    });
  });
});
// Llenar selectores de mes y año
function fillSelectors() {
  monthNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name;
    monthSelect.appendChild(option);
  });

  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  // Establecer mes y año actuales como seleccionados
  monthSelect.value = new Date().getMonth();
  yearSelect.value = new Date().getFullYear();
}

function generateDays(month, year) {
  daysContainer.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay(); // 0 = domingo

  // Ajustar si quieres que la semana inicie en lunes

  // Celdas vacías antes del día 1
  for (let i = 0; i < startDay; i++) {
    const div = document.createElement("div");
    div.classList.add("empty");
    daysContainer.appendChild(div);
  }

  // Días del mes
  for (let day = 1; day <= lastDay; day++) {
    const div = document.createElement("div");
    div.textContent = day

    daysContainer.appendChild(div);
  }
}

// Event listeners
monthSelect.addEventListener("change", updateCalendar);
yearSelect.addEventListener("change", updateCalendar);

function updateCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  generateDays(month, year);
}

function abrirmodal(){
  document.getElementById('modaloverlay').style.display = 'flex';
}
function cerrarmodal(){
  document.getElementById('modaloverlay').style.display = 'none';
}

// Estructura para almacenar citas
let appointments = [];

// Referencia al modal y elementos relacionados
const appointmentModal = document.getElementById('appointmentModal');
const appointmentForm = document.getElementById('appointmentForm');
const addEventButton = document.querySelector('.AddEvent');
const closeModalButton = document.querySelector('.close-modal');
const cancelButton = document.querySelector('.cancel-btn');

// Eventos para abrir y cerrar el modal
addEventButton.addEventListener('click', openAppointmentModal);
closeModalButton.addEventListener('click', closeAppointmentModal);
cancelButton.addEventListener('click', closeAppointmentModal);

// Función para abrir el modal
function openAppointmentModal() {
    // Establecer la fecha por defecto como la fecha actual
    const today = new Date();
    const formattedDate = formatDateForInput(today);
    document.getElementById('appointmentDate').value = formattedDate;
    
    // Llenar los select de doctores y pacientes
    fillDoctorsSelect();
    fillPatientsSelect();
    
    appointmentModal.style.display = 'flex';
}

// Función para cerrar el modal
function closeAppointmentModal() {
    appointmentModal.style.display = 'none';
    appointmentForm.reset();
}

// Función para llenar el select de doctores
function fillDoctorsSelect() {
    const doctorSelect = document.getElementById('appointmentDoctor');
    doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>';
    
    // Obtener todos los doctores de la sidebar
    const doctors = [];
    document.querySelectorAll('.subcategory div').forEach(doctorElement => {
        if (doctorElement.style.display !== 'none') {
            doctors.push({
                name: doctorElement.textContent,
                category: doctorElement.classList[0] || 'General'
            });
        }
    });
    
    // Añadir doctores al select
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.name;
        option.textContent = `${doctor.name} (${doctor.category})`;
        doctorSelect.appendChild(option);
    });
}

// Función para llenar el select de pacientes
function fillPatientsSelect() {
    const patientSelect = document.getElementById('appointmentPatient');
    patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
    
    // Obtener todos los pacientes de la sidebar
    const patients = [];
    document.querySelectorAll('.patient-item').forEach(patientElement => {
        if (patientElement.style.display !== 'none') {
            patients.push(patientElement.textContent);
        }
    });
    
    // Añadir pacientes al select
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient;
        option.textContent = patient;
        patientSelect.appendChild(option);
    });
}

// Evento para guardar la cita
appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recoger datos del formulario
    const appointmentDate = document.getElementById('appointmentDate').value;
    const startTime = document.getElementById('appointmentStartTime').value;
    const endTime = document.getElementById('appointmentEndTime').value;
    const doctor = document.getElementById('appointmentDoctor').value;
    const patient = document.getElementById('appointmentPatient').value;
    const notes = document.getElementById('appointmentNotes').value;
    
    // Validar que los campos obligatorios estén completos
    if (!appointmentDate || !startTime || !endTime || !doctor || !patient) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    // Crear objeto de cita
    const newAppointment = {
        id: Date.now(), // ID único basado en timestamp
        date: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        doctor: doctor,
        patient: patient,
        notes: notes
    };
    
    // Añadir a la lista de citas
    appointments.push(newAppointment);
    
    // Guardar en localStorage (opcional)
    saveAppointments();
    
    // Actualizar calendario
    updateCalendar();
    
    // Cerrar modal
    closeAppointmentModal();
});

// Función para guardar citas en localStorage
function saveAppointments() {
    localStorage.setItem('calendarAppointments', JSON.stringify(appointments));
}

// Función para cargar citas desde localStorage
function loadAppointments() {
    const savedAppointments = localStorage.getItem('calendarAppointments');
    if (savedAppointments) {
        appointments = JSON.parse(savedAppointments);
    }
}

// Función para actualizar el calendario existente
function updateCalendar() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Regenerar los días del calendario
    generateDays(month, year);
    
    // Añadir las citas a los días correspondientes
    addAppointmentsToDays(month, year);
}

// Función modificada para generar días
function generateDays(month, year) {
    daysContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    let startDay = firstDay.getDay(); // 0 = domingo

    // Celdas vacías antes del día 1
    for (let i = 0; i < startDay; i++) {
        const div = document.createElement("div");
        div.classList.add("empty");
        daysContainer.appendChild(div);
    }

    // Obtén la fecha actual para resaltar el día de hoy
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDate = today.getDate();

    // Días del mes
    for (let day = 1; day <= lastDay; day++) {
        const div = document.createElement("div");
        
        // Añadir número del día con un span para mejor posicionamiento
        const dayNumber = document.createElement("span");
        dayNumber.textContent = day;
        dayNumber.classList.add("day-number");
        div.appendChild(dayNumber);
        
        // Marcar el día de hoy
        if (isCurrentMonth && day === currentDate) {
            div.classList.add("today");
        }
        
        // Añadir atributo de data-date para facilitar la búsqueda de citas
        const dateStr = formatDate(year, month, day);
        div.setAttribute("data-date", dateStr);
        
        daysContainer.appendChild(div);
    }
}

// Función para añadir citas a los días
function addAppointmentsToDays(month, year) {
    // Agrupar citas por fecha
    const appointmentsByDate = {};
    
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        const appointmentMonth = appointmentDate.getMonth();
        const appointmentYear = appointmentDate.getFullYear();
        
        // Solo procesar citas del mes y año actual del calendario
        if (appointmentMonth === month && appointmentYear === year) {
            const dateStr = formatDate(appointmentYear, appointmentMonth, appointmentDate.getDate());
            
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = [];
            }
            
            appointmentsByDate[dateStr].push(appointment);
        }
    });
    
    // Añadir citas a los días correspondientes
    Object.keys(appointmentsByDate).forEach(dateStr => {
        const dayElement = document.querySelector(`.days div[data-date="${dateStr}"]`);
        
        if (dayElement) {
            dayElement.classList.add('has-appointments');
            
            // Añadir cada cita al día
            appointmentsByDate[dateStr].forEach(appointment => {
                const appointmentElement = createAppointmentElement(appointment);
                dayElement.appendChild(appointmentElement);
            });
        }
    });
}

// Función para crear elemento HTML de una cita
function createAppointmentElement(appointment) {
    const appointmentDiv = document.createElement('div');
    appointmentDiv.classList.add('appointment');
    appointmentDiv.setAttribute('data-id', appointment.id);
    
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('appointment-time');
    timeDiv.textContent = `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`;
    
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('appointment-info');
    infoDiv.textContent = `${appointment.patient} con ${appointment.doctor}`;
    
    appointmentDiv.appendChild(timeDiv);
    appointmentDiv.appendChild(infoDiv);
    
    // Evento para mostrar detalles de la cita (opcional)
    appointmentDiv.addEventListener('click', () => {
        showAppointmentDetails(appointment);
    });
    
    return appointmentDiv;
}

// Función para mostrar detalles de la cita (opcional)
function showAppointmentDetails(appointment) {
    alert(`
        Cita: ${appointment.patient} con ${appointment.doctor}
        Fecha: ${formatDisplayDate(appointment.date)}
        Horario: ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}
        Notas: ${appointment.notes || 'Sin notas'}
    `);
    
    // Aquí se podría implementar un modal más elegante para ver/editar/eliminar la cita
}

// Funciones auxiliares para formateo de fechas y horas
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(year, month, day) {
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${day} de ${monthNames[month]} de ${year}`;
}

function formatTime(timeStr) {
    return timeStr.substring(0, 5); // Formato 24h: "14:30"
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar citas guardadas
    loadAppointments();
    
    // Sobrescribir la función updateCalendar original
    const originalUpdateCalendar = window.updateCalendar;
    window.updateCalendar = function() {
        originalUpdateCalendar();
        addAppointmentsToDays(parseInt(monthSelect.value), parseInt(yearSelect.value));
    };
    
    // Actualizar el calendario inicial
    updateCalendar();
});

// Inicializar
fillSelectors();
updateCalendar();