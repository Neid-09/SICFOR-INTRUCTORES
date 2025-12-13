// Verificar formulario si edit o nuevo
const urlParams = new URLSearchParams(window.location.search);
const instructorId = parseInt(urlParams.get("instructorId"), 10);
const esEdicion = instructorId !== null;

const formulario = document.getElementById('formRegistroInstructor');

// Para preview de foto-perfil
const inputFoto = document.getElementById('inputFoto');
const fotoPreview = document.getElementById('fotoPreview');

// Para manejo de soporte digital
const inputSoporte = document.getElementById('soporteDigital');
const soporteLabel = document.getElementById('soporteLabel');
const soporteFileName = document.getElementById('soporteFileName');
const uploadText = soporteLabel.querySelector('.upload-text');
const svg = soporteLabel.querySelector('svg');

const fetchInstructors = async () => {
	const response = await fetch("./test/datos-perfil.json");
	if (!response.ok) throw new Error("Network response was not ok");
	return response.json();
};

async function init() {

    if (esEdicion && instructorId) {
        const datos = await fetchInstructors();
        const instructorEdit = datos.find((i) => i.id === instructorId);
        
        if (instructorEdit) {
            await poblarFormulario(formulario, instructorEdit);
        } else {
            console.error(`No se encontró el instructor con ID: ${instructorId}`);
        }
    }
}

async function poblarFormulario(formulario, datos) {
    // Poblar campos del formulario
    console.log(datos);
    
    // Manejo de foto
    fotoPreview.innerHTML = `<img src="${datos.foto}" alt="Preview de foto">`;

    formulario.estadoInicial.value = datos.estadoInicial;
    formulario.nombre.value = datos.nombre;
    formulario.apellidos.value = datos.apellidos;
    formulario.email.value = datos.email;
    formulario.telefono.value = datos.telefono;
    formulario.documentoId.value = datos.documentoId;
    formulario.fechaNacimiento.value = datos.fechaNacimiento;

    uploadText.style.display = 'none';
    svg.style.display = 'none';
    soporteFileName.style.display = 'block';
    soporteFileName.textContent = `📄 ${datos.soporteDigital}`;
    soporteLabel.classList.add('file-selected');

    formulario.tituloAcademico.value = datos.tituloAcademico;
    formulario.especialidad.value = datos.especialidad;
    formulario.anosExperiencia.value = datos.anosExperiencia;
    formulario.resumen.value = datos.resumen;
    formulario.areasExperiencia.value = datos.areasExperiencia;
    formulario.linkedin.value = datos.linkedin;
    formulario.direccion.value = datos.direccion;
}


// Manejo de preview de foto
inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            fotoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview de foto">`;
        };
        reader.readAsDataURL(file);
    }
});

// Manejo de soporte digital - mostrar nombre de archivo
inputSoporte.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Ocultar el texto original y mostrar el nombre del archivo
        uploadText.style.display = 'none';
        svg.style.display = 'none';
        soporteFileName.style.display = 'block';
        soporteFileName.textContent = `📄 ${file.name}`;
        soporteLabel.classList.add('file-selected');
    }
});

// Manejo de envio de formular
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(formulario);
    const values = Object.fromEntries(formData.entries());

    console.log('Datos del formulario:', values);

});

// Manejo de cancelar
const botonCancelar = document.getElementById('btnCancelar');
const botonVolver = document.getElementById('btnVolver');

botonCancelar.addEventListener('click', manejarRedirectHome);
botonVolver.addEventListener('click', manejarRedirectHome);

function manejarRedirectHome(e) {
    e.preventDefault();
    window.location.href = 'index.html';
}

init();
