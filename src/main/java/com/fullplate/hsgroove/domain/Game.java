package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
public class Game {

    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @ManyToOne
    private Account account;

    @Column(nullable = false)
    public Long timestamp; // TODO: can probably add this automagically

    @ManyToOne
    public Season season;

    @Column(nullable = false)
    public Integer rank;

    @ManyToOne
    public Deck deck;

    @Column(nullable = false)
    public Integer oppHeroClass;

    @ManyToOne
    public Archetype oppArchetype;

    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    public Boolean victory;

    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    public Boolean onCoin;

    public String notes;

    public Game(Account account, Long timestamp, Season season, Integer rank, Deck deck, Integer oppHeroClass,
                Archetype oppArchetype, Boolean victory, Boolean onCoin, String notes) {
        this.account = account;
        this.timestamp = timestamp;
        this.season = season;
        this.rank = rank;
        this.deck = deck;
        this.oppHeroClass = oppHeroClass;
        this.oppArchetype = oppArchetype;
        this.victory = victory;
        this.onCoin = onCoin;
        this.notes = notes;
    }

    Game() {

    }

    public Long getId() {
        return id;
    }

    public Account getAccount() {
        return account;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public Season getSeason() {
        return season;
    }

    public Integer getRank() {
        return rank;
    }

    public Deck getDeck() {
        return deck;
    }

    public Integer getOppHeroClass() {
        return oppHeroClass;
    }

    public Archetype getOppArchetype() {
        return oppArchetype;
    }

    public Boolean getVictory() {
        return victory;
    }

    public Boolean getOnCoin() {
        return onCoin;
    }

    public String getNotes() {
        return notes;
    }
}
