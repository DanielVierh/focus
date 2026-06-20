"use strict";
const btn_new_timer = document.getElementById("btn_new_timer");
const btn_run_pause = document.getElementById("btn_run_pause");
const inp_timer_title = (document.getElementById("inp_timer_title"));
const timers = document.getElementById("timers");
const mainTimer = document.getElementById("mainTimer");
const btn_refresh_main = document.getElementById("btn_refresh_main");
const btn_open_settings = document.getElementById("btn_open_settings");
const btn_x = document.getElementById("btn_x");
const btn_theme_light = document.getElementById("btn_theme_light");
const btn_theme_dark = document.getElementById("btn_theme_dark");
const btn_theme_teal = document.getElementById("btn_theme_teal");
const btn_theme_red = document.getElementById("btn_theme_red");
const btn_pomodoro_minus = document.getElementById("btn_pomodoro_minus");
const btn_pomodoro_plus = document.getElementById("btn_pomodoro_plus");
const btn_pomodoro_toggle = document.getElementById("btn_pomodoro_toggle");
const pomodoro_minutes_display = document.getElementById("pomodoro_minutes_display");
const pomodoro_timer_display = document.getElementById("pomodoro_timer_display");
const modal_settings = document.getElementById("modal_settings");
const r = document.querySelector(":root");
const STORAGE_KEY = "stored_focus";
const AUTO_SAVE_EVERY_SECONDS = 30;
let is_timer_running = false;
let save_object = {
    main_timer: 0,
    sub_timers: [],
    theme: "light",
    active_timer: -1,
    global_is_running: false,
    running_timer_index: -1,
    running_started_at: null,
    pomodoro_minutes: 25,
    pomodoro_remaining_seconds: 1500,
    pomodoro_enabled: false,
    pomodoro_last_tick_ts: null,
};
class Timer {
    constructor(title, accumulated_ms = 0, current_start_ts = null, last_end_ts = null) {
        this.title = title;
        this.accumulated_ms = accumulated_ms;
        this.current_start_ts = current_start_ts;
        this.last_end_ts = last_end_ts;
    }
}
function nowMs() {
    return Date.now();
}
function asFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return null;
}
function asBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return value.toLowerCase() === "true";
    }
    return false;
}
function ensure_timer_shape(timer) {
    var _a, _b;
    const accumulated_ms = asFiniteNumber(timer === null || timer === void 0 ? void 0 : timer.accumulated_ms);
    const accumulated_seconds_legacy = asFiniteNumber(timer === null || timer === void 0 ? void 0 : timer.accumulated_seconds);
    const elapsed_seconds_legacy = asFiniteNumber(timer === null || timer === void 0 ? void 0 : timer.elapsed_time);
    const current_start_ts = asFiniteNumber(timer === null || timer === void 0 ? void 0 : timer.current_start_ts);
    const last_end_ts = asFiniteNumber(timer === null || timer === void 0 ? void 0 : timer.last_end_ts);
    const resolved_accumulated_ms = (_a = accumulated_ms !== null && accumulated_ms !== void 0 ? accumulated_ms : (accumulated_seconds_legacy !== null
        ? accumulated_seconds_legacy * 1000
        : null)) !== null && _a !== void 0 ? _a : (elapsed_seconds_legacy !== null ? elapsed_seconds_legacy * 1000 : 0);
    return new Timer(String((_b = timer.title) !== null && _b !== void 0 ? _b : ""), resolved_accumulated_ms, current_start_ts, last_end_ts);
}
function find_running_timer_index() {
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        if (save_object.sub_timers[i].current_start_ts !== null) {
            return i;
        }
    }
    return -1;
}
function get_elapsed_seconds(timer) {
    let elapsed_ms = timer.accumulated_ms;
    if (timer.current_start_ts !== null) {
        elapsed_ms += Math.max(0, nowMs() - timer.current_start_ts);
    }
    return Math.floor(elapsed_ms / 1000);
}
function reset_pomodoro_remaining_from_minutes() {
    save_object.pomodoro_remaining_seconds = save_object.pomodoro_minutes * 60;
}
function render_pomodoro_controls() {
    pomodoro_minutes_display.textContent = String(save_object.pomodoro_minutes);
    pomodoro_timer_display.textContent = convert_seconds_to_time(save_object.pomodoro_remaining_seconds);
    btn_pomodoro_toggle.textContent = save_object.pomodoro_enabled
        ? "Pomodoro mitlaufen: Ja"
        : "Pomodoro mitlaufen: Nein";
}
function tick_pomodoro(now) {
    if (!save_object.pomodoro_enabled ||
        !is_timer_running ||
        save_object.active_timer === -1) {
        return;
    }
    if (save_object.pomodoro_last_tick_ts === null) {
        save_object.pomodoro_last_tick_ts = now;
        return;
    }
    const elapsed_seconds = Math.floor((now - save_object.pomodoro_last_tick_ts) / 1000);
    if (elapsed_seconds <= 0) {
        return;
    }
    save_object.pomodoro_remaining_seconds = Math.max(0, save_object.pomodoro_remaining_seconds - elapsed_seconds);
    save_object.pomodoro_last_tick_ts += elapsed_seconds * 1000;
    if (save_object.pomodoro_remaining_seconds === 0) {
        save_object.pomodoro_enabled = false;
        save_object.pomodoro_last_tick_ts = null;
    }
}
function finalize_timer_session(index, ended_at = nowMs()) {
    const timer = save_object.sub_timers[index];
    if (!timer || timer.current_start_ts === null) {
        return;
    }
    timer.accumulated_ms += Math.max(0, ended_at - timer.current_start_ts);
    timer.current_start_ts = null;
    timer.last_end_ts = ended_at;
}
function start_timer_session(index, started_at = nowMs()) {
    const timer = save_object.sub_timers[index];
    if (!timer || timer.current_start_ts !== null) {
        return;
    }
    timer.current_start_ts = started_at;
    timer.last_end_ts = null;
}
function update_run_pause_icon() {
    if (is_timer_running) {
        btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>`;
        return;
    }
    btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>`;
}
function update_timer_displays() {
    const timer_nodes = document.querySelectorAll(".focus-timer");
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        if (!timer_nodes[i] || !timer_nodes[i].children[1]) {
            continue;
        }
        timer_nodes[i].children[1].innerHTML = convert_seconds_to_time(get_elapsed_seconds(save_object.sub_timers[i]));
    }
}
function init() {
    load_local_storage();
    setTimeout(() => {
        render_timer();
        show_active();
        check_Theme();
        update_run_pause_icon();
        timers_sum();
        render_pomodoro_controls();
    }, 200);
}
init();
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener("click", () => {
    add_new_Timer();
});
window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        add_new_Timer();
    }
});
btn_pomodoro_minus.addEventListener("click", () => {
    if (save_object.pomodoro_minutes <= 1) {
        return;
    }
    save_object.pomodoro_minutes--;
    reset_pomodoro_remaining_from_minutes();
    if (save_object.pomodoro_enabled &&
        is_timer_running &&
        save_object.active_timer !== -1) {
        save_object.pomodoro_last_tick_ts = nowMs();
    }
    else {
        save_object.pomodoro_last_tick_ts = null;
    }
    render_pomodoro_controls();
    save_into_storage();
});
btn_pomodoro_plus.addEventListener("click", () => {
    if (save_object.pomodoro_minutes >= 120) {
        return;
    }
    save_object.pomodoro_minutes++;
    reset_pomodoro_remaining_from_minutes();
    if (save_object.pomodoro_enabled &&
        is_timer_running &&
        save_object.active_timer !== -1) {
        save_object.pomodoro_last_tick_ts = nowMs();
    }
    else {
        save_object.pomodoro_last_tick_ts = null;
    }
    render_pomodoro_controls();
    save_into_storage();
});
btn_pomodoro_toggle.addEventListener("click", () => {
    save_object.pomodoro_enabled = !save_object.pomodoro_enabled;
    if (save_object.pomodoro_enabled) {
        if (is_timer_running && save_object.active_timer !== -1) {
            save_object.pomodoro_last_tick_ts = nowMs();
        }
        else {
            save_object.pomodoro_last_tick_ts = null;
        }
    }
    else {
        save_object.pomodoro_last_tick_ts = null;
    }
    render_pomodoro_controls();
    save_into_storage();
});
function add_new_Timer() {
    if (inp_timer_title.value !== "") {
        timers.innerHTML = "";
        save_object.sub_timers.push(new Timer(inp_timer_title.value));
        inp_timer_title.value = "";
        save_into_storage();
        render_timer();
        show_active();
    }
}
function render_timer() {
    timers.innerHTML = "";
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        let timer_div = document.createElement("div");
        timer_div.classList.add("focus-timer");
        timer_div.addEventListener("click", () => {
            if (save_object.active_timer === i) {
                return;
            }
            const old_active = save_object.active_timer;
            const now = nowMs();
            if (old_active !== -1) {
                if (is_timer_running) {
                    finalize_timer_session(old_active, now);
                }
                else if (save_object.sub_timers[old_active]) {
                    save_object.sub_timers[old_active].last_end_ts = now;
                }
            }
            save_object.active_timer = i;
            if (is_timer_running) {
                start_timer_session(i, now);
            }
            remove_active_class();
            timer_div.classList.add("active");
            timers_sum();
            save_into_storage();
        });
        let timer_title = document.createElement("div");
        timer_title.classList.add("label");
        timer_title.innerHTML = save_object.sub_timers[i].title;
        let timer_time = document.createElement("div");
        timer_time.classList.add("timer");
        timer_time.innerHTML = convert_seconds_to_time(get_elapsed_seconds(save_object.sub_timers[i]));
        let refresh_btn = document.createElement("div");
        refresh_btn.classList.add("refresh-button");
        refresh_btn.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                    </svg>`;
        refresh_btn.addEventListener("click", (e) => {
            e.stopPropagation();
            refreshTimer(i);
        });
        let delete_btn = document.createElement("div");
        delete_btn.classList.add("delete-button");
        delete_btn.innerHTML = "x";
        delete_btn.addEventListener("click", (e) => {
            e.stopPropagation();
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
    const confirm = window.confirm("Soll der Timer gelöscht werden?");
    if (confirm) {
        if (is_timer_running && save_object.active_timer === index) {
            finalize_timer_session(index);
        }
        save_object.sub_timers.splice(index, 1);
        if (save_object.active_timer === index) {
            save_object.active_timer = -1;
            save_object.global_is_running = false;
            is_timer_running = false;
            update_run_pause_icon();
        }
        else if (save_object.active_timer > index) {
            save_object.active_timer--;
        }
        timers_sum();
        save_into_storage();
        render_timer();
        show_active();
    }
}
function remove_active_class() {
    const timers = document.querySelectorAll(".focus-timer");
    timers.forEach((timer) => {
        timer.classList.remove("active");
    });
}
function show_active() {
    const timers = document.querySelectorAll(".focus-timer");
    if (save_object.active_timer === -1) {
        return;
    }
    try {
        timers[save_object.active_timer].classList.add("active");
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
    var _a, _b, _c, _d, _e, _f;
    if (localStorage.getItem(STORAGE_KEY) !== null) {
        try {
            const loaded_data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            const now = nowMs();
            save_object.theme = (_a = loaded_data.theme) !== null && _a !== void 0 ? _a : save_object.theme;
            save_object.active_timer = (_b = asFiniteNumber(loaded_data.active_timer)) !== null && _b !== void 0 ? _b : -1;
            save_object.global_is_running = asBoolean(loaded_data.global_is_running);
            save_object.running_timer_index =
                (_c = asFiniteNumber(loaded_data.running_timer_index)) !== null && _c !== void 0 ? _c : -1;
            save_object.running_started_at = asFiniteNumber(loaded_data.running_started_at);
            save_object.pomodoro_minutes =
                (_d = asFiniteNumber(loaded_data.pomodoro_minutes)) !== null && _d !== void 0 ? _d : 25;
            save_object.pomodoro_remaining_seconds =
                (_e = asFiniteNumber(loaded_data.pomodoro_remaining_seconds)) !== null && _e !== void 0 ? _e : save_object.pomodoro_minutes * 60;
            save_object.pomodoro_enabled = asBoolean(loaded_data.pomodoro_enabled);
            save_object.pomodoro_last_tick_ts = asFiniteNumber(loaded_data.pomodoro_last_tick_ts);
            if (save_object.pomodoro_minutes < 1 ||
                save_object.pomodoro_minutes > 120) {
                save_object.pomodoro_minutes = 25;
            }
            if (save_object.pomodoro_remaining_seconds < 0) {
                save_object.pomodoro_remaining_seconds =
                    save_object.pomodoro_minutes * 60;
            }
            if (Array.isArray(loaded_data.sub_timers)) {
                save_object.sub_timers = loaded_data.sub_timers.map((timer) => ensure_timer_shape(timer));
            }
            else {
                save_object.sub_timers = [];
            }
            if (save_object.active_timer < 0 ||
                save_object.active_timer >= save_object.sub_timers.length) {
                save_object.active_timer = -1;
                save_object.global_is_running = false;
            }
            if (save_object.active_timer === -1) {
                const recovered_running_index = find_running_timer_index();
                if (recovered_running_index !== -1) {
                    save_object.active_timer = recovered_running_index;
                }
                else {
                    save_object.global_is_running = false;
                }
            }
            if (save_object.running_timer_index >= 0 &&
                save_object.running_timer_index < save_object.sub_timers.length) {
                save_object.active_timer = save_object.running_timer_index;
                if (save_object.running_started_at !== null) {
                    save_object.sub_timers[save_object.running_timer_index].current_start_ts = save_object.running_started_at;
                }
                save_object.global_is_running = true;
            }
            if (save_object.active_timer !== -1 &&
                ((_f = save_object.sub_timers[save_object.active_timer]) === null || _f === void 0 ? void 0 : _f.current_start_ts) !==
                    null) {
                is_timer_running = true;
            }
            else {
                is_timer_running = save_object.global_is_running;
            }
            if (is_timer_running && save_object.active_timer !== -1) {
                const active_timer = save_object.sub_timers[save_object.active_timer];
                if (active_timer.current_start_ts === null) {
                    active_timer.current_start_ts = now;
                }
            }
            if (save_object.pomodoro_enabled &&
                is_timer_running &&
                save_object.active_timer !== -1) {
                if (save_object.pomodoro_last_tick_ts === null) {
                    save_object.pomodoro_last_tick_ts = now;
                }
            }
            else {
                save_object.pomodoro_last_tick_ts = null;
            }
            for (let i = 0; i < save_object.sub_timers.length; i++) {
                if (i !== save_object.active_timer &&
                    save_object.sub_timers[i].current_start_ts !== null) {
                    finalize_timer_session(i, now);
                }
            }
            save_object.global_is_running = is_timer_running;
            if (is_timer_running && save_object.active_timer !== -1) {
                save_object.running_timer_index = save_object.active_timer;
                save_object.running_started_at =
                    save_object.sub_timers[save_object.active_timer].current_start_ts;
            }
            else {
                save_object.running_timer_index = -1;
                save_object.running_started_at = null;
            }
            timers_sum();
            save_into_storage();
        }
        catch (error) {
            console.log(error);
        }
    }
}
function save_into_storage() {
    save_object.global_is_running = is_timer_running;
    if (is_timer_running && save_object.active_timer !== -1) {
        save_object.running_timer_index = save_object.active_timer;
        save_object.running_started_at =
            save_object.sub_timers[save_object.active_timer].current_start_ts;
    }
    else {
        save_object.running_timer_index = -1;
        save_object.running_started_at = null;
    }
    if (save_object.pomodoro_enabled &&
        is_timer_running &&
        save_object.active_timer !== -1) {
        if (save_object.pomodoro_last_tick_ts === null) {
            save_object.pomodoro_last_tick_ts = nowMs();
        }
    }
    else {
        save_object.pomodoro_last_tick_ts = null;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save_object));
}
btn_run_pause.addEventListener("click", () => {
    run_pause();
});
function run_pause() {
    if (save_object.active_timer !== -1) {
        const index = save_object.active_timer;
        const now = nowMs();
        if (is_timer_running === false) {
            start_timer_session(index, now);
            is_timer_running = true;
            save_object.global_is_running = true;
            mainTimer.classList.remove("stoped-timer");
            if (save_object.pomodoro_enabled) {
                save_object.pomodoro_last_tick_ts = now;
            }
        }
        else {
            finalize_timer_session(index, now);
            mainTimer.classList.add("stoped-timer");
            is_timer_running = false;
            save_object.global_is_running = false;
            save_object.pomodoro_last_tick_ts = null;
        }
        update_run_pause_icon();
        timers_sum();
        render_pomodoro_controls();
        save_into_storage();
    }
}
setInterval(() => {
    if (save_object.active_timer === -1) {
        return;
    }
    if (is_timer_running) {
        const index = save_object.active_timer;
        const now = nowMs();
        if (save_object.sub_timers[index] &&
            save_object.sub_timers[index].current_start_ts === null) {
            start_timer_session(index);
        }
        tick_pomodoro(now);
        update_timer_displays();
        timers_sum();
        render_pomodoro_controls();
        const active = save_object.sub_timers[index];
        const elapsed_running_seconds = (active === null || active === void 0 ? void 0 : active.current_start_ts)
            ? Math.floor((now - active.current_start_ts) / 1000)
            : 0;
        if (elapsed_running_seconds > 0 &&
            elapsed_running_seconds % AUTO_SAVE_EVERY_SECONDS === 0) {
            save_into_storage();
        }
    }
}, 1000);
window.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        save_into_storage();
    }
});
window.addEventListener("pagehide", () => {
    save_into_storage();
});
window.addEventListener("beforeunload", () => {
    save_into_storage();
}, false);
btn_refresh_main === null || btn_refresh_main === void 0 ? void 0 : btn_refresh_main.addEventListener("click", () => {
    const confirm = window.confirm("Sollen alle Timer zurückgesetzt werden?");
    const timers = document.querySelectorAll(".focus-timer");
    if (confirm) {
        const now = nowMs();
        for (let i = 0; i < save_object.sub_timers.length; i++) {
            save_object.sub_timers[i].accumulated_ms = 0;
            save_object.sub_timers[i].last_end_ts = now;
            if (is_timer_running && save_object.active_timer === i) {
                save_object.sub_timers[i].current_start_ts = now;
            }
            else {
                save_object.sub_timers[i].current_start_ts = null;
            }
            if (timers[i] && timers[i].children[1]) {
                timers[i].children[1].innerHTML = convert_seconds_to_time(get_elapsed_seconds(save_object.sub_timers[i]));
            }
        }
        save_object.main_timer = 0;
        mainTimer.innerHTML = convert_seconds_to_time(save_object.main_timer);
        save_into_storage();
    }
});
function refreshTimer(index) {
    const confirm = window.confirm("Soll der Timer zurückgesetzt werden?");
    const timers = document.querySelectorAll(".focus-timer");
    if (confirm) {
        const now = nowMs();
        save_object.sub_timers[index].accumulated_ms = 0;
        save_object.sub_timers[index].last_end_ts = now;
        if (is_timer_running && save_object.active_timer === index) {
            save_object.sub_timers[index].current_start_ts = now;
        }
        else {
            save_object.sub_timers[index].current_start_ts = null;
        }
        if (timers[index] && timers[index].children[1]) {
            timers[index].children[1].innerHTML = convert_seconds_to_time(get_elapsed_seconds(save_object.sub_timers[index]));
        }
        timers_sum();
        save_into_storage();
    }
}
function timers_sum() {
    let seconds_sum = 0;
    for (let i = 0; i < save_object.sub_timers.length; i++) {
        seconds_sum += get_elapsed_seconds(save_object.sub_timers[i]);
    }
    save_object.main_timer = seconds_sum;
    mainTimer.innerHTML = convert_seconds_to_time(seconds_sum);
}
class Theme {
    static set_light_Theme() {
        r.style.setProperty("--main-bg-color", "white");
        r.style.setProperty("--secondary-color", "black");
        r.style.setProperty("--tertiary-color", "white");
        r.style.setProperty("--shadow-color", "black");
        r.style.setProperty("--hover-color", "lightblue");
        r.style.setProperty("--selected-color", "lightgreen");
        r.style.setProperty("--button-hover-color", "lightblue");
        r.style.setProperty("--button-color", "rgba(199, 199, 199, 0.324)");
        r.style.setProperty("--selected-color:", "lightgreen");
    }
    static set_dark_Theme() {
        r.style.setProperty("--main-bg-color", "rgba(5, 5, 5, 0.856)");
        r.style.setProperty("--secondary-color", "rgb(255, 255, 255)");
        r.style.setProperty("--tertiary-color", "grey");
        r.style.setProperty("--shadow-color", "white");
        r.style.setProperty("--hover-color", "lightblue");
        r.style.setProperty("--selected-color", "lightgreen");
        r.style.setProperty("--button-hover-color", "rgba(7, 174, 65, 0.854)");
        r.style.setProperty("--button-color", "rgba(239, 243, 243, 0.324)");
        r.style.setProperty("--selected-color:", "lightgreen");
    }
    static set_Teal_Theme() {
        r.style.setProperty("--main-bg-color", "rgba(0, 0, 0, 0.9);");
        r.style.setProperty("--secondary-color", "aqua");
        r.style.setProperty("--tertiary-color", "teal");
        r.style.setProperty("--shadow-color", "teal");
        r.style.setProperty("--hover-color", "lightblue");
        r.style.setProperty("--selected-color", "aqua");
        r.style.setProperty("--button-hover-color", "rgba(8, 219, 82, 0.854)");
        r.style.setProperty("--button-color", "rgba(0, 252, 88, 0.324)");
    }
    static set_Red_Theme() {
        r.style.setProperty("--main-bg-color", "rgba(0, 0, 0, 0.9)");
        r.style.setProperty("--secondary-color", "white");
        r.style.setProperty("--tertiary-color", "rgba(44, 43, 43, 0.859)");
        r.style.setProperty("--shadow-color", "tomato");
        r.style.setProperty("--hover-color", "lightblue");
        r.style.setProperty("--selected-color", "red");
        r.style.setProperty("--button-hover-color", "rgba(219, 8, 8, 0.854)");
        r.style.setProperty("--button-color", "darkred");
    }
}
btn_open_settings === null || btn_open_settings === void 0 ? void 0 : btn_open_settings.addEventListener("click", () => {
    modal_settings === null || modal_settings === void 0 ? void 0 : modal_settings.classList.add("active");
});
btn_x === null || btn_x === void 0 ? void 0 : btn_x.addEventListener("click", () => {
    modal_settings === null || modal_settings === void 0 ? void 0 : modal_settings.classList.remove("active");
});
btn_theme_teal.addEventListener("click", () => {
    Theme.set_Teal_Theme();
    save_object.theme = "theme_teal";
    save_into_storage();
});
btn_theme_light.addEventListener("click", () => {
    Theme.set_light_Theme();
    save_object.theme = "theme_light";
    save_into_storage();
});
btn_theme_dark.addEventListener("click", () => {
    Theme.set_dark_Theme();
    save_object.theme = "theme_dark";
    save_into_storage();
});
btn_theme_red.addEventListener("click", () => {
    Theme.set_Red_Theme();
    save_object.theme = "theme_red";
    save_into_storage();
});
function check_Theme() {
    switch (save_object.theme) {
        case "theme_teal":
            Theme.set_Teal_Theme();
            break;
        case "theme_dark":
            Theme.set_dark_Theme();
            break;
        case "theme_light":
            Theme.set_light_Theme();
            break;
        case "theme_red":
            Theme.set_Red_Theme();
            break;
        default:
            break;
    }
}
//# sourceMappingURL=index.js.map