# Course 8: Solana 测试工具 课程规划

## 课程目标
- 理解 Solana 生态系统中三种主要测试工具（LiteSVM、SurfPool、Mollusk）的特点、优势和适用场景。
- 掌握每种工具的基本使用方法和配置方式。
- 能够根据项目需求选择合适的测试工具。

## 课程结构

### 1. 引言
- **背景介绍**: Solana 智能合约测试的重要性与挑战。
- **现有测试方案概述**: 传统方法（如本地集群或模拟器）的局限性。
- **新工具的优势**: 介绍 LiteSVM、SurfPool、Mollusk 如何提供更高效、更精确的测试环境。
- **官方资源链接**:
  - [LiteSVM](https://github.com/LiteSVM/litesvm)
  - [SurfPool](https://github.com/txtx/surfpool) (由 txtx 维护)
  - [Mollusk](https://github.com/anza-xyz/mollusk)
  - [sbpf](https://github.com/anza-xyz/sbpf) (SBPF runtime, used by LiteSVM and Mollusk)

### 2. 工具概览
- **LiteSVM 简介**: 高性能的嵌入式 Solana 运行时，基于 `sbpf` (https://github.com/anza-xyz/sbpf)。
- **Mollusk 简介**: 专注于 Rust 程序单元测试的轻量级框架，同样基于 `sbpf`。
- **SurfPool 简介**: 基于 LiteSVM 构建的完整本地开发环境，提供标准 RPC 接口和高级开发者工具。
- **三者关系**: SurfPool 利用 LiteSVM 作为底层 SVM 实现，提供更丰富的功能。

### 3. 工具对比与选择指南
- **功能对比表**: 对比 LiteSVM、SurfPool、Mollusk 在性能、易用性、功能覆盖等方面的异同。
  - **LiteSVM**: 嵌入式、高性能的 Rust 测试库，直接在测试进程中运行 SVM。
  - **SurfPool**: 基于 LiteSVM 构建的完整本地开发环境，提供标准 RPC 接口和高级开发者工具。
  - **Mollusk**: 专注于简化 Rust 程序单元测试的轻量级库。
- **场景推荐**:
  - 单元测试: Mollusk, LiteSVM
  - 集成测试: LiteSVM, SurfPool
  - E2E 测试: SurfPool
  - 性能测试: LiteSVM
  - 需要完整 RPC 功能和高级工具: SurfPool
  - 纯 Rust 逻辑快速验证: Mollusk, LiteSVM
- **开发者语言栈选择指南**:
  - **Rust 程序开发者**:
    - **首选单元/集成测试**: **LiteSVM** 或 **Mollusk**。两者都与 Rust 生态紧密集成，提供快速的反馈循环。LiteSVM 功能更全面，Mollusk 更加轻量和简单。
    - **首选 E2E 测试**: **SurfPool**。它提供了标准的 RPC 接口，可以用 Rust 客户端代码进行端到端测试，模拟最接近生产环境的行为。
  - **TypeScript/JavaScript 客户端开发者**:
    - **首选测试方案**: **SurfPool**。由于其标准的 JSON-RPC 接口，可以无缝对接 `@solana/web3.js` 或 `@coral-xyz/anchor` 等客户端库，非常适合进行客户端逻辑和 E2E 测试。
- **最佳实践**: 结合使用不同工具的策略。例如，使用 Mollusk/LiteSVM 进行快速的程序逻辑单元测试，使用 SurfPool 进行更复杂的集成和 E2E 测试。

### 4. 实战案例：在 daog1/solbank 中使用 SurfPool 特性
- **项目背景**: 介绍 `daog1/solbank` 项目及其测试需求。
- **SurfPool 核心特性**:
  - **设置账户数据**: 如何使用 SurfPool 的功能在测试前预设账户状态（如用户余额、程序数据等）。
  - **设置 Token 数据**: 如何预设 SPL Token 账户的状态，包括代币种类、数量等。
  - **时间旅行 (Time Travel)**: 如何利用 SurfPool 的时间旅行功能，模拟不同的时间点或区块高度，测试与时间相关的逻辑（如锁仓、解锁、利息计算等）。
- **运行测试**:
  - **启动 SurfPool**: 如何使用 `just` 命令（例如 `just surfpool-up`）启动本地测试环境。
  - **执行测试**: 如何运行 `just test` 或类似的 `just` 命令来执行测试套件。
  - **观察结果**: 分析测试输出，验证程序行为是否符合预期。
- **优势体现**: 对比传统 `solana-test-validator`，展示 SurfPool 在模拟复杂状态和时间相关逻辑方面的强大能力。

### 5. 总结与展望
- **回顾要点**: 重申三种工具的核心价值和应用场景。
- **未来趋势**: Solana 测试生态的发展方向。

## 教学方法
- **理论讲解**: 结合官方文档和社区资源，清晰阐述概念。
- **代码演示**: 每个工具都提供实际的代码示例，展示其基本用法。
- **互动讨论**: 鼓励提问，探讨特定场景下的工具选择。
- **动手实验**: （如果时间允许）引导学员在本地尝试搭建和运行简单的测试。

## 准备材料
- 每个工具的官方文档链接。
- `daog1/solbank` 仓库的本地副本，包含 `txtx.yml`, `Anchor.toml`, `tests/` 目录等相关文件。
- SurfPool 与 LiteSVM 关系的相关说明（来自 txtx/surfpool 仓库）。
- 预先准备好的简单 Solana 程序示例（如 Counter 程序），用于演示不同工具的测试方法。
- 一个包含所有示例代码的仓库或代码片段集合。