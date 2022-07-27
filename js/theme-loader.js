const theme_settings = {
    '10-31': 'theme-halloween.css',
    '11-1': 'theme-halloween.css',
    '12-24': 'theme-christmas.css',
    '12-25': 'theme-christmas.css',
    '12-26': 'theme-christmas.css',
}
const theme_date = new Date();
const date_key = (theme_date.getMonth()+1) + '-' + theme_date.getDate();

if(date_key in theme_settings) {
    document.write('<link href="css/'+theme_settings[date_key]+'" rel="stylesheet">');
} else {
    //document.write('<link href="css/theme-normal.css" rel="stylesheet">');
    document.write('<link href="css/theme-christmas.css" rel="stylesheet">');
}