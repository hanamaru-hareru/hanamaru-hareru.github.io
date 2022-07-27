let app_url = {};
const router_map = {
    '/': load_streams,
    'calender': load_calender,
    'single': load_single,
    'setori': sl_load_setori,
    'song-info': sl_load_song_info,
    'mixed-list': sl_load_mixed_list,
    'song-list': sl_load_song_list,
    'medley-list': sl_load_medley_list,
    'song-statistic': sl_load_statistic,
    'misc': load_misc,
}

function app_parse_url() {
    function split_first(raw, key) {
        const pos = raw.indexOf(key);
        if(pos===-1) {
            return [raw, ''];
        }
        return [raw.substring(0, pos), raw.substring(pos+1)]
    }

    //Extract the parameter from the URL.
    const root_exp = new RegExp('.*(?=\/)'), page_url=window.location.href;
    const root = root_exp.exec(page_url).toString() + '/';
    let page_params = split_first(page_url.substring(root.length), '#');
    page_params = page_params[1];
    //Parse and construct the keys.
    let keys = {};
    for(let i of page_params.split('&')) {
        const param_info = split_first(i, '=');
        keys[param_info[0]] = param_info[1];
    }
    app_url.args = keys;
}

function router_handle_url() {
    // Parse the url.
    app_parse_url();
    // Based on url, parse the function.
    const route_keys = Object.keys(router_map);
    for(let i=0; i<route_keys.length; ++i) {
        // If we found the key, use the function.
        if(route_keys[i] in app_url.args) {
            router_map[route_keys[i]]();
            return;
        }
    }
    //Or else, call the default function.
    router_map['/']();
}

function app_ui_init() {
    // Update the language settings.
    apply_language(app_load_conf('language', browser_language()));
    console.log('Loading language: ', app_load_conf('language', browser_language()));
    // Render header, footer and banner.
    render_header();
    render_footer();
    render_contact_links('');
    // This is the entrance of the app, installing the router.
    router_handle_url();
    // Disable smooth scroll.
    document.documentElement.style.scrollBehavior = 'auto';
    // When the url is change, we update the content.
    window.addEventListener('hashchange', router_handle_url, false);
}

const ui_pages = [
    'calender', 'misc', 'setori', 'single', 'song-detail', 'song-list', 'song-statistic', 'song-view', 'stream'
];

function app_ui_cache() {
    document.getElementById('splash-info').innerHTML = '';
    document.getElementById('splash-progressbar').style = 'width: 0%';
    // Caching the UI pages at very beginning.
    let ui_cache_counter = 0;
    for(let page_id=0; page_id<ui_pages.length; ++page_id) {
        const ui_page_name = ui_pages[page_id]+'.html';
        app_fetch(ui_page_name, function(html_raw_data, ui_page_name) {
            document.getElementById('splash-info').innerHTML = ui_page_name;
            document.getElementById('splash-progressbar').style = 'width: ' + Math.ceil(ui_cache_counter / ui_pages.length * 100).toString() + '%';
            //Ignore the raw data.
            ui_cache_counter += 1;
            if(ui_cache_counter === ui_pages.length) {
                //Load the core UI.
                app_ui_init();
            }
        }, ui_page_name);
    }
}