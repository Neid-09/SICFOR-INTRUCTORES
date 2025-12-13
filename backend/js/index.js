let instructors = []

async function loadInstructors() {
    try{
        let res = await fetch('/query', {
            headers: {
                query: `SELECT * FROM instructores`
            }
        })

        instructors = await res.json()

        instructorsGrid.innerHTML = '';
    


    if (instructors.length === 0) {
        instructorsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 40px;">No se encontraron instructores</p>';
        return;
    }
    
    instructors.forEach(instructor => {
        const card = document.createElement('div');
        card.className = 'instructor-card';
        card.dataset.instructorId = instructor.id;
        card.innerHTML = `
            <img src="${instructor.foto}" alt="${instructor.nombres} ${instructor.apellidos}" class="instructor-avatar">
            <div class="instructor-name">${instructor.nombres} ${instructor.apellidos}</div>
            <div class="instructor-specialty">${instructor.especialidad}</div>
            <span class="instructor-status status-${instructor.estado}">
                ${instructor.estado.charAt(0).toUpperCase() + instructor.estado.slice(1)}
            </span>
        `;
        
        instructorsGrid.appendChild(card);
    });

    }catch(e){
        console.error(e)
    }
}

loadInstructors();

const instructorsGrid = document.getElementById('instructorsGrid');
const btnNewInstructor = document.getElementById('btnNewInstructor');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');



// Abrir página de registro de nuevo instructor
function openNewModal() {
    window.location.href = 'form-instructor.html';
}

// Filtrar y buscar instructores
function filterAndSearchInstructors() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    
    let filtered = instructors;
    
    // Filtrar por estado
    if (statusFilter !== 'todos') {
        filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    // Buscar por nombre o especialidad
    if (searchTerm) {
        filtered = filtered.filter(i => 
            i.name.toLowerCase().includes(searchTerm) ||
            i.specialty.toLowerCase().includes(searchTerm)
        );
    }
    
    renderInstructors(filtered);
}

// Event Listeners
btnNewInstructor.addEventListener('click', openNewModal);
searchInput.addEventListener('input', filterAndSearchInstructors);
filterStatus.addEventListener('change', filterAndSearchInstructors);

instructorsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.instructor-card');

    // TODO: Fijar esta por url o buscar alternativa para pasar el ID
    window.location.href = 'ver-perfil.html?instructorId=' + encodeURIComponent(card.dataset.instructorId);
});

// Renderizar instructores iniciales


