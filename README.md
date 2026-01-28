# SolBank

A Solana program implementing a simple banking system with SOL and SPL token support, featuring deposit/withdrawal operations and a 24-hour withdrawal cooldown.

## Features

- **SOL Operations**: Deposit and withdraw SOL to/from a program-controlled vault
- **Token Operations**: Deposit and withdraw SPL tokens using associated token accounts
- **Security**: 24-hour cooldown period for withdrawals based on slot progression
- **Testing**: Scripts for local development with Surfpool compatibility

## Prerequisites

- Rust and Cargo
- Solana CLI
- Anchor Framework
- Node.js and Yarn
- Surfpool (for advanced testing)

## Setup

1. **Clone and build the program:**
   ```bash
   git clone <repository-url>
   cd solbank
   anchor build
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Generate keypairs and add base58 private keys:
     ```bash
     npx ts-node scripts/generate-keypair.ts
     ```
   - Set `MINT_PRIVATE_KEY`, `TOKEN_AUTH_PRIVATE_KEY`, `USER_PRIVATE_KEY`, and `USDT_MINT` in `.env`

3. **Start Surfpool:**
   ```bash
   surfpool start
   ```
   (Note: Surfpool automatically deploys the program when started)

## Usage

### Program Instructions

- `initialize`: Set up the program vault and store initialization slot
- `deposit_sol(amount)`: Deposit SOL into the vault
- `withdraw_sol(amount)`: Withdraw SOL from the vault (after 24-hour cooldown)
- `deposit_token(amount)`: Deposit tokens into the vault
- `withdraw_token(amount)`: Withdraw tokens from the vault (after 24-hour cooldown)

### Testing Scripts

Use the Justfile for easy testing:

```bash
# Run tests without deploying, using local Surfpool RPC
just test-local-surfpool

# Start Surfpool and run tests (deploys automatically)
just test-with-surfpool-deploy

# Start Surfpool (uses MAIN_RPC environment variable)
just run-surfpool

# Generate a new keypair and output private key in base58
just generate-keypair

# Create a test mint
just create-mint

# Deposit tokens (requires mint address as argument)
just deposit-token <mint-address>

# Withdraw tokens (requires mint address as argument)
just withdraw-token <mint-address>

# Setup USDT balance to 1e12
just setup-usdt-balance

# Setup USDT account with custom balance (amount in lamports, default 1e9)
just setup-usdt-account <amount>

# Deposit USDT
just deposit-usdt

# Withdraw USDT
just withdraw-usdt

# Show help information
just help
```

### Wallet Roles

- **MINT_PRIVATE_KEY**: Funds transaction fees for mint creation
- **TOKEN_AUTH_PRIVATE_KEY**: Authority for minting tokens
- **USER_PRIVATE_KEY**: Signs program interactions (deposits/withdrawals)

## Architecture

- **Vault PDA**: Stores SOL and owns token accounts
- **Program State**: Tracks initialization slot for cooldown enforcement
- **Associated Token Accounts**: Used for token storage
- **Slot-based Cooldown**: Prevents withdrawals within ~24 hours of initialization

## Security

- PDA-based vault for secure fund storage
- Authority checks on token operations
- Slot-based time locks for withdrawals
- Proper account validation and ownership checks

## Development

### Building
```bash
anchor build
```

### Testing
```bash
# Run full test suite (includes initialize)
anchor test

# Test with Surfpool deployment (includes initialize)
just test-with-surfpool-deploy

# Quick test without full deployment
just test-local-surfpool
```

### Scripts
- `scripts/create-mint.ts`: Create test token mint
- `scripts/deposit-token.ts`: Deposit tokens
- `scripts/withdraw-token.ts`: Withdraw tokens
- `scripts/setup-usdt-account.ts`: Set USDT balance by directly setting account data (demonstrates surfnet_setAccount)
- `scripts/setup-usdt-balance.ts`: Set USDT balance via token cheatcode (demonstrates surfnet_setTokenAccount)
- `scripts/generate-keypair.ts`: Generate new keypairs

## Solana Program Development and Testing

This project demonstrates core Solana program development concepts and advanced testing techniques using Surfpool.

### Program Structure

- **Rust Program**: Core banking logic in `programs/solbank/src/lib.rs`
- **TypeScript Tests**: Client-side testing in `tests/solbank.ts`
- **Utility Scripts**: Development helpers in `scripts/`

### Testing with Surfpool

Surfpool provides a local Solana-compatible network with advanced testing features:

#### Starting Surfpool
```bash
surfpool start
```
This creates a local network that mimics mainnet behavior, including automatic program deployment.

#### Account Data Manipulation

**Set Account Balance:**
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
*See `scripts/setup-usdt-account.ts` for token account creation example*

**Set Token Account Balance:**
```typescript
await connection._rpcRequest('surfnet_setTokenAccount', [
  ownerPubkey.toString(),
  mintPubkey.toString(),
  { amount: "1000000" },
  TOKEN_PROGRAM_ID.toString(),
]);
```
*See `scripts/setup-usdt-balance.ts` for implementation*

#### Time Travel

**Advance to Specific Slot:**
```typescript
await connection._rpcRequest('surfnet_timeTravel', [{
  absoluteSlot: 250000000
}]);
```

**Pause/Resume Block Production:**
```typescript
await connection._rpcRequest('surfnet_pauseClock', []);
await connection._rpcRequest('surfnet_resumeClock', []);
```

### Development Workflow

1. **Local Development:**
   - Start Surfpool for realistic testing
   - Use scripts for account setup and token operations
   - Test cooldown mechanisms with time travel

2. **Account Management:**
   - PDAs for program-controlled accounts
   - Associated Token Accounts for user tokens
   - Proper rent exemption handling

3. **Security Testing:**
   - Test withdrawal restrictions
   - Verify authority checks
   - Simulate various account states

### Advanced Features

- **Slot-Based Logic**: Use `Clock::get()` for time-dependent operations
- **PDA Derivation**: Secure account creation with program-derived addresses
- **Cross-Program Calls**: SPL Token program integration
- **Error Handling**: Custom error codes for user-friendly messages

### Best Practices

- Always test with Surfpool for production-like conditions
- Use cheatcodes for setting up complex test scenarios
- Implement time-based restrictions using slots rather than timestamps
- Validate all account ownership and authorities
- Test edge cases with account manipulation tools

## License

MIT
