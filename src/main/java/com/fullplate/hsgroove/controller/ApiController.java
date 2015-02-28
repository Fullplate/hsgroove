package com.fullplate.hsgroove.controller;

import com.fullplate.hsgroove.domain.*;
import com.fullplate.hsgroove.exception.AccessDeniedException;
import com.fullplate.hsgroove.exception.GenericNotFoundException;
import com.fullplate.hsgroove.exception.UserAlreadyExistsException;
import com.fullplate.hsgroove.exception.UserNotFoundException;
import jdk.nashorn.internal.ir.RuntimeNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Test endpoint.
     */
    @RequestMapping(method = RequestMethod.GET)
    String test() {
        return "API: Hello World!";
    }

    /**
     * Get authed Account. Can be used as login endpoint.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/account")
    Account getAccountDetails(@AuthenticationPrincipal Principal principal) {
        String username = principal.getName();
        this.validateUser(username);
        return this.accountRepository.findByUsername(username).orElseThrow(
                () -> new UserNotFoundException(username));
    }

    /**
     * Add new account. Respond with added Account.
     */
    @RequestMapping(method = RequestMethod.POST, value = "/account/create")
    ResponseEntity<?> addAccount(@RequestBody Account account) {
        if (account.getUsername() != null && !account.getUsername().isEmpty()
                && account.getPassword() != null && !account.getPassword().isEmpty()) {
            if (this.accountRepository.findByUsername(account.getUsername()).isPresent()) {
                throw new UserAlreadyExistsException(account.getUsername());
            } else {
                Account newAccount = this.accountRepository.save(
                        new Account(account.getUsername(), account.getPassword(), "USER"));
                return new ResponseEntity<>(newAccount, new HttpHeaders(), HttpStatus.CREATED);
            }
        } else {
            return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all Decks under authed Account.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/decks")
    Collection<Deck> getDecks(@AuthenticationPrincipal Principal principal) {
        String username = principal.getName();
        this.validateUser(username);
        return this.deckRepository.findByAccountUsername(username);
    }

    /**
     * Add Deck under Authed Account. Respond with added Deck.
     * TODO: add validation for Archetype (or require fields in the Entity definition)
     * e.g. supplied with id known (optional name,class) -> success, fetches Archetype (ignores name,class...correct?)
     *      supplied with id not known,name,class -> success, creates Archetype (ignores id...correct?)
     *      supplied with no id,name,class -> failure, requires id (incorrect behaviour, should simply create)
     * TODO: use additional exceptions that throw semantic response codes (ie not a 500)
     */
    @RequestMapping(method = RequestMethod.POST, value = "/decks")
    ResponseEntity<?> addDeck(@AuthenticationPrincipal Principal principal, @RequestBody Deck deck) {
        String username = principal.getName();
        this.validateUser(username);
        return this.accountRepository
                .findByUsername(username)
                .map(account -> {
                    // if Archetype exists, fetch and use it's values in the new Deck
                    // otherwise add the Archetype
                    Long archetypeId = deck.getArchetype().getId();
                    Archetype archetype;
                    if (this.archetypeRepository.exists(archetypeId)) {
                        archetype = this.archetypeRepository.findOne(archetypeId);
                    } else {
                        archetype = this.archetypeRepository.save(deck.getArchetype());
                    }

                    // create new Deck with fetched or created Archetype
                    Deck newDeck = this.deckRepository.save(new Deck(account, deck.getHeroClass(), archetype,
                            deck.getName(), deck.getNotes()));

                    return new ResponseEntity<>(newDeck, new HttpHeaders(), HttpStatus.CREATED);
                }).get();
    }

    /**
     * Get all Games under authed Account.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/games")
    Collection<Game> getGames(@AuthenticationPrincipal Principal principal) {
        String username = principal.getName();
        validateUser(username);
        return this.gameRepository.findByAccountUsername(username);
    }

    /**
     * Add Game under authed Account. Respond with added Game.
     */
    @RequestMapping(method = RequestMethod.POST, value = "/games")
    ResponseEntity<?> addGame(@AuthenticationPrincipal Principal principal, @RequestBody Game game) {
        String username = principal.getName();
        this.validateUser(username);
        return this.accountRepository
                .findByUsername(username)
                .map(account -> {
                    // if Deck exists, fetch and use its values in the new Game
                    // otherwise throw exception (use a orElseThrow?)
                    Long deckId = game.getDeck().getId();
                    Deck deck;
                    if (this.deckRepository.exists(deckId)) {
                        deck = this.deckRepository.findOne(deckId);
                    } else {
                        throw new GenericNotFoundException("deck id: " + deckId);
                    }

                    // if optional Archetype exists, fetch and use its values in the new Game
                    // otherwise add the Archetype
                    Archetype oppArchetype = null;
                    if (game.getOppArchetype() != null) {
                        Long oppArchetypeId = game.getOppArchetype().getId();
                        if (this.archetypeRepository.exists(oppArchetypeId)) {
                            oppArchetype = this.archetypeRepository.findOne(oppArchetypeId);
                        } else {
                            oppArchetype = this.archetypeRepository.save(game.getOppArchetype());
                        }
                    }

                    // get current Season
                    Season season = this.seasonRepository.findOne(this.seasonRepository.getMaxId().longValue());

                    // create new Game with fetched or created Archetype
                    Game newGame = this.gameRepository.save(new Game(account, System.currentTimeMillis(), season,
                            game.getRank(), deck, game.getOppHeroClass(), oppArchetype, game.getVictory(),
                            game.getOnCoin(), game.getNotes()));

                    return new ResponseEntity<>(newGame, new HttpHeaders(), HttpStatus.CREATED);
                }).get();
    }

    /**
     * Get all Seasons.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/seasons")
    Collection<Season> getSeasons(@AuthenticationPrincipal Principal principal) {
        return this.seasonRepository.findAll();
    }

    /**
     * TODO: Get basic statistics based on authed Account's Games.
     */
    @RequestMapping(method = RequestMethod.GET, value = "/statistics")
    Object getStatistics(@AuthenticationPrincipal Principal principal) {
        return null;
    }

    /**
     * Return a 404 if given Principal's username is not found.
     */
    private void validateUser(String username) {
        this.accountRepository.findByUsername(username).orElseThrow(
                () -> new UserNotFoundException(username));
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
