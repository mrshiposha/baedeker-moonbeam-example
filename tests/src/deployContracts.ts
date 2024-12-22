import Web3, { AbiItem, HexString } from 'web3';
import {Contract} from 'web3-eth-contract';
import {readFile} from 'fs/promises';
import xtokenAbi from '../contracts/XTokensInstance_sol_XTokensInstance.abi.json' assert { type: 'json' };
import nftAbi from '../contracts/nft_sol_Nft.abi.json'  assert { type: 'json' };

async function deployByAbi(
    web3: Web3,
    signer: string,
    abi: AbiItem[],
    object: string,
    gas?: HexString,
    args?: any[],
): Promise<Contract<AbiItem[]>> {
  const contract = new web3.eth.Contract(abi);
  let result = await contract.deploy({data: object, arguments: args}).send({
    from: signer,
   });
  return result;
}

async function waitForFinalization() {
  console.log('awaiting finalization...');
  // FIXME wait for the block finalization using PolkadotJS API
  // using temporary workaround: wait for 7 blocks.
  const blockTime = 6000;
  await new Promise(f => setTimeout(f, 7 * blockTime));
  console.log('awaiting finalization...DONE');
}

async function main() {
  console.log("Starting");
  const web3 = new Web3(process.env.RELAY_MOONBEAM_URL);

  const alithPrivateKey = "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133";

  const alithAccount = web3.eth.accounts.privateKeyToAccount(alithPrivateKey);
  web3.eth.accounts.wallet.add(alithAccount);
  web3.eth.defaultAccount = alithAccount.address;

  const alithBalance = await web3.eth.getBalance(alithAccount.address);
  console.log("Alith address", alithAccount.address);
  console.log("Alith balance", alithBalance);

  const xtokenBin = '0x' + (
    await readFile(`./contracts/XTokensInstance_sol_XTokensInstance.bin`)
  ).toString();

  const nftBin = '0x' + (
    await readFile(`./contracts/nft_sol_Nft.bin`)
  ).toString();

  let xtokenShimContract = await deployByAbi(
    web3,
    alithAccount.address,
    xtokenAbi,
    xtokenBin,
  );
  console.log("XToken Deployed", xtokenShimContract.options.address);

  await waitForFinalization();

  let nftContract = await deployByAbi(
    web3,
    alithAccount.address,
    nftAbi,
    nftBin,
  );
  console.log("NFT Deployed", nftContract.options.address);

  await waitForFinalization();

  web3.currentProvider?.disconnect();
}

await main();
