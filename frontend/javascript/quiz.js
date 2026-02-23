async function load_quizzes() {
    try {
        const quizContainer = document.querySelector(".quiz-container");
        quizContainer.innerHTML = "";
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/getquizzes", {
            method: "POST",
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

function addNewQuestionBlock() {
    const question_id = max_q_block_id();

    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
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


    const label = document.createElement('label');
    label.className = 'checkbox-container';

    const isMultiple = document.createElement('input');
    isMultiple.type = 'checkbox';
    isMultiple.className = 'is-multiple-choice';

    const labelText = document.createElement('span');
    labelText.className = 'checkmark-label';
    labelText.textContent = 'Több helyes válasz';

    label.append(isMultiple, labelText);


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-q-btn';
    deleteBtn.onclick = function () { questionCard.remove(); };

    const trashImg = document.createElement('img');
    trashImg.src = '../img/icons/trash.png';
    trashImg.alt = 'Törlés';
    trashImg.style.width = '26px';

    deleteBtn.appendChild(trashImg);
    qSettings.append(label, deleteBtn);
    qHeader.append(qInput, qSettings);


    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    answersContainer.id = `answers_${question_id}`;


    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';

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
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansCheck, ansInput, delAnsBtn);
    answersContainer.appendChild(answerRow);


    const qActions = document.createElement('div');
    qActions.className = 'question-actions';

    const addAnsBtn = document.createElement('button');
    addAnsBtn.className = 'add-ans-btn';
    addAnsBtn.textContent = '+ Válasz hozzáadása';
    addAnsBtn.onclick = function () {
        document.getElementById(`answers_${question_id}`).appendChild(addAnswerToBlock(question_id));
    };

    qActions.appendChild(addAnsBtn);


    questionCard.append(qHeader, answersContainer, qActions);

    document.querySelector('#questionsContainer').appendChild(questionCard);

}

function addAnswerToBlock(question_id) {
    const answerRow = document.createElement('div');
    answerRow.className = 'answer-row';

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
    delAnsBtn.className = 'delete-ans-btn';
    delAnsBtn.textContent = '×';
    delAnsBtn.onclick = function () { this.parentElement.remove(); };

    answerRow.append(ansCheck, ansInput, delAnsBtn);
    return answerRow;
}

function min_blocks(blocks){
    if(blocks.length == 0){
        alertell("Legalább egy kérdésnek és egy válasznak lennie kell!", 2.5);
        throw new Error("Legalább egy kérdésnek és egy válasznak lennie kell!");
    }
}

async function saveQuiz(e) {
    e.preventDefault();
    try {
        const ispublic = document.querySelector("#isPublicQuiz").checked;
        const quiz_title = document.querySelector(".quiz-title-input").value;
        const quiz_description = document.querySelector(".quiz-description-input").value;
        const questionBlocks = document.querySelectorAll(".question-card");
        speclengthtest(quiz_title, 1, 200, "A kvíz címének hossza");
        min_blocks(questionBlocks);
        for (const block of questionBlocks) {
            const question_text = block.querySelector(".q-input").value;
            const answers = block.querySelectorAll(".answer-row");
            min_blocks(answers);
            speclengthtest(question_text, 1, 1000, "A kérdés szövegének hossza");
            for (const ans of answers) {
                const right_answer = ans.querySelector(".correct-check").checked;
                const ansText = ans.querySelector(".ans-input").value;
                speclengthtest(ansText, 1, 1000, "A válasz szövegének hossza");
                const quiz_id = await save_quiz(quiz_title, quiz_description, ispublic);
                const question_id = await save_question(question_text, quiz_id);
                await save_answer(question_id, ansText, right_answer);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

async function save_answer(question_id, answer_text, right_answer) {
    try {
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/saveanswer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_id: question_id, answer_text: answer_text, right_answer: right_answer })
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

async function save_question(question_text, quiz_id) {
    try {
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/savequestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question_text: question_text, quiz_id: quiz_id })
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
}

function backToQuizzes() {
    if (!document.querySelector(".quiz-create-container").classList.contains("dnone")) {
        document.querySelector(".quiz-create-container").classList.add("dnone");
        document.querySelector(".quiz-action-div").classList.remove("dnone");
        document.querySelector(".quiz-container").classList.remove("dnone");
    }

}

async function save_current_quiz_order(currentorder) {
    try{
        const token = localStorage.getItem("token");
        await apiFetch("http://localhost:4000/api/save_current_quiz_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({currentorder: currentorder})
        })
    }catch(err){
        console.error(err);
    }
    
}