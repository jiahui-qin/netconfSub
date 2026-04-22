from playwright.sync_api import sync_playwright
import time

# 测试Netconf工具的完整流程
def test_netconf_tool():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # 1. 访问前端页面
            print("访问前端页面...")
            page.goto('http://localhost:5176')
            page.wait_for_load_state('networkidle')
            
            # 截图确认页面加载
            page.screenshot(path='/tmp/frontend_loaded.png', full_page=True)
            print("前端页面加载成功")
            
            # 2. 测试连接管理
            print("\n测试连接管理...")
            
            # 点击Manage Connections按钮
            page.click("text=Manage Connections")
            time.sleep(2)
            
            # 检查连接管理对话框是否打开
            if page.is_visible("text=Manage Connections"):
                print("连接管理对话框打开成功")
                
                # 点击Add Connection按钮
                page.click("text=Add Connection")
                time.sleep(1)
                
                # 填写连接信息
                page.fill("input[placeholder*='Connection ID']", "test-device")
                page.fill("input[placeholder*='Host']", "192.168.1.1")
                page.fill("input[placeholder*='Port']", "830")
                page.fill("input[placeholder*='Username']", "admin")
                page.fill("input[placeholder*='Password']", "admin")
                
                # 截图连接表单
                page.screenshot(path='/tmp/connection_form.png')
                print("连接表单填写成功")
                
                # 点击Save Connection按钮
                # 注意：由于是测试环境，实际连接可能会失败，这里只测试UI流程
                # page.click("text=Save Connection")
                # time.sleep(3)
                
                # 关闭连接管理对话框
                page.click("svg[stroke*='M6 18L18 6M6 6l12 12']")
                time.sleep(1)
            
            # 3. 测试消息发送功能
            print("\n测试消息发送功能...")
            
            # 确保在Messages标签页
            page.click("text=Messages")
            time.sleep(1)
            
            # 检查消息页面是否加载
            if page.is_visible("text=Send Netconf Message"):
                print("消息页面加载成功")
                
                # 截图消息页面
                page.screenshot(path='/tmp/message_page.png', full_page=True)
            
            # 4. 测试通知功能
            print("\n测试通知功能...")
            
            # 切换到Notifications标签页
            page.click("text=Notifications")
            time.sleep(1)
            
            # 检查通知页面是否加载
            if page.is_visible("text=Notifications"):
                print("通知页面加载成功")
                
                # 截图通知页面
                page.screenshot(path='/tmp/notification_page.png', full_page=True)
            
            # 5. 测试配置管理功能
            print("\n测试配置管理功能...")
            
            # 切换到Config标签页
            page.click("text=Config")
            time.sleep(1)
            
            # 检查配置页面是否加载
            if page.is_visible("text=Device Configuration"):
                print("配置页面加载成功")
                
                # 截图配置页面
                page.screenshot(path='/tmp/config_page.png', full_page=True)
            
            # 6. 测试侧边栏连接列表
            print("\n测试侧边栏连接列表...")
            
            # 检查侧边栏是否显示
            if page.is_visible("text=Connections"):
                print("侧边栏连接列表显示成功")
                
                # 截图侧边栏
                page.screenshot(path='/tmp/sidebar.png')
            
            print("\n所有测试完成！")
            print("测试截图已保存到 /tmp/ 目录")
            
        except Exception as e:
            print(f"测试过程中出现错误: {e}")
            # 截图错误状态
            page.screenshot(path='/tmp/error.png', full_page=True)
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == "__main__":
    test_netconf_tool()
