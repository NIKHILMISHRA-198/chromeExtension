const API_KEY = "6d43a0b33a9438777ff5197a892268a6";

function analyzeSentiment(text) {
  const url = `https://api.meaningcloud.com/sentiment-2.1?key=${API_KEY}&of=json&txt=${encodeURIComponent(text)}&model=general`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.status.code === '0') {
        return data.score_tag;
      } else {
        throw new Error(`Failed to analyze sentiment: ${data.status.msg}`);
      }
    });
}
function setIcon(tabId, score) {
    let iconPath = "";
    if (score >= 0.7) {
      iconPath = "icons/happy.png";
    } else if (score >= 0.4) {
      iconPath = "icons/neutral.png";
    } else {
      iconPath = "icons/sad.png";
    }
  
    chrome.browserAction.setIcon({
      tabId: tabId,
      path: {
        "16": iconPath,
        "32": iconPath,
        "48": iconPath,
        "128": iconPath
      }
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    });
  }
  
                                                                                                                                                                                                                                                  
  function updateIcon(tabId, score) {
    const iconPath = score >= 0 ? "images/happy-icon-48.png" : "images/sad-icon-48.png";
    chrome.action.setIcon({ path: iconPath, tabId: tabId });
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateIcon") {
      const { tabId, score } = request;
      updateIcon(tabId, score);
    }
  });
  
  

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.tabs.sendMessage(tabId, {action: "analyzePage"}, response => {
      if (response && response.sentences) {
        Promise.all(response.sentences.map(sentence => analyzeSentiment(sentence.text)))
          .then(scores => {
            const overallScore = scores.reduce((total, score) => total + score, 0) / scores.length;
            const scoreTag = overallScore >= 0 ? "positive" : "negative";
            updateIcon(tabId, scoreTag);
          })
          .catch(error => {
            console.error(error);
            updateIcon(tabId, "neutral");
          });
      } else {
        updateIcon(tabId, "neutral");
      }
    });
  }
});
