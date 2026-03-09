const API = 'http://localhost:4000/api';
const token = localStorage.getItem('token');

if (!token) window.location.href = '../html/index.html';

async function loadUsers() {
    const data = await apiFetch(`${API}/admin/users`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    data.users.forEach(u => {
        const tr = document.createElement('tr');
        tr.id = `row-${u.id}`;

        // ID
        const tdId = document.createElement('td');
        tdId.innerHTML = `<span class="badge bg-secondary">${u.id}</span>`;

        // Username
        const tdUsername = document.createElement('td');
        const inputUsername = document.createElement('input');
        inputUsername.type = 'text';
        inputUsername.className = 'form-control form-control-sm';
        inputUsername.value = u.username;
        inputUsername.disabled = true;
        tdUsername.appendChild(inputUsername);

        // Email
        const tdEmail = document.createElement('td');
        const inputEmail = document.createElement('input');
        inputEmail.type = 'email';
        inputEmail.className = 'form-control form-control-sm';
        inputEmail.value = u.email;
        inputEmail.disabled = true;
        tdEmail.appendChild(inputEmail);

        // Profilkép
        const tdPic = document.createElement('td');
        const inputPic = document.createElement('input');
        inputPic.type = 'text';
        inputPic.className = 'form-control form-control-sm';
        inputPic.value = u.profil_pic_url || '';
        inputPic.disabled = true;
        tdPic.appendChild(inputPic);

        // Módosítás gomb
        const tdEdit = document.createElement('td');
        tdEdit.className = 'text-center';
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn btn-outline-warning btn-sm me-1';
        btnEdit.innerHTML = 'Szerkesztés';
        btnEdit.onclick = () => {
            const editing = inputUsername.disabled === false;
            if (!editing) {
                // szerkesztés mód bekapcsolása
                inputUsername.disabled = false;
                inputEmail.disabled = false;
                inputPic.disabled = false;
                btnEdit.className = 'btn btn-success btn-sm me-1';
                btnEdit.innerHTML = 'Mentés';
            } else {
                // mentés
                saveUser(u.id, inputUsername.value.trim(), inputEmail.value.trim(), inputPic.value.trim(), inputUsername, inputEmail, inputPic, btnEdit);
            }
        };
        tdEdit.appendChild(btnEdit);

        // Törlés gomb
        const tdDelete = document.createElement('td');
        tdDelete.className = 'text-center';
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn btn-outline-danger btn-sm';
        btnDelete.innerHTML = 'Törlés';
        btnDelete.onclick = () => deleteUser(u.id, u.username, tr);
        tdDelete.appendChild(btnDelete);

        tr.append(tdId, tdUsername, tdEmail, tdPic, tdEdit, tdDelete);
        tbody.appendChild(tr);
    });

    document.getElementById('user-count').textContent = `${data.users.length} felhasználó`;
}

async function saveUser(id, username, email, profil_pic_url, inputUsername, inputEmail, inputPic, btnEdit) {
    try {
        lengthtest(username, 3, 100);
        lengthtest(email, 5, 255);

        await apiFetch(`http://localhost:4000/api/admin/update_user`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ user_id: id, username, email, profil_pic_url })
        });

        inputUsername.disabled = true;
        inputEmail.disabled = true;
        inputPic.disabled = true;
        btnEdit.className = 'btn btn-outline-warning btn-sm me-1';
        btnEdit.innerHTML = 'Szerkesztés';
    } catch (err) {
        console.log(err);
    }
}

async function deleteUser(id, username, tr) {
    if (!confirm(`Biztosan törlöd a(z) "${username}" felhasználót?`)) return;
    try {
        await apiFetch(`http://localhost:4000/api/admin/delete_user`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ user_id: id })
        });
        tr.remove();
        const countEl = document.getElementById('user-count');
        const current = parseInt(countEl.textContent) || 0;
        countEl.textContent = `${current - 1} felhasználó`;
    } catch (err) {
        console.log(err);
    }
}

loadUsers();