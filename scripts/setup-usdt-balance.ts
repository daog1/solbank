import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import "dotenv/config";
import bs58 from "bs58";

async function main() {
  // Load from .env
  const userPrivateKey = process.env.USER_PRIVATE_KEY!;
  const usdtMint = process.env.USDT_MINT!;

  const userKeypair = anchor.web3.Keypair.fromSecretKey(
    bs58.decode(userPrivateKey)
  );
  const mint = new PublicKey(usdtMint);

  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  console.log(`User address: ${userKeypair.publicKey.toBase58()}`);
  console.log(`Mint address: ${mint.toBase58()} `);

  // Airdrop SOL to user if needed
  const userBalance = await connection.getBalance(userKeypair.publicKey);
  if (userBalance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
    const airdropTx = await connection.requestAirdrop(
      userKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
    console.log(
      `Airdropped 2 SOL to user wallet: ${userKeypair.publicKey.toBase58()}`
    );
  }

  const wallet = new anchor.Wallet(userKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  // Get or create user's USDT ATA
  /*const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    userKeypair, // payer
    mint,
    userKeypair.publicKey
  );*/
  const userTokenAccount = anchor.utils.token.associatedAddress({
    mint,
    owner: userKeypair.publicKey,
  });
  console.log("ATA address:", userTokenAccount.toBase58());
  console.log("User USDT ATA:", userTokenAccount.toBase58());

  // Set balance to 1e12 using Surfpool cheatcode
  const amount = 2e9; // 1e12 as number
  const result = await (connection as any)._rpcRequest(
    "surfnet_setTokenAccount",
    [
      userKeypair.publicKey,
      mint.toBase58(), // mint
      { amount: amount }, // update
      TOKEN_PROGRAM_ID.toBase58(), // token program
    ]
  );
  console.log("surfnet_setTokenAccount result:", result);
  console.log(`Set USDT balance to ${amount} for user`);

  // Check balance
  const accountInfo = await getAccount(provider.connection, userTokenAccount);
  console.log(`User USDT balance: ${accountInfo.amount} (raw)`);
}

main().catch(console.error);
