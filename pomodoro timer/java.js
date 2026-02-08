let interval, remaining, total, running = false, sessions = 0, totalMinutes = 0;

//Page Load Setup
window.onload = function() {
    if (Notification.permission === 'default') Notification.requestPermission();
    updateDisplay(1500);
    let saved = localStorage.getItem('stats');
    if (saved) {
        saved = JSON.parse(saved);
        sessions = saved.sessions;
        totalMinutes = saved.totalMinutes;
        document.getElementById('sessions').textContent = sessions;
        document.getElementById('totalTime').textContent = totalMinutes + 'm';
    }
};

//Time Set
function setTime(mins) { 
    if (!running) {
        document.getElementById('duration').value = mins;
        updateDisplay(mins * 60);
    }
}

//Timer Start
function start() {
    if (running) return;
    let mins = parseInt(document.getElementById('duration').value);
    if (!mins || mins < 1) return alert('Please enter valid minutes');
    
    if (!interval) { total = mins * 60; remaining = total; }
    running = true;
    document.getElementById('status').textContent = '⏳ Working...';
    document.getElementById('start').style.display = 'none';
    document.getElementById('pause').style.display = 'block';
    document.getElementById('duration').disabled = true;
    
    interval = setInterval(function() {
        remaining--;
        updateDisplay(remaining);
        document.getElementById('fill').style.width = (remaining / total * 100) + '%';
        if (remaining <= 0) complete();
    }, 1000);
}

//Timer Pause
function pause() {
    clearInterval(interval);
    interval = null;
    running = false;
    document.getElementById('status').textContent = '⏸️ Paused';
    document.getElementById('start').style.display = 'block';
    document.getElementById('pause').style.display = 'none';
}

//Timer Reset
function reset() {
    clearInterval(interval);
    interval = null;
    running = false;
    let input = document.getElementById('duration').value;
    let mins = parseInt(input);
    
    // Check if already at the input value, then reset to 0
    if (remaining === mins * 60 && total === mins * 60) {
        remaining = 0;
        total = 0;
        document.getElementById('duration').value = '';
    } else if (!input || !mins || mins < 1) {
        // If no valid input, reset to 0
        remaining = 0;
        total = 0;
        document.getElementById('duration').value = '';
    } else {
        // Reset to the input value
        remaining = mins * 60;
        total = remaining;
    }
    
    updateDisplay(remaining);
    document.getElementById('fill').style.width = (total > 0 ? (remaining / total * 100) : 0) + '%';
    document.getElementById('status').textContent = 'Ready to focus';
    document.getElementById('start').style.display = 'block';
    document.getElementById('pause').style.display = 'none';
    document.getElementById('duration').disabled = false;
}


//Timer Complete
function complete() {
    clearInterval(interval);
    interval = null;
    running = false;
    
    sessions++;
    totalMinutes += Math.floor(total / 60);
    document.getElementById('sessions').textContent = sessions;
    document.getElementById('totalTime').textContent = totalMinutes + 'm';
    localStorage.setItem('stats', JSON.stringify({sessions: sessions, totalMinutes: totalMinutes}));
    
    document.getElementById('status').textContent = '✅ Time for a break!';
    document.getElementById('start').style.display = 'block';
    document.getElementById('pause').style.display = 'none';
    document.getElementById('duration').disabled = false;
    
    if (Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', { body: 'Great work! Time for a break! 🎉' });
    }
    
    if (document.getElementById('autoBreak').checked) {
        setTimeout(function() {
            if (confirm('Start 5 minute break?')) {
                document.getElementById('duration').value = 5;
                updateDisplay(300);
                start();
            }
        }, 2000);
    }
}


//Display Update
function updateDisplay(secs) {
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    document.getElementById('timer').textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    if (running) document.title = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s) + ' - Pomodoro';
}