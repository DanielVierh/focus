"use strict";
const btn_new_timer = document.getElementById('btn_new_timer');
const inp_timer_title = document.getElementById('inp_timer_title');
let save_object = {
    main_timer: 0,
    sub_timers: []
};
class Timer {
    constructor(title, elapsed_time) {
        this.title = title;
        this.elapsed_time = elapsed_time;
    }
}
btn_new_timer === null || btn_new_timer === void 0 ? void 0 : btn_new_timer.addEventListener('click', () => {
    if (inp_timer_title.value !== null) {
        console.log(inp_timer_title.value);
    }
});
//# sourceMappingURL=index.js.map