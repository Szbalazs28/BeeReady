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
            container.innerHTML = ''; 
            
            result.tasks.forEach(task => {
                const taskCard = createTaskElement(task);
                container.appendChild(taskCard);
            });
        }
    } catch (error) {
        console.error("Hiba a feladatok betöltésekor:", error);
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-card ${task.importance}`;
    div.id = `task-${task.id}`;

    const h4 = document.createElement('h4');
    h4.innerText = task.task_name;
    h4.classList.add('task-title'); 

    const desc = document.createElement('textarea');
    desc.value = task.task_description; 
    desc.classList.add('task-desc');
    desc.readOnly = true; 
    desc.setAttribute('spellcheck', 'false'); 

    const footer = document.createElement('div');
    footer.className = 'task-footer';

    const spanImportance = document.createElement('span');
    const importanceHu = {
        'high': 'Magas',
        'medium': 'Közepes',
        'low': 'Alacsony'
    };
    spanImportance.innerText = importanceHu[task.importance] || task.importance;
    spanImportance.dataset.value = task.importance; 

    const btn_group = document.createElement('div');
    btn_group.className = 'task-actions'; 

    const editBtn = document.createElement('button');
    editBtn.innerText = 'Szerkesztés';
    editBtn.className = 'edit_btn'; 
    editBtn.onclick = () => enableEditMode(task.id, div, editBtn);

    btn_group.appendChild(editBtn);

    if (task.importance !== 'done') {
        const doneBtn = document.createElement('button');
        doneBtn.innerText = 'Kész';
        doneBtn.className = 'done_btn';
        doneBtn.title = 'Feladat kész';
        doneBtn.onclick = () => markTaskDone(task.id);
        btn_group.appendChild(doneBtn);
    } else {
        const delBtn = document.createElement('button');
        delBtn.innerText = 'Törlés';
        delBtn.className = 'delete_btn';
        delBtn.onclick = () => deleteTask(task.id);
        btn_group.appendChild(delBtn);
    }

    footer.appendChild(spanImportance);
    footer.appendChild(btn_group);

    div.appendChild(h4);
    div.appendChild(desc); 
    div.appendChild(footer);

    return div;
}

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
        document.getElementById('task_name').value = '';
        document.getElementById('task_description').value = '';
        document.getElementById('importance').value = '';
        
        loadTasks();
    } else {
        alert("Hiba: " + result.message);
    }
}

async function markTaskDone(id) {
    const response = await fetch('/api/marktaskdone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ task_id: id })
    });

    const result = await response.json();
    if (result.success) {
        loadTasks();
    } else {
        alert("Hiba történt a feladat megjelölésekor.");
    }
}

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
        loadTasks();
    } else {
        alert("Hiba történt a törléskor.");
    }
}

function enableEditMode(id, card_div, editBtn) {
    const titleElement = card_div.querySelector('.task-title');
    const descElement = card_div.querySelector('.task-desc'); 

    titleElement.contentEditable = "true";
    descElement.readOnly = false;
    descElement.focus();
    card_div.classList.add('editing');
    editBtn.innerText = "Mentés";
    editBtn.classList.add('btn-success');
    editBtn.onclick = () => saveTask(id, card_div, editBtn);
}

async function saveTask(id, card_div, saveBtn) {
    const titleElement = card_div.querySelector('.task-title');
    const descElement = card_div.querySelector('.task-desc');
    const importanceSpan = card_div.querySelector('.task-footer span');

    const newTitle = titleElement.innerText;
    
    const newDesc = descElement.value; 
    
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
        titleElement.contentEditable = "false";
        
        descElement.readOnly = true;
        
        card_div.classList.remove('editing');

        saveBtn.innerText = "Szerkesztés";
        saveBtn.classList.remove('btn-success');
        saveBtn.onclick = () => enableEditMode(id, card_div, saveBtn);
    } else {
        alert("Hiba: " + result.message);
    }
}