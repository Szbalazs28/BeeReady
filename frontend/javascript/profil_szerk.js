async function load_user() {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/edit_user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });

        
        document.getElementById("editusername").value = result.username
        document.getElementById("editemail").value = result.email
        document.getElementById("editprofilpic").src = result.profil_pic_url
    } catch (err) {
        console.error(err);
    }
}

document.getElementById("edit_user").addEventListener("submit", function (e) {
    e.preventDefault()
    mentes();
});

//kep valtoztatasa (a modal/overlay fullosan mukodik)
const profilpic = document.getElementById("prof_img");
const modal = document.getElementById("profil_modal");
const close = document.getElementById("close");
const images = document.querySelectorAll(".avatar_option");
const src = profilpic.querySelector("img");

profilpic.addEventListener("click", () => {
    modal.style.display = "flex";
});

close.addEventListener("click", () => {
    modal.style.display = "none";
});

images.forEach(character => {
    character.addEventListener("click", () => {
        const newcharacter = character.src;
        src.src = newcharacter;
        modal.style.display = "none";
    });
});

async function mentes() {
    const email = document.getElementById("editemail").value;
    const password = document.getElementById("currentpassword").value;
    const newpassword = document.getElementById("newpassword").value;
    const username = document.getElementById("editusername").value;
    const newprofil_pic_url = document.getElementById("editprofilpic").src.split("/");

    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/edit_user_mentes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, newpassword, username, newprofil_pic_url: newprofil_pic_url[newprofil_pic_url.length - 1] })
    });
    message = await response.json()
    if (response.status === 200) {
        await load_user();
        await load_image();
        alertell(message.message, 2.5);
    }
    else {
        if (message.issues && Object.keys(message.issues).length > 0) {
            let ido = 0.5;
            let tartalom = ""
            for (let errormessages of Object.values(message.issues)) {
                tartalom += `${errormessages}<br>`
                ido++
            }
            alertell(tartalom, ido);
        }
        else {
            if (message.message) {
                // Ha nincs issues objektum, de van message, azt jelenítjük meg
                alertell(message.message, 2.5);
            }
            else {
                // Ha egyik sem áll rendelkezésre, általános hibaüzenet
                alertell("Ismeretlen hiba történt!", 2.5);
            }
        }

    }
}