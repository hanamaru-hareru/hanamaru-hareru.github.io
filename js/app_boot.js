//Application configures.
function app_load_conf(key, def_value) {
    const local_value = window.localStorage.getItem(key);
    return local_value ? local_value : def_value;
}

function app_set_conf(key, value) {
    window.localStorage.setItem(key, value);
}

function app_remove_conf(key) {
    window.localStorage.removeItem(key);
}

// Splash GUI part
let show_splash = true;
const splash_disable_key = 'no-splash';

function is_on_ios() {
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
}

function splash_hide() {
    //Only execute when splash is shown.
    if(show_splash) {
        document.getElementById('scene-splash').setAttribute('hidden', 'true');
        show_splash = false;
    }
    //Scroll to the top.
    window.scrollTo(0, 0);
}

function splash_boot() {
    let handle_splash = true;
    //When website is on iOS, disable the navigation gesture.
    if(is_on_ios()) {
        document.getElementById('page-body').addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    }
    //Check temporary disable flag exist.
    if(app_load_conf(splash_disable_key, false)) {
        //Clear the remove key.
        app_remove_conf(splash_disable_key);
        //Disable the splash.
        handle_splash = false;
    }
    //If not on mobile or we have to skip it, hide the splash screen.
    if(!handle_splash) {
        splash_hide();
    }
    //Initial the application.
    app_init();
}