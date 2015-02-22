console.log("hsgroove app.js initiated");

var loginForm = $('#loginForm');

var getAuthVal = function(username, password) {
    return "Basic " + btoa(username + ":" + password);
};

loginForm.submit(function() {
    console.log("loginForm submit");
    $.ajax({
        type: "GET",
        url: "/api/account",
        data: 'json',
        headers: {
            "Authorization": getAuthVal($('#loginUsername').val(), $('#loginPassword').val())
        },
        success: function(res) {
            console.log("Logged in: " + JSON.stringify(res));
        },
        error: function(res) {
            console.log("Failed to login: " + JSON.stringify(res));
        }
    });
    return false;
});

