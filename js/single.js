let single = {result_count: 0, records: []};

function single_render_items(item_list) {
    document.getElementById('single-counter').innerHTML = app_i18n.search_single_count(item_list.length);
    // Construct the cards.
    let single_cards = [];
    for(let i=0; i<item_list.length; ++i) {
        const single_item = item_list[i];
        let single_card = [
            '<div class="col">',
            '<div class="card shadow-sm">',
            app_hyperlink(app_archive_url(single_item.y_url, single_item.b_url)),
            '<img class="placeholder-img card-img-top" width="100%" height="160" role="img" aria-label="Placeholder" src="'+single_item.img+'">',
            '</a>',
            '<div class="card-body">',
            '<p class="card-text">'+single_item.title+'</p>',
            '<div class="d-flex justify-content-between align-items-center">',
            '<div>',
            ];
        if(single_item.y_url.length > 0) {
            single_card.push('<button type="button" id="single-y-'+i+'" class="btn btn-sm btn-light"><a class="button-icon icon-youtube"></a><a>Youtube</a></button>');
        }
        if(single_item.b_url.length > 0) {
            single_card.push('<button type="button" id="single-b-'+i+'" class="btn btn-sm btn-light"><a class="button-icon icon-bilibili"></a><a>BiliBili</a></button>');
        }
        let single_card_2 = [
            '</div>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ];
        single_cards.push(single_card.join('\n') + single_card_2.join('\n'));
    }
    document.getElementById('single-results').innerHTML = single_cards.join('\n');
    //Update the button url.
    for(let i=0; i<item_list.length; ++i) {
        const single_item = item_list[i];
        if(single_item.y_url.length > 0) {
            document.getElementById('single-y-'+i).onclick = function () { app_open_url(single_item.y_url); };
        }
        if(single_item.b_url.length > 0) {
            document.getElementById('single-b-'+i).onclick = function () { app_open_url(single_item.b_url); };
        }
    }
}

function single_search(keyword) {
    // Perform search
    let results = [];
    for(let i=0; i<single.records.length; ++i) {
        const single_record = single.records[i];
        if(single_record.title.toLowerCase().match(keyword)) {
            results.push(single_record);
        }
    }
    //Render result.
    single_render_items(results);
}

function single_load_data(single_data) { single.records = single_data.reverse(); }

function load_single() {
    document.title = app_i18n.title_single + ' - ' + app_i18n.brand;
    header_set_item('single');
    // Load the single html.
    app_load_panel('single.html', function() {
        // Update UI text.
        document.getElementById('single-search').setAttribute('placeholder', app_i18n.search_single);
        // Hook the search box.
        document.getElementById('single-search').oninput = function(event) {
            single_search(event.target.value);
        }
        // Render the default records.
        single_render_items(single.records);
    });
}