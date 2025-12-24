# Removing Secrets from Git History

## ⚠️ **Problem**
GitHub secret scanning detected secrets (Square Application ID, Secret, Encryption Key) in commit history and blocked the push.

## ✅ **Solution Options**

### **Option 1: Rewrite Git History (Recommended for Security)**

This removes the secrets from all previous commits:

```bash
# Install git-filter-repo (if not installed)
# Windows: choco install git-filter-repo
# Mac: brew install git-filter-repo
# Or: pip install git-filter-repo

# Navigate to repo root
cd /path/to/Hookahplus

# Remove secrets from all commits
git filter-repo --replace-text <(cat <<EOF
sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX==>sandbox-sq0idb-XXXXXXXXXXXXXXXXXXXX
sandbox-sq0csb-XXXXXXXXXXXXXXXXXXXX==>sandbox-sq0csb-XXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX==>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EOF
)

# Force push (WARNING: This rewrites history)
git push origin stable-production --force
```

### **Option 2: Use GitHub's Unblock Feature (Quick Fix)**

If these are **sandbox/test credentials** and you're okay with them being in history:

1. Visit the unblock URL from the error:
   ```
   https://github.com/Trustbyrecon/Hookahplus/security/secret-scanning/unblock-secret/37GujA9dIHIfxfbQNIBgiKJ29J1
   ```

2. Click "Allow secret" (only if these are test credentials)

3. Push again:
   ```bash
   git push origin stable-production
   ```

**⚠️ WARNING:** Only use this if the secrets are test/sandbox credentials that can be rotated.

### **Option 3: Interactive Rebase (Manual Edit)**

Edit the commits that contain secrets:

```bash
# Start interactive rebase
git rebase -i HEAD~3

# Mark commits with secrets as "edit"
# In the editor, change "pick" to "edit" for:
# - ad0f885 Add Square OAuth setup and troubleshooting documentation
# - e0d9c78 Square App Marketplace integration complete

# For each commit being edited:
git show HEAD --name-only  # See what files changed
# Edit files to remove secrets
git add <files>
git commit --amend --no-edit
git rebase --continue

# Force push after rebase
git push origin stable-production --force
```

## 🔐 **Prevention: Rotate Secrets**

After removing secrets from history, **rotate them**:

1. **Square Application Secret:**
   - Go to Square Developer Console
   - Regenerate the Application Secret
   - Update in Vercel and `.env.local`

2. **Encryption Key:**
   - Generate a new 64-character hex key:
     ```bash
     openssl rand -hex 32
     ```
   - Update in Vercel and `.env.local`
   - **Note:** This will require re-encrypting existing Square tokens in the database

## 📋 **Recommended Steps**

1. ✅ **Already Done:** Removed secrets from current documentation files
2. ⏭️ **Next:** Choose one of the options above
3. 🔄 **Then:** Rotate the exposed secrets
4. ✅ **Finally:** Push successfully

## 🚨 **Important Notes**

- **Force push rewrites history** - coordinate with team if others have pulled
- **Rotate secrets** even if you unblock them - they're now in git history
- **Use environment variables** - never commit secrets to git
- **Check `.gitignore`** - ensure `.env*` files are ignored

---

**Current Status:** Secrets removed from latest commit. Previous commits (`ad0f885`, `e0d9c78`) still contain secrets and need to be cleaned.

