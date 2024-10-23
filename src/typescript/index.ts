const btn_new_timer = document.getElementById('btn_new_timer')!;
const btn_play_pause = document.getElementById('btn_play_pause')!;
const inp_timer_title = (<HTMLInputElement>document.getElementById('inp_timer_title'))
const timers = (<HTMLInputElement>document.getElementById('timers'));
const mainTimer = document.getElementById('mainTimer');

let timer: any;
let is_timer_running: boolean = false;

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
    render_timer();
    show_active();
}

init();


btn_new_timer?.addEventListener('click', () => {
    add_new_Timer();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        add_new_Timer();
    }
});

function add_new_Timer(): void {
    if (inp_timer_title.value !== '') {
        timers.innerHTML = '';
        save_object.sub_timers.push(new Timer(inp_timer_title.value, 0));
        inp_timer_title.value = '';
        render_timer();
    }
}

function render_timer(): void {
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

        // Create delete button and its functionality
        let delete_btn = document.createElement('div');
        delete_btn.classList.add('delete-button');
        delete_btn.innerHTML = 'x';
        delete_btn.addEventListener('click', () => {
            deleteTimer(i);
        });

        timer_div.appendChild(timer_title);
        timer_div.appendChild(timer_time);
        timer_div.appendChild(delete_btn);

        timers.appendChild(timer_div);
    }
}

function deleteTimer(index: number): void {
    save_object.sub_timers.splice(index, 1); 
    render_timer(); 
}


function remove_active_class(): void {
    const timers = document.querySelectorAll('.focus-timer');
    timers.forEach((timer) => {
        timer.classList.remove('active');
    })
}

function show_active(): void {
    const timers = document.querySelectorAll('.focus-timer');
    try {
        timers[save_object.active_timer].classList.add('active')
    } catch (error) {
        console.log(error);

    }

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
    } else {
        returnVal = String(val)
    }
    return returnVal;
}


btn_play_pause.addEventListener('click', () => {
    play_pause();
})

function play_pause(): void {
    if (save_object.active_timer !== -1) {
        if (is_timer_running === false) {
            is_timer_running = true;
        } else {
            is_timer_running = false;
        }
    }
}


setInterval(() => {
    if (is_timer_running === true) {
        const timers = document.querySelectorAll('.focus-timer');
        const index = save_object.active_timer;
        save_object.sub_timers[index].elapsed_time++;
        save_object.main_timer++;
        mainTimer!.innerHTML = convert_seconds_to_time(save_object.main_timer);
        timers[index].children[1].innerHTML = convert_seconds_to_time(save_object.sub_timers[index].elapsed_time);
    } else {
        clearInterval(timer);
    }

}, 1000);


//TODO Save Timer
//TODO Reset Timer ?
//TODO Timer with grid