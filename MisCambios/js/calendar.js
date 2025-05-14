// Estructura de datos principal
let doctors = [];
let patients = [];
let appointments = [];

// Referencias de elementos DOM
const daysContainer = document.getElementById("days");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");
const appointmentModal = document.getElementById('appointmentModal');
const appointmentForm = document.getElementById('appointmentForm');
const therapistFilter = document.getElementById('therapist-filter');

// Nombres de los meses
const monthNames = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    loadData();
    setupEventListeners();
    updateCalendar();
    
    // Comentar/descomentar la siguiente línea para agregar datos de muestra
    if (doctors.length === 0 && patients.length === 0) addSampleData();
});

// Configurar listeners de eventos
function setupEventListeners() {
    // Eventos del calendario
    monthSelect.addEventListener("change", updateCalendar);
    yearSelect.addEventListener("change", updateCalendar);
    
    // Eventos del modal de citas
    document.querySelector('.AddEvent').addEventListener('click', openAppointmentModal);
    document.querySelector('.close-modal').addEventListener('click', closeAppointmentModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeAppointmentModal);
    
    // Eventos del modal de pacientes
    document.querySelector('.opendata').addEventListener('click', function() {
        document.getElementById('modaloverlay').style.display = 'flex';
    });
    document.querySelector('.close-btn').addEventListener('click', function() {
        document.getElementById('modaloverlay').style.display = 'none';
    });
    
    // Filtro de terapistas/especialidades
    therapistFilter.addEventListener('change', function() {
        // Filtrar citas por especialidad seleccionada
        updateCalendar();
    });
    
    // Guardar cita
    appointmentForm.addEventListener('submit', saveAppointment);
}

// Inicializar el calendario
function initCalendar() {
    // Llenar selectores de mes y año
    monthNames.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = name;
        monthSelect.appendChild(option);
    });

    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 10; y++) {
        yearSelect.appendChild(createOption(y, y));
    }

    // Establecer valores iniciales
    monthSelect.value = new Date().getMonth();
    yearSelect.value = currentYear;
}

// Funciones para doctores
function addDoctor(id, name, specialty) {
    // Evitar duplicados
    if (doctors.some(doc => doc.id === id)) {
        console.warn(`Doctor con ID ${id} ya existe`);
        return false;
    }
    
    doctors.push({ id, name, specialty });
    localStorage.setItem('doctors', JSON.stringify(doctors));
    updateDoctorsList();
    return true;
}

function updateDoctorsList() {
    // Primero actualizar el selector de especialidades
    if (therapistFilter) {
        // Mantener la opción "View All"
        while (therapistFilter.options.length > 1) {
            therapistFilter.remove(1);
        }
        
        // Obtener especialidades únicas
        const specialties = [...new Set(doctors.map(doc => doc.specialty))];
        
        // Agregar especialidades al filtro
        specialties.forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty;
            option.textContent = specialty;
            option.className = 'speciality';
            therapistFilter.appendChild(option);
        });
    }
    
    // Crear contenedor de doctores en la sidebar si no existe
    let doctorContainer = document.querySelector('.doctor-container');
    if (!doctorContainer) {
        doctorContainer = document.createElement('div');
        doctorContainer.className = 'doctor-container';
        
        // Insertar después del filtro de terapeutas
        if (therapistFilter) {
            therapistFilter.parentNode.insertBefore(doctorContainer, therapistFilter.nextSibling);
        } else {
            // Fallback: insertar después del primer h2 en la sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const firstH2 = sidebar.querySelector('h2');
                if (firstH2) {
                    sidebar.insertBefore(doctorContainer, firstH2.nextSibling.nextSibling.nextSibling);
                }
            }
        }
    }
    
    // Limpiar contenedor
    doctorContainer.innerHTML = '';
    
    // Agrupar médicos por especialidad
    const doctorsBySpecialty = {};
    doctors.forEach(doctor => {
        if (!doctorsBySpecialty[doctor.specialty]) {
            doctorsBySpecialty[doctor.specialty] = [];
        }
        doctorsBySpecialty[doctor.specialty].push(doctor);
    });
    
    // Crear elementos en la interfaz
    Object.keys(doctorsBySpecialty).forEach(specialty => {
        // Crear elemento para la especialidad
        const specialtyDiv = document.createElement('div');
        specialtyDiv.className = 'category expanded';
        specialtyDiv.innerHTML = `<i></i>${specialty}`;
        doctorContainer.appendChild(specialtyDiv);
        
        // Crear subcategoría para los doctores
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'subcategory visible';
        
        // Añadir cada doctor
        doctorsBySpecialty[specialty].forEach(doctor => {
            const doctorDiv = document.createElement('div');
            doctorDiv.textContent = doctor.name;
            doctorDiv.setAttribute('data-id', doctor.id);
            subcategoryDiv.appendChild(doctorDiv);
        });
        
        doctorContainer.appendChild(subcategoryDiv);
    });
    
    // Actualizar el select de doctores en el modal
    fillDoctorsSelect();
}

// Funciones para pacientes
function addPatient(id, name, email, phone, birthDate, additionalInfo = {}) {
    // Validar datos básicos
    if (!id || !name) {
        console.error("Error: ID y nombre son campos obligatorios para agregar un paciente");
        return false;
    }
    
    // Verificar que el ID no esté duplicado
    if (patients.some(patient => patient.id === id)) {
        console.error(`Error: Ya existe un paciente con el ID ${id}`);
        return false;
    }
    
    // Formatear fecha de nacimiento si es string
    let formattedBirthDate = birthDate;
    if (typeof birthDate === 'string') {
        formattedBirthDate = new Date(birthDate);
    }
    
    // Calcular edad basada en la fecha de nacimiento
    const age = formattedBirthDate ? calculateAge(formattedBirthDate) : null;
    
    // Crear objeto paciente
    const newPatient = {
        id: id,
        name: name,
        email: email || '',
        phone: phone || '',
        birthDate: formattedBirthDate ? formattedBirthDate.toISOString().split('T')[0] : '',
        age: age,
        createdAt: new Date().toISOString(),
        ...additionalInfo // Spread para incluir información adicional
    };
    
    // Agregar al array de pacientes
    patients.push(newPatient);
    
    // Guardar en localStorage para persistencia
    savePatients();
    
    // Actualizar la interfaz si es necesario
    updatePatientsList();
    
    console.log(`Paciente ${name} (ID: ${id}) agregado correctamente`);
    return true;
}

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function updatePatientsList() {
    // Crear contenedor para pacientes en la sidebar
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Buscar el encabezado de pacientes
    const patientHeaderElements = Array.from(sidebar.querySelectorAll('h2'));
    const patientHeader = patientHeaderElements.find(el => el.textContent === 'Patients');
    
    if (!patientHeader) return;
    
    // Crear o actualizar el contenedor de pacientes
    let patientContainer = document.querySelector('.patient-container');
    
    if (!patientContainer) {
        patientContainer = document.createElement('div');
        patientContainer.className = 'patient-container';
        
        // Insertar después del botón "Open pacient details"
        const openDataBtn = sidebar.querySelector('.opendata');
        if (openDataBtn) {
            sidebar.insertBefore(patientContainer, openDataBtn.nextSibling);
        } else {
            // Fallback: insertar después del segundo input
            const inputs = sidebar.querySelectorAll('input');
            if (inputs.length >= 2) {
                sidebar.insertBefore(patientContainer, inputs[1].nextSibling.nextSibling);
            }
        }
    }
    
    // Limpiar contenido existente
    patientContainer.innerHTML = '';
    
    // Agregar cada paciente a la lista
    patients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'patient-item';
        patientDiv.setAttribute('data-id', patient.id);
        patientDiv.textContent = patient.name;
        
        // Opcional: Agregar evento click para seleccionar paciente
        patientDiv.addEventListener('click', function() {
            document.querySelectorAll('.patient-item').forEach(p => {
                p.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Mostrar ID del paciente en el input de búsqueda
            const searchBox = sidebar.querySelectorAll('.search-box')[1];
            if (searchBox) {
                searchBox.value = patient.id;
            }
        });
        
        patientContainer.appendChild(patientDiv);
    });
    
    // Actualizar también el select de pacientes en el modal de citas
    fillPatientsSelect();
}

function getPatientById(id) {
    return patients.find(patient => patient.id === id) || null;
}

function removePatient(id) {
    const initialLength = patients.length;
    patients = patients.filter(patient => patient.id !== id);
    
    if (patients.length < initialLength) {
        savePatients();
        updatePatientsList();
        console.log(`Paciente con ID ${id} eliminado correctamente`);
        return true;
    }
    
    console.error(`No se encontró paciente con ID ${id}`);
    return false;
}

function savePatients() {
    localStorage.setItem('calendarPatients', JSON.stringify(patients));
}
function openAppointmentModal() {
    document.getElementById('appointmentDate').value = formatDateForInput(new Date());
    fillDoctorsSelect();
    fillPatientsSelect();
    appointmentModal.style.display = 'flex';
}

function closeAppointmentModal() {
    appointmentModal.style.display = 'none';
    appointmentForm.reset();
}

function saveAppointment(e) {
    e.preventDefault();

    // Recoger datos del formulario
    const formData = {
        id: Date.now(),
        date: document.getElementById('appointmentDate').value,
        startTime: document.getElementById('appointmentStartTime').value,
        endTime: document.getElementById('appointmentEndTime').value,
        doctor: document.getElementById('appointmentDoctor').value,
        patient: document.getElementById('appointmentPatient').value,
        notes: document.getElementById('appointmentNotes').value
    };

    // Validar campos obligatorios
    if (!formData.date || !formData.startTime || !formData.endTime ||
        !formData.doctor || !formData.patient) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    // Guardar cita en sessionStorage instead of localStorage
    appointments.push(formData);
    sessionStorage.setItem('calendarAppointments', JSON.stringify(appointments));

    // Actualizar y cerrar
    updateCalendar();
    closeAppointmentModal();
}


// Funciones del calendario
function initCalendar() {
    // Llenar selectores de mes y año
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

    // Establecer valores iniciales
    monthSelect.value = new Date().getMonth();
    yearSelect.value = currentYear;
}

function updateCalendar() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Filtro seleccionado (para filtrar por especialidad)
    const selectedSpecialty = therapistFilter ? therapistFilter.value : "View All";
    
    generateDays(month, year);
    addAppointmentsToDays(month, year, selectedSpecialty);
}

function generateDays(month, year) {
    daysContainer.innerHTML = "";
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay(); // 0 = Domingo
    
    // Celdas vacías iniciales (días de la semana antes del primer día del mes)
    for (let i = 0; i < startDay; i++) {
        const div = document.createElement("div");
        div.classList.add("empty");
        daysContainer.appendChild(div);
    }
    
    // Obtener la fecha actual para resaltar el día de hoy
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

function addAppointmentsToDays(month, year, selectedSpecialty = "View All") {
    // Agrupar citas por fecha
    const appointmentsByDate = {};
    
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        
        // Solo procesar si la cita es del mes y año actual
        if (appointmentDate.getMonth() === month && appointmentDate.getFullYear() === year) {
            // Aplicar filtro por especialidad si es necesario
            if (selectedSpecialty !== "View All") {
                // Buscar el doctor de la cita
                const doctor = doctors.find(doc => doc.id === appointment.doctor || doc.name === appointment.doctor);
                
                // Si el doctor no coincide con la especialidad seleccionada, saltamos esta cita
                if (!doctor || doctor.specialty !== selectedSpecialty) {
                    return;
                }
            }
            
            const dateStr = formatDate(year, month, appointmentDate.getDate());
            
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = [];
            }
            
            appointmentsByDate[dateStr].push(appointment);
        }
    });
    
    // Añadir citas a los días
    Object.keys(appointmentsByDate).forEach(dateStr => {
        const dayElement = document.querySelector(`.days div[data-date="${dateStr}"]`);
        
        if (dayElement) {
            dayElement.classList.add('has-appointments');
            
            // Añadir cada cita al día
            appointmentsByDate[dateStr].forEach(appointment => {
                dayElement.appendChild(createAppointmentElement(appointment));
            });
        }
    });
}

function createAppointmentElement(appointment) {
    const appointmentDiv = document.createElement('div');
    appointmentDiv.classList.add('event-container');
    appointmentDiv.setAttribute('data-id', appointment.id);

    // Obtener nombres completos de doctor y paciente
    const doctor = doctors.find(doc => doc.id === appointment.doctor);
    const doctorName = doctor ? doctor.name : appointment.doctor;

    const patient = patients.find(p => p.id === appointment.patient);
    const patientName = patient ? patient.name : appointment.patient;

    // Crear el contenedor del texto del evento
    const combinedDiv = document.createElement('p');
    combinedDiv.textContent = `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)} | ${patientName} (${appointment.patient}) con ${doctorName} (${appointment.doctor})`;
    appointmentDiv.appendChild(combinedDiv);

    // Evento para mostrar detalles de la cita
    appointmentDiv.addEventListener('click', () => {
        showAppointmentDetails(appointment);
    });

    return appointmentDiv;
}



function showAppointmentDetails(appointment) {
    // Obtener los nombres completos de doctor y paciente
    const patient = patients.find(p => p.id === appointment.patient);
    const patientName = patient ? patient.name : appointment.patient;
    const doctor = doctors.find(doc => doc.id === appointment.doctor);
    const doctorName = doctor ? doctor.name : appointment.doctor;

    // Crear modal dinámico
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    modalOverlay.style.display = 'flex';

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    // Crear encabezado del modal
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');
    modalHeader.innerHTML = `<h3>Detalles de la Cita</h3><span class="close-modal">&times;</span>`;
    modalContainer.appendChild(modalHeader);

    // Crear cuerpo del modal con detalles de la cita
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modalBody.innerHTML = `
        <p><strong>Paciente:</strong> ${patientName} (${appointment.patient})</p>
        <p><strong>Doctor:</strong> ${doctorName} (${appointment.doctor})</p>
        <p><strong>Fecha:</strong> ${formatDisplayDate(appointment.date)}</p>
        <p><strong>Horario:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
        <p><strong>Notas:</strong> ${appointment.notes || 'Sin notas'}</p>
    `;
    modalContainer.appendChild(modalBody);

    // Agregar modal al documento
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // Manejar cierre del modal
    modalHeader.querySelector('.close-modal').addEventListener('click', () => {
        modalOverlay.remove();
    });
}

function fillDoctorsSelect() {
    const doctorSelect = document.getElementById('appointmentDoctor');
    if (!doctorSelect) return;
    
    doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>';
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.name} (${doctor.specialty})`;
        doctorSelect.appendChild(option);
    });
}

function fillPatientsSelect() {
    const patientSelect = document.getElementById('appointmentPatient');
    if (!patientSelect) return;
    
    patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} (${patient.id})`;
        patientSelect.appendChild(option);
    });
}

// Funciones de datos
function loadData() {
    // Cargar datos desde localStorage
    const savedDoctors = localStorage.getItem('doctors');
    if (savedDoctors) doctors = JSON.parse(savedDoctors);

    const savedPatients = localStorage.getItem('calendarPatients');
    if (savedPatients) patients = JSON.parse(savedPatients);

    // Cargar citas desde sessionStorage instead of localStorage
    const savedAppointments = sessionStorage.getItem('calendarAppointments');
    if (savedAppointments) appointments = JSON.parse(savedAppointments);

    // Actualizar interfaces
    updateDoctorsList();
    updatePatientsList();
}

function clearAppointments() {
    appointments = [];
    sessionStorage.removeItem('calendarAppointments');
    updateCalendar();
}

function savePatients() {
    localStorage.setItem('calendarPatients', JSON.stringify(patients));
}

function addSampleData() {
    // Añadir datos de muestra para pruebas
    addDoctor('D001', 'Dr. John Smith', 'Dermatology');
    addDoctor('D002', 'Dra. Maria García', 'Neurology');
    addDoctor('D003', 'Dr. Robert Johnson', 'Pediatrics');
    
    addPatient('P001', 'Ana Martínez', 'ana@example.com', '555-1234', '1988-05-15', {
        allergies: 'Penicilina', bloodType: 'A+'
    });
    addPatient('P002', 'Carlos Pérez', 'carlos@example.com', '555-5678', '1975-11-22', {
        allergies: 'Ninguna', bloodType: 'O-'
    });
    addPatient('P003', 'Laura Torres', 'laura@example.com', '555-9012', '1996-03-10', {
        allergies: 'Lácteos', bloodType: 'B+'
    });
}

// Funciones de formateo
function createOption(value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatTime(timeStr) {
    return timeStr.substring(0, 5);
}

// Add these functions to your existing JavaScript file

// Function to set up search functionality
function setupSearchFunctionality() {
    // Get the search inputs
    const doctorSearchInput = document.querySelector('.sidebar h2:first-of-type + .search-box');
    const patientSearchInput = document.querySelector('.sidebar h2:nth-of-type(2) + .search-box');
    
    // Add event listeners for real-time search
    if (doctorSearchInput) {
        doctorSearchInput.addEventListener('input', function() {
            searchDoctors(this.value.trim());
        });
    }
    
    if (patientSearchInput) {
        patientSearchInput.addEventListener('input', function() {
            searchPatients(this.value.trim());
        });
    }
}

// Function to search doctors by ID
function searchDoctors(searchTerm) {
    // If empty search, show all doctors
    if (!searchTerm) {
        updateDoctorsList();
        return;
    }
    
    // Convert search term to lowercase for case-insensitive search
    searchTerm = searchTerm.toLowerCase();
    
    // Find doctors that match the search term (by ID or name - can extend this as needed)
    const matchedDoctors = doctors.filter(doctor => 
        doctor.id.toLowerCase().includes(searchTerm) || 
        doctor.name.toLowerCase().includes(searchTerm)
    );
    
    // Display only matched doctors
    displayFilteredDoctors(matchedDoctors);
    
    // If we found a perfect match by ID, highlight that doctor
    const exactMatch = doctors.find(doc => doc.id.toLowerCase() === searchTerm.toLowerCase());
    if (exactMatch) {
        highlightDoctor(exactMatch.id);
    }
}

// Function to display filtered doctors list
function displayFilteredDoctors(filteredDoctors) {
    // Group filtered doctors by specialty for display
    const doctorsBySpecialty = {};
    filteredDoctors.forEach(doctor => {
        if (!doctorsBySpecialty[doctor.specialty]) {
            doctorsBySpecialty[doctor.specialty] = [];
        }
        doctorsBySpecialty[doctor.specialty].push(doctor);
    });
    
    // Get or create doctor container
    let doctorContainer = document.querySelector('.doctor-container');
    if (!doctorContainer) {
        doctorContainer = document.createElement('div');
        doctorContainer.className = 'doctor-container';
        const sidebar = document.querySelector('.sidebar');
        const therapistFilter = document.getElementById('therapist-filter');
        if (therapistFilter) {
            therapistFilter.parentNode.insertBefore(doctorContainer, therapistFilter.nextSibling);
        } else if (sidebar) {
            const firstH2 = sidebar.querySelector('h2');
            if (firstH2) {
                sidebar.insertBefore(doctorContainer, firstH2.nextSibling.nextSibling.nextSibling);
            }
        }
    }
    
    // Clear current content
    doctorContainer.innerHTML = '';
    
    // If no doctors match, show a message
    if (Object.keys(doctorsBySpecialty).length === 0) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.textContent = 'No matching doctors found';
        doctorContainer.appendChild(noResultsDiv);
        return;
    }
    
    // Create elements for each specialty and its doctors
    Object.keys(doctorsBySpecialty).forEach(specialty => {
        // Create specialty header
        const specialtyDiv = document.createElement('div');
        specialtyDiv.className = 'category expanded';
        specialtyDiv.innerHTML = `<i></i>${specialty}`;
        doctorContainer.appendChild(specialtyDiv);
        
        // Create subcategory for doctors
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'subcategory visible';
        
        // Add each doctor under this specialty
        doctorsBySpecialty[specialty].forEach(doctor => {
            const doctorDiv = document.createElement('div');
            doctorDiv.className = 'doctor-item';
            doctorDiv.textContent = doctor.name;
            doctorDiv.setAttribute('data-id', doctor.id);
            
            // Add click event to select this doctor
            doctorDiv.addEventListener('click', function() {
                selectDoctor(doctor.id);
            });
            
            subcategoryDiv.appendChild(doctorDiv);
        });
        
        doctorContainer.appendChild(subcategoryDiv);
    });
}

// Function to highlight a specific doctor
function highlightDoctor(doctorId) {
    // Remove highlight from all doctors
    document.querySelectorAll('.doctor-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add highlight to matching doctor
    const doctorElement = document.querySelector(`.doctor-item[data-id="${doctorId}"]`);
    if (doctorElement) {
        doctorElement.classList.add('selected');
        // Scroll the element into view
        doctorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Function to select a doctor for filtering appointments
function selectDoctor(doctorId) {
    // Highlight the selected doctor
    highlightDoctor(doctorId);
    
    // Update the search box with the doctor's ID
    const searchBox = document.querySelector('.sidebar h2:first-of-type + .search-box');
    if (searchBox) {
        searchBox.value = doctorId;
    }
    
    // Filter appointments on the calendar to show only this doctor's appointments
    filterCalendarByDoctor(doctorId);
}

// Function to filter calendar appointments by doctor
function filterCalendarByDoctor(doctorId) {
    // Get current month and year from the select elements
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Reset the calendar
    generateDays(month, year);
    
    // Filter appointments by the selected doctor
    const doctorAppointments = appointments.filter(appointment => 
        appointment.doctor === doctorId
    );
    
    // Add only the filtered appointments to the calendar
    addFilteredAppointmentsToDays(doctorAppointments, month, year);
}

// Function to add filtered appointments to calendar days
function addFilteredAppointmentsToDays(filteredAppointments, month, year) {
    // Group appointments by date
    const appointmentsByDate = {};
    
    filteredAppointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        
        // Only process if the appointment is in the current month and year
        if (appointmentDate.getMonth() === month && appointmentDate.getFullYear() === year) {
            const dateStr = formatDate(year, month, appointmentDate.getDate());
            
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = [];
            }
            
            appointmentsByDate[dateStr].push(appointment);
        }
    });
    
    // Add appointments to the calendar days
    Object.keys(appointmentsByDate).forEach(dateStr => {
        const dayElement = document.querySelector(`.days div[data-date="${dateStr}"]`);
        
        if (dayElement) {
            dayElement.classList.add('has-appointments');
            
            // Add each appointment to the day
            appointmentsByDate[dateStr].forEach(appointment => {
                dayElement.appendChild(createAppointmentElement(appointment));
            });
        }
    });
}

// Function to search patients by ID
function searchPatients(searchTerm) {
    // If empty search, show all patients
    if (!searchTerm) {
        updatePatientsList();
        return;
    }
    
    // Convert search term to lowercase for case-insensitive search
    searchTerm = searchTerm.toLowerCase();
    
    // Find patients that match the search term (by ID or name)
    const matchedPatients = patients.filter(patient => 
        patient.id.toLowerCase().includes(searchTerm) || 
        patient.name.toLowerCase().includes(searchTerm)
    );
    
    // Display only matched patients
    displayFilteredPatients(matchedPatients);
    
    // If we found a perfect match by ID, highlight that patient
    const exactMatch = patients.find(patient => patient.id.toLowerCase() === searchTerm.toLowerCase());
    if (exactMatch) {
        highlightPatient(exactMatch.id);
    }
}

// Function to display filtered patients list
function displayFilteredPatients(filteredPatients) {
    // Get or create patient container
    let patientContainer = document.querySelector('.patient-container');
    if (!patientContainer) {
        patientContainer = document.createElement('div');
        patientContainer.className = 'patient-container';
        const sidebar = document.querySelector('.sidebar');
        const openDataBtn = sidebar.querySelector('.opendata');
        if (openDataBtn) {
            sidebar.insertBefore(patientContainer, openDataBtn.nextSibling);
        } else {
            const inputs = sidebar.querySelectorAll('input');
            if (inputs.length >= 2) {
                sidebar.insertBefore(patientContainer, inputs[1].nextSibling.nextSibling);
            }
        }
    }
    
    // Clear current content
    patientContainer.innerHTML = '';
    
    // If no patients match, show a message
    if (filteredPatients.length === 0) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.textContent = 'No matching patients found';
        patientContainer.appendChild(noResultsDiv);
        return;
    }
    
    // Add each patient to the container
    filteredPatients.forEach(patient => {
        const patientDiv = document.createElement('div');
        patientDiv.className = 'patient-item';
        patientDiv.setAttribute('data-id', patient.id);
        patientDiv.textContent = patient.name;
        
        // Add click event to select this patient
        patientDiv.addEventListener('click', function() {
            selectPatient(patient.id);
        });
        
        patientContainer.appendChild(patientDiv);
    });
}

// Function to highlight a specific patient
function highlightPatient(patientId) {
    // Remove highlight from all patients
    document.querySelectorAll('.patient-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add highlight to matching patient
    const patientElement = document.querySelector(`.patient-item[data-id="${patientId}"]`);
    if (patientElement) {
        patientElement.classList.add('selected');
        // Scroll the element into view
        patientElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Function to select a patient for filtering appointments
function selectPatient(patientId) {
    // Highlight the selected patient
    highlightPatient(patientId);
    
    // Update the search box with the patient's ID
    const searchBox = document.querySelector('.sidebar h2:nth-of-type(2) + .search-box');
    if (searchBox) {
        searchBox.value = patientId;
    }
    
    // Filter appointments on the calendar to show only this patient's appointments
    filterCalendarByPatient(patientId);
}

// Function to filter calendar appointments by patient
function filterCalendarByPatient(patientId) {
    // Get current month and year from the select elements
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    // Reset the calendar
    generateDays(month, year);
    
    // Filter appointments by the selected patient
    const patientAppointments = appointments.filter(appointment => 
        appointment.patient === patientId
    );
    
    // Add only the filtered appointments to the calendar
    addFilteredAppointmentsToDays(patientAppointments, month, year);
}

// Update the setupEventListeners function to include search functionality
function setupEventListeners() {
    // Existing calendar events
    monthSelect.addEventListener("change", updateCalendar);
    yearSelect.addEventListener("change", updateCalendar);
    
    // Appointment modal events
    document.querySelector('.AddEvent').addEventListener('click', openAppointmentModal);
    document.querySelector('.close-modal').addEventListener('click', closeAppointmentModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeAppointmentModal);
    
    // Patient modal events
    document.querySelector('.opendata').addEventListener('click', function() {
        document.getElementById('modaloverlay').style.display = 'flex';
    });
    document.querySelector('.close-btn').addEventListener('click', function() {
        document.getElementById('modaloverlay').style.display = 'none';
    });
    
    // Therapist filter
    therapistFilter.addEventListener('change', function() {
        updateCalendar();
    });
    
    // Appointment form submission
    appointmentForm.addEventListener('submit', saveAppointment);
    
    // Set up search functionality
    setupSearchFunctionality();
}

// Add CSS class for selected items (add this to your CSS)



// Make sure to call setupEventListeners() when the DOM is loaded