package com.fullplate.hsgroove;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class ApiController {

    @RequestMapping(method = RequestMethod.GET)
    String test() {
        return "Hello World!";
    }

}
