// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'checkText') {
    const bodyText = document.body.innerText.toLowerCase();
    const wordsToCheck = request.wordsToCheck;
    let overallScore = 0;
    wordsToCheck.forEach(word => {
      const count = (bodyText.match(new RegExp(word, 'g')) || []).length;
      overallScore += count;
    });
    sendResponse({ overallScore: overallScore });
  }
});

// Send message to the background script to initialize the extension
chrome.runtime.sendMessage({ message: 'initExtension' });
