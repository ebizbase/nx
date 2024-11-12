# Contribution Guidelines

First off, thank you for considering contributing to our project! We appreciate your time and effort in helping us improve.

The following is a set of guidelines for contributing to this project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [INSERT CONTACT EMAIL].

## How Can I Contribute?

### Reporting Bugs

If you find a bug in the project, please open an issue on GitHub. Be sure to include:

- A clear and descriptive title.
- A detailed description of the problem.
- Steps to reproduce the issue.
- Any relevant logs or screenshots.

### Suggesting Enhancements

If you have an idea for an enhancement or new feature, please open an issue on GitHub. Be sure to include:

- A clear and descriptive title.
- A detailed description of the enhancement or feature.
- Any relevant examples or use cases.

### Submitting Pull Requests

1. Fork the repository.
2. Create a new branch from `main` (e.g., `feature/my-new-feature`).
3. Make your changes.
4. Ensure your changes pass all tests and adhere to the project's coding standards.
5. Commit your changes using a conventional commit message (see below).
6. Push your branch to your forked repository.
7. Open a pull request against the `main` branch of the original repository.

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for our commit messages. This helps us maintain a clean and readable commit history. Please adhere to the following format:

```text
<type>(<scope>): <subject>
```

### Types

- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing or correcting existing tests.
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
- `chore`: Other changes that don't modify src or test files.
- `revert`: Reverts a previous commit.

### Scopes

The scope should be the name of the project or module affected (as perceived by the person reading the changelog generated from commit messages).

See all of scope supported with command:

```shell
node rules.js
```

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes".
- Do not capitalize the first letter.
- Do not end the subject with a period.

### Examples

```text
feat(parser): add ability to parse arrays
fix(parser): handle null pointer exceptions
docs(readme): update contributing guidelines
style: fix linting issues refactor: remove redundant code
```
