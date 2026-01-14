import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solbank } from "../target/types/solbank";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createMintToInstruction,
  getAccount,
} from "@solana/spl-token";
import "dotenv/config";
import bs58 from "bs58";

async function main() {
  const mintAddress = process.argv[2];
  if (!mintAddress) {
    console.error("Usage: ts-node scripts/withdraw-token.ts <mint-address>");
    process.exit(1);
  }

  // Load wallets from .env
  const userPrivateKey = process.env.USER_PRIVATE_KEY!;
  const userKeypair = anchor.web3.Keypair.fromSecretKey(
    bs58.decode(userPrivateKey)
  );

  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  // Airdrop SOL to user if needed
  const userBalance = await connection.getBalance(userKeypair.publicKey);
  if (userBalance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
    const airdropTx = await connection.requestAirdrop(
      userKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
    console.log("Airdropped 2 SOL to user wallet");
  }

  const wallet = new anchor.Wallet(userKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const program = anchor.workspace.solbank as Program<Solbank>;
  const user = userKeypair.publicKey;
  const mint = new PublicKey(mintAddress);

  // Get or create user's token account
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    userKeypair, // payer
    mint,
    userKeypair.publicKey
  );
  console.log("User token account:", userTokenAccount.address.toBase58());

  // Print current slot
  const currentSlot = await connection.getSlot();
  console.log("Current slot:", currentSlot);
  // Find vault PDA
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );

  // Find vault token account (ATA) - since vault is PDA, use manual derivation
  const vaultTokenAccount = PublicKey.findProgramAddressSync(
    [vault.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    anchor.utils.token.ASSOCIATED_PROGRAM_ID
  )[0];

  // Withdraw 300000000 (0.3 tokens)
  const amount = 300000000;

  // Print token balance before
  let vaultTokenBalanceBefore = 0;
  try {
    const accountInfo = await getAccount(
      provider.connection,
      vaultTokenAccount
    );
    vaultTokenBalanceBefore = Number(accountInfo.amount);
  } catch (e) {
    console.log("Vault token account does not exist");
  }
  console.log(`Vault token balance before: ${vaultTokenBalanceBefore}`);

  const withdrawTx = await (
    program.methods.withdrawToken(new anchor.BN(amount)) as any
  )
    .accounts({
      vaultTokenAccount: vaultTokenAccount,
      userTokenAccount: userTokenAccount.address,
      vault,
      mint,
      user,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Withdraw token transaction:", withdrawTx);

  // Print balances after
  const vaultTokenAccountInfo = await getAccount(
    provider.connection,
    vaultTokenAccount
  );
  console.log(
    `Vault token balance after: ${vaultTokenAccountInfo.amount} (raw)`
  );

  const userTokenAccountInfo = await getAccount(
    provider.connection,
    userTokenAccount.address
  );
  console.log(`User token balance after: ${userTokenAccountInfo.amount} (raw)`);
}

main().catch(console.error);
