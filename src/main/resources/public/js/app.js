var app = {
    init: function() {
        log("hsgroove initiated");

        this.appStatus = {
            "authed": false
        };

        this.currData = {
            "decks": [],
            "matches": []
        };

        this.domain = {
            "classes": ["warrior", "shaman", "rogue", "paladin", "hunter", "druid", "warlock", "mage", "priest"],
            "knownArchetypes": ["control", "midrange", "aggro", "face", "combo", "OTK", "miracle", "mech",
                                "deathrattle", "mill"]
        }

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
        for (var i = 0; i < this.domain.classes.length; i++) {
            assets.heroImages[i] = loadImage("hero/class_" + this.domain.classes[i] + ".png");
        }

        return assets;
    },

    // setup SPA navigation
    setupNavigation: function() {
        // fetch and store nav links and related divs
        this.navOptions = [$("#accountNav"), $("#decksNav"), $("#matchesNav"), $("#statisticsNav")];
        this.contentDivs = [$("#account"), $("#decks"), $("#matches"), $("#statistics")];

        // specify functions to be called upon content div loads
        var that = this;
        this.fetchBindings = [that, function(){}, this.doGetDecks, this.doGetMatches, this.doGetStatistics];
        this.populateInputBindings = [that, function(){}, this.populateDeckInput, this.populateMatchInput, function(){}]

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
                    that.populateInputBindings[i + 1]();
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

    // populate input form for Decks
    populateDeckInput: function() {
        log("populateDeckInput");

        // populate createDeckHeroClass with Hero Classes
        var heroClasses = $("#createDeckHeroClass");
        heroClasses.empty();
        heroClasses.append("<option disabled selected>Hero Class</option>");
        for (var i = 0; i < this[0].domain.classes.length; i++) {
            heroClasses.append("<option value='" + i + "'>" + capitalize(this[0].domain.classes[i]) + "</option>");
        }

        // populate createDeckArchetypeDatalist with knownArchetypes
        var archetypeDatalist = $("#createDeckArchetypeDl");
        archetypeDatalist.empty();
        for (var i = 0; i < this[0].domain.knownArchetypes.length; i++) {
            archetypeDatalist.append("<option value='" + this[0].domain.knownArchetypes[i] + "' />")
        }
    },

    // populate input form for Matches
    populateMatchInput: function() {
        log("populateMatchInput");

        // populate addMatchDeck with user's decks
        var decks = $("#addMatchDeck");
        decks.empty();
        var deckData = this[0].currData.decks;
        if (deckData.length === 0) {
            decks.append("<option disabled selected>No decks found, create one first</option>")
        } else {
            decks.append("<option disabled selected>Select Deck</option>");
            for (var i = 0; i < deckData.length; i++) {
                decks.append("<option value='" + deckData[i].id + "'>" + deckData[i].name + "</option>");
            }
        }

        // populate addMatchRank with Legend-25 ranks
        var ranks = $("#addMatchRank");
        ranks.empty();
        ranks.append("<option disabled selected>Ladder rank</option>");
        for (var i = 0; i < 26; i++) {
            if (i === 0) {
                ranks.append("<option value='0'>Legend</option>");
            } else {
                ranks.append("<option value='" + i + "'>Rank " + i + "</option>");
            }
        }

        // populate addMatchOppHeroClass with Hero Classes
        var oppHeroClasses = $("#addMatchOppHeroClass");
        oppHeroClasses.empty();
        oppHeroClasses.append("<option disabled selected>Opponent Hero Class</option>");
        for (var i = 0; i < this[0].domain.classes.length; i++) {
            oppHeroClasses.append("<option value='" + i + "'>" + capitalize(this[0].domain.classes[i]) + "</option>");
        }

        // populate addMatchOppArchetypeDl with knownArchetypes
        var archetypeDatalist = $("#addMatchOppArchetypeDl");
        archetypeDatalist.empty();
        for (var i = 0; i < this[0].domain.knownArchetypes.length; i++) {
            archetypeDatalist.append("<option value='" + this[0].domain.knownArchetypes[i] + "' />")
        }
    },

    // convert obj to JSON and POST to url via AJAX request
    postJson: function(url, obj, success, failure) {
        log("postJson: "+JSON.stringify(obj, null, 4));

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
            type: 'GET',
            url: '/api/account',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ":" + password)
            },
            success: function(res) {
                if (res.username === username) {
                    alert("Account created, now logging in...");
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

        $.get('/api/decks', function(res) {
            log(res);

            res = res.reverse(); // display newer results first
            app.currData.decks = res; // store results

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

        $.get('/api/games', function(res) {
            log(res);

            res = res.reverse(); // display newer results first
            app.currData.matches = res; // store results

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
                matchString += "<p>" + res[i].deck.name +
                        ((res[i].deck.archetype) ? " (" + res[i].deck.archetype.displayName + " )" : "") +
                        " VS " + ((res[i].oppArchetype) ? res[i].oppArchetype.displayName : " opponent") +
                        ((res[i].onCoin) ? " (coin)" : " (no coin)") + "</p>";
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

        // fetch/parse input
        var name = $("#createDeckName").val();
        var heroClass = parseInt($("#createDeckHeroClass").val());
        var archetype = $("#createDeckArchetype").val();
        var notes = $("#createDeckNotes").val();

        // validation
        if (!heroClass && heroClass !== 0) {
            log("doCreateDeck failure (no heroClass specified)")
            return;
        }

        // build Deck object
        var deckObj = {};
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

        // fetch/parse input
        var deckId = $("#addMatchDeck").val();
        var rank = parseInt($("#addMatchRank").val());
        var oppHeroClass = parseInt($("#addMatchOppHeroClass").val());
        var oppArchetype = $("#addMatchOppArchetype").val();
        var victory = ($("#addMatchVictoryTrue").is(':checked') ? true : false);
        var onCoin = ($("#addMatchOnCoinTrue").is(':checked') ? true : false);
        var notes = $("#addMatchNotes").val();

        // validation
        if (!rank && rank !== 0) {
            log("doAddMatch failure (no rank specified)")
            return;
        }
        if (!oppHeroClass && oppHeroClass !== 0) {
            log("doAddMatch failure (no oppHeroClass specified)")
            return;
        }

        // build Match object
        var matchObj = {};
        matchObj.deck = {
            "id": deckId
        };
        matchObj.rank = rank;
        matchObj.oppHeroClass = oppHeroClass;
        matchObj.victory = victory;
        matchObj.onCoin = onCoin;
        if (oppArchetype) {
            matchObj.oppArchetype = {
                "id": -1, // dummy ID until backend has proper validation logic
                "displayName": oppArchetype,
                "heroClass": oppHeroClass
            };
        }
        if (notes) {
            matchObj.notes = notes;
        }

        // POST Match object
        var that = this;
        this.postJson('/api/games', matchObj,
            function(res) {
                log("doAddMatch success: " + res);
                // clear input fields
                $("#addMatchForm")[0].reset();

                // fetch matchlist again
                that.doGetMatches(that);
            },
            function(res) {
                log("doAddMatch failure: " + res);
            }
        );
    }

};

app.init();