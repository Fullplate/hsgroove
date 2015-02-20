package com.fullplate.hsgroove.controller;

import com.fullplate.hsgroove.domain.Account;
import com.fullplate.hsgroove.domain.AccountRepository;
import com.fullplate.hsgroove.exception.AccessDeniedException;
import com.fullplate.hsgroove.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.xml.ws.Response;
import java.nio.file.attribute.UserPrincipalNotFoundException;
import java.security.Principal;

@RestController
@PreAuthorize("hasAuthority('USER')")
@RequestMapping("/api")
public class ApiController {

    private final AccountRepository accountRepository;

    @RequestMapping(method = RequestMethod.GET)
    String test() {
        return "API: Hello World!";
    }

    @RequestMapping(method = RequestMethod.GET, value = "/{username}")
    Account getAccountDetails(@AuthenticationPrincipal Principal principal, @PathVariable String username) {
        if (principal.getName().equals(username)) {
            return this.accountRepository.findByUsername(username)
                    .orElseThrow(() -> new UserNotFoundException(username));
        } else {
            throw new AccessDeniedException(); // non-proper way for now
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/account")
    Account getCurrentAccount(@AuthenticationPrincipal Principal principal) {
        String username = principal.getName();
        return this.accountRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    @Autowired
    ApiController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

}
