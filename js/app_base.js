const release_version = [3, 0, 211218];
const core_version = [3, 0, 0];

const i18n_map = {
    'zh_cn': zh_cn_translate,
    'jp': jp_translate,
    'en': en_translate,
}

let app_url = {};
let app_i18n = null;
let app_fetch_cache = {};
let app_fetch_cache_enabled = false;

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

const navbar_ids = ['nav-stream', 'nav-calender', 'nav-single', 'nav-song-list', 'nav-misc'];

function app_parse_url() {
    function split_first(raw, key) {
        const pos = raw.indexOf(key);
        if(pos===-1) {
            return [raw, ''];
        }
        return [raw.substring(0, pos), raw.substring(pos+1)]
    }

    //Extract the parameter from the URL.
    const root_exp = new RegExp('.*(?=\/)'), page_url=window.location.href;
    const root = root_exp.exec(page_url).toString() + '/';
    let page_params = split_first(page_url.substring(root.length), '#');
    page_params = page_params[1];
    //Parse and construct the keys.
    let keys = {};
    for(let i of page_params.split('&')) {
        const param_info = split_first(i, '=');
        keys[param_info[0]] = param_info[1];
    }
    app_url.args = keys;
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

function apply_language(language_key) {
    // Set the i18n.
    app_i18n = i18n_map[language_key];
    // Update nav-bar name.
    document.getElementById('nav-language').innerHTML = app_i18n.translate_name;
    // Create the language menu content.
    const language_keys = Object.keys(i18n_map);
    let language_items = [];
    for(let i=0; i<language_keys.length; ++i) {
        if(language_keys[i] === language_key) {
            continue;
        }
        // Render the item.
        language_items.push('<li><a class="dropdown-item" href="#" id="nav-language-'+language_keys[i]+'">'+i18n_map[language_keys[i]].translate_name+'</a></li>')
    }
    document.getElementById('nav-language-menu').innerHTML = language_items.join('\n');
    // Set the function.
    for(let i=0; i<language_keys.length; ++i) {
        if(language_keys[i] === language_key) {
            continue;
        }
        // Render the item.
        document.getElementById('nav-language-'+language_keys[i]).onclick = function() {
            app_set_conf('language', language_keys[i]);
            //Refresh the current page.
            app_set_conf(splash_disable_key, true);
            window.location.reload();
        }
    }
}

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

function app_load_panel(panel_url, callback) {
    //Fetch the panel URL.
    app_fetch(panel_url, function(page_data) {
        document.getElementById('app-panel').innerHTML = page_data;
        //Call the post-render callback.
        if(callback !== null) {
            callback();
        }
    });
}

function app_open_url(url) {
    window.open(url, '_blank');
}

function app_hyperlink(url) {
    if(url.length === 0) {
        return '<a>'
    }
    return '<a href="' + url + '" target="_blank" rel="noreferrer noopener">';
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

function app_collapse_navbar() {
    let collapse_button = document.getElementById('nav-collapse');
    if(collapse_button.getAttribute('aria-expanded') === 'true') {
        let html_collapse = document.getElementById('navbarCollapse');
        let bs_collapse = new bootstrap.Collapse(html_collapse, {
            hide: true
        });
    }
}

function app_reload() {
    window.location.reload();
}

function render_header() {
    //Set brand name
    let nav_brand = document.getElementById('nav-brand');
    nav_brand.innerHTML = app_i18n.brand;
    nav_brand.onclick = app_reload;
    // Render the header items.
    const navbar_names = app_i18n.navbar;
    for(let i=0; i<navbar_names.length; ++i) {
        // Update the button label.
        let nav_item = document.getElementById(navbar_ids[i]);
        nav_item.innerHTML = navbar_names[i];
        nav_item.onclick = app_collapse_navbar;
    }
}

function render_footer() {
    const footer_title_ids = ['f-stores', 'f-channels', 'f-lives-info'];
    for(let i=0; i<footer_title_ids.length; ++i) {
        document.getElementById(footer_title_ids[i]).innerHTML = app_i18n.footer_title[i];
    }
    const footer_link_ids = ['f-booth', 'f-twitter', 'f-youtube', 'f-bilibili', 'f-fanbox', 'f-twitcasting', 'f-bilibili-schedule', 'f-bilibili-live'];
    for(let i=0; i<footer_link_ids.length; ++i) {
        document.getElementById(footer_link_ids[i]).innerHTML = app_i18n.footer_links[i];
    }
    document.getElementById('f-license').innerHTML = app_i18n.footer_license;
}

function time_str_minsec(min_or_sec) {
    if (min_or_sec < 10) {
        return '0' + min_or_sec.toString();
    }
    return min_or_sec.toString();
}

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

function render_contact_links() {
    const button_names = app_i18n.contacts,
        button_ids = ['harerun-twitter', 'harerun-youtube', 'harerun-bilibili', 'harerun-fanbox'],
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

function header_set_item(item_id) {
    // Clear all the items.
    for(let i=0; i<navbar_ids.length; ++i) {
        document.getElementById('item-'+navbar_ids[i]).classList.remove('active');
    }
    // Set the current item.
    document.getElementById('item-'+item_id).classList.add('active');
}