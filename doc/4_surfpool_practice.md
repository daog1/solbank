# 4. 实战案例：在 daog1/solbank 中使用 SurfPool 特性

本章节将详细介绍如何在 daog1/solbank 项目中实际应用 SurfPool 的各项特性。通过具体的代码示例和操作步骤，帮助开发者更好地理解和运用这些功能。

## 4.1 SurfPool 简介

SurfPool 是一个为 Solana 区块链开发提供的本地开发环境和测试工具。它基于 LiteSVM 构建，提供了标准的 RPC 接口和高级开发者工具，包括作弊码（cheatcodes）、时间旅行等功能，可以显著提升 Solana 程序的开发和测试效率。

## 4.2 在 solbank 项目中集成 SurfPool

### 4.2.1 项目结构

首先，让我们了解 solbank 项目的整体结构：

```
solbank/
├── app/
│   ├── src/
│   │   ├── lib.rs
│   │   └── ...
├── programs/
│   └── solbank/
│       ├── src/
│       │   ├── lib.rs
│       │   └── ...
├── runbooks/
│   └── deployment/
│       ├── main.tx
│       └── ...
├── scripts/
│   ├── setup-usdt-account.ts
│   └── setup-usdt-balance.ts
├── Cargo.toml
├── package.json
├── txtx.yml
└── ...
```

## 4.3 SurfPool 核心特性应用

### 4.3.1 作弊码（Cheatcodes）- 设置账户数据

SurfPool 提供了强大的作弊码功能，可以在测试环境中直接设置账户状态。在 `scripts/setup-usdt-account.ts` 中展示了如何使用 `surfnet_setAccount` 作弊码：

```typescript
// 设置代币账户余额
await (connection as any)._rpcRequest("surfnet_setAccount", [
  ata.toBase58(),
  {
    lamports: rentExempt,
    data: tokenAccountData.toString("hex"),
    owner: TOKEN_PROGRAM_ID.toString(),
    executable: false,
  },
]);
```

在 `scripts/setup-usdt-balance.ts` 中展示了如何使用 `surfnet_setTokenAccount` 作弊码：

```typescript
// 设置代币账户余额
const result = await (connection as any)._rpcRequest(
  "surfnet_setTokenAccount",
  [
    userKeypair.publicKey,
    mint.toBase58(), // mint
    { amount: amount }, // update
    TOKEN_PROGRAM_ID.toBase58(), // token program
  ]
);
```

### 4.3.2 时间旅行功能

SurfPool 的时间旅行功能可以直接通过本地网页界面完成。开发者可以通过 SurfPool Studio 的 Web UI 界面来模拟不同的时间点或区块高度，这对于测试与时间相关的逻辑（如锁仓、解锁、利息计算等）非常有用。

## 4.4 存取 USDT 功能

### 4.4.1 存款和取款命令

solbank 程序支持存款和取款功能，允许用户将代币存入协议或从中提取。这些命令定义在项目的 `Justfile` 中，可通过以下命令执行：

```bash
# 存款操作，需要提供代币的 mint 地址
just deposit-token <mint_address>

# 取款操作，需要提供代币的 mint 地址
just withdraw-token <mint_address>

# 专门针对 USDT 的存款操作
just deposit-usdt

# 专门针对 USDT 的取款操作
just withdraw-usdt
```

### 4.4.2 预设账户状态

在进行存取操作之前，可以使用脚本预设账户状态。这些命令同样定义在 `Justfile` 中：

```bash
# 设置 USDT 账户
just setup-usdt-account <amount>

# 设置 USDT 余额
just setup-usdt-balance
```

## 4.5 启动 SurfPool

使用以下命令启动 SurfPool：

```bash
surfpool start
```

或者使用项目中的 Justfile：

```bash
just run-surfpool
```

## 4.6 安全考虑

在使用 SurfPool 时，需要注意以下安全要点：

1. 仅在开发和测试环境中使用作弊码功能，绝不在生产环境中使用
2. 确保测试环境与生产环境尽可能一致
3. 在提交代码前清理所有测试专用代码
4. 使用 SurfPool 的标准 RPC 接口确保兼容性

## 4.7 性能优化

SurfPool 提供了多种性能优化功能：

1. 即时部署：通过作弊码直接写入程序数据，避免交易确认延迟
2. 内存中状态管理：提供更快的状态读写速度
3. 并发测试支持：允许同时运行多个测试实例
4. 高效的账户状态管理：通过作弊码快速设置初始状态

## 4.8 小结

本章详细介绍了如何在 daog1/solbank 项目中使用 SurfPool 特性。通过实际代码示例，我们展示了从配置 SurfPool 环境到使用其高级功能（如作弊码、快速部署等）的完整过程。SurfPool 作为基于 LiteSVM 构建的本地开发环境，为 Solana 开发者提供了强大的工具集，可以显著提升开发和测试效率。
