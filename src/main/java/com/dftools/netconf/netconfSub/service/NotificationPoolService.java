package com.dftools.netconf.netconfSub.service;

import com.dftools.netconf.netconfSub.entity.NetconfDevice;
import lombok.Synchronized;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;


@Service
public class NotificationPoolService implements ApplicationRunner {

    @Autowired
    NotificationService notificationService;

    private final ArrayList<NetconfDevice> reqTask;
    private final ArrayList<NetconfDevice> runningTask;

    @Value("${parameter.maxThreadSize}")
    private Integer maxThreadSize;

    public NotificationPoolService() {
        reqTask = new ArrayList<>();
        runningTask = new ArrayList<>();
    }

    public String addTask(NetconfDevice netconfDevice) {

        if (runningTask.size() == maxThreadSize ){
            return "max sub thread!";
        }
        String threadName = netconfDevice.getIp() + ":" + netconfDevice.getDevName();
        for (NetconfDevice device : runningTask) {
            if (threadName.equals(device.getIp() + ":" +device.getDevName())){
                return "duplicated task!";
            }
        }
        reqTask.add(netconfDevice);
        return "add task success";
    }

    public Map<String, String> getAllSubStatus() {
        Map<String, String> res = new HashMap<>();
        runningTask.forEach(netconfDevice -> {
            String netconfStatus = getThread(netconfDevice);
            res.put(netconfDevice.getIp() + ":" + netconfDevice.getDevName(), netconfStatus);
        });
        return res;
    }

    public String getThread(NetconfDevice netconfDevice) {
        String threadName = netconfDevice.getIp() + ":" + netconfDevice.getDevName();
        for (Thread key : Thread.getAllStackTraces().keySet()) {
            if (key.getName().equals(threadName)) {
                Thread.State state = key.getState();
                switch (state) {
                    case TIMED_WAITING:
                        return "time_waiting";
                    case NEW:
                        return  "new";
                    case BLOCKED:
                        return  "blocked";
                    case WAITING:
                        return "waiting";
                    case RUNNABLE:
                        return "runnable";
                    case TERMINATED:
                        return "terminated";
                }
            }
        }
        return threadName + " not find";
    }

    public String interruptSub(NetconfDevice netconfDevice) {
        String threadName = netconfDevice.getIp() + ":" + netconfDevice.getDevName();
        runningTask.removeIf(dev -> threadName.equals(dev.getIp() + ":" + dev.getDevName()));
        for (Thread key : Thread.getAllStackTraces().keySet()) {
            if (key.getName().equals(threadName)) {
                key.interrupt();
                return "interrupt success";
            }
        }
        return "not find thread: " + threadName;
    }

    @Override
    @Synchronized
    public void run(ApplicationArguments args) throws Exception {
        while (true) {
            if (!reqTask.isEmpty()) {
                System.out.println(reqTask + "!!!!!!!!!!");
                NetconfDevice netconfDevice = reqTask.remove(0);
                System.out.println("now run task: " + netconfDevice.getIp() + ":" + netconfDevice.getDevName());
                NotificationService notificationService = new NotificationService();
                notificationService.setNetconfDevice(netconfDevice);
                Thread t = new Thread(notificationService);
                t.start();
                runningTask.add(netconfDevice);
                System.out.println("thread start");
                if (Thread.currentThread().isInterrupted()) {
                    break;
                }
                Thread.sleep(200);
            }

        }
    }
}
