# GitHub Actions - 自动构建和发布说明

本项目配置了完整的 GitHub Actions CI/CD 流水线，可以在代码更新后自动：

1. 🐳 构建和发布 Docker 镜像到 GitHub Packages (ghcr.io)
2. 📦 构建 Windows 和 Linux 的可执行文件
3. 🚀 在打标签时自动创建 GitHub Release

## 📋 功能特性

### 自动触发事件

- **推送到 main/master 分支**：自动构建 Docker 镜像和可执行文件
- **创建标签 (v*)**：自动创建完整的 GitHub Release
- **PR 合并**：执行构建测试
- **手动触发**：在 GitHub 界面手动运行工作流

### 构建的产物

| 产物 | 平台 | 位置 |
|------|------|------|
| Docker 镜像 | Linux | ghcr.io/用户名/netconf-tool |
| 可执行文件 | Windows | GitHub Release |
| 可执行文件 | Linux | GitHub Release |

## 🚀 快速开始

### 1. 第一次使用

1. 确保仓库已启用 GitHub Packages 和 Actions
2. 推送代码到 `main` 或 `master` 分支
3. 或者创建并推送一个版本标签：

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 2. 手动触发

在 GitHub 仓库页面：
1. 点击 "Actions" 标签
2. 选择 "Build and Release Netconf Tool"
3. 点击 "Run workflow"
4. 选择分支并运行

## 📦 访问和使用构建产物

### Docker 镜像

拉取和运行镜像：

```bash
# 拉取最新版本
docker pull ghcr.io/用户名/netconf-tool:latest

# 或者指定版本
docker pull ghcr.io/用户名/netconf-tool:v1.0.0

# 运行容器
docker run -d -p 3001:3001 --name netconf-tool ghcr.io/用户名/netconf-tool:latest
```

访问应用：http://localhost:3001

### 可执行文件

1. 访问仓库的 "Releases" 页面
2. 下载对应平台的可执行文件
3. 解压并运行

Windows:
```cmd
netconf-tool-win-x64.exe
```

Linux:
```bash
chmod +x netconf-tool-linux
./netconf-tool-linux
```

## 🔧 配置说明

### 工作流文件

- [.github/workflows/build-release.yml](file:///workspace/.github/workflows/build-release.yml) - 主工作流（推荐）
- [.github/workflows/release.yml](file:///workspace/.github/workflows/release.yml) - 备选工作流

### 权限设置

确保 GitHub Actions 有以下权限：

1. **仓库权限**：
   - `packages: write` - 写入 GitHub Packages
   - `contents: write` - 创建 Releases
   - `contents: read` - 读取代码

2. 在仓库设置中启用：
   - Settings > Actions > General
   - 确保 "Allow GitHub Actions to create and approve pull requests" 已启用
   - Workflow permissions 设为 "Read and write permissions"

### 环境变量

工作流使用以下变量（自动设置）：

| 变量 | 说明 |
|------|------|
| REGISTRY | ghcr.io |
| IMAGE_NAME | 仓库名称 |
| GITHUB_TOKEN | 自动认证令牌 |

## 📊 工作流结构

### Jobs 说明

#### 1. build-docker
- 运行在 Ubuntu
- 构建多阶段 Docker 镜像
- 推送到 GitHub Packages
- 自动打标签（分支名、版本号、SHA）

#### 2. build-executables
- 使用矩阵策略（Matrix Strategy）
- 同时构建 Windows 和 Linux 版本
- 打包前端资源到可执行文件
- 上传构建产物

#### 3. create-release (仅标签)
- 依赖前面两个 job 完成
- 下载所有构建产物
- 创建 GitHub Release
- 附加可执行文件到 Release

## 🎯 使用建议

### 版本发布流程

建议的版本发布流程：

```bash
# 1. 确保代码在 main 分支
git checkout main
git pull origin main

# 2. 运行测试（如果有的话）
npm run test

# 3. 创建并推送标签
git tag -a v1.0.0 -m "Release v1.0.0 - 新增心跳功能"
git push origin v1.0.0

# 4. 等待 GitHub Actions 完成构建
# 查看 Actions 页面监控进度
```

### 分支策略

- **main/master** - 主开发分支，每次推送都会构建
- **feature/* 或 pull requests** - 仅运行测试构建
- **tags (v*)** - 正式发布，创建完整 Release

## 🔍 监控和调试

### 查看构建日志

1. 进入仓库的 Actions 页面
2. 选择对应的工作流运行
3. 点击各个 job 查看详细日志

### 常见问题

**Docker 推送失败**
- 检查是否启用 GitHub Packages
- 确认权限设置正确
- 检查 $GITHUB_TOKEN 是否有写入权限

**pkg 打包失败**
- 确保 Node.js 版本匹配（v20）
- 检查依赖是否完整安装
- 查看 Actions 中的构建日志

**Release 未创建**
- 确认 tag 格式符合 `v*` 模式
- 检查 job 依赖是否成功完成
- 确认有 `contents: write` 权限

## 📝 自定义配置

### 修改构建平台

编辑 [build-release.yml](file:///workspace/.github/workflows/build-release.yml) 中的 matrix：

```yaml
matrix:
  os: [ubuntu-latest, windows-latest, macos-latest]
```

### 调整 Docker 标签

修改 docker/metadata-action 配置：

```yaml
tags: |
  type=semver,pattern={{version}}
  type=raw,value=stable
```

### 添加更多检查

在 build-executables 之前添加测试步骤：

```yaml
- name: Run tests
  run: npm run test
```

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [GitHub Packages 文档](https://docs.github.com/cn/packages)
- [Docker 官方文档](https://docs.docker.com/)
- [pkg GitHub 仓库](https://github.com/vercel/pkg)

## 🆘 获取帮助

如遇到问题：

1. 查看 Actions 日志中的错误信息
2. 检查仓库设置和权限
3. 参考本文档的常见问题部分
4. 查阅相关官方文档
