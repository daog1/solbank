# SolBank

一个实现简单银行系统的 Solana 程序，支持 SOL 和 SPL 代币，提供存款/取款操作和 24 小时取款冷却期。

## 功能特性

- **SOL 操作**: 向程序控制的金库存款和取款 SOL
- **代币操作**: 使用关联代币账户存款和取款 SPL 代币
- **安全性**: 基于 slot 进展的 24 小时取款冷却期
- **测试**: 与 Surfpool 兼容的本地开发脚本

## 前置条件

- Rust 和 Cargo
- Solana CLI
- Anchor 框架
- Node.js 和 Yarn
- Surfpool（用于高级测试）

## 设置

1. **克隆并构建程序：**
   ```bash
   git clone <repository-url>
   cd solbank
   anchor build
   ```

2. **配置环境：**
   - 将 `.env.example` 复制为 `.env`
   - 生成密钥对并添加 base58 格式的私钥：
     ```bash
     npx ts-node scripts/generate-keypair.ts
     ```
   - 在 `.env` 中设置 `MINT_PRIVATE_KEY`、`TOKEN_AUTH_PRIVATE_KEY`、`USER_PRIVATE_KEY` 和 `USDT_MINT`

3. **启动 Surfpool：**
   ```bash
   surfpool start
   ```
   （注意：Surfpool 启动时会自动部署程序）

## 使用方法

### 程序指令

- `initialize`: 设置程序金库并存储初始化 slot
- `deposit_sol(amount)`: 向金库存款 SOL
- `withdraw_sol(amount)`: 从金库取款 SOL（24 小时冷却期后）
- `deposit_token(amount)`: 向金库存款代币
- `withdraw_token(amount)`: 从金库取款代币（24 小时冷却期后）

### 测试脚本

使用 Justfile 进行便捷测试：

```bash
# 运行测试
just test-local-surfpool

# 创建测试铸币并为用户注资
just create-mint

# 存款代币
just deposit-token <mint-address>

# 取款代币（冷却期后）
just withdraw-token <mint-address>

# 设置 USDT 余额
just setup-usdt-balance
```

### 钱包角色

- **MINT_PRIVATE_KEY**: 为铸币创建提供交易费用
- **TOKEN_AUTH_PRIVATE_KEY**: 代币铸造权限
- **USER_PRIVATE_KEY**: 签署程序交互（存款/取款）

## 架构

- **金库 PDA**: 存储 SOL 并拥有代币账户
- **程序状态**: 跟踪初始化 slot 以强制执行冷却期
- **关联代币账户**: 用于代币存储
- **基于 Slot 的冷却期**: 防止在初始化后 ~24 小时内取款

## 安全性

- 基于 PDA 的金库用于安全资金存储
- 代币操作的权限检查
- 取款的基于 slot 的时间锁
- 正确的账户验证和所有权检查

## 开发

### 构建
```bash
anchor build
```

### 测试
```bash
# 运行完整测试套件（包括 initialize）
anchor test

# 使用 Surfpool 部署进行测试（包括 initialize）
just test-with-surfpool-deploy

# 快速测试，无完整部署
just test-local-surfpool
```

### 脚本
- `scripts/create-mint.ts`: 创建测试代币铸币
- `scripts/deposit-token.ts`: 存款代币
- `scripts/withdraw-token.ts`: 取款代币
- `scripts/setup-usdt-account.ts`: 通过直接设置账户数据设置 USDT 余额（演示 surfnet_setAccount）
- `scripts/setup-usdt-balance.ts`: 通过代币 cheatcode 设置 USDT 余额（演示 surfnet_setTokenAccount）
- `scripts/generate-keypair.ts`: 生成新密钥对

## Solana 程序开发和测试

此项目演示了使用 Surfpool 的核心 Solana 程序开发概念和高级测试技术。

### 程序结构

- **Rust 程序**: `programs/solbank/src/lib.rs` 中的核心银行逻辑
- **TypeScript 测试**: `tests/solbank.ts` 中的客户端测试
- **实用脚本**: `scripts/` 中的开发助手

### 使用 Surfpool 测试

Surfpool 提供了一个与 Solana 兼容的本地网络，具有高级测试功能：

#### 启动 Surfpool
```bash
surfpool start
```
这创建了一个模仿主网行为的本地网络，包括自动程序部署。

#### 账户数据操作

**设置账户余额：**
```typescript
await connection._rpcRequest('surfnet_setAccount', [
  accountPubkey.toString(),
  {
    lamports: 1000000000,
    data: Buffer.from(accountData).toString('hex'),
    owner: programId.toString(),
    executable: false,
  },
]);
```
*查看 `scripts/setup-usdt-account.ts` 了解代币账户创建示例*

**设置代币账户余额：**
```typescript
await connection._rpcRequest('surfnet_setTokenAccount', [
  ownerPubkey.toString(),
  mintPubkey.toString(),
  { amount: "1000000" },
  TOKEN_PROGRAM_ID.toString(),
]);
```
*查看 `scripts/setup-usdt-balance.ts` 了解实现*

#### 时间旅行

**前进到特定 Slot：**
```typescript
await connection._rpcRequest('surfnet_timeTravel', [{
  absoluteSlot: 250000000
}]);
```

**暂停/恢复区块生产：**
```typescript
await connection._rpcRequest('surfnet_pauseClock', []);
await connection._rpcRequest('surfnet_resumeClock', []);
```

### 开发工作流

1. **本地开发：**
   - 启动 Surfpool 以进行真实测试
   - 使用脚本进行账户设置和代币操作
   - 使用时间旅行测试冷却机制

2. **账户管理：**
   - 程序控制账户的 PDA
   - 用户代币的关联代币账户
   - 正确的租金豁免处理

3. **安全测试：**
   - 测试取款限制
   - 验证权限检查
   - 模拟各种账户状态

### 高级功能

- **基于 Slot 的逻辑**: 使用 `Clock::get()` 进行时间相关操作
- **PDA 派生**: 使用程序派生地址进行安全账户创建
- **跨程序调用**: SPL 代币程序集成
- **错误处理**: 用户友好的自定义错误代码

### 最佳实践

- 始终使用 Surfpool 进行类似生产环境的测试
- 使用 cheatcode 设置复杂的测试场景
- 使用 slot 而非时间戳实现基于时间的限制
- 验证所有账户所有权和权限
- 使用账户操作工具测试边界情况

## 许可证

MIT