let timer;
let isRunning = false;
let timeLeft = 25 * 60; 
const timerDisplay = document.getElementById('timer_display');
const startB = document.getElementById('start_timer');
const pauseB = document.getElementById('stop_timer');
const resetB = document.getElementById('reset_timer');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
// = padStart(`mennyi a kivant szamhossz`, `mi legyen a kiegeszitokarakter`)

function start() {
    if (!isRunning) {
        isRunning = true;
        startB.disabled = true;
        pauseB.disabled = false;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            }
            else {
                clearInterval(timer);
                isRunning = false;
                timerDisplay.innerHTML = '<span class="timer_message">Idő lejárt! Ideje egy kis szünetet tartani.</span>';
                pauseB.disabled = true;
            }
        }, 1000);
    }
    else { return }
}
function pause() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startB.disabled = false;
    }
    else { return };
}
function reset() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 25 * 60;
    startB.disabled = false;
    updateDisplay();
}

updateDisplay();