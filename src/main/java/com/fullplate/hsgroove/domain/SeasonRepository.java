package com.fullplate.hsgroove.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SeasonRepository extends JpaRepository<Season, Long> {
    @Query("SELECT max(t.id) FROM #{#entityName} t")
    Integer getMaxId();
}
