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

    dates.innerHTML = res
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

    // Számold meg a feladatokat
    tasks.forEach(task => {
        const importance = task.classList[1]
        if (counts.hasOwnProperty(importance)) {
            counts[importance]++
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

        return

        /*
            circleElement.style.backgroundImage = `
            radial-gradient(#F8F8F8 40%, transparent 0 70%, #F8F8F8 0),
            conic-gradient(from 20deg,
                #ef4444 0 25%, 
                #F1B43C 25% 50%, 
                #10b981 50% 75%, 
                #6b7280 75% 100%
            )` 
        */
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

    caption.innerText = `Összes: ${total} | Magas: ${counts.high} | Közepes: ${counts.medium} | Alacsony: ${counts.low} | Kész: ${counts.done}`

}

updateStatisticsChart()