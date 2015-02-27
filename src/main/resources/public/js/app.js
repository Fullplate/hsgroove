var app = {
    init: function() {
        console.log("hsgroove initiated");

        this.appStatus = {
            "authed": false
        };

        this.setupNavigation();
        this.setupAjaxBindings();
    },

    // setup SPA navigation
    setupNavigation: function() {
        // fetch and store nav links and related divs and set the pre-authed index
        this.navOptions = [$("#accountNav"), $("#decksNav"), $("#matchesNav"), $("#statisticsNav")];
        this.contentDivs = [$("#account"), $("#decks"), $("#matches"), $("#statistics")];
        this.preAuthIndex = 0;

        // show allowed navigation links
        this.updateAuthedNavigation();

        // show pre-authorised div
        this.showPreAuthContent();

        // bind links to divs
        this.bindNavigation();
    },

    // hide/show navigation links based on authed status
    updateAuthedNavigation: function() {
        for (var i = 0; i < this.navOptions.length; i++) {
            if (i != this.preAuthIndex && !this.appStatus.authed) {
                this.navOptions[i].hide();
            } else {
                this.navOptions[i].fadeIn(200);
            }
        }
    },

    // before user is authed, show specific div only
    showPreAuthContent: function() {
        this.contentDivs[this.preAuthIndex].show();
        this.contentDivs[this.preAuthIndex].siblings().hide();
    },

    // bind nav links to related divs
    bindNavigation: function() {
        //var navOptions = this.navOptions;
        //var contentDivs = this.contentDivs;
        var that = this;
        for (var i = 0; i < this.navOptions.length; i++) {
            (function(i) {
                that.navOptions[i].click(function(e) {
                    that.contentDivs[i].fadeIn(100).siblings().hide();
                });
            })(i);
        }
    },

    // setup bindings between form submits/buttons and AJAXing methods
    setupAjaxBindings: function() {
        var that = this;

        $("#loginButton").click(function(e) {
            that.doLogin();
            e.preventDefault();
        });

        $("#createAccountButton").click(function(e) {
            that.doCreateAccount();
            e.preventDefault();
        });

        $("#createDeckButton").click(function(e) {
            that.doCreateDeck();
            e.preventDefault();
        });

        $("#addMatchButton").click(function(e) {
            that.doAddMatch();
            e.preventDefault();
        });
    },

    updateAuthedStatus: function(authed, logMsg) {
        console.log("updateAuthedStatus: "+logMsg);
        this.appStatus.authed = authed;
        this.updateAuthedNavigation();
    },

    doLogin: function() {
        console.log("doLogin");

        var that = this;

        var username = $("#username").val();
        var password = $("#password").val();
        if (!(username && password)) {
            console.log("Missing: username or password");
            return;
        }

        $.ajax({
            type: "GET",
            url: "/api/account",
            dataType: 'json',
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
            success: function(res) {
                if (res.username === username) {
                    that.updateAuthedStatus(true, "doLogin success");
                } else {
                    that.updateAuthedStatus(false, "doLogin failure (server error)");
                }
            },
            error: function(res) {
                that.updateAuthedStatus(false, "doLogin failure (check credentials)");
            }
        });
    },

    doCreateAccount: function() {
        console.log("doCreateAccount");
    },

    doCreateDeck: function() {
        console.log("doCreateDeck");
    },

    doGetDecks: function() {
        console.log("doGetDecks");
    },

    doAddMatch: function() {
        console.log("doAddMatch");
    },

    doGetMatches: function() {
        console.log("doGetMatches");
    },

    doGetStatistics: function() {
        console.log("doGetStatistics");
    }
};

app.init();
