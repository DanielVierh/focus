const btn_new_timer = document.getElementById('btn_new_timer')!;
const inp_timer_title = (<HTMLInputElement>document.getElementById('inp_timer_title'))
const timers = (<HTMLInputElement>document.getElementById('timers'))

type SAVE_OBJECT = {
    main_timer: number,
    sub_timers: Timer[],
    theme: string,
    active_timer: number
}

let save_object: SAVE_OBJECT = {
    main_timer: 0,
    sub_timers: [],
    theme: 'light',
    active_timer: -1
}

class Timer {
    title: string
    elapsed_time: number
    constructor(title: string, elapsed_time: number) {
        this.title = title;
        this.elapsed_time = elapsed_time;
    }
}


function init(): void {
    save_object.sub_timers.push(new Timer('Test Timer', 60));
    render_timer();
}

init();


btn_new_timer?.addEventListener('click', ()=> {
    if(inp_timer_title.value !== '' ) {
        timers.innerHTML = '';
        save_object.sub_timers.push(new Timer(inp_timer_title.value, 0));
        inp_timer_title.value = '';
        render_timer();
    }
});


function render_timer(): void {
    save_object.sub_timers.forEach((timer)=> {
        
        let timer_div = document.createElement('div');
        timer_div.classList.add('focus-timer');
        //TODO - Add event listener for click to focus timer

        let timer_title = document.createElement('div');
        timer_title.classList.add('label');
        timer_title.innerHTML = timer.title;

        let timer_time = document.createElement('div');
        timer_time.classList.add('timer');
        timer_time.innerHTML = convert_seconds_to_time(timer.elapsed_time);

        //TODO - Add delete btn with functionality

        timer_div.appendChild(timer_title);
        timer_div.appendChild(timer_time);

        timers.appendChild(timer_div);

    })
}


function convert_seconds_to_time(seconds: number): string {

    let elapsed_time: string;
    const date = new Date(0);
    date.setSeconds(seconds);
    elapsed_time = date.toISOString().substr(11, 8);

    return elapsed_time;
}


function add_zero(val: number): string {
    let returnVal: string = '';
    if (val < 10) {
        returnVal = `0${val}`;
    }else {
        returnVal = String(val)
    }
    return returnVal;
}