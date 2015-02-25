package com.fullplate.hsgroove.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface DeckRepository extends JpaRepository<Deck, Long> {

    Collection<Deck> findByAccountUsername(String username);
}
