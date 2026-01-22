async function submitTask() {
    const task_name = document.getElementById('task_name').value;
    const task_description = document.getElementById('task_description').value;
    const importance = document.getElementById('importance').value;

    const response = await fetch('/taskadd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
            task_name,
            task_description,
            importance
        })
    });

    const result = await response.json();
    if (result.success) {
        alert("Siker: " + result.message);
        location.reload(); 
    } else {
        alert("Hiba: " + result.message);
    }
}