import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";


async function main() {
  const wsProvider = new WsProvider(process.env.RELAY_URL);
  const api = await ApiPromise.create({ provider: wsProvider });

  const keyring = new Keyring({type: 'sr25519', ss58Format: 42});
  const alice = keyring.addFromUri('//Alice');

  const moonbeamId = Number(process.env.RELAY_MOONBEAM_ID);
  const uniqueId = Number(process.env.RELAY_UNIQUE_ID);

  const maxCapacity = 8;
  const maxMsgSize = 8192;

  const moonbeam2unique = api.tx.hrmp.forceOpenHrmpChannel(
    moonbeamId,
    uniqueId,
    maxCapacity,
    maxMsgSize,
  );

  const unique2moonbeam = api.tx.hrmp.forceOpenHrmpChannel(
    uniqueId,
    moonbeamId,
    maxCapacity,
    maxMsgSize,
  );

  const batchAll = api.tx.utility.batchAll([
    moonbeam2unique,
    unique2moonbeam,
  ]);

  const sudoCall = api.tx.sudo.sudo(batchAll);

  await sudoCall.signAndSend(alice);

  // Wait for the next Relay session when the channels become operational
  // This can be an overestimation, it can be improved.
  const sessionTime = 2 * 60 * 1000;
  await new Promise(f => setTimeout(f, sessionTime));

  await api.disconnect();
}

await main();
