import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  ACCOUNT_SIZE,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import "dotenv/config";

async function main() {
  const mintAddress = process.env.USDT_MINT!;
  const userPrivateKey = process.env.USER_PRIVATE_KEY!;
  const amountStr = process.argv[2] || "1000000000"; // Default 1 USDT

  const userKeypair = anchor.web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(userPrivateKey)
  );
  const mint = new PublicKey(mintAddress);
  const amount = BigInt(amountStr);

  const connection = new anchor.web3.Connection(
    "http://localhost:8899",
    "confirmed"
  );

  // Airdrop SOL if needed
  const userBalance = await connection.getBalance(userKeypair.publicKey);
  if (userBalance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
    const airdropTx = await connection.requestAirdrop(
      userKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
    console.log("Airdropped 2 SOL to user wallet");
  }

  // Create ATA address
  const ata = anchor.utils.token.associatedAddress({
    mint,
    owner: userKeypair.publicKey,
  });
  console.log("ATA address:", ata.toBase58());
  const tokenAccountData = Buffer.alloc(ACCOUNT_SIZE);

  // Encode token account data
  AccountLayout.encode(
    {
      mint,
      owner: userKeypair.publicKey,
      amount,
      delegateOption: 0,
      delegate: PublicKey.default,
      delegatedAmount: BigInt(0),
      state: 1, // Initialized
      isNativeOption: 0,
      isNative: BigInt(0),
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default,
    },
    tokenAccountData
  );

  // Calculate rent-exempt lamports
  const rentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span
  );
  console.log("Rent-exempt lamports:", rentExempt);

  // Set account via Surfpool cheatcode
  await (connection as any)._rpcRequest("surfnet_setAccount", [
    ata.toBase58(),
    {
      lamports: rentExempt,
      data: tokenAccountData.toString("hex"),
      owner: TOKEN_PROGRAM_ID.toString(),
      executable: false,
    },
  ]);

  console.log(`Set USDT account with balance: ${amount}`);

  // Check balance
  const { getAccount } = await import("@solana/spl-token");
  const accountInfo = await getAccount(connection, ata);
  console.log(`User USDT balance: ${accountInfo.amount} (raw)`);
}

main().catch(console.error);
