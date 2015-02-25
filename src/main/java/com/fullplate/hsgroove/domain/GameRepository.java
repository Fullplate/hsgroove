package com.fullplate.hsgroove.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface GameRepository extends JpaRepository<Game, Long> {

    Collection<Game> findByAccountUsername(String username);
}
