/**
 * CHCNFP.COM GOOGLE DRIVE SCANNER
 * Domain: chcnfp.com
 * Purpose: Scan all files in designated folder, create detailed summaries, maintain metadata timeline
 * Trigger: Manual (first run) + File upload/modification (subsequent)
 * 
 * Deployment: Copy this entire script into Google Apps Script editor
 * Project ID will be created automatically
 */

const TARGET_FOLDER_ID = '1NWBmxlZLGPQBtG85Wb16enJzX8HjmoT9';
const MASTER_LOG_NAME = '#OpCode-MASTER-LOG';
const BOT_NAME = 'CHCNFP-Drive-Scanner-v1';
const DOMAIN = 'chcnfp.com';

/**
 * MAIN EXECUTION - Run this first time manually
 */
function scanAllFiles() {
  Logger.log(`[${new Date().toISOString()}] SCAN START - ${BOT_NAME}`);
  
  try {
    // Get or create master log
    const logDoc = getOrCreateMasterLog();
    
    // Scan folder recursively
    const allFiles = getAllFilesRecursive(TARGET_FOLDER_ID);
    Logger.log(`Found ${allFiles.length} files to process`);
    
    // Get existing log entries to detect changes
    const existingEntries = parseLogDocument(logDoc);
    
    // Process each file
    let processedCount = 0;
    let skippedCount = 0;
    
    allFiles.forEach((file, index) => {
      try {
        const fileHash = computeFileHash(file);
        const existingEntry = existingEntries.find(e => e.fileId === file.getId());
        
        // Check if file has been modified since last scan
        if (existingEntry && existingEntry.fileHash === fileHash) {
          Logger.log(`SKIP: ${file.getName()} (unchanged)`);
          skippedCount++;
          return;
        }
        
        // Process file
        const summary = generateSummary(file);
        const metadata = extractMetadata(file);
        
        // Log entry
        logFileProcessing(logDoc, file, summary, metadata, fileHash, 'SUCCESS');
        
        processedCount++;
        
        // Throttle to avoid quota issues
        if (index % 10 === 0) {
          Utilities.sleep(1000);
        }
        
      } catch (error) {
        Logger.log(`ERROR processing ${file.getName()}: ${error.message}`);
        logFileProcessing(logDoc, file, null, null, null, `ERROR: ${error.message}`);
      }
    });
    
    Logger.log(`[${new Date().toISOString()}] SCAN COMPLETE - Processed: ${processedCount}, Skipped: ${skippedCount}`);
    
  } catch (error) {
    Logger.log(`FATAL ERROR: ${error.message}`);
  }
}

/**
 * GET ALL FILES RECURSIVELY
 */
function getAllFilesRecursive(folderId, allFiles = []) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  
  while (files.hasNext()) {
    allFiles.push(files.next());
  }
  
  // Process subfolders
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    getAllFilesRecursive(subfolders.next().getId(), allFiles);
  }
  
  return allFiles;
}

/**
 * GENERATE SUMMARY - Detailed key points from file
 */
function generateSummary(file) {
  const fileName = file.getName();
  const mimeType = file.getMimeType();
  
  let content = '';
  
  try {
    if (mimeType === MimeType.GOOGLE_DOCUMENT) {
      // Google Docs
      const doc = DocumentApp.openById(file.getId());
      content = doc.getBody().getText().substring(0, 5000); // First 5000 chars
      
    } else if (mimeType === MimeType.GOOGLE_SPREADSHEET) {
      // Google Sheets
      const sheet = SpreadsheetApp.openById(file.getId());
      const range = sheet.getActiveRange();
      content = range.getValues().toString().substring(0, 5000);
      
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Word .docx - need to convert
      content = '[WORD FILE - Manual review needed] ' + fileName;
      
    } else if (mimeType === 'application/pdf') {
      content = '[PDF FILE - Requires OCR] ' + fileName;
      
    } else if (mimeType === 'text/plain') {
      // Text files
      const blob = file.getBlob();
      content = blob.getDataAsString().substring(0, 5000);
      
    } else {
      content = `[${mimeType}] - ${fileName}`;
    }
  } catch (error) {
    content = `[ERROR READING CONTENT] ${error.message}`;
  }
  
  // Extract key points
  const keyPoints = extractKeyPoints(content, fileName);
  
  return keyPoints.join('\n');
}

/**
 * EXTRACT KEY POINTS FROM CONTENT
 */
function extractKeyPoints(content, fileName) {
  const points = [];
  
  // First 3 sentences as summary
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  sentences.slice(0, 3).forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 10) {
      points.push(`• ${trimmed}`);
    }
  });
  
  // Look for keywords/sections
  const keywords = ['summary', 'overview', 'key', 'important', 'note', 'action', 'task', 'deadline'];
  keywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[^.!?]*[.!?]`, 'gi');
    const matches = content.match(regex) || [];
    matches.slice(0, 2).forEach(match => {
      if (!points.some(p => p.includes(match.substring(0, 30)))) {
        points.push(`• [${keyword.toUpperCase()}] ${match.trim()}`);
      }
    });
  });
  
  if (points.length === 0) {
    points.push(`• [FILE] ${fileName} (content length: ${content.length} chars)`);
  }
  
  return points.slice(0, 10); // Max 10 key points
}

/**
 * EXTRACT METADATA
 */
function extractMetadata(file) {
  return {
    fileName: file.getName(),
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    mimeType: file.getMimeType(),
    owner: file.getOwner().getEmail(),
    createdDate: file.getDateCreated(),
    modifiedDate: file.getLastUpdated(),
    fileSize: file.getSize(),
    sharedWithMe: file.isStarred() // Proxy for shared status
  };
}

/**
 * COMPUTE FILE HASH - For change detection
 */
function computeFileHash(file) {
  // Simple hash: combine file ID, modified date, and size
  const content = `${file.getId()}_${file.getLastUpdated().getTime()}_${file.getSize()}`;
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, content);
  return Utilities.base64Encode(hash).substring(0, 16);
}

/**
 * GET OR CREATE MASTER LOG DOCUMENT
 */
function getOrCreateMasterLog() {
  const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  const files = folder.getFilesByName(MASTER_LOG_NAME);
  
  if (files.hasNext()) {
    return DocumentApp.openById(files.next().getId());
  }
  
  // Create new
  const doc = DocumentApp.create(MASTER_LOG_NAME);
  const docFile = DriveApp.getFileById(doc.getId());
  folder.addFile(docFile);
  DriveApp.getRootFolder().removeFile(docFile);
  
  // Add header
  const body = doc.getBody();
  body.appendParagraph(`CHCNFP.COM - MASTER FILE SCAN LOG`).setHeading(HeadingType.HEADING1);
  body.appendParagraph(`Domain: ${DOMAIN}`).setHeading(HeadingType.HEADING3);
  body.appendParagraph(`Bot: ${BOT_NAME}`).setHeading(HeadingType.HEADING3);
  body.appendParagraph(`Initial Scan: ${new Date().toISOString()}`).setHeading(HeadingType.HEADING3);
  body.appendParagraph('---');
  
  return doc;
}

/**
 * LOG FILE PROCESSING
 */
function logFileProcessing(logDoc, file, summary, metadata, fileHash, status) {
  const body = logDoc.getBody();
  const timestamp = new Date().toISOString();
  
  // Append log entry
  body.appendParagraph(`[${timestamp}] ${file.getName()}`).setHeading(HeadingType.HEADING2);
  
  const table = [
    ['Field', 'Value'],
    ['File ID', file.getId()],
    ['File URL', file.getUrl()],
    ['File Hash', fileHash || 'N/A'],
    ['Mime Type', file.getMimeType()],
    ['Owner', file.getOwner().getEmail()],
    ['Created', file.getDateCreated().toISOString()],
    ['Modified', file.getLastUpdated().toISOString()],
    ['Size (bytes)', file.getSize().toString()],
    ['Status', status]
  ];
  
  body.appendTable(table);
  
  if (summary) {
    body.appendParagraph('SUMMARY:').setBold(true);
    body.appendParagraph(summary);
  }
  
  body.appendParagraph('---');
  body.appendParagraph('');
}

/**
 * PARSE EXISTING LOG ENTRIES
 */
function parseLogDocument(logDoc) {
  // Simple parser - extract file IDs and hashes from existing entries
  const entries = [];
  const text = logDoc.getBody().getText();
  
  // Regex to find "File ID: <id>" and "File Hash: <hash>"
  const idMatches = text.match(/File ID\s+(.+)/g) || [];
  const hashMatches = text.match(/File Hash\s+(.+)/g) || [];
  
  for (let i = 0; i < Math.min(idMatches.length, hashMatches.length); i++) {
    entries.push({
      fileId: idMatches[i].replace('File ID', '').trim(),
      fileHash: hashMatches[i].replace('File Hash', '').trim()
    });
  }
  
  return entries;
}

/**
 * SET UP TRIGGER FOR FILE CHANGES
 * Run this once to enable automatic scanning on file upload/move
 */
function setupTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'scanAllFiles') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger for file changes
  // Note: Apps Script has limited trigger options; this polls every hour
  ScriptApp.newTrigger('scanAllFiles')
    .timeBased()
    .everyHours(1)
    .create();
  
  Logger.log('Trigger set: Scan will run every 1 hour');
}

/**
 * MANUAL TRIGGER - Call this to run scan on demand
 */
function runScanNow() {
  scanAllFiles();
}

/**
 * DEPLOYMENT INSTRUCTIONS
 * 1. Go to script.google.com
 * 2. Create new Apps Script project
 * 3. Paste this entire code
 * 4. Save project
 * 5. Run "runScanNow()" first time
 * 6. Authorize when prompted (allow access to Drive and Docs)
 * 7. Run "setupTrigger()" to enable hourly automatic scans
 * 8. Check #OpCode-MASTER-LOG document in your folder for results
 */
