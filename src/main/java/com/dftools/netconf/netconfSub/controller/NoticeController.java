package com.dftools.netconf.netconfSub.controller;

import com.dftools.netconf.netconfSub.entity.NetconfDevice;
import com.dftools.netconf.netconfSub.service.DeviceConnectTestService;
import com.dftools.netconf.netconfSub.service.NotificationService;
import com.dftools.netconf.netconfSub.tool.api.R;
import com.dftools.netconf.netconfSub.service.NotificationPoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class NoticeController {

    @Autowired
    DeviceConnectTestService deviceConnectTestService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    NotificationPoolService notificationPoolService;

    @PostMapping("/test")
    public R<Boolean> testDevice(@RequestBody NetconfDevice netconfDevice) {
        System.out.println(netconfDevice);
        return R.status(DeviceConnectTestService.deviceConnectTest(netconfDevice));
    }

    @PostMapping("/sub")
    public R<String> getNotifications(@RequestBody NetconfDevice netconfDevice) {
        try {
            String s = notificationPoolService.addTask(netconfDevice);
            return R.data(s);
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/getSubState")
    public R<String> getNotificationState(@RequestBody NetconfDevice netconfDevice) {
        try {
            String state = notificationPoolService.getThread(netconfDevice);
            return R.data(state);
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @PostMapping("/interruptSub")
    public R<String> interruptSub(@RequestBody NetconfDevice netconfDevice) {
        try {
            String state = notificationPoolService.interruptSub(netconfDevice);
            return R.data(state);
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }

    @GetMapping("/getAllSubStatus")
    public R<Map<String, String>> getAllSubStatus() {
        try {
            Map<String, String> state = notificationPoolService.getAllSubStatus();
            return R.data(state);
        } catch (Exception e) {
            return R.fail(e.getMessage());
        }
    }
}
