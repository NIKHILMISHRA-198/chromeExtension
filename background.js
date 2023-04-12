
// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "calculateScore") {
    let text = request.text;
    let score = calculateScore(text);
    sendResponse({ score: score });
  }
});

// Calculate the sentiment score of a given text
function calculateScore(text) {
  const apiKey = "6d43a0b33a9438777ff5197a892268a6"; // replace with your API key
  const apiUrl = "https://api.meaningcloud.com/sentiment-2.1";
  const lang = "en";

  const params = new URLSearchParams({
    key: apiKey,
    lang: lang,
    txt: text,
  });

  // Send request to MeaningCloud API
  return fetch(`${apiUrl}?${params}`)
    .then((response) => response.json())
    .then((data) => {
      const agreement = data.agreement.toLowerCase();
      const scoreTag = data.score_tag.toLowerCase();
      let score = 0;

      // Calculate score based on agreement and score tag
      if (agreement === "agreement") {
        if (scoreTag === "p+" || scoreTag === "p") {
          score = 1;
        } else if (scoreTag === "n+" || scoreTag === "n") {
          score = -1;
        }
      } else if (agreement === "disagreement") {
        if (scoreTag === "p+" || scoreTag === "p") {
          score = -1;
        } else if (scoreTag === "n+" || scoreTag === "n") {
          score = 1;
        }
      }
      return score;
    })
    .catch((error) => {
      console.error(error);
      return 0;
    });
}

// Update extension icon based on the overall sentiment score
function updateIcon(score) {
  let iconPath;
  if (score > 0.5) {
    iconPath = "images/happy-icon-48.png";
  } else if (score < -0.5) {
    iconPath = "images/sad-icon-48.png";
  } else {
    iconPath = "images/neutral-icon-48.png";
  }
  chrome.browserAction.setIcon({ path: iconPath });
}

// Update the overall sentiment score in the popup
function updateScore() {
  chrome.storage.local.get("overallScore", (data) => {
    const overallScore = data.overallScore || 0;
    document.getElementById("score").textContent = `Score: ${overallScore.toFixed(2)}`;
  });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "updateScore") {
    updateScore();
  }
});

// Listen for updates to the overall sentiment score
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.overallScore) {
    const overallScore = changes.overallScore.newValue;
    updateIcon(overallScore);
    updateScore();
  }
});

// Initialize extension by updating icon and score
chrome.storage.local.get("overallScore", (data) => {
  const overallScore = data.overallScore || 0;
  updateIcon(overallScore);
  updateScore();
});
