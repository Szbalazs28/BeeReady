const heartBtn = document.getElementById('hive_btn_save')

heartBtn.addEventListener('click', () => {
    const isSaved = heartBtn.classList.toggle('saved');
    heartBtn.textContent = isSaved ? '♥' : '♡';
});

