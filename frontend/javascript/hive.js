document.addEventListener('DOMContentLoaded', () => {
    loadQnF();
});

async function loadQnF() {
    try {

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Nincs token - bejelentkezés szükséges');
            return;
        }
        const result = await apiFetch('http://localhost:4000/api/deck_load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            }
        });
        const qnfContainer = document.querySelector('.hive_results');
        qnfContainer.innerHTML = '';
        if (!qnfContainer) return;

        result.decks.forEach(qnf => {
            const qnfCard = document.createElement('div');
            qnfCard.classList.add('hive_card', 'flashcard');
            qnfCard.setAttribute('data-deck-id', qnf.deck_id);

            const card_type = document.createElement('span');
            card_type.classList.add('hive_card_type', 'flashcard');
            card_type.textContent = 'FLASHCARD';
            qnfCard.appendChild(card_type);

            const card_header = document.createElement('div');
            card_header.classList.add('hive_card_header');

            const title_row = document.createElement('div');
            title_row.classList.add('hive_card_title_row');

            const title = document.createElement('h3');
            title.classList.add('hive_card_title');
            title.textContent = qnf.deck_name;

            const heart_btn = document.createElement('button');
            heart_btn.type = 'button';
            heart_btn.classList.add('hive_save_heart');
            heart_btn.setAttribute('aria-label', 'Mentés');
            heart_btn.setAttribute('title', 'Mentés');
            heart_btn.textContent = '♡';

            title_row.appendChild(title);
            title_row.appendChild(heart_btn);

            const info_row = document.createElement('p');
            info_row.textContent = 'Te';
            card_header.appendChild(title_row);
            card_header.appendChild(info_row);
            qnfCard.appendChild(card_header);

            const hr = document.createElement('hr');
            qnfCard.appendChild(hr);

            const desc = document.createElement('p');
            desc.classList.add('hive_card_desc');
            desc.textContent = `${qnf.cardcount} db kártya`;
            qnfCard.appendChild(desc);

            const stats = document.createElement('div');
            stats.classList.add('hive_card_stats');
            const likes = document.createElement('div');
            likes.classList.add('hive_card_likes');
            likes.innerHTML = '<span style="color: #ef4444;">♥</span><span>0</span>';
            stats.appendChild(likes);
            qnfCard.appendChild(stats);

            const card_footer = document.createElement('div');
            card_footer.classList.add('hive_card_footer');

            const view_button = document.createElement('button');
            view_button.type = 'button';
            view_button.classList.add('hive_btn_view');
            view_button.textContent = 'Indítás';

            card_footer.appendChild(view_button);
            qnfCard.appendChild(card_footer);
            qnfContainer.appendChild(qnfCard);
        });

        // Event listenerek
        attachHiveEventListeners();

    } catch (error) {
        console.error(error)
    }
}

function attachHiveEventListeners() {
    const container = document.querySelector('.hive_results');
    if (!container) return;

    container.addEventListener('click', (e) => {
        // Szív gomb
        if (e.target.classList.contains('hive_save_heart')) {
            e.preventDefault();
            const isSaved = e.target.classList.toggle('saved');
            e.target.textContent = isSaved ? '♥' : '♡';
        }

        // Indítás gomb
        if (e.target.classList.contains('hive_btn_view')) {
            e.preventDefault();
            const card = e.target.closest('.hive_card');
            const deckId = card.getAttribute('data-deck-id');
            if (deckId) {
                deck_open(parseInt(deckId));
            }
        }
    });
}
