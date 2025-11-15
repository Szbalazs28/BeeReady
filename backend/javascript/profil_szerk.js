async function felhasznalo_betoltes(){
    const response = await fetch("http://localhost:4000/szerkesztes")
    const adat = await response.json()
    document.getElementById("szerkusername").value = adat.username
    document.getElementById("szerkemail").value = adat.email
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