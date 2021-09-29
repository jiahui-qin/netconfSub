package com.dftools.netconf.netconfSub.service;

import com.dftools.netconf.netconfSub.netconf.XML;
import com.dftools.netconf.netconfSub.entity.DeviceResponse;
import com.dftools.netconf.netconfSub.entity.NetconfDevice;
import com.dftools.netconf.netconfSub.netconf.Device;
import com.jcraft.jsch.Channel;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class NotificationService implements Runnable {


    public static void main(String[] args) throws Exception {
        NetconfDevice netconfDevice = new NetconfDevice();
        netconfDevice.setIp("127.0.0.1");
        netconfDevice.setPort(12345);
        netconfDevice.setUsername("admin");
        netconfDevice.setPassword("admin");
        netconfDevice.setXml(" <create-subscription xmlns=\"urn:ietf:params:xml:ns:netconf:notification:1.0\"></create-subscription>");
        getNotifications(netconfDevice);
    }

    public static void getNotifications(NetconfDevice netconfDevice) {
        Thread.currentThread().setName(netconfDevice.getIp() + ":" + netconfDevice.getDevName());
        //TODO:增加连接状态的检测，重连等功能
        try {
            List<String> capabilities1 = new ArrayList<>();
            capabilities1.add("urn:ietf:params:netconf:base:1.0");
            Device deviceConn = Device.builder()
                    .hostName(netconfDevice.getIp())
                    .port(netconfDevice.getPort())
                    .userName(netconfDevice.getUsername())
                    .password(netconfDevice.getPassword())
                    .hostKeysFileName("hostKeysFileName")
                    .netconfCapabilities(capabilities1)
                    .build();
            deviceConn.connect();
            XML rpc_reply = deviceConn.executeRPC(netconfDevice.getXml());
            System.out.println(deviceConn.getHostName() + rpc_reply.toString());
            //TODO:添加订阅成功的检测
            Channel chn = deviceConn.getSshChannel();
            InputStream inputStream = chn.getInputStream();
            try {
                //循环读取
                byte[] buffer = new byte[10240];
                int i = 0;
                //如果没有数据来，线程会一直阻塞在这个地方等待数据。
                while ((i = inputStream.read(buffer)) != -1) {
                    TextMessage textMessage = new TextMessage(buffer);
                    DeviceResponse deviceResponse = new DeviceResponse();
                    deviceResponse.setDevice(netconfDevice.getIp() + ":" + netconfDevice.getDevName());
                    deviceResponse.setXmlResponse(textMessage.getPayload());
                    deviceResponse.setTime(LocalDateTime.now());
                    deviceResponse.setSubThreadName(Thread.currentThread().getName());
                    deviceResponse.setSubThreadId(Thread.currentThread().getId());
                    System.out.println(deviceResponse);
                }

            } finally {
                //断开连接后关闭会话
                deviceConn.close();
                if (inputStream != null) {
                    inputStream.close();
                }
            }
        } catch (IOException e) {
            System.out.println("get ioe");
        } catch (SAXException e) {
            System.out.println("get sax");
        }
    }

    private NetconfDevice netconfDevice;

    public void setNetconfDevice(NetconfDevice netconfDevice) {
        this.netconfDevice = netconfDevice;
    }

    @Override
    public void run() {
        getNotifications(netconfDevice);
    }
}
