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

async function kepbetoltes(){
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/szerkesztes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    });
    if (response.status === 200) {
        const data = await response.json()        
        document.getElementById("navbar_profil_pic_url").src = data.profil_pic_url
        document.getElementById("felhasznalonev").textContent = data.username
    } else if (response.status === 401 || response.status === 403) {
        logout();
    }
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

window.onload = kepbetoltes()