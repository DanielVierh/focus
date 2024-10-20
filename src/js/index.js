"use strict";
const btn_new_timer = document.getElementById('btn_new_timer');
const inp_timer_title = document.getElementById('inp_timer_title');
const timers = document.getElementById('timers');
let save_object = {
    main_timer: 0,
    sub_timers: [],
    theme: 'light'
};
class Timer {
    constructor(title, elapsed_time) {
        this.title = title;
        this.elapsed_time = elapsed_time;
    }
}
function init() {
    save_object.sub_timers.push(new Timer('Test Timer', 60));
    render_timer();
}
init();
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener('click', () => {
    if (inp_timer_title.value !== '') {
        console.log(inp_timer_title.value);
        inp_timer_title.value = '';
    }
});
function render_timer() {
    save_object.sub_timers.forEach((timer) => {
        let timer_div = document.createElement('div');
        timer_div.classList.add('focus-timer');
        let timer_title = document.createElement('div');
        timer_title.classList.add('label');
        timer_title.innerHTML = timer.title;
        let timer_time = document.createElement('div');
        timer_time.classList.add('timer');
        timer_time.innerHTML = convert_seconds_to_time(timer.elapsed_time);
        timer_div.appendChild(timer_title);
        timer_div.appendChild(timer_time);
        timers.appendChild(timer_div);
    });
}
function convert_seconds_to_time(seconds) {
    let elapsed_time;
    const date = new Date(0);
    date.setSeconds(seconds);
    elapsed_time = date.toISOString().substr(11, 8);
    return elapsed_time;
}
function minutesDiff(dateTimeValue2, dateTimeValue1) {
    var differenceValue = (dateTimeValue2.getTime() - dateTimeValue1.getTime()) / 1000;
    differenceValue /= 60;
    const rawMinuteTime = Math.abs(Math.round(differenceValue));
    const days = Math.floor(rawMinuteTime / (24 * 60));
    const remainingMinutes = rawMinuteTime % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    const time = `Tage: ${add_zero(days)} \n Stunden: ${add_zero(hours)} \n Minuten: ${add_zero(minutes)}`;
    return time;
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
//# sourceMappingURL=index.js.map