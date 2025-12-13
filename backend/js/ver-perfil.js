const fetchInstructors = async () => {
	const response = await fetch("./test/datos-perfil.json");
	if (!response.ok) throw new Error("Network response was not ok");
	return response.json();
};

const instructorId = new URLSearchParams(window.location.search).get(
	"instructorId"
);
const idConvertido = parseInt(instructorId, 10);

async function shearchInstructorsById(id) {
	const instructors = await fetchInstructors();

	const instructor = instructors.find((i) => i.id === id);
	return instructor;
}

const contenedorPerfil = document.querySelector(".contenedor-perfil");

//Cargar y mostrar datos del instructor
document.addEventListener("DOMContentLoaded", async () => {
	const instructor = await shearchInstructorsById(idConvertido);
	poblarDatos(instructor);
});

function poblarDatos(datos) {
	//Elementos del DOM
	const encabezadoPerfil = document.querySelector(".profile-header");

	// Foto de perfil
	const fotoPerfil = document.createElement("img");
	fotoPerfil.src = datos.foto;
	fotoPerfil.alt = `${datos.nombre} ${datos.apellidos}`;
	fotoPerfil.className = "profile-image";
	encabezadoPerfil.appendChild(fotoPerfil);

	// Nombre completo
	const informacionPerfil = document.createElement("article");
	informacionPerfil.className = "profile-info";
	informacionPerfil.innerHTML = `
		<h1>${datos.nombre} ${datos.apellidos}</h1>
		<p class="title">${datos.especialidad}</p>
		<span class="status-badge">${datos.estadoInicial}</span>
	`;
	encabezadoPerfil.appendChild(informacionPerfil);

	// Biografía
	const cardBiografia = document.getElementById("card-biografia");
	cardBiografia.innerHTML += `
		<p>${datos.resumen}</p>
	`;

	// Áreas de ExperIencia
	const cardExperiencia = document.getElementById("card-experiencia");
	const areasExperiencia = datos.areasExperiencia
		.split(",")
		.map((area) => `<span class="tag">${area.trim()}</span>`)
		.join("");
	cardExperiencia.innerHTML += `
		<div class="tags">
			${areasExperiencia}
		</div>
	`;

	// Información de contacto
	const itemContacto = document.querySelectorAll(".contact-item");
	itemContacto[0].innerHTML += `<span>${datos.email}</span>`;
	itemContacto[1].innerHTML += `<span>${datos.telefono}</span>`;
	itemContacto[2].innerHTML += `<a target="_blank" href="${datos.linkedin}" class="link">${datos.linkedin}</a>`;
	itemContacto[3].innerHTML += `<span>${datos.direccion}</span>`;

	// Datos personales adicionales
	const detallesPersonales = document.querySelectorAll(".detail-item");
	detallesPersonales[0].innerHTML += `<span>${datos.id}</span>`;
	detallesPersonales[1].innerHTML += `<span>${datos.fechaNacimiento}</span>`;
	detallesPersonales[2].innerHTML += `<span>${datos.anosExperiencia} años</span>`;
}

// Manejo de botón Editar Datos
const botonEditar = document.getElementById('btn-editar');
botonEditar.addEventListener('click', manejarRedirectEditar);

function manejarRedirectEditar(e) {
		e.preventDefault();
		window.location.href = `form-instructor.html?instructorId=${instructorId}`;
}
