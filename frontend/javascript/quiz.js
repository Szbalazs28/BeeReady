async function load_quizzes() {
    try {
        if (!document.querySelector(".quiz-create-container").classList.contains("dnone")) {
            document.querySelector(".quiz-create-container").classList.add("dnone");
            document.querySelector(".quiz-action-div").classList.remove("dnone");
            document.querySelector(".quiz-container").classList.remove("dnone");
        }
        const quizContainer = document.querySelector(".quiz-container");
        quizContainer.innerHTML = "";
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/getquizzes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        for (let i = 0; i < result.quizzes.length; i++) {
            quizContainer.appendChild(build_quiz(result.quizzes[i].title, result.quizzes[i].description, result.quizzes[i].quiz_id, result.quizzes[i].question_count, result.quizzes[i].created_at, result.quizzes[i].last_result, result.quizzes[i].created_by))
        }
        const el = document.getElementById('quizContainer');
        Sortable.create(el, {
            animation: 150,
            dataIdAttr: 'data-id',
            onEnd: function (evt) {
                const currentorder = Sortable.get(evt.from).toArray();
                save_current_quiz_order(currentorder)
            }
        });
    }
    catch (err) {
        console.error(err);
    }
}

function build_quiz(title, description, quiz_id, question_count, created, last_result, created_by) {
    const quiz_element = document.createElement("div")
    quiz_element.draggable = true
    quiz_element.setAttribute("data-id", quiz_id)
    quiz_element.classList.add("quiz-element")

    const quiz_info = document.createElement("div")
    quiz_info.classList.add("quiz-info")

    const quiz_title = document.createElement("h2")
    quiz_title.classList.add("quiz-title")
    quiz_title.textContent = title




    const quiz_meta_row = document.createElement("div")
    quiz_meta_row.classList.add("quiz-meta-row")


    if (question_count != null && question_count != undefined) {
        const quiz_count = document.createElement("p")
        quiz_count.classList.add("quiz-meta", "quiz-count")
        quiz_count.textContent = `${question_count} kérdés`
        quiz_meta_row.appendChild(quiz_count)
    }
    const quiz_created = document.createElement("p")
    quiz_created.classList.add("quiz-meta", "quiz-created")
    quiz_created.textContent = created


    quiz_meta_row.appendChild(quiz_created)

    quiz_info.appendChild(quiz_title)
    if (description != null && description.length > 0 && description !== "") {
        const quiz_description = document.createElement("p")
        quiz_description.classList.add("quiz-meta", "quiz-description")
        quiz_description.textContent = description
        quiz_info.appendChild(quiz_description)
    }
    quiz_info.appendChild(quiz_meta_row)

    if (last_result !== null && last_result !== undefined && last_result !== "") {
        const quiz_result = document.createElement("p")
        quiz_result.classList.add("quiz-meta", "quiz-result")
        quiz_result.textContent = `Legutóbbi kitöltés eredménye: ${last_result}%`
        quiz_info.appendChild(quiz_result)
    }

    const group_div = document.createElement("div")
    group_div.classList.add("quiz-group")

    const create_by = document.createElement("p")
    create_by.classList.add("quiz-meta", "quiz-created")
    create_by.textContent = `Létrehozva: ${created_by}`
    group_div.appendChild(create_by)

    const quiz_actions = document.createElement("div")
    quiz_actions.classList.add("quiz-actions")

    const start_button = document.createElement("button")
    start_button.type = "button"
    start_button.classList.add("quiz-button", "start-quiz-button")
    start_button.textContent = "Indítás"
    start_button.onclick = () => { quiz_start(quiz_id) }

    const edit_button = document.createElement("button")
    edit_button.type = "button"
    edit_button.classList.add("quiz-button", "edit-quiz-button")
    edit_button.textContent = "Szerkesztés"
    edit_button.onclick = () => { quiz_edit_user(quiz_id) }

    quiz_actions.appendChild(start_button)
    quiz_actions.appendChild(edit_button)

    quiz_element.appendChild(quiz_info)

    group_div.appendChild(quiz_actions)
    quiz_element.appendChild(group_div)


    return quiz_element
}

function max_q_block_id() {
    const q_blocks = document.querySelectorAll(".question-card");
    let max_id = 0;
    q_blocks.forEach(block => {
        const id = parseInt(block.id.split("_")[2]);
        if (id > max_id) {
            max_id = id;
        }
    })
    return max_id + 1;
}

function showQuizTypeSelector() {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "quiz-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "quiz-modal-content";

    const actionDiv = document.createElement("div");
    actionDiv.className = "quiz-create-action-div";

    const standardQuizBtn = document.createElement("button");
    standardQuizBtn.className = "quiz-create-button";
    standardQuizBtn.textContent = "Feleletválasztós kérdés";
    standardQuizBtn.onclick = function () {
        addNewStandardQuestionBlock();
        modalOverlay.remove();
    }

    const shortAnswerBtn = document.createElement("button");
    shortAnswerBtn.className = "quiz-create-button";
    shortAnswerBtn.textContent = "Rövid válasz";
    shortAnswerBtn.onclick = function () {
        addNewShortAnswerQuestionBlock();
        modalOverlay.remove();
    }

    const OrderBtn = document.createElement("button");
    OrderBtn.className = "quiz-create-button";
    OrderBtn.textContent = "Sorba rendező feladat";
    OrderBtn.onclick = function () {
        addNewOrderQuestionBlock();
        modalOverlay.remove();
    }

    const FillBtn = document.createElement("button");
    FillBtn.className = "quiz-create-button";
    FillBtn.textContent = "Kitöltő feladat";
    FillBtn.onclick = function () {
        addNewFillQuestionBlock();
        modalOverlay.remove();
    }

    const CloseModal = document.createElement("button");
    CloseModal.classList.add("quiz-create-button", "quiz-create-close");
    CloseModal.textContent = "Bezárás";
    CloseModal.onclick = function () {
        modalOverlay.remove();
    }

    actionDiv.appendChild(standardQuizBtn);
    actionDiv.appendChild(shortAnswerBtn);
    actionDiv.appendChild(OrderBtn);
    actionDiv.appendChild(FillBtn);
    actionDiv.appendChild(CloseModal);
    modalContent.appendChild(actionDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function addNewOrderQuestionBlock() {
    const question_id = max_q_block_id();

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', 'order');
    questionCard.setAttribute('data-id', question_id);
    questionCard.id = `q_block_${question_id}`;

    const grab = document.createElement('p');
    grab.textContent = '::';
    grab.style.cursor = 'move';

    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = `${question_id}. Kérdés szövege: `;
    qInput.className = 'q-input';
    qInput.required = true;

    const qSettings = document.createElement('div');
    qSettings.className = 'q-settings';





    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = function () { questionCard.remove(); };

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';

    deleteBtn.appendChild(trashImg);
    qSettings.append(deleteBtn);
    qHeader.append(grab, qInput, qSettings);


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;
    Sortable.create(answersContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
        onEnd: function (evt) {
            const currentorder = Sortable.get(evt.from).toArray();

        }
    });

    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", 0);
    const dragIcon = document.createElement('p');
    dragIcon.textContent = '::';
    dragIcon.style.cursor = 'move';
    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Válaszlehetőség';
    answerRow.setAttribute("data-id", 0);
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(dragIcon, ansInput, delAnsBtn);
    answersContainer.appendChild(answerRow);


    const qActions = document.createElement('div');
    qActions.className = 'question-actions';

    const addAnsBtn = document.createElement('button');
    addAnsBtn.type = 'button';
    addAnsBtn.className = 'add-ans-btn';
    addAnsBtn.textContent = '+ Válasz hozzáadása';
    addAnsBtn.onclick = function () {
        document.getElementById(`answers_${question_id}`).appendChild(addOrderAnswerToBlock(question_id));
    };

    qActions.appendChild(addAnsBtn);


    questionCard.append(qHeader, answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);
}

function addNewShortAnswerQuestionBlock() {
    const question_id = max_q_block_id();

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', 'short_answer');
    questionCard.setAttribute('data-id', question_id);
    questionCard.id = `q_block_${question_id}`;


    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const grab = document.createElement('p');
    grab.textContent = '::';
    grab.style.cursor = 'move';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = `${question_id}. Kérdés szövege: `;
    qInput.className = 'q-input';
    qInput.required = true;

    const qSettings = document.createElement('div');
    qSettings.className = 'q-settings';





    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = function () { questionCard.remove(); };

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';

    deleteBtn.appendChild(trashImg);
    qSettings.append(deleteBtn);
    qHeader.append(grab, qInput, qSettings);


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;


    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", 0);



    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Helyes válasz';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansInput, delAnsBtn);
    answersContainer.appendChild(answerRow);


    const qActions = document.createElement('div');
    qActions.className = 'question-actions';

    const addAnsBtn = document.createElement('button');
    addAnsBtn.type = 'button';
    addAnsBtn.className = 'add-ans-btn';
    addAnsBtn.textContent = '+ Válasz hozzáadása';
    addAnsBtn.onclick = function () {
        document.getElementById(`answers_${question_id}`).appendChild(addShortAnswerToBlock(question_id));
    };

    qActions.appendChild(addAnsBtn);


    questionCard.append(qHeader, answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);

}

function addNewStandardQuestionBlock() {
    const question_id = max_q_block_id();

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', 'standard');
    questionCard.setAttribute('data-id', question_id);
    questionCard.id = `q_block_${question_id}`;


    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = `${question_id}. Kérdés szövege: `;
    qInput.className = 'q-input';
    qInput.required = true;

    const qSettings = document.createElement('div');
    qSettings.className = 'q-settings';
    const grab = document.createElement('p');
    grab.textContent = '::';
    grab.style.cursor = 'move';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = function () { questionCard.remove(); };

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';

    deleteBtn.appendChild(trashImg);
    qSettings.append(deleteBtn);
    qHeader.append(grab, qInput, qSettings);


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;


    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", 0);
    const ansCheck = document.createElement('input');
    ansCheck.type = 'checkbox';
    ansCheck.name = `correct_${question_id}`;
    ansCheck.className = 'correct-check';

    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Válaszlehetőség';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansCheck, ansInput, delAnsBtn);
    answersContainer.appendChild(answerRow);


    const qActions = document.createElement('div');
    qActions.className = 'question-actions';

    const addAnsBtn = document.createElement('button');
    addAnsBtn.type = 'button';
    addAnsBtn.className = 'add-ans-btn';
    addAnsBtn.textContent = '+ Válasz hozzáadása';
    addAnsBtn.onclick = function () {
        document.getElementById(`answers_${question_id}`).appendChild(addStandardAnswerToBlock(question_id));
    };

    qActions.appendChild(addAnsBtn);


    questionCard.append(qHeader, answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);

}

function addNewFillQuestionBlock() {
    const question_id = max_q_block_id();

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', 'fill');
    questionCard.setAttribute('data-id', question_id);
    questionCard.id = `q_block_${question_id}`;


    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = `${question_id}. Kérdés szövege: `;
    qInput.className = 'q-input';
    qInput.required = true;

    const qSettings = document.createElement('div');
    qSettings.className = 'q-settings';
    const grab = document.createElement('p');
    grab.textContent = '::';
    grab.style.cursor = 'move';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = function () { questionCard.remove(); };

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';

    deleteBtn.appendChild(trashImg);
    qSettings.append(deleteBtn);
    qHeader.append(grab, qInput, qSettings);


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;


    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", 0);


    const ansInput = document.createElement('textarea');
    ansInput.placeholder = 'Írja be a helyes választ ide, a szövegben ahol a kitöltendő rész van, használja a {blank} jelölést!';
    ansInput.classList.add('ans-input', 'fill-ans-input');

    ansInput.required = true;



    answerRow.append(ansInput);
    answersContainer.appendChild(answerRow);

    questionCard.append(qHeader, answersContainer,);

    document.querySelector('#questionsContainer').appendChild(questionCard);
}

function addOrderAnswerToBlock(question_id) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    const dragIcon = document.createElement('p');
    dragIcon.textContent = '::';
    dragIcon.style.cursor = 'move';

    const ansInput = document.createElement('input');
    answerRow.setAttribute("data-id", document.querySelectorAll(`#answers_${question_id} .answer-row`).length);
    ansInput.type = 'text';
    ansInput.placeholder = 'Válaszlehetőség';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(dragIcon, ansInput, delAnsBtn);
    return answerRow;
}

function addShortAnswerToBlock(question_id) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", document.querySelectorAll(`#answers_${question_id} .answer-row`).length);
    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Helyes válasz';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansInput, delAnsBtn);
    return answerRow;
}

function addStandardAnswerToBlock(question_id) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", document.querySelectorAll(`#answers_${question_id} .answer-row`).length);
    const ansCheck = document.createElement('input');
    ansCheck.type = 'checkbox';
    ansCheck.name = `correct_${question_id}`;
    ansCheck.className = 'correct-check';

    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Válaszlehetőség';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansCheck, ansInput, delAnsBtn);
    return answerRow;
}

function min_blocks(blocks) {
    if (blocks.length == 0) {
        alertell("Legalább egy kérdésnek és egy válasznak lennie kell!", 2.5);
        throw new Error("Legalább egy kérdésnek és egy válasznak lennie kell!");
    }
}

async function saveQuiz(e) {
    e.preventDefault();
    try {
        quiz_check();
        let question_id = null;
        const ispublic = document.querySelector("#isPublicQuiz").checked;
        const quiz_title = document.querySelector(".quiz-title-input").value;
        const quiz_description = document.querySelector(".quiz-description-input").value;
        const questionBlocks = document.querySelectorAll(".question-card");
        let quiz_id = await save_quiz(quiz_title, quiz_description, ispublic);
        for (const block of questionBlocks) {
            const question_text = block.querySelector(".q-input").value;
            question_id = await save_question(question_text, quiz_id, block.getAttribute("data-question-type"), block.getAttribute("data-id"));
            const answers = block.querySelectorAll(".answer-row");
            for (const ans of answers) {
                let right_answer = true;
                if (block.getAttribute("data-question-type") === "standard") {
                    right_answer = ans.querySelector(".correct-check").checked;
                }
                let ansText = ans.querySelector(".ans-input").value;
                if (block.getAttribute("data-question-type") === "fill") {
                    ansText = fill_get_data(ansText);
                }

                await save_answer(question_id, ansText, right_answer, ans.getAttribute("data-id"));
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function fill_get_data(ansText) {
    let text = ""
    let words = []
    let word = ""
    let found = false
    let specindex = []
    for (let index = 0; index < ansText.length; index++) {
        if (!found && ansText[index] != '{' && ansText[index] != '}') {
            text += ansText[index]
        }
        else {
            if (ansText[index] == '{') {
                found = true;
                specindex.push(index);
            }
            else {
                if (found) {
                    if (ansText[index] != '}') {
                        word += ansText[index]
                    }
                    else {
                        found = false;
                        specindex.push(index);
                        if (word.length > 0) {
                            text += "{}"
                            words.push(word)
                            word = ""                            
                        }
                        specindex = []
                    }
                }
            }

        }
    }

    return words
}

function quiz_check() {
    const quiz_title = document.querySelector(".quiz-title-input").value;
    const questionBlocks = document.querySelectorAll(".question-card");
    speclengthtest(quiz_title, 1, 200, "A kvíz címének hossza");
    min_blocks(questionBlocks);

    for (const block of questionBlocks) {
        const question_text = block.querySelector(".q-input").value;
        const answers = block.querySelectorAll(".answer-row");
        min_blocks(answers);
        speclengthtest(question_text, 1, 1000, "A kérdés szövegének hossza");
        for (const ans of answers) {
            const ansText = ans.querySelector(".ans-input").value;
            speclengthtest(ansText, 1, 1000, "A válasz szövegének hossza");
        }
    }
}

async function save_answer(question_id, answer_text, right_answer, position) {
    try {
        const token = localStorage.getItem("token");
        await apiFetch("http://127.0.0.1:4000/api/saveanswer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_id: question_id, answer_text: answer_text, right_answer: right_answer, position: position })
        });
    } catch (err) {
        throw err;
    }
}

async function save_quiz(title, description, public) {
    try {

        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/savequiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: title, description: description, public: public })
        });
        return result.quiz_id;
    }
    catch (err) {
        throw err;
    }
}

async function save_question(question_text, quiz_id, type, position) {
    try {
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/savequestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_text: question_text, quiz_id: quiz_id, type: type, position: position })
        })
        return result.question_id;
    } catch (err) {
        throw err;
    }
}

function showcreatequiz() {
    document.querySelector(".quiz-create-container").classList.remove("dnone");
    document.querySelector(".quiz-action-div").classList.add("dnone");
    document.querySelector(".quiz-container").classList.add("dnone");
    const questionsContainer = document.querySelector("#questionsContainer");
    Sortable.create(questionsContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
        onEnd: function (evt) {
            // const currentorder = Sortable.get(evt.from).toArray();
            // localStorage.setItem("current_quiz_order", JSON.stringify(currentorder));            
        }
    });
}



async function save_current_quiz_order(currentorder) {
    try {
        const token = localStorage.getItem("token");
        await apiFetch("http://localhost:4000/api/save_current_quiz_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentorder: currentorder })
        })
    } catch (err) {
        console.error(err);
    }

}