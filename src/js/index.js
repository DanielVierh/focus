"use strict";
const btn_new_timer = document.getElementById('btn_new_timer');
const inp_timer_title = document.getElementById('inp_timer_title');
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
save_object.sub_timers.push(new Timer('Test Timer', 200));
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener('click', () => {
    if (inp_timer_title.value !== '') {
        console.log(inp_timer_title.value);
        inp_timer_title.value = '';
    }
});
function render_timer() {
}
//# sourceMappingURL=index.js.map