document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    start_logout_timer();
    sessionStorage.removeItem("modal_showed");
    if (!token) window.location.href = '../html/index.html';
    loadUsers();
});

let Search = { search: '' };

async function loadUsers() {
    const { search } = Search;
    const url = search.trim() !== ''
        ? `http://localhost:4000/api/admin/search_users/${search.trim()}`
        : `http://localhost:4000/api/admin/users`;

    const data = await apiFetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    if (data.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Nincs találat.</td></tr>`;
        document.getElementById('user-count').textContent = `0 felhasználó`;
    }
    else{

        data.users.forEach(u => {
            const tr = document.createElement('tr');
            tr.id = `row-${u.id}`;
    
            // ID
            const tdId = document.createElement('td');
            tdId.innerHTML = `<span class="badge bg-secondary">${u.id}</span>`;
    
            // Username
            const td_Username = document.createElement('td');
            const input_Username = document.createElement('input');
            input_Username.type = 'text';
            input_Username.className = 'form-control form-control-sm';
            input_Username.value = u.username;
            input_Username.disabled = true;
            td_Username.appendChild(input_Username);
    
            // Email
            const td_Email = document.createElement('td');
            const input_Email = document.createElement('input');
            input_Email.type = 'email';
            input_Email.className = 'form-control form-control-sm';
            input_Email.value = u.email;
            input_Email.disabled = true;
            td_Email.appendChild(input_Email);
    
            // Jelszó
            const td_Password = document.createElement('td');
            const input_Password = document.createElement('input');
            input_Password.type = 'text';
            input_Password.className = 'form-control form-control-sm';
            input_Password.value = u.password;
            input_Password.disabled = true;
            td_Password.appendChild(input_Password);
    
            // Profilkép
            const td_Pic = document.createElement('td');
            const input_Pic = document.createElement('input');
            input_Pic.type = 'text';
            input_Pic.className = 'form-control form-control-sm';
            input_Pic.value = u.profil_pic_url || '';
            input_Pic.disabled = true;
            td_Pic.appendChild(input_Pic);
    
            // Módosítás
            const td_Edit = document.createElement('td');
            td_Edit.className = 'text-center';
            const btn_Edit = document.createElement('button');
            btn_Edit.className = 'btn btn-outline-warning btn-sm me-1';
            btn_Edit.innerHTML = 'Szerkesztés';
            let isSaving = false;
            btn_Edit.onclick = async () => {
                if (!isSaving) {
                    const editing = input_Username.disabled === false;
                    if (!editing) {
                        input_Username.disabled = false;
                        input_Email.disabled = false;
                        input_Pic.disabled = false;
                        input_Password.disabled = false;
                        btn_Edit.className = 'btn btn-success btn-sm me-1';
                        btn_Edit.innerHTML = 'Mentés';
                    } else {
                        isSaving = true;
                        btn_Edit.disabled = true;
                        await saveUser(u.id, input_Username.value.trim(), input_Email.value.trim(), input_Pic.value.trim(), input_Username, input_Email, input_Password, input_Pic, btn_Edit);
                        isSaving = false;
                        btn_Edit.disabled = false;
                    }
                };
            };
            td_Edit.appendChild(btn_Edit);
    
            // Törlés
            const td_Delete = document.createElement('td');
            td_Delete.className = 'text-center';
            const btn_Delete = document.createElement('button');
            btn_Delete.className = 'btn btn-outline-danger btn-sm';
            btn_Delete.innerHTML = 'Törlés';
            btn_Delete.onclick = () => deleteUser(u.id, u.username, tr);
            td_Delete.appendChild(btn_Delete);
    
            tr.append(tdId, td_Username, td_Email, td_Password, td_Pic, td_Edit, td_Delete);
            tbody.appendChild(tr);
        });
    
        document.getElementById('user-count').textContent = `${data.users.length} felhasználó`;
    }
}

async function saveUser(id, username, email, profil_pic_url, input_Username, input_Email, input_Password, input_Pic, btn_Edit) {
    try {
        const token = localStorage.getItem('token');
        await apiFetch(`http://localhost:4000/api/admin/update_user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: id, username, email, profil_pic_url })
        });

        // Vissza a normál módba
        input_Username.disabled = true;
        input_Email.disabled = true;
        input_Pic.disabled = true;
        input_Password.disabled = true;
        btn_Edit.className = 'btn btn-outline-warning btn-sm me-1';
        btn_Edit.innerHTML = 'Szerkesztés';
    } catch (err) {
        input_Username.disabled = false;
        input_Email.disabled = false;
        input_Pic.disabled = false;
        input_Password.disabled = false;
        btn_Edit.className = 'btn btn-success btn-sm me-1';
        btn_Edit.innerHTML = 'Mentés';
    }
}

async function deleteUser(id, username, tr) {
    const token = localStorage.getItem('token');
    if (!confirm(`Biztosan törlöd a(z) "${username}" felhasználót?`)) return;
    try {
        await apiFetch(`http://localhost:4000/api/admin/delete_user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
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

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
    setTimeout(async () => {
        currentFilters.search = e.target.value;
        await loadUsers();
    }, 500);
});