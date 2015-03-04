var app = {
    init: function() {
        log("hsgroove initiated");

        this.appStatus = {
            "authed": false,
            "authedUser": ""
        };

        this.currData = {
            "decks": [],
            "matches": [],
            "victoryRecord": [0, 0] // wins, losses
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
        this.navLinks = [$("#accountLink"), $("#decksLink"), $("#matchesLink"), $("#statisticsLink")];
        this.sections = [$("#accountSection"), $("#decksSection"), $("#matchesSection"), $("#statisticsSection")];

        // specify functions to be called upon content div loads
        var that = this;
        this.buildInputBindings = [that, function(){}, this.populateDeckInput, this.populateMatchInput, function(){}];
        this.buildContentBindings = [that, function(){}, this.buildDeckList, this.buildMatchList, this.buildStatistics];

        // set the pre-authorized nav link/related div index
        this.preAuthIndex = 0;

        // show allowed navigation links
        this.updateAuthedNavigation();

        // show pre-authorised div
        this.showPreAuthContent();

        // bind links to divs/actions
        this.bindNavigation();

        // bind logout link
        this.bindLogoutLink($("#logoutLink"));
    },

    // hide/show navigation links based on authed status
    updateAuthedNavigation: function() {
        for (var i = 0; i < this.navLinks.length; i++) {
            if (i != this.preAuthIndex && !this.appStatus.authed) {
                this.navLinks[i].hide();
            } else {
                this.navLinks[i].fadeIn(200);
            }
        }
    },

    // before user is authed, show specific div only
    showPreAuthContent: function() {
        this.sections[this.preAuthIndex].show();
        this.sections[this.preAuthIndex].siblings().hide();
    },

    // bind nav links to related divs and call fetch data methods appropriately
    bindNavigation: function() {
        var that = this;
        for (var i = 0; i < this.navLinks.length; i++) {
            (function(i) {
                that.navLinks[i].click(function(e) {
                    that.sections[i].fadeIn(200).siblings().hide();
                    that.buildInputBindings[i + 1]();
                    that.buildContentBindings[i + 1]();
                });
            })(i);
        }
    },

    // bind supplied link to logging out functionality
    bindLogoutLink: function(link) {
        var that = this;
        link.click(function(e) {
            that.doLogout();
        });
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

    // populate/show or clear/hide info bar based on auth status
    updateInfoBar: function() {
        log("updateInfoBar: " + this.appStatus.authed);

        var container = $("#infoContainer");
        var username = $("#usernameDisplay");
        var rank = $("#rankDisplay");

        if (this.appStatus.authed) {
            username.text(this.appStatus.authedUser);
            if (this.currData.matches.length > 0) {
                rank.text("Rank: " + this.currData.matches[0].rank);
            }
            container.slideDown();
        } else {
            username.text = "";
            rank.text = "";
            container.slideUp();
        }
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

    // called when authed status changes
    updateAuthedStatus: function(authed, username, logMsg) {
        log("updateAuthedStatus: "+logMsg);

        // set appStatus
        this.appStatus.authed = authed;
        this.appStatus.authedUser = username;

        // if logging in, fetch/store deck/match data
        if (authed) {
            var that = this;
            this.fetchDecks(function() {
                that.fetchMatches(function() {
                    // show info bar, navigation options once all data is loaded
                    that.updateInfoBar();
                    that.updateAuthedNavigation();
                    // clear password field
                    $("#password").val("");
                });
            });
        } else {
            // if logging out, remove non-Account navigation/content and the info bar
            this.updateAuthedNavigation();
            this.updateInfoBar();
            this.showPreAuthContent();
        }
    },

    // login to API with basic authentication
    doLogin: function() {
        log("doLogin");

        var that = this;

        var username = $("#username").val();
        var password = $("#password").val();
        if (!(username && password)) {
            this.updateAuthedStatus(false, "", "doLogin failure (missing username/password)")
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
                    that.updateAuthedStatus(true, username, "doLogin success");
                } else {
                    that.updateAuthedStatus(false, "", "doLogin failure (server error)");
                }
            },
            error: function(res) {
                that.updateAuthedStatus(false, "", "doLogin failure (check credentials)");
            }
        });
    },

    // coordinate logging out
    // TODO: use a proper method of logging out eg invalidating cookies/session etc.
    doLogout: function() {
        this.updateAuthedStatus(false, "", "user logged out");
    },

    // fetch and store all decks, newest-to-oldest. Call onDone when complete.
    fetchDecks: function(onDone) {
        if (!app.appStatus.authed) {
            log("fetchDecks failure (not authed)")
            onDone();
        }

        var that = this;
        $.get('/api/decks', function(res) {
            if (res && res.length > 0 ) {
                that.currData.decks = res.reverse();
            }
            onDone();
        });
    },

    // fetch and store all matches, newest-to-oldest. Update statistics. Call onDone when complete.
    fetchMatches: function(onDone) {
        if (!app.appStatus.authed) {
            log("fetchMatches failure (not authed)")
            onDone();
        }

        var that = this;
        $.get('/api/games', function(res) {
            if (res && res.length > 0) {
                that.currData.matches = res.reverse();
            }
            that.calculateStatistics();
            onDone();
        });
    },

    // calculate basic statistics based off fetched games, and store in currData.victoryRecord
    calculateStatistics: function() {
        log("calculateStatistics");

        var matches = app.currData.matches;
        var record = [0, 0]; // won/lost
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].victory) {
                record[0]++;
            } else {
                record[1]++;
            }
        }
        app.currData.victoryRecord = record;
    },

    // populate deckList html
    // TODO: hover on deck for notes
    buildDeckList: function(app) {
        log("buildDeckList");

        var app = app || this[0]; // in case called via fetchBindings array

        var deckList = $("#deckList");
        deckList.empty();

        var decks = app.currData.decks;
        if (decks.length > 0) {
            for (var i = 0; i < decks.length; i++) {
                var deckString = "";
                deckString += "<img class='deckImg' src='" + app.assets.heroImages[decks[i].heroClass].src + "' />";
                deckString += "<p class='deckName'>\"" + decks[i].name + "\"</p>"
                deckString += "<p class='deckArchetype'>" + decks[i].archetype.displayName + "</p>";
                deckList.append("<div class='deck'>" + deckString + "</div>");
            }
        } else {
            deckList.append("<p>No decks found, try adding a deck!</p>");
        }
    },

    // populate matchList html
    buildMatchList: function(app) {
        log("buildMatchList");

        var app = app || this[0]; // in case called via fetchBindings array

        var matchList = $("#matchList");
        matchList.empty();

        var matches = app.currData.matches;
        if (matches.length > 0) {
            var currentSeason = "";
            for (var i = 0; i < matches.length; i++) {
                // display season headers
                var matchSeason = matches[i].season.displayName;
                if (matchSeason !== currentSeason) {
                    matchList.append("<h3>" + matchSeason + "</h3>");
                    currentSeason = matchSeason;
                }

                // add div containing match details
                var matchString = "";
                matchString += "<img src='" + app.assets.heroImages[matches[i].deck.heroClass].src + "' />";
                matchString += "<span> VS </span>";
                matchString += "<img src='" + app.assets.heroImages[matches[i].oppHeroClass].src + "' />";
                matchString += "<span> @ Rank: " + matches[i].rank + ", " + ((matches[i].victory) ? "WIN" : "LOSS") + "</span>";
                matchString += "<p>" + matches[i].deck.name +
                        ((matches[i].deck.archetype) ? " (" + matches[i].deck.archetype.displayName + " )" : "") +
                        " VS " + ((matches[i].oppArchetype) ? matches[i].oppArchetype.displayName : " opponent") +
                        ((matches[i].onCoin) ? " (coin)" : " (no coin)") + "</p>";
                if (matches[i].notes) {
                    matchString += "<p>Notes: " + matches[i].notes + "</p>";
                }
                matchList.append("<div class='match'>" + matchString + "</div><br>");
            }
        } else {
            matchList.append("<p>No matches found, try adding a match!</p>");
        }
    },

    // populate statistics html
    buildStatistics: function(app) {
        log("buildStatistics");

        var app = app || this[0]; // in case called via fetchBindings array

        var victoryRecord = app.currData.victoryRecord;
        var wins = victoryRecord[0];
        var losses = victoryRecord[1];
        var winrate = (wins + losses != 0) ? Math.round((wins / (wins + losses)) * 100) : 0;

        var stats = $("#statistics");
        stats.empty();
        stats.append("<p>" + wins + " won, " + losses + " lost<p>");
        stats.append("<p>Total matches: " + (wins + losses) + "<p>");
        stats.append("<p>Winrate: " + winrate + "%<p>");
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

    // POST /api/account/create
    doCreateAccount: function() {
        log("doCreateAccount");

        var username = $("#username").val();
        var password = $("#password").val();
        if (!(username && password)) {
            this.updateAuthedStatus(false, "", "doCreateAccount failure (missing username/password)")
            return;
        }

        var that = this;
        this.postJson('/api/account/create',
            {
                "username": username,
                "password": password
            },
            function() {
                log("doCreateAccount success");
                alert("Account created, now logging in...");
                that.doLogin();
            },
            function() {
                log("doCreateAccount failure");
            }
        );
    },

    // POST /api/decks and update stored data
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
                log("doCreateDeck success: " + JSON.stringify(res, null, 4));

                // clear input fields
                $("#createDeck")[0].reset();

                // add new deck to start of currData.decks, and rebuild html
                that.currData.decks.unshift(res);
                that.buildDeckList(that);
            },
            function(res) {
                log("doCreateDeck failure: " + JSON.stringify(res, null, 4));
            }
        );
    },

    // POST /api/games and update stored data
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
                log("doAddMatch success: " + JSON.stringify(res, null, 4));

                // clear input fields
                $("#addMatch")[0].reset();

                // add new match to start of currData.matches, recalculate statistics and rebuild html
                that.currData.matches.unshift(res);
                that.calculateStatistics();
                that.buildMatchList(that);
            },
            function(res) {
                log("doAddMatch failure: " + JSON.stringify(res, null, 4));
            }
        );
    }

};

app.init();