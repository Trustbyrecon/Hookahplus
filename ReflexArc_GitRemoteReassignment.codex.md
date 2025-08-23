# ReflexArc: Git Remote Reassignment

## Purpose
Document how to point a local Hookah+ project folder to the canonical repository.

## Steps
1. Ensure you're inside your local `Hookahplus` directory.
2. Run the following command to set the `origin` remote:
   ```bash
   git remote set-url origin https://github.com/Trustbyrecon/Hookahplus.git
   ```
   If `origin` doesn't exist yet, use `git remote add` instead.

The repository now tracks the canonical location and can pull or push updates accordingly.
