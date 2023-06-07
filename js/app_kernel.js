const release_version = [4, 1, 230605];
const core_version = [4, 1, 0];

/* Basic functions */
function time_str_minsec(min_or_sec) {
    if (min_or_sec < 10) {
        return '0' + min_or_sec.toString();
    }
    return min_or_sec.toString();
}

const hiragana_to_katakana = [
    //Combined
    ["きゃ", "キャ"], ["きゅ", "キュ"], ["きょ", "キョ"],
    ["ぎゃ", "ギャ"], ["ぎゅ", "ギュ"], ["ぎょ", "ギョ"],
    ["しゃ", "シャ"], ["しゅ", "シュ"], ["しょ", "ショ"],
    ["じゃ", "ジャ"], ["じゅ", "ジュ"], ["じょ", "ジョ"],
    ["ちゃ", "チャ"], ["ちゅ", "チュ"], ["ちょ", "チョ"],
    ["にゃ", "ニャ"], ["にゅ", "ニュ"], ["にょ", "ニョ"],
    ["ひゃ", "ヒャ"], ["ひゅ", "ヒュ"], ["ひょ", "ヒョ"],
    ["びゃ", "ビャ"], ["びゅ", "ビュ"], ["びょ", "ビョ"],
    ["ぴゃ", "ピャ"], ["ぴゅ", "ピュ"], ["ぴょ", "ピョ"],
    ["みゃ", "ミャ"], ["みゅ", "ミュ"], ["みょ", "ミョ"],
    ["りゃ", "リャ"], ["りゅ", "リュ"], ["りょ", "リョ"],
    //Single.
    ["あ", "ア"], ["い", "イ"], ["う", "ウ"], ["え", "エ"], ["お", "オ"],
    ["か", "カ"], ["き", "キ"], ["く", "ク"], ["け", "ケ"], ["こ", "コ"],
    ["さ", "サ"], ["し", "シ"], ["す", "ス"], ["せ", "セ"], ["そ", "ソ"],
    ["た", "タ"], ["ち", "チ"], ["つ", "ツ"], ["て", "テ"], ["と", "ト"],
    ["な", "ナ"], ["に", "ニ"], ["ぬ", "ヌ"], ["ね", "ネ"], ["の", "ノ"],
    ["は", "ハ"], ["ひ", "ヒ"], ["ふ", "フ"], ["へ", "ヘ"], ["ほ", "ホ"],
    ["ま", "マ"], ["み", "ミ"], ["む", "ム"], ["め", "メ"], ["も", "モ"],
    ["や", "ヤ"], ["ゆ", "ユ"], ["よ", "ヨ"], ["ら", "ラ"], ["り", "リ"],
    ["る", "ル"], ["れ", "レ"], ["ろ", "ロ"], ["わ", "ワ"], ["を", "ヲ"],
    ["ん", "ン"], ["が", "ガ"], ["ぎ", "ギ"], ["ぐ", "グ"], ["げ", "ゲ"],
    ["ご", "ゴ"], ["ざ", "ザ"], ["じ", "ジ"], ["ず", "ズ"], ["ぜ", "ゼ"],
    ["ぞ", "ゾ"], ["だ", "ダ"], ["ぢ", "ヂ"], ["づ", "ヅ"], ["で", "デ"],
    ["ど", "ド"], ["ば", "バ"], ["び", "ビ"], ["ぶ", "ブ"], ["べ", "ベ"],
    ["ぼ", "ボ"], ["ぱ", "パ"], ["ぴ", "ピ"], ["ぷ", "プ"], ["ぺ", "ペ"],
    ["ぽ", "ポ"],
]

function convert_hiragana_to_katakana(raw_text) {
    if(raw_text === undefined) {
        return '';
    }
    //Loop for all the rules.
    for(let i=0; i<hiragana_to_katakana.length; ++i) {
        const map_rule = hiragana_to_katakana[i];
        //Apply replacement.
        let re = new RegExp(map_rule[0], 'g');
        raw_text = raw_text.replace(re, map_rule[1]);
    }
    return raw_text;
}

function app_hyperlink(url) {
    if(url.length === 0) {
        return '<a>'
    }
    return '<a href="' + url + '" target="_blank" rel="noreferrer noopener">';
}

function app_open_url(url) {
    window.open(url, '_blank');
}

function app_archive_url(y_url, b_url, expected) {
    //Check empty.
    if(y_url.length === 0) {
        return b_url;
    }
    if(b_url.length === 0) {
        return y_url;
    }
    //Both are available.
    if(app_i18n.force_bilibili || expected === 'b') {
        //When force or expect to use bilibili, then use b url.
        return b_url;
    }
    //Otherwise, youtube url.
    return y_url;
}

/* i18n supports */
let app_i18n = null;

const i18n_map = {
    'zh_cn': zh_cn_translate,
    'jp': jp_translate,
    'en': en_translate,
}

function browser_language() {
    const browser_flag = navigator.language;
    if(browser_flag.startsWith('en-')) {
        return 'en';
    }
    if(browser_flag.startsWith('zh-')) {
        return 'zh_cn';
    }
    return 'jp';
}

function app_refresh_language(combo_name) {
    app_set_conf('language', document.getElementById(combo_name).value);
    //Refresh the current page.
    app_set_conf(splash_disable_key, true);
    app_reload();

}

function app_language_combo(combo_name, language_key) {
    // Update the options.
    const language_keys = Object.keys(i18n_map);
    let language_items = [];
    for(let i=0; i<language_keys.length; ++i) {
        // Render the item.
        language_items.push('<option value="'+language_keys[i]+'">'+i18n_map[language_keys[i]].translate_name+'</option>')
    }
    let nav_lan = document.getElementById(combo_name);
    nav_lan.innerHTML = language_items.join('\n');
    nav_lan.value = language_key;
}

function apply_language(language_key) {
    // Set the i18n.
    app_i18n = i18n_map[language_key];
    // Update the options.
    app_language_combo('nav-language', language_key);
}

/* JS cache data fetcher */
let app_fetch_cache = {};
let app_fetch_cache_enabled = false;
function app_fetch(url, finished, user) {
    if(url in app_fetch_cache) {
        // Call the finished function.
        finished(app_fetch_cache[url]);
        return;
    }
    //Load the single page to content.
    fetch(url, {
        method: 'GET',
        cache: 'no-cache'
    }).then(function (res) {
        res.text().then(function (response) {
            if(app_fetch_cache_enabled) {
                app_fetch_cache[url] = response;
            }
            if(user) {
                finished(response, user);
            } else {
                finished(response);
            }
        });
    });
}

function app_fetch_image(url, finished, user) {
    //Load the image to content.
    fetch(url, {
        method: 'GET',
        cahce: 'no-cache'
    })
        .then(response => response.blob())
        .then(imageBlob => {
            const imageObjectUrl = URL.createObjectURL(imageBlob);
            if(user) {
                finished(imageObjectUrl, user);
            } else {
                finished(imageObjectUrl);
            }
        });

}

/* Reload */
function app_reload() {
    window.location.reload();
}

//System UI render.
const navbar_ids = ['stream', 'calender', 'single', 'songs', 'misc'];
function render_header() {
    //Set brand name
    let nav_brand = document.getElementById('nav-brand');
    nav_brand.innerHTML = app_i18n.brand;
    nav_brand.onclick = app_reload;
    // Render the header items.
    const navbar_names = app_i18n.navbar;
    for(let i=0; i<navbar_names.length; ++i) {
        // Update the button label.
        let nav_item = document.getElementById('nav-' + navbar_ids[i]);
        nav_item.innerHTML = navbar_names[i];
    }
    //Detect whether the website is running on iOS.
    if(is_on_ios() && window.navigator.standalone) {
        document.getElementById('app-header').classList.add('ios-padding');
    }
}

function header_set_item(item_id) {
    // Clear all the items.
    for(let i=0; i<navbar_ids.length; ++i) {
        document.getElementById('item-'+navbar_ids[i]).classList.remove('active');
    }
    // Set the current item.
    document.getElementById('item-'+item_id).classList.add('active');
}

//System UI footer.
function render_footer() {
    const footer_title_ids = ['f-stores', 'f-channels', 'f-lives-info'];
    for(let i=0; i<footer_title_ids.length; ++i) {
        document.getElementById(footer_title_ids[i]).innerHTML = app_i18n.footer_title[i];
    }
    const footer_link_ids = ['f-booth', 'f-twitter', 'f-youtube', 'f-bilibili', 'f-fanbox', 'f-twitcasting', 'f-bilibili-live', 'f-youtube-live'];
    for(let i=0; i<footer_link_ids.length; ++i) {
        document.getElementById(footer_link_ids[i]).innerHTML = app_i18n.footer_links[i];
    }
    document.getElementById('f-license').innerHTML = app_i18n.footer_license;
}

//System UI birthday check.
let hareru_birthday_text = document.getElementById('hareru-birthday-text');
const minute_time_as_ms = 60 * 1000;
const hour_time_as_ms = 60 * 60 * 1000;
const day_time_as_ms = 24 * hour_time_as_ms;

function render_birthday_info() {
    //Show the count down text.
    document.getElementById('hareru-birthday-banner').removeAttribute('hidden');
    //Show the greeting message.
    hareru_birthday_text.innerHTML = app_i18n.birthday_today;
    //Show the image as well.
    document.getElementById('hareru-birthday-image').removeAttribute('hidden');
    //Configure the live stream url.
    document.getElementById('hareru-birthday-live').setAttribute('href',
        app_archive_url('https://www.youtube.com/channel/UCyIcOCH-VWaRKH9IkR8hz7Q/live',
            'https://live.bilibili.com/21547895', app_i18n.force_bilibili ? 'b' : 'y'));
}

function render_birthday_countdown() {
    //Calculate the time rest.
    const local_date = new Date();
    const local_time = local_date.getTime();
    let time_remain = new Date(local_date.getFullYear()+'-03-20T00:00:00+0900').getTime() - local_time;
    // Check time remain.
    if(time_remain <= 500) {
        render_birthday_info();
        return;
    }
    //Calculate the part remains.
    const day_remain = Math.floor(time_remain / day_time_as_ms);
    time_remain -= day_remain * day_time_as_ms;
    const hour_remain = Math.floor(time_remain / hour_time_as_ms);
    time_remain -= hour_remain * hour_time_as_ms;
    const minute_remain = Math.floor(time_remain / minute_time_as_ms);
    time_remain -= minute_remain * minute_time_as_ms;
    const second_remain = Math.floor(time_remain / 1000);
    hareru_birthday_text.innerHTML = app_i18n.birthday_count_down(app_i18n.birthday_time(day_remain, hour_remain, minute_remain, second_remain));
    setTimeout(render_birthday_countdown, 1000);
}

function render_birthday_banner() {
    //Check current time matches or not.
    const local_date = new Date();
    const local_time = local_date.getTime();
    const years_birthday = new Date(local_date.getFullYear()+'-03-20T00:00:00+0900').getTime();
    const years_birthday_end = years_birthday + day_time_as_ms;
    let birthday_banner = document.getElementById('hareru-birthday-banner');
    if(years_birthday < local_time && local_time < years_birthday_end) {
        // Show the happy birthday banner.
        render_birthday_info();
        return;
    }
    const years_birthday_countdown_start = years_birthday - day_time_as_ms * 15;
    if(years_birthday_countdown_start < local_time && local_date < years_birthday) {
        //Show the countdown text.
        birthday_banner.removeAttribute('hidden');
        //Update the time rest.
        render_birthday_countdown();
    }
}

function render_contact_links(prefix) {
    const button_names = app_i18n.contacts,
        button_ids = [prefix+'harerun-twitter', prefix+'harerun-youtube', prefix+'harerun-bilibili', prefix+'harerun-fanbox'],
        button_urls = [
            'https://twitter.com/hanamaruhareru',
            'https://www.youtube.com/channel/UCyIcOCH-VWaRKH9IkR8hz7Q',
            'https://space.bilibili.com/441381282',
            'https://hanamaruhareru.fanbox.cc/'
        ];
    for(let i=0; i<button_ids.length; ++i) {
        // Update the button label.
        document.getElementById(button_ids[i]).innerHTML = button_names[i];
        // Update the onclick label.
        document.getElementById(button_ids[i]).onclick = function () { app_open_url(button_urls[i]); }
    }
}

//Application panel loader.
function app_load_panel(panel_url, callback) {
    //Fetch the panel URL.
    app_fetch(panel_url, function(page_data) {
        document.getElementById('app-panel').innerHTML = page_data;
        //Call the post-render callback.
        if(callback !== null) {
            callback();
        }
        //Scroll the panel back to the top.
        document.getElementById('scene-main').scrollTop = 0;
        //Once the panel load is complete, need to hide the splash screen.
        splash_hide();
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
        '.-               -.                                        Release '+release_version.join('.')+'. Powered by hnmr-core '+core_version.join('.')+'.\n' +
        ' ::::.         ::                                          はれちゃんがずっと幸せでいられますように。\n' +
        '      .:.:...::\n', 'color: #db9854');
    //Start the loading chain.
    database_load();
}
