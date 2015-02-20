package com.fullplate.hsgroove;

import com.fullplate.hsgroove.domain.Account;
import com.fullplate.hsgroove.domain.AccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.Arrays;

@Configuration
@EnableWebMvc // unsure if need
@ComponentScan
@EnableAutoConfiguration
@EnableConfigurationProperties // unsure if need
public class Application {

    /**
     * Add test accounts to the database.
     *
     * @param accountRepository
     * @return
     */
    @Bean
    CommandLineRunner addTestAccounts(AccountRepository accountRepository) {
        return (input) -> Arrays.asList("Fullplate,Boris,admin".split(","))
                .forEach(username -> {
                    Account account = accountRepository.save(new Account(username, "password"));
                });
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(Application.class, args);
    }

}
