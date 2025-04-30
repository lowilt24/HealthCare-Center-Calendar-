const diasContainer = document.getElementById("dias");
const mesSelect = document.getElementById("mes-select");
const anioSelect = document.getElementById("anio-select");

const nombresMeses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

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