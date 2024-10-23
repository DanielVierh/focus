const btn_new_timer = document.getElementById('btn_new_timer')!;
const btn_run_pause = document.getElementById('btn_run_pause')!;
const inp_timer_title = (<HTMLInputElement>document.getElementById('inp_timer_title'))
const timers = (<HTMLInputElement>document.getElementById('timers'));
const mainTimer = document.getElementById('mainTimer');
const btn_refresh_main = document.getElementById('btn_refresh_main');

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
    load_local_storage();
    setTimeout(() => {
        render_timer();
        show_active();
    }, 400);
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
        save_into_storage();
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
    save_into_storage();
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


function load_local_storage() {
    if (localStorage.getItem('stored_focus') !== null) {
        try {
             //@ts-ignore
            save_object = JSON.parse(localStorage.getItem('stored_focus'));
            mainTimer!.innerHTML = convert_seconds_to_time(save_object.main_timer);
        } catch (error) {
            console.log(error);
        }
    }
}

//########################################
//*ANCHOR -  Save to local Storage
//########################################
function save_into_storage() {
     //@ts-ignore
    localStorage.setItem('stored_focus', JSON.stringify(save_object));
}


btn_run_pause.addEventListener('click', () => {
    run_pause();
})

function run_pause(): void {
    if (save_object.active_timer !== -1) {
        if (is_timer_running === false) {
            is_timer_running = true;
            btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>`
        } else {
            is_timer_running = false;
            btn_run_pause.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>`
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


window.addEventListener("beforeunload", ()=> {
    save_into_storage();
 }, false);


//TODO Reset Timer 
btn_refresh_main?.addEventListener('click', ()=> {
    const confirm = window.confirm('Soll der Hauptzähler zurückgesetzt werden?');

    if(confirm) {
        save_object.main_timer = 0;
        mainTimer!.innerHTML = convert_seconds_to_time(save_object.main_timer);
        save_into_storage();
    }
})