// 동영상 페이지에 있을 때, 다운로드 아이콘을 표시
let checkForValidUrl = (tabId, changeInfo, tab) => {
  if (tab.url.indexOf("www.iwara.tv/video/") > -1) {
    browser.pageAction.show(tabId);
  }
}

browser.tabs.onUpdated.addListener(checkForValidUrl);

// 아이콘이 클릭 됐을 때, down.js로 메시지 전송
browser.pageAction.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, { "current_url": tab.url });
});

// 위 기능과 동일한데 단축키로 메시지 전송
browser.commands.onCommand.addListener((command) => {
  if (command === "download") {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      browser.tabs.sendMessage(tab.id, { "current_url": tab.url });
    });
  }
});

// 업데이트 & 설치 시 표시되는 팝업 창
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') {
    browser.tabs.create({ url: `update_notes/update-notes.html?prev=${details.previousVersion}` });
  }
});

//直リンに出来ない物は一度storageに投げた方がよさそう
browser.runtime.onMessage.addListener(function (request) {
  if (request.type == "download") {
    console.log(request.filename);
    browser.storage.local.get(["auto_down"], (settings) => {
      download(request.url, request.filename, settings.auto_down);
    });
  } else if (request.type == "set") {
    browser.runtime.openOptionsPage();
  }
  return true;
});


function download(url, filename, auto_down) {
  browser.downloads.download({
    url: url,
    filename: filename,
    saveAs: auto_down
  });
}