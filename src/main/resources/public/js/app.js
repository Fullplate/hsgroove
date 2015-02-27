var app = {
    init: function() {
        console.log("hsgroove initiated");

        this.setupNavigation();
    },

    // setup bindings for SPA navigation
    setupNavigation: function() {
        var navOptions = [$("#accountNav"), $("#decksNav"), $("#matchesNav"), $("#statisticsNav")];
        var contentDivs = [$("#account"), $("#decks"), $("#matches"), $("#statistics")];
        contentDivs[0].show();
        contentDivs[0].siblings().hide();

        for (var i = 0; i < navOptions.length; i++) {
            (function(i) {
                navOptions[i].click(function(e) {
                    contentDivs[i].fadeIn(100).siblings().hide();
                });
            })(i);
        }
    }
};

app.init();
