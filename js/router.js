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

const database_loader = [
    [
        ['forecast.json', forecast_load_data],
        ['single.json', single_load_data],
        ['slides.json', function(raw_data) { slides.records = raw_data; }],
        ['song-details.json', sl_song_info_load_data],
    ],
    [
        ['button-voices.json', voice_load_data],
        ['song-list.json', sl_song_list_load_data],
    ],
    [
        ['videos.json', stream_load_data],
    ],
];

const ui_pages = [
    'calender', 'misc', 'setori', 'single', 'song-detail', 'song-list', 'song-statistic', 'song-view', 'stream'
];

let database_load_start = undefined;
let database_count = 0, database_loaded = 0;

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
                // app_ui_init();
            }
        }, ui_page_name);
    }
}

function app_ui_init() {
    // Update the language settings.
    apply_language(app_load_conf('language', browser_language()));
    console.log('Loading language: ', app_load_conf('language', browser_language()));
    // Render the title and banner.
    render_header();
    render_footer();
    render_contact_links();
    // This is the entrance of the app.
    router_handle_url();
    // Disable smooth scroll.
    document.documentElement.style.scrollBehavior = 'auto';
    // When the url is change, we update the content.
    window.addEventListener('hashchange', router_handle_url, false);
}

function app_database_init(level) {
    //Check whether all the level reach are loaded.
    if(level >= database_loader.length) {
        const database_load_end = new Date().getTime();
        console.log('Database cached: ' + (database_load_end - database_load_start) + 'ms');
        //Enabled app cache.
        app_fetch_cache_enabled = true;
        //Load the user interface.
        app_ui_cache();
        return;
    }
    //First load the level information.
    const database_level_info = database_loader[level];
    let database_load_counter = 0;
    //Check id validation.
    for(let loader_id=0; loader_id<database_level_info.length; ++loader_id) {
        //Extract the database file info.
        const load_info = database_level_info[loader_id];
        const load_url = '/database/' + load_info[0], assign_callback = load_info[1];
        //Fetch the json data.
        app_fetch(load_url, function (json_raw_data, json_name) {
            //Run the assignment function.
            assign_callback(JSON.parse(json_raw_data));
            // Increase the database counter.
            database_load_counter += 1;
            database_loaded += 1;
            //Update the progress bar.
            document.getElementById('splash-progressbar').style = 'width: ' + Math.ceil(database_loaded / database_count * 100).toString() + '%';
            document.getElementById('splash-info').innerHTML = json_name
            //Check level.
            if(database_load_counter === database_level_info.length) {
                //Load the next level.
                app_database_init(level + 1);
            }
        }, load_info[0]);
    }
}

function app_init() {
    //Write the console banner.
    console.log('%c                       .::-\n' +
        '                     ::.  .-\n' +
        '                   .-      ::\n' +
        '                  ::        =\n' +
        '                 .-         :.    ___  ___  ________  ________  _______   ________  ___  ___  ________\n' +
        '                 -           :   |\\  \\|\\  \\|\\   __  \\|\\   __  \\|\\  ___ \\ |\\   __  \\|\\  \\|\\  \\|\\   ___  \\\n' +
        '                 :    .     :.   \\ \\  \\\\\\  \\ \\  \\|\\  \\ \\  \\|\\  \\ \\   __/|\\ \\  \\|\\  \\ \\  \\\\\\  \\ \\  \\\\ \\  \\\n' +
        '                  -  -     .:     \\ \\   __  \\ \\   __  \\ \\   _  _\\ \\  \\_|/_\\ \\   _  _\\ \\  \\\\\\  \\ \\  \\\\ \\  \\\n' +
        '         ..::..  .-::.   ::        \\ \\  \\ \\  \\ \\  \\ \\  \\ \\  \\\\  \\\\ \\  \\_|\\ \\ \\  \\\\  \\\\ \\  \\\\\\  \\ \\  \\\\ \\  \\\n' +
        '     .::.      .:-  .:::.           \\ \\__\\ \\__\\ \\__\\ \\__\\ \\__\\\\ _\\\\ \\_______\\ \\__\\\\ _\\\\ \\_______\\ \\__\\\\ \\__\\\n' +
        '   ::         :::..-:                \\|__|\\|__|\\|__|\\|__|\\|__|\\|__|\\|_______|\\|__|\\|__|\\|_______|\\|__| \\|__|\n' +
        ' .-          ..   ::\n' +
        '.-               -.                                        Release '+release_version.join('.')+'. Powered by hnmr-core '+core_version.join('.')+'.\n' +
        ' ::::.         ::                                          はれちゃんがずっと幸せでいられますように。\n' +
        '      .:.:...::\n', 'color: #db9854');
    // Count the size of database.
    for(let i=0; i<database_loader.length; ++i) {
        database_count += database_loader[i].length;
    }
    // Load the database to local.
    database_load_start = new Date().getTime();
    app_database_init(0);
}
