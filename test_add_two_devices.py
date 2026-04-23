from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    # 启动浏览器
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # 导航到前端应用
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    
    # 等待页面加载完成
    time.sleep(2)
    
    # 截图：初始页面
    page.screenshot(path='/workspace/test/screenshots/01_initial_page.png', full_page=True)
    
    # 点击 "Manage Devices" 按钮
    page.click('text=Manage Devices')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    
    # 截图：设备管理页面
    page.screenshot(path='/workspace/test/screenshots/02_device_manager.png', full_page=True)
    
    # 点击 "Add New Device" 按钮
    page.click('text=Add New Device')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    
    # 截图：添加设备表单
    page.screenshot(path='/workspace/test/screenshots/03_add_device_form.png', full_page=True)
    
    # 填写第一个设备信息
    page.fill('input[placeholder="e.g., router-main"]', 'test-device-1')
    page.fill('input[placeholder="192.168.1.1"]', '192.168.1.103')
    page.fill('input[placeholder="admin"]', 'admin')
    page.fill('input[placeholder="••••••••"]', 'password123')
    
    # 截图：填写第一个设备信息
    page.screenshot(path='/workspace/test/screenshots/04_first_device_info.png', full_page=True)
    
    # 点击 "Add Device" 按钮
    page.click('text=Add Device')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # 截图：添加第一个设备后
    page.screenshot(path='/workspace/test/screenshots/05_first_device_added.png', full_page=True)
    
    # 点击 "Cancel Adding" 按钮（如果显示）
    try:
        page.click('text=Cancel Adding')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
    except:
        pass
    
    # 再次点击 "Add New Device" 按钮
    page.click('text=Add New Device')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    
    # 填写第二个设备信息
    page.fill('input[placeholder="e.g., router-main"]', 'test-device-2')
    page.fill('input[placeholder="192.168.1.1"]', '192.168.1.104')
    page.fill('input[placeholder="admin"]', 'admin')
    page.fill('input[placeholder="••••••••"]', 'password123')
    
    # 截图：填写第二个设备信息
    page.screenshot(path='/workspace/test/screenshots/06_second_device_info.png', full_page=True)
    
    # 点击 "Add Device" 按钮
    page.click('text=Add Device')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # 截图：添加第二个设备后
    page.screenshot(path='/workspace/test/screenshots/07_second_device_added.png', full_page=True)
    
    # 关闭浏览器（直接关闭，不点击关闭按钮）
    browser.close()
    
    print("测试完成，已添加两个设备")
