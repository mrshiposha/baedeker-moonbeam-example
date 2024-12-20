import Web3, { AbiItem, HexString } from 'web3';
import {Contract} from 'web3-eth-contract';
import {readFile} from 'fs/promises';
import xtoken_abi from '../contracts/XTokensInstance_sol_XTokensInstance.abi.json' assert { type: 'json' };
import nft_abi from '../contracts/nft_sol_Nft.abi.json'  assert { type: 'json' };

const PRIVATE_KEY = "0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133";

async function main() {
  console.log("Starting");
  const web3 = new Web3('ws://127.0.0.1:9699/relay-moonbeam/');
  const balance = await web3.eth.getBalance("0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac");

  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  console.log("Alith address", account.address);
  
  const xtoken_bin = '0x' + (
    await readFile(`./contracts/XTokensInstance_sol_XTokensInstance.bin`)
  ).toString();

  const nft_bin = '0x' + (
    await readFile(`./contracts/nft_sol_Nft.bin`)
  ).toString();

  // let nft_contract = await deployByAbi(
  //   web3,
  //   account.address,
  //   nft_abi,
  //   nft_bin,
  // );
  let nft_contract = new web3.eth.Contract(nft_abi, "0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3");
  console.log("NFT Deployed", nft_contract.options.address);

  let xtoken_contract = await deployByAbi(
    web3,
    account.address,
    xtoken_abi,
    xtoken_bin,
  );
  console.log("XToken Deployed", xtoken_contract.options.address);

  const gasPrice = await web3.eth.getGasPrice();
  console.log("gasPrice", gasPrice);

  const tx = {
    from: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
    to: xtoken_contract.options.address,
    value: web3.utils.toWei('10', 'ether'),
    gas: 41000000,
    gasPrice
  };
  const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("Contract funded");

  const token_id = 2;
  await nft_contract.methods.mint(xtoken_contract.options.address, token_id).send({from: account.address});
  console.log("Token Minted");

  const destination_enum_selector = "0x01";
  const account_id_20_enum_selector = "0x03";
  const destination_address =
    "0101010101010101010101010101010101010101010101010101010101010101";
  const destination_network_id = "00";
  const destination =
    [
      1,
      //[destination_enum_selector + destination_address + destination_network_id],
      //[account_id_20_enum_selector + account.address?.substring(2) + destination_network_id],
      //["0x00" + "000003E8"]
      ["0x00" + "000003E9", account_id_20_enum_selector + account.address?.substring(2) + destination_network_id]
    ];
  const weight = 100;

  const nft_location = [
    0,
    [account_id_20_enum_selector + nft_contract.options.address?.substring(2) + destination_network_id]
    //[account_id_20_enum_selector + 'de0b295669a9fd93d5f28d9ec85e40f4cb697bae' + destination_network_id]
  ];
  const asset_instance_index_enum_selector = "0x01";
  const nft_asset_instance = asset_instance_index_enum_selector + token_id.toString(16).padStart(32, "0");
  const nft_asset = [nft_location, nft_asset_instance];

  const fee_location = [
    0,
    //[account_id_20_enum_selector + "0000000000000000000000000000000000000802" /* Native Eth*/ + destination_network_id]
    //["0x04" + "6e", "0x03" + "f24FF3a9CF04c71Dbc94D0b566f7A27B94566cac" + destination_network_id]
    [ "0x04" + "0a"]
  ];
  const fee_asset = [fee_location, 10];

  console.log(await nft_contract.methods.balanceOf(account.address).call());
  console.log(await nft_contract.methods.balanceOf(xtoken_contract.options.address).call());

  console.log("Starting NFT sending");
  await xtoken_contract.methods.transferNftWithFee(nft_asset, fee_asset, destination, weight).send({from: account.address});
  //await xtoken_contract.methods.transferMultiasset(fee_location, 10, destination, weight).send({from: account.address});
  console.log("NFT Token sent");

  console.log(await nft_contract.methods.balanceOf(account.address).call());
  console.log(await nft_contract.methods.balanceOf(xtoken_contract.options.address).call());
  
  console.log("AssetHub Balance:", await nft_contract.methods.balanceOf("0x7369626ce8030000000000000000000000000000").call());
  console.log("Unique Balance:", await nft_contract.methods.balanceOf("0x7369626ce9030000000000000000000000000000").call());
}

async function deployByAbi(web3: Web3, signer: string, abi: AbiItem[], object: string, gas?: HexString, args?: any[]): Promise<Contract<AbiItem[]>> {
  const contract = new web3.eth.Contract(abi);
  let result = await contract.deploy({data: object, arguments: args}).send({
    from: signer,
  });
  return result;
}

await main();