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
# 运行测试（不部署，使用本地 Surfpool RPC）
just test-local-surfpool

# 启动 Surfpool 并运行测试（自动部署）
just test-with-surfpool-deploy

# 启动 Surfpool（使用 MAIN_RPC 环境变量）
just run-surfpool

# 生成密钥对
just generate-keypair

# 创建测试铸币
just create-mint

# 存款代币（需要铸币地址作为参数）
just deposit-token <mint-address>

# 取款代币（需要铸币地址作为参数）
just withdraw-token <mint-address>

# 设置 USDT 余额至 1e12
just setup-usdt-balance

# 设置 USDT 账户（自定义余额，单位为 lamports，默认 1e9）
just setup-usdt-account <amount>

# 存款 USDT
just deposit-usdt

# 取款 USDT
just withdraw-usdt

# 显示帮助信息
just help
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

此项目演示了核心 Solana 程序开发概念和使用 Surfpool 的高级测试技术。

### 程序结构

- **Rust 程序**: `programs/solbank/src/lib.rs` 中的核心银行逻辑
- **TypeScript 测试**: `tests/solbank.ts` 中的客户端侧测试
- **实用脚本**: `scripts/` 中的开发助手

### 使用 Surfpool 测试

Surfpool 提供了一个本地 Solana 兼容网络，具有高级测试功能：

#### 启动 Surfpool
```bash
surfpool start
```
这创建了一个本地网络，模拟主网行为，包括自动程序部署。

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
*参见 `scripts/setup-usdt-account.ts` 了解代币账户创建示例*

**设置代币账户余额：**
```typescript
await connection._rpcRequest('surfnet_setTokenAccount', [
  ownerPubkey.toString(),
  mintPubkey.toString(),
  { amount: "1000000" },
  TOKEN_PROGRAM_ID.toString(),
]);
```
*参见 `scripts/setup-usdt-balance.ts` 了解实现*

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
   - 启动 Surfpool 进行现实测试
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

- **基于 Slot 的逻辑**: 使用 `Clock::get()` 进行时间相关的操作
- **PDA 派生**: 使用程序派生地址进行安全账户创建
- **跨程序调用**: SPL 代币程序集成
- **错误处理**: 用户友好的自定义错误代码

### 最佳实践

- 始终使用 Surfpool 进行生产类似的测试
- 使用 cheatcode 为设置复杂测试场景
- 使用基于 slot 的时间限制而非时间戳
- 验证所有账户所有权和权限
- 使用账户操作工具测试边缘情况

## Pinocchio 集成示例

以下是如何使用 Pinocchio 调用带有 "svm::process_instructions" 的 "call" 操作的示例：

```toml
action "call" "svm::process_instructions" {
	signers = [signer.deployer]
    instruction {
        program_id = "E4Ewh6dst6ZDW1jPpMCSbvTCTwYapuUyTQaFj3vQGgUY"
        data ="0x0c05000000000000"
        account {
            public_key = signer.deployer.address
            is_writable = true
            is_signer = true
        }
        account  {
            public_key = "Andy1111111111111111111111111111111111111111"
            is_writable = true
        }
        account {
            public_key = svm::system_program_id()
        }
    }
}

```

此示例演示了如何使用 Pinocchio 的操作系统与 SVM（Solana 虚拟机）指令进行交互。

有关 process_instructions 操作的详细信息，请参阅 [Surfpool 文档](https://docs.surfpool.run/iac/svm/actions#process_instructions)。

此功能在 txtx 项目的 [PR #295](https://github.com/txtx/txtx/pull/295) 中引入。

## 许可证

MIT
