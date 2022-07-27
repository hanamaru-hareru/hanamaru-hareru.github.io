/* Database structure */
/* Structure: level -> [ ['filename', load function],  ] */

const database_struct = [
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
let database_count = 0, database_loaded = 0;
let database_load_start = undefined;

function app_database_init(level) {
    //Check whether all the level reach are loaded.
    if(level >= database_struct.length) {
        const database_load_end = new Date().getTime();
        console.log('Database cached: ' + (database_load_end - database_load_start) + 'ms');
        //Enabled app cache.
        app_fetch_cache_enabled = true;
        //Load the user interface.
        app_ui_cache();
        return;
    }
    //First load the level information.
    const database_level_info = database_struct[level];
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

function database_load() {
    // Count the size of database.
    for(let i=0; i<database_struct.length; ++i) {
        database_count += database_struct[i].length;
    }
    // Load the database to local.
    database_load_start = new Date().getTime();
    app_database_init(0);
}