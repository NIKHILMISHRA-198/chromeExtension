chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const tab = tabs[0];
    
    chrome.runtime.sendMessage({action: "analyzePage"}, response => {
      if (response && response.sentences) {
        Promise.all(response.sentences.map(sentence => analyzeSentiment(sentence.text)))
          .then(scores => {
            const overallScore = scores.reduce((total, score) => total + score, 0) / scores.length;
            const scoreText = overallScore >= 0 ? "Positive" : "Negative";
            
            document.getElementById("score-container").style.display = "block";
            document.getElementById("score-icon").src = overallScore >= 0.7 ? "icons/happy.png" : (overallScore >= 0.4 ? "icons/neutral.png" : "icons/sad.png");
            document.getElementById("score").textContent = `${scoreText}: ${overallScore.toFixed(2)}`;
          })
          .catch(error => {
            console.error(error);
            document.getElementById("score-container").style.display = "block";
            document.getElementById("score-icon").style.display = "none";
            document.getElementById("score").textContent = "Failed to analyze sentiment.";
          });
      } else {
        document.getElementById("score-container").style.display = "block";
        document.getElementById("score-icon").style.display = "none";
        document.getElementById("score").textContent = "Failed to retrieve text from page.";
      }
    });
  });
  