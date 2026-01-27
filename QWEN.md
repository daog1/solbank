# SolBank 项目目标

## 项目概述
SolBank 是一个基于 Solana 区块链的去中心化银行协议，旨在提供高效的代币存款、取款和其他金融服务。

## 核心功能
- 代币存款功能：允许用户将各种 SPL 代币存入协议
- 代币取款功能：允许用户从协议中提取代币
- 支持多种代币类型：包括 USDT 等主流代币
- 高效的本地测试环境：使用 SurfPool 进行快速开发和测试

## 技术栈
- **区块链平台**: Solana
- **智能合约语言**: Rust
- **客户端框架**: Anchor Framework
- **测试工具**: SurfPool, LiteSVM
- **构建工具**: Just (for command automation)

## 项目结构
- `programs/`: Solana 智能合约源代码
- `tests/`: 测试代码
- `scripts/`: 自动化脚本（设置账户、代币操作等）
- `app/`: 应用层代码（如有）
- `doc/`: 项目文档
- `runbooks/`: 部署和运行手册

## 开发流程
1. 使用 `surfpool start` 启动本地开发环境
2. 通过 `just` 命令执行各种开发任务
3. 编写并运行测试确保代码质量
4. 使用 `anchor deploy` 部署到目标网络

## 测试策略
- 使用 SurfPool 的作弊码功能快速设置测试状态
- 通过 `surfnet_setAccount` 和 `surfnet_setTokenAccount` 设置账户数据
- 利用时间旅行功能测试时间相关逻辑
- 全面的单元测试和集成测试

## 未来发展
- 扩展更多金融产品和服务
- 优化用户体验和安全性
- 集成更多 DeFi 协议和功能
- 提高可扩展性和性能