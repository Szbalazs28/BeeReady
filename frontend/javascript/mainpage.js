// Naptár 
const monthYear = document.getElementById('monthYear');
const datesContainer = document.getElementById('dates');
const eventModal = document.getElementById('eventModal');
let current_date = new Date();

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

function dateChangeHandler() {
    const newDate = this.value;
    document.getElementById('modalTitle').textContent = `Események: ${newDate}`;
    eventModal.dataset.selectedDate = newDate;
    refreshModalEvents(newDate);
}

async function update_Cal() {
    try {
        const currentY = current_date.getFullYear();
        const currentM = current_date.getMonth();

        const data = await apiFetch('http://localhost:4000/api/get_calendar_events', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ year: currentY, month: currentM + 1 })
        });

        const events = data.events || [];
        monthYear.textContent = current_date.toLocaleString('hu-HU', { year: 'numeric', month: 'long' });

        datesContainer.innerHTML = '';

        let firstDay = new Date(currentY, currentM, 1).getDay();
        let startOffset = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(currentY, currentM + 1, 0).getDate();
        const prevMonthLastDay = new Date(currentY, currentM, 0).getDate();

        for (let i = startOffset; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'date inactive';
            dayDiv.textContent = prevMonthLastDay - i + 1;
            datesContainer.appendChild(dayDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentY}-${String(currentM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const isToday = todayStr === dateStr;
            
            const dayEvents = events.filter(e => {
                const eDate = e.event_date.includes('T') ? e.event_date.split('T')[0] : e.event_date;
                return eDate === dateStr;
            });

            const dayDiv = document.createElement('div');
            dayDiv.className = `date ${isToday ? 'active' : ''}`;
            dayDiv.textContent = i;
            
            dayDiv.onclick = () => openEventModal(dateStr);

            if (dayEvents.length > 0) {
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                dayDiv.appendChild(dot);

                const tooltipContent = dayEvents.map(e => `${e.title}${e.description ? ': ' + e.description : ''}`).join(" | ");
                dayDiv.setAttribute('data-title', tooltipContent);
            }

            datesContainer.appendChild(dayDiv);
        }

        const totalCells = 42;
        const filledCells = startOffset + daysInMonth;
        for (let i = 1; i <= (totalCells - filledCells); i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'date inactive';
            dayDiv.textContent = i;
            datesContainer.appendChild(dayDiv);
        }

    } catch (err) {
        console.error('Naptár hiba:', err);
    }
}
function closeEventModal() {
    eventModal.style.display = 'none';
    const dateInput = document.getElementById('event_date');
    if (dateInput) {
        dateInput.removeEventListener('change', dateChangeHandler);
    }
    document.getElementById('event_title').value = '';
    document.getElementById('event_desc').value = '';
}

async function openEventModal(dateStr) {
    eventModal.dataset.selectedDate = dateStr;
    const dateInput = document.getElementById('event_date');
    if (dateInput) {
        dateInput.value = dateStr;
        dateInput.addEventListener('change', dateChangeHandler);
    }

    document.getElementById('modalTitle').textContent = `Események: ${dateStr}`;

    document.getElementById('event_title').value = '';
    document.getElementById('event_desc').value = '';

    await refreshModalEvents(dateStr);

    eventModal.style.display = 'flex';
}

async function refreshModalEvents(dateStr) {
    const existingDiv = document.getElementById('existingEvents');
    existingDiv.textContent = 'Betöltés...';

    try {

        const currentY = new Date(dateStr).getFullYear();
        const currentM = new Date(dateStr).getMonth() + 1;

        const data = await apiFetch('http://localhost:4000/api/get_calendar_events', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ year: currentY, month: currentM })
        });

        const allEvents = data.events || [];

        const dailyEvents = allEvents.filter(e => {
            const eDate = e.event_date.includes('T') ? e.event_date.split('T')[0] : e.event_date;
            return eDate === dateStr;
        });

        existingDiv.innerHTML = '';

        if (dailyEvents.length === 0) {
            existingDiv.textContent = 'Nincsenek események ezen a napon.';
        }

        dailyEvents.forEach(ev => {
            const row = document.createElement('div');
            row.className = 'existing-event'; 

            const evDiv = document.createElement('div');
            evDiv.className = 'event-info';
            row.appendChild(evDiv);

            const strong = document.createElement('strong');
            strong.textContent = ev.title;
            evDiv.appendChild(strong);

            const span = document.createElement('span');
            span.textContent = ev.description || '';
            evDiv.appendChild(span);

            evDelBtn = document.createElement('button');
            evDelBtn.className = 'delete-event-btn';
            evDelBtn.textContent = 'Törlés';
            evDelBtn.onclick = () => DeleteEvent(ev.event_id, ev.title, dateStr);

            row.appendChild(evDiv);
            row.appendChild(evDelBtn);
            existingDiv.appendChild(row);
        });
    } catch (err) {
        existingDiv.textContent = 'Hiba az adatok betöltésekor.';
    }
}

async function DeleteEvent(eventId, eventTitle, dateStr) {
    if (!confirm(`Biztosan törlöd a(z) "${eventTitle}" eseményt?`)) return;

    try {
        await apiFetch('http://localhost:4000/api/delete_calendar_event', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ event_id: eventId })
        });

        await update_Cal(); 
        await refreshModalEvents(dateStr); 
    } catch (err) {
        console.error('Hiba a törlésnél:', err);
    }
}

async function saveCalendarEvent() {
    const date = document.getElementById('event_date').value;
    const title = document.getElementById('event_title').value;
    const desc = document.getElementById('event_desc').value;

    if (!title) return alert("Kérlek, add meg az esemény nevét!");

    try {
        await apiFetch('http://localhost:4000/api/insert_calendar_event', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                date: date,
                title: title,
                description: desc,
            })
        });

        closeEventModal();
        update_Cal();
    } catch (err) {
        console.error("Mentési hiba:", err);
    }
}

document.getElementById('calendar_backBTN').onclick = () => {
    current_date.setMonth(current_date.getMonth() - 1);
    update_Cal();
};

document.getElementById('calendar_nextBTN').onclick = () => {
    current_date.setMonth(current_date.getMonth() + 1);
    update_Cal();
};

update_Cal();

//Időzítő
let timer
let isRunning = false
let currentMode = 'stopwatch'
let seconds = 0

const display = document.getElementById('timer_display')
const select = document.getElementById('timer_select')
const startBtn = document.getElementById('start_timer')
const stopBtn = document.getElementById('stop_timer')
const resetBtn = document.getElementById('reset_timer')

updateDisplay()
toggleButtons()

select.addEventListener('change', (e) => {
    pause()
    currentMode = e.target.value
    seconds = (currentMode === 'pomodoro') ? 25 * 60 : 0
    updateDisplay()
    toggleButtons()
})

function toggleButtons() {
    stopBtn.disabled = !isRunning
    const isInitialValue = (currentMode === 'pomodoro' && seconds === 25 * 60) ||
        (currentMode !== 'pomodoro' && seconds === 0)
    resetBtn.disabled = !isRunning && isInitialValue
    startBtn.disabled = isRunning
}

function updateDisplay() {
    if (currentMode === 'custom' && !isRunning) {
        display.innerHTML = ''
        let input = document.createElement('input')
        input.type = 'number'
        input.id = 'timer_custom_minutes'
        input.placeholder = '00:00'

        input.addEventListener('input', function () {
            if (this.value.length > 3) {
                this.value = this.value.slice(0, 3)
            }
        })

        display.appendChild(input)
        input.focus()
    } else {
        const mins = Math.floor(Math.abs(seconds) / 60)
        const secs = Math.abs(seconds) % 60
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        //padstart azért kell hogy mindig 2 számjegy legyen, ha kevesebb akkor 0-val tölti ki a helyet
    }
}

let totalSecondsSpent = 0

function start() {
    if (!isRunning) {

        let canStart = true
        if (currentMode === 'custom') {
            const input = document.getElementById('timer_custom_minutes')
            if (input) {
                try {
                    lengthtest(input.value, 1, 3)
                    const val = parseInt(input.value)

                    if (!isNaN(val) && val > 0) {
                        seconds = val * 60
                    } else {
                        alertell("Adj meg egy érvényes percet!", 2.5)
                        canStart = false
                    }
                } catch (e) {
                    canStart = false
                }
            }
        } else if (currentMode === 'pomodoro' && seconds === 0) {
            seconds = 25 * 60
        }

        if (canStart) {
            isRunning = true
            toggleButtons()
            updateDisplay()

            timer = setInterval(() => {
                totalSecondsSpent++;
                updateStudyTime();
                if (currentMode === 'stopwatch') {
                    seconds++
                } else {
                    seconds--
                    if (seconds <= 0) {
                        clearInterval(timer)
                        isRunning = false
                        seconds = 0
                        alertell("Idő lejárt!", 2.5)
                        toggleButtons()
                    }
                }
                updateDisplay()
            }, 1000)
        }
    }
}


function pause() {
    clearInterval(timer)
    isRunning = false
    toggleButtons()
}

function reset() {
    pause()
    if (currentMode === 'pomodoro') {
        seconds = 25 * 60
    } else {
        seconds = 0
    }
    updateDisplay()
    toggleButtons()
}

/*tanualassal tolott ido*/
function updateStudyTime() {
    const studyTimeDisplay = document.querySelector('#total_time_display');

    const h = Math.floor(totalSecondsSpent / 3600);
    const m = Math.floor((totalSecondsSpent % 3600) / 60);
    const s = totalSecondsSpent % 60;

    const timeString = `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;

    studyTimeDisplay.textContent = timeString;

}

// ToDo
async function submitTask() {
    try {
        const task_name = document.getElementById('task_name').value
        const task_description = document.getElementById('task_description').value
        const importance = document.getElementById('importance').value
        const result = await apiFetch('http://localhost:4000/api/taskadd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ task_name: task_name, task_description: task_description, importance: importance })
        })

        // ez ide kell hogy folyamatosan frissitse es ne kelljen rafrissiteni az oldalra hogy megjelenjenek a feladatok
        if (result && result.write) {
            loadTasks()
            document.getElementById('task_name').value = ''
            document.getElementById('task_description').value = ''
            document.getElementById('importance').value = 'low'
        }
    } catch (error) {
        console.error(error)
    }
}

async function loadTasks() {
    try {
        const result = await apiFetch('http://localhost:4000/api/gettasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const container = document.getElementById('todo_tasks')
        container.innerHTML = ''

        result.tasks.forEach(task => {
            const taskCard = createTaskElement(task)
            container.appendChild(taskCard)
        })

        updateStatisticsChart()
    } catch (error) {
        console.error(error)
    }
}


function createTaskElement(task) {
    // Fallback: ha nincs is_completed, akkor a régi logika alapján (importance === 'done')
    const isCompleted = task.is_completed !== undefined ? task.is_completed : (task.importance === 'done');

    const div = document.createElement('div')
    div.className = `task-card ${task.importance}${isCompleted ? ' completed' : ''}`
    div.id = `task-${task.id}`

    const h4 = document.createElement('h4')
    h4.innerText = task.task_name
    h4.classList.add('task-title')

    const desc = document.createElement('textarea')
    desc.value = task.task_description
    desc.classList.add('task-desc')
    desc.readOnly = true
    desc.setAttribute('spellcheck', 'false')

    const footer = document.createElement('div')
    footer.className = 'task-footer'

    const spanImportance = document.createElement('span')
    const importanceHu = {
        'high': 'Magas',
        'medium': 'Közepes',
        'low': 'Alacsony'
    }
    spanImportance.innerText = importanceHu[task.importance] || task.importance
    spanImportance.dataset.value = task.importance

    const btn_group = document.createElement('div')
    btn_group.className = 'task-actions'

    if (!isCompleted) {
        const editBtn = document.createElement('button')
        editBtn.className = 'edit_btn'
        editBtn.onclick = () => enableEditMode(task.id, div, editBtn)
        btn_group.appendChild(editBtn)
        editBtn.innerText = 'Szerkesztés'

        const doneBtn = document.createElement('button')
        doneBtn.innerText = 'Kész'
        doneBtn.className = 'done_btn'
        doneBtn.title = 'Feladat kész'
        doneBtn.onclick = () => markTaskDone(task.id)
        btn_group.appendChild(doneBtn)

    } else {
        const editBtn = document.createElement('button')
        editBtn.innerText = 'Vissza'
        editBtn.className = 'takeBack_btn'
        editBtn.onclick = () => restoreTask(task.id)
        btn_group.appendChild(editBtn)
        editBtn.className = 'takeBack_btn'
        editBtn.onclick = () => restoreTask(task.id)

        const delBtn = document.createElement('button')
        delBtn.innerText = 'Törlés'
        delBtn.className = 'delete_btn'
        delBtn.onclick = () => deleteTask(task.id)
        btn_group.appendChild(delBtn)
    }

    footer.appendChild(spanImportance)
    footer.appendChild(btn_group)

    div.appendChild(h4)
    div.appendChild(desc)
    div.appendChild(footer)

    return div
}

document.addEventListener('DOMContentLoaded', loadTasks)

async function markTaskDone(id) {
    try {
        const response = await apiFetch('http://localhost:4000/api/marktaskdone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ task_id: id })
        })
        loadTasks()
    }
    catch (error) {
        console.error(error)
    }
}

async function restoreTask(id) {
    try {
        const response = await apiFetch('http://localhost:4000/api/restoretask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ task_id: id })
        })
        loadTasks()
    }
    catch (error) {
        console.error(error)
    }
}

async function deleteTask(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a feladatot?")) return

    try {
        const response = await apiFetch('http://localhost:4000/api/deletetask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ task_id: id })
        })
        loadTasks()
    }
    catch (error) {
        console.error(error)
    }


}

function enableEditMode(id, card_div, editBtn) {
    const titleElement = card_div.querySelector('.task-title')
    const descElement = card_div.querySelector('.task-desc')

    titleElement.contentEditable = "true"
    descElement.readOnly = false
    descElement.focus()
    card_div.classList.add('editing')
    editBtn.innerText = "Mentés"
    editBtn.classList.add('btn-success')
    editBtn.onclick = () => saveTask(id, card_div, editBtn)
}

async function saveTask(id, card_div, saveBtn) {
    try {
        const titleElement = card_div.querySelector('.task-title')
        const descElement = card_div.querySelector('.task-desc')
        const importanceSpan = card_div.querySelector('.task-footer span')
        const newTitle = titleElement.innerText
        const newDesc = descElement.value
        const importanceValue = importanceSpan.dataset.value

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
        })

        loadTasks()
    }
    catch (error) {
        console.error(error)
    }
}

//statisztika 
function updateStatisticsChart() {
    const tasks = document.querySelectorAll('.task-card')

    let counts = {
        high: 0,
        medium: 0,
        low: 0,
        done: 0
    }

    tasks.forEach(task => {
        const isCompleted = task.classList.contains('completed')

        if (isCompleted) {
            counts.done++
        } else {

            const importance = task.classList[1]
            if (counts.hasOwnProperty(importance)) {
                counts[importance]++
            }
        }
    })

    const total = counts.high + counts.medium + counts.low + counts.done
    const caption = document.getElementById('caption')

    if (total == 0) {
        // alapertelmezetten a szurke legyen 100%
        const circleElement = document.querySelector('.circle')
        circleElement.style.setProperty('--high-p', '0%')
        circleElement.style.setProperty('--medium-p', '0%')
        circleElement.style.setProperty('--low-p', '0%')
        circleElement.style.setProperty('--done-p', '100%')

        caption.innerText = `Összes: ${total} | Magas: ${counts.high} | Közepes: ${counts.medium} | Alacsony: ${counts.low} | Kész: ${counts.done}`
    }

    // ertekek szamolasa es cssbe helyezes
    const highP = (counts.high / total * 100).toFixed(1)
    const mediumP = (counts.medium / total * 100).toFixed(1)
    const lowP = (counts.low / total * 100).toFixed(1)
    const doneP = (counts.done / total * 100).toFixed(1)

    const circleElement = document.querySelector('.circle')
    circleElement.style.setProperty('--high-p', highP + '%')
    circleElement.style.setProperty('--medium-p', mediumP + '%')
    circleElement.style.setProperty('--low-p', lowP + '%')
    circleElement.style.setProperty('--done-p', doneP + '%')

    caption.innerText = `Magas: ${counts.high} | Közepes: ${counts.medium} | Alacsony: ${counts.low} | Kész: ${counts.done}`

}

updateStatisticsChart()

// Event listener a statisztika select-re
document.getElementById('stat_select').addEventListener('change', function() {
    const selectedValue = this.value
    const circleStats = document.querySelector('.circle_stats')
    const studyTime = document.querySelector('.study_time')
    const headlines = document.querySelector('.h3_statistics_headlines')

    if (selectedValue === 'hide') {
        circleStats.style.display = 'none'
        studyTime.style.display = 'none'
        headlines.style.display = 'none'
    } else {
        circleStats.style.display = 'flex'
        studyTime.style.display = 'flex'
        headlines.style.display = 'flex'
    }
})