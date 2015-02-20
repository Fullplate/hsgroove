package com.fullplate.hsgroove.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Account {

    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    public String username;

    @JsonIgnore
    public String password;

    public Account(String username, String password) {
        this.username = username;
        this.password = password;
    }

    Account() {

    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}
