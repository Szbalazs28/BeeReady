

async function felhasznalo_betoltes() {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/szerkesztes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });

        
        document.getElementById("szerkusername").value = result.username
        document.getElementById("szerkemail").value = result.email
        document.getElementById("szerkprofilpic").src = result.profil_pic_url
    } catch (err) {
        console.error(err);
    }
}



document.getElementById("szerkesztes").addEventListener("submit", function (e) {
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
    const response = await fetch("http://localhost:4000/api/szerkesztes_mentes", {
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
            let tartalom = ""
            for (let hibaUzenet of Object.values(message.hibak)) {
                tartalom += `${hibaUzenet}<br>`
                ido++
            }
            alertell(tartalom, ido);
        }
        else {
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

