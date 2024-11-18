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
        modify:: bdk.mixer([
            m.genericRelay($),
            {
                genesis+: {
                    runtimeGenesis+: {
                        runtime+: {
                            configuration+: {
                                config+: {
                                    async_backing_params+: {
                                        allowed_ancestry_len: 3,
                                        max_candidate_depth: 4,
                                    },
                                    scheduling_lookahead:5,
                                    max_validators_per_core:2,
                                    minimum_backing_votes:2,
                                    needed_approvals:2,
                                    on_demand_cores:5,
                                },
                            },
                        },
                    },
                },
            },
        ]),
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
		},
		for name in ['alith', 'baltathar']
	},
};

relay + {
    parachains: {
        [para.name]: para,
        for para in [assethub, moonbeam]
    },
}