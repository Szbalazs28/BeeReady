// Naptár 

const monthYear = document.getElementById(`monthYear`)
const dates = document.getElementById(`dates`)
const backBtn = document.getElementById(`calendar_backBTN`)
const nextBtn = document.getElementById(`calendar_nextBTN`)

let current_date = new Date()

let update_Cal = () => {
    const currentY = current_date.getFullYear()
    const currentM = current_date.getMonth()

    const firstD = new Date(currentY, currentM, 0)
    const lastD = new Date(currentY, currentM + 1, 0)
    const totalD = lastD.getDate()
    const firstD_index = firstD.getDay()
    const lastD_index = lastD.getDay()

    const monthY_ToString = current_date.toLocaleString(`default`, { month: `long`, year: `numeric` })
    monthYear.textContent = monthY_ToString

    let res = ``

    for (let i = firstD_index; i > 0; i--) {
        const prevD = new Date(currentY, currentM, 0 - i + 1)
        res += `<div class="date inactive">${prevD.getDate()}</div>`
    }

    for (let i = 1; i <= totalD; i++) {
        const date = new Date(currentY, currentM, i)
        const active = date.toDateString() === new Date().toDateString() ? 'active' : ''
        res += `<div class="date ${active}">${i}</div>`
    }

    for (let i = 1; i <= 7 - lastD_index; i++) {
        const nextD = new Date(currentY, currentM + 1, i)
        res += `<div class="date inactive">${nextD.getDate()}</div>`
    }

    dates.innerHTML = res;
}
backBtn.addEventListener('click', () => {
    current_date.setMonth(current_date.getMonth() - 1)
    update_Cal()

})

nextBtn.addEventListener('click', () => {
    current_date.setMonth(current_date.getMonth() + 1)
    update_Cal()

})

update_Cal()

//Időzítő

let timer;
let isRunning = false;
let timeLeft = 25 * 60;
const timerDisplay = document.getElementById('timer_display');
const startB = document.getElementById('start_timer');
const pauseB = document.getElementById('stop_timer');
const resetB = document.getElementById('reset_timer');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
// = padStart(`mennyi a kivant szamhossz`, `mi legyen a kiegeszitokarakter`)

function start() {
    if (!isRunning) {
        isRunning = true;
        startB.disabled = true;
        pauseB.disabled = false;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            }
            else {
                clearInterval(timer);
                isRunning = false;
                timerDisplay.innerHTML = '<span class="timer_message">Idő lejárt! Ideje egy kis szünetet tartani.</span>';
                pauseB.disabled = true;
            }
        }, 1000);
    }
    else { return }
}
function pause() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startB.disabled = false;
    }
    else { return };
}
function reset() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 25 * 60;
    startB.disabled = false;
    updateDisplay();
}

updateDisplay();

// ToDo

async function submitTask() {
    try {
        const task_name = document.getElementById('task_name').value;
        const task_description = document.getElementById('task_description').value;
        const importance = document.getElementById('importance').value;
        const result = await apiFetch('http://localhost:4000/api/taskadd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ task_name: task_name, task_description: task_description, importance: importance })
        });

        // ez ide kell hogy folyamatosan frissitse es ne kelljen rafrissiteni az oldalra hogy megjelenjenek a feladatok
        if (result && result.write) {
            loadTasks();
            document.getElementById('task_name').value = '';
            document.getElementById('task_description').value = '';
            document.getElementById('importance').value = 'low';
        }
    } catch (error) {
        console.error(error);
    }
}



async function loadTasks() {
    try {
        const result = await apiFetch('http://localhost:4000/api/gettasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const container = document.getElementById('todo_tasks');
        container.innerHTML = '';

        result.tasks.forEach(task => {
            const taskCard = createTaskElement(task);
            container.appendChild(taskCard);
        });
    } catch (error) {
        console.error(error);
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

document.addEventListener('DOMContentLoaded', loadTasks);

async function markTaskDone(id) {
    try {
        const response = await apiFetch('http://localhost:4000/api/marktaskdone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ task_id: id })
    });
    loadTasks();
    }
    catch (error) {
        console.error(error);
    }
   
}

async function deleteTask(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a feladatot?")) return;

    try{
         const response = await apiFetch('http://localhost:4000/api/deletetask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ task_id: id })
    });
}
catch(error){
    console.error(error);
}

loadTasks();
   
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
    try {
        const titleElement = card_div.querySelector('.task-title');
        const descElement = card_div.querySelector('.task-desc');
        const importanceSpan = card_div.querySelector('.task-footer span');
        const newTitle = titleElement.innerText;
        const newDesc = descElement.value;
        const importanceValue = importanceSpan.dataset.value;
    
        const response = await apiFetch('http://localhost:4000/api/updatetask', {
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
        
    }
    catch (error) {
        console.error(error);
    }
    loadTasks();
}