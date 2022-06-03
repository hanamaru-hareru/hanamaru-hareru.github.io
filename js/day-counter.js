function day_counter_render() {
    const today = new Date();
    const day_divider = 1000 * 60 * 60 * 24;
    document.getElementById('day-counter').innerHTML = "<div>" +app_i18n.count_first_v(Math.floor((today - new Date("2019-08-01")) / day_divider)) + "</div>" +
        "<div>" +app_i18n.count_first_y(Math.floor((today - new Date("2019-08-03")) / day_divider)) + "</div>" +
        "<div>" +app_i18n.count_first_b(Math.floor((today - new Date("2019-08-17")) / day_divider)) + "</div>"
}