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
        const result = await apiFetch('http://127.0.0.1:4000/api/getQnF', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            }
        });

        const qnfContainer = document.querySelector('.hive_results');
        qnfContainer.innerHTML = '';
        if (qnfContainer) {
            result.qnf.forEach(qnf => {
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

                const heart_btn = document.createElement('button');
                heart_btn.type = 'button';
                heart_btn.classList.add('hive_save_heart');
                heart_btn.setAttribute('aria-label', 'Mentés');
                heart_btn.setAttribute('title', 'Mentés');
                heart_btn.textContent = '♡';

                title_row.appendChild(title);
                title_row.appendChild(heart_btn);

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
                view_button.textContent = qnf.type === 'quiz' ? 'Indítás' : 'Indítás';

                card_footer.appendChild(view_button);
                qnfCard.appendChild(card_footer);
                qnfContainer.appendChild(qnfCard);
            });

            // Event listenerek
            attachHiveEventListeners();
        }
    } catch (error) {
        console.error(error)
    }
}

function attachHiveEventListeners() {
    const container = document.querySelector('.hive_results');
    if (container) {

        container.addEventListener('click', (e) => {
            // Sziv gomb (meg nem teljesen mukodik)
            if (e.target.classList.contains('hive_save_heart')) {
                e.preventDefault();
                const isSaved = e.target.classList.toggle('saved');
                e.target.textContent = isSaved ? '♥' : '♡';
            }

            // Inditas
            if (e.target.classList.contains('hive_btn_view')) {
                e.preventDefault();
                const card = e.target.closest('.hive_card');
                
                // Flashcard
                if (card.classList.contains('flashcard')) {
                    const deckId = card.getAttribute('data-deck-id');
                    if (deckId) {
                        const numDeckId = parseInt(deckId);
                        navbar_click('tanulokartyak', 2);

                        setTimeout(async () => {
                            await deck_open(numDeckId);
                            flashcard_start(numDeckId);
                        }, 300);
                    }
                }
                // Kvíz
                else if (card.classList.contains('quiz')) {
                    const quizId = card.getAttribute('data-quiz-id');
                    if (quizId) {
                        const numQuizId = parseInt(quizId);
                        navbar_click('quiz', 4);

                        setTimeout(async () => {
                            // Betöltjük a kvíz kérdéseit
                            const token = localStorage.getItem("token");
                            const result = await apiFetch(`http://127.0.0.1:4000/api/getquizquestions?quiz_id=${numQuizId}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'authorization': `Bearer ${token}`
                                }
                            });
                            
                            // Kezdjük el a kvízt
                            quiz_start_shared({
                                quiz_id: numQuizId,
                                title: card.querySelector('.hive_card_title').textContent,
                                description: card.querySelector('.hive_card_desc').textContent,
                                created_by: card.querySelector('.hive_card_header p').textContent,
                                questions: result.questions
                            });
                        }, 300);
                    }
                }
            }
        });
    };

}
