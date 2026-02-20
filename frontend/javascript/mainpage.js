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

let timer = null
let isRunning = false
let timeLeft = 5 * 60
const timerDisplay = document.getElementById('timer_display')
const startB = document.getElementById('start_timer')
const pauseB = document.getElementById('stop_timer')
const resetB = document.getElementById('reset_timer')
const timerSelect = document.getElementById('timer_select')

const DEFAULT_POMODORO = 25 * 60

function CustomInput() {
    if (!document.getElementById('timer_custom_minutes')) {
        const input = document.createElement('input')
        input.type = 'text'
        input.id = 'timer_custom_minutes'
        input.placeholder = 'Perc (pl. 10)'
        input.style.width = '90px'
        input.style.marginRight = '8px'
        input.style.display = 'none'
        timerSelect && timerSelect.after(input)
        input.addEventListener('change', () => {
            if (mode === 'custom' && !isRunning) {
                const mins = parseInt(input.value, 10)
                if (!isNaN(mins) && mins > 0) {
                    timeLeft = Math.max(1, mins) * 60
                    updateDisplay()
                }
            }
        })
    }
}

function applyMode(newMode) {
    mode = newMode
    if (mode === 'pomodoro') {
        timeLeft = DEFAULT_POMODORO
        elapsed = 0
    } else if (mode === 'stopwatch') {
        elapsed = 0
        timeLeft = 0
    } else if (mode === 'custom') {
        CustomInput()
        const input = document.getElementById('timer_custom_minutes')
        const mins = parseInt(input && input.value, 10) || 5
        timeLeft = Math.max(1, mins) * 60
        elapsed = 0
        if (input) {
            input.style.display = 'inline-block'
            input.readOnly = false
        }
        if (timerDisplay) timerDisplay.style.display = 'none'
    } else {
        const input = document.getElementById('timer_custom_minutes')
        if (input) {
            input.style.display = 'none'
            input.readOnly = false
        }
        if (timerDisplay) timerDisplay.style.display = ''
    }
    if (timer) { clearInterval(timer); timer = null }
    isRunning = false
    startB.disabled = false
    pauseB.disabled = true
    updateDisplay()
}

if (timerSelect) {
    applyMode(timerSelect.value)
    timerSelect.addEventListener('change', (e) => applyMode(e.target.value))
}

function formatTime(sec) {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
}

function updateDisplay() {
    const input = document.getElementById('timer_custom_minutes')
    if (mode === 'custom' && input) {
        if (isRunning) {
            input.readOnly = true
            input.value = formatTime(Math.max(0, Math.floor(timeLeft)))
        } else {
            input.readOnly = false
            const mins = Math.max(1, Math.ceil(timeLeft / 60))
            input.value = String(mins)
        }
        if (timerDisplay) timerDisplay.style.display = 'none'
        return
    }
    if (timerDisplay) timerDisplay.style.display = ''
    if (mode === 'stopwatch') {
        timerDisplay.textContent = formatTime(Math.floor(elapsed))
    } else {
        timerDisplay.textContent = formatTime(Math.max(0, Math.floor(timeLeft)))
    }
}

function start() {
    if (!isRunning) {
        if (mode === 'custom') {
            const input = document.getElementById('timer_custom_minutes')
            if (input) {
                const raw = input.value.trim()
                let mins = parseInt(raw, 10)
                if (isNaN(mins) && raw.includes(':')) {
                    const parts = raw.split(':')
                    mins = parseInt(parts[0], 10) || 0
                }
                if (!isNaN(mins) && mins > 0) timeLeft = Math.max(1, mins) * 60
            }
            const inputElem = document.getElementById('timer_custom_minutes')
            if (inputElem) inputElem.readOnly = true
            if (timerDisplay) timerDisplay.style.display = 'none'
        }
        isRunning = true
        startB.disabled = true
        pauseB.disabled = false
        if (mode === 'stopwatch') {
            timer = setInterval(() => {
                elapsed += 1
                updateDisplay()
            }, 1000)
        } else {
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft -= 1
                    updateDisplay()
                } else {
                    clearInterval(timer)
                    timer = null
                    isRunning = false
                    const message = document.createElement('span')
                    message.className = 'timer_message'
                    message.textContent = 'Idő lejárt! Ideje egy kis szünetet tartani.'
                    timerDisplay.innerHTML = ''
                    timerDisplay.appendChild(message)
                    pauseB.disabled = true
                    startB.disabled = false
                }
            }, 1000)
        }
    } else { return }
}

function pause() {
    if (isRunning) {
        if (timer) { clearInterval(timer); timer = null }
        isRunning = false
        startB.disabled = false
        pauseB.disabled = true
        if (mode === 'custom') {
            const input = document.getElementById('timer_custom_minutes')
            if (input) input.readOnly = false
            if (timerDisplay) timerDisplay.style.display = 'none'
        }
    } else { return }
}

function reset() {
    if (timer) { clearInterval(timer); timer = null }
    isRunning = false
    startB.disabled = false
    pauseB.disabled = true
    if (mode === 'stopwatch') {
        elapsed = 0
    } else if (mode === 'pomodoro') {
        timeLeft = DEFAULT_POMODORO
    } else if (mode === 'custom') {
        const input = document.getElementById('timer_custom_minutes')
        const mins = parseInt(input && input.value, 10) || 5
        timeLeft = Math.max(1, mins) * 60
        if (input) {
            input.readOnly = false
            input.value = String(Math.max(1, Math.ceil(timeLeft / 60)))
            input.style.display = 'inline-block'
        }
        if (timerDisplay) timerDisplay.style.display = 'none'
    }
    updateDisplay()
}

updateDisplay()

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
    const div = document.createElement('div')
    div.className = `task-card ${task.importance}`
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
        'low': 'Alacsony',
        'done': 'Kész'
    }
    spanImportance.innerText = importanceHu[task.importance] || task.importance
    spanImportance.dataset.value = task.importance

    const btn_group = document.createElement('div')
    btn_group.className = 'task-actions'

    const editBtn = document.createElement('button')
    editBtn.innerText = 'Szerkesztés'
    editBtn.className = 'edit_btn'
    editBtn.onclick = () => enableEditMode(task.id, div, editBtn)

    btn_group.appendChild(editBtn)

    if (task.importance !== 'done') {
        const doneBtn = document.createElement('button')
        doneBtn.innerText = 'Kész'
        doneBtn.className = 'done_btn'
        doneBtn.title = 'Feladat kész'
        doneBtn.onclick = () => markTaskDone(task.id)
        btn_group.appendChild(doneBtn)
    } else {
        const delBtn = document.createElement('button')
        delBtn.innerText = 'Törlés'
        delBtn.className = 'delete_btn'
        delBtn.onclick = () => deleteTask(task.id)
        editBtn.disabled = true
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
    circleElement.style.setProperty('--medium-p', mediumP+ '%')
    circleElement.style.setProperty('--low-p', lowP + '%')
    circleElement.style.setProperty('--done-p', doneP + '%')

    caption.innerText = `Összes: ${total} | Magas: ${counts.high} | Közepes: ${counts.medium} | Alacsony: ${counts.low} | Kész: ${counts.done}`

}

updateStatisticsChart()