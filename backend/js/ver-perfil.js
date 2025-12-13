//: ver-perfil.js — validaciones, manejo de errores y creación segura de nodos

//: función para obtener instructor por id. Intentamos el endpoint /query
// y en desarrollo hacemos un fallback a un JSON local si /query no está disponible.
async function fetchInstructorById(id) {
	try {
		const res = await fetch('/query', {
			headers: { query: `SELECT * FROM instructores WHERE id = ${Number(id)}` }
		});
		if (!res.ok) throw new Error('Network response was not ok');
		const rows = await res.json();
		return Array.isArray(rows) && rows.length ? rows[0] : null;
	} catch (err) {
		//  fallback de desarrollo — intentar JSON local relativo al documento
		try {
			const alt = await fetch('./test/datos-perfil.json');
			if (!alt.ok) throw new Error('Fallback JSON not found');
			const data = await alt.json();
			return Array.isArray(data) && data.length ? data.find(i => i.id === Number(id)) || null : null;
		} catch (err2) {
			console.warn('fetchInstructorById: both /query and fallback failed', err, err2);
			throw err; // dejar que el caller maneje el error
		}
	}
}

//: leer el ID como string y convertirlo de forma segura
const instructorId = new URLSearchParams(window.location.search).get('instructorId');
const idConvertido = instructorId ? parseInt(instructorId, 10) : NaN;

//: wrapper de búsqueda para mantener API previa
async function shearchInstructorsById(id) {
	return await fetchInstructorById(id);
}

const contenedorPerfil = document.querySelector('.contenedor-perfil');

//: validar ID, manejar errores y caso "no encontrado"
document.addEventListener('DOMContentLoaded', async () => {
	if (isNaN(idConvertido)) {
		if (contenedorPerfil) contenedorPerfil.innerHTML = '<p>No se especificó un ID de instructor válido.</p>';
		return;
	}

	try {
		const instructor = await shearchInstructorsById(idConvertido);
		if (!instructor) {
			if (contenedorPerfil) contenedorPerfil.innerHTML = '<p>Instructor no encontrado.</p>';
			return;
		}
		poblarDatos(instructor);
	} catch (err) {
		if (contenedorPerfil) contenedorPerfil.innerHTML = '<p>Error cargando datos del instructor.</p>';
		console.error(err);
	}
});

function poblarDatos(datos) {
	//: proteger contra datos nulos y selectores inexistentes
	if (!datos) {
		if (contenedorPerfil) contenedorPerfil.innerHTML = '<p>Datos no disponibles.</p>';
		return;
	}

	// Elementos del DOM
	const encabezadoPerfil = document.querySelector('.profile-header');
	if (!encabezadoPerfil) return;

	//: manejar foto ausente y evitar innerHTML directo sin control
	const fotoPerfil = document.createElement('img');
	fotoPerfil.src = datos.foto || 'https://via.placeholder.com/150?text=Sin+foto';
	fotoPerfil.alt = `${datos.nombre || ''} ${datos.apellidos || ''}`.trim();
	fotoPerfil.className = 'profile-image';
	encabezadoPerfil.appendChild(fotoPerfil);

	//: crear nodos en vez de concatenar HTML (más seguro y evita duplicados)
	const informacionPerfil = document.createElement('article');
	informacionPerfil.className = 'profile-info';
	const h1 = document.createElement('h1');
	h1.textContent = `${datos.nombre || ''} ${datos.apellidos || ''}`.trim();
	const pTitle = document.createElement('p');
	pTitle.className = 'title';
	pTitle.textContent = datos.especialidad || '';
	const spanStatus = document.createElement('span');
	spanStatus.className = 'status-badge';
	spanStatus.textContent = datos.estadoInicial || '';
	informacionPerfil.appendChild(h1);
	informacionPerfil.appendChild(pTitle);
	informacionPerfil.appendChild(spanStatus);
	encabezadoPerfil.appendChild(informacionPerfil);

	//: evitar duplicados — limpiar antes de insertar
	const cardBiografia = document.getElementById('card-biografia');
	if (cardBiografia) {
		cardBiografia.innerHTML = '';
		const p = document.createElement('p');
		p.textContent = datos.resumen || '';
		cardBiografia.appendChild(p);
	}

	//: procesar áreas de experiencia de forma robusta
	const cardExperiencia = document.getElementById('card-experiencia');
	if (cardExperiencia) {
		cardExperiencia.innerHTML = '';
		const tagsDiv = document.createElement('div');
		tagsDiv.className = 'tags';
		if (datos.areasExperiencia) {
			datos.areasExperiencia
				.split(',')
				.map((area) => area.trim())
				.filter(Boolean)
				.forEach((area) => {
					const span = document.createElement('span');
					span.className = 'tag';
					span.textContent = area;
					tagsDiv.appendChild(span);
				});
		}
		cardExperiencia.appendChild(tagsDiv);
	}

	//: comprobar existencia de elementos de contacto antes de manipular
	const itemContacto = document.querySelectorAll('.contact-item');
	if (itemContacto.length >= 4) {
		itemContacto[0].innerHTML = '';
		const emailSpan = document.createElement('span');
		emailSpan.textContent = datos.email || '';
		itemContacto[0].appendChild(emailSpan);

		itemContacto[1].innerHTML = '';
		const telSpan = document.createElement('span');
		telSpan.textContent = datos.telefono || '';
		itemContacto[1].appendChild(telSpan);

		itemContacto[2].innerHTML = '';
		const linkA = document.createElement('a');
		linkA.target = '_blank';
		linkA.className = 'link';
		linkA.href = datos.linkedin || '#';
		linkA.textContent = datos.linkedin || '';
		itemContacto[2].appendChild(linkA);

		itemContacto[3].innerHTML = '';
		const addrSpan = document.createElement('span');
		addrSpan.textContent = datos.direccion || '';
		itemContacto[3].appendChild(addrSpan);
	}

	//: comprobar existencia antes de acceder a detalles personales
	const detallesPersonales = document.querySelectorAll('.detail-item');
	if (detallesPersonales.length >= 3) {
		detallesPersonales[0].innerHTML = '';
		const idSpan = document.createElement('span');
		idSpan.textContent = datos.id || '';
		detallesPersonales[0].appendChild(idSpan);

		detallesPersonales[1].innerHTML = '';
		const fechaSpan = document.createElement('span');
		fechaSpan.textContent = datos.fechaNacimiento || '';
		detallesPersonales[1].appendChild(fechaSpan);

		detallesPersonales[2].innerHTML = '';
		const anosSpan = document.createElement('span');
		anosSpan.textContent = (datos.anosExperiencia !== undefined && datos.anosExperiencia !== null) ? `${datos.anosExperiencia} años` : '';
		detallesPersonales[2].appendChild(anosSpan);
	}
}

//: añadir listener al botón Editar sólo si existe y redirigir a form.html
const botonEditar = document.getElementById('btn-editar');
if (botonEditar) {
	botonEditar.addEventListener('click', manejarRedirectEditar);
}

function manejarRedirectEditar(e) {
	e.preventDefault();
	window.location.href = `form.html?instructorId=${encodeURIComponent(instructorId || '')}`;
}
