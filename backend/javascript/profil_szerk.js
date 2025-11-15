async function felhasznalo_betoltes(){
    const response = await fetch("http://localhost:4000/szerkesztes")
    const adat = await response.json()
    document.getElementById("szerkusername").value = adat.username
    document.getElementById("szerkemail").value = adat.email
}