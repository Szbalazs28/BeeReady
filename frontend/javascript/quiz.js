async function load_quizzes() {
    try {
        if (sessionStorage.getItem("quiz_started") !== "true") {
            if (!document.querySelector(".quiz-create-container").classList.contains("dnone")) {
                document.querySelector(".quiz-create-container").classList.add("dnone");
                document.querySelector(".quiz-action-div").classList.remove("dnone");
                document.querySelector(".quiz-container").classList.remove("dnone");
            }
            if (!document.getElementById("quizStart").classList.contains("dnone")) {
                document.getElementById("quizStart").classList.add("dnone");
                document.querySelector(".quiz-action-div").classList.remove("dnone");
                document.querySelector(".quiz-container").classList.remove("dnone");
            }
            quiz_start_reset();
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
                quizContainer.appendChild(build_quiz(result.quizzes[i].title, result.quizzes[i].description, result.quizzes[i].quiz_id, result.quizzes[i].question_count, result.quizzes[i].created_at, result.quizzes[i].last_result, result.quizzes[i].created_by, result.quizzes[i].public, result.quizzes[i].randomize_questions));
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


    }
    catch (err) {
        console.error(err);
    }
}


function build_quiz(title, description, quiz_id, question_count, created, last_result, created_by, public, randomize_questions) {
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

    const delete_button = document.createElement("button")
    delete_button.type = "button"
    delete_button.classList.add("quiz-button", "delete-quiz-button")
    delete_button.textContent = "Törlés"
    delete_button.onclick = () => { show_quiz_delete_modal(quiz_id) }

    const result_button = document.createElement("button")
    result_button.type = "button"
    result_button.classList.add("quiz-button", "result-quiz-button")
    result_button.textContent = "Eredmények"
    result_button.onclick = () => { show_quiz_result_modal(quiz_id) }

    const start_button = document.createElement("button")
    start_button.type = "button"
    start_button.classList.add("quiz-button", "start-quiz-button")
    start_button.textContent = "Indítás"
    let quiz = { quiz_id: quiz_id, title: title, description: description, ispublic: public, author: created_by, randomize_questions: randomize_questions }
    start_button.onclick = () => { quiz_start(quiz) }

    const edit_button = document.createElement("button")
    edit_button.type = "button"
    edit_button.classList.add("quiz-button", "edit-quiz-button")
    edit_button.textContent = "Szerkesztés"

    edit_button.onclick = () => { quiz_edit_user(quiz) }

    quiz_actions.appendChild(start_button)
    quiz_actions.appendChild(edit_button)
    quiz_actions.appendChild(result_button)
    quiz_actions.appendChild(delete_button)

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

function createBaseQuestionBlock(type, question = null) {
    const question_id = max_q_block_id();
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', type);
    questionCard.setAttribute('data-id', question_id);
    questionCard.id = `q_block_${question_id}`;


    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const grab = document.createElement('p');
    grab.style.cursor = 'move';
    grab.textContent = '::';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.className = 'q-input';
    qInput.placeholder = `${question_id}. Kérdés szövege: `;
    qInput.required = true;
    if (question) {
        qInput.value = question.question_text;
    }

    const qSettings = document.createElement('div');
    qSettings.className = 'q-settings';


    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = () => questionCard.remove();

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';
    deleteBtn.appendChild(trashImg);

    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'q-points-container';

    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Pont:';
    pointsLabel.className = 'points-label';

    const pointsInput = document.createElement('input');
    pointsInput.type = 'number';
    pointsInput.className = 'q-points-input';
    pointsInput.min = '1';
    pointsInput.value = 1;
    if (question) {
        pointsInput.value = question.points;
    }
    pointsInput.title = 'Pontszám ehhez a kérdéshez';

    pointsContainer.append(pointsLabel, pointsInput);


    qSettings.append(pointsContainer, deleteBtn);
    qHeader.append(grab, qInput, qSettings);

    questionCard.append(qHeader);

    return questionCard;
}

function addNewOrderQuestionBlock(answers = null, question = null) {
    const questionCard = createBaseQuestionBlock('order', question);
    const question_id = questionCard.getAttribute('data-id');

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


    if (answers && answers.length > 0) {
        answers.forEach(ans => {
            answersContainer.appendChild(addOrderAnswerToBlock(question_id, ans));
        })
    }
    else {
        answersContainer.appendChild(addOrderAnswerToBlock(question_id));
    }


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
    questionCard.append(answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);
}

function addNewShortAnswerQuestionBlock(answers = null, question = null) {
    const questionCard = createBaseQuestionBlock('short', question);
    const question_id = questionCard.getAttribute('data-id');

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;
    if (answers && answers.length > 0) {
        answers.forEach(ans => {
            answersContainer.appendChild(addShortAnswerToBlock(question_id, ans));
        })
    }
    else {
        answersContainer.appendChild(addShortAnswerToBlock(question_id));
    }


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


    questionCard.append(answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);

}

function addNewStandardQuestionBlock(answers = null, question = null) {
    const questionCard = createBaseQuestionBlock('standard', question);
    const question_id = questionCard.getAttribute('data-id');

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;
    if (answers && answers.length > 0) {
        answers.forEach(ans => {
            answersContainer.appendChild(addStandardAnswerToBlock(question_id, ans));
        })
    }
    else {
        answersContainer.appendChild(addStandardAnswerToBlock(question_id));
    }


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


    questionCard.append(answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);

}

function addNewFillQuestionBlock(answers = null, question = null) {
    const questionCard = createBaseQuestionBlock('fill', question);
    const question_id = questionCard.getAttribute('data-id');


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;


    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", 0);


    const ansInput = document.createElement('textarea');
    ansInput.placeholder = 'Írja be a helyes választ a szövegben, ahol a kitöltendő rész van, használja a {blank} jelölést!';
    ansInput.classList.add('ans-input', 'fill-ans-input');
    ansInput.required = true;
    if (answers) {
        ansInput.textContent = fill_give_data(answers[0].answer_text);
    }


    answerRow.append(ansInput);
    answersContainer.appendChild(answerRow);

    questionCard.append(answersContainer,);

    document.querySelector('#questionsContainer').appendChild(questionCard);
}


// VÁLASZOK
function addOrderAnswerToBlock(question_id, answer = null) {
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
    if (answer) {
        ansInput.value = answer.answer_text;
    }


    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(dragIcon, ansInput, delAnsBtn);
    return answerRow;
}

function addShortAnswerToBlock(question_id, answer = null) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", document.querySelectorAll(`#answers_${question_id} .answer-row`).length);
    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Helyes válasz';
    ansInput.className = 'ans-input';
    ansInput.required = true;
    if (answer) {
        ansInput.value = answer.answer_text;
    }
    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansInput, delAnsBtn);
    return answerRow;
}

function addStandardAnswerToBlock(question_id, answer = null) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", document.querySelectorAll(`#answers_${question_id} .answer-row`).length);
    const ansCheck = document.createElement('input');
    ansCheck.type = 'checkbox';
    ansCheck.className = 'correct-check';
    if (answer) {
        ansCheck.checked = answer.correct;
    }

    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Válaszlehetőség';
    ansInput.className = 'ans-input';
    ansInput.required = true;
    if (answer) {
        ansInput.value = answer.answer_text;
    }
    const delAnsBtn = document.createElement('button');
    delAnsBtn.type = 'button';
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansCheck, ansInput, delAnsBtn);
    return answerRow;
}
// ------------------------------------------------


function min_blocks(blocks) {
    if (blocks.length == 0) {
        alertell("Legalább egy kérdésnek és egy válasznak lennie kell!", 2.5);
        throw new Error("Legalább egy kérdésnek és egy válasznak lennie kell!");
    }
}

function quiz_creator_reset() {
    document.getElementById("quizCreateForm").reset();
    document.querySelector("#questionsContainer").innerHTML = "";
    const saveBtn = document.querySelector(".btn-save-quiz");
    saveBtn.setAttribute("data-button-option", "create");
    saveBtn.removeAttribute("data-quiz-id");
}

async function saveQuiz(e) {
    e.preventDefault();
    try {
        const total_points = quiz_check();
        let question_id = null;
        const ispublic = document.querySelector("#isPublicQuiz").checked;
        const quiz_title = document.querySelector(".quiz-title-input").value;
        const quiz_description = document.querySelector(".quiz-description-input").value;
        const questionBlocks = document.querySelectorAll(".question-card");
        const randomize_questions = document.querySelector("#randomOrder").checked;
        let quiz_id = await save_quiz(quiz_title, quiz_description, ispublic, randomize_questions, total_points);
        for (const block of questionBlocks) {
            const question_text = block.querySelector(".q-input").value;
            const points = block.querySelector(".q-points-input").value;
            question_id = await save_question(question_text, quiz_id, block.getAttribute("data-question-type"), block.getAttribute("data-id"), points);
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
        quiz_creator_reset();
        await load_quizzes();
    } catch (error) {
        console.error(error);
    }
}

function fill_get_data(ansText) {
    let text = ""
    let words = []
    let word = ""
    let found = false
    for (let index = 0; index < ansText.length; index++) {
        if (!found && ansText[index] != '{' && ansText[index] != '}') {
            text += ansText[index]
        }
        else {
            if (ansText[index] == '{') {
                found = true;
            }
            else {
                if (found) {
                    if (ansText[index] != '}') {
                        word += ansText[index]
                    }
                    else {
                        found = false;
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

    return { words: words, text: text };
}

function fill_give_data(ansText) {
    let words = JSON.parse(ansText).words
    let text = JSON.parse(ansText).text;
    let ans = text;
    let length = 1
    let words_index = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] == "{") {
            ans = fill_insert(ans, words[words_index], i + length);
            length += words[words_index].length
            words_index++;
        }
    }
    return ans;
}



function quiz_check() {
    let points_sum = 0;
    const quiz_title = document.querySelector(".quiz-title-input").value;
    const questionBlocks = document.querySelectorAll(".question-card");
    speclengthtest(quiz_title, 1, 200, "A kvíz címének hossza");
    min_blocks(questionBlocks);

    for (const block of questionBlocks) {
        points_sum += parseInt(block.querySelector(".q-points-input").value);
        const question_text = block.querySelector(".q-input").value;
        const answers = block.querySelectorAll(".answer-row");
        min_blocks(answers);
        speclengthtest(question_text, 1, 1000, "A kérdés szövegének hossza");
        for (const ans of answers) {
            const ansText = ans.querySelector(".ans-input").value;
            speclengthtest(ansText, 1, 1000, "A válasz szövegének hossza");
        }
    }
    return points_sum;
}

async function save_answer(question_id, answer_text, right_answer, position) {
    try {
        const token = localStorage.getItem("token");
        if (typeof answer_text === "object") {
            answer_text = JSON.stringify(answer_text);
        }
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

async function save_quiz(title, description, public, randomize_questions, total_points) {
    try {

        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/savequiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: title, description: description, public: public, randomize_questions: randomize_questions, total_points: total_points })
        });
        return result.quiz_id;
    }
    catch (err) {
        throw err;
    }
}

async function save_question(question_text, quiz_id, type, position, points) {
    try {
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/savequestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_text: question_text, quiz_id: quiz_id, type: type, position: position, points: points })
        })
        return result.question_id;
    } catch (err) {
        throw err;
    }
}

function showcreatequiz() {
    quiz_creator_reset()
    document.querySelector(".quiz-create-container").classList.remove("dnone");
    document.querySelector(".quiz-action-div").classList.add("dnone");
    document.querySelector(".quiz-container").classList.add("dnone");
    const questionsContainer = document.querySelector("#questionsContainer");
    Sortable.create(questionsContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
        onEnd: function (evt) {
            const questionBlocks = document.querySelectorAll(".question-card");
            questionBlocks.forEach((block, index) => {
                block.setAttribute("data-id", index);
                block.id = `q_block_${index}`;
            });
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


async function quiz_edit_user(quiz) {
    quiz_creator_reset();
    showcreatequiz()
    document.querySelector(".btn-save-quiz").setAttribute("data-button-option", "edit")
    document.querySelector(".btn-save-quiz").setAttribute("data-quiz-id", quiz.quiz_id)
    document.getElementById("quizTitle").value = quiz.title;
    document.getElementById("quizDescription").value = quiz.description;
    document.getElementById("isPublicQuiz").checked = quiz.ispublic;
    document.getElementById("randomOrder").checked = quiz.randomize_questions;
    const token = localStorage.getItem("token");
    try {
        const result = await apiFetch(`http://127.0.0.1:4000/api/getquizquestions?quiz_id=${quiz.quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        for (let i = 0; i < result.questions.length; i++) {
            const question = result.questions[i];
            const answers = await getAnswersByQuestionId(question.question_id);
            if (question.question_type === "standard") {
                addNewStandardQuestionBlock(answers, question);
            }
            else {
                if (question.question_type === "short") {
                    addNewShortAnswerQuestionBlock(answers, question);
                }
                else {
                    if (question.question_type === "fill") {
                        addNewFillQuestionBlock(answers, question);
                    }
                    else {
                        if (question.question_type === "order") {
                            addNewOrderQuestionBlock(answers, question);
                        }
                    }

                }
            }
        }
    } catch (err) {
        console.error(err);
    }

}

async function getAnswersByQuestionId(question_id) {
    const token = localStorage.getItem("token");
    const result = await apiFetch(`http://127.0.0.1:4000/api/getquestionanswers?question_id=${question_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })
    return result.answers
}

document.getElementById("quizCreateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (document.querySelector(".btn-save-quiz").getAttribute("data-button-option") === "edit") {
        const quiz_id = document.querySelector(".btn-save-quiz").getAttribute("data-quiz-id");
        await quiz_delete(quiz_id);
        await saveQuiz(e);
    }
    else {
        await saveQuiz(e);
    }
});


function show_quiz_delete_modal(quiz_id) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "quiz-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "quiz-modal-content quiz-delete-modal-content";

    const title = document.createElement("h3");
    title.className = "quiz-delete-modal-title";
    title.textContent = "Kvíz törlése";

    const message = document.createElement("p");
    message.className = "quiz-delete-modal-text";
    message.textContent = "Biztosan törölni szeretnéd ezt a kvízt? Ez a művelet nem visszavonható.";

    const actionDiv = document.createElement("div");
    actionDiv.className = "quiz-delete-action-div";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.classList.add("quiz-create-button", "quiz-delete-cancel");
    cancelBtn.textContent = "Mégse";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.classList.add("quiz-create-button", "quiz-delete-confirm");
    confirmBtn.textContent = "Igen, törlés";
    cancelBtn.onclick = () => { closeModal(); };

    confirmBtn.onclick = async () => { await quiz_delete(quiz_id); closeModal(); await load_quizzes(); };

    actionDiv.append(cancelBtn, confirmBtn);
    modalContent.append(title, message, actionDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function closeModal() {
    const modal = document.querySelector(".quiz-modal-overlay");
    if (modal) {
        document.body.removeChild(modal);
    }
}


async function quiz_delete(quiz_id) {
    const token = localStorage.getItem("token");
    try {
        await apiFetch(`http://127.0.0.1:4000/api/deletequiz?quiz_id=${quiz_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error(err);
    }
}

// START KÉRDÉS BLOKKOK
function startBaseQuestionBlock(question) {
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', question.question_type);
    questionCard.setAttribute('data-id', question.question_id);

    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('p');
    qInput.className = 'q-input';
    qInput.textContent = question.question_text;

    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'q-points-container';

    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Pont:';
    pointsLabel.className = 'points-label';

    const pointsInput = document.createElement('input');
    pointsInput.type = 'number';
    pointsInput.value = question.points;
    pointsInput.className = 'q-points-input';


    pointsInput.title = 'Pontszám ehhez a kérdéshez';

    pointsContainer.append(pointsLabel, pointsInput);



    qHeader.append(qInput);

    questionCard.append(qHeader);

    return questionCard;
}

function start_addStandardAnswerToBlock(answer) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", answer.answer_id);
    const ansCheck = document.createElement('input');
    ansCheck.type = 'checkbox';
    ansCheck.className = 'correct-check';

    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.className = 'ans-input';
    ansInput.disabled = true;
    ansInput.value = answer.answer_text;

    answerRow.append(ansCheck, ansInput);
    return answerRow;
}

function start_addOrderAnswerToBlock(answer) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    const dragIcon = document.createElement('p');
    dragIcon.textContent = '::';
    dragIcon.style.cursor = 'move';

    const ansInput = document.createElement('input');
    answerRow.setAttribute("data-id", answer.answer_id);
    ansInput.type = 'text';
    ansInput.disabled = true;
    ansInput.className = 'ans-input';
    if (answer) {
        ansInput.value = answer.answer_text;
    }


    answerRow.append(dragIcon, ansInput);
    return answerRow;
}

//---------------------------------------

function start_addNewStandardQuestionBlock(question, answers) {
    const questionCard = startBaseQuestionBlock(question);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    if (answers && answers.length > 0) {
        answers.forEach(answer => {
            answersContainer.appendChild(start_addStandardAnswerToBlock(answer));
        })
    }
    questionCard.append(answersContainer);
    document.querySelector('#start_question_container').appendChild(questionCard);

}

function start_addNewShortAnswerQuestionBlock(question) {
    const questionCard = startBaseQuestionBlock(question);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';

    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", question.question_id);
    const ansInput = document.createElement('input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Helyes válasz:';
    ansInput.className = 'ans-input';
    ansInput.required = true;

    answerRow.append(ansInput);
    answersContainer.append(answerRow)


    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);

}

function start_addNewFillQuestionBlock(question, answer) {
    const questionCard = startBaseQuestionBlock(question);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question.question_id}`;

    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';

    const ansInput = document.createElement('div');
    ansInput.classList.add('ans-input', 'fill-ans-input');
    ansInput.innerHTML = insertinput(answer[0].answer_text)
    answerRow.append(ansInput);
    answersContainer.appendChild(answerRow);

    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);
}

function start_addNewOrderQuestionBlock(question, answers) {
    const questionCard = startBaseQuestionBlock(question);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    Sortable.create(answersContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
    });

    let random_answers = random_array(answers);

    for (let i = 0; i < random_answers.length; i++) {
        answersContainer.appendChild(start_addOrderAnswerToBlock(answers[random_answers[i]]));
    }

    questionCard.append(answersContainer);
    document.querySelector('#start_question_container').appendChild(questionCard);
}

function insertinput(ansText) {
    let text = JSON.parse(ansText).text;
    text = text.replaceAll("{}", '<input type="text" class="fill-input">');
    return text
}

function fill_insert(text, insert, position) {
    return text.slice(0, position) + insert + text.slice(position);
}

function showstartquiz() {
    document.querySelector(".quiz_start_container").classList.remove("dnone");
    document.querySelector(".quiz-action-div").classList.add("dnone");
    document.querySelector(".quiz-container").classList.add("dnone");

}

async function exit_quiz() {
    sessionStorage.removeItem("quiz_started");
    await load_quizzes();
}

function quiz_start_reset() {
    document.getElementById("start_question_container").innerHTML = "";
}

async function quiz_start(quiz) {
    sessionStorage.setItem("quiz_started", "true");
    quiz_start_reset();
    showstartquiz()
    document.getElementById("quiz_title").textContent = quiz.title;
    document.getElementById("quiz_description").textContent = quiz.description;
    document.getElementById("author").textContent = quiz.author;
    document.getElementById("quizSubmit").setAttribute("data-quiz-id", quiz.quiz_id);
    const token = localStorage.getItem("token");
    try {
        const result = await apiFetch(`http://127.0.0.1:4000/api/getquizquestions?quiz_id=${quiz.quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        let question_indexes = [];
        if (quiz.randomize_questions) {
            question_indexes = random_array(result.questions);
        }
        else {
            for (let i = 0; i < result.questions.length; i++) {
                question_indexes.push(i);
            }
        }
        for (let i = 0; i < question_indexes.length; i++) {
            const question = result.questions[question_indexes[i]];
            const answers = await getAnswersByQuestionId(question.question_id);
            if (question.question_type === "standard") {
                start_addNewStandardQuestionBlock(question, answers);
            }
            else {
                if (question.question_type === "short") {
                    start_addNewShortAnswerQuestionBlock(question);
                }
                else {
                    if (question.question_type === "fill") {
                        start_addNewFillQuestionBlock(question, answers);
                    }
                    else {
                        if (question.question_type === "order") {
                            start_addNewOrderQuestionBlock(question, answers);
                        }
                    }

                }
            }
        }
    } catch (err) {
        console.error(err);
    }

}

function warn_before_unload_with_active_quiz(event) {
    if (sessionStorage.getItem("quiz_started") === "true") {
        event.preventDefault();
        event.returnValue = "";
    }
}

function wasReload() {
    const nav = performance.getEntriesByType("navigation");
    if (nav.length > 0) return nav[0].type === "reload";
    return performance.navigation && performance.navigation.type === 1; // fallback
}

window.addEventListener("load", () => {
    if (wasReload()) {
        console.log("Újratöltés történt");
        sessionStorage.removeItem("quiz_started");
    }
});

window.addEventListener("beforeunload", warn_before_unload_with_active_quiz);

async function submitQuiz(e) {
    e.preventDefault();
    try {
        const quiz_id = document.querySelector(".btn-submit-quiz").getAttribute("data-quiz-id");
        for (const block of questionBlocks) {
            const question_id = block.getAttribute("data-id");
            const question_type = block.getAttribute("data-question-type");
            const answers = block.querySelectorAll(".answer-row");
            let answer_data = [quiz_id]
            let data = {qestion_id: question_id, question_type: question_type, answers: [] };
            if (question_type === "order") {
                for (const ans of answers) {
                    data.answers.push(ans.getAttribute("data-id"));
                }
                answer_data.push(data);
            }
            else {
                if (question_type === "fill") {
                    const ansInput = block.querySelectorAll(".fill-ans-input .fill-input");
                    for (const input of ansInput) {
                        data.answers.push(input.value);
                    }
                    answer_data.push(data);
                }
                else {
                    if (question_type === "short") {
                        const ansInput = block.querySelector(".ans-input");
                        data.answers.push(ansInput.value);
                        answer_data.push(data);
                    }
                    else {
                        if (question_type === "standard") {

                            const answer_rows = block.querySelectorAll(".answer-row");
                            for (const ans of answer_rows) {
                                const ansCheck = ans.querySelector(".correct-check").checked;
                                data.answers.push(ansCheck);
                                answer_data.push(data);
                            }
                        }
                    }
                }
            }
        }
        const token = localStorage.getItem("token");
        await apiFetch("http://127.0.0.1:4000/api/submitquiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(answer_data)
        });
        quiz_creator_reset();
        await load_quizzes();
    } catch (error) {
        console.error(error);
    }
}