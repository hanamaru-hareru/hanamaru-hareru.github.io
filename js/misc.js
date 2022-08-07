const OMIKUJI_TIME = 'omikuji-time';

function misc_get_ui_text(name_object, prefer) {
    if(prefer in name_object) {
        return name_object[prefer];
    }
    // Or else check whether the Japanese exist.
    if('jp' in name_object) {
        return name_object['jp'];
    }
    // Find any exist key.
    const keys = Object.keys(name_object);
    if(keys.length === 0) {
        return '';
    }
    return name_object[keys[0]];
}

function misc_omikuji_decide() {
    // Based on the timestamp of the day, decide the omikuji.
    let omikuji_timestamp = Number.parseInt(app_load_conf(OMIKUJI_TIME, -1));
    if(!Number.isInteger(omikuji_timestamp)) {
        omikuji_timestamp = -1;
    }
    //Check whether the timestamp is today.
    let current_timestamp = Date.now();
    const current_date = new Date(current_timestamp), omikuji_date = new Date(omikuji_timestamp);
    if(current_date.getFullYear() !== omikuji_date.getFullYear() || current_date.getMonth() !== omikuji_date.getMonth() || current_date.getDate() !== omikuji_date.getDate()) {
        // Save the current time as storage time.
        omikuji_timestamp = current_timestamp;
        app_set_conf(OMIKUJI_TIME, current_timestamp);
    }
    //Now base on the timestamp decide the omikuji.
    let omikuji_id = (Math.abs(omikuji_timestamp ^ 870806)) % 27 + 1, omikuji_path = '/asserts/omikuji/';
    // For specific days, we will make all id to be 27.
    if(omikuji_id === 27) {
        // This is the good luck day, show a random result from the good luck image.
        let good_luck_id = Math.round(Math.random() * 14) + 1;
        omikuji_path += 'good_luck/'+good_luck_id+'.png';
    } else {
        omikuji_path += omikuji_id+'.png'
    }
    document.getElementById('omikuji-image').setAttribute('src', omikuji_path);
}

function misc_omikuji_once_more() {
    // Reset the timestamp to -1.
    app_set_conf(OMIKUJI_TIME, -1);
    // Decide it again.
    misc_omikuji_decide();
}

function misc_init_ui() {
    // Render the headers.
    const nav_ids = ['misc-greeting', 'misc-button', 'misc-intro', 'misc-omikuji', 'misc-about'];
    for(let i=0; i<nav_ids.length; ++i) {
        document.getElementById(nav_ids[i]+'-label').innerHTML = app_i18n.navbar_misc[i];
    }
    //Update the language combo box.
    app_language_combo('misc-nav-language', document.getElementById('nav-language').value);
    //Based on arguments, show the panel.
    if('button' in app_url.args) {
        document.getElementById('misc-button').classList.add('active');
        document.getElementById('misc-panel-button').removeAttribute('hidden');
        // Render the misc button.
        const button_info = voice_button.button_info, prefer = app_load_conf('language', browser_language());
        let button_list_html = [];
        for(let i=0; i<button_info.length; ++i) {
            const button_class = button_info[i], button_data = button_class[1];
            button_list_html.push('<div class="voice-button-title">'+misc_get_ui_text(button_class[0], prefer)+'</div><div><ul class="voice-items">');
            for(let j=0; j<button_data.length; ++j) {
                const button_info = button_data[j];
                let button_html = ['<li class="voice-item">'];
                button_html.push('<div class="voice-button" id="voice-button-'+button_info.filename
                    +'" onclick="voice_play(\''+button_info.filename+'\');">');
                button_html.push(
                    '<span class="voice-button-icon" id="voice-button-'+button_info.filename+'-icon">\n'+
                    '</span>')
                button_html.push(misc_get_ui_text(button_info.name, prefer));
                button_html.push('</div></li>');
                button_list_html.push(button_html.join('\n'));
            }
            button_list_html.push('</ul></div>');
        }
        document.getElementById('misc-button-view').innerHTML = button_list_html.join('\n');
        return;
    }
    if('omikuji' in app_url.args) {
        document.getElementById('misc-omikuji').classList.add('active');
        document.getElementById('misc-panel-omikuji').removeAttribute('hidden');
        // Set the label.
        document.getElementById('omikuji-once-more').innerHTML = app_i18n.title_omikuji_once_more;
        document.getElementById('omikuji-hint').innerHTML = app_i18n.title_omikuji_hint;
        document.getElementById('omikuji-title').innerHTML = app_i18n.title_omikuji;
        for(let i=0; i<app_i18n.title_omikuji_source.length; ++i) {
            document.getElementById('omikuji-source-label-'+i).innerHTML = app_i18n.title_omikuji_source[i];
        }
        //Decide the omikuji.
        misc_omikuji_decide();
        return;
    }
    if('intro' in app_url.args) {
        document.getElementById('misc-intro').classList.add('active');
        document.getElementById('misc-panel-intro').removeAttribute('hidden');
        //Set the label.
        const label_ids = ['intro-raw', 'intro-1st', 'intro-2020', 'intro-2nd', 'intro-2021', 'intro-3rd'];
        for(let i=0; i<label_ids.length; ++i) {
            document.getElementById('misc-button-'+label_ids[i]).innerHTML = app_i18n.navbar_intro[i];
        }
        //Check position.
        if('3rd' in app_url.args) {
            document.getElementById('misc-intro-3rd').classList.add('active');
            document.getElementById('misc-lyrics-intro-3rd').removeAttribute('hidden');
        } else if('2021' in app_url.args) {
            document.getElementById('misc-intro-2021').classList.add('active');
            document.getElementById('misc-lyrics-intro-2021').removeAttribute('hidden');
        } else if('2nd' in app_url.args) {
            document.getElementById('misc-intro-2nd').classList.add('active');
            document.getElementById('misc-lyrics-intro-2nd').removeAttribute('hidden');
        } else if('2020' in app_url.args) {
            document.getElementById('misc-intro-2020').classList.add('active');
            document.getElementById('misc-lyrics-intro-2020').removeAttribute('hidden');
        } else if('1st' in app_url.args) {
            document.getElementById('misc-intro-1st').classList.add('active');
            document.getElementById('misc-lyrics-intro-1st').removeAttribute('hidden');
        } else {
            // Default.
            document.getElementById('misc-intro-raw').classList.add('active');
            document.getElementById('misc-lyrics-intro-raw').removeAttribute('hidden');
        }
        return;
    }
    if('about' in app_url.args) {
        document.getElementById('misc-about').classList.add('active');
        document.getElementById('misc-panel-about').removeAttribute('hidden');
        document.getElementById('misc-about-title').innerHTML = app_i18n.brand + ' ' + release_version.join('.');
        document.getElementById('misc-message-maintain').innerHTML = app_i18n.footer_maintain;
        document.getElementById('misc-message-warning').innerHTML = app_i18n.footer_warning;
        document.getElementById('misc-message-copyright').innerHTML = app_i18n.footer_copyright;
        document.getElementById('misc-about-1').innerHTML = app_i18n.footer_author;
        document.getElementById('misc-about-2').innerHTML = app_i18n.footer_data_correct;
        document.getElementById('misc-about-3').innerHTML = app_i18n.footer_resource;
        return;
    }
    //Default, greetings.
    const greeting_ids = ['misc-youtube-greeting', 'misc-youtube-ending', 'misc-bilibili-greeting', 'misc-bilibili-ending'];
    for(let i=0; i<greeting_ids.length; ++i) {
        document.getElementById(greeting_ids[i]).innerHTML = app_i18n.title_greetings[i];
    }
    document.getElementById('misc-greeting').classList.add('active');
    document.getElementById('misc-panel-greeting').removeAttribute('hidden');
}

function load_misc() {
    document.title = app_i18n.title_misc;
    header_set_item('misc');
    app_load_panel('misc.html', misc_init_ui);
}