package com.fullplate.hsgroove;

import com.fullplate.hsgroove.domain.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
@EnableAutoConfiguration
public class Application {

    /**
     * Add test accounts to the database.
     *
     * @param accountRepository
     * @return
     */
    @Bean
    CommandLineRunner addTestData(AccountRepository accountRepository, ArchetypeRepository archetypeRepository,
                                  DeckRepository deckRepository, SeasonRepository seasonRepository,
                                  GameRepository gameRepository) {
        return (input) -> {
            Account userAcc1 = accountRepository.save(
                    new Account("Fullplate", "qwe", "USER"));
            Archetype archetype1 = archetypeRepository.save(
                    new Archetype("Fast Druid", HeroClass.DRUID.ordinal()));
            Deck deck1 = deckRepository.save(
                    new Deck(userAcc1, HeroClass.DRUID.ordinal(), archetype1, "Fullplate Combo", "Great deck..."));
            Archetype archetype2 = archetypeRepository.save(
                    new Archetype("Midrange Hunter", HeroClass.HUNTER.ordinal()));
            Deck deck2 = deckRepository.save(
                    new Deck(userAcc1, HeroClass.HUNTER.ordinal(), archetype2, "Classic", "<link to deck>"));
            Season season1 = seasonRepository.save(
                    new Season("Season 1 (January)"));
            Season season2 = seasonRepository.save(
                    new Season("Season 2 (February)"));
            Game match1 = gameRepository.save(
                    new Game(userAcc1, System.currentTimeMillis(), season1, Rank.NORMAL_1.ordinal(), deck1,
                            HeroClass.MAGE.ordinal(), "Mech", true, "gr8"));
            Game match2 = gameRepository.save(
                    new Game(userAcc1, System.currentTimeMillis(), season2, Rank.LEGEND.ordinal(), deck2,
                            HeroClass.WARLOCK.ordinal(), "Zoo", false, "shit"));

            Account userAcc2 = new Account("Boris", "qwe", "USER");
            accountRepository.save(userAcc2);

            Account adminAcc1 = new Account("admin", "qwe", "ADMIN");
            accountRepository.save(adminAcc1);
        };
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(Application.class, args);
    }
}
