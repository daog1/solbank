import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { createMint, createMintToInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import bs58 from "bs58";

async function main() {
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");

  // Load wallets from .env
  const mintPrivateKey = process.env.MINT_PRIVATE_KEY!;
  const tokenAuthPrivateKey = process.env.TOKEN_AUTH_PRIVATE_KEY!;
  const mintKeypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(mintPrivateKey));
  const tokenAuthKeypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(tokenAuthPrivateKey));
  const tokenAuth = tokenAuthKeypair.publicKey;

  // Airdrop SOL to mint keypair if needed
  const balance = await connection.getBalance(mintKeypair.publicKey);
  if (balance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(mintKeypair.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    console.log("Airdropped 2 SOL to mint keypair");
  }

  const wallet = new anchor.Wallet(mintKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {});

  // Create a test mint
  const mint = await createMint(
    provider.connection,
    mintKeypair, // funded payer
    tokenAuth, // mint authority
    tokenAuth, // freeze authority
    9, // decimals
    undefined,
    undefined,
    anchor.utils.token.TOKEN_PROGRAM_ID
  );

  console.log("Created mint:", mint.toBase58());

  // Mint some initial tokens to the user
  const user = anchor.web3.Keypair.fromSecretKey(bs58.decode(process.env.USER_PRIVATE_KEY!)).publicKey;

  // Create user's ATA if needed
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    mintKeypair, // payer
    mint,
    user
  );
  console.log("Created user ATA:", userTokenAccount.address.toBase58());

  const mintInstruction = createMintToInstruction(
    mint,
    userTokenAccount.address,
    tokenAuth, // authority
    1000000000, // 1 token
    [],
    TOKEN_PROGRAM_ID
  );

  const tx = new anchor.web3.Transaction().add(mintInstruction);
  await provider.sendAndConfirm(tx, [tokenAuthKeypair]);
  console.log("Minted 1 token to user");
}

main().catch(console.error);
