const pool = require('../sql/database');

async function userexists(email, username) {
    return await pool.query("SELECT email, username FROM users WHERE email= ? or username=?", [email, username]);
}

async function newuser(username, email, password, profil_pic_url) {
    await pool.query("INSERT INTO users (username, email, password, profil_pic_url) VALUES (?,?,?,?)", [username, email, password, profil_pic_url])
    return await pool.query("SELECT id FROM users WHERE email= ?", [email]);
}

async function userbyemail(email) {
    return await pool.query("SELECT * FROM users WHERE email = ?", [email]);
}

async function userbyid(id) {
    return await pool.query("SELECT username, email, profil_pic_url, password FROM users WHERE id = ?", [id]);
}

async function updateuser(rows, ujadatok, kit) {
    let valtoztatas = updatebuild(rows, ujadatok);
    for (let i = 0; i < valtoztatas.length; i++) {
        if(valtoztatas[i][0] === "username" || valtoztatas[i][0] === "email"){
            const [exists] = await isexist(valtoztatas[i]);
            if(exists.length > 0){
                throw new Error(`A ${valtoztatas[i][1]} már foglalt!`);
            }
            else{
                await pool.query(`UPDATE users SET ${valtoztatas[i][0]} = ?  WHERE id=?`, [valtoztatas[i][1], kit]);
            }
        }
        else{
            await pool.query(`UPDATE users SET ${valtoztatas[i][0]} = ?  WHERE id=?`, [valtoztatas[i][1], kit]);
        }
        
    }
    
}

function updatebuild(rows, ujadatok) {
    let valtoztatas = []
    if (rows[0].username != ujadatok.username) {
        valtoztatas.push(["username", ujadatok.username])
    }
    if (rows[0].email != ujadatok.email) {
        valtoztatas.push(["email", ujadatok.email])
    }
    if (rows[0].profil_pic_url != `../img/allatos_profilkepek/${ujadatok.newprofil_pic_url}`) {
        valtoztatas.push(["profil_pic_url", `../img/allatos_profilkepek/${ujadatok.newprofil_pic_url}`])
    }
    if(ujadatok.newpassword.length > 0){
        valtoztatas.push(["password", ujadatok.newpassword])
    }
    return valtoztatas;
}

async function isexist(data){
    return await pool.query(`SELECT ${data[0]} FROM users WHERE ${data[0]} = ?`, [data[1]]);
}

//innentől kezdődnek a todo queryk
async function TaskAdd(user_id, headline, description, priority){
    return await pool.query("INSERT INTO tasks (user_id, headline, description, priority) VALUES (?,?,?,?)", [user_id, headline, description, priority])
}


module.exports = {
    userexists,
    newuser,
    userbyemail,
    userbyid,
    updateuser,
    TaskAdd
};