let calender = {years: []};

const big_month = new Set([1, 3, 5, 7, 8, 10, 12]), small_month = new Set([4, 6, 9, 11]);
const calender_view_ids = ['calender-day-view', 'vertical-calender'];

function calender_month_days(year, month) {
    if(big_month.has(month)) {
        return 31;
    }
    if(small_month.has(month)) {
        return 30;
    }
    if(month === 2) {
        // Check leap year.
        if((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
            return 29;
        } else {
            return 28;
        }
    }
    return -1;
}

function calender_year_and_month_valid(year, month) {
    return !isNaN(year) && !isNaN(month) && (calender.years.indexOf(year) > -1) && month > 0 && month < 13;
}

function calender_show_details(day_id) {
    for(let i=1; i<32; ++i) {
        //Highlight the target day or remove the current select.
        let day_button = document.getElementById('calender-show-'+i);
        if(!day_button) {
            return;
        }

        const day_detail_id = 'calender-detail-' + i;
        let day_detail = document.getElementById(day_detail_id);
        if(day_id === i) {
            day_detail.removeAttribute('hidden');
            day_button.classList.add('calender-item-select');
        } else {
            day_detail.setAttribute('hidden', 'true');
            day_button.classList.remove('calender-item-select');
        }
    }
}

function calender_show_mobile_view(view_id) {
    if(Object.prototype.toString.call(view_id) === "[object String]") {
        view_id = parseInt(view_id);
    }
    for(let i=0; i<calender_view_ids.length; ++i) {
        if(view_id === i) {
            app_set_conf('calender_view', view_id);
            document.getElementById('calender-view-'+i).classList.add('active');
            document.getElementById(calender_view_ids[i]).removeAttribute('hidden');
        } else {
            document.getElementById('calender-view-'+i).classList.remove('active');
            document.getElementById(calender_view_ids[i]).setAttribute('hidden', 'true');
        }
    }
}

function calender_change() {
    let year_combo = document.getElementById('year-display');
    let month_combo = document.getElementById('month-display');
    window.location.href = '#calender&year='+year_combo.options[year_combo.selectedIndex].value+
        '&month='+month_combo.options[month_combo.selectedIndex].value;
}

function calender_render(year, month) {
    // Set the current year and month.
    document.getElementById('year-display').value = year;
    document.getElementById('month-display').value = month;
    let days = calender_month_days(year, month);
    let day_begin = new Date(year, month-1, 1, 0, 0, 0, 0).getDay();
    let h_day_htmls = ['<tr>'], v_day_htmls = ['<tr>'];
    let day_remain = 7;
    //Filter the dates.
    let live_on_month = [];
    let records = stream.records;
    for(let i=0; i<records.length; ++i) {
        if(records[i][4].getFullYear() === year && records[i][4].getMonth()+1 === month) {
            live_on_month.push(records[i]);
        }
    }
    //Push blank to day begins.
    for(let i=0; i<day_begin; ++i) {
        h_day_htmls.push('<td></td>');
        v_day_htmls.push('<td></td>');
        day_remain -= 1;
    }
    let h_calender_days = [], v_calender_days = [], v_detail_days = [], vertical_days = [];
    const today_date = new Date;
    const is_month = today_date.getFullYear() === year && today_date.getMonth()+1 === month;
    let first_has_stream = -1;
    for(let i=0; i<days; ++i) {
        let h_day_html, vertical_day_html, v_day_class = ['clickable-header'];
        //Check today.
        if(is_month && today_date.getDate() === i+1) {
            h_day_html = '<td class="calender-today">';
            v_day_class.push('calender-today');
            vertical_day_html = '<tr><td class="calender-today"><div>';
        } else {
            h_day_html = '<td>';
            vertical_day_html = '<tr><td><div>';
        }
        if(day_remain === 7 || day_remain === 1) {
            h_day_html += '<span class="vertical-rest-day">'+(i+1)+'</span>';
            vertical_day_html += '<span class="vertical-rest-day">';
        } else {
            h_day_html += (i+1);
            vertical_day_html += '<span class="vertical-day">';
        }
        vertical_day_html += (i+1)+' '+app_i18n.day_of_the_week[7-day_remain]+'</span></div>';
        let v_has_stream = false, v_detail = '<tbody id="calender-detail-'+(i+1)+'" hidden>';
        while(live_on_month.length > 0 && live_on_month[live_on_month.length-1][4].getDate() === i+1) {
            let live_info = live_on_month[live_on_month.length-1];
            live_on_month.pop();
            //Add the records.
            let live_html = app_hyperlink(app_archive_url(live_info[2], live_info[3]))+
                '<div class="text-icon '+(live_info[0] === 'b' ? 'icon-bilibili' : 'icon-youtube')+'"></div>'+ live_info[1] + '</a>';
            //Check whether it is live day.
            if(live_info[5]) {
                const date = live_info[4];
                live_html += ', <a class="half-opacity-text" href="#setori&year='+date.getFullYear()+'&month='+(date.getMonth()+1)+'&day='+date.getDate()+'">'+app_i18n.view_setori+'</a>';
            }
            h_day_html += '<div>'+live_html+'</div>';
            live_html = '<div class="vertical-calender-item">'+live_html+'</div>';
            // Add live html to details.
            vertical_day_html += live_html;
            v_detail += '<tr><td>'+live_html+'</td></tr>'
            v_has_stream = true;
        }
        v_detail += '</tbody>';
        v_detail_days.push(v_detail);
        if(v_has_stream) {
            v_day_class.push('calender-has-stream');
            if(first_has_stream === -1) {
                first_has_stream = i + 1;
            }
        }
        vertical_day_html += '</td></tr>';
        h_day_html += '</td>';
        let v_span_class = '';
        if(day_remain === 7 || day_remain === 1) {
            v_span_class = 'vertical-rest-day';
        }
        let v_day_html = '<td id="calender-show-'+(i+1)+'" class="'+v_day_class.join(' ')+'"><span class="'+v_span_class+'">'+(i+1)+'</span></td>';
        vertical_days.push(vertical_day_html);
        h_day_htmls.push(h_day_html);
        v_day_htmls.push(v_day_html);
        day_remain -= 1;
        if(day_remain === 0) {
            h_day_htmls.push('</tr>');
            v_day_htmls.push('</tr>');
            h_calender_days.push(h_day_htmls.join('\n'));
            v_calender_days.push(v_day_htmls.join('\n'));
            h_day_htmls = ['<tr>'];
            v_day_htmls = ['<tr>'];
            day_remain = 7;
        }
    }
    while(day_remain > 0) {
        h_day_htmls.push('<td></td>');
        day_remain -= 1;
    }
    h_day_htmls.push('</tr>');
    h_calender_days.push(h_day_htmls.join('\n'));
    v_calender_days.push(v_day_htmls.join('\n'));
    document.getElementById('calender-days').innerHTML = h_calender_days.join('\n');
    document.getElementById('calender-day-items').innerHTML = v_calender_days.join('\n');
    document.getElementById('vertical-days').innerHTML = vertical_days.join('\n');
    document.getElementById('calender-day-details').innerHTML = v_detail_days.join('\n');
    // Assign detail visible.
    for(let i=1; i<32; ++i) {
        let element_show = document.getElementById('calender-show-'+i);
        if(element_show) {
            element_show.onclick = function() { calender_show_details(i); };
        }
    }
    //Base on the local selection, show the panel.
    for(let i=0; i<calender_view_ids.length; ++i) {
        document.getElementById('calender-view-'+i).onclick = function() { calender_show_mobile_view(i); };
    }
    calender_show_mobile_view(app_load_conf('calender_view', 0));
    //Show the day.
    if(first_has_stream === -1) {
        first_has_stream = 1;
    }
    calender_show_details(first_has_stream);
}

function calender_init_ui() {
    // Render the forecast.
    forecast_render();
    // Prepare the year.
    let years = new Set();
    for(let i=0; i<stream.records.length; ++i) {
        years.add(stream.records[i][4].getFullYear());
    }
    years = Array.from(years);
    years.sort().reverse();
    calender.years = years;
    // Set the year data to combo.
    let year_items = [];
    for(let i=0; i<years.length; ++i) {
        year_items.push('<option value="'+years[i]+'">'+years[i]+'</option>');
    }
    document.getElementById('year-display').innerHTML = year_items.join('\n');
    // Render the calendar header.
    let h_calender_head = ['<tr>'], v_calender_head = ['<tr>'];
    for(let i=0; i<7; ++i) {
        if(i===0 || i===6) {
            h_calender_head.push('<th class="vertical-rest-day">'+app_i18n.day_of_the_week[i]+'</th>');
            v_calender_head.push('<th class="vertical-rest-day">'+app_i18n.day_of_the_week_short[i]+'</th>');
        } else {
            h_calender_head.push('<th>'+app_i18n.day_of_the_week[i]+'</th>');
            v_calender_head.push('<th>'+app_i18n.day_of_the_week_short[i]+'</th>');
        }
    }
    h_calender_head.push('</tr>');
    v_calender_head.push('</tr>');
    document.getElementById('calender-head').innerHTML = h_calender_head.join('\n');
    document.getElementById('calender-day-head').innerHTML = v_calender_head.join('\n');
    //Render the calender.
    if('year' in app_url.args && 'month' in app_url.args) {
        // Check validation.
        const target_year = parseInt(app_url.args.year), target_month = parseInt(app_url.args.month);
        if(calender_year_and_month_valid(target_year, target_month)) {
            calender_render(target_year, target_month);
            return;
        }
    }
    // Render today.
    const today_date = new Date;
    calender_render(today_date.getFullYear(), today_date.getMonth()+1);
}

function load_calender() {
    document.title = app_i18n.title_stream;
    // Clear and reset the header.
    header_set_item('calender');
    app_load_panel('calender.html', function() {
        // Init the calender UI.
        calender_init_ui();
        // Hide the splash screen.
        splash_hide();
    });
}