function logout() {
    localStorage.removeItem('token');
    window.location.href = "../html/index.html";
}

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}



<<<<<<< HEAD
function lengthtest(input, min, max) {
    if (input.length < min || input.length > max) {
        alertell(`A hossznak ${min} és ${max} karakter között kell lennie!`, 2.5);
        throw new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
    }
}

function timetest(start, end) {
    if (start.length !== 5 || end.length !== 5 || start[2] !== ':' || end[2] !== ':') {
        alertell("Az időpontnak HH:MM formátumúnak kell lennie!", 2.5);
        throw new Error("Az időpontnak HH:MM formátumúnak kell lennie!");
    }
    else {
        if (start >= end) {
            alertell("A kezdési időpontnak kisebbnek kell lennie, mint a befejezésinek!", 2.5);
            throw new Error("A kezdési időpontnak kisebbnek kell lennie, mint a befejezésinek!");
        }
    }

=======
function lengthtest(input, min, max) {        
    if (input.length < min || input.length > max) {
        alertell(`A hossznak ${min} és ${max} karakter között kell lennie!`, 2.5);
        throw new Error(`A hossznak ${min} és ${max} karakter között kell lennie!`);
    }        
>>>>>>> fooldal
}

async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
<<<<<<< HEAD
            // A catch a nem JSON válaszok kezelésére szolgál
=======
             // A catch a nem JSON válaszok kezelésére szolgál
>>>>>>> fooldal

            if (response.status === 429) {
                alertell("Túl sok kérés. Kérem, várjon egy percet.", 5);
            } else if (response.status === 403) {
                alertell("Lejárt a munkamenet. Jelentkezz be újra.", 5);
                logout();
            } else if (response.status === 401) {
                alertell("Hozzáférés megtagadva. Kérjük, jelentkezzen be!", 5);
                logout();
            }
<<<<<<< HEAD
            else if (response.status === 400) {
=======
            else if (response.status ===400){
>>>>>>> fooldal
                alertell(data.message || "Hibás kérés.", 5);
            }
            else {
                alertell("Szerverhiba történt.", 5);
            }

<<<<<<< HEAD
            let err = new Error(`HTTP ${response.status}`);
            err.status = response.status;
            throw err;
        }
        else {
            if (data.write) {
                alertell(data.message || "Sikeres művelet!", 2.5);
            }

=======
            throw new Error(`HTTP ${response.status}`);
        }
        else{
            if(data.write){
                alertell(data.message || "Sikeres művelet!", 2.5);
            }
            
>>>>>>> fooldal
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


