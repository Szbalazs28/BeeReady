async function renderHiveCards(data) {
    const qnfContainer = document.querySelector('.hive_results');
    qnfContainer.innerHTML = '';

    data.forEach(qnf => {
        const qnfCard = document.createElement('div');
        qnfCard.classList.add('hive_card');

        if (qnf.type === 'flashcard') {
            qnfCard.classList.add('flashcard');
            qnfCard.setAttribute('data-deck-id', qnf.id);

            const card_type = document.createElement('span');
            card_type.classList.add('hive_card_type', 'flashcard');
            card_type.textContent = 'FLASHCARD';
            qnfCard.appendChild(card_type);
        } else if (qnf.type === 'quiz') {
            qnfCard.classList.add('quiz');
            qnfCard.setAttribute('data-quiz-id', qnf.id);

            const card_type = document.createElement('span');
            card_type.classList.add('hive_card_type', 'quiz');
            card_type.textContent = 'KVÍZ';
            qnfCard.appendChild(card_type);
        }

        const card_header = document.createElement('div');
        card_header.classList.add('hive_card_header');

        const title_row = document.createElement('div');
        title_row.classList.add('hive_card_title_row');

        const title = document.createElement('h3');
        title.classList.add('hive_card_title');
        title.textContent = qnf.title;

        title_row.appendChild(title);

        const info_row = document.createElement('p');
        info_row.textContent = qnf.author;
        card_header.appendChild(title_row);
        card_header.appendChild(info_row);
        qnfCard.appendChild(card_header);

        const hr = document.createElement('hr');
        qnfCard.appendChild(hr);

        const desc = document.createElement('p');
        desc.classList.add('hive_card_desc');
        if (qnf.type === 'flashcard') {
            desc.textContent = `${qnf.item_count} db kártya`;
        } else if (qnf.type === 'quiz') {
            desc.textContent = `${qnf.item_count} kérdés`;
        }
        qnfCard.appendChild(desc);

        const stats = document.createElement('div');
        stats.classList.add('hive_card_stats');
        const likes = document.createElement('div');
        likes.classList.add('hive_card_likes');
        likes.innerHTML = `<span style="color: #ef4444;">♥</span><span>${qnf.favorite_count}</span>`;
        stats.appendChild(likes);
        qnfCard.appendChild(stats);

        const card_footer = document.createElement('div');
        card_footer.classList.add('hive_card_footer');

        const view_button = document.createElement('button');
        view_button.type = 'button';
        view_button.classList.add('hive_btn_view');
        view_button.textContent = 'Indítás';


        //masik felhsznalobol nem tudja meghivi az elemet viszont puublikus
        view_button.addEventListener('click', async (e) => {
            e.preventDefault();
            if (qnf.type === 'flashcard') {
                navbar_click('tanulokartyak', 2);
                try {
                    await deck_open(qnf.id);
                } catch (error) {
                    console.error('Pakli megnyitási hiba:', error);
                }
            } else {
                if (qnf.type === 'quiz') {
                    navbar_click('quiz', 4);
                    const quizObj = {
                        quiz_id: qnf.id,
                        title: qnf.title,
                        description: qnf.description,
                        author: qnf.author,
                        total_points: qnf.item_count || 0,
                        randomize_questions: true // ezzel nemtudom pontosan mit kene csinalni
                        // tehat jelen allapotban az inditasnal mindig a random sorrendet fogja figyelni, ami amugy lehet nem egy negativum
                        // erre ha van otleted
                    };
                    quiz_start(quizObj);
                }
            }
        });

        const save_button = document.createElement('button');
        save_button.type = 'button';
        save_button.classList.add('hive_btn_save');
        save_button.setAttribute('data-item-type', qnf.type);
        save_button.setAttribute('data-item-id', qnf.id);

        if (qnf.is_saved_by_user === 1 || qnf.is_saved_by_user === true) {
            save_button.textContent = 'Törlés';
            save_button.classList.add('saved');
        } else {
            save_button.textContent = 'Mentés';
        }

        save_button.addEventListener('click', async (e) => {
            e.preventDefault();
            await SaveItem(save_button, qnf.type, qnf.id);
        });

        card_footer.appendChild(view_button);
        card_footer.appendChild(save_button);
        qnfCard.appendChild(card_footer);
        qnfContainer.appendChild(qnfCard);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    HiveFilters();
    HiveSearch();
    loadHiveData('all');
});

// aktualis szurok allapota
let currentFilters = {
    type: 'all',
    search: '',
    favorites: false
};

async function loadHiveData() {
    try {
        const token = localStorage.getItem('token');
        const { type, search, favorites } = currentFilters;

        const result = await apiFetch(
            `http://127.0.0.1:4000/api/hive?type=${type}&search=${search}&favorites=${favorites}`,
            {
                method: 'GET',
                headers: { 'authorization': `Bearer ${token}` }
            }
        );

        renderHiveCards(result.qnf || []);
    } catch (error) {
        console.error('Betöltési hiba:', error);
    }
}

// Szuro gombok 
function HiveFilters() {
    const buttons = document.querySelectorAll('.hive_btn_filter');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // filter frissitese
            if (button.classList.contains('hive_btn_onlyFlashcard')) currentFilters.type = 'flashcard';
            else if (button.classList.contains('hive_btn_onlyQuiz')) currentFilters.type = 'quiz';
            else if (button.classList.contains('hive_btn_saved')) {
                currentFilters.type = 'all';
                currentFilters.favorites = true;
            } else {
                currentFilters.type = 'all';
                currentFilters.favorites = false;
            }

            await loadHiveData();
        });
    });
}

function HiveSearch() {
    const searchInput = document.getElementById('hive_search_input');
    let timeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            currentFilters.search = e.target.value;
            await loadHiveData();
        }, 500);
    });
}

async function SaveItem(button, itemType, itemId) {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch('http://127.0.0.1:4000/api/toggleFavorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                item_type: itemType,
                item_id: itemId
            })
        });

        if (result.success) {
            const card = button.closest('.hive_card');
            const favoriteSpan = card.querySelector('.hive_card_likes span:last-child');

            if (result.is_favorited) {
                button.textContent = 'Törlés';
                button.classList.add('saved');
                alertell('Elem mentve!', 2);
            } else {
                button.textContent = 'Mentés';
                button.classList.remove('saved');
                alertell('Elem törölve!', 2);
            }

            if (favoriteSpan) {
                try {
                    const countResult = await apiFetch('http://127.0.0.1:4000/api/getfavoritecount', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            item_type: itemType,
                            item_id: itemId
                        })
                    });
                    if (countResult.success) {
                        favoriteSpan.textContent = countResult.count;
                    }
                } catch (error) {
                    console.error('Hiba a kedvelések számának lekérésekor:', error);
                }
            }
        }
    } catch (error) {
        alertell('Hiba történt a mentés során!', 3);
    }
}
