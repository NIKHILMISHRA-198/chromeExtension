chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzePage") {
      const textNodes = [...document.querySelectorAll(":not(iframe):not(script):not(style)")]
        .map(node => node.textContent.trim())
        .filter(text => text.length > 0 && text.length <= 5000);
      const sentences = textNodes.flatMap(text => text.split(/[.!?\n]/))
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0 && sentence.length <= 1000);
        
      sendResponse({sentences: sentences});
    }
  });
  