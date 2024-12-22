import Web3, { AbiItem, HexString } from 'web3';
import {Contract} from 'web3-eth-contract';
import {WalkerImpl, encodeU128, encodeU32, encodeU8} from '@scale-codec/core'
import xtokenAbi from '../contracts/XTokensInstance_sol_XTokensInstance.abi.json' assert { type: 'json' };
import nftAbi from '../contracts/nft_sol_Nft.abi.json'  assert { type: 'json' };

async function waitForFinalization() {
  console.log('awaiting finalization...');
  // FIXME wait for the block finalization using PolkadotJS API
  // using temporary workaround: wait for 7 blocks.
  const blockTime = 6000;
  await new Promise(f => setTimeout(f, 7 * blockTime));
  console.log('awaiting finalization...DONE');
}

function array2hex(array: Uint8Array) {
  const buffer = array.buffer;
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .reverse()
      .join('');
}

async function main() {
  const xtokensShimContractAddress = process.argv[2];
  const nftsContractAddress = process.argv[3];
  const nftId = BigInt(process.argv[4]);

  console.log("Starting");
  const web3 = new Web3(process.env.RELAY_MOONBEAM_URL);

  const alithPrivateKey = "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133";

  const alithAccount = web3.eth.accounts.privateKeyToAccount(alithPrivateKey);
  web3.eth.accounts.wallet.add(alithAccount);
  web3.eth.defaultAccount = alithAccount.address;

  const alithBalance = await web3.eth.getBalance(alithAccount.address);
  console.log("Alith address", alithAccount.address);
  console.log("Alith balance", alithBalance);
  

  const xtokensContractShim = new web3.eth.Contract(xtokenAbi, xtokensShimContractAddress);
  const nftContract = new web3.eth.Contract(nftAbi, nftsContractAddress);

  const gasPrice = await web3.eth.getGasPrice();
  console.log("gasPrice", gasPrice);
  console.log("Sponsoring the xtokens shim contract...");

  const tx = {
    from: alithAccount.address,
    to: xtokensContractShim.options.address,
    value: web3.utils.toWei('10', 'ether'),
    gasPrice,
  };
  const signedTx = await web3.eth.accounts.signTransaction(tx, alithPrivateKey);
  const _receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("xtokenContractShim sponsored");

  await waitForFinalization();

  await nftContract.methods.mint(xtokensContractShim.options.address, nftId).send({from: alithAccount.address});
  console.log("Token Minted");

  await waitForFinalization();

  // Here are the encoding functions.
  // See here what Rust expects: https://github.com/UniqueNetwork/unique-frontier/blob/4c22faa2ef3947a7ee32551fc5a07a0754706d9b/precompiles/src/solidity/codec/xcm.rs
  // Also, you can look at the XCM types:
  // See the `Junction` enum in the Polkadot SDK: polkadot/xcm/src/v4/junction.rs
  // See the `AssetInstance` enum in the Polkadot SDK: polkadot/xcm/src/v4/asset.rs
  // See the `Fungibility` enum in the Polkadot SDK: polkadot/xcm/src/v4/asset.rs

  const encodedAccountId32 = (substrateAccountAddress: string) => {
    const accountId32EnumSelector = "01";

    // It's more like "ecosystem ID" but it's named "network ID" for some reason.
    // Example values: "Polkadot" (incl. parachains), "Kusama" (incl. parachains), "Bitcoin", "Ethereum".
    // But we can also insert NULL, we do that here.
    const networkId = "00";
    return "0x" + accountId32EnumSelector + substrateAccountAddress.substring(2) + networkId;
  };

  const encodedAccountKey20 = (ethereumAccountAddress: string) => {
    const accountKey20EnumSelector = "03";

    const networkId = "00";
    return "0x" + accountKey20EnumSelector + ethereumAccountAddress.substring(2) + networkId;
  };

  const encodedParachain = (paraId: number) => {
    const parachainSelector = "00";

    const encodedParaId = array2hex(WalkerImpl.encode(paraId, encodeU32));

    return "0x" + parachainSelector + encodedParaId;
  };

  const encodedPalletInstance = (palletInstance: number) => {
    const palletInstanceSelector = "04";

    const encodedPalletInstance = array2hex(WalkerImpl.encode(palletInstance, encodeU8));

    return "0x" + palletInstanceSelector + encodedPalletInstance;
  };

  const encodedAssetInstance = (nftId: bigint) => {
    const assetInstanceIndexEnumSelector = "01";

    const encodedNftId = array2hex(WalkerImpl.encode(nftId, encodeU128));

    return "0x" + assetInstanceIndexEnumSelector + encodedNftId;
  };

  const xcmLocation = (parents: number, encodedInterior: string[]) => {
    return [
      parents,
      encodedInterior,
    ];
  };

  const xcmFungibleAsset = (assetReserveLocation: any, amount: bigint) => {
    return [assetReserveLocation, amount];
  };

  const xcmNonfungibleAsset = (assetReserveLocation: any, assetInstance: any) => {
    return [assetReserveLocation, assetInstance];
  };

  // -- Prepare transfer params--

  // The NFT collection (contract) XCM location relative to Moonbeam (we will send FROM Moonbeam)
  const nftContractLocation = xcmLocation(0, [encodedAccountKey20(nftsContractAddress)]);

  // The NFT Asset Instance
  const nftAssetInstance = encodedAssetInstance(nftId);

  // The full XCM assets:
  // 1) the fee token (GLMR, Moonbeam's native currency)
  // 2) the NFT

  const glmrLocation = xcmLocation(0, [encodedPalletInstance(10)]);
  const glmrDecimals = 18;

  const feeAsset = xcmFungibleAsset(glmrLocation, 1n * 10n ** BigInt(glmrDecimals));
  const nftAsset = xcmNonfungibleAsset(nftContractLocation, nftAssetInstance);

  // The beneficiary account on Unique (Substrate account)
  const aliceAccountAddress = "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d";

  // The full destination is `../Parachain(UNIQUE_PARA_ID)/AccountId32(aliceAccountAddress)`
  const destination = xcmLocation(1, [encodedParachain(1001), encodedAccountId32(aliceAccountAddress)]);

  const weight = 100;

  console.log("Alith NFT balance", await nftContract.methods.balanceOf(alithAccount.address).call());

  const uniqueParaId = Number(process.env.RELAY_UNIQUE_ID);
  const parachainSovereignAccountOnMoonbeam = (paraId: number) => {
    const encodedParaId = array2hex(WalkerImpl.encode(paraId, encodeU32));
  
    const addrPrefix = "7369626c" + encodedParaId;
    const addrByteLength = 20;
    const addrHexLength = addrByteLength * 2;
  
    return "0x" + addrPrefix.padEnd(addrHexLength, "0");
  };

  console.log("Xtokens contract shim NFT balance", await nftContract.methods.balanceOf(xtokensContractShim.options.address).call());
  console.log("Unique SA NFT balance:", await nftContract.methods.balanceOf(parachainSovereignAccountOnMoonbeam(uniqueParaId)).call());

  console.log("Starting NFT sending");
  await xtokensContractShim.methods.transferNftWithFee(nftAsset, feeAsset, destination, weight)
    .send({from: alithAccount.address});
  console.log("NFT Token sent");

  await waitForFinalization();

  console.log("Xtokens contract shim NFT balance", await nftContract.methods.balanceOf(xtokensContractShim.options.address).call());

  // FIXME
  console.log("Unique SA NFT balance:", await nftContract.methods.balanceOf(parachainSovereignAccountOnMoonbeam(uniqueParaId)).call());

  web3.currentProvider?.disconnect();
}

await main();
