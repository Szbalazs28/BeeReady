const card = document.querySelector('.card');
const regDiv = document.querySelector('#regdiv');
const signinDiv = document.querySelector('#logdiv');
const forgetDiv = document.querySelector('#forget_password_div');


// Ha az „Elfelejtettem a jelszavam”-ra rákattintunk, a másik két div eltűnik, viszont a másik kettő cserélgeti egymást
function login_register() {
    const isRegnotVisible = regDiv.classList.contains("dnone");

    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
        if (isRegnotVisible) {
            signinDiv.classList.add("dnone");
            regDiv.classList.remove("dnone");
            if (!forgetDiv.classList.contains("dnone")) {
                forgetDiv.classList.add("dnone");
            }
        } else {

            signinDiv.classList.remove("dnone");
            regDiv.classList.add("dnone");
            if (!forgetDiv.classList.contains("dnone")) {
                forgetDiv.classList.add("dnone");
            }


        }

        card.classList.remove('fade-out');
        card.classList.add('fade-in');
    }, 200);
}

function forget_Password() {
    const isFPassNOTVisible = forgetDiv.classList.contains("dnone");
    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
        if (isFPassNOTVisible) {
            signinDiv.classList.add("dnone");
            forgetDiv.classList.remove("dnone");
        } else {
            forgetDiv.classList.add("dnone");
            signinDiv.classList.remove("dnone");
        }

        card.classList.remove('fade-out');
        card.classList.add('fade-in');
    }, 200);
}

let uzenet = document.getElementById("uzenet")
document.getElementById("regform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("regemail").value;
    const password = document.getElementById("regpassword").value;
    const username = document.getElementById("regusername").value;
    const profil_pic_url = document.getElementById("profil_pic_url").src.split("/");

    const response = await fetch("http://localhost:4000/api/regisztracio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, profil_pic_url: `../img/allatos_profilkepek/${profil_pic_url[profil_pic_url.length - 1]}` })
    });
    message = await response.json()
    if (message.success) {
        localStorage.setItem("token", message.token);
        window.location.href = message.redirect;
        alertell("Sikeres regisztráció!", 2.5);
    }
    else {
        if (Object.keys(message).includes("message")) {
            alertell(message.message, 2.5);
        }
        else {
            let ido = 0.5;
            let tartalom = ""
            for (let hibaUzenet of Object.values(message.hibak)) {
                tartalom += `${hibaUzenet}<br>`
                ido++
            }
            alertell(tartalom, ido);
        }

    }

});
document.getElementById("loginform").addEventListener("submit", async function (e) {
    e.preventDefault();
    const stay = document.getElementById("stay").checked;
    const email = document.getElementById("logemail").value;
    const password = document.getElementById("logpassword").value;

    const response = await fetch("http://localhost:4000/api/bejelentkezes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, stay })
    });
    message = await response.json()
    if (response.status === 200) {        
        localStorage.setItem("token", message.token);
        window.location.href = message.redirect;
    } else if (response.status === 429) {
        // RATE LIMIT VÁLASZ
        alertell(message.message, 5); 
    } else {
        //Egyéb hibák (409, 500)
        alertell(message.message, 2.5);
    }
});

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

//profilvalto 
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

