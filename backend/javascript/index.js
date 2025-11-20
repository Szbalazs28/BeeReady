const card = document.querySelector('.card');
const loginDiv = document.querySelector('#regdiv');
const signinDiv = document.querySelector('#logdiv');
const forgetDiv = document.querySelector('#forget_password_div');


// Ha az „Elfelejtettem a jelszavam”-ra rákattintunk, a másik két div eltűnik, viszont a másik kettő cserélgeti egymást
function login_register() {
    const isLoginVisible = loginDiv.style.display === 'block' || loginDiv.style.display === '';

    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
        if (isLoginVisible) {
            loginDiv.style.display = 'none';
            signinDiv.style.display = 'block';
            forgetDiv.style.display = 'none';
        } else {
            signinDiv.style.display = 'none';
            loginDiv.style.display = 'block';
            forgetDiv.style.display = 'none';
        }

        card.classList.remove('fade-out');
        card.classList.add('fade-in');
    }, 200);
}

function forget_Password() {
    let isFPassVisible = loginDiv.style.display === 'block' || loginDiv.style.display === '';

    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
        if (isFPassVisible) {
            loginDiv.style.display = 'none';
            signinDiv.style.display = 'block';
            forgetDiv.style.display = 'none';
        } else {
            signinDiv.style.display = 'none';
            loginDiv.style.display = 'none';
            forgetDiv.style.display = 'block';
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
    
    const response = await fetch("http://localhost:4000/regisztracio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, profil_pic_url: `../img/allatos_profilkepek/${profil_pic_url[profil_pic_url.length-1]}`})
    });
    message = await response.json()    
    if (message.success) {
        login_register();
        uzenet.innerHTML = "Sikeres regisztráció! Jelentkezzen be!"
    }
    else{
        uzenet.innerHTML = ""
        let hibak = message.hibak
        let uzenet_szoveg = ""
        for (let hiba in hibak) {
            uzenet_szoveg += hibak[hiba] + "<br>"
            uzenet.innerHTML = uzenet_szoveg
        }
    }

});
document.getElementById("loginform").addEventListener("submit", async function (e) {
    e.preventDefault();
    const stay = document.getElementById("stay").chechked;
    const email = document.getElementById("logemail").value;
    const password = document.getElementById("logpassword").value;

    const response = await fetch("http://localhost:4000/bejelentkezes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, stay })
    });
    message = await response.json()
    if (message.success) {
        localStorage.setItem("token", message.token);
        window.location.href = message.redirect;
    } else {
        uzenet.innerHTML = message.message;
    }

});