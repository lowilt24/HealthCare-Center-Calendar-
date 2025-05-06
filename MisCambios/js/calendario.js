const diasContainer = document.getElementById("dias");
const mesSelect = document.getElementById("mes-select");
const anioSelect = document.getElementById("anio-select");

const nombresMeses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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
function llenarSelectores() {
  nombresMeses.forEach((nombre, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = nombre;
    mesSelect.appendChild(option);
  });

  const anioActual = new Date().getFullYear();
  for (let y = anioActual - 5; y <= anioActual + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    anioSelect.appendChild(option);
  }

  // Establecer mes y año actuales como seleccionados
  mesSelect.value = new Date().getMonth();
  anioSelect.value = new Date().getFullYear();
}

function generarDias(mes, anio) {
  diasContainer.innerHTML = "";

  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  let diaInicio = primerDia.getDay(); // 0 = domingo

  // Ajustar si quieres que la semana inicie en lunes

  // Celdas vacías antes del día 1
  for (let i = 0; i < diaInicio; i++) {
    const div = document.createElement("div");
    div.classList.add("vacio");
    diasContainer.appendChild(div);
  }

  // Días del mes
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const div = document.createElement("div");
    div.textContent = dia

    diasContainer.appendChild(div);
  }
}

// Event listeners
mesSelect.addEventListener("change", actualizarCalendario);
anioSelect.addEventListener("change", actualizarCalendario);

function actualizarCalendario() {
  const mes = parseInt(mesSelect.value);
  const anio = parseInt(anioSelect.value);
  generarDias(mes, anio);
}

// Inicializar
llenarSelectores();
actualizarCalendario();