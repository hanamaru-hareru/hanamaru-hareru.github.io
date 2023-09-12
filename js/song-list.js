
let song_list = {
    records: [],
    display_cache: [],
    sort_column: '',
    reverse: false,
    current_song_mode: 0, // 0 = single, 1 = medley, 2 = total
    target_records: null,
};

const sl_table_header_ids = ['sl-song-name', 'sl-song-last', 'sl-song-times', 'sl-song-at-youtube', 'sl-song-at-bilibili']

const sl_song_sort_function = {
    0: function (a, b) {
        const low_a = a[0].toLowerCase(), low_b = b[0].toLowerCase();
        return low_a === low_b ? 0 : (low_a < low_b ? -1 : 1);
    },
    1: function (a, b) {
        const a_date = song_list.records[a[1].last_live[0]].date, b_date = song_list.records[b[1].last_live[0]].date;
        return (a_date === b_date) ? 0 : (a_date < b_date ? -1 : 1);
    },
    2: function (a, b) {
        return a[1]['count'] - b[1]['count'];
    },
    3: function (a, b) {
        return a[1]['y_count'].length - b[1]['y_count'].length;
    },
    4: function (a, b) {
        return a[1]['b_count'].length - b[1]['b_count'].length;
    },
};

function song_name_to_esc(song_name) {
    return encodeURIComponent(song_name.trimLeft());
}

function esc_to_song_name(song_name) {
    return decodeURIComponent(song_name);
}

function sl_pos_to_timestamp(timepos) {
    if (isNaN(timepos)) {
        return '';
    }
    if(timepos < 60) {
        return '00:'+time_str_minsec(timepos);
    }
    let time_min = Math.floor(timepos / 60);
    timepos -= time_min * 60;
    if(time_min < 60) {
        return time_str_minsec(time_min) + ':' + time_str_minsec(timepos);
    }
    let time_hour = Math.floor(time_min / 60);
    time_min -= time_hour * 60;
    return time_hour.toString() + ':' + time_str_minsec(time_min) + ':' + time_str_minsec(timepos);
}

function sl_timestamp_to_pos(timestamp) {
    if(timestamp === -1 || timestamp.startsWith('http')) {
        return NaN;
    }
    //Check how many colon it has.
    timestamp = timestamp.split(':');
    if(timestamp.length === 2) {
        //Min:Sec
        return parseInt(timestamp[0]) * 60 + parseInt(timestamp[1]);
    }
    //Hour:Min:Sec
    return parseInt(timestamp[0]) * 3600 + parseInt(timestamp[1]) * 60 + parseInt(timestamp[2]);
}

function sl_append_time_stamp(live_url, timestamp) {
    //Print the timestamp.
    if(timestamp === -1 || timestamp.startsWith('http')) {
        return timestamp;
    }
    //Check whether url contain question mark.
    if(live_url.indexOf('?') === -1) {
        live_url += '?';
    } else {
        live_url += '&';
    }
    return live_url + 't=' + sl_timestamp_to_pos(timestamp);
}

function sl_song_info_load_data(song_info_data) {
    //Convert all the hiragana to katakana.
    const song_ids = Object.keys(song_info_data);
    for(let i=0; i<song_ids.length; ++i) {
        let song_data = song_info_data[song_ids[i]];
        song_data.k = convert_hiragana_to_katakana(song_data.k);
        song_data.a = convert_hiragana_to_katakana(song_data.a.toLowerCase());
        song_info_data[song_ids[i]] = song_data;
    }
    song_list.details = song_info_data;
}

function sl_song_list_load_data(song_list_data) {
    function count_song(song_statistic, song_name, is_y, live_id, timestamp) {
        let song_info = {};
        if(song_name in song_statistic) {
            //Increase the counter.
            song_info = song_statistic[song_name];
            song_info.count += 1;
        } else {
            song_info = {'count': 1, 'y_count': [], 'b_count': [], 'last_live': [live_id, timestamp]};
        }
        if(is_y) {
            song_info.y_count.push([live_id, timestamp]);
        } else {
            song_info.b_count.push([live_id, timestamp]);
        }
        song_statistic[song_name] = song_info;
    }
    console.log('Total song lists: ', song_list_data.length);
    //Statistic the date and songs.
    let calender = {}, song_statistic = {}, medley_statistic = {}, song_counter = 0;
    const current_year = new Date().getFullYear();
    for(let i=0; i<song_list_data.length; ++i) {
        song_list_data[i].date = new Date(song_list_data[i].date);
        const live_data = song_list_data[i];
        const is_y = (live_data.url_y.length > 0);
        const songs = live_data.songs;
        const has_timestamp = live_data.timestamps !== undefined;
        let song_timestamp = [];
        if(has_timestamp) {
            song_timestamp = live_data.timestamps;
        }
        //Count the song seperately.
        let medley = [], normal = [], last_medley = false;
        song_counter += songs.length;
        for(let j=0; j<songs.length; ++j) {
            const song_pos = has_timestamp ? song_timestamp[j] : -1;
            if(songs[j][0] === '\t') {
                //Last title is medley title, remove it.
                if(!last_medley) {
                    normal.pop();
                    song_counter -= 1;
                }
                medley.push([songs[j], song_pos]);
                last_medley = true;
            } else {
                normal.push([songs[j], song_pos]);
                last_medley = false;
            }
        }
        for(let j=0; j<normal.length; ++j) {
            const song_data = normal[j];
            count_song(song_statistic, song_data[0], is_y, i, song_data[1]);
        }
        for(let j=0; j<medley.length; ++j) {
            const song_data = medley[j];
            count_song(medley_statistic, song_data[0].trimStart(), is_y, i, song_data[1]);
        }
        //Count the year and date.
        const live_year = live_data.date.getFullYear();
        if(live_year in calender) {
            calender[live_year].push([live_data, i]);
        } else {
            calender[live_year] = [[live_data, i]];
        }
    }
    console.log('Total song counter: ', song_counter);
    // Save the calendar.
    song_list.calender = calender;
    // Save the song statistic.
    function convert_statistic_to_records(statistic_records) {
        let song_names = Object.keys(statistic_records);
        song_names.sort();
        let song_records = [];
        for(let i=0; i<song_names.length; ++i) {
            const song_name = song_names[i], song_detail_id = song_name.trimLeft().toLowerCase();
            let song_detail = song_list.details[''];
            if(song_detail_id in song_list.details) {
                song_detail = song_list.details[song_detail_id];
            }
            song_detail['id'] = song_detail_id;
            song_records.push([song_name, statistic_records[song_names[i]], song_detail]);
        }
        return song_records;
    }
    song_list.song_statistic = convert_statistic_to_records(song_statistic);
    song_list.medley_statistic = convert_statistic_to_records(medley_statistic);

    //Merge the statistic results.
    // Shallow copy the song statistic to avoid change the raw data.
    const medley_names = Object.keys(medley_statistic);
    function merge_song_list(song_list, medley_list) {
        let merged_list = song_list.concat(medley_list);
        merged_list.sort(function(a, b) { return a[0] - b[0];});
        return merged_list;
    }
    let merge_statistic = {};
    for(let i=0; i<medley_names.length; ++i) {
        const song_name = medley_names[i].trimLeft();
        let medley_data = medley_statistic[medley_names[i]], medley_keys = Object.keys(medley_data);
        // Update all the song info with an extra flag.
        for(let j=0; j<medley_data.y_count.length; ++j) {
            medley_data.y_count[j].push(true);
        }
        for(let j=0; j<medley_data.b_count.length; ++j) {
            medley_data.b_count[j].push(true);
        }
        if(song_name in song_statistic) {
            // Merge the data.
            let song_data = song_statistic[song_name];
            let merge_data = {};
            // Add the count together.
            merge_data.count = song_data.count + medley_data.count;
            // Compare the last live, less one is the nearest one.
            if(medley_data.last_live[0] < song_data.last_live[0]) {
                merge_data.last_live = medley_data.last_live;
            } else {
                merge_data.last_live = song_data.last_live;
            }
            //Merge the array.
            merge_data.y_count = merge_song_list(song_data.y_count, medley_data.y_count);
            merge_data.b_count = merge_song_list(song_data.b_count, medley_data.b_count);
            merge_statistic[song_name] = merge_data;
        } else {
            merge_statistic[song_name] = medley_data;
        }
    }
    const song_names = Object.keys(song_statistic);
    for(let i=0; i<song_names.length; ++i) {
        if(song_names[i] in merge_statistic) {
            continue;
        }
        merge_statistic[song_names[i]] = song_statistic[song_names[i]];
    }
    song_list.merge_statistic = convert_statistic_to_records(merge_statistic);
    //Find the missing song details.
    const total_song_names = Object.keys(merge_statistic), missing_songs = [];
    for(let i=0; i<total_song_names.length; ++i) {
        const song_name = total_song_names[i].toLowerCase();
        if(song_name in song_list.details) {
            continue;
        }
        missing_songs.push(song_name);
    }
    if(missing_songs.length > 0) {
        console.log('[Song Details] Missing the song details:');
        console.log(missing_songs.join('\n'));
    }

    // Find all the limited songs.
    function get_stream_limited_songs(song_statistics) {
        let limited_youtube = [], limited_bilibili = [], not_limited = [];
        for(let i=0; i<song_statistics.length; ++i) {
            const song_info = song_statistics[i][1];
            if(song_info.b_count.length === 0) {
                limited_youtube.push(song_statistics[i]);
            } else if(song_info.y_count.length === 0) {
                limited_bilibili.push(song_statistics[i]);
            } else {
                not_limited.push(song_statistics[i]);
            }
        }
        return {'youtube': limited_youtube, 'bilibili': limited_bilibili, 'both': not_limited};
    }
    song_list.song_stream_limited = get_stream_limited_songs(song_list.merge_statistic);
    //Find the medley limited song.
    // Get all the song list songs.
    let single_names = new Set(), medley_limited = [];
    for(let i=0; i<song_list.song_statistic.length; ++i) {
        single_names.add(song_list.song_statistic[i][0]);
    }
    // Search limited in medley statistic.
    for(let i=0; i<song_list.medley_statistic.length; ++i) {
        if(single_names.has(song_list.medley_statistic[i][0])) {
            continue;
        }
        medley_limited.push(song_list.medley_statistic[i]);
    }
    song_list.medley_limited = medley_limited;

    song_list.records = song_list_data;
}

function sl_render_nav(tab_id) {
    const navbar_ids = ['sl-live-list', 'sl-song-list', 'sl-medley-list', 'sl-mixed-list', 'sl-song-statistic'];
    for(let i=0; i<navbar_ids.length; ++i) {
        document.getElementById(navbar_ids[i]).classList.remove('active');
        document.getElementById(navbar_ids[i] + '-label').innerHTML = app_i18n.navbar_song_list[i];
    }
    document.getElementById(tab_id).classList.add('active');
}

function reload_setori_to_year() {
    let year_combo = document.getElementById('setori-year-menu');
    window.location.href = "#setori&year="+year_combo.options[year_combo.selectedIndex].value
}

function reload_setori_to_date() {
    let date_combo = document.getElementById('setori-date-menu');
    window.location.href = "#setori&id="+date_combo.options[date_combo.selectedIndex].value
}

function sl_render_setori_year_items() {
    // Render the years.
    let year_items = [];
    let year_list = Object.keys(song_list.calender);
    for(let i=0; i<year_list.length; ++i) {
        year_list[i] = parseInt(year_list[i]);
    }
    year_list = year_list.sort(function(a, b) { return a - b;}).reverse();
    for(let i=0; i<year_list.length; ++i) {
        year_items.push('<option value="'+year_list[i]+'">'+year_list[i]+'</option>');
    }
    return year_items.join('\n');
}

function sl_render_setori_years() {
    document.getElementById('sl-live-date-title').innerHTML = app_i18n.title_setori_date;
    document.getElementById('setori-year-menu').innerHTML = sl_render_setori_year_items();
}

function sl_render_archive_link(setori_data, timestamp, show_timestamp) {
    let live_icon = 'icon-youtube';
    if(setori_data.url_y.length === 0) {
        live_icon = 'icon-bilibili';
    }
    let live_url = app_archive_url(setori_data.url_y, setori_data.url_b);
    let timestamp_text = '';
    if(timestamp !== undefined && timestamp !== -1) {
        live_url = sl_append_time_stamp(live_url, timestamp);
        if(show_timestamp) {
            timestamp_text = ' (' + sl_pos_to_timestamp(sl_timestamp_to_pos(timestamp)) + ')';
        }
    }
    const setori_date = setori_data.date;
    let live_html = [
        app_hyperlink(live_url),
        setori_date.getFullYear() + '/' + (setori_date.getMonth()+1) + '/' + setori_date.getDate() + ' @&nbsp;' +
        '<div class="text-icon ' + live_icon + '"></div>',
        timestamp_text,
        '</a>'];
    return live_html.join('\n');
}

function sl_view_song_list_on(setori_data) {
    const record_date = setori_data.date,
        record_url = '#setori&year='+record_date.getFullYear()+'&month='+(record_date.getMonth()+1)+'&day='+record_date.getDate();
    return '<a class="half-opacity-text" href="'+record_url+'">'+app_i18n.view_setori+'</a>';
}

function sl_show_setori(setori_id) {
    const setori_data = song_list.records[setori_id];
    //Render the setori.
    document.getElementById('sl-live-title').innerHTML = setori_data.title;
    document.getElementById('sl-live-url').innerHTML = sl_render_archive_link(setori_data);
    //Render the list.
    let song_li_list = [], last_indent = false;
    const has_timestamp = setori_data.timestamps !== undefined;
    const song_detail = app_i18n.title_song_detail_info;
    const live_url = app_archive_url(setori_data.url_y, setori_data.url_b);
    for(let i=0; i<setori_data.songs.length; ++i) {
        //Check indent.
        const song_name = setori_data.songs[i];
        if(song_name[0] === '\t') {
            if(!last_indent) {
                song_li_list.push('<ul>');
            }
            last_indent = true;
        } else {
            if(last_indent) {
                song_li_list.push('</ul>');
            }
            last_indent = false;
        }
        let song_info_url = '#song-info&is_mixed&song_name=' + song_name_to_esc(setori_data.songs[i]);
        song_info_url = ', <a class="clickable-header half-opacity-text" href="'+song_info_url+'">'+song_detail+'</a>'
        let song_jump_url = has_timestamp ? sl_append_time_stamp(live_url, setori_data.timestamps[i]) : '';
        if(song_jump_url.length > 0) {
            let timestamp_text = sl_pos_to_timestamp(sl_timestamp_to_pos(setori_data.timestamps[i]));
            if(timestamp_text.length !== 0) {
                timestamp_text = ' (' + timestamp_text + ')';
            }
            song_jump_url = '<a class="clickable-header" href="'+song_jump_url+'" rel="noreferrer noopener" target="_blank">'
                + setori_data.songs[i] + timestamp_text +'</a>';
        } else {
            song_jump_url = setori_data.songs[i];
        }
        if(i !== setori_data.songs.length - 1 && setori_data.songs[i+1][0] === '\t' && !last_indent) {
            song_info_url = '';
        }
        song_li_list.push('<li>' + song_jump_url + song_info_url + '</li>');
    }
    document.getElementById('sl-live-details').innerHTML = song_li_list.join('\n');
    //Render the year and date list.
    const setori_date = setori_data.date;
    document.getElementById('setori-year-menu').value = setori_date.getFullYear().toString();
    function get_calender_date_str(date) {
        return time_str_minsec(date.getMonth()+1) + '-' + time_str_minsec(date.getDate());
    }
    const target_date = get_calender_date_str(setori_date);
    let date_items = [], target_value = 0;
    const year_dates = song_list.calender[setori_date.getFullYear()];
    for(let i=0; i<year_dates.length; ++i) {
        const option_date = get_calender_date_str(year_dates[i][0].date);
        if(option_date == target_date) {
            target_value = year_dates[i][1];
        }
        date_items.push('<option value="'+year_dates[i][1]+'">'+option_date+'</option>');
    }
    let date_menu = document.getElementById('setori-date-menu');
    date_menu.innerHTML = date_items.join('\n');
    date_menu.value = target_value.toString();
}

function song_list_load_panel(panel_url, panel_title, panel_navid, callback) {
    document.title = panel_title + ' - ' + app_i18n.brand;
    header_set_item('songs');
    //Fetch the song list global panel.
    app_load_panel('song-list.html', function() {
        //Update the panel.
        sl_render_nav(panel_navid);
        //Fetch the specifc panel URL.
        app_fetch(panel_url, function(panel_page_data) {
            document.getElementById('sl-panel').innerHTML = panel_page_data;
            //Call the post-render callback.
            if(callback !== undefined) {
                callback();
            }
        });
    });
}

function sl_find_statistic(target_list, target_name) {
    for(let i=0; i<target_list.length; ++i) {
        if(target_name === target_list[i][0]) {
            return target_list[i];
        }
    }
}

function sl_render_song_table(song_records, counter_id, result_id) {
    // Render the result counter.
    document.getElementById(counter_id).innerHTML = app_i18n.search_song_count(song_records.length);
    // Render the song items.
    let song_items = [];
    for(let i=0; i<song_records.length; ++i) {
        const song_item = song_records[i];
        const song_info = song_item[1];
        let song_url = '#song-info&';
        if(song_list.current_song_mode === 1) {
            song_url += 'is_medley&';
        } else if(song_list.current_song_mode === 2) {
            song_url += 'is_mixed&';
        }
        song_url += 'song_name=' + song_name_to_esc(song_item[0]);
        const item_html = ['<tr>',
            '<td><a href="'+song_url+'">'+song_item[0]+'</a></td>',
            '<td>'+sl_render_archive_link(song_list.records[song_info.last_live[0]], song_info.last_live[1])+'</td>',
            '<td>'+song_info.count+'</td>',
            '<td>'+song_info.y_count.length+'</td>',
            '<td>'+song_info.b_count.length+'</td>',
            '</tr>'];
        song_items.push(item_html.join('\n'));
    }
    document.getElementById(result_id).innerHTML = song_items.join('\n');
}

function sl_set_song_table(target_records, counter_id, result_id) {
    // Save the target records.
    song_list.display_cache = target_records;
    //Sort the song items as expected.
    if(song_list.sort_column in sl_song_sort_function) {
        song_list.display_cache.sort(sl_song_sort_function[song_list.sort_column]);
        if(song_list.reverse) {
            song_list.display_cache.reverse();
        }
    }
    // Render the data.
    sl_render_song_table(song_list.display_cache, counter_id, result_id);
}

function sl_search_song_table(keywords, counter_id, result_id) {
    //Preprocess the keywords.
    const raw_keywords = keywords.toLowerCase();
    keywords = convert_hiragana_to_katakana(raw_keywords);
    //Loop and search the result.
    let search_results = [];
    if(keywords.length > 0) {
        for(let i=0; i<song_list.target_records.length; ++i) {
            //Extract the song details.
            const song_raw_name = song_list.target_records[i][0].toLowerCase();
            //Check whether raw name matches, this is the fastest.
            if(song_raw_name.match(raw_keywords)) {
                search_results.push(song_list.target_records[i]);
                continue;
            }
            //Check whether other guesses matches.
            const song_details = song_list.target_records[i][2];
            if(song_details.id.match(raw_keywords) || song_details.id.match(keywords) ||
                song_details.r.match(keywords) || song_details.k.match(keywords) ||
                song_details.a.match(keywords)) {
                search_results.push(song_list.target_records[i]);
            }
        }
    } else {
        search_results = song_list.target_records;
    }
    //Set the result to be displayed.
    sl_set_song_table(search_results, counter_id, result_id);
}

function sl_on_column_click(column_id) {
    for(let i=0; i<sl_table_header_ids.length; ++i) {
        document.getElementById('sort-mark-' + i).innerHTML = '';
    }
    //Perform the new column sort or reverse the result.
    if(song_list.sort_column !== column_id) {
        song_list.sort_column = column_id;
        song_list.reverse = false;
    } else {
        song_list.reverse = !song_list.reverse;
    }
    //Update the sort mark.
    if(song_list.reverse) {
        document.getElementById('sort-mark-'+column_id).innerHTML = app_i18n.sort_descend;
    } else {
        document.getElementById('sort-mark-'+column_id).innerHTML = app_i18n.sort_ascend;
    }
    //Update the result.
    sl_set_song_table(song_list.display_cache, 'sl-search-counter', 'sl-search-results');
}

function sl_load_song_statistic(panel_navid, target_fetch) {
    song_list_load_panel('song-view.html', app_i18n.title_song_list, panel_navid, function() {
        //Configure the target records.
        song_list.target_records = target_fetch();
        // Set the placeholder.
        document.getElementById('sl-search-song').setAttribute('placeholder', app_i18n.search_song);
        // Render the table header.
        const table_header = app_i18n.song_record_table_title;
        for(let i=0; i<sl_table_header_ids.length; ++i) {
            document.getElementById(sl_table_header_ids[i]).innerHTML = table_header[i];
            document.getElementById('sl-song-header-'+i).onclick = function(event) { sl_on_column_click(i); }
        }
        //Hook the search box.
        document.getElementById('sl-search-song').oninput = function(event) {
            sl_search_song_table(event.target.value, 'sl-search-counter', 'sl-search-results');
        };
        //Reset the sort column and reverse state.
        song_list.sort_column = 0;
        song_list.reverse = false;
        if(song_list.reverse) {
            document.getElementById('sort-mark-0').innerHTML = app_i18n.sort_descend;
        } else {
            document.getElementById('sort-mark-0').innerHTML = app_i18n.sort_ascend;
        }
        // Render the table.
        sl_set_song_table(song_list.target_records, 'sl-search-counter', 'sl-search-results');
    });
}

function sl_load_mixed_list() {
    song_list.current_song_mode = 2;
    sl_load_song_statistic('sl-mixed-list', function() { return song_list.merge_statistic; });
}

function sl_load_medley_list() {
    song_list.current_song_mode = 1;
    sl_load_song_statistic('sl-medley-list', function() { return song_list.medley_statistic; });
}

function sl_load_song_list() {
    song_list.current_song_mode = 0;
    sl_load_song_statistic('sl-song-list', function() { return song_list.song_statistic; });
}

function sl_song_info_init_ui(song_name, display_mode) {
    let title_element = document.getElementById('sl-song-title'), statistic_result = undefined;
    switch(display_mode) {
        case 0:
            title_element.innerHTML = app_i18n.title_song_info(song_name);
            statistic_result = sl_find_statistic(song_list.song_statistic, song_name);
            break;
        case 1:
            title_element.innerHTML = app_i18n.title_song_info(app_i18n.title_medley(song_name));
            statistic_result = sl_find_statistic(song_list.medley_statistic, song_name);
            break;
        case 2:
            title_element.innerHTML = app_i18n.title_song_info(song_name);
            statistic_result = sl_find_statistic(song_list.merge_statistic, song_name);
            break;
    }
    if(statistic_result === undefined) {
        return;
    }
    // Render the content.
    document.getElementById('sl-last-live-title').innerHTML = app_i18n.title_last_live;
    document.getElementById('sl-total-sing-title').innerHTML = app_i18n.title_sing_total;
    document.getElementById('sl-youtube-sing-title').innerHTML = app_i18n.title_sing_youtube;
    document.getElementById('sl-bilibili-sing-title').innerHTML = app_i18n.title_sing_bilibili;
    const song_info = statistic_result[1];
    document.getElementById('sl-last-live').innerHTML = sl_render_archive_link(song_list.records[song_info.last_live[0]], song_info.last_live[1], true);
    document.getElementById('sl-total-times').innerHTML = song_info.count;
    document.getElementById('sl-youtube-times').innerHTML = song_info.y_count.length;
    document.getElementById('sl-bilibili-times').innerHTML = song_info.b_count.length;
    function render_song_list(count_list) {
        let live_html = [];
        for(let i=0; i<count_list.length; ++i) {
            const record = song_list.records[count_list[i][0]];
            let song_url = sl_render_archive_link(record, count_list[i][1], true);
            if(count_list[i].length === 3) {
                song_url = app_i18n.title_medley(song_url);
            }
            live_html.push('<li>'+song_url+', '+sl_view_song_list_on(record)+'</li>');
        }
        return live_html.join('\n');
    }
    document.getElementById('sl-youtube-lives').innerHTML = render_song_list(song_info.y_count);
    document.getElementById('sl-bilibili-lives').innerHTML = render_song_list(song_info.b_count);
}

function sl_load_song_info() {
    const song_name = esc_to_song_name(app_url.args.song_name);
    let selected_nav = 'sl-song-list', mode = 0;
    if('is_medley' in app_url.args) {
        selected_nav = 'sl-medley-list';
        mode = 1;
    } else if('is_mixed' in app_url.args) {
        selected_nav = 'sl-mixed-list';
        mode = 2;
    }
    song_list_load_panel('song-detail.html', app_i18n.title_song_info(song_name), selected_nav, function() {
            // Show the UI.
            sl_song_info_init_ui(song_name, mode);
    });
}

function sl_setori_init_ui() {
    //Render the date selector.
    sl_render_setori_years();
    //Render the setori.
    if('id' in app_url.args) {
        // Check id validation.
        if(app_url.args.id < song_list.records.length) {
            sl_show_setori(app_url.args.id);
        }
        return;
    }
    if('year' in app_url.args) {
        // Check whether we have month and day.
        if('month' in app_url.args && 'day' in app_url.args) {
            // Find the nearest one.
            const target_calender = song_list.calender[parseInt(app_url.args['year'])],
                target_month = parseInt(app_url.args['month']),
                target_day = parseInt(app_url.args['day']);
            let stream_counter = 0;
            if('counter' in app_url.args) {
                stream_counter = parseInt(app_url.args['counter']);
            }
            for(let i=0; i<target_calender.length; ++i) {
                const live_date = target_calender[i][0].date;
                if((live_date.getMonth()+1) === target_month && live_date.getDate() === target_day) {
                    if(stream_counter > 0) {
                        --stream_counter;
                        continue;
                    }
                    sl_show_setori(target_calender[i][1]);
                    return;
                }
            }
        } else {
            // Use the latest one.
            sl_show_setori(song_list.calender[parseInt(app_url.args['year'])][0][1]);
        }
        return;
    }
    // Default, show the latest one.
    sl_show_setori(0);
}

function sl_load_setori() {
    song_list_load_panel('setori.html', app_i18n.title_song_list, 'sl-live-list', sl_setori_init_ui);
}

function render_limited_statistic(limited_songs) {
    //Show the panel.
    document.getElementById('sl-s-limited').removeAttribute('hidden');
    //Render the chart.
    const chart_context = document.getElementById('sl-s-song-chart');
    const single_chart = new Chart(chart_context, {
        type: 'pie',
        data: {
            labels: [
                'Youtube',
                'BiliBili',
                app_i18n.unlimited_songs
            ],
            datasets: [{
                label: 'Dataset',
                data: [limited_songs.youtube.length, limited_songs.bilibili.length, limited_songs.both.length],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        }
    });
    //Render the header of the table.
    const header_ids = ['sl-youtube-limited-title', 'sl-bilibili-limited-title'];
    for(let i=0; i<header_ids.length; ++i) {
        document.getElementById(header_ids[i]).innerHTML = app_i18n.limited_title[i];
    }
    const table_headers = app_i18n.song_record_table_title;
    for(let i=0; i<table_headers.length; ++i) {
        document.getElementById('sl-y-header-' + i).innerHTML = table_headers[i];
        document.getElementById('sl-b-header-' + i).innerHTML = table_headers[i];
    }
    //Render the table.
    song_list.current_song_mode = 2;
    sl_render_song_table(limited_songs.youtube, 'sl-youtube-count', 'sl-youtube-songs');
    sl_render_song_table(limited_songs.bilibili, 'sl-bilibili-count', 'sl-bilibili-songs');
}

function render_limited_medley() {
    //Show the panel.
    document.getElementById('sl-m-limited').removeAttribute('hidden');
    //Show the table.
    const table_headers = app_i18n.song_record_table_title;
    for(let i=0; i<table_headers.length; ++i) {
        document.getElementById('sl-m-header-' + i).innerHTML = table_headers[i];
    }
    //Render the table.
    sl_render_song_table(song_list.medley_limited, 'sl-m-count', 'sl-medley-songs');
}

function on_max_limit_change() {
    //Get the maximum limit.
    let song_max_limit = document.getElementById('sl-c-max-count').value;
    //Render the table.
    render_limited_table(parseInt(song_max_limit));
}

function render_limited_table(max_count) {
    //Filter out the max count data.
    song_list.limited_table = [];
    //Render the table.
    for(let i=0; i<song_list.merge_statistic.length; ++i) {
        //Find out the count data.
        const song_item = song_list.merge_statistic[i];
        if(song_item[1].count === max_count) {
            song_list.limited_table.push(song_item);
        }
    }
    //Sort as last singing date.
    song_list.limited_table.sort(sl_song_sort_function[1]);
    sl_render_song_table(song_list.limited_table, 'sl-c-count', 'sl-c-search-results');
}

function render_limited_count() {
    //Show the panel.
    document.getElementById('sl-c-counter').removeAttribute('hidden');
    //Show the table.
    document.getElementById('sl-c-time-label').innerHTML = app_i18n.title_time_select;
    // Render the table header.
    const table_header = app_i18n.song_record_table_title;
    const count_header_ids = ['sl-c-song-name', 'sl-c-song-last', 'sl-c-song-times', 'sl-c-song-at-youtube', 'sl-c-song-at-bilibili'];
    for(let i=0; i<count_header_ids.length; ++i) {
        document.getElementById(count_header_ids[i]).innerHTML = table_header[i];
    }
    //Render the table.
    render_limited_table(1);
}

function render_year_new_songs_table(year_num) {
    //Filter out the max count data.
    song_list.year_new_songs = [];
    //Render the table.
    for(let i=0; i<song_list.merge_statistic.length; ++i) {
        //Find out the count data.
        const song_item = song_list.merge_statistic[i];
        function get_first_sang_year(count_list) {
            if(count_list.length === 0) {
                return -1;
            }
            return song_list.records[count_list[count_list.length-1][0]].date.getFullYear();
        }
        function is_year_new_song() {
            const b_year = get_first_sang_year(song_item[1].b_count),
                y_year = get_first_sang_year(song_item[1].y_count);
            //If one list is empty, check the other list.
            if(b_year === -1) {
                return y_year === year_num;
            }
            if(y_year === -1) {
                return b_year === year_num;
            }
            //If both list are not empty, the minimum one should be the year num.
            const less_year = b_year < y_year ? b_year : y_year;
            return less_year === year_num;
        }

        if(is_year_new_song()) {
            song_list.year_new_songs.push(song_item)
        }
    }
    //Sort as last singing date.
    song_list.year_new_songs.sort(sl_song_sort_function[1]);
    sl_render_song_table(song_list.year_new_songs, 'sl-yn-count', 'sl-yn-search-results');
}

function on_year_new_songs_update_year() {
    let year_combo = document.getElementById('sl-yn-year-select');
    render_year_new_songs_table(parseInt(year_combo.options[year_combo.selectedIndex].value));
}

function render_year_new_songs() {
    //Show the panel.
    document.getElementById('sl-year-new-songs').removeAttribute('hidden');
    //Show the table.
    document.getElementById('sl-year-new-songs-label').innerHTML = app_i18n.year_sang;
    // Render the table header.
    const table_header = app_i18n.song_record_table_title;
    const yn_header_ids = ['sl-yn-song-name', 'sl-yn-song-last', 'sl-yn-song-times', 'sl-yn-song-at-youtube', 'sl-yn-song-at-bilibili'];
    for(let i=0; i<yn_header_ids.length; ++i) {
        document.getElementById(yn_header_ids[i]).innerHTML = table_header[i];
    }
    //Render the year selector.
    document.getElementById('sl-yn-year-select').innerHTML = sl_render_setori_year_items();
    //Render the table.
    render_year_new_songs_table(2023);
}

function sl_statistic_init_ui() {
    // Render the navbar.
    const navbar_statistic_ids = ['sl-s-songs-label', 'sl-s-medley-only-label', 'sl-s-count-limit-label', 'sl-s-year-new-songs-label'];
    for(let i=0; i<navbar_statistic_ids.length; ++i) {
        document.getElementById(navbar_statistic_ids[i]).innerHTML = app_i18n.navbar_statistic[i];
    }
    if('medley-only' in app_url.args) {
        document.getElementById('sl-s-medley-only').classList.add('active');
        // Render medley limited songs.
        render_limited_medley();
        return;
    }
    if('counter' in app_url.args) {
        document.getElementById('sl-s-count-limit').classList.add('active');
        // Render times limited songs.
        render_limited_count();
        return;
    }
    if('year-new-songs' in app_url.args) {
        document.getElementById('sl-s-year-new-songs').classList.add('active');
        // Render the year new songs.
        render_year_new_songs();
        return;
    }
    document.getElementById('sl-s-songs').classList.add('active');
    // Render the limited statistic.
    render_limited_statistic(song_list.song_stream_limited);
}

function sl_load_statistic() {
    song_list_load_panel('song-statistic.html', app_i18n.title_song_list, 'sl-song-statistic', sl_statistic_init_ui);
}
