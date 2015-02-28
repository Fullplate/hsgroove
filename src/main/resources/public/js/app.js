var app = {
    init: function() {
        console.log("hsgroove initiated");

        this.appStatus = {
            "authed": false
        };

        this.assets = this.loadAssets();
        this.setupNavigation();
        this.setupAjaxBindings();
    },

    // load image assets into object
    loadAssets: function() {
        var assets = {
            "heroImages": []
        };

        var loadImage = function(filename) {
            var newImage = new Image();
            newImage.src = "/images/" + filename;
            return newImage;
        }

        // load hero images
        var heroImages = ["warrior", "shaman", "rogue", "paladin", "hunter", "druid", "warlock", "mage", "priest"];
        for (var i = 0; i < heroImages.length; i++) {
            assets.heroImages[i] = loadImage("hero/class_" + heroImages[i] + ".png");
        }

        return assets;
    },

    // setup SPA navigation
    setupNavigation: function() {
        // fetch and store nav links and related divs
        this.navOptions = [$("#accountNav"), $("#decksNav"), $("#matchesNav"), $("#statisticsNav")];
        this.contentDivs = [$("#account"), $("#decks"), $("#matches"), $("#statistics")];

        // store function calls to fetch data, along with a reference to app
        var that = this;
        this.fetchBindings = [that, function(){}, this.doGetDecks, this.doGetMatches, this.doGetStatistics];

        // set the pre-authorized nav link/related div index
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

    // bind nav links to related divs and call fetch data methods appropriately
    bindNavigation: function() {
        var that = this;
        for (var i = 0; i < this.navOptions.length; i++) {
            (function(i) {
                that.navOptions[i].click(function(e) {
                    that.contentDivs[i].fadeIn(100).siblings().hide();
                    that.fetchBindings[i + 1]();
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

    // called when authed status changes
    updateAuthedStatus: function(authed, logMsg) {
        console.log("updateAuthedStatus: "+logMsg);
        this.appStatus.authed = authed;
        this.updateAuthedNavigation();
    },

    // login to API with basic authentication
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

    // GET /api/decks and populate html
    doGetDecks: function() {
        console.log("doGetDecks");

        var app = this[0]; // TODO: need to make this work wherever it's called from

        if (!app.appStatus.authed) {
            console.log("doGetDecks failure (not authed)")
            return;
        }

        $.get("/api/decks", function(res) {
            console.log(res);

            res = res.reverse(); // display newer results first
            var decklist = $("#decklist");
            decklist.empty();
            for (var i = 0; i < res.length; i++) {
                console.log(res[i]);

                var deckString = "";
                deckString += "<img src='" + app.assets.heroImages[res[i].heroClass].src + "' />";
                deckString += "<span>" + res[i].name + " - " + res[i].archetype.displayName + "</span>"
                if (res[i].notes) {
                    deckString += "<p>Notes: " + res[i].notes + "</p>";
                }
                decklist.append("<div id='deck'>" + deckString + "</div><br>");
            }
        });
    },

    // GET /api/matches and populate html
    doGetMatches: function() {
        console.log("doGetMatches");

        var app = this[0]; // TODO: need to make this work wherever it's called from

        if (!app.appStatus.authed) {
            console.log("doGetMatches failure (not authed)")
            return;
        }

        $.get("/api/games", function(res) {
            console.log(res);

            res = res.reverse(); // display newer results first
            var matchlist = $("#matchlist");
            matchlist.empty();

            var currentSeason = "";
            for (var i = 0; i < res.length; i++) {
                console.log(res[i]);

                // display season headers
                var matchSeason = res[i].season.displayName;
                if (matchSeason !== currentSeason) {
                    matchlist.append("<h3>" + matchSeason + "</h3>");
                    currentSeason = matchSeason;
                }

                // add div containing match details
                var matchString = "";
                matchString += "<img src='" + app.assets.heroImages[res[i].deck.heroClass].src + "' />";
                matchString += "<span> VS </span>";
                matchString += "<img src='" + app.assets.heroImages[res[i].oppHeroClass].src + "' />";
                matchString += "<span> @ Rank: " + res[i].rank + ", " + ((res[i].victory) ? "WIN" : "LOSS") + "</span>";
                matchString += "<p>" + res[i].deck.name + " (" + res[i].deck.archetype.displayName + ") versus " +
                        res[i].oppArchetype.displayName +
                        ((res[i].onCoin) ? " (you had coin)" : " (you went first)") + "</p>";
                if (res[i].notes) {
                    matchString += "<p>Notes: " + res[i].notes + "</p>";
                }
                matchlist.append("<div id='match'>" + matchString + "</div><br>");
            }
        });
    },

    // GET /api/statistics and populate html
    doGetStatistics: function() {
        console.log("doGetStatistics");
    },

    //
    doCreateAccount: function() {
        console.log("doCreateAccount");
    },

    //
    doCreateDeck: function() {
        console.log("doCreateDeck");
    },

    //
    doAddMatch: function() {
        console.log("doAddMatch");
    }

};

app.init();
