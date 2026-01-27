# Justfile for Solana development with Surfpool

# Run tests without deploying, using local Surfpool RPC
test-local-surfpool:
    # Assume Surfpool is running locally on default port 8899
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    export ANCHOR_WALLET=~/.config/solana/id.json
    anchor run test

# Start Surfpool and run tests (deploys automatically)
test-with-surfpool-deploy:
    surfpool run -- anchor test

run-surfpool:
    surfpool start
# Generate a new keypair and output private key in base58
generate-keypair:
    npx ts-node scripts/generate-keypair.ts

# Create a test mint
create-mint:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/create-mint.ts

# Run deposit token script (requires mint address as argument)
deposit-token MINT:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/deposit-token.ts {{MINT}}

# Run withdraw token script (requires mint address as argument)
withdraw-token MINT:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/withdraw-token.ts {{MINT}}

# Setup user USDT balance to 1e12
setup-usdt-balance:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/setup-usdt-balance.ts

# Setup USDT account with custom balance (amount in lamports, default 1e9)
setup-usdt-account AMOUNT:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/setup-usdt-account.ts {{AMOUNT}}

deposit-usdt MINT:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/deposit-token.ts Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

# Run withdraw token script (requires mint address as argument)
withdraw-usdt MINT:
    #!/usr/bin/env zsh
    export ANCHOR_PROVIDER_URL=http://localhost:8899
    npx ts-node scripts/withdraw-token.ts Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
