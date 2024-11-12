# nx-docker

The NX plugin to build, push containers, and analyze images from your applications

## Prerequisites

- Ensure you have Docker installed and running on your machine.
- Ensure you have NX installed in your workspace.

## Installation

To install the `nx-docker` plugin, run the following command:

```bash
npm install -D @ebizbase/nx-docker
yarn add -D @ebizbase/nx-docker
pnpm add -D @ebizbase/nx-docker
```

## Build image

> **Note**: Docker have been [deprecated docker build](https://docs.docker.com/engine/deprecated/#legacy-builder-fallback) which requires the Buildx component to build images with BuildKit. So from now on we will not support docker build related issues. And in the future we will require buildx to be installed.

Bellow config simple build docker image and load it in local registry. You can see image with `docker image ls` after build.

```json
{
  "targets": {
    "build": {
      "executor": "@ebizbase/nx-docker:build",
      "options": {
        "tags": ["your-app:latest"],
        "outputs": ["type=image"]
      }
    }
  }
}
```

If you want to build and push image let referance bellow example

```json
{
  "targets": {
    "build": {
      "executor": "@ebizbase/nx-docker:build",
      "options": {
        "tags": ["docker.io/org/your-app:latest", "ghcr.io/ogr/your-app:latest"],
        "outputs": ["type=registry"]
      }
    }
  }
}
```

Let's see more about [docker buildx build output options](https://docs.docker.com/reference/cli/docker/buildx/build/#output)

Bellow is all options of @ebizbase/nx-docker:build

| Property     | Type     | Description                                                                | Default | Required |
| ------------ | -------- | -------------------------------------------------------------------------- | ------- | -------- |
| `ci`         | boolean  | Run in CI mode                                                             | `false` | No       |
| `outputs`    | string[] | The output of the build                                                    |         | No       |
| `args`       | string[] | The arguments to pass to the docker build command                          |         | No       |
| `file`       | string   | The dockerfile to use for building the image                               |         | No       |
| `context`    | string   | The context to use for building the image                                  |         | No       |
| `tags`       | string[] | The tag of the image to build                                              |         | Yes      |
| `addHost`    | string[] | Add a custom host-to-IP mapping (host:ip)                                  |         | No       |
| `allow`      | string[] | Allow extra privileged entitlement (e.g., network.host, security.insecure) |         | No       |
| `annotation` | string[] | Set metadata for an image                                                  |         | No       |
| `attest`     | string[] | Attest the image with an attestation provider                              |         | No       |
| `cacheFrom`  | string[] | Images to consider as cache sources                                        |         | No       |
| `cacheTo`    | string[] | Images to consider as cache destinations                                   |         | No       |
| `shm-size`   | string   | Size of /dev/shm                                                           |         | No       |
| `target`     | string   | Set the target build stage to build                                        |         | No       |
| `ulimit`     | string[] | Ulimit options                                                             |         | No       |
| `platform`   | string[] | Set the target platform for the build                                      |         | No       |
| `ulimit`     | string[] | The metadata will be written as a JSON object to the specified file.       |         | No       |

> `shm-size` and `ulimit` are only available using `moby/buildkit:master`
> as builder image atm:
>
> ```yaml
> - name: Set up Docker Buildx
>   uses: docker/setup-buildx-action@v1
>   with:
>   driver-opts: |
>     image=moby/buildkit:master
> ```

To check all possible options please check this [schema.json](./src/executors/build/schema.json) file

## Analyze image

@ebizbase/nx-docker:analyze using [dive](https://github.com/wagoodman/dive) for analyze image

The example of analyze executor

```json
{
  "targets": {
    "analyze": {
      "dependsOn": ["build"],
      "executor": "@ebizbase/nx-docker:analyze",
      "options": {
        "image": "your-app:latest"
      }
    }
  }
}
```

You can validate of image with `ci` option like this

```json
{
  "targets": {
    "analyze": {
      "dependsOn": ["build"],
      "executor": "@ebizbase/nx-docker:analyze",
      "options": {
        "image": "your-app:latest",
        "ci": true,
        "highestUserWastedRatio": 0.1
      }
    }
  }
}
```

Or in ci/cd you can overwrite config with template `--[options]=value.` Example

```shell
nx run project-name:analyze --ci --highestUserWastedRatio 0.1
```

So ci will failed when wasted ratio greater than 10%

Bellow is all options of @ebizbase/nx-docker:analyze

| Option                   | Type    | Description                                                                                                                                          | Default  |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `ci`                     | boolean | Skip the interactive TUI and validate against CI rules                                                                                               | `false`  |
| `highestUserWastedRatio` | number  | (only valid with --ci given) highest allowable percentage of bytes wasted (as a ratio between 0-1), otherwise CI validation will fail. (default 0.1) |          |
| `highestUserWastedBytes` | number  | (only valid with --ci given) highest allowable bytes wasted, otherwise CI validation will fail. Set -1 mean disabled                                 |          |
| `lowestEfficiencyRatio`  | number  | (only valid with --ci given) lowest allowable image efficiency (as a ratio between 0-1), otherwise CI validation will fail. (default 0.9)            |          |
| `ignoreError`            | boolean | Ignore image parsing errors and run the analysis anyway                                                                                              | `false`  |
| `source`                 | string  | The container engine to fetch the image from. Allowed values: docker, podman, docker-archive (default docker)                                        | `docker` |
| `image`                  | string  | The image to analyze                                                                                                                                 |          |
| `dockerSocket`           | string  | The docker socket to use for the analysis                                                                                                            |          |
| `version`                | string  | The version of dive to use                                                                                                                           |          |

## License

This project is licensed under the MIT License.
