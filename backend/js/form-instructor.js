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
// Manejo de envio de formulario (GUARDAR EN BD)
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formulario);
    const values = Object.fromEntries(formData.entries());

    let query = '';

    if (esEdicion && instructorId) {
        // ===== UPDATE =====
        query = `
            UPDATE instructores SET
                estado='${values.estadoInicial}',
                nombres='${values.nombre}',
                apellidos='${values.apellidos}',
                email='${values.email}',
                telefono='${values.telefono}',
                documento='${values.documentoId}',
                fecha_nacimiento='${values.fechaNacimiento}',
                titulo_academico='${values.tituloAcademico}',
                especialidad='${values.especialidad}',
                anos_experiencia=${values.anosExperiencia || 0},
                areas_experiencia='${values.areasExperiencia}',
                resumen='${values.resumen}',
                linkedin='${values.linkedin}',
                direccion='${values.direccion}'
            WHERE id=${instructorId};
        `;
    } else {
        // ===== INSERT =====
        query = `
            INSERT INTO instructores (
                estado,
                nombres,
                apellidos,
                email,
                telefono,
                documento,
                fecha_nacimiento,
                titulo_academico,
                especialidad,
                anos_experiencia,
                areas_experiencia,
                resumen,
                linkedin,
                direccion
            ) VALUES (
                '${values.estadoInicial}',
                '${values.nombre}',
                '${values.apellidos}',
                '${values.email}',
                '${values.telefono}',
                '${values.documentoId}',
                '${values.fechaNacimiento}',
                '${values.tituloAcademico}',
                '${values.especialidad}',
                ${values.anosExperiencia || 0},
                '${values.areasExperiencia}',
                '${values.resumen}',
                '${values.linkedin}',
                '${values.direccion}'
            );
        `;
    }

    try {
        await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        alert(esEdicion ? 'Instructor actualizado correctamente' : 'Instructor registrado correctamente');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar el instructor');
    }
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
