package com.fullplate.hsgroove.security;

import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
//@EnableWebSecurity // overrides Spring Boot defaults...
//@EnableGlobalMethodSecurity(prePostEnabled = true)
@Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // disable csrf (TODO: enable)
                .httpBasic() // enable Basic authentication
                .and()
                .authorizeRequests()
                    .antMatchers("/api/account/create").permitAll() // allow Account creation before authentication
                    .antMatchers("/index.html", "/").permitAll() // don't restrict static entry point
                    .anyRequest().authenticated(); // all requests should be authenticated
    }
}