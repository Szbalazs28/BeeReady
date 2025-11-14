function navbar_click(id, sorszam) {
    document.querySelectorAll(".mainelem").forEach(element => {
        if (!element.classList.contains("dnone")) {
            element.classList.add("dnone")            
        }
    })
    document.querySelectorAll(".nav_items").forEach(element => {
        if(element.classList.contains("active")){
            element.classList.remove("active")
        }
    })
    document.querySelector(`.nav_items_div > div:nth-child(${sorszam})`).classList.add("active")
    document.getElementById(id).classList.remove("dnone")
}