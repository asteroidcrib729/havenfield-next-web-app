# Free personal-portfolio backups

Disposition updated 2026-10-17: independent Drive transfer and daily scheduling are optional operator follow-up under [the Plan 02 closure](development-plan-02-closure.md). Existing tools and verified local archives remain available. No cloud copy or automatic schedule is claimed, and these steps do not block Plan 03.

Decision, 2026-10-16: use the owner's existing personal **Google Drive** account and a private `Havenfield Backups` folder. No payment, card authorization, paid trial, Google One subscription or Google Cloud billing is required for this approach. Google's [personal storage documentation](https://support.google.com/googleone/answer/9004014) describes the free allowance shared with Gmail and Photos. Check remaining space in your account before uploading.

## Section 01 — Scope and current status

This is an independent destination from Vercel and Prisma. Only encrypted `.hfbackup` files belong in the Drive folder. Keep sharing **Restricted**. Do not upload raw recovery directories, `.env` files, access records or the recovery key. The source repository and its static assets remain a separate source/asset backup; runtime bundles include database records and registered uploaded image bytes.

Fresh Production and Preview archives were encrypted and successfully decrypted locally on 2026-10-16. A historical bundle containing a real 234,042-byte hosted image also passed encryption/decryption. **Drive upload, download verification and automatic scheduling have not been completed.** A local encrypted archive alone is not proof of an independent cloud backup. P02-01 is explicitly deferred, not recorded as technically verified. The current session cannot control the owner's existing signed-in Chrome window or inherit its Google permissions.

## Section 02 — Upload using your existing Chrome session

1. Open [Google Drive](https://drive.google.com) in your signed-in Chrome window. Create a private folder named `Havenfield Backups`; keep General access set to Restricted.
2. Open the project's ignored `.data/private-drive-exports` directory. Select only the two fresh `havenfield-production-*.hfbackup` and `havenfield-preview-*.hfbackup` files. Ignore raw/verified directories and the separate media test archive.
3. Upload these two files with **New → File upload** or drag them into the folder. No desktop client is needed for a manual upload. [Google's Drive guide](https://support.google.com/drive/answer/2424384?hl=en) covers browser uploads.
4. Keep a protected copy of `.cache/backup-encryption.key` in your password manager's secure attachments or on a separately protected offline device. **Do not keep the only recovery key on this computer or beside the archives in Drive.** This binary key is required for decryption; your Google password cannot replace it.
5. Download an archive from Drive into a separate ignored local directory, decrypt it with the command below and compare its SHA-256 to the original. Tell me when the upload is done and where the downloaded copy is so I can verify it. Do not share the key in chat.

The exact current archive paths/checksums and private recovery-key path are recorded locally in ignored `.cache/free-operations/owner-backups.json`. That file is operational metadata and should stay private.

## Section 03 — Repeatable commands

The default key is `.cache/backup-encryption.key`; `BACKUP_KEY_FILE` can select another private key path. Never regenerate or replace the key used for existing archives. `backup:key` creates a random 32-byte binary key and refuses to overwrite an existing file.

```powershell
# Initial setup only, if no key exists:
npm.cmd run backup:key

# Export with the intended private environment configured first:
npm.cmd run recovery:export

# Encrypt a selected complete bundle to a NEW output file:
npm.cmd run backup:encrypt -- .data/backups/SELECTED-BUNDLE .data/NEW-SNAPSHOT.hfbackup

# Decrypt a downloaded archive into a NEW directory:
npm.cmd run backup:decrypt -- .data/DOWNLOADED-SNAPSHOT.hfbackup .data/NEW-RESTORE-BUNDLE

# Then use the existing dedicated-empty-target recovery procedure:
# See database-recovery.md; do not restore over either active database.
```

The export command loads `.env.local`, which currently targets **Preview**. Do not assume it exports Production. Production exports must use the private Production operator environment, verify the `production` database binding, and keep those values out of shell history and logs. The fresh archives prepared in this delivery were explicitly checked against their respective database bindings.

Encryption uses authenticated AES-256-GCM, a fresh 12-byte nonce per archive and gzip compression. Headers are authenticated; wrong keys or changed ciphertext fail before extraction. Extracted filenames are restricted, existing outputs are refused, and the recovered database/media manifest is verified. Archives have a 256 MiB in-memory limit; a larger site needs a streaming backup tool. Windows file protections depend on your account and filesystem ACLs; the requested POSIX file mode alone is not a Windows access-control guarantee.

## Section 04 — Daily operation without billing

Policy remains one export daily and before schema changes, retaining seven daily and four weekly copies **per environment**. Upload and verify a new copy before removing an older owned copy. Manual uploads are appropriate initially for this personal portfolio, but do not satisfy an automated daily-backup acceptance gate.

For unattended uploads, Google Drive for desktop plus a Windows scheduled task is the simplest next step on this machine. You must sign into that client once and provide the local path of the private backup folder. Encrypt before writing there. A task can run daily at 20:00 Pakistan Standard Time and when a missed run becomes available; it depends on this computer being on, signed in and online. A synced local file is not proof of a completed cloud upload: verify sync status and periodically download/decrypt a copy. No task or desktop software has been installed in this delivery.

An always-on scheduled runner would need separately authorized Drive API credentials. That is optional here. Do not add database credentials or backup artifacts to the public repository, public workflow artifacts or public release downloads to avoid setting up private storage.

## Section 05 - Optional follow-up checklist

- [x] Select a viable no-card independent destination.
- [x] Implement authenticated encryption/decryption and corruption/overwrite/path safety checks.
- [x] Prepare and locally verify current encrypted Production and Preview archives.
- [ ] Owner uploads archives to Restricted Drive folder and stores a separate recovery key.
- [ ] Verify an archive downloaded from that independent destination.
- [ ] Configure and observe real daily backup/rotation if keeping P02-01's automation requirement.
- [ ] Complete public application recovery acceptance separately from the private storage exercise.
