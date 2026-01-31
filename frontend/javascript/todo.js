async function submitTask() {
    const task_name = document.getElementById('task_name').value;
    const task_description = document.getElementById('task_description').value;
    const importance = document.getElementById('importance').value;

    const response = await fetch('/taskadd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
            task_name,
            task_description,
            importance
        })
    });

    const result = await response.json();
    if (result.success) {
        alert("Siker: " + result.message);
        location.reload(); 
    } else {
        alert("Hiba: " + result.message);
    }
}

// Oldal betöltésekor lekérjük a feladatokat
document.addEventListener('DOMContentLoaded', loadTasks);

async function loadTasks() {
    try {
        const response = await fetch('/api/gettasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            const container = document.getElementById('todo_tasks');
            container.innerHTML = ''; // Töröljük a jelenlegi tartalmat (pl. a demo kártyát)
            
            result.tasks.forEach(task => {
                const taskCard = createTaskElement(task);
                container.appendChild(taskCard);
            });
        }
    } catch (error) {
        console.error("Hiba a feladatok betöltésekor:", error);
    }
}

// DOM elem generáló függvény
function createTaskElement(task) {
    const div = document.createElement('div');
    // Importance osztály hozzáadása (high, medium, low)
    div.className = `task-card ${task.importance}`;
    div.id = `task-${task.id}`;

    // Cím
    const h4 = document.createElement('h4');
    h4.innerText = task.task_name;
    h4.classList.add('task-title'); // CSS miatt hasznos lehet

    // Leírás
    const p = document.createElement('p');
    p.innerText = task.task_description;
    p.classList.add('task-desc');

    // Lábléc (Footer)
    const footer = document.createElement('div');
    footer.className = 'task-footer';

    // Fontosság szöveg
    const spanImportance = document.createElement('span');
    const importanceHu = {
        'high': 'Magas',
        'medium': 'Közepes',
        'low': 'Alacsony'
    };
    spanImportance.innerText = importanceHu[task.importance] || task.importance;
    spanImportance.dataset.value = task.importance; // Eredeti értéket tároljuk az update-hez

    // Gombok tárolója
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '10px';

    // Szerkesztés gomb
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Szerkesztés';
    editBtn.className = 'edit_btn btn btn-sm btn-outline-secondary'; // Bootstrap stílus vagy saját
    editBtn.onclick = () => enableEditMode(task.id, div, editBtn);

    // Törlés gomb
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Törlés';
    deleteBtn.className = 'delete_btn';
    deleteBtn.onclick = () => deleteTask(task.id);

    // Összeállítás
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    footer.appendChild(spanImportance);
    footer.appendChild(btnGroup);

    div.appendChild(h4);
    div.appendChild(p);
    div.appendChild(footer);

    return div;
}

// Új feladat beküldése
async function submitTask() {
    const task_name = document.getElementById('task_name').value;
    const task_description = document.getElementById('task_description').value;
    const importance = document.getElementById('importance').value;

    if (!task_name || !importance) {
        alert("Kérlek töltsd ki a kötelező mezőket!");
        return;
    }

    const response = await fetch('/api/taskadd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
            task_name,
            task_description,
            importance
        })
    });

    const result = await response.json();
    if (result.success) {
        // Mezők ürítése
        document.getElementById('task_name').value = '';
        document.getElementById('task_description').value = '';
        document.getElementById('importance').value = '';
        
        // Lista újratöltése reload nélkül
        loadTasks();
    } else {
        alert("Hiba: " + result.message);
    }
}

// Feladat törlése
async function deleteTask(id) {
    if(!confirm("Biztosan törölni szeretnéd ezt a feladatot?")) return;

    const response = await fetch('/api/deletetask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ task_id: id })
    });

    const result = await response.json();
    if (result.success) {
        // Elem eltávolítása a DOM-ból
        document.getElementById(`task-${id}`).remove();
    } else {
        alert("Hiba történt a törléskor.");
    }
}

// Szerkesztés mód bekapcsolása
function enableEditMode(id, cardDiv, editBtn) {
    const titleElement = cardDiv.querySelector('h4');
    const descElement = cardDiv.querySelector('p');

    // Tartalom szerkeszthetővé tétele
    titleElement.contentEditable = "true";
    descElement.contentEditable = "true";
    
    // Vizuális jelzés (pl. fókusz)
    titleElement.focus();
    cardDiv.classList.add('editing'); // CSS-ben formázhatod ha akarod

    // Gomb átváltása "Mentés"-re
    editBtn.innerText = "Mentés";
    editBtn.classList.remove('btn-outline-secondary');
    editBtn.classList.add('btn-success'); // Zöld gomb
    
    // Funkció cseréje a gombon
    editBtn.onclick = () => saveTask(id, cardDiv, editBtn);
}

// Módosítások mentése
async function saveTask(id, cardDiv, saveBtn) {
    const titleElement = cardDiv.querySelector('h4');
    const descElement = cardDiv.querySelector('p');
    const importanceSpan = cardDiv.querySelector('.task-footer span');

    const newTitle = titleElement.innerText;
    const newDesc = descElement.innerText;
    // Az importance-t most nem tettem szerkeszthetővé a kártyán belül egyszerűség kedvéért,
    // de az eredeti értéket visszaküldjük.
    const importanceValue = importanceSpan.dataset.value; 

    const response = await fetch('/api/updatetask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            task_id: id,
            task_name: newTitle,
            task_description: newDesc,
            importance: importanceValue
        })
    });

    const result = await response.json();

    if (result.success) {
        // Szerkesztés lezárása
        titleElement.contentEditable = "false";
        descElement.contentEditable = "false";
        cardDiv.classList.remove('editing');

        // Gomb visszaállítása
        saveBtn.innerText = "Szerkesztés";
        saveBtn.classList.remove('btn-success');
        saveBtn.classList.add('btn-outline-secondary');
        saveBtn.onclick = () => enableEditMode(id, cardDiv, saveBtn);
    } else {
        alert("Hiba a mentés során: " + result.message);
    }
}