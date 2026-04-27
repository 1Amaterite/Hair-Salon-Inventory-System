# Hair-Salon-Inventory-System

## Before all
npm install
.env.example (change to what you need with your local PostgreSQL pass)

## Contributing Guidelines

For every change, consider the following:

1. Pull latest changes from the `main` branch (or, if you need changes from a branch that hasn't been merged into `main` yet, pull from that branch)

2. Create a new branch for each task or feature

3. Commit frequently

4. Open a pull request (PR) for review when you consider your task to be done

5. Do not commit directly to `main` unless explicitly agreed.

## Branching convention
Use descriptive branch names:
- `feat/description` - "features" imply changes to or new functionality
- `fix/description` - "fixes" eliminate bugs or recover functionality
- `refactor/description` - "refactors" change code without changing functionality (or sometimes, only slightly change functionality)
- `style/description` - when only code formatting was changed, or documentation was added

Examples:

`feat/remember-me` (if we were to implement "Remember me" for logins)

`fix/reviews-not-sorted-properly`

## Commit message format

More lax here, but still keep commits somewhat structured:

`type: short description`

Common types: `feat`, `fix`, `refactor`, `style`, `test`, etc.

## Pull request rules
Before submitting a PR:

1. Ensure code runs without errors.
2. Keep PRs focused (avoid mixing unrelated changes)
3. Add explanations of what changed and why
4. Include screenshots for UI changes when applicable
5. Request a review from at least one other team member before merging



