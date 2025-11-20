async function felhasznalo_betoltes() {
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/szerkesztes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    });
    if (response.status === 200) {
        const data = await response.json()
        document.getElementById("szerkusername").value = data.username
        document.getElementById("szerkemail").value = data.email
        document.getElementById("szerkprofilpic").src = data.profil_pic_url
    } else if (response.status === 401 || response.status === 403) {
        logout();
    }

}



//kep valtoztatasa (a modal/overlay fullosan mukodik)
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