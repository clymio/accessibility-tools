# Contributing to Accessibility Tools

Thank you for considering contributing! We welcome all contributions, including bug fixes, new features, documentation updates, and discussions.

## Getting Started

1. Fork the repository and clone your fork locally
2. Follow the setup instructions provided in the **[README](README.md)**

## Branching

- Create a new branch from master for any of your work
- Use the following naming convention for the branches:
  - feature/xyz (for features)
  - bugfix/xyz (for bugs)

## Development Standards

- **Code Style**: Use Prettier/ESLint for consistent formatting. Run the following command before each commit:

  ```bash
  npm run lint
  ```

- **Small, Focused changes**: Keep PRs focused on a single topic. Smaller PRs are easier to review
- **Documentation**: Update the README or any of the other docs if your changes setup, usage or architecture

## Database Changes

**Accessibility Tools** uses Sequelize + SQLite to manage the database. The folder structure for the database related files is as follows:

- src/electron/db/
  - models/ : stores all the sequelize models that are translated into sqlite tables
    - system/ : stores all the system models. The tables created are prefixed with `system_`
  - migrations/ : stores sequelize migration files

For any updates to the database structure, the following steps need to be followed:

1. Create a new migration file under src/electron/db/migrations/. This file should have an incremented version based on the existing migration files and a feature name. E.g. if the migrations folder has:

   ```plaintext
   1.0.1-featureA.js
   1.0.1-featureB.js
   ```

   The new migration file that you add should look like this:

   ```plaintext
   1.0.2-featureName.js
   ```

2. Update the relevant model files under src/electron/db/models/.
3. Update the package.json version.
4. Run the app using:

   ```bash
   npm run dev
   ```

   This will run the migration file, sync the models and update the system data locally, if there are any changes there.

## Pull Request Process

1. Push your branch
2. Open a Pull Request (PR) to master
3. Respond to review feedback promptly
4. Your PR will be merged once it's approved and passes CI checks

## Community

All contributors are expected to follow our **[Code of Conduct](CODE_OF_CONDUCT.md)** to ensure a welcoming environment for everyone.
