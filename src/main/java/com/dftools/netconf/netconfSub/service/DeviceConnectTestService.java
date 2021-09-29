package com.dftools.netconf.netconfSub.service;

import com.dftools.netconf.netconfSub.entity.NetconfDevice;
import com.dftools.netconf.netconfSub.netconf.Device;
import com.dftools.netconf.netconfSub.netconf.NetconfException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeviceConnectTestService {
    public static Boolean deviceConnectTest(NetconfDevice netconfDevice) {
        List<String> capabilities1 = new ArrayList<>();
        capabilities1.add("urn:ietf:params:netconf:base:1.0");
        try {
            Device deviceConn = Device.builder()
                    .hostName(netconfDevice.getIp())
                    .port(netconfDevice.getPort())
                    .userName(netconfDevice.getUsername())
                    .password(netconfDevice.getPassword())
                    .hostKeysFileName("hostKeysFileName")
                    .netconfCapabilities(capabilities1)
                    .build();
            deviceConn.connect();
            deviceConn.close();
        } catch (NetconfException e) {
            return false;
        }
        return true;
    }

    public static void main(String[] args) {
        NetconfDevice netconfDevice = new NetconfDevice();
        netconfDevice.setIp("127.0.0.1");
        netconfDevice.setPort(12345);
        netconfDevice.setUsername("admin");
        netconfDevice.setPassword("admin");
        Boolean flag = deviceConnectTest(netconfDevice);
        System.out.println(flag);
    }
}
