////////////////////定数定義/////////////////////////////////////////////////////////////////////////////////////////
const qiitaUrl = "https://qiita.com/";
const qiitaHtml = UrlFetchApp.fetch(qiitaUrl).getContentText("UTF-8");
const spreadsheetId = "スプレッドシートID";
const sheetUrl = SpreadsheetApp.getActiveSpreadsheet();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 実行対象の関数
function main() {
  // Qiitaから記事情報を取得;
  const { title, url, date } = fetchQiitaTrend();

  // 現在時刻の取得
  const today = getToday();

  // スプレッドシートに書き込み
  writingToSpreadsheet(title, url, date, today);
}

function fetchQiitaTrend() {
  // 取得するタグを範囲選択
  const titleList = Parser.data(qiitaHtml)
    .from('class="style-4xqyxv">')
    .to("</a>")
    .iterate();

  const urlList = Parser.data(qiitaHtml)
    .from('<h2 class="style-skov52"><a href="')
    .to('" class="style-4xqyxv">')
    .iterate();

  const postDateList = Parser.data(qiitaHtml)
    .from('class="style-1elrt2j"><time dateTime="')
    .to("</time>")
    .iterate();

  return {
    title: titleList,
    url: urlList,
    date: postDateList,
  };
}

function writingToSpreadsheet(title, url, date, today) {
  // 書き込み対象のスプレッドシートを指定
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  // スプレッドシートの2行目以降に取得したURL分だけ空白を挿入（取得日の降順にするため）
  spreadsheet.insertRowsAfter(1, url.length + 1);
  // 3行目から取得した記事の書き込みを始める
  let recordrow = 3;
  // 実行時間を書き込む
  spreadsheet
    .getRange("A" + 2)
    .setValue(Utilities.formatString("【 %s 】", today));
  // スクレイピング結果をスプレッドシートに転記
  for (let i = 0; i <= url.length - 1; i++) {
    spreadsheet.getRange("A" + recordrow).setValue(title[i]);
    spreadsheet.getRange("B" + recordrow).setValue(url[i]);
    spreadsheet.getRange("C" + recordrow).setValue(date[i].substring(0, 10));
    recordrow++;
  }
}

function getToday() {
  // 現在日時を取得
  const today = new Date();
  // Date型データをフォーマット

  const todayStr = Utilities.formatDate(today, "JST", "yyyy-MM-dd HH:mm:ss");

  return todayStr;
}
