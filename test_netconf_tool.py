from playwright.sync_api import sync_playwright

# 测试Netconf工具的完整功能
def test_netconf_tool():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 访问前端页面
        page.goto('http://localhost:5176')
        page.wait_for_load_state('networkidle')
        
        # 截图检查页面加载
        page.screenshot(path='/workspace/test_screenshots/initial_page.png', full_page=True)
        print("初始页面加载完成")
        
        # 测试消息页面
        print("测试消息页面...")
        page.click('text=Messages')
        page.wait_for_timeout(1000)
        
        # 截图消息页面
        page.screenshot(path='/workspace/test_screenshots/message_page.png', full_page=True)
        
        # 测试通知页面
        print("测试通知页面...")
        page.click('text=Notifications')
        page.wait_for_timeout(1000)
        
        # 截图通知页面
        page.screenshot(path='/workspace/test_screenshots/notification_page.png', full_page=True)
        
        # 测试配置页面
        print("测试配置页面...")
        page.click('text=Config')
        page.wait_for_timeout(1000)
        
        # 截图配置页面
        page.screenshot(path='/workspace/test_screenshots/config_page.png', full_page=True)
        
        # 测试连接管理
        print("测试连接管理...")
        page.click('text=Manage Connections')
        page.wait_for_timeout(1000)
        
        # 截图连接管理界面
        page.screenshot(path='/workspace/test_screenshots/connection_manager.png', full_page=True)
        
        # 检查控制台日志
        print("检查控制台日志...")
        # 捕获控制台日志
        console_logs = []
        def log_handler(msg):
            console_logs.append(msg.text)
        
        page.on('console', log_handler)
        
        # 等待一段时间让日志收集
        page.wait_for_timeout(2000)
        
        for log in console_logs:
            print(f"Console: {log}")
        
        # 关闭浏览器
        browser.close()
        print("测试完成")

if __name__ == "__main__":
    # 创建截图目录
    import os
    if not os.path.exists('/workspace/test_screenshots'):
        os.makedirs('/workspace/test_screenshots')
    
    test_netconf_tool()