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


document.getElementById("regform").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        const email = document.getElementById("regemail").value;
        const password = document.getElementById("regpassword").value;
        const username = document.getElementById("regusername").value;
        const profil_pic_url = document.getElementById("profil_pic_url").src.split("/");

        const result = await index_apiFetch("http://localhost:4000/api/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, profil_pic_url: `../img/allatos_profilkepek/${profil_pic_url[profil_pic_url.length - 1]}` })
        });

        localStorage.setItem("token", result.token);
        window.location.href =  result.redirect;
    } catch (error) {
        console.error(error)
    }



});
document.getElementById("loginform").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        const stay = document.getElementById("stay").checked;
        const email = document.getElementById("logemail").value;
        const password = document.getElementById("logpassword").value;

        const result = await index_apiFetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, stay })
        });
        localStorage.setItem("token", result.token);
        window.location.href = result.redirect;
    } catch (error) {
        console.error(error)
    }
});



//profilvalto 
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

