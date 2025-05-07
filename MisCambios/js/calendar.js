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
  document.querySelector('input[placeholder="Search Therapists..."]').addEventListener('input', function() {
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

// Inicializar
fillSelectors();
updateCalendar();