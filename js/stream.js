let stream = {records: [], display_cache: []};
let slides = {records: []};

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

/* stream records */
function stream_search(keywords) {
    //Perform the search.
    if(keywords.length === 0) {
        stream.display_cache = stream.records;
    } else {
        // Filter the result.
        stream.display_cache = [];
        keywords = keywords.toLowerCase();
        for(let i=0; i<stream.records.length; ++i) {
            if(stream.records[i][1].toLowerCase().match(keywords)) {
                stream.display_cache.push(stream.records[i]);
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
        // Construct the title part.
        const row_src = ["<tr>",
            '<td class="table-icon"><div class="text-icon '+(video_info[0] === 'b' ? 'icon-bilibili' : 'icon-youtube')+'"></div></td>',
            '<td class="table-stretch">' + app_hyperlink(app_archive_url(video_info[2], video_info[3])) + video_info[1] + '</a>' + song_list_url + '</td>',
            "<td>"+ video_info[4].toLocaleDateString(locale) + "</td>",
            "</tr>"]
        record_rows.push(row_src.join('\n'));
    }
    document.getElementById('stream-results').innerHTML = record_rows.join('\n');
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
        video_data[i].push(song_date.has(video_data[i][4]));
    }
    stream.records = video_data;
}