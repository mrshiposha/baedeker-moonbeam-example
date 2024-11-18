# baedeker-moonbeam-example

This example sets up the Polkadot Relay, Asset Hub, and Moonbeam chains.

## How to run

1. Install [direnv](https://direnv.net/).
2. After `direnv` is installed, when you `cd` into this repository directory you'll see the following:
```console
direnv: error <PATH TO>/.envrc is blocked. Run `direnv allow` to approve its content
```
3. Run `direnv allow`.
4. Run `cd .baedeker`.
5. Run `cp rewrites.example.jsonnet rewrites.jsonnet`
6. The Relay and Asset Hub binaries will extracted from the docker images. But the Moonbeam binary is to be provided by you since it is assumed you'll modify Moonbeam's code. It is convenient to use your local binary. So, fix the `rewrites.jsonnet` by providing the correct path to Moonbeam's binary.
7. Try to run the networks (remember, we are still in the `.baedeker` directory):
```
./up.sh chains.jsonnet
```

There are the potential errors you could encounter when starting the networks:

<details>
    <summary>No such image (you WILL have this error upon the first run attempt)</summary>

```console
docker: Error response from daemon: No such image: parity/polkadot-parachain:stable2409-2.
See 'docker run --help'.
ERROR baedeker: runtime error: spec builder: docker finished with non-zero exit code; spec dumped to ""
Command was: "timeout" "-s" "INT" "25" "docker" "run" "--rm" "-e" "RUST_LOG=debug,wasmtime_cranelift=info" "-e" "RUST_BACKTRACE=full" "-e" "COLORBT_SHOW_HIDDEN=1" "--pull" "never" "parity/polkadot-parachain:stable2409-2" "build-spec" "--base-path" "/tmp/node" "--chain" "asset-hub-westend-local"
    vendor/baedeker-library/inputs/base.libsonnet:14:63-100:     function <builtin_process_spec> call
    <build spec for relay-assethub>
    vendor/baedeker-library/inputs/base.libsonnet:14:12-101:     function <builtin_description> call
    vendor/baedeker-library/outputs/compose.libsonnet:99:61-70:  field <specJson> access
    argument <value> evaluation
    vendor/baedeker-library/outputs/compose.libsonnet:99:36-101: function <builtin_manifest_json_ex> call
```

Look at the first line and notice `No such image: parity/polkadot-parachain:stable2409-2`. It means you need to pull the docker image. So, to solve this issue you need to run the following:
```console
docker pull parity/polkadot-parachain:stable2409-2
```

This repository refers to two docker images so that you will see these errors twice.

</details>

<details>
<summary>bind source path does not exist (an unlikely error)</summary>

```console
docker: Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /tmp/.tmpaPE4Ju.
See 'docker run --help'.
ERROR baedeker: runtime error: spec builder: docker finished with non-zero exit code; spec dumped to "/tmp/.tmpaPE4Ju"
Command was: "timeout" "-s" "INT" "25" "docker" "run" "--rm" "-e" "RUST_LOG=debug,wasmtime_cranelift=info" "-e" "RUST_BACKTRACE=full" "-e" "COLORBT_SHOW_HIDDEN=1" "--pull" "never" "--mount" "type=bind,source=/tmp/.tmpaPE4Ju,target=/tmp/spec.json,readonly" "parity/polkadot-parachain:stable2409-2" "build-spec" "--raw" "--base-path" "/tmp/node" "--chain" "/tmp/spec.json"
    vendor/baedeker-library/inputs/base.libsonnet:14:63-100:     function <builtin_process_spec> call
    <build spec for relay-assethub>
    vendor/baedeker-library/inputs/base.libsonnet:14:12-101:     function <builtin_description> call
    vendor/baedeker-library/outputs/compose.libsonnet:99:61-70:  field <specJson> access
    argument <value> evaluation
    vendor/baedeker-library/outputs/compose.libsonnet:99:36-101: function <builtin_manifest_json_ex> call
```

This error might appear depending on how your OS is configured.
You can solve it this way:
```console
# (inside the .baedeker directory)
# create a local .tmp directory
mkdir .tmp

# always run the networks like this
TMPDIR=./.tmp ./up.sh chains.jsonnet
```

</details>

8. To shut the networks down, run `./down.sh`.
9. Always do `./down.sh` before trying to start networks.

When you run `./up.sh chains.jsonnet` you should see something like the following (if everything's alright)
```console
 ✔ Network bdk-env_default                                          Created                                                                                                           0.1s 
 ✔ Volume "bdk-env_chaindata-relay-moonbeam-node-alith-parent"      Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-node-alice"                      Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-node-charlie"                    Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-assethub-node-alice"             Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-node-bob"                        Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-moonbeam-node-alith"             Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-node-dave"                       Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-moonbeam-node-baltathar"         Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-moonbeam-node-baltathar-parent"  Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-assethub-node-bob"               Created                                                                                                           0.0s 
 ✔ Volume "bdk-env_chaindata-relay-node-eve"                        Created                                                                                                           0.0s 
 ✔ Container bdk-env-relay-moonbeam-node-alith-1                    Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-node-alice-1                             Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-polkadot-apps-1                                Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-node-charlie-1                           Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-node-eve-1                               Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-assethub-node-bob-1                      Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-node-bob-1                               Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-assethub-node-alice-1                    Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-node-dave-1                              Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-relay-moonbeam-node-baltathar-1                Healthy                                                                                                           4.9s 
 ✔ Container bdk-env-nginx-1                                        Healthy                                                                                                           4.4s 
direnv: loading ~/dev/work/unique/baedeker-example/.envrc                                                                                                                                  
direnv: loading ~/dev/work/unique/.envrc
direnv: using flake ./nix
direnv: nix-direnv: Using cached dev shell
Baedeker env updated
Enjoy your baedeker networks at http://127.0.0.1:9699/
direnv: export +AR +AS +BDK_BALANCER +CC +CONFIG_SHELL +CXX +DETERMINISTIC_BUILD +HOST_PATH +IN_NIX_SHELL +LD +LIBCLANG_PATH +NIX_BINTOOLS +NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CC +NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_CFLAGS_COMPILE +NIX_ENFORCE_NO_NATIVE +NIX_HARDENING_ENABLE +NIX_LDFLAGS +NIX_PKG_CONFIG_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu +NIX_STORE +NM +NODE_PATH +OBJCOPY +OBJDUMP +PKG_CONFIG +PKG_CONFIG_PATH +PROTOC +PYTHONHASHSEED +PYTHONNOUSERSITE +PYTHONPATH +RANLIB +READELF +RELAY_ASSETHUB_HTTP_URL +RELAY_ASSETHUB_ID +RELAY_ASSETHUB_NODE_ALICE_STASH +RELAY_ASSETHUB_NODE_BOB_STASH +RELAY_ASSETHUB_URL +RELAY_HTTP_URL +RELAY_MOONBEAM_HTTP_URL +RELAY_MOONBEAM_ID +RELAY_MOONBEAM_NODE_ALITH_STASH +RELAY_MOONBEAM_NODE_BALTATHAR_STASH +RELAY_MOONBEAM_URL +RELAY_URL +RUSTFLAGS +SIZE +SOURCE_DATE_EPOCH +STRINGS +STRIP +WINDRES +_PYTHON_HOST_PLATFORM +_PYTHON_SYSCONFIGDATA_NAME +__structuredAttrs +buildInputs +buildPhase +builder +cmakeFlags +configureFlags +depsBuildBuild +depsBuildBuildPropagated +depsBuildTarget +depsBuildTargetPropagated +depsHostHost +depsHostHostPropagated +depsTargetTarget +depsTargetTargetPropagated +doCheck +doInstallCheck +dontAddDisableDepTrack +mesonFlags +name +nativeBuildInputs +out +outputs +patches +phases +preferLocalBuild +propagatedBuildInputs +propagatedNativeBuildInputs +shell +shellHook +stdenv +strictDeps +system ~PATH ~XDG_DATA_DIRS
```

You can open the link the baedeker tells you (`http://127.0.0.1:9699/` in the example above). The link is provided via the `$BDK_BALANCER` env variable.
When opened, you'll see a list of links to the running chains in the browser. 
