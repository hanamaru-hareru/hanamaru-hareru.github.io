let forecast = {records: []};

function forecast_is_today(today, forecast_day, next_day) {
    //Check whether the date is matching today's time.
    if(today.getFullYear() === forecast_day.getFullYear() && today.getMonth() === forecast_day.getMonth() && today.getDate() === forecast_day.getDate())
    {
        return true;
    }
    //Or, the date is next day, but the time is less than 06:00 A.M.
    if(next_day.getFullYear() === forecast_day.getFullYear() && next_day.getMonth() === forecast_day.getMonth() && next_day.getDate() === forecast_day.getDate())
    {
        //Check the hour is less than 6.
        return forecast_day.getHours() < 6;
    }
    return false;
}

function forecast_is_valid(today, forecast_day) {
    if(today.getFullYear() < forecast_day.getFullYear()) {
        //Ignore the date.
        return true;
    }
    if(today.getFullYear() !== forecast_day.getFullYear()) {
        //Ignore the date.
        return false;
    }
    if(today.getMonth() < forecast_day.getMonth()) {
        return true;
    }
    return today.getMonth() === forecast_day.getMonth() && (today.getDate() <= forecast_day.getDate());
}

function forcast_time_to_str(stime) {
    return stime.getFullYear() + '-'+time_str_minsec(stime.getMonth()+1)+'-'+time_str_minsec(stime.getDate())+'  '+
        '('+app_i18n.day_of_the_week[stime.getDay()]+') '+ stime.getHours()+':'+time_str_minsec(stime.getMinutes())
}

function forecast_compare(a, b) {
    return a.timestamp - b.timestamp;
}

function forecast_render() {
    // Check the forecast result.
    if(forecast.records.length === 0) {
        return;
    }
    let display_list = [], today_list = [];
    let local_date = new Date();
    local_date = new Date(local_date.getFullYear()+"-"+(local_date.getMonth()+1)+"-"+local_date.getDate())
    let next_local_date = new Date(local_date.getTime() + 86400000);
    for(let i=0; i<forecast.records.length; ++i) {
        forecast.records[i].timestamp = forecast.records[i].jst_time.getTime();
    }
    forecast.records.sort(forecast_compare);
    //Convert the forecast date to date.
    for(let i=0; i<forecast.records.length; ++i) {
        const forecast_item = forecast.records[i];
        //The time is JST.
        if(forecast_is_today(local_date, forecast_item.local_time, next_local_date)) {
            today_list.push(forecast_item);
        } else {
            display_list.push(forecast_item);
        }
    }
    let forecast_html = ['<div class="alert alert-info" role="alert">'];
    function render_forecast(title, display_list) {
        forecast_html.push('<div class="forecast-title">'+title+'</div><div>');
        for(let i=0; i<display_list.length; ++i) {
            const local_time = display_list[i].local_time;
            const jst_time = display_list[i].jst_time;
            //Construct the time text.
            let stream_time = forcast_time_to_str(local_time) + ' ' + display_list[i].title;
            if(local_time.getTime() !== jst_time.getTime()) {
                // Display JST.
                stream_time += ' ' + app_i18n.jst(forcast_time_to_str(jst_time));
            }
            //Construct the JST time text.
            let icon_html = '', y_url = '', b_url = '';
            for (let j = 0; j < display_list[i].platform.length; j++) {
                const platform_c = display_list[i].platform.charAt(j);
                let sicon = '';
                if(platform_c === 'y') {
                    sicon = 'icon-youtube'
                    //Youtube live, the URL can use this if it is not provided.
                    y_url = "https://www.youtube.com/channel/UCyIcOCH-VWaRKH9IkR8hz7Q/live";
                } else if(platform_c === 'b') {
                    sicon = 'icon-bilibili';
                    //Bilibili live, the URL is fixed.
                    b_url = "https://live.bilibili.com/21547895";
                } else if (platform_c === 'f') {
                    sicon = 'icon-fanbox';
                }
                if(sicon.length > 0) {
                    icon_html += '<div class="text-icon ' + sicon + '"></div>';
                }
            }
            if(display_list[i].url.length === 0) {
                display_list[i].url = app_archive_url(y_url, b_url, app_i18n.force_bilibili ? 'b' : 'y');
            }
            let stream_info = ['<div class="time-row">',
                app_hyperlink(display_list[i].url),
                icon_html,
                stream_time,
                '</a>',
                '</div>'];
            forecast_html.push(stream_info.join('\n'));
        }
        forecast_html.push('</div>');
    }

    if(today_list.length > 0) {
        render_forecast(app_i18n.title_forecast_today, today_list);
    }
    if(display_list.length > 0) {
        render_forecast(app_i18n.title_forecast, display_list);
    }
    forecast_html.push('</div>');
    document.getElementById('forecast').innerHTML = forecast_html.join('\n');
}

function forecast_load_data(forecast_data) {
    if(forecast_data.length === 0) {
        return [];
    }
    function parse_time(time_str) {
        let colon_pos = time_str.indexOf(':');
        if(colon_pos === -1) {
            return [];
        }
        //Parse the hour and minute.
        return [parseInt(time_str.substr(0, colon_pos)), parseInt(time_str.substr(colon_pos+1))];
    }

    const local_date = new Date();
    let valid_forecast = [];
    for(let i=0; i<forecast_data.length; ++i) {
        forecast_data[i].date = new Date(forecast_data[i].date);
        forecast_data[i].time = parse_time(forecast_data[i].time);
        //Calculate the local time stamp.
        const s_date = forecast_data[i].date;
        const s_time = forecast_data[i].time;

        function date_month_day_str(value) {
            return (value < 10) ? '0' + value.toString() : value.toString();
        }

        const s_date_time = s_date.getFullYear() + '-' + date_month_day_str(s_date.getMonth()+1) + '-' + date_month_day_str(s_date.getDate()) + 'T' + s_time[0] + ':' + time_str_minsec(s_time[1]) + ':00';
        forecast_data[i].local_time = new Date(s_date_time + '+0900');
        forecast_data[i].jst_time = new Date(s_date_time);
        if(!forecast_is_valid(local_date, forecast_data[i].local_time)) {
            continue;
        }
        //The time is JST.
        if(forecast_data[i].url.length === 0) {
            //Check the platform.
            if(forecast_data[i].platform === "f") {
                //FANBOX live, the URL uses FANBOX page instead.
                forecast_data[i].url = "https://www.fanbox.cc/@hanamaruhareru";
            }
        }
        valid_forecast.push(forecast_data[i]);
    }
    forecast.records = valid_forecast;
}
