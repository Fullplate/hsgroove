// simple logging switch
var DEBUG = true;
var log = function(msg) {
    if (DEBUG) {
        console.log(msg);
    }
};

var app = {
    init: function() {
        log("hsgroove initiated");

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

    // convert obj to JSON and POST to url via AJAX request
    postJson: function(url, obj, success, failure) {
        log("postJson: "+JSON.stringify(obj));

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(obj),
            dataType: 'JSON',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function(res) {
                success(res);
            },
            error: function(res) {
                failure(res);
            }
        });
    },

    // called when authed status changes
    updateAuthedStatus: function(authed, logMsg) {
        log("updateAuthedStatus: "+logMsg);
        this.appStatus.authed = authed;
        this.updateAuthedNavigation();
        $("#password").val("");
    },

    // login to API with basic authentication
    doLogin: function() {
        log("doLogin");

        var that = this;

        var username = $("#username").val();
        var password = $("#password").val();
        if (!(username && password)) {
            this.updateAuthedStatus(false, "doLogin failure (missing username/password)")
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
    doGetDecks: function(app) {
        log("doGetDecks");

        var app = app || this[0]; // in case called via fetchBindings array

        if (!app.appStatus.authed) {
            log("doGetDecks failure (not authed)")
            return;
        }

        $.get("/api/decks", function(res) {
            log(res);

            res = res.reverse(); // display newer results first
            var decklist = $("#decklist");
            decklist.empty();
            for (var i = 0; i < res.length; i++) {
                log(res[i]);

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
    doGetMatches: function(app) {
        log("doGetMatches");

        var app = app || this[0]; // in case called via fetchBindings array

        if (!app.appStatus.authed) {
            log("doGetMatches failure (not authed)")
            return;
        }

        $.get("/api/games", function(res) {
            log(res);

            res = res.reverse(); // display newer results first
            var matchlist = $("#matchlist");
            matchlist.empty();

            var currentSeason = "";
            for (var i = 0; i < res.length; i++) {
                log(res[i]);

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
        log("doGetStatistics");
    },

    // POST /api/account/create
    doCreateAccount: function() {
        log("doCreateAccount");

        var username = $("#username").val();
        var password = $("#password").val();
        if (!(username && password)) {
            this.updateAuthedStatus(false, "doCreateAccount failure (missing username/password)")
            return;
        }

        var accountObj = {
            "username": username,
            "password": password
        };

        var that = this;
        this.postJson('/api/account/create', accountObj,
            function() {
                log("doCreateAccount success");
                that.doLogin();
            },
            function() {
                log("doCreateAccount failure");
            }
        );
    },

    // POST /api/decks and update html
    doCreateDeck: function() {
        log("doCreateDeck");

        // build Deck object
        var deckObj = {};
        var name = $("#createDeckName").val();
        var heroClass = parseInt($("#createDeckHeroClass").val());
        var archetype = $("#createDeckArchetype").val();
        var notes = $("#createDeckNotes").val();

        // validation
        log(heroClass);
        if (!heroClass && heroClass !== 0) {
            log("doCreateDeck failure (no heroClass specified)")
            return;
        }

        // add fields
        deckObj.heroClass = heroClass;
        deckObj.name = name;
        if (archetype) {
            deckObj.archetype = {
                "id": -1, // dummy ID until backend has proper validation logic
                "displayName": archetype,
                "heroClass": heroClass
            };
        }
        if (notes) {
            deckObj.notes = notes;
        }

        // POST Deck object
        var that = this;
        this.postJson('/api/decks', deckObj,
            function(res) {
                log("doCreateDeck success: " + res);
                // clear input fields
                $("#createDeckForm")[0].reset();

                // fetch decklist again
                that.doGetDecks(that);
            },
            function(res) {
                log("doCreateDeck failure: " + res);
            }
        );
    },

    // POST /api/games and update html
    doAddMatch: function() {
        log("doAddMatch");

        /*var that = this;
        this.postJson('/api/games')*/
    }

};

app.init();
