const en_translate = {
    translate_name: 'English',
    brand: 'Hanamaru🍸Bar',
    day_of_the_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    day_of_the_week_short: ['Sun.', 'Mon.', 'Tue.', 'Wed,', 'Thu.', 'Fri.', 'Sat.'],
    contacts: ['Twitter', 'Youtube', 'Bilibili', 'Fanbox'],
    navbar: ['Stream', 'Calender', 'Single', 'Song List', 'Misc.'],
    navbar_song_list: ['Song List', 'Single Songs', 'Medley Songs', 'All Songs', 'Statistic'],
    navbar_statistic: ['Stream Limited', 'Medley Limited', 'Times Limited', 'Annual New Song'],
    navbar_misc: ['Stream Greetings', 'Harerun Button', 'Self-intro Song Lyrics', 'Omikuji', 'Site Info'],
    navbar_intro: ['Original', '1st Anni.', 'End of 2020', '2nd Anni.', 'End of 2021', '3rd Anni.'],
    song_record_table_title: ['Song Name', 'Last sung', 'Times', 'Times @ Youtube', 'Times @ Bilibili'],
    footer_title: ['Official Stores', 'Channels', 'Live Rooms'],
    footer_links: ['Booth', 'Twitter', 'Youtube', 'Bilibili', 'Pixiv FANBOX', 'TwitCasting', 'BiliBili Stream Room', 'Youtube Stream Room'],
    footer_maintain: 'Designed, built and maintained with all the love in the world by <a href="https://twitter.com/sakitojo" rel="noopener" target="_blank">Saki Tojo</a> with all Hanamaru family members.',
    footer_license: 'Code licensed <a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/blob/master/LICENSE" rel="license noopener" target="_blank">HARERU SOFTWARE LICENSE</a> (avilable at <a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/">Github</a>), docs <a href="https://creativecommons.org/licenses/by/3.0/" rel="license noopener" target="_blank">CC BY 3.0</a>.',
    footer_warning: "This is the unofficial Hanamaru Hareru information site, all the information please refer to the Hanamaru Hareru's formal information platforms.<br>This website does not guarantee the accuracy of the information, and all data may be modified at any time.",
    footer_author: 'Program, maintenance, data collection, and many others: ',
    footer_copyright: "This is an UNOFFICIAL site. All the information, images, audio and other data are all from Hanamaru Hareru's official accounts. Copyright of these data are belongs to the original authors. This website is only for learning, entertainment and communication, and it is forbidden to use it for AI training and commercial purposes by anyone other than Hanamaru Hareru official and the original copyright holder. If you have any questions, please send E-mail to <a href=\"mailto:872401892@qq.com\">872401892@qq.com</a>.",
    footer_data_correct: 'Data review: ',
    footer_resource: 'Resource used from: ',
    title_omikuji: 'Your fortune of the day is',
    title_omikuji_source: ['Resource from: ', 'Niziato', "Hanamaru Hareru's DongTai"],
    title_omikuji_hint: '※The result is a joke',
    title_omikuji_once_more: 'Once more',
    title_stream: 'All Harerun Streams',
    title_calender: 'Hanamaru Stream Calender',
    title_single: "Harerun's single songs",
    title_song_list: "Harerun's song list",
    title_song_info: function(n) { return `${n} - Detail Info`; },
    title_medley: function(n) { return `${n} (Medley)`; },
    title_last_live: 'Last sung: ',
    title_sing_total: 'Times total: ',
    title_sing_youtube: 'Times on Youtube: ',
    title_sing_bilibili: 'Times on Bilibili: ',
    title_setori_date: 'Live date',
    title_song_detail_info: "Detail Info",
    title_forecast_today: "Today's Stream",
    title_forecast: 'Stream Schedule',
    title_misc: 'Hanamaru mark is fine today! (?)',
    title_greetings: ['Youtube Stream Greetings', 'Youtube Stream Ending Greetings', 'Bilibili Stream Greetings', 'Bilibili Stream Ending Greetings'],
    title_time_select: 'Sang times: ',

    view_setori: 'View the song list',
    sort_ascend: '↑Ascend',
    sort_descend: '↓Descend',

    unlimited_songs: 'Unlimited songs',
    limited_title: ['Youtube Limited', 'Bilibili Limited'],

    jst: function(n) { return `(JST: ${n})`; },

    count_first_v: function(n) { return `${n} days since Harerun's debut.`; },
    count_first_y: function(n) { return `${n} days since Harerun's first live stream.`; },
    count_first_b: function(n) { return `${n} days since Harerun's first live stream on BiliBili.`; },

    search_stream: 'Search all streams',
    search_stream_count: function(n) { return `${n} results`; },
    search_single: 'Search all singles',
    search_single_count: function(n) { return `${n} results`; },
    search_song: 'Search all songs',
    search_song_count: function(n) { return `${n} results`; },

    stream_options: 'Option',
    stream_option_platform: 'Platform',
    stream_option_content: 'Content',
    stream_option_content_song: 'Singing Stream',
    stream_option_content_others: 'Others',

    birthday_today: 'Harerun, happy birthday!',
    birthday_time: function(d, h, m, s) {
        if(d > 0) {
            return `${d} d ${h} h ${m} min ${s} s`;
        } else if(h > 0) {
            return `${h} h ${m} min ${s} s`;
        } else if(m > 0) {
            return `${m} min ${s} s`;
        } else if(s > 0) {
            return `${s} s`;
        } else {
            return '';
        }
    },
    birthday_count_down: function(n) { return `${n} to Hareru's birthday`; },

    year_sang: 'Year of singing: ',

    //Urls.
    force_bilibili: false,
}