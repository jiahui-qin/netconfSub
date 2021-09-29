package com.pcl.tsn.topology.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jcraft.jsch.Channel;
import com.pcl.tsn.device.inventory.feign.IDeviceClient;
import com.pcl.tsn.device.inventory.vo.DeviceDetailVo;
import com.pcl.tsn.topology.constant.NetconfString;
import com.pcl.tsn.topology.entity.Link;
import com.pcl.tsn.topology.mapper.LinkMapper;
import com.pcl.tsn.topology.netconf.Device;
import com.pcl.tsn.topology.netconf.NetconfException;
import com.pcl.tsn.topology.netconf.XML;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.TextMessage;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThreadPoolImpl {
    List<DeviceDetailVo> DeviceList;
    LinkMapper linkMapper;
    @Autowired
    private IDeviceClient deviceClient;


    public ThreadPoolImpl() throws NetconfException {
        /*
        先获取设备列表，然后生成Device对象，将这些对象置于testNotice中，启动一个线程来执行。
        */
        ExecutorService es = Executors.newFixedThreadPool(6);
        log.info("get device " + device.getAlias());
        List<String> capabilities = new ArrayList<>();
        capabilities.add("urn:ietf:params:netconf:base:1.0");
        Device deviceConn = Device.builder()
                .hostName(device.getManagementIp())
                .deviceName(device.getAlias())
                .port(device.getManagementPort())
                .userName("admin")
                .password("admin")
                .hostKeysFileName("hostKeysFileName")
                .netconfCapabilities(capabilities)
                .build();
        es.execute(new testNotice(deviceConn));
    }

    public static void main(String[] args) throws DocumentException {
        String string = "<notification xmlns=\"urn:ietf:params:xml:ns:netconf:notification:1.0\"><eventTime>2020-01-02T23:23:12Z</eventTime><lldp-neighbor-status-change xmlns=\"urn:pcl:params:xml:ns:yang:pcl-lldp\"><lldp-neighbor><event-type>add</event-type><local-port>ge2</local-port><remote-index>00808000fc03474532</remote-index><peer-device><chassis-id-sub-type>MAC_ADDRESS</chassis-id-sub-type><chassis-id>00:80:80:00:fc:03</chassis-id><port-id-sub-type>INTERFACE_NAME</port-id-sub-type><port-id>GE2</port-id><port-description>GE2</port-description><system-name>TSN-4</system-name><system-description>PCL TSN Operating System\n" +
                " TOS Software version V00R00S26_MBTSNA0\n" +
                "Copyright (c) 2019-2020 PCL., Ltd.\n" +
                "TSN-testing\n" +
                "</system-description><system-cap-supported>772</system-cap-supported><system-cap-enabled>772</system-cap-enabled></peer-device></lldp-neighbor></lldp-neighbor-status-change></notification>]]>]]>";
        System.out.println(parseXML(string));
    }

    private void getNotifications(Device device) throws IOException, SAXException {
        //TODO:增加连接状态的检测，重连等功能
        Device deviceConn = device;
        deviceConn.connect();
        String SubscribeString = NetconfString.lldpstring;
        XML rpc_reply = deviceConn.executeRPC(SubscribeString);
        System.out.println(deviceConn.getHostName() + rpc_reply.toString());
        //TODO:添加订阅成功的检测
        Channel chn = deviceConn.getSshChannel();
        InputStream inputStream = chn.getInputStream();
        try {
            //循环读取
            byte[] buffer = new byte[1024];
            int i = 0;
            //如果没有数据来，线程会一直阻塞在这个地方等待数据。
            while ((i = inputStream.read(buffer)) != -1) {
                TextMessage textMessage = new TextMessage(buffer);
                System.out.println("i got a topo change from" + deviceConn.getHostName());
                String xmlString = textMessage.getPayload();
                System.out.println(xmlString)
            }

        } finally {
            //断开连接后关闭会话
            deviceConn.close();
            if (inputStream != null) {
                inputStream.close();
            }
        }
    }

    public class testNotice implements Runnable {

        private Device device;

        public testNotice(Device device) {
            this.device = device;
        }

        @SneakyThrows
        @Override
        public void run() {
            getNotifications(device);
        }
    }


}
