document.getElementById("flashcard_form").addEventListener("submit", function (e) {
    e.preventDefault()
    add_deck();
});

document.getElementById("flashcardGameCard").addEventListener("click", function () {
    if(document.getElementById("flashcard").classList.contains("turn")){
        document.getElementById("flashcard").classList.remove("turn");
    }
    else{
        document.getElementById("flashcard").classList.add("turn");
    }
    
});


function build_deck(name, deck_id, cardcount) {
    const deck_item = document.createElement('div')
    deck_item.classList.add("deck_item")
    const deck_info = document.createElement("div")
    deck_info.classList.add("deck_info")
    const deck_name = document.createElement("span")
    deck_name.classList.add("deck_name")
    deck_name.textContent = name
    const deck_count = document.createElement("span")
    deck_count.classList.add("deck_count")
    deck_count.textContent = `${cardcount} kártya`
    deck_info.appendChild(deck_name)
    deck_info.appendChild(deck_count)
    deck_item.appendChild(deck_info)
    deck_item.onclick = () => deck_open(deck_id)
    return deck_item
}


function build_card(front_text, back_text, card_id) {
    const card_item = document.createElement('div');
    card_item.id = `card_${card_id}`;
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
    delete_button.onclick = () => card_delete(card_id); // CARD DELETE
    card_info.appendChild(card_front);
    card_info.appendChild(card_back);
    card_actions.appendChild(edit_button);
    card_actions.appendChild(delete_button);
    card_item.appendChild(card_info);
    card_item.appendChild(card_actions);
    return card_item
}

async function flashcard_start(deck_id) {
    try {
        document.getElementById("cardList").classList.add("dnone")
        document.getElementById("editDeckButton").classList.add("dnone")
        document.getElementById("addCardButton").classList.add("dnone")
        document.getElementById("startStudyButton").classList.add("dnone")
        document.getElementById("flashcardGameContainer").style.display = "flex"
        
        const token = localStorage.getItem('token');
        const cards_result = await apiFetch("http://localhost:4000/api/getcards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({deck_id: deck_id })
        })
        let sorrend = [];
        while (sorrend.length < cards_result.cards.length) {
            const random = getRandomInt(0, cards_result.cards.length)
            if(!sorrend.includes(random)){
                sorrend.push(random);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

async function card_delete(card_id) {
    try {
        const card = document.getElementById(`card_${card_id}`);
        const token = localStorage.getItem('token');

        const result = await apiFetch("http://localhost:4000/api/deletecard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ card_id: card_id })
        })
        alertell(result.message, 2.5)
        card.remove();

    } catch (err) {
        console.error(err);
    }
}


async function deck_szerkesztes(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/getdeckbydeck_id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id })
        });

        const adatok = result.decks[0];
        const card_add_modal = document.createElement("div")
        card_add_modal.classList.add('flashcard-modal')
        card_add_modal.id = "add_card_modal";
        const modal_content = document.createElement("div")
        modal_content.classList.add("flashcard-modal-content")
        const title = document.createElement("h3")
        title.textContent = "Pakli szerkesztése:"
        const deck_name = document.createElement("input")
        deck_name.type = "text"
        deck_name.id = "editDeckName"
        deck_name.value = adatok.deck_name
        deck_name.classList.add("flashcard_input")
        deck_name.placeholder = "Pakli neve (pl.: Történelem - 10. osztály)"
        deck_name.required = true

        const actions_div = document.createElement("div")
        actions_div.classList.add("modal-actions")

        const right_actions_div = document.createElement("div")
        right_actions_div.classList.add("right-actions");

        const save_button = document.createElement("button")
        save_button.textContent = "Mentés"
        save_button.classList.add("save_card_button");
        save_button.onclick = () => save_deck(deck_id);

        const cancel_button = document.createElement("button")
        cancel_button.textContent = "Mégse"
        cancel_button.classList.add("cancel_card_button")
        cancel_button.onclick = () => cancel_flashcard_modal();

        const delete_button = document.createElement("button")
        delete_button.textContent = "Törlés"
        delete_button.classList.add("delete_card_button")
        delete_button.onclick = () => delete_deck(deck_id);


        right_actions_div.appendChild(save_button)
        right_actions_div.appendChild(cancel_button)


        actions_div.appendChild(delete_button)
        actions_div.appendChild(right_actions_div)

        modal_content.appendChild(title)
        modal_content.appendChild(deck_name)
        modal_content.appendChild(actions_div)
        card_add_modal.appendChild(modal_content)
        document.body.appendChild(card_add_modal)
    } catch (err) {
        console.error(err);
    }
}


async function save_deck(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const deck_name = document.getElementById("editDeckName").value
        if (deck_name.length == 0) {
            alertell("Minimum 1 karakternek kell lennie!", 2.5)
        }
        else {
            const result = await apiFetch("http://localhost:4000/api/updatedeck", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ deck_id: deck_id, deck_name: deck_name })
            })

            alertell(result.message, 2.5)
            cancel_flashcard_modal()
            deck_open(deck_id)
        }
    } catch (err) {
        console.error(err);
    }
}


async function delete_deck(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/deletedeck", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id })
        })
        alertell(result.message, 2.5)
        cancel_flashcard_modal()
        load_deck()
    } catch (err) {
        console.error(err);
        alertell(`Sikertelen csatlakozás a szerverhez!`, 5);
    }

}


async function deck_open(deck_id) {
    try {
        const add_new_card_button = document.getElementById("addCardButton")
        add_new_card_button.onclick = () => add_new_card_modal(deck_id)
        document.getElementById("startStudyButton").onclick = () => flashcard_start(deck_id)
        const token = localStorage.getItem('token');
        document.getElementById("decks").classList.add("dnone")
        document.getElementById("cards").classList.remove("dnone")        
        const currentDeckName = document.getElementById("currentDeckName")

        //Pakli nevének lekérése
        const deck_result = await apiFetch("http://localhost:4000/api/getdeckbydeck_id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id })
        })

        currentDeckName.textContent = deck_result.decks[0].deck_name

        //Kártyák lekérése
        const cards_result = await apiFetch("http://localhost:4000/api/getcards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id })
        })

        let card_list = document.getElementById("cardList");
        card_list.innerHTML = ""
        for (let i = 0; i < cards_result.cards.length; i++) {
            card_list.appendChild(build_card(cards_result.cards[i].front_text, cards_result.cards[i].back_text, cards_result.cards[i].card_id, cards_result.cards[i].deck_id))
        }
        document.getElementById("editDeckButton").onclick = () => deck_szerkesztes(deck_id)
    } catch (err) {
        console.error(err);
    }
}


async function add_deck() {
    try {
        const deck_name = document.getElementById("newDeckName").value
        const token = localStorage.getItem('token');
        const result = await apiFetch("http://localhost:4000/api/add_deck", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_name: deck_name })
        })
        alertell(result.message, 2.5)
        load_deck()
    }
    catch (err) {
        console.error(err);
    }
}

async function load_deck() {
    try {
        const decks = document.getElementById("decks")
        const cards = document.getElementById("cards")
        if (decks.classList.contains("dnone")) {
            decks.classList.remove("dnone")
            if (!cards.classList.contains("dnone")) {
                cards.classList.add("dnone")
            }
        }
        const deck_list = document.getElementById("deckList")
        const token = localStorage.getItem('token');

        const result = await apiFetch("http://localhost:4000/api/deck_load", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });

        deck_list.innerHTML = "";
        for (let i = 0; i < result.decks.length; i++) {
            deck_list.appendChild(build_deck(result.decks[i].deck_name, result.decks[i].deck_id, result.decks[i].cardcount));
        }

    } catch (err) {
        console.error(err);
    }
}


function add_new_card_modal(deck_id) {
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


async function save_card(deck_id, card_id) {
    try {
        const token = localStorage.getItem('token');
        const front_text = document.getElementById("newCardFront").value
        const back_text = document.getElementById("newCardBack").value
        if (front_text.length == 0 || back_text.length == 0) {
            alertell("Minimum 1 karakternek kell lennie!", 2.5)
        }
        else {
            const result = await apiFetch("http://localhost:4000/api/updatecard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ card_id: card_id, front_text: front_text, back_text: back_text })
            })

            cancel_flashcard_modal()
            deck_open(deck_id)
            alertell(result.message, 2.5)
        }
    } catch (err) {
        console.error(err);
    }


}


async function card_edit(card_id) {
    try {
        const token = localStorage.getItem('token');

        const result = await apiFetch("http://localhost:4000/api/getcardbyid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ card_id: card_id })
        })
        const adatok = result.rows

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
        save_button.onclick = () => save_card(adatok.deck_id, adatok.card_id);
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
    } catch (err) {
        console.error(err);
    }

}


function cancel_flashcard_modal() {
    document.getElementById("add_card_modal").remove()
}


async function save_new_card(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const front_text = document.getElementById("newCardFront").value
        const back_text = document.getElementById("newCardBack").value
        if (front_text.length == 0 || back_text.length == 0) {
            alertell("Minimum 1 karakternek kell lennie!", 2.5)
        }
        else {
            const result = await apiFetch("http://localhost:4000/api/addnewcard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ deck_id: deck_id, front_text: front_text, back_text: back_text })
            })

            cancel_flashcard_modal()
            deck_open(deck_id)
            alertell(result.message, 2.5)
        }
    }
    catch (err) {
        console.error(err);
    }
}