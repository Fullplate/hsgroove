package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Season {

    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @OneToMany(mappedBy = "season")
    private Set<Game> games = new HashSet<>();

    @Column(nullable = false)
    public String displayName;

    @Column(nullable = false)
    public Integer chronoId;

    public Season(String displayName, Integer chronoId) {
        this.displayName = displayName;
        this.chronoId = chronoId;
    }

    Season() {

    }

    public Long getId() {
        return id;
    }

    public String getDisplayName() {
        return this.displayName;
    }

    public Set<Game> getGames() {
        return games;
    }

    public Integer getChronoId() {
        return chronoId;
    }
}
