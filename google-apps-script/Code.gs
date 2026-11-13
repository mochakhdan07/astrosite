/**
 * ARIJU-VII - Certificate log for Google Sheets.
 *
 * The website assigns each certificate a global ID (ARIJU-001, ARIJU-002, ...)
 * and sends it here so it is written to your sheet in real time.
 *
 * Setup: see google-apps-script/README.md
 */

// Must match the GOOGLE_SHEETS_SECRET environment variable on Netlify.
// Leave empty ('') only if you also leave GOOGLE_SHEETS_SECRET unset.
var SECRET = 'GANTI_DENGAN_KATA_SANDI_RAHASIA_ANDA';
var SHEET_NAME = 'Sertifikat';
var HEADERS = ['No', 'ID Sertifikat', 'Nama', 'Waktu (WIB)', 'Kuis', 'Skor', 'Waktu (UTC)', 'Negara'];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0b1d3a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < HEADERS.length) {
    // Older sheets were created before the Country column existed: add its header.
    sheet.getRange(1, HEADERS.length).setValue(HEADERS[HEADERS.length - 1])
      .setFontWeight('bold').setBackground('#0b1d3a').setFontColor('#ffffff');
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid json' });
  }
  if (SECRET && data.secret !== SECRET) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var issued = new Date(data.timestamp || new Date());
    sheet.appendRow([
      Number(data.no) || '',
      String(data.id || ''),
      String(data.name || ''),
      Utilities.formatDate(issued, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
      String(data.quiz || ''),
      String(data.score || ''),
      issued.toISOString(),
      String(data.country || ''),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, id: data.id });
}

// Lets you open the web app URL in a browser to confirm it is deployed.
function doGet() {
  return json_({ ok: true, service: 'ARIJU-VII certificate log' });
}
