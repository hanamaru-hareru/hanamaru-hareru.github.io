function misc_init_ui() {
    // Render the headers.
    const nav_ids = ['misc-greeting'];
    for(let i=0; i<nav_ids.length; ++i) {
        document.getElementById(nav_ids[i]+'-label').innerHTML = app_i18n.navbar_misc[i];
    }
    //Based on arguments, show the panel.
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