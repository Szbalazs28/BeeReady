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

async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const data = await response.json().catch(() => ({})); // A catch a nem JSON válaszok kezelésére szolgál

            if (response.status === 429) {
                alertell("Túl sok kérés. Kérem, várjon egy percet.", 5);
            } else if (response.status === 403) {
                alertell("Lejárt munkamenet. Jelentkezz be újra.", 5);
                logout();
            }else if (response.status === 401){
                alertell("Hozzáférés megtagadva. Kérjük, jelentkezzen be!", 5);
                logout();
            }
             else {
                alertell(data.message || "Szerverhiba történt.", 5);
            }

            throw new Error(`HTTP ${response.status}`);            
        }

        return await response.json();

    } catch (err) {
        console.error(err);
        alertell("Sikertelen csatlakozás a szerverhez!", 5);
        throw err;
    }
}


