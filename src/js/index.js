"use strict";
const btn_new_timer = document.getElementById('btn_new_timer');
const btn_run_pause = document.getElementById('btn_run_pause');
const inp_timer_title = document.getElementById('inp_timer_title');
const timers = document.getElementById('timers');
const mainTimer = document.getElementById('mainTimer');
const btn_refresh_main = document.getElementById('btn_refresh_main');
const btn_open_settings = document.getElementById('btn_open_settings');
const btn_x = document.getElementById('btn_x');
const btn_theme_light = document.getElementById('btn_theme_light');
const btn_theme_dark = document.getElementById('btn_theme_dark');
const btn_theme_teal = document.getElementById('btn_theme_teal');
const btn_theme_red = document.getElementById('btn_theme_red');
const modal_settings = document.getElementById('modal_settings');
const r = document.querySelector(':root');
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
    load_local_storage();
    setTimeout(() => {
        render_timer();
        show_active();
        check_Theme();
    }, 200);
}
init();
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener('click', () => {
    add_new_Timer();
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        add_new_Timer();
    }
});
function add_new_Timer() {
    if (inp_timer_title.value !== '') {
        timers.innerHTML = '';
        save_object.sub_timers.push(new Timer(inp_timer_title.value, 0));
        inp_timer_title.value = '';
        save_into_storage();
        render_timer();
        show_active();
    }
}
function render_timer() {
    timers.innerHTML = '';
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        let timer_div = document.createElement('div');
        timer_div.classList.add('focus-timer');
        timer_div.addEventListener('click', () => {
            save_object.active_timer = i;
            remove_active_class();
            timer_div.classList.add('active');
        });
        let timer_title = document.createElement('div');
        timer_title.classList.add('label');
        timer_title.innerHTML = save_object.sub_timers[i].title;
        let timer_time = document.createElement('div');
        timer_time.classList.add('timer');
        timer_time.innerHTML = convert_seconds_to_time(save_object.sub_timers[i].elapsed_time);
        let refresh_btn = document.createElement('div');
        refresh_btn.classList.add('refresh-button');
        refresh_btn.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                    </svg>`;
        refresh_btn.addEventListener('click', () => {
            refreshTimer(i);
        });
        let delete_btn = document.createElement('div');
        delete_btn.classList.add('delete-button');
        delete_btn.innerHTML = 'x';
        delete_btn.addEventListener('click', () => {
            deleteTimer(i);
        });
        timer_div.appendChild(timer_title);
        timer_div.appendChild(timer_time);
        timer_div.appendChild(refresh_btn);
        timer_div.appendChild(delete_btn);
        timers.appendChild(timer_div);
    }
}
function deleteTimer(index) {
    const confirm = window.confirm('Soll der Timer gelöscht werden?');
    if (confirm) {
        save_object.sub_timers.splice(index, 1);
        render_timer();
        timers_sum();
        save_into_storage();
    }
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
function load_local_storage() {
    if (localStorage.getItem('stored_focus') !== null) {
        try {
            save_object = JSON.parse(localStorage.getItem('stored_focus'));
            mainTimer.innerHTML = convert_seconds_to_time(save_object.main_timer);
        }
        catch (error) {
            console.log(error);
        }
    }
}
function save_into_storage() {
    localStorage.setItem('stored_focus', JSON.stringify(save_object));
}
btn_run_pause.addEventListener('click', () => {
    run_pause();
});
function run_pause() {
    if (save_object.active_timer !== -1) {
        if (is_timer_running === false) {
            is_timer_running = true;
            btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>`;
        }
        else {
            is_timer_running = false;
            btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>`;
            save_into_storage();
        }
    }
}
let counter = 0;
setInterval(() => {
    if (is_timer_running === true) {
        counter++;
        if (counter === 60) {
            counter = 0;
            save_into_storage();
        }
        const timers = document.querySelectorAll('.focus-timer');
        const index = save_object.active_timer;
        save_object.sub_timers[index].elapsed_time++;
        timers[index].children[1].innerHTML = convert_seconds_to_time(save_object.sub_timers[index].elapsed_time);
        timers_sum();
    }
    else {
        clearInterval(timer);
    }
}, 1000);
window.addEventListener("beforeunload", () => {
    save_into_storage();
}, false);
btn_refresh_main === null || btn_refresh_main === void 0 ? void 0 : btn_refresh_main.addEventListener('click', () => {
    const confirm = window.confirm('Sollen alle Timer zurückgesetzt werden?');
    const timers = document.querySelectorAll('.focus-timer');
    if (confirm) {
        for (let i = 0; i < save_object.sub_timers.length; i++) {
            save_object.sub_timers[i].elapsed_time = 0;
            timers[i].children[1].innerHTML = convert_seconds_to_time(save_object.sub_timers[i].elapsed_time);
        }
        save_object.main_timer = 0;
        mainTimer.innerHTML = convert_seconds_to_time(save_object.main_timer);
        save_into_storage();
    }
});
function refreshTimer(index) {
    const confirm = window.confirm('Soll der Timer zurückgesetzt werden?');
    const timers = document.querySelectorAll('.focus-timer');
    if (confirm) {
        save_object.sub_timers[index].elapsed_time = 0;
        timers[index].children[1].innerHTML = convert_seconds_to_time(save_object.sub_timers[index].elapsed_time);
        timers_sum();
        save_into_storage();
    }
}
function timers_sum() {
    let seconds_sum = 0;
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        seconds_sum = seconds_sum += save_object.sub_timers[i].elapsed_time;
    }
    save_object.main_timer = seconds_sum;
    mainTimer.innerHTML = convert_seconds_to_time(seconds_sum);
}
class Theme {
    static set_light_Theme() {
        r.style.setProperty('--main-bg-color', 'white');
        r.style.setProperty('--secondary-color', 'black');
        r.style.setProperty('--tertiary-color', 'white');
        r.style.setProperty('--shadow-color', 'black');
        r.style.setProperty('--hover-color', 'lightblue');
        r.style.setProperty('--selected-color', 'lightgreen');
        r.style.setProperty('--button-hover-color', 'lightblue');
        r.style.setProperty('--button-color', 'rgba(199, 199, 199, 0.324)');
        r.style.setProperty('--selected-color:', 'lightgreen');
    }
    static set_dark_Theme() {
        r.style.setProperty('--main-bg-color', 'rgba(5, 5, 5, 0.856)');
        r.style.setProperty('--secondary-color', 'rgb(255, 255, 255)');
        r.style.setProperty('--tertiary-color', 'grey');
        r.style.setProperty('--shadow-color', 'white');
        r.style.setProperty('--hover-color', 'lightblue');
        r.style.setProperty('--selected-color', 'lightgreen');
        r.style.setProperty('--button-hover-color', 'rgba(7, 174, 65, 0.854)');
        r.style.setProperty('--button-color', 'rgba(239, 243, 243, 0.324)');
        r.style.setProperty('--selected-color:', 'lightgreen');
    }
    static set_Teal_Theme() {
        r.style.setProperty('--main-bg-color', 'rgba(0, 0, 0, 0.9);');
        r.style.setProperty('--secondary-color', 'aqua');
        r.style.setProperty('--tertiary-color', 'teal');
        r.style.setProperty('--shadow-color', 'teal');
        r.style.setProperty('--hover-color', 'lightblue');
        r.style.setProperty('--selected-color', 'aqua');
        r.style.setProperty('--button-hover-color', 'rgba(8, 219, 82, 0.854)');
        r.style.setProperty('--button-color', 'rgba(0, 252, 88, 0.324)');
    }
    static set_Red_Theme() {
        r.style.setProperty('--main-bg-color', 'rgba(0, 0, 0, 0.9)');
        r.style.setProperty('--secondary-color', 'white');
        r.style.setProperty('--tertiary-color', 'rgba(44, 43, 43, 0.859)');
        r.style.setProperty('--shadow-color', 'tomato');
        r.style.setProperty('--hover-color', 'lightblue');
        r.style.setProperty('--selected-color', 'red');
        r.style.setProperty('--button-hover-color', 'rgba(219, 8, 8, 0.854)');
        r.style.setProperty('--button-color', 'darkred');
    }
}
btn_open_settings === null || btn_open_settings === void 0 ? void 0 : btn_open_settings.addEventListener('click', () => {
    modal_settings === null || modal_settings === void 0 ? void 0 : modal_settings.classList.add('active');
});
btn_x === null || btn_x === void 0 ? void 0 : btn_x.addEventListener('click', () => {
    modal_settings === null || modal_settings === void 0 ? void 0 : modal_settings.classList.remove('active');
});
btn_theme_teal.addEventListener('click', () => {
    Theme.set_Teal_Theme();
    save_object.theme = 'theme_teal';
    save_into_storage();
});
btn_theme_light.addEventListener('click', () => {
    Theme.set_light_Theme();
    save_object.theme = 'theme_light';
    save_into_storage();
});
btn_theme_dark.addEventListener('click', () => {
    Theme.set_dark_Theme();
    save_object.theme = 'theme_dark';
    save_into_storage();
});
btn_theme_red.addEventListener('click', () => {
    Theme.set_Red_Theme();
    save_object.theme = 'theme_red';
    save_into_storage();
});
function check_Theme() {
    switch (save_object.theme) {
        case 'theme_teal':
            Theme.set_Teal_Theme();
            break;
        case 'theme_dark':
            Theme.set_dark_Theme();
            break;
        case 'theme_light':
            Theme.set_light_Theme();
            break;
        case 'theme_red':
            Theme.set_Red_Theme();
            break;
        default:
            break;
    }
}
//# sourceMappingURL=index.js.map