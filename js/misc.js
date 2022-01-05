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

function misc_init_ui() {
    // Render the headers.
    const nav_ids = ['misc-greeting', 'misc-button', 'misc-omikuji', 'misc-about'];
    for(let i=0; i<nav_ids.length; ++i) {
        document.getElementById(nav_ids[i]+'-label').innerHTML = app_i18n.navbar_misc[i];
    }
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
        document.getElementById('omikuji-title').innerHTML = app_i18n.title_omikuji;
        for(let i=0; i<app_i18n.title_omikuji_source.length; ++i) {
            document.getElementById('omikuji-source-label-'+i).innerHTML = app_i18n.title_omikuji_source[i];
        }
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
        let omikuji_id = (omikuji_timestamp ^ 870806) % 26 + 1;
        document.getElementById('omikuji-image').setAttribute('src', '/asserts/omikuji/'+omikuji_id+'.png')
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
    header_set_item('nav-misc');
    app_load_panel('misc.html', function() {
        //Initial the UI.
        misc_init_ui();
        // Hide the splash screen.
        splash_hide();
    });
}