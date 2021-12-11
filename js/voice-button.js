let voice_button = {
    button_info: [],
    playing_id: ''
};

function voice_on_play() {
    ;
}

function voice_on_pause() {
    ;
}

function voice_on_end() {
    let button_tag = document.getElementById('voice-button-'+voice_button.playing_id);
    button_tag.classList.remove('voice-playing');
}

function voice_play(filename) {
    //Check previous id.
    if(voice_button.playing_id.length > 0) {
        //Reset the button.
        voice_on_end();
    }
    //Save the playing id.
    voice_button.playing_id = filename;
    //Set the playing style.
    let button_tag = document.getElementById('voice-button-'+voice_button.playing_id);
    button_tag.classList.add('voice-playing');
    let audio_tag = document.getElementById('misc-button-audio');
    //Set the source.
    audio_tag.setAttribute('src', '/asserts/button-voices/'+filename+'.mp3');
    //Play the audio.
    audio_tag.play();
}

function voice_load_data(voice_data) {
    const button_info_list = voice_data.buttons, category_map = voice_data.categories;
    let category_list = [], other_list = [], category_id = {};
    for(let i=0; i<button_info_list.length; ++i) {
        const button_info = button_info_list[i], button_category = button_info.category;
        if(button_category.length === 0) {
            other_list.push(button_info);
        } else {
            //Find the category info.
            if(button_category in category_id) {
                //Append the button info.
                category_list[category_id[button_category]][1].push(button_info);
            } else {
                // Add the category.
                category_id[button_category] = category_list.length;
                // Create the mapping list.
                category_list.push([category_map[button_category], [button_info]]);
            }
        }
    }
    category_list.push([category_map[''], other_list]);
    //Set the data to button info.
    voice_button.button_info = category_list;
}