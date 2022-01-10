// Check whether the website is running on mobile.
let show_splash = true;
let splash_blob = undefined;
const splash_disable_key = 'no-splash', splash_cache_key = 'splash_img', splash_res_key = 'splash_res';
const resolution_map = {
    "640x1136": "Default-568h@2x.png",
    "750x1334": "Default-667h@2x.png",
    "1024x768": "Default-Landscape.png",
    "1135x640": "Default-Landscape-1136h@2x.png",
    "2048x1536": "Default-Landscape-2048h@2x.png",
    "768x1024": "Default-Portrait.png",
    "1242x2208": "Default-Portrait-1242h@3x.png",
    "1125x2436": "Default-Portrait-2436h@3x.png",
    "1242x2688": "Default-Portrait-2688h@3x.png",
    "512x512": "iTunesArtwork.png",
    "1024x1024": "iTunesArtwork@2x.png",
}

function splash_hide() {
    //Only execute when splash is shown.
    if(show_splash) {
        document.getElementById('splash-screen').setAttribute('hidden', 'true');
        show_splash = false;
    }
    //Scroll to the top.
    window.scrollTo(0, 0);
}

function set_splash_and_start(splash_res) {
    let splash_div = document.getElementById('splash-screen');
    splash_div.style.backgroundImage = 'url('+splash_res+')';
    splash_div.style.backgroundRepeat = 'no-repeat';
    splash_div.style.backgroundSize = 'cover';
    splash_div.style.backgroundPosition = 'center center';
    app_init();
}

function splash_init() {
    const clientInfo = navigator.userAgent;
    let handle_splash = clientInfo.indexOf('Android') > -1 || clientInfo.indexOf('iPhone') > -1 || clientInfo.indexOf('iPad') > -1 || clientInfo.indexOf('iPod') > -1;
    //Check temporary disable flag exist.
    if(handle_splash && app_load_conf(splash_disable_key, false)) {
        //Clear the remove key.
        app_remove_conf(splash_disable_key);
        //Disable the splash.
        handle_splash = false;
    }
    //If not on mobile or we have to skip it, hide the splash screen.
    if(!handle_splash) {
        splash_hide();
        //Initial the application directly.
        app_init();
        return;
    }
    //Check whether we already has a cached splash image.
    let cached_splash = app_load_conf(splash_cache_key, undefined), cached_res = app_load_conf(splash_res_key, '');
    //Now get the resolution, and select the splash screen.
    const screen_width = window.screen.width, screen_height = window.screen.height;
    const res_1x = screen_width+'x'+screen_height, res_2x = (screen_width*2)+'x'+(screen_height*2);
    //Configure the default splash url.
    let splash_url = 'Default@2x.png';
    if(screen_width > screen_height) {
        splash_url = 'Default-Landscape.png';
    }
    if(res_2x in resolution_map) {
        splash_url = resolution_map[res_2x];
    } else if (res_1x in resolution_map) {
        splash_url = resolution_map[res_1x];
    }
    //Check resource has and resolution matches.
    if(cached_splash && cached_res === splash_url) {
        set_splash_and_start(cached_splash);
    } else {
        fetch(splash_url).then(function(res) {
            res.blob().then(function(splash_data) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    //Save the image data to local storage.
                    app_set_conf(splash_res_key, splash_url);
                    app_set_conf(splash_cache_key, reader.result);
                    // Fetch the cached splash data.
                    set_splash_and_start(app_load_conf(splash_cache_key, undefined));
                }
                reader.readAsDataURL(splash_data);
            });
        });
    }
}
