package com.dftools.netconf.netconfSub.netconf;

/*
 Copyright (c) 2013 Juniper Networks, Inc.
 All Rights Reserved

 Use is subject to license terms.

*/


import java.io.IOException;

/**
 * Describes exceptions related to commit operation
 */
public class CommitException extends IOException {
    CommitException(String msg) {
        super(msg);
    }
}
