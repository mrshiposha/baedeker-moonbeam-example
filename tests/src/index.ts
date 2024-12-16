import Web3, { AbiItem, HexString } from 'web3';
import {Contract} from 'web3-eth-contract';
import {readFile} from 'fs/promises';
import xtoken_abi from '../contracts/XTokensInstance_sol_XTokensInstance.abi.json';
import nft_abi from '../contracts/nft_sol_Nft.abi.json';

async function main() {
  console.log("Starting");
  const web3 = new Web3('ws://127.0.0.1:9699/relay-moonbeam/');
  const balance = await web3.eth.getBalance("0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac");
  console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

  const account = web3.eth.accounts.privateKeyToAccount("0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133");
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;
  
  const xtoken_bin = '0x' + (
    await readFile(`./contracts/XTokensInstance_sol_XTokensInstance.bin`)
  ).toString();

  const nft_bin = '0x' + (
    await readFile(`./contracts/nft_sol_Nft.bin`)
  ).toString();

  let nft_contract = await deployByAbi(
    web3,
    account.address,
    nft_abi,
    nft_bin,
  );
  console.log("NFT Deployed", nft_contract.options.address);

  const token_id = 1;
  await nft_contract.methods.mint(account.address, token_id).send({from: account.address});
  console.log("Token Minted");

  let xtoken_contract = await deployByAbi(
    web3,
    account.address,
    xtoken_abi,
    xtoken_bin,
  );
  console.log("XToken Deployed", xtoken_contract.options.address);

  const destination_enum_selector = "0x01";
  const destination_address =
    "0101010101010101010101010101010101010101010101010101010101010101";
  const destination_network_id = "00";
  const destination =
    [
      1,
      [destination_enum_selector + destination_address + destination_network_id],
    ];
  const weight = 100;

  const account_id_20_enum_selector = "0x03";
  const nft_location = [
    0,
    [account_id_20_enum_selector + nft_contract.options.address?.substring(2) + destination_network_id]
  ];
  const asset_instance_index_enum_selector = "0x01";
  const nft_asset_instance = asset_instance_index_enum_selector + token_id.toString(16).padStart(32, "0");
  const nft_asset = [nft_location, nft_asset_instance];

  const fee_location = [
    0,
    [account_id_20_enum_selector + "0000000000000000000000000000000000000802" /* Native Eth*/ + destination_network_id]
  ];
  const fee_asset = [fee_location, 10]

  console.log("Starting NFT sending");
  await xtoken_contract.methods.transferNftWithFee(nft_asset, fee_asset, destination, weight).send({from: account.address});
  console.log("NFT Token sent");
}

async function deployByAbi(web3: Web3, signer: string, abi: AbiItem[], object: string, gas?: HexString, args?: any[]): Promise<Contract<AbiItem[]>> {
  const contract = new web3.eth.Contract(abi);
  let result = await contract.deploy({data: object, arguments: args}).send({
    from: signer,
  });
  return result;
}

main();