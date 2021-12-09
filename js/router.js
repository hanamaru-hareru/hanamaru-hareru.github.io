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
    ['forecast.json', forecast_load_data],
    ['single.json', single_load_data],
    ['voice-button.json', voice_load_data],
    ['slides.json', function(raw_data) { slides.records = raw_data; }],
    ['song-details.json', sl_song_info_load_data],
    ['song-list.json', sl_song_list_load_data],
    ['videos.json', stream_load_data],
];

let database_load_start = undefined;

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
    // Render the title and banner.
    render_header();
    render_footer();
    render_contact_links();
    // This is the entrance of the app.
    router_handle_url();
    // When the url is change, we update the content.
    window.addEventListener('hashchange', router_handle_url, false);
}

function app_database_init(current_id) {
    //Check id validation.
    if(current_id >= database_loader.length) {
        const database_load_end = new Date().getTime();
        console.log('Database cached: ' + (database_load_end - database_load_start) + 'ms');
        //Load the user interface.
        app_ui_init();
        return;
    }
    //Extract the database file info.
    const load_info = database_loader[current_id];
    const load_url = '/database/' + load_info[0], assign_callback = load_info[1];
    //Fetch the json data.
    app_fetch(load_url, function (json_raw_data) {
        //Parse the json data.
        let raw_json = JSON.parse(json_raw_data);
        //Run the assignment function.
        assign_callback(raw_json);
        // Keep load the next data.
        app_database_init(current_id + 1);
    });
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
        '.-               -.                                        Release 2.0.211202. Powered by hnmr-core 2.1.1.\n' +
        ' ::::.         ::                                          はれちゃんがずっと幸せでいられますように。\n' +
        '      .:.:...::\n', 'color: #db9854');
    // Load the database to local.
    database_load_start = new Date().getTime();
    app_database_init(0);
}
