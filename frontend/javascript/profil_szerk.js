async function load_user() {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("/api/edit_user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        document.getElementById("editusername").value = result.username;
        document.getElementById("editemail").value = result.email;
        document.getElementById("editprofilpic").src = result.profil_pic_url;
    } catch (err) {
        console.error(err);
    }
}



document.getElementById("edit_user").addEventListener("submit", async function (e) {
    e.preventDefault();
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
        const result = await index_apiFetch("/api/edit_user_save", {
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
        console.error(error);
    }
}

function delete_profile() {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "confirm-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "confirm-modal-content confirm-delete-modal-content";

    const title = document.createElement("h3");
    title.className = "confirm-delete-modal-title";

    title.textContent = "Profil törlése";
    const message = document.createElement("p");
    message.className = "confirm-delete-modal-text";
    message.textContent = "FIGYELEM: Ez a művelet nem visszavonható!";
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = "Írja be a jelszavát a megerősítéshez:";
    input.className = "confirm-delete-input";
    input.required = true;

    const actionDiv = document.createElement("div");
    actionDiv.className = "confirm-delete-action-div";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.classList.add("confirm-button", "confirm-delete-cancel");
    cancelBtn.textContent = "Mégse";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.classList.add("confirm-button", "confirm-delete-confirm");
    confirmBtn.textContent = "TÖRLÉS";
    cancelBtn.onclick = () => { document.body.removeChild(modalOverlay); };

    confirmBtn.onclick = async () => { delete_confirmed(); };

    actionDiv.append(cancelBtn, confirmBtn);
    modalContent.append(title, message, input, actionDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

async function delete_confirmed() {
    try {
        const password = document.querySelector(".confirm-delete-input").value;
        const token = localStorage.getItem('token');
        lengthtest(password, 6, 255);
        await index_apiFetch("/api/delete_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ password: password })
        });
        logout();
    } catch (err) {
        console.error(err);
    }
}