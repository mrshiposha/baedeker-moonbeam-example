local
m = import 'baedeker-library/mixin/spec.libsonnet',
;


function(relay_spec)

local relay = {
    name: 'relay',
    bin: 'bin/polkadot',
    validatorIdAssignment: 'staking',
    spec: {Genesis:{
        chain: relay_spec,
        modify:: m.genericRelay($),
    }},
    nodes: {
        [name]: {
            bin: $.bin,
            wantedKeys: 'relay',
            expectedDataPath: '/parity',
        },
        for name in ['alice', 'bob', 'charlie', 'dave', 'eve']
    },
};

local assethub = {
    name: 'assethub',
    bin: 'bin/assethub',
    paraId: 1000,
    spec: {Genesis:{
        chain: 'asset-hub-westend-local',
        modify:: m.genericPara($),
    }},
    nodes: {
        [name]: {
            bin: $.bin,
            wantedKeys: 'para',
            parentConnection: 'internal-samedir',
            expectedDataPath: '/parity',    
            extraArgs: [
                '-lxcm=trace',
            ],
        },
        for name in ['alice', 'bob']
    },
};

local moonbeam = {
	name: 'moonbeam',
	bin: 'bin/moonbeam',
	signatureSchema: 'Ethereum',
	paraId: 2004,
	spec: {Genesis:{
		chain: 'moonbeam-local',
		specFilePrefix: 'moonbeam-local-',
		modify:: m.genericPara($),
	}},
	nodes: {
		[name]: {
			bin: $.bin,
			wantedKeys: 'para-nimbus',
            extraArgs: [
                '-lxcm=trace',
                '-levm=trace',
            ],
		},
		for name in ['alith', 'baltathar']
	},
};

local unique = {
	name: 'unique',
	bin: 'bin/unique',
	paraId: 1001,
	spec: {Genesis:{
		modify:: m.genericPara($),
	}},
	nodes: {
		[name]: {
			bin: $.bin,
			wantedKeys: 'para',
			extraArgs: [
				'--increase-future-pool',
    			'--pool-type=fork-aware',
                '-lxcm=trace'
			],
		},
		for name in ['alice', 'bob', 'charlie', 'dave', 'eve']
	},
};

relay + {
    parachains: {
        [para.name]: para,
        for para in [assethub, moonbeam, unique]
    },
}
