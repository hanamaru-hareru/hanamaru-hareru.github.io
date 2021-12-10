
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
    const nav_ids = ['misc-greeting', 'misc-button'];
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
                let button_html = ['<li class="voice-item"><div class="voice-button">'];
                button_html.push('<span>'+misc_get_ui_text(button_info.name)+'</span>');
                button_html.push('</div></li>');
                button_list_html.push(button_html.join('\n'));
            }
            button_list_html.push('</ul></div>');
        }
        document.getElementById('misc-panel-button').innerHTML = button_list_html.join('\n');
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