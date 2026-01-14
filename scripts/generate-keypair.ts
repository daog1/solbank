import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";

async function main() {
  const keypair = anchor.web3.Keypair.generate();
  const privateKeyB58 = bs58.encode(keypair.secretKey);
  console.log("Generated private key (base58):", privateKeyB58);
  console.log("Public key:", keypair.publicKey.toBase58());
}

main().catch(console.error);