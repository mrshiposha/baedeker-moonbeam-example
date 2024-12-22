import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";

const str2vec = (string: string) => {
  if(typeof string !== 'string') return string;
  return Array.from(string).map(x => x.charCodeAt(0));
};

async function waitForFinalization() {
    console.log('awaiting finalization...');
    // FIXME wait for the block finalization using PolkadotJS API
    // using temporary workaround: wait for 7 blocks.
    const blockTime = 6000;
    await new Promise(f => setTimeout(f, 7 * blockTime));
    console.log('awaiting finalization...DONE');
  }

async function main() {
  const wsProvider = new WsProvider(process.env.RELAY_UNIQUE_URL);
  const api = await ApiPromise.create({ provider: wsProvider });

  const keyring = new Keyring({type: 'sr25519', ss58Format: 42});
  const alice = keyring.addFromUri('//Alice');

  const nftMoonbeamContractAddr = process.argv[2];

  const moonbeamId = Number(process.env.RELAY_MOONBEAM_ID);
  const moonbeamBalancesPalletInstance = 10;
  const glmrLocation = {
    parents: 1,
    interior: {
      X2: [
        {Parachain: moonbeamId},
        {PalletInstance: moonbeamBalancesPalletInstance},
      ],
    },
  };

  const glmrDerivativeCollection = await api.query.foreignAssets.foreignAssetToCollection(glmrLocation)
    .then(d => d.toJSON());
  if (glmrDerivativeCollection === null) {
    const moonbeamDecimals = 18;

    await api.tx.sudo.sudo(
      api.tx.foreignAssets.forceRegisterForeignAsset(
        {V4: glmrLocation},
        str2vec("Moonbeam GLMR"),
        "GLMR",
        {Fungible: moonbeamDecimals},
      ),
    ).signAndSend(alice);
    console.log('GLMR is registered on Unique');

    await waitForFinalization();
  } else {
    console.log('[SKIP] GLMR is ALREADY registered on Unique');
  }

  const nftLocation = {
    parents: 1,
    interior: {
      X2: [
        {Parachain: moonbeamId},
        {AccountKey20: {key: nftMoonbeamContractAddr}},
      ],
    },
  };
  const nftDerivativeCollection = await api.query.foreignAssets.foreignAssetToCollection(nftLocation)
    .then(d => d.toJSON());
  if (nftDerivativeCollection === null) {
    await api.tx.sudo.sudo(
        api.tx.foreignAssets.forceRegisterForeignAsset(
          {V4: nftLocation},
          str2vec("Moonbeam NFT Contract"),
          "MNF",
          'NFT',
        ),
      ).signAndSend(alice);

    console.log(`Moonbeam NFT contract ${nftMoonbeamContractAddr} is registered on Unique`);

    await waitForFinalization();
  } else {
    console.log(`[SKIP] Moonbeam NFT contract ${nftMoonbeamContractAddr} is ALREADY registered on Unique`);
  }

  await api.disconnect();
}

await main();
