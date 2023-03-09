let stream = {records: [], display_cache: [], filter_platform: [], filter_index: {'y': [], 'b': [], 'f': []}, filter_content: []};
let slides = {records: []};
const stream_filter_platform_button = ['youtube', 'bilibili', 'fanbox'];
const stream_filter_content_button = ['song', 'others'];

/* day counter */
function day_counter_render() {
    const today = new Date();
    const day_divider = 1000 * 60 * 60 * 24;
    document.getElementById('day-counter').innerHTML = "<div>" +app_i18n.count_first_v(Math.floor((today - new Date("2019-08-01")) / day_divider)) + "</div>" +
        "<div>" +app_i18n.count_first_y(Math.floor((today - new Date("2019-08-03")) / day_divider)) + "</div>" +
        "<div>" +app_i18n.count_first_b(Math.floor((today - new Date("2019-08-17")) / day_divider)) + "</div>"
}

/* slides */
let slideIndex = 1;

function slide_switch(n) {
    slide_show(slideIndex += n);
}

function slide_current(n) {
    slide_show(slideIndex = n);
}

function slide_show(n) {
    let i;
    let slides = document.getElementsByClassName("slide-page");
    let dots = document.getElementsByClassName("slide-dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" slide-active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " slide-active";
}

const slide_image_flag = new Date().getTime().toString();

function slides_image_url(item_info) {
    let slide_title = item_info.title;
    if(slide_title.startsWith('$#')) {
        return '/asserts/slides/' + slide_title.substring(2) + '.png?dev=' + slide_image_flag;
    }
    return item_info.img;
}

let slide_image_blob = [];
function slides_cache_image() {
    if(slide_image_blob.length > 0) {
        load_streams_ui();
    }
    // Just fetch all the image once.
    for(let i=0; i<slides.records.length; ++i) {
        const slide_raw_url = slides_image_url(slides.records[i]);
        app_fetch_image(slide_raw_url, function (image_blob_url) {
            slide_image_blob.push([slide_raw_url, image_blob_url]);
            if(slide_image_blob.length === slides.records.length) {
                load_streams_ui();
            }
        });
    }
}

function slide_blob_url(raw_url) {
    for(let i=0; i<slide_image_blob.length; ++i) {
        if(slide_image_blob[i][0] === raw_url) {
            return slide_image_blob[i][1];
        }
    }
    return '';
}

function slides_render() {
    function create_slide(title, image_url, url, y_url, b_url) {
        let target_url = url;
        if(target_url.length === 0) {
            //Find a valid url.
            target_url = app_archive_url(y_url, b_url);
        }
        return '<div class="slide-page slide-fade">' +
            app_hyperlink(target_url)+
            '<img class="slide-image" src="'+image_url+'">' +
            '<div class="slide-text"><p>'+title+'</p></div>' +
            '</a>'+
            '</div>';
    }

    //Render the slide into HTML.
    let indicator = [], item_data = [];
    for(let i=0; i<slides.records.length; ++i) {
        const item_info = slides.records[i];
        let slide_title = item_info.title, image_url = slide_blob_url(slides_image_url(item_info)),
            s_url = '', s_y_url = '', s_b_url = '';
        if(slide_title.startsWith('$#')) {
            slide_title = slide_title.substring(2);
            //Check the title is valid or not.
            if(slide_title === 'last_live' || slide_title === 'last_song_live') {
                //Find the last live but not song stream.
                function find_last_stream(is_song) {
                    for(let i=0; i<stream.records.length; ++i) {
                        if(stream.records[i][5] === is_song) {
                            return stream.records[i];
                        }
                    }
                    return undefined;
                }
                const target_stream = find_last_stream(slide_title === 'last_song_live');
                if(target_stream !== undefined) {
                    slide_title = target_stream[1];
                    s_y_url = target_stream[2];
                    s_b_url = target_stream[3];
                }
            }
        } else {
            s_url = item_info.url;
            s_y_url = item_info['youtube-url'];
            s_b_url = item_info['bilibili-url'];
        }
        if(slide_title === 'FANBOX限定配信') {
            image_url = '/asserts/slides/fanbox.png?dev=' + slide_image_flag;
        }
        item_data.push(create_slide(slide_title, image_url, s_url, s_y_url, s_b_url));
        indicator.push('<span class="slide-dot" onclick="slide_current('+(i+1)+')"></span>');
    }
    //Construct the slide source code structure.
    item_data.push('<a class="slide-button slide-prev" onclick="slide_switch(-1)"><p>&#10094;</p></a>');
    item_data.push('<a class="slide-button slide-next" onclick="slide_switch(1)"><p>&#10095;</p></a>');
    item_data.push('<div class="slide-indicator">');
    item_data.push(indicator.join('\n'));
    item_data.push('</div>');
    //Set the inner HTML to page.
    document.getElementById('stream-slides').innerHTML = item_data.join('\n');
    //Show the first slide.
    slide_show(slideIndex);
}

function stream_filter_platform() {
    if(stream.filter_platform.length === 0 || stream.filter_platform.length === stream_filter_platform_button.length) {
        return stream.records;
    }
    //Pick out the list.
    function merge_indices(l1, l2) {
        if (!l1 || !l2) {
            return l1 || l2;
        }
        let merged_list = [], l1_pos = 0, l2_pos = 0;
        while(l1_pos < l1.length && l2_pos < l2.length) {
            if(l1[l1_pos] === l2[l2_pos]) {
                merged_list.push(l1[l1_pos]);
                ++l1_pos;
                ++l2_pos;
            } else if(l1[l1_pos] < l2[l2_pos]) {
                merged_list.push(l1[l1_pos]);
                ++l1_pos;
            } else {
                merged_list.push(l2[l2_pos]);
                ++l2_pos;
            }
        }
        //Add the rest of the list.
        if(l1_pos < l1.length) {
            merged_list = merged_list.concat(l1.slice(l1_pos, -1));
        }
        if(l2_pos < l2.length) {
            merged_list = merged_list.concat(l2.slice(l2_pos, -1));
        }
        return merged_list;
    }

    let filter_result = [];
    for(let i=0; i<stream.filter_platform.length; ++i) {
        filter_result = merge_indices(filter_result, stream.filter_index[stream.filter_platform[i]]);
    }
    //Convert the filter result into real filter content.
    for(let i=0; i<filter_result.length; ++i) {
        filter_result[i] = stream.records[filter_result[i]];
    }
    return filter_result;
}

function stream_filter_content(source_content) {
    //Check no need to filter.
    if(stream.filter_content.length === 0 || stream.filter_content.length === stream_filter_content_button.length) {
        return source_content;
    }
    //Filter the result.
    let check_data_5_true = stream.filter_content.includes('song');
    let check_data_5_false = stream.filter_content.includes('others');
    let filter_result = [];
    for(let i=0; i<source_content.length; ++i) {
        const video_info = source_content[i];
        if(check_data_5_true && video_info[5]) {
            filter_result.push(video_info);
            continue;
        }
        if(check_data_5_false && !video_info[5]) {
            filter_result.push(video_info);
        }
    }
    return filter_result;
}

function stream_filter_records() {
    // Filter the platform first.
    let filter_result = stream_filter_platform();
    // Then filter the 'has date'.
    return stream_filter_content(filter_result);
}

/* stream records */
function stream_search(keywords) {
    //Perform the search.
    if(keywords.length === 0) {
        //Check the filter options.
        stream.display_cache = stream_filter_records();
    } else {
        // Filter the result.
        stream.display_cache = [];
        keywords = keywords.toLowerCase();
        let filter_result = stream_filter_records();
        for(let i=0; i<filter_result.length; ++i) {
            if(stream.records[i][1].toLowerCase().match(keywords)) {
                stream.display_cache.push(filter_result[i]);
            }
        }
    }
    //Render the table.
    document.getElementById('stream-counter').innerHTML = app_i18n.search_stream_count(stream.display_cache.length);
    //Construct the items.
    const locale = navigator.language;
    let record_rows = [];
    for(let i=0; i<stream.display_cache.length; ++i) {
        const video_info = stream.display_cache[i];
        let song_list_url = '';
        if(video_info[5]) {
            const date = video_info[4];
            song_list_url = '<a class="half-opacity-text float-to-right" href="#setori&year='+date.getFullYear()+'&month='+(date.getMonth()+1)+'&day='+date.getDate()+'">'+app_i18n.view_setori+'</a>';
        }
        // Check the table icon.
        let video_icon = [];
        const video_source = video_info[0];
        for(let j=0; j<video_source.length; ++j) {
            if(video_source[j] === 'b') {
                video_icon.push('<div class="text-icon icon-bilibili"></div>');
            } else if(video_source[j] === 'f') {
                video_icon.push('<div class="text-icon icon-fanbox"></div>');
            } else {
                video_icon.push('<div class="text-icon icon-youtube"></div>');
            }
        }
        // Construct the title part.
        const row_src = ["<tr>",
            '<td class="table-icon">'+video_icon.join('')+'</td>',
            '<td class="table-stretch">' + app_hyperlink(app_archive_url(video_info[2], video_info[3])) + video_info[1] + '</a>' + song_list_url + '</td>',
            "<td>"+ video_info[4].toLocaleDateString(locale) + "</td>",
            "</tr>"]
        record_rows.push(row_src.join('\n'));
    }
    document.getElementById('stream-results').innerHTML = record_rows.join('\n');
}

function stream_options_render() {
    document.getElementById('stream-search-option').innerHTML = app_i18n.stream_options;
    // Platform options.
    document.getElementById('stream-filter-platform').innerHTML = app_i18n.stream_option_platform;
    document.getElementById('stream-search-show-youtube').innerHTML = app_i18n.contacts[1];
    document.getElementById('stream-search-show-bilibili').innerHTML = app_i18n.contacts[2];
    document.getElementById('stream-search-show-fanbox').innerHTML = app_i18n.contacts[3];
    // Type.
    document.getElementById('stream-filter-content').innerHTML = app_i18n.stream_option_content;
    document.getElementById('stream-filter-content-song').innerHTML = app_i18n.stream_option_content_song;
    document.getElementById('stream-filter-content-others').innerHTML = app_i18n.stream_option_content_others;
    // Reset the search options.
    stream.filter_platform = [];
    stream.filter_content = [];
}

function load_streams_ui() {
    // Render the stream information list.
    app_load_panel('stream.html', function() {
        // Render the mobile buttons.
        render_contact_links('mobile-');
        // Render the slides.
        slides_render();
        // Render the day counter.
        day_counter_render();
        // Render the forecast.
        forecast_render();
        // Render the search options.
        stream_options_render();
        // Prepare the search box.
        let search_box = document.getElementById('stream-search');
        search_box.setAttribute('placeholder', app_i18n.search_stream);
        search_box.oninput = function(event) { stream_search(event.target.value); };
        //Perform an empty search.
        stream_search('');
    });
}

function load_streams() {
    document.title = app_i18n.title_stream;
    header_set_item('stream');
    // Cache the slides images.
    slides_cache_image();
}

function stream_load_data(video_data) {
    let song_date = [];
    for(let i=0; i<song_list.records.length; ++i) {
        song_date.push(new Date(song_list.records[i].date));
    }
    for(let i=0; i<video_data.length; ++i) {
        video_data[i][4] = new Date(video_data[i][4]);
    }
    //Extract the song_list date.
    song_date = new Set(song_date);
    song_date.has = function(a1) {
        if(a1 instanceof Date) {
            for(let a2 of this) {
                if (a1.getFullYear() === a2.getFullYear() && a1.getMonth() === a2.getMonth() && a1.getDate() === a2.getDate()) {
                    return true;
                }
            }
        }
        return false;
    };
    //Loop append the song live date.
    for(let i=0; i<video_data.length; ++i) {
        let has_date = song_date.has(video_data[i][4]);
        let from_youtube = false, from_bilibili = false;
        for(let j=0; j<video_data[i][0].length; ++j) {
            stream.filter_index[video_data[i][0][j]].push(i);
            from_youtube = from_youtube || (video_data[i][0][j] === 'y');
            from_bilibili = from_youtube || (video_data[i][0][j] === 'b');
        }
        if(!from_bilibili && !from_youtube) {
            has_date = false;
        }
        video_data[i].push(has_date);
    }
    stream.records = video_data;
}

function stream_update_platform_filter() {
    const filter_prefix = 'stream-filter-';
    let search_filter = [];
    for(let i=0; i<stream_filter_platform_button.length; ++i) {
        if(document.getElementById(filter_prefix+stream_filter_platform_button[i]).classList.contains('active')) {
            search_filter.push(stream_filter_platform_button[i][0]);
        }
    }
    //Update the platform filter.
    stream.filter_platform = search_filter;
    //Perform search.
    stream_search(document.getElementById('stream-search').value);
}

function stream_filter_platform_toggle(element) {
    //Toggle the element class list.
    if(element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    stream_update_platform_filter();
}

function stream_update_content_filter() {
    const filter_prefix = 'stream-filter-content-';
    let search_filter = [];
    for(let i=0; i<stream_filter_content_button.length; ++i) {
        if(document.getElementById(filter_prefix+stream_filter_content_button[i]).classList.contains('active')) {
            search_filter.push(stream_filter_content_button[i]);
        }
    }
    stream.filter_content = search_filter;
    //Perform search.
    stream_search(document.getElementById('stream-search').value);
}

function stream_filter_content_toggle(element) {
    //Toggle the element class list.
    if(element.classList.contains('active')) {
        element.classList.remove('active');
    } else {
        element.classList.add('active');
    }
    stream_update_content_filter();
}

function stream_option_toggle() {
    let stream_options = document.getElementById('stream-search-options');
    if(stream_options.hasAttribute('hidden')) {
        stream_options.removeAttribute('hidden');
    } else {
        stream_options.setAttribute('hidden', '');
    }
}