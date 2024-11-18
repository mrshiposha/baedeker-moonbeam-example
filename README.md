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
