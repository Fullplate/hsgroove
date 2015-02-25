package com.fullplate.hsgroove.controller;

import com.fullplate.hsgroove.domain.*;
import com.fullplate.hsgroove.exception.AccessDeniedException;
import com.fullplate.hsgroove.exception.UserNotFoundException;
import jdk.nashorn.internal.ir.RuntimeNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collection;

@RestController
//@PreAuthorize("hasAuthority('USER')")
@RequestMapping("/api")
public class ApiController {

    private final AccountRepository accountRepository;
    private final SeasonRepository seasonRepository;
    private final ArchetypeRepository archetypeRepository;
    private final DeckRepository deckRepository;
    private final GameRepository gameRepository;

    @RequestMapping(method = RequestMethod.GET)
    String test() {
        return "API: Hello World!";
    }

    /**
     * Return account details of currently authenticated account.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/account")
    Account getAccountDetails(@AuthenticationPrincipal Principal principal) {
        String username = principal.getName();
        return this.accountRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    /**
     * Return all games for currently authenticated account.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/games")
    Collection<Game> getGames(@AuthenticationPrincipal Principal principle) {
        String username = principle.getName();
        return this.gameRepository.findByAccountUsername(username);
    }

    /**
     * TODO
     * - make sure to validate object correctly, perhaps in GameService
     */
    @RequestMapping(method = RequestMethod.POST, value = "/games")
    Game addGame(@AuthenticationPrincipal Principal principal) {
        return null;
    }

    /**
     * TODO
     * - return list of seasons for display purposes
     */
    @RequestMapping(method = RequestMethod.GET, value = "/seasons")
    Collection<Season> getSeasons(@AuthenticationPrincipal Principal principal) {
        return null;
    }

    /**
     * TODO
     * - use Service class (StatisticsService?) that returns Statistics domain object
     * (does not need to be persisted...) by processing Account's Games.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/statistics")
    Object getStatistics(@AuthenticationPrincipal Principal principal) {
        return null;
    }

    @Autowired
    ApiController(AccountRepository accountRepository, SeasonRepository seasonRepository,
                  ArchetypeRepository archetypeRepository, DeckRepository deckRepository,
                  GameRepository gameRepository) {
        this.accountRepository = accountRepository;
        this.seasonRepository = seasonRepository;
        this.archetypeRepository = archetypeRepository;
        this.deckRepository = deckRepository;
        this.gameRepository = gameRepository;
    }

}
