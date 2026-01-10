function navbar_click(id, sorszam) {
    document.querySelectorAll(".mainelem").forEach(element => {
        if (!element.classList.contains("dnone")) {
            element.classList.add("dnone")
        }
    })
    document.querySelectorAll(".nav_items").forEach(element => {
        if (element.classList.contains("active")) {
            element.classList.remove("active")
        }
    })
    document.querySelector(`.nav_items_div > div:nth-child(${sorszam})`).classList.add("active")
    document.getElementById(id).classList.remove("dnone")
    document.getElementById("navbar").classList.remove("nav_open");
    if (document.querySelector(".hamburger").classList.contains("dnone")) {
        document.querySelector(".hamburger").classList.remove("dnone");
    }

}

async function kepbetoltes() {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/szerkesztes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });        
        document.getElementById("navbar_profil_pic_url").src = result.profil_pic_url
        document.getElementById("felhasznalonev").textContent = result.username
    } catch (err) {
        console.error(err);        
    }

}

function toggleMenu() {
    const navbar = document.getElementById("navbar");
    const hamburger = document.querySelector(".hamburger");

    navbar.classList.toggle("nav_open");
    if (navbar.classList.contains("nav_open")) {
        hamburger.classList.add("dnone");
    }
}

window.onload = kepbetoltes