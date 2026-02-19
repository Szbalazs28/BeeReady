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
            quizContainer.appendChild(build_quiz(result.quizzes[i].title, result.quizzes[i].description, result.quizzes[i].quiz_id, result.quizzes[i].question_count, result.quizzes[i].created_at, result.quizzes[i].last_result))
        }
    }
    catch (err) {
        console.error(err);
    }
}

function build_quiz(title, description, quiz_id, question_count, created, last_result) {
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

    const quiz_count = document.createElement("p")
    quiz_count.classList.add("quiz-meta", "quiz-count")
    quiz_count.textContent = `${question_count} kérdés`

    const quiz_created = document.createElement("p")
    quiz_created.classList.add("quiz-meta", "quiz-created")
    quiz_created.textContent = created

    quiz_meta_row.appendChild(quiz_count)
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
    quiz_element.appendChild(quiz_actions)

    return quiz_element
}