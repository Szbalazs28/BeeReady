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

    document.getElementById("navbar").classList.remove("nav_open");
}

function toggleMenu() {
    const navbar = document.getElementById("navbar");
    const hamburger = document.querySelector(".hamburger");

    navbar.classList.toggle("nav_open");
    if(navbar.classList.contains("nav_open")){
        hamburger.classList.add("dnone");
    } else {
        hamburger.classList.remove("dnone");
    }
}

