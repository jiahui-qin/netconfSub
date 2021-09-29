# NetconfSub

This project can obtain the xml text by subscribing to the notification of the device that supports netconf and displaying it

## 项目概述

NETCONF NOTICE工具可以连接至设备并监听设备的notification，支持以下功能：
- 设备管理（添加、测试连接、连接/断开）
- RPC请求发送和响应接收
- 通知订阅和历史记录查看
- 配置管理和历史记录

## 技术栈

### 后端
- Java
- Spring Boot
- [Juniper/netconf-java](https://github.com/Juniper/netconf-java): 连接至设备
- [PANTHEONtech/lighty-netconf-simulator](https://github.com/PANTHEONtech/lighty-netconf-simulator) 功能测试

### 前端
- React
- Vite
- Tailwind CSS
- Socket.io

## 依赖库
主要依赖以下开源库：

* [Juniper/netconf-java](https://github.com/Juniper/netconf-java): 连接至设备
* [PANTHEONtech/lighty-netconf-simulator](https://github.com/PANTHEONtech/lighty-netconf-simulator) 功能测试

## 使用方法：

1. 运行`NetconfSubApplication.java`启动后端服务
2. 运行`PANTHEONtech/lighty-netconf-simulator`中的[Notification device example](https://github.com/PANTHEONtech/lighty-netconf-simulator/blob/master/examples/devices/lighty-notifications-device/README.md)
3. 启动前端服务：
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. 在浏览器中打开前端页面，添加设备并测试连接
5. 订阅设备通知，然后在模拟器中发送通知
6. 在前端页面查看接收到的通知

## 测试流程

1. 启动lighty-netconf-simulator的Notification device example项目
2. 打开前端页面，输入netconf device的信息
3. 测试连接并连接设备
4. 发送消息订阅xml
5. 在模拟器的cmd窗口发送xml产生notification
6. 在前端页面验证接收到的通知

## 传统测试方法（Postman）

1. 运行`NetconfSubApplication.java`
2. 运行`PANTHEONtech/lighty-netconf-simulator`中的[Notification device example](https://github.com/PANTHEONtech/lighty-netconf-simulator/blob/master/examples/devices/lighty-notifications-device/README.md)
3. 在`postman`中导入`./notification.postman_collection.json`
4. 订阅本地启动的模拟器或其他netconf设备，可以在console中看到notification的消息

## Q&A：
### Q：为什么要把结果使用`System.out.println`打印出来？

A: 已经把结果包装成了一个对象，可以按需将结果存储在数据库/展示给前端等。
