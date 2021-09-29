# NETCONF NOTICE

在这里计划写一个工具可以连接至设备并监听设备的notification

测试的话使用开源项目[lighty-netconf-simulator](https://github.com/PANTHEONtech/lighty-netconf-simulator)

测试流程如下：

1. 启动lighty-netconf-simulator的Notification device example项目，打开一个cmd窗口连接至Notification device example所启动的netconf device

2. 打开本项目，输入此netconf device的信息，发送消息订阅xml

3. cmd窗口发送xml产生notification

4. 验证

