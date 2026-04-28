function logout() {
    clearInterval(logoutIntervalId);
    sessionStorage.removeItem("modal_showed");
    localStorage.removeItem('token');
    window.location.href = "../html/index.html";
}
let logoutIntervalId;

function alertell(text, time) {
    if (time < 2.5) {
        time = 2.5;
    }
    const t = document.createElement("div");
    t.className = "alertell";
    let p = document.createElement("p");
    p.textContent = text;
    t.appendChild(p);
    document.body.appendChild(t);
    setTimeout(() => {
        t.remove();
    }, time * 1000);
}

async function start_logout_timer(wich = false) {
    try {
        const result = await index_apiFetch("/api/get_expire_time", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        let time_left = parseInt(result.time_left);
        clearInterval(logoutIntervalId);
        logoutIntervalId = setInterval(() => {
            time_left--;
            if (time_left <= 0) {
                logout();
            }
            else {
                if (time_left <= 60) {
                    if (sessionStorage.getItem("modal_showed") != "true") {
                        if (wich) {
                            b_extend_time_modal();
                        }
                        else {
                            extend_time_modal();
                        }

                        sessionStorage.setItem("modal_showed", "true");
                    }
                }
                if (time_left <= 5) {
                    alertell(`A munkamenet ${time_left} másodpercen belül lejár!`, 1);
                }
            }
        }, 1000);
    } catch (error) {
        console.error("Hiba a munkamenet időzítőjének indításakor:", error);
    }
}

function extend_time_modal() {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "quiz-modal-overlay";
    const modalContent = document.createElement("div");
    modalContent.className = "quiz-modal-content quiz-delete-modal-content";
    const title = document.createElement("h3");
    title.className = "quiz-delete-modal-title";
    title.textContent = "Munkamenet meghosszabbítása";
    const message = document.createElement("p");
    message.className = "quiz-delete-modal-text";
    message.textContent = "Figyelem! A munkamenet 60 másodpercen belül lejár, szeretné meghosszabbítani?";
    const actionDiv = document.createElement("div");
    actionDiv.className = "quiz-delete-action-div";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.classList.add("quiz-create-button", "quiz-delete-cancel");
    cancelBtn.textContent = "Nem";
    cancelBtn.onclick = () => {
        const modal = document.querySelector(".quiz-modal-overlay");
        document.body.removeChild(modal);
    };
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.id = "extend_time_btn";
    confirmBtn.classList.add("quiz-create-button", "quiz-delete-confirm");
    confirmBtn.textContent = "Igen";
    confirmBtn.onclick = async () => { extend_time(); document.body.removeChild(modalOverlay); };

    actionDiv.append(cancelBtn, confirmBtn);
    modalContent.append(title, message, actionDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function b_extend_time_modal() {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.tabIndex = -1;

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-dialog-centered";


    const content = document.createElement("div");
    content.className = "modal-content rounded-4 shadow";


    const header = document.createElement("div");
    header.className = "modal-header";

    const title = document.createElement("h5");
    title.className = "modal-title";
    title.textContent = "Munkamenet meghosszabbítása";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close";
    closeBtn.setAttribute("data-bs-dismiss", "modal");

    header.append(title, closeBtn);


    const body = document.createElement("div");
    body.className = "modal-body";
    body.innerHTML = `
        Figyelem! A munkamenet 60 másodpercen belül lejár.<br>
        Szeretné meghosszabbítani?
    `;


    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-outline-secondary";
    cancelBtn.textContent = "Nem";
    cancelBtn.setAttribute("data-bs-dismiss", "modal");

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn btn-primary";
    confirmBtn.textContent = "Igen";


    confirmBtn.onclick = async () => {
        await extend_time();
        bsModal.hide();
    };

    footer.append(cancelBtn, confirmBtn);


    content.append(header, body, footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);


    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();


    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

async function extend_time() {
    try {
        const result = await apiFetch("/api/get_extended_time", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        localStorage.setItem("token", result.token);
        start_logout_timer();
    } catch (error) {
        console.error(error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function speclengthtest(input, min, max, text) {
    if (input.length < min || input.length > max) {
        alertell(`${text}  ${min} és ${max} karakter között kell lennie!`, 2.5);
        throw new Error(`${text} ${min} és ${max} karakter között kell lennie!`);
    }
}

function lengthtest(input, min, max) {
    if (input.length < min || input.length > max) {
        alertell(`A hossznak ${min} és ${max} karakter között kell lennie!`, 2.5);
        throw new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
    }
}

function timetest(start, end) {
    if (start.length < 5 || end.length < 5 || start[2] !== ':' || end[2] !== ':') {
        alertell("Az időpontnak HH:MM formátumúnak kell lennie!", 2.5);
        throw new Error("Az időpontnak HH:MM formátumúnak kell lennie!");
    }
    else {
        if (start >= end) {
            alertell("A kezdési időpontnak kisebbnek kell lennie, mint a befejezésinek!", 2.5);
            throw new Error("A kezdési időpontnak kisebbnek kell lennie, mint a befejezésinek!");
        }
    }

}

function random_array(array) {
    let random_numbers = [];
    while (random_numbers.length != array.length) {
        let randnumber = getRandomInt(0, array.length);
        if (!random_numbers.includes(randnumber)) {
            random_numbers.push(randnumber);
        }
    }
    return random_numbers;
}

async function index_apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status === 429) {
                alertell("Túl sok kérés. Kérem, várjon egy percet.", 5);
            }

            else if (response.status === 400) {
                alertell(data.message || "Hibás kérés.", 5);
            }
            else if (response.status === 409) {
                alertell(data.message || "Hibás adat!", 5);

            }
            else if (response.status === 403) {
                alertell(data.message || "Hibás jelszó!", 5);
            }
            else {
                alertell("Szerverhiba történt.", 5);
            }

            let err = new Error(`HTTP ${response.status}`);
            err.status = response.status;
            throw err;

        }
        else {
            if (data.write) {
                alertell(data.message || "Sikeres művelet!", 2.5);
            }

        }
        return data;
    } catch (error) {
        if (!error.status) {
            console.error("Hálózati hiba:", error);
            alertell("Sikertelen csatlakozás a szerverhez!", 5);
        }
        throw error;
    }
}
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            // A catch a nem JSON válaszok kezelésére szolgál

            if (response.status === 429) {
                alertell("Túl sok kérés. Kérem, várjon egy percet.", 5);
            } else if (response.status === 403) {
                alertell("Lejárt a munkamenet. Jelentkezz be újra.", 5);
                logout();
            } else if (response.status === 401) {
                alertell("Hozzáférés megtagadva. Kérjük, jelentkezzen be!", 5);
                logout();
            }
            else if (response.status === 400) {
                if (data.message == "Nincs ilyen megosztási kód!") {
                    alertell(data.message, 5);
                }
                else {
                    alertell(data.message || "Hibás kérés.", 5);
                }


            }
            else if (response.status === 409) {
                alertell(data.message || "Hibás adat!", 5);

            }
            else {
                alertell("Szerverhiba történt.", 5);
            }

            let err = new Error(`HTTP ${response.status}`);
            err.status = response.status;
            throw err;
        }
        else {
            if (data.write) {
                alertell(data.message || "Sikeres művelet!", 2.5);
            }

        }

        return data;

    } catch (err) {
        if (!err.status) {
            console.error("Hálózati hiba:", err);
            alertell("Sikertelen csatlakozás a szerverhez!", 5);
        }
        throw err;
    }
}
