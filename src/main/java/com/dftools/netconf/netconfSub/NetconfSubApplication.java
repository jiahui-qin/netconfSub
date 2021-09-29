package com.dftools.netconf.netconfSub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;


@ComponentScan("com.dftools.netconf.netconfSub.service")
@ComponentScan("com.dftools.netconf.netconfSub.controller")
@SpringBootApplication
public class NetconfSubApplication {

    public static void main(String[] args) {
        SpringApplication.run(NetconfSubApplication.class, args);
    }

}
