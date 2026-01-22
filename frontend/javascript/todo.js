async function addTask(task_name, task_description, importance) {
    const token = localStorage.getItem('token');
    const response =  await fetch('/taskadd', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ task_name, task_description, importance })
    });
    const data = await response.json();
    return data;
}