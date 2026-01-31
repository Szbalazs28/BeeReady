document.getElementById("weekSelector").onchange = async () => {
    const weekType = document.getElementById("weekSelector").value;
    const token = localStorage.getItem("token");
    const result = await apiFetch("http://127.0.0.1:4000/api/change_selected_week", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ week_type: weekType })
    })

    await load_events();


}

async function createEventModal() {

    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add('timetable-modal-overlay');
    modalOverlay.id = "event_modal";

    const modalContent = document.createElement("div");
    modalContent.classList.add("timetable-modal-content");

    const title = document.createElement("h3");
    title.classList.add("modal-title");
    title.textContent = "Esemény hozzáadása";


    const dayWrapper = document.createElement("div");
    dayWrapper.classList.add("modal-field-wrapper");

    const dayLabel = document.createElement("label");
    dayLabel.classList.add("modal-label");
    dayLabel.textContent = "Nap kiválasztása:";
    dayLabel.for = "modal_day_select";
    const daySelect = document.createElement("select");
    daySelect.id = "modal_day_select";
    daySelect.classList.add("timetable-input");
    const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"]
    for (let i = 0; i < days.length; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = days[i];
        daySelect.appendChild(opt);
    }

    dayWrapper.append(dayLabel, daySelect);


    const timeRow = document.createElement("div");
    timeRow.classList.add("timetable-time-row");


    const startWrapper = document.createElement("div");
    startWrapper.classList.add("modal-field-wrapper");
    const startLabel = document.createElement("label");
    startLabel.classList.add("modal-label");
    startLabel.textContent = "Kezdés:";
    const startTimeInput = document.createElement("input");
    startTimeInput.type = "time";
    startTimeInput.classList.add("timetable-input");
    startTimeInput.id = "modal_start_time";
    startWrapper.append(startLabel, startTimeInput);


    const endWrapper = document.createElement("div");
    endWrapper.classList.add("modal-field-wrapper");
    const endLabel = document.createElement("label");
    endLabel.classList.add("modal-label");
    endLabel.textContent = "Vége:";
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "time";
    endTimeInput.classList.add("timetable-input");
    endTimeInput.id = "modal_end_time";
    endWrapper.append(endLabel, endTimeInput);

    timeRow.append(startWrapper, endWrapper);


    const subjectWrapper = document.createElement("div");
    subjectWrapper.classList.add("modal-field-wrapper");
    const subjectLabel = document.createElement("label");
    subjectLabel.classList.add("modal-label");
    subjectLabel.textContent = "Tantárgy neve:";
    const subjectInput = document.createElement("input");
    subjectInput.type = "text";
    subjectInput.classList.add("timetable-input");
    subjectInput.placeholder = "Pl. Matek";
    subjectInput.id = "modal_subject_input";
    subjectWrapper.append(subjectLabel, subjectInput);


    const locationWrapper = document.createElement("div");
    locationWrapper.classList.add("modal-field-wrapper");
    const locationLabel = document.createElement("label");
    locationLabel.classList.add("modal-label");
    locationLabel.textContent = "Helyszín:";
    const locationInput = document.createElement("input");
    locationInput.type = "text";
    locationInput.classList.add("timetable-input");
    locationInput.placeholder = "Pl. B42";
    locationInput.id = "modal_location_input";
    locationWrapper.append(locationLabel, locationInput);


    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("modal-button-group");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Mentés";
    saveBtn.classList.add("btn-save");
    saveBtn.onclick = async () => {
        await saveNewEvent();
        modalOverlay.remove();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Mégse";
    cancelBtn.classList.add("btn-cancel");
    cancelBtn.onclick = () => modalOverlay.remove();

    actionsDiv.append(saveBtn, cancelBtn);
    modalContent.append(
        title,
        dayWrapper,
        timeRow,
        subjectWrapper,
        locationWrapper,
        actionsDiv
    );
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

async function saveNewEvent() {
    const day = document.getElementById("modal_day_select").value;
    const startTime = document.getElementById("modal_start_time").value;
    const endTime = document.getElementById("modal_end_time").value;
    const subject = document.getElementById("modal_subject_input").value;
    const location = document.getElementById("modal_location_input").value;
    const weekType = document.getElementById("weekSelector").value;
    const token = localStorage.getItem("token");
    const result = await apiFetch("http://127.0.0.1:4000/api/save_new_event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ day: day, start_time: startTime, end_time: endTime, subject: subject, location: location, week_type: weekType })
    })
    load_events();
}

async function load_events() {
    try {
        document.querySelectorAll(".event-card").forEach(e => e.remove());
        const token = localStorage.getItem("token");
        const result = await apiFetch("http://127.0.0.1:4000/api/get_events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
        })
        if (result.events && result.events.length > 0) {
            const currentWeek = result.events[0].week_type;
            const selector = document.getElementById("weekSelector");
            if (selector.value !== currentWeek) {
                selector.value = currentWeek;
            }            
            const events = result.events;
            for (let i = 0; i < events.length; i++) {
                build_event(events[i]);
            }
        } 
        else {            
            console.log("Nincsenek események a kiválasztott héten.");                        
        }

    } catch (error) {
        console.error(error)
    }
}

function build_event(event) {
    const eventCard = document.createElement("div");
    eventCard.onclick = () => {

    }
    eventCard.classList.add("event-card");
    const eventTime = document.createElement("span");
    eventTime.classList.add("event-time");
    eventTime.textContent = `${event.start_time} - ${event.end_time}`;
    const eventTitle = document.createElement("h4");
    eventTitle.classList.add("event-title");
    eventTitle.textContent = event.subject;
    const eventLocation = document.createElement("p");
    eventLocation.classList.add("event-location");
    eventLocation.textContent = event.location;
    eventCard.appendChild(eventTime);
    eventCard.appendChild(eventTitle);
    eventCard.appendChild(eventLocation);
    document.getElementById(`day_${event.day}`).appendChild(eventCard);
}