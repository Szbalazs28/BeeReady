document.getElementById("flashcard_form").addEventListener("submit", function(e) {
    e.preventDefault() 
    add_deck();
});

async function build_deck(name, deck_id){   
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/cardcounter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({deck_id: deck_id}) 
    })
    const result = await response.json()
    const count = result.message

    const deck_item = document.createElement('div')
    deck_item.classList.add("deck_item")
    const deck_info = document.createElement("div")
    deck_info.classList.add("deck_info")
    const deck_name = document.createElement("span")
    deck_name.classList.add("deck_name")
    deck_name.textContent=name
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
        body: JSON.stringify({card_id: card_id}) 
    })
    const message = await response.json()
    alertell(message.message, 2.5)
    deck_open(deck_id)
    
}

async function  deck_szerkesztes(deck_id) {
    const token = localStorage.getItem('token');
    const deck_edit_modal = document.createElement("div")
    deck_edit_modal.classList.add('deck-edit-modal')  
    deck_edit_modal.id="deck_edit_modal"
    const deck_modal_content = document.createElement("div")
    const input = document.createElement("input")
    input.type="text"
    input.classList.add("deck_edit_input")
    input.placeholder="Pakli neve (pl.: Történelem - 10. osztály)"
    input.required = true
    const response = await fetch("http://localhost:4000/api/deck_edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({deck_id: deck_id})       
    });
    const result = await response.json()
    input.value=result.decks[0].deck_name
    const button0 = document.createElement("button")
    button0.textContent="Mentés"
    button0.classList.add("save_deck")
    button0.onclick = () => save_deck(deck_id)
    const button1 = document.createElement("button")
    button1.textContent="Mégse"
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

async function  deck_open(deck_id) {
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
        body: JSON.stringify({deck_id: deck_id}) 
    })    
    const message = await deckname.json()    
    currentDeckName.textContent=message.decks[0].deck_name
    const response = await fetch("http://localhost:4000/api/getcards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({deck_id: deck_id}) 
    })
    let card_list = document.getElementById("cardList"); 
    card_list.innerHTML=""    
    const cards = await response.json()
    for(let i = 0; i<cards.cards.length;i++){
        card_list.appendChild(build_card(cards.cards[i].front_text, cards.cards[i].back_text, cards.cards[i].card_id, cards.cards[i].deck_id)) 
    }

}

function megse(){    
    document.getElementById("deck_edit_modal").remove()
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
        body: JSON.stringify({deck_name: deck_name})
    })
    const message = await response.json()
    alertell(message.message,2.5)
    load_deck()
}

async function load_deck() {  
    const decks = document.getElementById("decks")
    const cards = document.getElementById("cards")
    if(decks.classList.contains("dnone")){
        decks.classList.remove("dnone")
        if(!cards.classList.contains("dnone")){
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
    for(let i = 0; i<rows.decks.length; i++){
        deck_list.appendChild(await build_deck(rows.decks[i].deck_name, rows.decks[i].deck_id))
        
    }
}

