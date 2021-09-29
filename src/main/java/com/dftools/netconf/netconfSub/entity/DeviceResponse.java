package com.dftools.netconf.netconfSub.entity;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class DeviceResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String device;
    private String xmlResponse;
    private LocalDateTime time;
    private String subThreadName;
    private long subThreadId;

}
