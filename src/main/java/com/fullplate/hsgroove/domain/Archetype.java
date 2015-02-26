package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Archetype {

    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @OneToMany(mappedBy = "archetype")
    private Set<Deck> decks = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "oppArchetype")
    private Set<Game> games = new HashSet<>();

    @Column(nullable = false)
    public String displayName;

    @Column(nullable = false)
    public Integer heroClass;

    public Archetype(String displayName, Integer heroClass) {
        this.displayName = displayName;
        this.heroClass = heroClass;
    }

    Archetype() {

    }

    public Long getId() {
        return id;
    }

    public Set<Deck> getDecks() {
        return decks;
    }

    public Set<Game> getGames() {
        return games;
    }

    public String getDisplayName() {
        return this.displayName;
    }

    public Integer getHeroClass() {
        return heroClass;
    }

}