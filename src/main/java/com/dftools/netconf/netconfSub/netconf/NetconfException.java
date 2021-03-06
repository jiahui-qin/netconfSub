package com.dftools.netconf.netconfSub.netconf;

/*
 Copyright (c) 2013 Juniper Networks, Inc.
 All Rights Reserved

 Use is subject to license terms.

*/


import java.io.IOException;

/**
 * Describes exceptions related to establishing Netconf session.
 */
public class NetconfException extends IOException {
    public NetconfException(String msg) {
        super(msg);
    }
}
