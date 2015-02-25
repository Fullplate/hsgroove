package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Deck {

    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @ManyToOne
    private Account account;

    @JsonIgnore
    @OneToMany(mappedBy = "deck")
    public Set<Game> games = new HashSet<>();

    @Column(nullable = false)
    public Integer heroClass;

    @ManyToOne
    public Archetype archetype;

    @Column(nullable = false)
    public String name;

    public String notes;

    public Deck(Account account, Integer heroClass, Archetype archetype, String name, String notes) {
        this.account = account;
        this.heroClass = heroClass;
        this.archetype = archetype;
        this.name = name;
        this.notes = notes;
    }

    Deck() {

    }

    public Long getId() {
        return id;
    }

    public Account getAccount() {
        return account;
    }

    public Set<Game> getGames() {
        return games;
    }

    public Integer getHeroClass() {
        return heroClass;
    }

    public Archetype getArchetype() {
        return archetype;
    }

    public String getName() {
        return name;
    }

    public String getNotes() {
        return notes;
    }

}
