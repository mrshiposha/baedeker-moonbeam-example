function(prev, repoDir)
(import 'baedeker-library/ops/rewrites.libsonnet').rewriteNodePaths({
	'bin/polkadot': { dockerImage: 'parity/polkadot:stable2409-2' },
	'bin/assethub': { dockerImage: 'parity/polkadot-parachain:stable2409-2' },

	# FIXME
	'bin/moonbeam': '/absolute/path/to/moonbeam/target/release/moonbeam',
	'bin/unique': '/absolute/path/to/unique/chain/target/release/unique-collator',

})(prev)
