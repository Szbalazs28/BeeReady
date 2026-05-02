async function load_quizzes() {
    try {
        // Header megjelenítése
        const pageHeader = document.querySelector("#quiz .page_header");
        if (pageHeader) {
            pageHeader.classList.remove("dnone");
        }

        if (sessionStorage.getItem("quiz_started") !== "true") {
            if (!document.querySelector(".quiz-create-container").classList.contains("dnone")) {
                document.querySelector(".quiz-create-container").classList.add("dnone");
                document.querySelector(".quiz-action-div").classList.remove("dnone");
                document.querySelector("#quizContainer").classList.remove("dnone");
            }
            if (!document.getElementById("quizStart").classList.contains("dnone")) {
                document.getElementById("quizStart").classList.add("dnone");
                document.querySelector(".quiz-action-div").classList.remove("dnone");
                document.querySelector("#quizContainer").classList.remove("dnone");
            }
            document.getElementById("foreignQuizContainer").classList.add("dnone");
            document.getElementById("quizContainer").classList.remove("dnone");
            document.getElementById("foreignQuizToggle").checked = false;
            quiz_start_reset();
            const quizContainer = document.querySelector("#quizContainer");
            const foreignQuizContainer = document.getElementById("foreignQuizContainer");
            quizContainer.innerHTML = "";
            const token = localStorage.getItem("token");
            const result = await apiFetch("/api/getquizzes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            });
            const foreignResult = await apiFetch("/api/getforeignquizzes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                }
            });
            for (let i = 0; i < result.quizzes.length; i++) {
                quizContainer.appendChild(build_quiz(result.quizzes[i].title, result.quizzes[i].description, result.quizzes[i].quiz_id, result.quizzes[i].question_count, result.quizzes[i].created_at, result.quizzes[i].created_by, result.quizzes[i].public, result.quizzes[i].randomize_questions, result.quizzes[i].total_points, false));
            }
            document.getElementById("foreignQuizContainer").innerHTML = "";
            for (let i = 0; i < foreignResult.quizzes.length; i++) {
                foreignQuizContainer.appendChild(build_quiz(foreignResult.quizzes[i].title, foreignResult.quizzes[i].description, foreignResult.quizzes[i].quiz_id, foreignResult.quizzes[i].question_count, foreignResult.quizzes[i].created_at, foreignResult.quizzes[i].created_by, foreignResult.quizzes[i].public, foreignResult.quizzes[i].randomize_questions, foreignResult.quizzes[i].total_points, true));
            }
            Sortable.create(quizContainer, {
                animation: 150,
                dataIdAttr: 'data-id',
                handle: ".drag-handle",
                onEnd: function (evt) {
                    const currentorder = Sortable.get(evt.from).toArray();
                    save_current_quiz_order(currentorder);
                }
            });
            Sortable.create(foreignQuizContainer, {
                animation: 150,
                dataIdAttr: 'data-id',
                handle: ".drag-handle",
                onEnd: function (evt) {
                    const currentorder = Sortable.get(evt.from).toArray();
                    save_current_quiz_order(currentorder);
                }
            });
        }


    }
    catch (err) {
        console.error(err);
    }
}


function build_quiz(title, description, quiz_id, question_count, created, created_by, public, randomize_questions, total_points, isForeign) {
    const quiz_element = document.createElement("div");
    quiz_element.setAttribute("data-id", quiz_id);
    quiz_element.classList.add("quiz-element");

    const draggable = document.createElement("p");
    draggable.textContent = "::";
    draggable.classList.add("drag-handle");
    draggable.style.cursor = "move";
    draggable.draggable = true;

    const quiz_info = document.createElement("div");
    quiz_info.classList.add("quiz-info");
    const quiz_header = document.createElement("div");
    quiz_header.classList.add("quiz-build-header");

    const quiz_title = document.createElement("h2");
    quiz_title.classList.add("quiz-title");
    quiz_title.textContent = title;

    quiz_header.append(draggable, quiz_title);

    const quiz_meta_row = document.createElement("div");
    quiz_meta_row.classList.add("quiz-meta-row");


    if (question_count != null && question_count != undefined) {
        const quiz_count = document.createElement("p");
        quiz_count.classList.add("quiz-meta", "quiz-count");
        quiz_count.textContent = `${question_count} kérdés`;
        quiz_meta_row.appendChild(quiz_count);
    }
    const quiz_created = document.createElement("p");
    quiz_created.classList.add("quiz-meta", "quiz-created");
    quiz_created.textContent = created;


    quiz_meta_row.appendChild(quiz_created);

    quiz_info.appendChild(quiz_header);
    if (description != null && description.length > 0 && description !== "") {
        const quiz_description = document.createElement("p");
        quiz_description.classList.add("quiz-meta", "quiz-description");
        quiz_description.textContent = description;
        quiz_info.appendChild(quiz_description);
    }
    quiz_info.appendChild(quiz_meta_row);


    const group_div = document.createElement("div");
    group_div.classList.add("quiz-group");

    const create_by = document.createElement("p");
    create_by.classList.add("quiz-meta", "quiz-created");
    create_by.textContent = `Létrehozva: ${created_by}`;
    group_div.appendChild(create_by);

    const quiz_actions = document.createElement("div");
    quiz_actions.classList.add("quiz-actions");

    const delete_button = document.createElement("button");
    delete_button.type = "button";
    delete_button.classList.add("quiz-button", "delete-quiz-button");
    delete_button.textContent = "Törlés";

    if (!isForeign) {
        delete_button.onclick = () => { show_quiz_delete_modal(quiz_id, false); };
    }
    else {
        delete_button.onclick = () => { show_quiz_delete_modal(quiz_id, true); };
    }


    const result_button = document.createElement("button");
    result_button.type = "button";
    result_button.classList.add("quiz-button", "result-quiz-button");
    result_button.textContent = "Eredmények";
    let quiz = { quiz_id: quiz_id, title: title, description: description, ispublic: public, author: created_by, randomize_questions: randomize_questions, total_points: total_points };
    result_button.onclick = () => { show_quiz_result_modal(quiz, quiz_id); };

    const start_button = document.createElement("button");
    start_button.type = "button";
    start_button.classList.add("quiz-button", "start-quiz-button");
    start_button.textContent = "Indítás";

    start_button.onclick = () => { quiz_start(quiz); };



    quiz_actions.appendChild(start_button);
    if (!isForeign) {
        const edit_button = document.createElement("button");
        edit_button.type = "button";
        edit_button.classList.add("quiz-button", "edit-quiz-button");
        edit_button.textContent = "Szerkesztés";
        edit_button.onclick = () => { quiz_edit_user(quiz); };
        quiz_actions.appendChild(edit_button);

    }
    quiz_actions.appendChild(result_button);
    quiz_actions.appendChild(delete_button);

    quiz_element.appendChild(quiz_info);

    group_div.appendChild(quiz_actions);
    quiz_element.appendChild(group_div);


    return quiz_element;
}

function max_data_id() {
    const q_blocks = document.querySelectorAll(".question-card");
    let max_id = -1;
    q_blocks.forEach(block => {
        const id = parseInt(block.getAttribute("data-id"));
        if (id > max_id) {
            max_id = id;
        }
    });
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
    };

    const shortAnswerBtn = document.createElement("button");
    shortAnswerBtn.className = "quiz-create-button";
    shortAnswerBtn.textContent = "Rövid válasz";
    shortAnswerBtn.onclick = function () {
        addNewShortAnswerQuestionBlock();
        modalOverlay.remove();
    };

    const OrderBtn = document.createElement("button");
    OrderBtn.className = "quiz-create-button";
    OrderBtn.textContent = "Sorba rendező feladat";
    OrderBtn.onclick = function () {
        addNewOrderQuestionBlock();
        modalOverlay.remove();
    };

    const FillBtn = document.createElement("button");
    FillBtn.className = "quiz-create-button";
    FillBtn.textContent = "Kitöltő feladat";
    FillBtn.onclick = function () {
        addNewFillQuestionBlock();
        modalOverlay.remove();
    };

    const CloseModal = document.createElement("button");
    CloseModal.classList.add("quiz-create-button", "quiz-create-close");
    CloseModal.textContent = "Bezárás";
    CloseModal.onclick = function () {
        modalOverlay.remove();
    };

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
    const question_id = max_data_id();
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', type);
    questionCard.setAttribute('data-id', question_id);


    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const grab = document.createElement('p');
    grab.style.cursor = 'move';
    grab.textContent = '::';
    grab.className = 'drag-handle';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.className = 'q-input';
    qInput.placeholder = `${question_id + 1}. Kérdés szövege: `;
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

    qSettings.append(deleteBtn);
    if (type != "short") {
        qHeader.append(grab, qInput, qSettings);
        if (type == "order") {
            if (question && question.points > 0) {
                const specpoint = specpointtoorder(question_id, question.points);
                qHeader.children[1].after(specpoint);
                specpoint.children[1].click();
            }
            else {
                qHeader.children[1].after(specpointtoorder(question_id));
            }

        }


    }
    else {
        if (type == "short" && question) {
            qHeader.append(grab, qInput, pointelement(question.points), qSettings);
        }
        else {
            qHeader.append(grab, qInput, pointelement(), qSettings);
        }

    }


    questionCard.append(qHeader);

    return questionCard;
}

function specpointtoorder(question_id, points = null) {
    const div = document.createElement('div');
    div.className = 'order-point-div';
    const checkbox = document.createElement('input');
    checkbox.id = `order_point_check_${question_id}`;
    checkbox.type = 'checkbox';

    checkbox.className = 'correct-check order-point-check';
    const label = document.createElement('label');
    label.className = 'order-point-label';
    label.htmlFor = `order_point_check_${question_id}`;
    label.textContent = `Egyéni pontozás: `;
    label.style.cursor = 'help';
    label.title = 'Jelöld be, ha szeretnél egyéni pontokat megadni ehhez a válaszhoz! Alapértelmezetten a helyes válasz 1 pontot ér, a helytelen válasz pedig 0 pontot. Az egyéni pont nem bontható!';
    checkbox.addEventListener('click', function () {
        if (this.checked) {
            this.parentElement.parentElement.children[1].after(pointelement(points));
        }
        else {
            this.parentElement.parentElement.removeChild(this.parentElement.parentElement.querySelector('.q-points-container'));
        }
    });
    div.append(label, checkbox);

    return div;
}

function pointelement(points = null) {
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
    if (points) {
        pointsInput.value = points;
    }
    pointsInput.title = 'Pontszám ehhez a kérdéshez';

    pointsContainer.append(pointsLabel, pointsInput);
    return pointsContainer;
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
        handle: ".drag-handle",
        onEnd: function (evt) {
            const currentorder = Sortable.get(evt.from).toArray();

        }
    });


    if (answers && answers.length > 0) {
        answers.forEach(ans => {
            answersContainer.appendChild(addOrderAnswerToBlock(question_id, ans));
        });
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
        });
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
        });
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
    ansInput.placeholder = 'Írja be a helyes választ a szövegben, ahol a kitöltendő rész van, használja a {válasz; pontszám} jelölést!';
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
    dragIcon.className = 'drag-handle';
    dragIcon.style.cursor = 'move';

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
        ansCheck.checked = answer.right_answer;
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

    if (answer) {
        answerRow.append(ansCheck, ansInput, pointelement(answer.points), delAnsBtn);
    }
    else {
        answerRow.append(ansCheck, ansInput, pointelement(), delAnsBtn);
    }

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
    saveBtn.disabled = false;
    saveBtn.classList.remove("disabled-submit-btn");
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
            const allinput = block.querySelectorAll(".q-points-input");
            let qpoints = 0;
            if (allinput.length > 0) {
                for (const input of allinput) {
                    qpoints += parseInt(input.value);
                }
            }
            if (block.getAttribute("data-question-type") == "order") {
                if (block.querySelector(".order-point-check").checked) {
                    qpoints = parseInt(block.querySelector(".q-points-input").value);
                }
                else {
                    qpoints = 0;
                }

            }
            question_id = await save_question(question_text, quiz_id, block.getAttribute("data-question-type"), block.getAttribute("data-id"), qpoints);
            const answers = block.querySelectorAll(".answer-row");
            for (const ans of answers) {
                let right_answer = true;
                let apoints = 1;
                if (block.getAttribute("data-question-type") === "standard") {
                    right_answer = ans.querySelector(".correct-check").checked;
                    apoints = parseInt(ans.querySelector(".q-points-input").value);
                }
                let ansText = ans.querySelector(".ans-input").value;
                if (block.getAttribute("data-question-type") === "fill") {
                    ansText = fill_get_data(ansText);
                }

                await save_answer(question_id, ansText, right_answer, apoints);
            }
        }
        quiz_creator_reset();
        await load_quizzes();
    } catch (error) {
        document.querySelector(".btn-save-quiz").disabled = false;
        document.querySelector(".btn-save-quiz").classList.remove("disabled-submit-btn");
        console.error(error);

    }
}

function fill_get_data(ansText) {
    let text = "";
    let words = [];
    let word = "";
    let points = [];
    let found = false;
    for (let index = 0; index < ansText.length; index++) {
        if (!found && ansText[index] != '{' && ansText[index] != '}') {
            text += ansText[index];
        }
        else {
            if (ansText[index] == '{') {
                found = true;
            }
            else {
                if (found) {
                    if (ansText[index] != '}') {
                        word += ansText[index];
                    }
                    else {
                        found = false;
                        if (word.length > 0) {
                            text += "{}";
                            let search_result = fill_search_points(word);
                            points.push(search_result.points);
                            words.push(search_result.word);
                            word = "";
                        }
                        specindex = [];
                    }
                }
            }

        }
    }
    if (found) {
        alertell("Nem zárta le a kitöltendő részt!", 2.5);
        throw new Error("Nem zárta le a kitöltendő részt!");
    }

    return { words: words, text: text, points: points };
}

function fill_search_points(word) {
    let i = word.length - 1;
    let number = 1;
    while (i > 0 && word[i] != ';') {
        i--;
    }
    if (i >= 0) {
        let number_part = word.slice(i + 1).replaceAll(' ', '');
        if (!isNaN(number_part) && parseInt(number_part) > 0) {
            number = parseInt(number_part);
            word = word.slice(0, i);
        }
    }
    return { word: word, points: number };

}

function fill_give_data(ansText) {
    let words = JSON.parse(ansText).words;
    let text = JSON.parse(ansText).text;
    let points = JSON.parse(ansText).points;
    let ans = text;
    let length = 1;
    let words_index = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] == "{") {
            ans = fill_insert(ans, `${words[words_index]}; ${points[words_index]}`, i + length);
            length += words[words_index].length + points[words_index].toString().length + 2;
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
        const question_text = block.querySelector(".q-input").value;
        const answers = block.querySelectorAll(".answer-row");
        min_blocks(answers);
        speclengthtest(question_text, 1, 1000, "A kérdés szövegének hossza");
        if (block.getAttribute("data-question-type") == "short" || (block.getAttribute("data-question-type") == "order" && block.querySelector(".order-point-check").checked)) {

            points_sum += point_check(block.querySelector(".q-points-input").value);
        }
        else {
            if (block.getAttribute("data-question-type") == "order") {
                points_sum += point_check(block.querySelectorAll(".answers-container .answer-row").length);
            }
        }
        for (const ans of answers) {
            const ansText = ans.querySelector(".ans-input").value;
            speclengthtest(ansText, 1, 1000, "A válasz szövegének hossza");
            if (block.getAttribute("data-question-type") == "standard") {
                points_sum += point_check(ans.querySelector(".q-points-input").value);
            }
            else {
                if (block.getAttribute("data-question-type") == "fill") {
                    let array = fill_get_data(ansText).points;
                    if (array.length > 0) {
                        for (let i = 0; i < array.length; i++) {
                            points_sum += point_check(array[i]);
                        }
                    }
                    else {
                        alertell("Kitöltő kérdésnél legalább egy kitöltendő résznek kell lennie!", 2.5);
                        throw new Error("Kitöltő kérdésnél legalább egy kitöltendő résznek kell lennie!");

                    }

                }
            }

        }
    }
    return points_sum;
}

function point_check(point) {
    if (isNaN(point) || parseInt(point) < 1) {
        alertell("A pontszámnak pozitív egész számnak kell lennie!", 2.5);
        throw new Error("A pontszámnak pozitív egész számnak kell lennie!");
    }
    return parseInt(point);
}

async function save_answer(question_id, answer_text, right_answer, position, points) {
    try {
        const token = localStorage.getItem("token");
        if (typeof answer_text === "object") {
            answer_text = JSON.stringify(answer_text);
        }
        await apiFetch("/api/saveanswer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_id: question_id, answer_text: answer_text, right_answer: right_answer, position: position, points: points })
        });
    } catch (err) {
        throw err;
    }
}

async function save_quiz(title, description, public, randomize_questions, total_points) {
    try {

        const token = localStorage.getItem("token");
        const result = await apiFetch("/api/savequiz", {
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
        const result = await apiFetch("/api/savequestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_text: question_text, quiz_id: quiz_id, type: type, position: position, points: points })
        });
        return result.question_id;
    } catch (err) {
        throw err;
    }
}

function showcreatequiz() {
    quiz_creator_reset();
    document.getElementById("foreignQuizContainer").classList.add("dnone");
    document.querySelector(".quiz-create-container").classList.remove("dnone");
    document.querySelector(".quiz-action-div").classList.add("dnone");
    document.querySelector("#quizContainer").classList.add("dnone");
    const questionsContainer = document.querySelector("#questionsContainer");
    Sortable.create(questionsContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
        handle: '.drag-handle',
        onEnd: function (evt) {
            const questionBlocks = document.querySelectorAll(".question-card");
            questionBlocks.forEach((block, index) => {
                block.setAttribute("data-id", index);
            });
        }
    });
}



async function save_current_quiz_order(currentorder) {
    try {
        const token = localStorage.getItem("token");
        await apiFetch("/api/save_current_quiz_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentorder: currentorder })
        });
    } catch (err) {
        console.error(err);
    }

}

async function save_current_foreign_quiz_order(currentorder) {
    try {
        const token = localStorage.getItem("token");
        await apiFetch("/api/save_current_foreign_quiz_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ currentorder: currentorder })
        });
    } catch (err) {
        console.error(err);
    }

}


async function quiz_edit_user(quiz) {
    const pageHeader = document.querySelector("#quiz .page_header");
    if (pageHeader) {
        pageHeader.classList.add("dnone");
    }
    quiz_creator_reset();
    showcreatequiz();
    document.querySelector(".btn-save-quiz").setAttribute("data-button-option", "edit");
    document.querySelector(".btn-save-quiz").setAttribute("data-quiz-id", quiz.quiz_id);
    document.getElementById("quizTitle").value = quiz.title;
    document.getElementById("quizDescription").value = quiz.description;
    document.getElementById("isPublicQuiz").checked = quiz.ispublic;
    document.getElementById("randomOrder").checked = quiz.randomize_questions;
    const token = localStorage.getItem("token");
    try {
        const result = await apiFetch(`/api/getquizquestions?quiz_id=${quiz.quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
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
    const result = await apiFetch(`/api/getquestionanswers?question_id=${question_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    });
    return result.answers;
}

async function getStartAnswersByQuestionId(question_id) {
    const token = localStorage.getItem("token");
    const result = await apiFetch(`/api/getquestionanswersforstart?question_id=${question_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }
    });
    return result.answers;
}

document.getElementById("quizCreateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {

        if (document.querySelector(".btn-save-quiz").getAttribute("data-button-option") === "edit") {
            document.querySelector(".btn-save-quiz").disabled = true;
            document.querySelector(".btn-save-quiz").classList.add("disabled-submit-btn");
            const quiz_id = document.querySelector(".btn-save-quiz").getAttribute("data-quiz-id");
            await quiz_delete(quiz_id, false);
            await saveQuiz(e);
        }
        else {
            await saveQuiz(e);
        }

    } catch (err) {
        document.querySelector(".btn-save-quiz").disabled = false;
        document.querySelector(".btn-save-quiz").classList.remove("disabled-submit-btn");
        console.error(err);
    }



});

document.getElementById("quizStart").addEventListener("submit", submitQuiz);


function show_quiz_delete_modal(quiz_id, isForeign) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "quiz-modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "quiz-modal-content quiz-delete-modal-content";

    const title = document.createElement("h3");
    title.className = "quiz-delete-modal-title";

    title.textContent = "Kvíz törlése";
    if (isForeign) {
        title.textContent = "Kvíz eredményeinek törlése";
    }
    const message = document.createElement("p");
    message.className = "quiz-delete-modal-text";
    message.textContent = "Biztosan törölni szeretnéd ezt a kvízt? Ez a művelet nem visszavonható.";
    if (isForeign) {
        message.textContent = "Biztosan törölni szeretnéd ezt a kvíz eredményeit? Ez a művelet nem visszavonható.";
    }
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

    confirmBtn.onclick = async () => { await quiz_delete(quiz_id, isForeign); closeModal(); await load_quizzes(); };

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


async function quiz_delete(quiz_id, isForeign) {
    const token = localStorage.getItem("token");
    try {
        await apiFetch(`/api/deletequiz?quiz_id=${quiz_id}&isforeign=${isForeign}`, {
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

function startpointelement(points) {
    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'q-points-container';

    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Pont:';
    pointsLabel.className = 'points-label';

    const pointsInput = document.createElement('span');
    pointsInput.textContent = points;
    pointsInput.className = 'q-points-input';


    pointsInput.title = 'Pontszám ehhez a kérdéshez';
    pointsContainer.append(pointsLabel, pointsInput);
    return pointsContainer;

}

// START KÉRDÉS BLOKKOK
function startBaseQuestionBlock(question, answers = null) {
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.setAttribute('data-question-type', question.question_type);
    questionCard.setAttribute('data-id', question.question_id);

    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('p');
    qInput.className = 'q-input';
    qInput.textContent = question.question_text;



    qHeader.append(qInput);
    if (question.question_type != "standard" && question.question_type != "fill") {
        if (question.question_type == "order") {
            if (question.points > 0) {
                qHeader.append(startpointelement(question.points));
            }
            else {
                if (answers) {
                    qHeader.append(startpointelement(answers.length));
                }
            }
        }
        else {
            qHeader.append(startpointelement(question.points));
        }

    }
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

    const ansInput = document.createElement('p');
    ansInput.className = 'ans-input';
    ansInput.textContent = answer.answer_text;

    answerRow.append(ansCheck, ansInput, startpointelement(answer.points));
    return answerRow;
}

function start_addOrderAnswerToBlock(answer) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    const dragIcon = document.createElement('p');
    dragIcon.textContent = '::';
    dragIcon.style.cursor = 'move';
    dragIcon.className = 'drag-handle';

    const ansInput = document.createElement('p');
    answerRow.setAttribute("data-id", answer.answer_id);
    ansInput.className = 'ans-input';
    if (answer) {
        ansInput.textContent = answer.answer_text;
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
        });
    }
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
    ansInput.innerHTML = insertinput(answer[0].answer_text);
    answerRow.append(ansInput);
    answersContainer.appendChild(answerRow);

    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);
}

function start_addNewOrderQuestionBlock(question, answers) {
    const questionCard = startBaseQuestionBlock(question, answers);

    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    Sortable.create(answersContainer, {
        animation: 150,
        dataIdAttr: 'data-id',
        handle: ".drag-handle",
    });

    let random_answers = random_array(answers);

    for (let i = 0; i < random_answers.length; i++) {
        answersContainer.appendChild(start_addOrderAnswerToBlock(answers[random_answers[i]]));
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
    answersContainer.append(answerRow);


    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);

}



// EREDMÉNYEK MEGTEKINTÉSE

function resultpointelement(points, points_earned) {
    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'q-points-container';

    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Pont:';
    pointsLabel.className = 'points-label';

    const pointsInput = document.createElement('span');
    pointsInput.textContent = `${points_earned}/${points}`;
    pointsInput.className = 'q-points-input';


    pointsInput.title = 'Pontszám ehhez a kérdéshez';

    pointsContainer.append(pointsLabel, pointsInput);
    return pointsContainer;
}



function resultBaseQuestionBlock(question, points_earned = null, answers = null) {
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';

    const qHeader = document.createElement('div');
    qHeader.className = 'question-header';

    const qInput = document.createElement('p');
    qInput.classList.add('q-input', 'result-q-input');
    qInput.textContent = question.question_text;


    const div = document.createElement('div');
    div.className = 'order-point-div';
    const checkbox = document.createElement('input');
    checkbox.id = `solution_check_${question.question_id}`;
    checkbox.type = 'checkbox';

    checkbox.className = 'correct-check order-point-check';
    const label = document.createElement('label');
    label.className = 'order-point-label';
    label.htmlFor = `solution_check_${question.question_id}`;
    label.textContent = `Megoldások megjelenítése: `;

    checkbox.onclick = function () {
        if (question.question_type != "fill") {
            answers = checkbox.closest(".question-card").querySelector(".answers-container").querySelectorAll(".answer-row");
            answers.forEach(answer => {
                if (answer.classList.contains("dnone")) {
                    answer.classList.remove("dnone");
                }
                else {
                    answer.classList.add("dnone");
                }
            });
        }
        else {
            answers = checkbox.closest(".question-card").querySelector(".answers-container").querySelector(".answer-row").querySelectorAll(".fill-input");
            answers.forEach(answer => {
                if (answer.classList.contains("dnone")) {
                    answer.classList.remove("dnone");
                }
                else {
                    answer.classList.add("dnone");
                }
            });
        }
    };

    div.append(label, checkbox);


    qHeader.append(qInput, div);

    if (question.question_type == "short" || (question.question_type == "order" && question.points > 0)) {
        qHeader.append(resultpointelement(question.points, points_earned));
    }
    else {
        if (question.question_type == "order") {
            qHeader.append(resultpointelement(answers.length, points_earned));
        }
    }

    questionCard.append(qHeader);

    return questionCard;
}

function result_addNewStandardQuestionBlock(question, answers, user_answer) {
    const questionCard = resultBaseQuestionBlock(question, answers.points_earned);
    const answers_text = JSON.parse(user_answer[0].answer_text).answers;
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    if (answers && answers.length > 0) {
        answers.forEach((answer, index) => {
            answersContainer.appendChild(result_addStandardAnswerToBlock(answer, answers_text[index], false));
        });
        answers.forEach((answer, index) => {
            answersContainer.appendChild(result_addStandardAnswerToBlock(answer, answers_text[index], true));
        });

    }
    questionCard.append(answersContainer);
    document.querySelector('#start_question_container').appendChild(questionCard);

}

function result_addNewFillQuestionBlock(question, answers, user_answer) {
    const questionCard = resultBaseQuestionBlock(question);
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question.question_id}`;

    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';

    const ansInput = document.createElement('p');
    ansInput.classList.add('ans-input', 'fill-ans-input', 'fill-ans-input-result');
    ansInput.innerHTML = resultinsertinput(answers[0].answer_text, user_answer);
    answerRow.append(ansInput);
    answersContainer.appendChild(answerRow);

    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);
}


function result_addNewShortAnswerQuestionBlock(question, answers, user_answer) {
    const questionCard = resultBaseQuestionBlock(question, user_answer[0].points_earned);
    const answers_text = JSON.parse(user_answer[0].answer_text).answers;
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';

    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    answerRow.setAttribute("data-id", question.question_id);
    const ansInput = document.createElement('p');
    ansInput.className = 'ans-input';
    ansInput.textContent = answers_text[0].answer;

    answerRow.append(ansInput);
    answersContainer.append(answerRow);
    if (answers_text[0].correct) {
        answerRow.classList.add('correct-answer');
    }
    else {
        answerRow.classList.add('wrong_answer');
    }
    answers.forEach((answer) => {
        answersContainer.appendChild(result_addShortAnswerToBlock(answer));
    });

    questionCard.append(answersContainer);

    document.querySelector('#start_question_container').appendChild(questionCard);

}

function result_addNewOrderQuestionBlock(question, answers, user_answer) {
    const answers_text = JSON.parse(user_answer[0].answer_text).answers;
    const questionCard = resultBaseQuestionBlock(question, user_answer[0].points_earned, answers);
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    if (answers && answers.length > 0) {
        answers_text.forEach((answer, index) => {
            let i = 0;
            while (i < answers.length && answers[i].answer_id != answer.answer) {
                i++;
            }
            if (i < answers.length) {
                answersContainer.appendChild(result_addOrderAnswerToBlock(answers[i], answers_text[index]));
            }

        });
    }
    answers.forEach(answer => {
        answersContainer.appendChild(result_addOrderAnswerToBlock(answer));
    });
    questionCard.append(answersContainer);
    document.querySelector('#start_question_container').appendChild(questionCard);
}






// to block ----------------------
function result_addShortAnswerToBlock(answer) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    const ansInput = document.createElement('p');
    ansInput.className = 'ans-input';
    answerRow.classList.add("correct-answer", "dnone");
    ansInput.textContent = answer.answer_text;

    answerRow.append(ansInput);
    return answerRow;
}

function result_addOrderAnswerToBlock(answer, user_answer = null) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';

    const ansInput = document.createElement('p');
    answerRow.setAttribute("data-id", answer.answer_id);
    ansInput.className = 'ans-input';
    ansInput.textContent = answer.answer_text;
    if (user_answer) {
        if (user_answer.correct) {
            answerRow.classList.add('correct-answer');
        }
        else {
            answerRow.classList.add('wrong_answer');
        }
    }
    else {
        answerRow.classList.add("correct-answer", "dnone");
    }


    answerRow.append(ansInput);
    return answerRow;
}

function result_addStandardAnswerToBlock(answer, user_answer, solution_view = false) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';
    const ansCheck = document.createElement('input');
    ansCheck.type = 'checkbox';
    ansCheck.classList.add('correct-check', 'result-ans-input');
    ansCheck.disabled = true;



    const ansInput = document.createElement('p');
    ansInput.className = 'ans-input';
    if (solution_view) {
        ansInput.textContent = answer.answer_text;
        ansCheck.checked = answer.right_answer;
        answerRow.classList.add('correct-answer', 'dnone');
        answerRow.append(ansCheck, ansInput, startpointelement(answer.points));
    }
    else {
        ansInput.textContent = answer.answer_text;
        ansCheck.checked = user_answer.answer;
        if (user_answer.correct) {
            answerRow.classList.add('correct-answer');
        } else {
            answerRow.classList.add('wrong_answer');
        }

        answerRow.append(ansCheck, ansInput, resultpointelement(answer.points, user_answer.points));
    }

    return answerRow;

}

// -----------------------

function insertinput(ansText) {
    let text = JSON.parse(ansText).text;
    let points = JSON.parse(ansText).points;
    let index = 0;
    while (text.includes("{}")) {
        text = text.replace("{}", `<input type="text" class="fill-input" required>(${points[index]} pont)`);
        index++;
    }
    return text;
}

function resultinsertinput(ansText, user_answer) {
    let text = JSON.parse(ansText).text;
    let points = JSON.parse(ansText).points;
    let solution = JSON.parse(ansText).words;
    let words = JSON.parse(user_answer[0].answer_text).answers;

    let index = 0;
    while (text.includes("{}")) {
        if (words[index].correct) {
            text = text.replace("{}", `<span class="fill-input correct-answer">${words[index].answer}</span><span class="fill-input correct-answer dnone">${solution[index]}</span>(${words[index].points}/${points[index]} pont)`);
        }
        else {
            text = text.replace("{}", `<span class="fill-input wrong_answer">${words[index].answer}</span><span class="fill-input correct-answer dnone">${solution[index]}</span>(${words[index].points}/${points[index]} pont)`);
        }
        index++;
    }
    return text;
}

function fill_insert(text, insert, position) {
    return text.slice(0, position) + insert + text.slice(position);
}

function showstartquiz() {
    document.querySelector(".quiz_start_container").classList.remove("dnone");
    document.querySelector(".quiz-action-div").classList.add("dnone");
    document.querySelector("#quizContainer").classList.add("dnone");

}

async function exit_quiz() {
    sessionStorage.removeItem("quiz_started");
    await load_quizzes();
}

function quiz_start_reset() {
    document.getElementById("start_question_container").innerHTML = "";
    document.getElementById("quizSubmit").classList.remove("dnone");
    document.getElementById("quizBackBTN").classList.add("dnone");
}

async function quiz_start(quiz = null, quiz_id = null) {
    // Header eltuntetese 
    const pageHeader = document.querySelector("#quiz .page_header");
    if (pageHeader) {
        pageHeader.classList.add("dnone");
    }

    if (quiz_id != null) {
        const quiz_meta = await apiFetch(`/api/getquizmeta?quiz_id=${quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        quiz = quiz_meta.quiz_meta[0];
        document.getElementById("quizSubmit").setAttribute("data-submit-type", "foreign");
    }
    else {
        document.getElementById("quizSubmit").setAttribute("data-submit-type", "own");
    }
    sessionStorage.setItem("quiz_started", "true");
    document.querySelector("#start_back_btn").onclick = async () => await show_exit_modal(false);
    quiz_start_reset();
    showstartquiz();
    document.getElementById("foreignQuizContainer").classList.add("dnone");
    document.getElementById("quiz_title").textContent = quiz.title;
    document.getElementById("quiz_title").setAttribute("data-total-points", quiz.total_points);
    document.getElementById("quiz_description").textContent = quiz.description;
    document.getElementById("author").textContent = quiz.author;
    document.getElementById("total_points").textContent = `Összpontszám: ${quiz.total_points}`;
    document.getElementById("quizSubmit").setAttribute("data-quiz-id", quiz.quiz_id);

    const token = localStorage.getItem("token");
    try {
        const result = await apiFetch(`/api/getquizquestions?quiz_id=${quiz.quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
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
            let answers = null;
            if (question.question_type !== "short") {
                answers = await getStartAnswersByQuestionId(question.question_id);
            }
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
        const token = localStorage.getItem("token");
        const quiz_id = document.getElementById("quizSubmit").getAttribute("data-quiz-id");
        const questionBlocks = document.querySelector(".quiz_question_container").querySelectorAll(".question-card");
        const total_points = document.getElementById("quiz_title").getAttribute("data-total-points");
        let answer_data = [quiz_id, total_points];
        for (const block of questionBlocks) {
            const question_id = block.getAttribute("data-id");
            const question_type = block.getAttribute("data-question-type");
            const answers = block.querySelectorAll(".answer-row");

            let data = { question_id: question_id, question_type: question_type, answers: [] };
            if (question_type === "order") {
                for (const ans of answers) {
                    data.answers.push(ans.getAttribute("data-id"));
                }
            }
            else {
                if (question_type === "fill") {
                    const ansInput = block.querySelectorAll(".fill-ans-input .fill-input");
                    for (const input of ansInput) {
                        data.answers.push(input.value);
                    }
                }
                else {
                    if (question_type === "short") {
                        const ansInput = block.querySelector(".ans-input");
                        data.answers.push(ansInput.value);
                    }
                    else {
                        if (question_type === "standard") {

                            const answer_rows = block.querySelectorAll(".answer-row");
                            for (const ans of answer_rows) {
                                const ansCheck = ans.querySelector(".correct-check").checked;
                                data.answers.push(ansCheck);

                            }
                        }
                    }
                }
            }
            answer_data.push(data);

        }
        const result = await apiFetch("/api/savequizresult", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(answer_data)
        });
        if (document.getElementById("quizSubmit").getAttribute("data-submit-type") === "foreign") {
            await apiFetch(`/api/saveForeignquiz?quiz_id=${quiz_id}&result_id=${result.result_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

        }
        sessionStorage.removeItem("quiz_started");
        quiz_creator_reset();
        await load_quizzes();
    } catch (error) {
        console.error(error);
    }
}

async function show_quiz_result_modal(quiz, quiz_id) {
    try {
        const modalOverlay = document.createElement("div");
        modalOverlay.className = "quiz-modal-overlay";

        const modalContent = document.createElement("div");
        modalContent.className = "quiz-modal-content";

        const title = document.createElement("h3");
        title.textContent = "Kvíz eredményei:";

        const exitBtn = document.createElement("button");
        exitBtn.type = "button";
        exitBtn.className = "quiz-create-button quiz-exit-result-btn";
        exitBtn.textContent = "Kilépés";
        exitBtn.addEventListener("click", () => {
            document.body.removeChild(modalOverlay);
        });

        const resultContainer = document.createElement("div");
        resultContainer.className = "quiz-result-container";

        const result = await apiFetch(`/api/getquizresult?quiz_id=${quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (result.result.length === 0) {
            const noResultMsg = document.createElement("p");
            noResultMsg.textContent = "Még nincs eredmény a kvíz kitöltésére.";
            resultContainer.appendChild(noResultMsg);
        }
        else {
            const tableWrapper = document.createElement("div");
            tableWrapper.className = "quiz-result-table-wrapper";

            const table = document.createElement("table");
            table.className = "quiz-result-table";

            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const takenAtHeader = document.createElement("th");
            takenAtHeader.textContent = "Kitöltés ideje";
            const scoreHeader = document.createElement("th");
            scoreHeader.textContent = "Eredmény";
            headerRow.appendChild(takenAtHeader);
            headerRow.appendChild(scoreHeader);
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            for (const res of result.result) {
                const resRow = document.createElement("tr");

                const takenAt = document.createElement("td");
                takenAt.textContent = new Date(res.taken_at).toLocaleString("hu-HU");
                takenAt.className = "quiz-result-taken-at";
                resRow.appendChild(takenAt);

                const score = document.createElement("td");
                let formattedResult = res.result;
                if (formattedResult.split('.')[1][0] == "0") {
                    formattedResult = formattedResult.split('.')[0];
                }
                score.textContent = `${formattedResult}% (${res.earned_points}/${res.total_points} pont)`;
                score.className = "quiz-result-score";
                resRow.onclick = () => {
                    document.body.removeChild(modalOverlay);
                    load_result_details(quiz, res.result_id, formattedResult, res.earned_points);
                };
                resRow.appendChild(score);

                tbody.appendChild(resRow);
            }
            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            resultContainer.appendChild(tableWrapper);
        }

        modalContent.appendChild(title);
        modalContent.appendChild(resultContainer);
        modalContent.appendChild(exitBtn);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
    } catch (err) {
        console.error(err);
    }
}

async function load_result_details(quiz, result_id, formattedResult, earned_points) {
    try {
        const pageHeader = document.querySelector("#quiz .page_header");
        if (pageHeader) {
            pageHeader.classList.add("dnone");
        }
        const token = localStorage.getItem("token");
        quiz_start_reset();
        showstartquiz();
        document.querySelector("#start_back_btn").onclick = () => show_exit_modal(true);
        document.getElementById("quiz_title").textContent = quiz.title;
        document.getElementById("foreignQuizContainer").classList.add("dnone");
        document.getElementById("quiz_title").setAttribute("data-total-points", quiz.total_points);
        document.getElementById("quiz_description").textContent = quiz.description;
        document.getElementById("author").textContent = quiz.author;
        document.getElementById("total_points").textContent = `Összpontszám: ${earned_points}/${quiz.total_points} pont - ${formattedResult}%`;
        document.getElementById("quizSubmit").classList.add("dnone");
        document.getElementById("quizBackBTN").classList.remove("dnone");
        document.getElementById("quizBackBTN").onclick = () => show_exit_modal(true);

        const result = await apiFetch(`/api/getquizquestions?quiz_id=${quiz.quiz_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        for (let i = 0; i < result.questions.length; i++) {
            const question = result.questions[i];
            const answers = await getAnswersByQuestionId(question.question_id);
            const user_answer = await load_user_answer(result_id, question.question_id);
            if (question.question_type === "standard") {
                result_addNewStandardQuestionBlock(question, answers, user_answer);
            }
            else {
                if (question.question_type === "short") {
                    result_addNewShortAnswerQuestionBlock(question, answers, user_answer);
                }
                else {
                    if (question.question_type === "fill") {
                        result_addNewFillQuestionBlock(question, answers, user_answer);
                    }
                    else {
                        if (question.question_type === "order") {
                            result_addNewOrderQuestionBlock(question, answers, user_answer);
                        }
                    }

                }
            }
        }
    } catch (err) {
        console.error(err);
    }

}

async function load_user_answer(result_id, question_id) {
    try {
        const token = localStorage.getItem("token");
        const result = await apiFetch(`/api/getuseranswers?result_id=${result_id}&question_id=${question_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        return result.user_answer;
    } catch (err) {
        console.error(err);
    }
}

function toggleForeignQuizzes() {
    if (document.getElementById("foreignQuizToggle").checked) {
        document.getElementById("foreignQuizContainer").classList.remove("dnone");
        document.getElementById("quizContainer").classList.add("dnone");
    } else {
        document.getElementById("foreignQuizContainer").classList.add("dnone");
        document.getElementById("quizContainer").classList.remove("dnone");
    }
}