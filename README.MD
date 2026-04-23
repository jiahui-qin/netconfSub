# NetconfSub

This project can obtain the xml text by subscribing to the notification of the device that supports netconf and displaying it
## 依赖库
主要依赖以下开源库：

* [Juniper/netconf-java](https://github.com/Juniper/netconf-java): 连接至设备
* [PANTHEONtech/lighty-netconf-simulator](https://github.com/PANTHEONtech/lighty-netconf-simulator) 功能测试

## 使用方法：

1. 运行`NetconfSubApplication.java`
2. 运行`PANTHEONtech/lighty-netconf-simulator`中的[Notification device example](https://github.com/PANTHEONtech/lighty-netconf-simulator/blob/master/examples/devices/lighty-notifications-device/README.md)
3. 在`postman`中导入`./notification.postman_collection.json`
4. 订阅本地启动的模拟器或其他netconf设备，可以在console中看到notification的消息

## Q&A：
### Q：为什么要把结果使用`System.out.println`打印出来？

A: 已经把结果包装成了一个对象，可以按需将结果存储在数据库/展示给前端等。