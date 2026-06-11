
// all button clicks are connected here, so there is no onclick in the HTML file
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("nextBtn").addEventListener("click", showSetup);
  document.getElementById("startBtn").addEventListener("click", startMatch);
  document.getElementById("wicketBtn").addEventListener("click", wicket);
  document.getElementById("wideBtn").addEventListener("click", wide);
  document.getElementById("noBallBtn").addEventListener("click", noBall);
  document.getElementById("undoBtn").addEventListener("click", undo);
  document.getElementById("nextInningsBtn").addEventListener("click", nextInnings);
  document.getElementById("resetBtn").addEventListener("click", resetMatch);

  let runButtons = document.querySelectorAll(".runBtn");
  for (let i = 0; i < runButtons.length; i++) {
    runButtons[i].addEventListener("click", function () {
      run(parseInt(this.getAttribute("data-run")));
    });
  }
});

// function to move from home page to setup page
function showSetup() {
  document.getElementById("welcome").style.display = "none";
  document.getElementById("setup").style.display = "block";
}

// declaring the variables to store match data
let score = 0;
let wickets = 0;
let balls = 0;
let overs = 0;

let innings = 1;
let target = 0;

let team1 = "";
let team2 = "";

let striker = { runs: 0, balls: 0 };
let nonStriker = { runs: 0, balls: 0 };

let lastOver = [];
let history = [];

// adding a function to start the match and initialize the variables and update the scoreboard.
function startMatch() {
  team1 = document.getElementById("team1").value.trim();
  team2 = document.getElementById("team2").value.trim();
  overs = parseInt(document.getElementById("overs").value);
// validating the input and initializing the match data.
  if (team1 === "") {
    team1 = "Team A";
  }

  if (team2 === "") {
    team2 = "Team B";
  }
// validating the overs input, if not it will show an alert and return without starting the match.
  if (isNaN(overs) || overs <= 0) {
    alert("Enter valid overs");
    return;
  }

  score = 0;
  wickets = 0;
  balls = 0;
  innings = 1;
  target = 0;
  lastOver = [];
  history = [];
/* resetting the striker and non-striker data for the new match, this will clear any previous match data and start fresh for the new match. */
  resetPlayers();
/* updating the team names on the scoreboard and showing the match screen while hiding the setup and welcome screens, this will transition the user to the match view with the initialized data. */
  document.getElementById("teams").innerText = team1 + " vs " + team2;
  document.getElementById("welcome").style.display = "none";
  document.getElementById("setup").style.display = "none";
  document.getElementById("match").style.display = "block";
  document.getElementById("result").style.display = "none";

  update();
}
// function to update the scoreboard ball by ball and display the current score, players stats, last over details and match info.
function update() {
  let over = Math.floor(balls / 6);
  let ball = balls % 6;
  let need = target - score;

  if (need < 0) {
    need = 0;
  }

  // updating the Team total score and wickets on scoreboard with current match data.
  document.getElementById("score").innerText =
    score + "/" + wickets + " (" + over + "." + ball + ")";
// updating the striker and non-striker stats on scoreboard with current match data.
  document.getElementById("p1").innerText =
    "Striker: " + striker.runs + "(" + striker.balls + ")";

  document.getElementById("p2").innerText =
    "Non-Striker: " + nonStriker.runs + "(" + nonStriker.balls + ")";
// updating the last over details on scoreboard with current match data.
  if (lastOver.length === 0) {
    document.getElementById("lastOver").innerText = "-";
  } else {
    document.getElementById("lastOver").innerText = lastOver.join(" ");
  }
// updating which team is batting and match info on scoreboard with current match data.
  if (innings === 1) {
    document.getElementById("batting").innerText = team1 + " Batting";
    document.getElementById("info").innerText = "1st Innings";
  } else {
    document.getElementById("batting").innerText = team2 + " Batting";
    document.getElementById("info").innerText =
      "Target: " + target + " | Need " + need;
  }
}
// function to save the current match state in history array before making any changes to the match data, this will be used for undo functionality.
function save() {
  history.push(JSON.stringify({
    score: score,
    wickets: wickets,
    balls: balls,
    innings: innings,
    target: target,
    striker: striker,
    nonStriker: nonStriker,
    lastOver: lastOver
  }));
}
// function to handle the run input and update on the scoreboard, also checks for over completion and win condition after each run input.
function run(r) {
  save();

  score = score + r;
  balls = balls + 1;

  striker.runs = striker.runs + r;
  striker.balls = striker.balls + 1;

  lastOver.push(r);

  if (r % 2 === 1) {
    swap();
  }

  checkOver();
  checkWin();
  update();
}
// function for the wickets logic to make update the wickets count, when the count reach to 10 it will end the innings and also checks for over completion after each wicket input.
function wicket() {
  if (wickets >= 10) {
    return;
  }

  save();

  wickets = wickets + 1;
  balls = balls + 1;
  striker.balls = striker.balls + 1;

  lastOver.push("W");

  if (wickets === 10) {
    endInnings();
    return;
  }

  striker = { runs: 0, balls: 0 };

  checkOver();
  update();
}
// functions for the extra runs like wide and no-ball, when it is called 1 run will be added to the total score and the ball also will not be counted.
function wide() {
  save();

  score = score + 1;
  lastOver.push("Wd");

  checkWin();
  update();
}

function noBall() {
  save();

  score = score + 1;
  lastOver.push("Nb");

  checkWin();
  update();
}
// function to switch the strikes between the striker and non-striker, after every odd run or at the end of over.
function swap() {
  let temp = striker;
  striker = nonStriker;
  nonStriker = temp;
}
// function to check the over completion and ball in the over, also checks for the end of innings when the total balls reach to the maximum balls in the match.
function checkOver() {
  if (balls % 6 === 0) {
    swap();
    lastOver.push("|");
  }

  if (balls >= overs * 6) {
    endInnings();
  }
}
// function to undo the last action, for correction of any wrong input during the scoring.
function undo() {
  if (history.length === 0) {
    return;
  }

  let prev = JSON.parse(history.pop());

  score = prev.score;
  wickets = prev.wickets;
  balls = prev.balls;
  innings = prev.innings;
  target = prev.target;
  striker = prev.striker;
  nonStriker = prev.nonStriker;
  lastOver = prev.lastOver;

  update();
}
// function to check the end of first innings and start the second innings, also checks for the end of match when the target is achieved or over is completed in second innings.
function nextInnings() {
  if (innings === 1) {
    endInnings();
  }
}

function endInnings() {
  if (innings === 1) {
    target = score + 1;

    score = 0;
    wickets = 0;
    balls = 0;
    innings = 2;
    lastOver = [];

    resetPlayers();
    update();
  } else {
    if (score >= target) {
      showResult(team2 + " Wins!");
    } else {
      showResult(team1 + " Wins!");
    }
  }
}
// function to check the result of the match after completion of second innings or when the target is achieved in second innings, it will display the result on the screen.
function checkWin() {
  if (innings === 2 && score >= target) {
    showResult(team2 + " Wins!");
  }
}

function showResult(text) {
  document.getElementById("match").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("winner").innerText = text;
}
// function to reset the match data and reload the page when new match button is clicked, it will clear all the current match data and start fresh for the new match.
function resetPlayers() {
  striker = { runs: 0, balls: 0 };
  nonStriker = { runs: 0, balls: 0 };
}

function resetMatch() {
  location.reload();
}