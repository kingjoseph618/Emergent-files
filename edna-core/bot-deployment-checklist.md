# Bot Deployment Checklist Template

## BEFORE A BOT BUILDS ANYTHING - REQUIRED SPECIFICATIONS

Use this checklist every time you request bot work. Bot should NOT proceed without answers to all sections.

---

## 1. DOMAIN & AUTHORITY
- [ ] **Domain(s) this bot operates under:** ________________
- [ ] **Email domain(s) authorized:** ________________
- [ ] **Other domains bot will encounter (read-only):** ________________
- [ ] **Folder/account restrictions:** ________________
- [ ] **Data isolation required:** Yes / No

---

## 2. INPUT SOURCES
- [ ] **File types to process:**
  - [ ] Google Docs
  - [ ] Google Sheets
  - [ ] Word (.docx)
  - [ ] PDF
  - [ ] Video transcripts (format: ____________)
  - [ ] Text files (.txt)
  - [ ] Other: ________________

- [ ] **Input location:**
  - [ ] Google Drive folder ID: ________________
  - [ ] Include subfolders: Yes / No
  - [ ] Local machine path: ________________
  - [ ] GitHub repository: ________________
  - [ ] Slack channel: ________________

---

## 3. PROCESSING LOGIC
- [ ] **What should bot DO with each file:**
  - [ ] Summarize (style: ________________)
  - [ ] Extract data (type: ________________)
  - [ ] Scan for keywords: ________________
  - [ ] Create report
  - [ ] Other: ________________

- [ ] **Output detail level:**
  - [ ] Minimal (1-2 sentences)
  - [ ] Standard (1 paragraph)
  - [ ] Detailed (bullet points)
  - [ ] Comprehensive (full analysis)
  - [ ] Custom format: ________________

---

## 4. DEDUPLICATION & CHANGE DETECTION
- [ ] **How to detect if file was already processed:**
  - [ ] By file hash (content-based)
  - [ ] By modification date
  - [ ] By log entry
  - [ ] Other: ________________

- [ ] **What triggers re-processing:**
  - [ ] File content changed
  - [ ] File moved to different folder
  - [ ] Manual override flag
  - [ ] Other: ________________

- [ ] **Max age for files to re-scan:** ________________ days

---

## 5. OUTPUT & LOGGING
- [ ] **Where should results go:**
  - [ ] Google Doc (create new: ________________)
  - [ ] Google Sheet (create new: ________________)
  - [ ] CSV file (location: ________________)
  - [ ] Slack (channel: ________________)
  - [ ] Email (to: ________________)
  - [ ] GitHub (repo/file: ________________)
  - [ ] Other: ________________

- [ ] **Log format - MUST INCLUDE:**
  - [ ] Timestamp (ISO format)
  - [ ] File name
  - [ ] File ID / URL
  - [ ] File hash
  - [ ] Owner/creator
  - [ ] Created date
  - [ ] Modified date
  - [ ] File size
  - [ ] Processing status (success/skip/error)
  - [ ] Summary/output
  - [ ] Bot name/ID
  - [ ] Processing time
  - [ ] Error messages (if any)

- [ ] **Log organization:**
  - [ ] Single running log (append all entries)
  - [ ] Separate log per file
  - [ ] Daily log files
  - [ ] Other: ________________

---

## 6. EXECUTION SCHEDULE
- [ ] **First run:**
  - [ ] Manual trigger only
  - [ ] Automated on [date/time]

- [ ] **Subsequent runs (after initial):**
  - [ ] Manual trigger only
  - [ ] Every _______ minutes
  - [ ] Every _______ hours
  - [ ] Daily at _______ time
  - [ ] Weekly on _______ day
  - [ ] On file upload/modification only
  - [ ] Other: ________________

- [ ] **Timeout tolerance:** Bot should fail gracefully after _______ seconds

---

## 7. ERROR HANDLING & RECOVERY
- [ ] **On error, bot should:**
  - [ ] Log error with full details
  - [ ] Continue processing remaining files
  - [ ] Retry failed file (max _______ attempts)
  - [ ] Send alert to: ________________
  - [ ] Stop and report
  - [ ] Other: ________________

- [ ] **Files bot CANNOT process (expected):**
  - [ ] Binary files (images, videos, archives)
  - [ ] Encrypted files
  - [ ] Large files (>_______ MB)
  - [ ] Specific file types: ________________

- [ ] **Action for unprocessable files:**
  - [ ] Log as "SKIPPED" with reason
  - [ ] Log as "ERROR" requiring manual review
  - [ ] Ignore completely
  - [ ] Other: ________________

---

## 8. PERSISTENCE & STATE
- [ ] **Bot must persist state across:**
  - [ ] Sessions (survive logout/login)
  - [ ] Crashes (resume where it left off)
  - [ ] Time (don't lose progress after hours/days)

- [ ] **State storage location:** ________________

- [ ] **Bot MUST NOT:**
  - [ ] Forget what it already processed
  - [ ] Process same file twice
  - [ ] Lose log entries
  - [ ] Access unauthorized domains
  - [ ] Other: ________________

---

## 9. PERFORMANCE & QUOTAS
- [ ] **Expected file volume:** _______ files per run

- [ ] **Acceptable runtime:** _______ minutes max

- [ ] **Throttling needed:** Yes / No
  - If yes, sleep _______ seconds between files

- [ ] **API/quota concerns:**
  - [ ] Google Drive API rate limits
  - [ ] Google Docs read limits
  - [ ] Email sending limits
  - [ ] Slack API limits
  - [ ] Other: ________________

---

## 10. METADATA TIMELINE REQUIREMENTS
- [ ] **Every log entry MUST track:**
  - [ ] Exact timestamp (ISO 8601)
  - [ ] Bot version/name
  - [ ] User/domain that triggered scan
  - [ ] All file metadata (see section 5)
  - [ ] Processing duration
  - [ ] Source file hash (for change detection)

- [ ] **Create digital signature for:**
  - [ ] Who created output document
  - [ ] When it was created
  - [ ] What triggered the creation
  - [ ] Chain of custody

- [ ] **Master timeline document:**
  - [ ] Name: ________________
  - [ ] Location: ________________
  - [ ] Format: ________________

---

## 11. TESTING REQUIREMENTS
- [ ] **Before deployment, bot must run successfully for:**
  - [ ] _______ test files
  - [ ] _______ hours minimum
  - [ ] Without human intervention

- [ ] **Test should verify:**
  - [ ] Correct files are found
  - [ ] Files are processed in order (FIFO)
  - [ ] Duplicates are detected and skipped
  - [ ] Outputs are logged correctly
  - [ ] No data loss on crash/restart
  - [ ] Metadata is complete and accurate

- [ ] **Success criteria:** ________________

---

## 12. BOT BEHAVIOR RULES
- [ ] **Bot MUST:**
  - [ ] Process FIFO (first in, first out - NOT last heard wins)
  - [ ] Complete tasks in order given
  - [ ] Log everything it does
  - [ ] Show its work (don't hide details)
  - [ ] Survive logout/session end
  - [ ] Stay in assigned domain only
  - [ ] Report failures clearly
  - [ ] Resume after interruption

- [ ] **Bot MUST NOT:**
  - [ ] Forget context between runs
  - [ ] Skip middle tasks
  - [ ] Create outputs without logging
  - [ ] Cross domain boundaries
  - [ ] Lose files or data
  - [ ] Make assumptions about your workflow
  - [ ] Generate without delivering results

---

## 13. DELIVERY & HANDOFF
- [ ] **Bot must DELIVER results to you:**
  - [ ] Location: ________________
  - [ ] Format: ________________
  - [ ] Frequency: ________________

- [ ] **You will know results are ready because:**
  - [ ] Email notification: ________________
  - [ ] Slack message: ________________
  - [ ] Document updated in real-time
  - [ ] Other signal: ________________

- [ ] **Code/scripts provided:**
  - [ ] Location: ________________
  - [ ] Version control: ________________
  - [ ] You own it completely: Yes / No

---

## 14. SPECIAL REQUIREMENTS
- [ ] **Anything else bot needs to know:**
  - ________________
  - ________________
  - ________________

---

## SIGN-OFF

**Date requested:** ________________

**Bot name:** ________________

**Requested by (you):** ________________

**Domain:** ________________

**All sections completed:** Yes / No

**Ready to proceed:** Yes / No

---

## NOTES FOR BOT

If ANY section is blank or unclear:
- [ ] ASK FOR CLARIFICATION before proceeding
- [ ] DO NOT ASSUME
- [ ] DO NOT BUILD without full spec
- [ ] Get answers in writing
- [ ] Confirm understanding before code

**If you (the bot) skip this checklist, you are building blind and will fail.**

