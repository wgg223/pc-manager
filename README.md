# 老王的维护宝

一个基于 Electron + Vue 3 的桌面应用程序，提供电脑定时任务和系统维护功能。

## 下载安装

前往 [Releases](https://github.com/wgg223/pc-manager/releases) 页面下载最新版本安装程序。

## 功能特性

- **定时任务**: 设置电脑定时重启、关机或休眠
- **磁盘清理**: 清理临时文件、系统缓存和回收站
- **系统信息**: 查看 CPU、内存、磁盘、显卡、主板等详细信息
- **进程管理**: 查看和管理系统运行进程
- **启动项管理**: 管理开机自启动程序
- **网络重置**: 重置 DNS、Winsock、IP 地址
- **软件卸载**: 查看和卸载已安装软件
- **壁纸更换**: 设置桌面壁纸
- **自定义页面**: 自定义功能卡片布局
- **控制台**: 执行系统命令，查看实时输出

## 技术栈

- Electron
- Vue 3
- Vite
- Element Plus
- systeminformation

## 开发

```bash
npm install
npm run electron:dev
```

## 打包

```bash
npm run electron:build
```

打包后的安装程序将在 `build-output` 目录中。

## 项目结构

```
pc-manager/
├── electron/          # Electron 主进程
│   ├── main.js       # 主进程入口
│   └── preload.js    # 预加载脚本
├── src/               # Vue 前端源码
│   ├── views/        # 页面组件
│   ├── router/       # 路由配置
│   └── main.js       # Vue 入口
├── package.json
└── vite.config.js
```

## 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

你可以在 [LICENSE](LICENSE) 文件中查看完整的许可证文本。

版权声明：Copyright (c) 2026 wgg223

简要说明：在遵守许可证要求的前提下，你可以自由使用、复制、修改和分发本项目。
