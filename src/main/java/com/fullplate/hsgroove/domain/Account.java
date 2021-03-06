package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Account {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    public String username;

    @Column(nullable = false)
    @JsonIgnore
    public String password;

    @JsonIgnore
    public String securityRole;

    @OneToMany(mappedBy = "account")
    @JsonIgnore
    private Set<Deck> decks = new HashSet<>();

    @OneToMany(mappedBy = "account")
    @JsonIgnore
    private Set<Game> games = new HashSet<>();

    public Account(String username, String password, String role) {
        this.username = username;
        this.password = password;
        if (role.equals("USER") || role.equals("ADMIN")) {
            this.securityRole = role;
        } else {
            this.securityRole = "USER";
        }
    }

    Account() {

    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public String getSecurityRole() {
        return securityRole;
    }

    public Set<Deck> getDecks() {
        return decks;
    }

    public Set<Game> getGames() {
        return games;
    }

    @JsonProperty
    public void setPassword(String password) {
        this.password = password;
    }

}
