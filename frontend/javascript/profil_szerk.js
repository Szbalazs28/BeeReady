function alertell(text, time) {
    if (time < 2.5) {
        time = 2.5;
    }
    const t = document.createElement("div");
    t.className = "alertell";
    let p = document.createElement("p");
    p.innerHTML = text;
    t.appendChild(p);
    document.body.appendChild(t);
    setTimeout(() => {
        t.remove();
    }, time * 1000);
}

async function felhasznalo_betoltes() {
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
        document.getElementById("szerkusername").value = data.username
        document.getElementById("szerkemail").value = data.email
        document.getElementById("szerkprofilpic").src = data.profil_pic_url
    } else if (response.status === 401 || response.status === 403) {
        logout();
    }

}

function logout() {
    localStorage.removeItem('token');
    window.location.href = "../html/index.html";
}

document.getElementById("szerkesztes").addEventListener("submit", function(e) {
    e.preventDefault() 
    mentes();
});


//kep valtoztatasa (a modal/overlay fullosan mukodik)
const profilkep = document.getElementById("prof_img");
const modal = document.getElementById("profil_modal");
const close = document.getElementById("close");
const kepek = document.querySelectorAll(".avatar_option");
const src = profilkep.querySelector("img");

profilkep.addEventListener("click", () => {
    modal.style.display = "flex";
});

close.addEventListener("click", () => {
    modal.style.display = "none";
});

kepek.forEach(karakter => {
    karakter.addEventListener("click", () => {
        const uj = karakter.src;
        src.src = uj;
        modal.style.display = "none";
    });
});

async function mentes() {


    const email = document.getElementById("szerkemail").value;
    const password = document.getElementById("currentpassword").value;
    const newpassword = document.getElementById("newpassword").value;
    const username = document.getElementById("szerkusername").value;
    const newprofil_pic_url = document.getElementById("szerkprofilpic").src.split("/");

    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/szerkesztes_mentes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, newpassword, username, newprofil_pic_url: newprofil_pic_url[newprofil_pic_url.length - 1] })
    });
    message = await response.json()
    if (response.status === 200) {
        await felhasznalo_betoltes();
        await kepbetoltes();
        alertell(message.message, 2.5);
    }
    else {
        if (message.hibak && Object.keys(message.hibak).length > 0) {
            let ido = 0.5;
            let tartalom = "A jelszónak: <br>"
            for (let hibaUzenet of Object.values(message.hibak)) {
                tartalom += `${hibaUzenet}<br>`
                ido++
            }
            alertell(tartalom, ido);
        }
        else{ 
            if (message.message) {
            // Ha nincs hibak objektum, de van message, azt jelenítjük meg
            alertell(message.message, 2.5);
            }
            else {
            // Ha egyik sem áll rendelkezésre, általános hibaüzenet
            alertell("Ismeretlen hiba történt!", 2.5);
            }
        } 

    }



}