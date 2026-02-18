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



document.getElementById("edit_user").addEventListener("submit", async function (e) {
    e.preventDefault()
    await mentes();
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
    try {
        const email = document.getElementById("editemail").value;
        const password = document.getElementById("currentpassword").value;
        const newpassword = document.getElementById("newpassword").value;
        const username = document.getElementById("editusername").value;
        const newprofil_pic_url = document.getElementById("editprofilpic").src.split("/");

        const token = localStorage.getItem('token');
        const result = await index_apiFetch("http://localhost:4000/api/edit_user_save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: email, password: password, newpassword: newpassword, username: username, newprofil_pic_url: newprofil_pic_url[newprofil_pic_url.length - 1] })
        });
        await load_user();
        await load_image();
    } catch (error) {
        console.error(error)
    }
}

