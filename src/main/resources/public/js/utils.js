// simple logging switch
var DEBUG = true;
var log = function(msg) {
    if (DEBUG) {
        console.log(msg);
    }
};

var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}