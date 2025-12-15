

document.getElementById("flashcard_form").addEventListener("submit", function (e) {
    e.preventDefault()
    add_deck();
});

async function build_deck(name, deck_id) {
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/cardcounter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deck_id: deck_id })
    })
    const result = await response.json()
    const count = result.message

    const deck_item = document.createElement('div')
    deck_item.classList.add("deck_item")
    const deck_info = document.createElement("div")
    deck_info.classList.add("deck_info")
    const deck_name = document.createElement("span")
    deck_name.classList.add("deck_name")
    deck_name.textContent = name
    const deck_count = document.createElement("span")
    deck_count.classList.add("deck_count")
    deck_count.textContent = `${count} kártya`
    deck_info.appendChild(deck_name)
    deck_info.appendChild(deck_count)
    deck_item.appendChild(deck_info)
    deck_item.onclick = () => deck_open(deck_id)
    return deck_item
}

function build_card(front_text, back_text, card_id, deck_id) {
    const card_item = document.createElement('div');
    card_item.classList.add("card_item");
    const card_info = document.createElement("div");
    card_info.classList.add("card_info");
    const card_front = document.createElement("p");
    card_front.classList.add("card_front");
    card_front.textContent = front_text;
    const card_back = document.createElement("p");
    card_back.classList.add("card_back");
    card_back.textContent = back_text;
    const card_actions = document.createElement("div");
    card_actions.classList.add("card_actions");
    const edit_button = document.createElement("button");
    edit_button.classList.add("edit_card_button");
    edit_button.textContent = "Szerkesztés";
    edit_button.onclick = () => card_edit(card_id); // CARD EDIT
    const delete_button = document.createElement("button");
    delete_button.classList.add("del_card_button");
    delete_button.textContent = "Törlés";
    delete_button.onclick = () => card_delete(card_id, deck_id); // CARD DELETE
    card_info.appendChild(card_front);
    card_info.appendChild(card_back);
    card_actions.appendChild(edit_button);
    card_actions.appendChild(delete_button);
    card_item.appendChild(card_info);
    card_item.appendChild(card_actions);
    return card_item
}

async function card_delete(card_id, deck_id) {
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/deletecard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ card_id: card_id })
    })
    const message = await response.json()
    alertell(message.message, 2.5)
    deck_open(deck_id)

}
//EZ NEM MŰKÖDIK
async function deck_szerkesztes(deck_id) {
    const token = localStorage.getItem('token');
    const deck_edit_modal = document.createElement("div")
    deck_edit_modal.classList.add('deck-edit-modal')
    deck_edit_modal.id = "deck_edit_modal"
    const deck_modal_content = document.createElement("div")
    const input = document.createElement("input")
    input.type = "text"
    input.classList.add("deck_edit_input")
    input.placeholder = "Pakli neve (pl.: Történelem - 10. osztály)"
    input.required = true
    const response = await fetch("http://localhost:4000/api/deck_edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deck_id: deck_id })
    });
    const result = await response.json()
    input.value = result.decks[0].deck_name
    const button0 = document.createElement("button")
    button0.textContent = "Mentés"
    button0.classList.add("save_deck")
    button0.onclick = () => save_deck(deck_id)
    const button1 = document.createElement("button")
    button1.textContent = "Mégse"
    button1.classList.add("cancel_save_deck")
    button1.onclick = () => megse()
    deck_modal_content.classList.add("deck-modal-content")
    deck_modal_content.appendChild(input)
    deck_modal_content.appendChild(button0)
    deck_modal_content.appendChild(button1)
    deck_edit_modal.appendChild(deck_modal_content)
    const bodyElement = document.body;
    bodyElement.appendChild(deck_edit_modal)
}

async function deck_open(deck_id) {
    const add_new_card_button = document.getElementById("addCardButton")
    add_new_card_button.value = deck_id
    const token = localStorage.getItem('token');
    document.getElementById("decks").classList.add("dnone")
    document.getElementById("cards").classList.remove("dnone")
    const currentDeckName = document.getElementById("currentDeckName")
    const deckname = await fetch("http://localhost:4000/api/getdeckbydeck_id", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deck_id: deck_id })
    })
    const message = await deckname.json()
    currentDeckName.textContent = message.decks[0].deck_name
    const response = await fetch("http://localhost:4000/api/getcards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deck_id: deck_id })
    })
    let card_list = document.getElementById("cardList");
    card_list.innerHTML = ""
    const cards = await response.json()
    for (let i = 0; i < cards.cards.length; i++) {
        card_list.appendChild(build_card(cards.cards[i].front_text, cards.cards[i].back_text, cards.cards[i].card_id, cards.cards[i].deck_id))
    }

}




async function add_deck() {
    const deck_name = document.getElementById("newDeckName").value
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/add_deck", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deck_name: deck_name })
    })
    const message = await response.json()
    alertell(message.message, 2.5)
    load_deck()
}

async function load_deck() {

    const decks = document.getElementById("decks")
    const cards = document.getElementById("cards")
    if (decks.classList.contains("dnone")) {
        decks.classList.remove("dnone")
        if (!cards.classList.contains("dnone")) {
            cards.classList.add("dnone")
        }
    }
    let deck_list = document.getElementById("deckList")
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/deck_load", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
    })
    const rows = await response.json()
    deck_list.innerHTML = ""
    for (let i = 0; i < rows.decks.length; i++) {
        deck_list.appendChild(await build_deck(rows.decks[i].deck_name, rows.decks[i].deck_id))

    }
}

async function add_new_card_modal() {
    const deck_id = document.getElementById("addCardButton").value
    const card_add_modal = document.createElement("div")
    card_add_modal.classList.add('flashcard-modal')
    card_add_modal.id = "add_card_modal";
    const modal_content = document.createElement("div")
    modal_content.classList.add("flashcard-modal-content")
    const title = document.createElement("h3")
    title.textContent = "Új Kártya Hozzáadása"
    const front_input = document.createElement("input")
    front_input.type = "text"
    front_input.id = "newCardFront"
    front_input.classList.add("flashcard_input")
    front_input.placeholder = "Kártya elülső oldala (pl.: Alma)"
    front_input.required = true
    const back_textarea = document.createElement("textarea")
    back_textarea.id = "newCardBack"
    back_textarea.classList.add("flashcard_textarea")
    back_textarea.placeholder = "Kártya hátsó oldala (pl.: Édes-savanyú, ehető gyümölcs, almafán terem.)"
    back_textarea.required = true
    const actions_div = document.createElement("div")
    actions_div.classList.add("modal-actions")
    const save_button = document.createElement("button")
    save_button.textContent = "Mentés"
    save_button.classList.add("save_card_button");
    save_button.onclick = () => save_new_card(deck_id);
    const cancel_button = document.createElement("button")
    cancel_button.textContent = "Mégse"
    cancel_button.classList.add("cancel_card_button")
    cancel_button.onclick = () => cancel_flashcard_modal();
    actions_div.appendChild(save_button)
    actions_div.appendChild(cancel_button)
    modal_content.appendChild(title)
    modal_content.appendChild(front_input)
    modal_content.appendChild(back_textarea)
    modal_content.appendChild(actions_div)
    card_add_modal.appendChild(modal_content)
    document.body.appendChild(card_add_modal)
}

async function card_edit(card_id) {
    const response = await fetch("http://localhost:4000/api/getcardbyid", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ card_id: card_id })
    })
    const result = await response.json()
    const adatok = result.rows


    const deck_id = document.getElementById("addCardButton").value
    const card_add_modal = document.createElement("div")
    card_add_modal.classList.add('flashcard-modal')
    card_add_modal.id = "add_card_modal";
    const modal_content = document.createElement("div")
    modal_content.classList.add("flashcard-modal-content")
    const title = document.createElement("h3")
    title.textContent = "Kártya szerkesztése:"
    const front_input = document.createElement("input")
    front_input.type = "text"
    front_input.id = "newCardFront"
    front_input.classList.add("flashcard_input")
    front_input.placeholder = "Kártya elülső oldala (pl.: Alma)"
    front_input.required = true
    front_input.value = adatok.front_text
    const back_textarea = document.createElement("textarea")
    back_textarea.id = "newCardBack"
    back_textarea.classList.add("flashcard_textarea")
    back_textarea.placeholder = "Kártya hátsó oldala (pl.: Édes-savanyú, ehető gyümölcs, almafán terem.)"
    back_textarea.required = true
    back_textarea.value = adatok.back_text
    const actions_div = document.createElement("div")
    actions_div.classList.add("modal-actions")
    const save_button = document.createElement("button")
    save_button.textContent = "Mentés"
    save_button.classList.add("save_card_button");
    save_button.onclick = () => updatecard(deck_id); //ITT TARTOK!!!!!!!!
    const cancel_button = document.createElement("button")
    cancel_button.textContent = "Mégse"
    cancel_button.classList.add("cancel_card_button")
    cancel_button.onclick = () => cancel_flashcard_modal();
    actions_div.appendChild(save_button)
    actions_div.appendChild(cancel_button)
    modal_content.appendChild(title)
    modal_content.appendChild(front_input)
    modal_content.appendChild(back_textarea)
    modal_content.appendChild(actions_div)
    card_add_modal.appendChild(modal_content)
    document.body.appendChild(card_add_modal)
}


function cancel_flashcard_modal() {
    document.getElementById("add_card_modal").remove()
}


async function save_new_card(deck_id) {
    const token = localStorage.getItem('token');
    const front_text = document.getElementById("newCardFront").value
    const back_text = document.getElementById("newCardBack").value
    if (front_text.length == 0 || back_text.length == 0) {
        alertell("Minimum 1 karakternek kell lennie!", 2.5)
    }
    else {
        const response = await fetch("http://localhost:4000/api/addnewcard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id, front_text: front_text, back_text: back_text })
        })
        const result = await response.json()
        cancel_flashcard_modal()
        deck_open(deck_id)
        alertell(result.message, 2.5)
    }

}