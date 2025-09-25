chrome.runtime.onInstalled.addListener(() => {
  console.log("App Code Search installed");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
