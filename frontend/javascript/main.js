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
    p.innerHTML = text;
    t.appendChild(p);
    document.body.appendChild(t);
    setTimeout(() => {
        t.remove();
    }, time * 1000);
}

