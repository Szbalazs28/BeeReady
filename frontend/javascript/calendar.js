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