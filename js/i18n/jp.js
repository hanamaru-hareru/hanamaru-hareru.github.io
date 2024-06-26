const jp_translate = {
    translate_name: '日本語',
    brand: '花丸🍸バー',
    day_of_the_week: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    day_of_the_week_short: ['日', '月', '火', '水', '木', '金', '土'],
    contacts: ['ツイッター', 'Youtube', 'ビリビリ', 'FANBOX'],
    navbar: ['配信', 'カレンダ', 'シングル', 'セトリ', '雑物'],
    navbar_song_list: ['セトリ', '曲', 'メドレ曲', '全ての曲', '統計'],
    navbar_statistic: ['配信限定曲', 'メドレ限定曲', '回数限定曲', '毎年の新曲'],
    navbar_misc: ['配信あいさつ', 'はれるんボタン', '自己紹介の歌歌詞', 'おみくじ', 'サイト情報'],
    navbar_intro: ['オリジナル', '一周年', '2020年末', '二周年', '2021年末', '三周年'],
    song_record_table_title: ['曲名', '最後に歌った日', '全回数', 'Youtubeでの回数', 'Bilibiliでの回数'],
    footer_title: ['公式ストア', 'はれるんチャネル', '配信ルーム'],
    footer_links: ['Booth', 'Twitter', 'Youtube', 'Bilibili', 'Pixiv FANBOX', 'TwitCasting', 'BiliBili配信ルーム', 'Youtube配信ルーム'],
    footer_maintain: 'はれちゃんがずっと幸せでいられますように。<br>このサイトは <a href="https://twitter.com/sakitojo" rel="noopener" target="_blank">Saki Tojo</a> と花丸家のみんなが設計、構築、メンテナンスしています。',
    footer_warning: 'このサイトは花丸はれるの非公式情報サイトです、全ての情報は花丸はれるさんの公式情報プラットフォームをご覧ください。<br>このサイトは情報データの正確性を保証するものではなく、すべてのデータはいつでも変更される可能性があります。',
    footer_license: 'コードライセンスは<a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/blob/master/LICENSE" rel="license noopener" target="_blank">HARERUソフトライセンス</a>（コード本体は<a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/">Github</a>であります）、データライセンスは <a href="https://creativecommons.org/licenses/by/3.0/" rel="license noopener" target="_blank">CC BY 3.0</a>。',
    footer_author: 'プログラム、メンテナンス、データ取集、雑役担当：',
    footer_copyright: "これは花丸はれるの非公式サイトです。すべての情報、画像、音声、その他のデータは花丸はれるさんの公式アカウントからのものです。 これらの著作権は元の作者に帰属します。このサイトは学習、娯楽、交流を目的としており、花丸はれる公式と元の著作権者以外の者がAIトレーニングと商業目的で使用することは禁止です。詳細については、<a href=\"mailto:872401892@qq.com\">872401892@qq.com</a>にメールを送信してください。",
    footer_data_correct: 'データ審査：',
    footer_resource: '素材提供：',
    title_omikuji: '今日の運勢は',
    title_omikuji_source: ['素材提供：', 'にじあと様', "花丸はれる様の動態"],
    title_omikuji_hint: '※結果はジョークです',
    title_omikuji_once_more: 'もう一回',
    title_stream: 'はれるん全ての配信',
    title_calender: 'はれるん配信カレンダ',
    title_single: 'はれるんのシングル',
    title_song_list: 'はれちゃんのライブセトリ',
    title_song_info: function(n) { return `${n} - 詳細情報`; },
    title_medley: function(n) { return `${n} （メドレ）`; },
    title_last_live: '最後に歌った日：',
    title_sing_total: '全回数：',
    title_sing_youtube: 'Youtubeでの回数：',
    title_sing_bilibili: 'Bilibiliでの回数：',
    title_setori_date: '配信日',
    title_song_detail_info: '歌情報',
    title_forecast_today: '今日のはれるん配信予告',
    title_forecast: '花丸スケジュール',
    title_misc: '今日も元気に花丸印！',
    title_greetings: ['Youtube配信あいさつ', 'Youtube配信終了あいさつ', 'BiliBili配信あいさつ', 'BiliBili配信終了あいさつ'],
    title_time_select: '歌う回数：',

    view_setori: 'セトリを見る',
    sort_ascend: '↑昇順',
    sort_descend: '↓降順',

    unlimited_songs: '限定されていない曲',
    limited_title: ['Youtube 限定曲', 'BiliBili 限定曲'],

    jst: function(n) { return `（日本標準時：${n}）`; },

    count_first_v: function(n) { return `はれるんデビューからは ${n} 日`; },
    count_first_y: function(n) { return `最初の配信からは ${n} 日`; },
    count_first_b: function(n) { return `BiliBiliでの最初の配信からは ${n} 日`; },

    search_stream: '全ての配信を検索',
    search_stream_count: function(n) { return `${n} 件`; },
    search_single: '全てのシングルを検索',
    search_single_count: function(n) { return `${n} 件`; },
    search_song: '曲を検索',
    search_song_count: function(n) { return `${n} 件`; },

    stream_options: 'オプション',
    stream_option_platform: '配信ルーム',
    stream_option_content: '内容',
    stream_option_content_song: '歌回',
    stream_option_content_others: 'その他',

    birthday_today: 'はれるん！お誕生日おめでとう！',
    birthday_time: function(d, h, m, s) {
        if(d > 0) {
            return `${d} 日 ${h} 時 ${m} 分 ${s} 秒`;
        } else if(h > 0) {
            return `${h} 時 ${m} 分 ${s} 秒`;
        } else if(m > 0) {
            return `${m} 分 ${s} 秒`;
        } else if(s > 0) {
            return `${s} 秒`;
        } else {
            return '';
        }
    },
    birthday_count_down: function(n) { return `はれるんの誕生日まであと ${n}`; },

    year_sang: '歌った年：',

    //Urls.
    force_bilibili: false,
}