window.addEventListener('load', load_image);

function navbar_click(id, index) {
    const quiz_started = localStorage.getItem("quiz_started");
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
    document.querySelector(`.nav_items_div > div:nth-child(${index})`).classList.add("active")
    document.getElementById(id).classList.remove("dnone")
    document.getElementById("navbar").classList.remove("nav_open");
    if (document.querySelector(".hamburger").classList.contains("dnone")) {
        document.querySelector(".hamburger").classList.remove("dnone");
    }

}

function show_exit_modal() {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "quiz-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "quiz-modal-content quiz-delete-modal-content";

    const title = document.createElement("h3");
    title.className = "quiz-delete-modal-title";
    title.textContent = "Kitöltés megszakítása";

    const message = document.createElement("p");
    message.className = "quiz-delete-modal-text";
    message.textContent = "Biztosan megszakítod a kvíz kitöltését? Az kitöltés elveszik.";

    const actionDiv = document.createElement("div");
    actionDiv.className = "quiz-delete-action-div";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.classList.add("quiz-create-button", "quiz-delete-cancel");
    cancelBtn.textContent = "Mégse";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.id = "exit_quiz_btn";
    confirmBtn.classList.add("quiz-create-button", "quiz-delete-confirm");
    confirmBtn.textContent = "Kilépés";
    cancelBtn.onclick = () => {
        const modal = document.querySelector(".quiz-modal-overlay");
        if (modal) {
            document.body.removeChild(modal);
        }
    };
    confirmBtn.onclick = async () => { document.body.removeChild(modalOverlay); localStorage.setItem("quiz_started", "false"); await load_quizzes(); };
    actionDiv.append(cancelBtn, confirmBtn);
    modalContent.append(title, message, actionDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

async function load_image() {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/edit_user", {
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

