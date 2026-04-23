package com.dftools.netconf.netconfSub.entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class NetconfDevice implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String ip;
    private Integer port;
    private String username;
    private String password;
    private String devName;
    private String xml;

}
