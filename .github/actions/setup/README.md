# Setup Project Composite Action

This composite action sets up a project with Node.js, pnpm, and Docker Buildx.

Version: 0.0.0 <!-- x-release-please-version -->

## Inputs

- `dependencies`: Install dependencies (default: `false`)
- `docker-buildx`: Install Docker Buildx (default: `false`)

## Example Usage

```yaml
name: CI

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Setup project
        uses: ebizbase/ebizbase/actions/setup
        with:
          dependencies: true
          docker-buildx: true
```
