document.getElementById("flashcard_form").addEventListener("submit", async function (e) {
    try {
        e.preventDefault()
        const inputvalue = document.getElementById("newDeckName").value
        if (inputvalue[0] == "#" && inputvalue.length == 9) {
            const token = localStorage.getItem('token');
            await apiFetch("http://localhost:4000/api/copy_deck", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ share_code: inputvalue.substring(1, 9) })
            })
            await load_deck()
        } else {
            await add_deck(inputvalue);
        }
    } catch (error) {
        console.error(error)
    }

});

document.getElementById("flashcardGameCard").addEventListener("click", function () {
    if (document.getElementById("flashcard").classList.contains("turn")) {
        document.getElementById("flashcard").classList.remove("turn");
    }
    else {
        document.getElementById("flashcard").classList.add("turn");
    }

});


function build_deck(name, deck_id, cardcount) {
    const deck_item = document.createElement('div')
    deck_item.draggable = true
    deck_item.setAttribute('data-id', deck_id)
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


function build_card(front_text, back_text, card_id, isForeign = null) {
    const card_item = document.createElement('div');
    card_item.draggable = true
    card_item.setAttribute('data-id', card_id);
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
    card_info.appendChild(card_front);
    card_info.appendChild(card_back);


    card_item.appendChild(card_info);
    
    if (!isForeign) {
        const card_actions = document.createElement("div");
        card_actions.classList.add("card_actions");

        const delete_button = document.createElement("button");
        delete_button.classList.add("del_card_button");
        delete_button.textContent = "Törlés";
        delete_button.onclick = () => card_delete(card_id); // CARD DELETE
        card_actions.appendChild(delete_button);

        const edit_button = document.createElement("button");
        edit_button.classList.add("edit_card_button");
        edit_button.textContent = "Szerkesztés";
        edit_button.onclick = () => card_edit(card_id); // CARD EDIT

        card_actions.appendChild(edit_button);
        card_actions.appendChild(delete_button);
        card_item.appendChild(card_actions);
    }

    return card_item
}

function flashcard_start(deck_id, isForeign = null) {
    if (document.getElementById("prevCardBtn").disabled == false) {
        document.getElementById("prevCardBtn").classList.add("disabled_game_button");
        document.getElementById("prevCardBtn").classList.remove("activ_game_button");
        document.getElementById("prevCardBtn").disabled = true;
    }
    if (document.getElementById("nextCardBtn").disabled == true) {
        document.getElementById("nextCardBtn").classList.remove("disabled_game_button");
        document.getElementById("nextCardBtn").classList.add("activ_game_button");
        document.getElementById("nextCardBtn").disabled = false;
    }
    document.getElementById("flashcardGameContainer").classList.remove("dnone");
    const backToCardsButton = document.getElementById("backToCardsButton");
    if (isForeign) {
        backToCardsButton.onclick = () => load_deck();
    }
    else {
        backToCardsButton.onclick = () => deck_open(deck_id);
    }

    document.querySelectorAll(".dnone_on_start").forEach(elem => elem.classList.add("dnone"));
    backToCardsButton.classList.remove("dnone");
    document.getElementById("flashcardGameContainer").style.display = "flex"
    const start_choice = document.createElement("div")
    start_choice.classList.add('flashcard-modal_c')
    start_choice.id = "add_card_modal";
    const buttons = document.createElement("div")
    buttons.classList.add("modal-actions_c")
    const modal_content = document.createElement("div")
    modal_content.classList.add("flashcard-modal-content_c")
    const title = document.createElement("h3")
    title.textContent = "Válasszon indítási módot:"
    const order_button = document.createElement("button")
    order_button.textContent = "Sorrendben"
    order_button.classList.add("chioice_button_o");
    order_button.onclick = () => flashcard_start_ordered(deck_id);
    const random_button = document.createElement("button")
    random_button.textContent = "Véletlenszerűen"
    random_button.classList.add("chioice_button_r");
    random_button.onclick = () => flashcard_start_random(deck_id);

    modal_content.appendChild(title)
    buttons.appendChild(order_button)
    buttons.appendChild(random_button)
    modal_content.appendChild(buttons)
    start_choice.appendChild(modal_content)
    document.body.appendChild(start_choice)
}

async function flashcard_start_ordered(deck_id) {
    try {
        document.getElementById("add_card_modal").remove()
        const token = localStorage.getItem('token');
        const cards_result = await apiFetch(`http://localhost:4000/api/getcards?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }

        })
        card_length_test(cards_result.cards, deck_id)
        let cards = []
        for (let i = 0; i < cards_result.cards.length; i++) {
            cards.push({
                index: i,
                front_text: cards_result.cards[i].front_text,
                back_text: cards_result.cards[i].back_text
            })
        }
        localStorage.setItem('flashcards', JSON.stringify(cards))
        card_data_load(0);
    } catch (error) {
        console.error(error);
    }
}

function card_length_test(cards, deck_id) {
    if (cards.length == 0) {
        deck_open(deck_id)
        alertell("Nincsenek kártyák a pakliban!", 2.5)
        throw new Error("Nincsenek kártyák a pakliban!")
    }
    else {
        if (cards.length == 1) {
            const nextBtn = document.getElementById("nextCardBtn");
            nextBtn.disabled = true;
            nextBtn.classList.add("disabled_game_button");
            nextBtn.classList.remove("activ_game_button");
        }
    }
}

function card_data_load(index) {
    const card_elem = document.getElementById("flashcard")
    if (card_elem.classList.contains("turn")) {
        card_elem.classList.remove("turn");
    }
    const cards = JSON.parse(localStorage.getItem('flashcards'));
    setTimeout(() => {
        document.getElementById("flashcard_front").textContent = cards[index].front_text;
        document.getElementById("flashcard_back").textContent = cards[index].back_text;
    }, 100);

    localStorage.setItem('current_flashcard_index', index);
}

function changeCard(index_change) {
    const card_length = JSON.parse(localStorage.getItem("flashcards")).length
    const nextcardbutton = document.getElementById("nextCardBtn")
    const prevcardbutton = document.getElementById("prevCardBtn")
    let currentindex = parseInt(localStorage.getItem('current_flashcard_index'));
    let newIndex = currentindex + index_change;
    if (newIndex <= 0) {
        prevcardbutton.disabled = true;
        prevcardbutton.classList.add("disabled_game_button");
        prevcardbutton.classList.remove("activ_game_button");
    } else {
        prevcardbutton.disabled = false;
        prevcardbutton.classList.add("activ_game_button");
        prevcardbutton.classList.remove("disabled_game_button");
    }
    if (newIndex >= card_length - 1) {
        nextcardbutton.disabled = true;
        nextcardbutton.classList.add("disabled_game_button");
        nextcardbutton.classList.remove("activ_game_button");
    } else {
        nextcardbutton.disabled = false;
        nextcardbutton.classList.add("activ_game_button");
        nextcardbutton.classList.remove("disabled_game_button");
    }
    card_data_load(currentindex + index_change);
}


async function flashcard_start_random(deck_id) {
    try {
        document.getElementById("add_card_modal").remove()
        const token = localStorage.getItem('token');
        const cards_result = await apiFetch(`http://localhost:4000/api/getcards?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        card_length_test(cards_result.cards, deck_id)
        let order = []
        let cards = []
        let i = 0;
        while (order.length < cards_result.cards.length) {
            const random = getRandomInt(0, cards_result.cards.length)
            if (!order.includes(random)) {
                order.push(random);
                cards.push({
                    index: i,
                    front_text: cards_result.cards[random].front_text,
                    back_text: cards_result.cards[random].back_text
                })
                i++
            }
        }
        localStorage.setItem('flashcards', JSON.stringify(cards))
        card_data_load(0);

    } catch (error) {
        console.error(error);
    }
}


async function card_delete(card_id) {
    try {
        const card = document.getElementById(`card_${card_id}`);
        const token = localStorage.getItem('token');

        await apiFetch(`http://localhost:4000/api/deletecard?card_id=${card_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        card.remove();

    } catch (err) {
        console.error(err);
    }
}


async function deck_edit_user(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch(`http://localhost:4000/api/getdeckbydeck_id?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
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

        const share_code_p = document.createElement("p")
        share_code_p.textContent = `Megosztási kód: #${adatok.share_code}`
        share_code_p.classList.add("share_code_p")
        share_code_p.id = "share_code"

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

        const share_button = document.createElement("button")
        share_button.textContent = "Megosztási kód váltás"
        share_button.classList.add("share_deck_button")
        share_button.onclick = () => share_code_change(deck_id);

        const label = document.createElement("label")
        label.textContent = "Publikus pakli"
        label.htmlFor = "publicDeckCheckbox"

        const publicDeckCheckbox = document.createElement("input")
        publicDeckCheckbox.type = "checkbox"
        publicDeckCheckbox.id = "publicDeckCheckbox"
        publicDeckCheckbox.checked = adatok.public

        right_actions_div.appendChild(save_button)
        right_actions_div.appendChild(cancel_button)


        actions_div.appendChild(delete_button)
        actions_div.appendChild(share_button)
        actions_div.appendChild(label)
        actions_div.appendChild(publicDeckCheckbox)
        actions_div.appendChild(right_actions_div)

        modal_content.appendChild(title)
        modal_content.appendChild(deck_name)
        modal_content.appendChild(share_code_p)
        modal_content.appendChild(actions_div)
        card_add_modal.appendChild(modal_content)
        document.body.appendChild(card_add_modal)
    } catch (err) {
        console.error(err);
    }
}

async function share_code_change(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const result = await apiFetch(`http://localhost:4000/api/change_share_code?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },

        })
        document.getElementById("share_code").textContent = `Megosztási kód: #${result.share_code}`;
    } catch (error) {
        console.error(error);
    }
}


async function save_deck(deck_id) {
    try {
        const token = localStorage.getItem('token');
        const deck_name = document.getElementById("editDeckName").value

        lengthtest(deck_name, 1, 200)

        await apiFetch("http://localhost:4000/api/updatedeck", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id, deck_name: deck_name, public: document.getElementById("publicDeckCheckbox").checked })
        })
        cancel_flashcard_modal()
        deck_open(deck_id)

    } catch (err) {
        console.error(err);
    }
}


async function delete_deck(deck_id) {
    try {
        const token = localStorage.getItem('token');
        await apiFetch(`http://localhost:4000/api/deletedeck?deck_id=${deck_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }

        })
        cancel_flashcard_modal()
        load_deck()
    } catch (err) {
        console.error(err);
    }

}


async function deck_open(deck_id, isForeign = null) {
    // Header eltunese
    const pageHeader = document.querySelector("#tanulokartyak .page_header");
    if (pageHeader) {
        pageHeader.classList.add("dnone");
    }

    try {
        localStorage.removeItem('flashcards');
        localStorage.removeItem('current_flashcard_index');
        if (document.getElementById("cardList").classList.contains("dnone")) {
            document.querySelectorAll(".dnone_on_start").forEach(elem => elem.classList.remove("dnone"));
            document.getElementById("backToCardsButton").classList.add("dnone");
            document.getElementById("flashcardGameContainer").classList.add("dnone");
        }

        if(isForeign){
            document.getElementById("addCardButton").classList.add("dnone");
            document.getElementById("addCardButton").onclick = () => { alertell("Nincs jogosultságod új kártya hozzáadásához!", 2.5) };
        }

        const add_new_card_button = document.getElementById("addCardButton")
        add_new_card_button.onclick = () => add_new_card_modal(deck_id)
        document.getElementById("startStudyButton").onclick = () => flashcard_start(deck_id)
        const token = localStorage.getItem('token');
        document.getElementById("decks").classList.add("dnone")
        document.getElementById("cards").classList.remove("dnone")
        const currentDeckName = document.getElementById("currentDeckName")

        //Pakli nevének lekérése
        const deck_result = await apiFetch(`http://localhost:4000/api/getdeckbydeck_id?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })

        currentDeckName.textContent = deck_result.decks[0].deck_name

        //Kártyák lekérése
        const cards_result = await apiFetch(`http://localhost:4000/api/getcards?deck_id=${deck_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })

        let card_list = document.getElementById("cardList");
        card_list.innerHTML = ""
        for (let i = 0; i < cards_result.cards.length; i++) {
            card_list.appendChild(build_card(cards_result.cards[i].front_text, cards_result.cards[i].back_text, cards_result.cards[i].card_id, cards_result.cards[i].deck_id))
        }
        document.getElementById("editDeckButton").onclick = () => deck_edit_user(deck_id)
        const el = document.getElementById('cardList');
        if (!isForeign) {
            Sortable.create(el, {
                animation: 150,
                dataIdAttr: 'data-id',
                onEnd: function (evt) {
                    const currentorder = Sortable.get(evt.from).toArray();
                    save_new_card_order(deck_id, currentorder);
                }
            });
        }

    } catch (err) {
        console.error(err);
    }
}

async function save_new_card_order(deck_id, currentorder) {
    try {
        const token = localStorage.getItem('token');
        await apiFetch("http://localhost:4000/api/save_new_card_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id, currentorder: currentorder })
        });
    } catch (err) {
        console.error(err);
    }
}


async function add_deck(deck_name) {
    try {

        const token = localStorage.getItem('token');
        await apiFetch("http://localhost:4000/api/add_deck", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_name: deck_name })
        })
        await load_deck()
    }
    catch (err) {
        console.error(err);
    }
}

async function load_deck() {
    try {
        // Header megjelenítése 
        const pageHeader = document.querySelector("#tanulokartyak .page_header");
        if (pageHeader) {
            pageHeader.classList.remove("dnone");
        }


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
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });

        deck_list.innerHTML = "";
        for (let i = 0; i < result.decks.length; i++) {
            deck_list.appendChild(build_deck(result.decks[i].deck_name, result.decks[i].deck_id, result.decks[i].cardcount));
        }

        const el = document.getElementById('deckList');
        Sortable.create(el, {
            animation: 150,
            dataIdAttr: 'data-id',
            onEnd: function (evt) {
                const currentorder = Sortable.get(evt.from).toArray();
                save_new_deck_order(currentorder);
            }
        });

    } catch (err) {
        console.error(err);
    }
}

async function save_new_deck_order(currentorder) {
    try {
        const token = localStorage.getItem('token');
        await apiFetch("http://localhost:4000/api/save_new_deck_order", {
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
        lengthtest(front_text, 1, 255)
        lengthtest(back_text, 1, 400)
        await apiFetch("http://localhost:4000/api/updatecard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ card_id: card_id, front_text: front_text, back_text: back_text })
        })

        cancel_flashcard_modal()
        deck_open(deck_id)

    } catch (err) {
        console.error(err);
    }


}


async function card_edit(card_id) {
    try {
        const token = localStorage.getItem('token');

        const result = await apiFetch(`http://localhost:4000/api/getcardbyid?card_id=${card_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
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
        lengthtest(front_text, 1, 255)
        lengthtest(back_text, 1, 400)
        await apiFetch("http://localhost:4000/api/addnewcard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ deck_id: deck_id, front_text: front_text, back_text: back_text })
        })

        cancel_flashcard_modal()
        deck_open(deck_id)




    }
    catch (err) {
        console.error(err);
    }
}