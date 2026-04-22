document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    start_logout_timer(true);
    sessionStorage.removeItem("modal_showed");
    if (!token) window.location.href = '../html/index.html';
    loadUsers();
});

async function loadUsers(search = null) {
    const token = localStorage.getItem('token');
    let url = `http://localhost:4000/api/admin/users`;
    if (search) {
        url = `http://localhost:4000/api/admin/search_users/${search}`;
    }
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
    else {

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
                        await saveUser(u.id, input_Username.value.trim(), input_Email.value.trim(), input_Password.value.trim(), input_Pic.value.trim(), input_Username, input_Email, input_Password, input_Pic, btn_Edit);
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
            btn_Delete.onclick = () => createConfirmModal(u.id, u.username, tr);
            td_Delete.appendChild(btn_Delete);

            tr.append(tdId, td_Username, td_Email, td_Password, td_Pic, td_Edit, td_Delete);
            tbody.appendChild(tr);
        });

        document.getElementById('user-count').textContent = `${data.users.length} felhasználó`;
    }
}

async function saveUser(id, username, email, password, profil_pic_url, input_Username, input_Email, input_Password, input_Pic, btn_Edit) {
    try {
        const token = localStorage.getItem('token');
        await apiFetch(`http://localhost:4000/api/admin/update_user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: id, password: password, username, email, profil_pic_url })
        });

        // Vissza a normál módba
        input_Username.disabled = true;
        input_Email.disabled = true;
        input_Pic.disabled = true;
        input_Password.disabled = true;
        btn_Edit.className = 'btn btn-outline-warning btn-sm me-1';
        btn_Edit.textContent = 'Szerkesztés';
    } catch (err) {
        console.error(err);
        input_Username.disabled = false;
        input_Email.disabled = false;
        input_Pic.disabled = false;
        input_Password.disabled = false;
        btn_Edit.className = 'btn btn-success btn-sm me-1';
        btn_Edit.textContent = 'Mentés';
    }
}

async function deleteUser(id, username, tr) {
    const token = localStorage.getItem('token');
    try {
        await apiFetch(`http://localhost:4000/api/admin/delete_user/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        tr.remove();
        const countEl = document.getElementById('user-count');
        const current = parseInt(countEl.textContent) || 0;
        countEl.textContent = `${current - 1} felhasználó`;
    } catch (err) {
        console.log(err);
    }
}

function createConfirmModal(id, username, tr) {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "myModal";
    modal.setAttribute("tabindex", "-1");


    const modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog modal-dialog-centered";


    const modalContent = document.createElement("div");
    modalContent.className = "modal-content text-center";


    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    const title = document.createElement("h5");
    title.className = "modal-title w-100";
    title.textContent = `Törlés megerősítése - ${username}`;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close";
    closeBtn.setAttribute("data-bs-dismiss", "modal");

    modalHeader.append(title, closeBtn);


    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    const message = document.createElement("p");
    message.textContent = "Biztosan törölni szeretné? A művelet nem visszavonható!";

    modalBody.appendChild(message);


    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer justify-content-center";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "btn btn-success";
    confirmBtn.textContent = "Igen";
    confirmBtn.onclick = () => { bsModal.hide(); deleteUser(id, username, tr); };

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-danger";
    cancelBtn.setAttribute("data-bs-dismiss", "modal");
    cancelBtn.textContent = "Nem";

    cancelBtn.onclick = () => { document.body.removeChild(modal); };

    modalFooter.append(confirmBtn, cancelBtn);


    modalContent.append(modalHeader, modalBody, modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);


    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}


document.getElementById('search-input').addEventListener("input", (e) => {
    e.preventDefault();
    setTimeout(async () => {
        await loadUsers(e.target.value.trim());
    }, 500);
});


function toggleHashContainer() {
    const container = document.getElementById('hash-container');
    if (container.classList.contains('d-none')) {
        container.classList.remove('d-none');
    }
    else {
        container.classList.add('d-none');
    }
}

async function generateHash() {
    const input = document.getElementById('hash-password').value.trim();
    const value = input.trim();
    const token = localStorage.getItem('token');
    try {
        const result = await apiFetch('http://localhost:4000/api/generatehash', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: value })
        });
        const hashResult = document.getElementById('hash-result');
        hashResult.textContent = result.hash;
    } catch (err) {
        console.log(err);
    }
}