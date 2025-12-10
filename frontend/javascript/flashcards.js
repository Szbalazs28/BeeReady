document.getElementById("flashcard_form").addEventListener("submit", function(e) {
    e.preventDefault() 
    add_deck();
});

function build_deck(name){
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
    edit_deck_button.classList.add("edit_deck_button")
    edit_deck_button.textContent = "Szerkesztés"
    deck_actions.appendChild(edit_deck_button)
    deck_item.appendChild(deck_actions)
    deck_list.appendChild(deck_item)
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
        build_deck(rows.decks[i].deck_name)
    }
}