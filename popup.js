chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const tab = tabs[0];
  chrome.tabs.executeScript(tab.id, { file: "content.js" }, () => {
    chrome.runtime.sendMessage({action: "analyzePage"}, response => {
      if (response && response.sentences) {
        Promise.all(response.sentences.map(sentence => analyzeSentiment(sentence.text)))
          .then(scores => {
            const overallScore = scores.reduce((total, score) => total + score, 0) / scores.length;
            const scoreText = overallScore >= 0 ? "Positive" : "Negative";
            
            document.getElementById("score-container").style.display = "block";
            document.getElementById("score-icon").src = `images/${scoreText.toLowerCase()}.svg`;
            document.getElementById("score").textContent = `${overallScore.toFixed(2)}`;
          })
          .catch(error => {
            console.error(error);
            document.getElementById("scoreHeading").textContent = "Error";
            document.getElementById("scoreText").textContent = "Failed to analyze sentiment.";
          });
      } else {
        document.getElementById("scoreHeading").textContent = "Error";
        document.getElementById("scoreText").textContent = "Failed to retrieve text from page.";
      }
    });
  });
});

  