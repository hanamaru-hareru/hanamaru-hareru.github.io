const zh_cn_translate = {
    translate_name: '中文',
    brand: '花丸🍸酒馆',
    day_of_the_week: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    day_of_the_week_short: ['日', '一', '二', '三', '四', '五', '六'],
    contacts: ['推特', '油管', 'B站', 'FANBOX'],
    navbar: ['直播', '日历', '单曲', '歌单', '杂物'],
    navbar_song_list: ['歌单', '单曲一览', '串烧一览', '全部曲目', '统计'],
    navbar_statistic: ['直播限定单曲', '串烧限定曲', '次数限定曲'],
    navbar_misc: ['直播问候', '花丸按钮', '自我介绍歌歌词', '御神签', '网站信息'],
    navbar_intro: ['原版', '1周年', '2020年末', '2周年', '2021年末', '3周年'],
    song_record_table_title: ['曲名', '最近一次演唱', '演唱次数', '油管演唱次数', 'B站演唱次数'],
    footer_title: ['官方商店', '频道连接', '直播间'],
    footer_links: ['Booth', 'Twitter', 'Youtube', 'Bilibili', 'Pixiv FANBOX', 'TwitCasting', 'BiliBili直播间', 'Youtube直播间'],
    footer_maintain: '本站由 <a href="https://twitter.com/sakitojo" rel="noopener" target="_blank">Saki Tojo</a> 以及花丸家的大家设计、构建和维护。',
    footer_license: '源代码以<a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/blob/master/LICENSE" rel="license noopener" target="_blank">HARERU软件协议</a>授权（网站源代码可在<a href="https://github.com/hanamaru-hareru/hanamaru-hareru.github.io/">这里</a>获取），所有的数据以<a href="https://creativecommons.org/licenses/by/3.0/" rel="license noopener" target="_blank">CC 3.0</a>的形式分发。',
    footer_warning: '本网站是花丸晴琉的非官方信息站，所有的信息请以花丸晴琉的官方信息公布平台为准。<br>本网站不保证信息的准确性，所有数据可能会随时进行修改。',
    footer_copyright: '本网站为非官方制作。网站中的信息、图片、音频及其他数据均来自花丸晴琉官方账号。这些数据的著作权归原作者所有。本网站仅供学习娱乐交流使用，并且禁止除花丸晴琉官方与原版权所有者以外的任何人用于AI训练以及商业用途。如果您有任何疑问，请发送邮件到<a href="mailto:haolei.ye@anu.edu.au">haolei.ye@anu.edu.au</a>咨询。',
    footer_author: '程序、维护、数据收集、杂役：',
    footer_data_correct: '数据检查：',
    footer_resource: '素材提供：',
    title_omikuji: '今天的运势是',
    title_omikuji_source: ['素材来源：', 'にじあと', "花丸晴琉的动态"],
    title_omikuji_hint: '※抽签结果仅供娱乐',
    title_omikuji_once_more: '再来一次',
    title_stream: '花丸的全部直播',
    title_calender: '花丸直播日历',
    title_single: '花丸的单曲',
    title_song_list: '花丸的演唱会歌单',
    title_song_info: function(n) { return `${n} - 详细信息`; },
    title_medley: function(n) { return `${n} （串烧）`; },
    title_last_live: '最后一次演唱：',
    title_sing_total: '直播中演唱次数：',
    title_sing_youtube: '在油管上演唱次数：',
    title_sing_bilibili: '在B站上演唱次数：',
    title_setori_date: '直播日期',
    title_song_detail_info: '歌曲信息',
    title_forecast_today: '花丸今天的直播预定',
    title_forecast: '花丸直播计划表',
    title_misc: '花丸标记今天很好！（?)',
    title_greetings: ['油管直播问候', '油管直播结束问候', 'B站直播问候', 'B站直播结束问候'],
    title_about: ['信息收集'],
    title_time_select: '演唱次数：',

    view_setori: '查看当日歌单',
    sort_ascend: '↑升序',
    sort_descend: '↓降序',

    unlimited_songs: '非限定曲',
    limited_title: ['油管限定曲', 'B站限定曲'],

    jst: function(n) { return `（日本标准时间：${n}）`; },

    count_first_v: function(n) { return `距离花丸出道已经 ${n} 天`; },
    count_first_y: function(n) { return `距离花丸第一次直播已经 ${n} 天`; },
    count_first_b: function(n) { return `距离花丸第一次B站直播已经 ${n} 天`; },

    search_stream: '搜索全部直播',
    search_stream_count: function(n) { return `${n} 个结果`; },
    search_single: '搜索单曲',
    search_single_count: function(n) { return `${n} 个结果`; },
    search_song: '搜索曲目',
    search_song_count: function(n) { return `${n} 个结果`; },

    stream_options: '选项',
    stream_option_platform: '直播平台',
    stream_option_content: '内容',
    stream_option_content_song: '歌回',
    stream_option_content_others: '其他',

    birthday_today: '晴琉琉生日快乐',
    birthday_time: function(d, h, m, s) {
        if(d > 0) {
            return `${d} 天 ${h} 时 ${m} 分 ${s} 秒`;
        } else if(h > 0) {
            return `${h} 时 ${m} 分 ${s} 秒`;
        } else if(m > 0) {
            return `${m} 分 ${s} 秒`;
        } else if(s > 0) {
            return `${s} 秒`;
        } else {
            return jp_translate['birthday_today'];
        }
    },
    birthday_count_down: function(n) { return `距离花丸的生日还有 ${n}`; },

    //Urls.
    force_bilibili: true,
}