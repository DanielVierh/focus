"use strict";
const btn_new_timer = document.getElementById('btn_new_timer');
const btn_play_pause = document.getElementById('btn_play_pause');
const inp_timer_title = document.getElementById('inp_timer_title');
const timers = document.getElementById('timers');
let timer;
let is_timer_running = false;
let save_object = {
    main_timer: 0,
    sub_timers: [],
    theme: 'light',
    active_timer: -1
};
class Timer {
    constructor(title, elapsed_time) {
        this.title = title;
        this.elapsed_time = elapsed_time;
    }
}
function init() {
    render_timer();
    show_active();
}
init();
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener('click', () => {
    if (inp_timer_title.value !== '') {
        timers.innerHTML = '';
        save_object.sub_timers.push(new Timer(inp_timer_title.value, 0));
        inp_timer_title.value = '';
        render_timer();
    }
});
function render_timer() {
    save_object.sub_timers.forEach((timer, index) => {
        index++;
        let timer_div = document.createElement('div');
        timer_div.classList.add('focus-timer');
        timer_div.addEventListener('click', () => {
            save_object.active_timer = index;
            remove_active_class();
            timer_div.classList.add('active');
        });
        let timer_title = document.createElement('div');
        timer_title.classList.add('label');
        timer_title.innerHTML = timer.title;
        let timer_time = document.createElement('div');
        timer_time.classList.add('timer');
        timer_time.innerHTML = convert_seconds_to_time(timer.elapsed_time);
        let delete_btn = document.createElement('div');
        delete_btn.classList.add('delete-button');
        delete_btn.innerHTML = 'x';
        delete_btn.addEventListener('click', () => {
            console.log(index);
        });
        timer_div.appendChild(timer_title);
        timer_div.appendChild(timer_time);
        timer_div.appendChild(delete_btn);
        timers.appendChild(timer_div);
    });
}
function remove_active_class() {
    const timers = document.querySelectorAll('.focus-timer');
    timers.forEach((timer) => {
        timer.classList.remove('active');
    });
}
function show_active() {
    const timers = document.querySelectorAll('.focus-timer');
    try {
        timers[save_object.active_timer].classList.add('active');
    }
    catch (error) {
        console.log(error);
    }
}
function convert_seconds_to_time(seconds) {
    let elapsed_time;
    const date = new Date(0);
    date.setSeconds(seconds);
    elapsed_time = date.toISOString().substr(11, 8);
    return elapsed_time;
}
function add_zero(val) {
    let returnVal = '';
    if (val < 10) {
        returnVal = `0${val}`;
    }
    else {
        returnVal = String(val);
    }
    return returnVal;
}
btn_play_pause.addEventListener('click', () => {
    play_pause();
});
function play_pause() {
    if (save_object.active_timer !== -1) {
        if (is_timer_running === false) {
            is_timer_running = true;
            timer = setInterval(timeRunning, 1000);
        }
        else {
            is_timer_running = false;
            clearInterval(timer);
        }
    }
}
function timeRunning() {
    setInterval(() => {
        const timers = document.querySelectorAll('.focus-timer');
        const index = save_object.active_timer - 1;
        save_object.sub_timers[index].elapsed_time++;
        timers[index].innerHTML = convert_seconds_to_time(save_object.sub_timers[index].elapsed_time);
    }, 1000);
}
//# sourceMappingURL=index.js.map