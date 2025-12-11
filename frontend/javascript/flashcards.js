document.getElementById("flashcard_form").addEventListener("submit", function(e) {
    e.preventDefault() 
    add_deck();
});

function build_deck(name, deck_id){
    const deck_list = document.getElementById("deckList")
    const deck_item = document.createElement('div')
    deck_item.classList.add("deck_item")
    const deck_info = document.createElement("div")
    deck_info.classList.add("deck_info")
    const deck_name = document.createElement("span")
    deck_name.classList.add("deck_name")
    deck_name.textContent=name
    const deck_count = document.createElement("span")
    deck_count.classList.add("deck_count")
    deck_count.textContent = "32 kártya"
    deck_info.appendChild(deck_name)
    deck_info.appendChild(deck_count)
    deck_item.appendChild(deck_info)
    const deck_actions = document.createElement("div")
    deck_actions.classList.add("deck_actions")
    const edit_deck_button = document.createElement("button")
    edit_deck_button.onclick = () => deck_szerkesztes(deck_id);
    edit_deck_button.classList.add("edit_deck_button")
    edit_deck_button.textContent = "Szerkesztés"
    deck_actions.appendChild(edit_deck_button)
    deck_item.appendChild(deck_actions)
    deck_item.onclick = () => deck_open(deck_id)
    deck_list.appendChild(deck_item)
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
    
}

function megse(){    
    document.getElementById("deck_edit_modal").remove()
}

async function save_deck(){

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
    const deck_list = document.getElementById("deckList").innerHTML = ""
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:4000/api/deck_load", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },        
    })
    const rows = await response.json()

    for(let i = 0; i<rows.decks.length; i++){
        build_deck(rows.decks[i].deck_name, rows.decks[i].deck_id)
    }
}

