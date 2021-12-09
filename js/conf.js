function app_load_conf(key, def_value) {
    const local_value = window.localStorage.getItem(key);
    return local_value ? local_value : def_value;
}

function app_set_conf(key, value) {
    window.localStorage.setItem(key, value);
}

function app_remove_conf(key) {
    window.localStorage.removeItem(key);
}