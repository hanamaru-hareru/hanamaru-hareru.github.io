let voice_button = {
    button_info: [],
    playing_id: ''
};

const voice_icon_loading = '<svg id="misc" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">\n' +
    '  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>\n' +
    '</svg>\n';
const voice_icon_playing = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">\n' +
    '  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>\n' +
    '</svg>';
const voice_icon_pausing = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">\n' +
    '  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>\n' +
    '</svg>'

function voice_on_canplay() {
    let button_icon = document.getElementById('voice-button-'+voice_button.playing_id+'-icon');
    button_icon.innerHTML = voice_icon_playing;
}

function voice_on_end() {
    //Remove playing class.
    let button_tag = document.getElementById('voice-button-'+voice_button.playing_id);
    button_tag.classList.remove('voice-playing');
    //Clear the playing icon.
    let button_icon = document.getElementById('voice-button-'+voice_button.playing_id+'-icon');
    button_icon.innerHTML = '';
    //Clear the audio tag.
    voice_button.playing_id = '';
    //Remove the src.
    let audio_tag = document.getElementById('misc-button-audio');
    audio_tag.removeAttribute('src');
}

function voice_play(filename) {
    //Check whether the player is playing.
    let audio_tag = document.getElementById('misc-button-audio');
    //Check previous id.
    if(voice_button.playing_id.length > 0) {
        if(voice_button.playing_id === filename) {
            //Pause the current button.
            if(audio_tag.paused) {
                audio_tag.play();
                voice_on_canplay();
            } else {
                //Pause the audio.
                audio_tag.pause();
                //Change the icon.
                let button_icon = document.getElementById('voice-button-'+voice_button.playing_id+'-icon');
                button_icon.innerHTML = voice_icon_pausing;
            }
            return;
        } else {
            //Reset the button.
            voice_on_end();
        }
    }
    //Save the playing id.
    voice_button.playing_id = filename;
    //Set the playing style.
    let button_tag = document.getElementById('voice-button-'+voice_button.playing_id);
    button_tag.classList.add('voice-playing');
    //Set the icon to be the loading icon.
    let button_icon = document.getElementById('voice-button-'+voice_button.playing_id+'-icon');
    button_icon.innerHTML = voice_icon_loading;
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