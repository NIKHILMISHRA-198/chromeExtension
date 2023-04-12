chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const tab = tabs[0];
    
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
    
      chrome.tabs.sendMessage(tab.id, { action: "analyzePage" }, response => {
        if (response && response.sentences) {
          Promise.all(response.sentences.map(sentence => analyzeSentiment(sentence.text)))
            .then(scores => {
              const overallScore = scores.reduce((total, score) => total + score, 0) / scores.length;
              const scoreText = overallScore >= 0 ? "Positive" : "Negative";
    
              document.getElementById("score").textContent = `Score: ${overallScore.toFixed(2)}`;
              document.getElementById("score-icon").src = overallScore >= 0 ? "images/happy-face.png" : "images/sad-face.png";
            })
            .catch(error => {
              console.error(error);
              document.getElementById("score").textContent = "Error: Failed to analyze sentiment.";
              document.getElementById("score-icon").src = "images/error.png";
            });
        } else {
          document.getElementById("score").textContent = "Error: Failed to retrieve text from page.";
          document.getElementById("score-icon").src = "images/error.png";
        }
      });
    });
    
  });
  