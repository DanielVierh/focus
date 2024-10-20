const btn_new_timer = document.getElementById('btn_new_timer')!;
const inp_timer_title = (<HTMLInputElement>document.getElementById('inp_timer_title'))

type SAVE_OBJECT = {
    main_timer: number,
    sub_timers: Timer[],
    theme: string
}

let save_object: SAVE_OBJECT = {
    main_timer: 0,
    sub_timers: [],
    theme: 'light'
}

class Timer {
    title: string
    elapsed_time: number
    constructor(title: string, elapsed_time: number) {
        this.title = title;
        this.elapsed_time = elapsed_time;
    }
}

save_object.sub_timers.push(new Timer('Test Timer', 200));


btn_new_timer?.addEventListener('click', ()=> {
    if(inp_timer_title.value !== '' ) {
        console.log(inp_timer_title.value);
        
        inp_timer_title.value = '';
    }
});


function render_timer(): void {
    
}