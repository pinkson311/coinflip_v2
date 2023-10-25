const {
  mainnetConnection,
  fromExportedKeypair,
  JsonRpcProvider,
  toB64,
  RawSigner,
  TransactionBlock,
  Connection,
} = require("@mysten/sui.js");
const BigNumber = require("bignumber.js");

const privateKey = "";

const rpc = null;
const rpcConnection = rpc
  ? new Connection({
      fullnode: rpc,
    })
  : mainnetConnection;
const provider = new JsonRpcProvider(rpcConnection);

const { signer, address } = getWallet(privateKey);

function getWallet(privateKey) {
  const privateKeyBytes = Uint8Array.from(
    Buffer.from(privateKey.slice(2), "hex")
  );
  const keypair = fromExportedKeypair({
    schema: "ED25519",
    privateKey: toB64(privateKeyBytes),
  });
  return {
    address: keypair.getPublicKey().toSuiAddress(),
    signer: new RawSigner(keypair, provider),
  };
}

async function latmat(signer) {
  const gameAddress =
    "0x4c2d27c9639362c062148d01ed28cf58430cefadd43267c2e176d93259c258e2::coin_flip_v2::start_game";
  const transactionBlock = new TransactionBlock();
  const fee = new BigNumber(1000000000);
  const payment = transactionBlock.splitCoins(transactionBlock.gas, [
    transactionBlock.pure(fee),
  ]);
  transactionBlock.moveCall({
    target: gameAddress,
    typeArguments: ["0x2::sui::SUI"],
    arguments: [
      transactionBlock.object(
        "0x464ea97815fdf7078f8d0358dcc8639afba8c53c587d5ce4217940e9870e8e74"
      ),
      transactionBlock.pure(1),
      transactionBlock.pure([1,2,3,4]),
      payment,
    ],
  });
  return signer.signAndExecuteTransactionBlock({
    transactionBlock,
  });
}

(async () => {
  while (true) {
    try {
      console.log(`Wallet address: ${address}, rpc: ${rpc ?? "mainnet"} `);
      await latmat(signer);
      console.log('Cờ bạc người không chơi là người thắng');
    } catch (error) {
      console.log("error", error);
    }
  }
})();