
// all button clicks are connected here, so there is no onclick in the HTML file
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("nextBtn").addEventListener("click", showSetup);
  // ADDED: generate players and toss buttons
  document.getElementById("generatePlayersBtn").addEventListener("click", generatePlayerInputs);
  document.getElementById("startBtn").addEventListener("click", proceedToToss);
  // ADDED: toss buttons
  document.getElementById("headsBtn").addEventListener("click", () => flipCoin('Heads'));
  document.getElementById("tailsBtn").addEventListener("click", () => flipCoin('Tails'));
  document.getElementById("batBtn").addEventListener("click", () => chooseTossOption('bat'));
  document.getElementById("bowlBtn").addEventListener("click", () => chooseTossOption('bowl'));
  document.getElementById("viewSummaryBtn").addEventListener("click", showResultModal);
  // ADDED: arranger and reorder buttons
  document.getElementById("arrangeBtn").addEventListener("click", () => openArranger(1));
  document.getElementById("arrangeBtn2").addEventListener("click", () => openArranger(2));
  document.getElementById("reorderBtn").addEventListener("click", reorderBattingOrder);
  // Match control buttons
  document.getElementById("wicketBtn").addEventListener("click", wicket);
  document.getElementById("wideBtn").addEventListener("click", wide);
  document.getElementById("noBallBtn").addEventListener("click", noBall);
  document.getElementById("undoBtn").addEventListener("click", undo);
  document.getElementById("nextInningsBtn").addEventListener("click", nextInnings);
  document.getElementById("resetBtn").addEventListener("click", resetMatch);
  // ADDED: modal buttons
  document.getElementById("modalClose").addEventListener("click", closeResultModal);
  document.getElementById("modalNewMatch").addEventListener("click", resetMatch);
  document.getElementById("modalDownload").addEventListener("click", downloadSummary);
  document.getElementById("announcementNewMatch").addEventListener("click", resetMatch);

  let runButtons = document.querySelectorAll(".runBtn");
  for (let i = 0; i < runButtons.length; i++) {
    runButtons[i].addEventListener("click", function () {
      run(parseInt(this.getAttribute("data-run")));
    });
  }
});

// ADDED: function to show unified setup page
function showSetup() {
  document.getElementById("welcome").style.display = "none";
  document.getElementById("setup").style.display = "block";
}

// ADDED: function to generate dynamic player inputs based on player count
function generatePlayerInputs() {
  const count = parseInt(document.getElementById("playerCount").value);
  if (isNaN(count) || count <= 0 || count > 20) {
    alert("Enter a valid number of players (1-20)");
    return;
  }
  // generate dynamic input boxes for both teams in two columns
  const container = document.getElementById("playerInputsContainer");
  container.innerHTML = `<div class="player-inputs-wrapper">
    <div class="player-column">
      <h3>Team 1 Players</h3>
      <div id="team1PlayerInputs"></div>
    </div>
    <div class="player-column">
      <h3>Team 2 Players</h3>
      <div id="team2PlayerInputs"></div>
    </div>
  </div>`;
  
  const t1Inputs = document.getElementById("team1PlayerInputs");
  const t2Inputs = document.getElementById("team2PlayerInputs");
  for (let i = 0; i < count; i++) {
    const inp1 = document.createElement("input");
    inp1.type = "text";
    inp1.placeholder = `Player ${i+1}`;
    inp1.className = "player-input";
    inp1.id = `team1Player${i}`;
    t1Inputs.appendChild(inp1);
    
    const inp2 = document.createElement("input");
    inp2.type = "text";
    inp2.placeholder = `Player ${i+1}`;
    inp2.className = "player-input";
    inp2.id = `team2Player${i}`;
    t2Inputs.appendChild(inp2);
  }
}

// ADDED: toss-related variables and functions
let tossWinner = null;
let tossChoice = null; // 'bat' or 'bowl'

function proceedToToss() {
  team1 = document.getElementById("team1").value.trim();
  team2 = document.getElementById("team2").value.trim();
  overs = parseInt(document.getElementById("overs").value);
  
  // read players from dynamic input boxes
  team1Players = [];
  team2Players = [];
  const inputs1 = document.querySelectorAll("#team1PlayerInputs input");
  const inputs2 = document.querySelectorAll("#team2PlayerInputs input");
  inputs1.forEach(inp => {
    const val = inp.value.trim();
    if (val) team1Players.push(val);
  });
  inputs2.forEach(inp => {
    const val = inp.value.trim();
    if (val) team2Players.push(val);
  });
  
  if (team1 === "") team1 = "Team A";
  if (team2 === "") team2 = "Team B";
  if (isNaN(overs) || overs <= 0) {
    alert("Enter valid overs");
    return;
  }
  if (team1Players.length === 0 || team2Players.length === 0) {
    alert("Please enter at least one player per team");
    return;
  }
  
  // initialize batting order and stats
  battingOrder[1] = team1Players.slice();
  battingOrder[2] = team2Players.slice();
  playerStats.team1 = {};
  playerStats.team2 = {};
  team1Players.forEach(name => {
    playerStats.team1[name] = { runs: 0, balls: 0, fours: 0, sixes: 0, bowling: { balls: 0, runs: 0, wickets: 0 } };
  });
  team2Players.forEach(name => {
    playerStats.team2[name] = { runs: 0, balls: 0, fours: 0, sixes: 0, bowling: { balls: 0, runs: 0, wickets: 0 } };
  });
  
  // show toss screen
  document.getElementById("setup").style.display = "none";
  document.getElementById("tossScreen").style.display = "block";
  document.getElementById("tossTeam").innerText = `${team1} vs ${team2}`;
}

// ADDED: coin flip animation
function flipCoin(choice) {
  const coin = document.getElementById('coin');
  coin.style.animation = 'none';
  setTimeout(() => {
    coin.style.animation = 'flip 0.6s ease-out';
  }, 10);
  
  setTimeout(() => {
    const result = Math.random() > 0.5 ? 'H' : 'T';
    coin.innerText = result;
    tossWinner = result === 'H' ? team1 : team2;
    showTossDecision(choice, result);
  }, 600);
}

function showTossDecision(choice, result) {
  const decision = document.getElementById('tossDecision');
  const resultText = result === 'H' ? 'Heads' : 'Tails';
  document.getElementById('tossResult').innerText = `Result: ${resultText}!`;
  document.getElementById('tossWinnerChoice').innerText = `${tossWinner} won the toss`;
  decision.style.display = 'block';
}

function chooseTossOption(option) {
  tossChoice = option;
  startMatch();
}

// ADDED: key for current innings batting team (for reorder button)
let currentBattingTeam = 1;

// declaring the variables to store match data
let score = 0;
let wickets = 0;
let balls = 0;
let overs = 0;

let innings = 1;
let target = 0;

// ADDED: track final scores/wickets for both innings
let innings1Score = 0;
let innings1Wickets = 0;
let innings2Score = 0;
let innings2Wickets = 0;

let team1 = "";
let team2 = "";

// ADDED: arrays to hold player lists and batting order
let team1Players = [];
let team2Players = [];
let battingOrder = { 1: [], 2: [] }; // keyed by innings/team batting id
let nextBatterIndex = { 1: 2, 2: 2 }; // per-innings index into battingOrder for next batter

// ADDED: per-player stats map (by team and name)
let playerStats = { team1: {}, team2: {} };

// Extras state: when a Wide/NoBall occurs, the next run press may be additional runs
let extraPending = null; // 'wide' | 'noball' | null
let freeHit = false; // set true after a no-ball until the next legal delivery

let striker = { runs: 0, balls: 0 };
let nonStriker = { runs: 0, balls: 0 };

let lastOver = [];
let history = [];

// adding a function to start the match and initialize the variables and update the scoreboard.
function startMatch() {
  // ADDED: already done in proceedToToss, so just initialize match state
  score = 0;
  wickets = 0;
  balls = 0;
  innings = 1;
  target = 0;
  // ADDED: reset innings final tracking
  innings1Score = 0;
  innings1Wickets = 0;
  innings2Score = 0;
  innings2Wickets = 0;
  lastOver = [];
  history = [];
  
  resetPlayers();
  
  currentBattingTeam = 1;
  document.getElementById("teams").innerText = team1 + " vs " + team2;
  document.getElementById("tossScreen").style.display = "none";
  document.getElementById("match").style.display = "block";
  document.getElementById("result").style.display = "none";
  document.getElementById("winnerAnnouncement").style.display = "none";
  
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
  // ADDED: include batsman names and batting stats in display
  const sName = striker.name || "Striker";
  const nsName = nonStriker.name || "Non-Striker";

  document.getElementById("p1").innerText =
    `Striker: ${sName} - ${striker.runs} (${striker.balls})`;

  document.getElementById("p2").innerText =
    `Non-Striker: ${nsName} - ${nonStriker.runs} (${nonStriker.balls})`;

  // ADDED: ensure bowler select exists and shows current bowlers
  const bowlerSelect = document.getElementById('bowlerSelect');
  if (bowlerSelect && bowlerSelect.options.length <= 1) {
    // populate with players from bowling team (the bowling team is opposite of batting)
    const bowlingTeam = innings === 1 ? team2Players : team1Players;
    bowlingTeam.forEach(p => {
      const opt = document.createElement('option'); opt.value = p; opt.text = p; bowlerSelect.appendChild(opt);
    });
  }
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
  // If this run call follows a wide/no-ball, treat it as additional runs off the extra
  if (extraPending) {
    // don't save again here -- the extra event already saved state
    score = score + r;

    // credit bowler with extra conceded runs (but not an extra legal ball)
    const bowler = document.getElementById('bowlerSelect');
    if (bowler && bowler.value) {
      const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
      const bName = bowler.value;
      if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
        playerStats[bowlingTeamKey][bName].bowling.runs += r;
      }
    }

    // If the extra was a no-ball, batsman gets credited for these runs
    if (extraPending === 'noball') {
      striker.runs = striker.runs + r;
      if (striker.name) {
        const teamKey = innings === 1 ? 'team1' : 'team2';
        if (playerStats[teamKey] && playerStats[teamKey][striker.name]) {
          playerStats[teamKey][striker.name].runs += r;
        }
      }
      playTone(r === 4 ? 'four' : r === 6 ? 'six' : 'run');
    } else {
      // wides: extras only
      playTone('extra');
    }

    lastOver.push(r);
    // clear the pending extra; freeHit remains true only for noball until next legal delivery
    extraPending = null;
    checkWin();
    update();
    return;
  }

  // Normal legal delivery
  save();

  score = score + r;
  balls = balls + 1;

  // ADDED: update striker stats including fours/sixes
  striker.runs = striker.runs + r;
  striker.balls = striker.balls + 1;
  if (r === 4) striker.fours = (striker.fours || 0) + 1;
  if (r === 6) striker.sixes = (striker.sixes || 0) + 1;

  // reflect in global playerStats if name exists
  if (striker.name) {
    const teamKey = innings === 1 ? 'team1' : 'team2';
    if (playerStats[teamKey] && playerStats[teamKey][striker.name]) {
      playerStats[teamKey][striker.name].runs += r;
      playerStats[teamKey][striker.name].balls += 1;
      if (r === 4) playerStats[teamKey][striker.name].fours += 1;
      if (r === 6) playerStats[teamKey][striker.name].sixes += 1;
    }
  }
  // ADDED: credit runs to current bowler (conceded runs and legal-ball counts)
  const bowler = document.getElementById('bowlerSelect');
  if (bowler && bowler.value) {
    const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
    const bName = bowler.value;
    if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
      playerStats[bowlingTeamKey][bName].bowling.runs += r;
      playerStats[bowlingTeamKey][bName].bowling.balls += 1;
    }
  }

  lastOver.push(r);

  // ADDED: play a sound for the run type
  playTone(r === 4 ? 'four' : r === 6 ? 'six' : 'run');

  if (r % 2 === 1) {
    swap();
  }

  checkOver();
  // After a legal delivery, any free hit is consumed
  freeHit = false;
  checkWin();
  update();
}
// function for the wickets logic to make update the wickets count, when the count reach to 10 it will end the innings and also checks for over completion after each wicket input.
function wicket() {
  if (wickets >= 10) {
    return;
  }

  // On a free-hit the dismissal (except run-out) is not a wicket. The ball is still legal.
  if (freeHit) {
    save();
    // count the legal ball but do not increment wickets
    balls = balls + 1;
    striker.balls = striker.balls + 1;
    const bowler = document.getElementById('bowlerSelect');
    if (bowler && bowler.value) {
      const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
      const bName = bowler.value;
      if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
        playerStats[bowlingTeamKey][bName].bowling.balls += 1;
      }
    }
    lastOver.push('W');
    freeHit = false;
    checkOver();
    checkWin();
    update();
    return;
  }

  save();

  wickets = wickets + 1;
  balls = balls + 1;
  // ADDED: increment striker ball faced and record wicket in stats
  striker.balls = striker.balls + 1;
  if (striker.name) {
    const teamKey = innings === 1 ? 'team1' : 'team2';
    if (playerStats[teamKey] && playerStats[teamKey][striker.name]) {
      playerStats[teamKey][striker.name].balls += 1;
    }
  }
  // ADDED: credit wicket to current bowler
  const bowler = document.getElementById('bowlerSelect');
  if (bowler && bowler.value) {
    const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
    const bName = bowler.value;
    if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
      playerStats[bowlingTeamKey][bName].bowling.wickets += 1;
      playerStats[bowlingTeamKey][bName].bowling.balls += 1;
    }
  }

  lastOver.push("W");

  if (wickets === 10) {
    endInnings();
    return;
  }

  // ADDED: replace striker with next batter in chosen batting order
  const teamKey = innings === 1 ? 1 : 2;
  const order = battingOrder[teamKey] || [];
  const next = order[nextBatterIndex[teamKey]];
  nextBatterIndex[teamKey]++;

  if (next) {
    striker = { name: next, runs: 0, balls: 0 };
  } else {
    // fallback to anonymous player
    striker = { runs: 0, balls: 0 };
  }

  // ADDED: play wicket sound
  playTone('wicket');

  checkOver();
  update();
}
// functions for the extra runs like wide and no-ball, when it is called 1 run will be added to the total score and the ball also will not be counted.
function wide() {
  save();

  score = score + 1;
  lastOver.push("Wd");

  // ADDED: credit wide to bowler's conceded runs (extras)
  const wb = document.getElementById('bowlerSelect');
  if (wb && wb.value) {
    const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
    const bName = wb.value;
    if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
      playerStats[bowlingTeamKey][bName].bowling.runs += 1;
    }
  }

  // ADDED: play extra sound
  playTone('extra');

  // mark that next run() call should be treated as additional runs off this wide
  extraPending = 'wide';

  checkWin();
  update();
}

function noBall() {
  save();

  score = score + 1;
  lastOver.push("Nb");

  // ADDED: credit no-ball to bowler
  const nb = document.getElementById('bowlerSelect');
  if (nb && nb.value) {
    const bowlingTeamKey = innings === 1 ? 'team2' : 'team1';
    const bName = nb.value;
    if (playerStats[bowlingTeamKey] && playerStats[bowlingTeamKey][bName]) {
      playerStats[bowlingTeamKey][bName].bowling.runs += 1;
    }
  }

  playTone('noBall');

  // set extraPending and freeHit for the next delivery
  extraPending = 'noball';
  freeHit = true;

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
    // ADDED: save innings 1 final score/wickets before resetting
    innings1Score = score;
    innings1Wickets = wickets;
    target = score + 1;

    score = 0;
    wickets = 0;
    balls = 0;
    innings = 2;
    lastOver = [];

    resetPlayers();
    update();
  } else {
    // ADDED: save innings 2 final score/wickets
    innings2Score = score;
    innings2Wickets = wickets;
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
    // ADDED: save final scores before showing result
    innings2Score = score;
    innings2Wickets = wickets;
    showResult(team2 + " Wins!");
  }
}

function showResult(text) {
  // ADDED: show winner announcement screen first instead of modal
  document.getElementById("match").style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("winnerAnnouncement").style.display = "block";
  document.getElementById("announcementWinner").innerText = text;
  document.getElementById("announcementMargin").innerText = computeMarginText();
  
  // also populate modal for later viewing
  const modal = document.getElementById('resultModal');
  document.getElementById('modalWinner').innerText = text;
  const finalScore = `${innings1Score}/${innings1Wickets} - ${innings2Score}/${innings2Wickets}`;
  document.getElementById('modalFinalScore').innerText = finalScore;
  document.getElementById('modalSummary').innerHTML = generateSummaryHTML();
  modal.classList.add('fade-in');
}

// ADDED: transition from announcement to modal
function showResultModal() {
  document.getElementById("winnerAnnouncement").style.display = "none";
  document.getElementById('resultModal').style.display = 'block';
}

// ADDED: reorder batting order during match
function reorderBattingOrder() {
  const currentTeam = innings === 1 ? 1 : 2;
  const order = battingOrder[currentTeam] || [];
  
  const overlay = document.createElement('div');
  overlay.className = 'arrange-overlay';
  overlay.id = 'matchReorderOverlay';
  const teamLabel = currentTeam === 1 ? team1 : team2;
  overlay.innerHTML = `<div class="arrange-box">
    <h3>Reorder ${teamLabel} Batting</h3>
    <ul id="matchOrderList"></ul>
    <div class="arrange-actions">
      <button id="matchMoveUp">Move Up</button>
      <button id="matchMoveDown">Move Down</button>
      <button id="matchSaveOrder">Save Order</button>
      <button id="matchCloseOrder">Close</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  
  const list = document.getElementById('matchOrderList');
  order.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerText = p;
    li.tabIndex = 0;
    li.dataset.index = i;
    li.draggable = true;
    li.addEventListener('dragstart', (ev) => { ev.dataTransfer.setData('text/plain', i); ev.currentTarget.classList.add('dragging'); });
    li.addEventListener('dragend', (ev) => { ev.currentTarget.classList.remove('dragging'); });
    li.addEventListener('dragover', (ev) => ev.preventDefault());
    li.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const src = parseInt(ev.dataTransfer.getData('text/plain'));
      const dst = Array.from(list.children).indexOf(ev.currentTarget);
      if (isNaN(src) || src === dst) return;
      const children = Array.from(list.children);
      const node = children[src];
      if (src < dst) list.insertBefore(node, children[dst].nextSibling);
      else list.insertBefore(node, children[dst]);
      Array.from(list.children).forEach((c, idx) => c.dataset.index = idx);
    });
    list.appendChild(li);
  });
  
  list.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      list.querySelectorAll('li').forEach(it => it.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
  
  document.getElementById('matchMoveUp').addEventListener('click', () => moveSelected(list, -1));
  document.getElementById('matchMoveDown').addEventListener('click', () => moveSelected(list, 1));
  document.getElementById('matchSaveOrder').addEventListener('click', () => {
    const items = Array.from(list.querySelectorAll('li')).map(li => li.innerText);
    battingOrder[currentTeam] = items.slice();
    nextBatterIndex[currentTeam] = wickets + 1; // current wickets + 1 = next batter index
    document.getElementById('matchReorderOverlay').remove();
    update();
  });
  document.getElementById('matchCloseOrder').addEventListener('click', () => {
    document.getElementById('matchReorderOverlay').remove();
  });
}
// function to reset the match data and reload the page when new match button is clicked, it will clear all the current match data and start fresh for the new match.
function resetPlayers() {
  // ADDED: initialize striker and non-striker from batting order
  const teamKey = innings === 1 ? 1 : 2;
  const order = battingOrder[teamKey] && battingOrder[teamKey].length ? battingOrder[teamKey] : (teamKey === 1 ? team1Players : team2Players);
  const first = order[0] || "Striker";
  const second = order[1] || "Non-Striker";
  striker = { name: first, runs: 0, balls: 0 };
  nonStriker = { name: second, runs: 0, balls: 0 };
  nextBatterIndex[teamKey] = 2; // after assigning first two for this innings/team
}

function resetMatch() {
  location.reload();
}

/* ADDED: Batting order arranger UI helpers */
function openArranger(team) {
  // create a simple arranger overlay dynamically for given team (1 or 2)
  const overlay = document.createElement('div');
  overlay.className = 'arrange-overlay';
  overlay.id = `arrangeOverlay${team}`;
  const teamLabel = team === 1 ? 'Team A' : 'Team B';
  overlay.innerHTML = `<div class="arrange-box">
    <h3>Arrange ${teamLabel} Batting Order</h3>
    <ul id="orderList"></ul>
    <div class="arrange-actions">
      <button id="moveUp">Move Up</button>
      <button id="moveDown">Move Down</button>
      <button id="saveOrder">Save Order</button>
      <button id="closeOrder">Close</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);

  // ADDED: populate list from dynamic player inputs
  const list = document.getElementById('orderList');
  const containerId = team === 1 ? 'team1PlayerInputs' : 'team2PlayerInputs';
  const inputs = document.querySelectorAll(`#${containerId} input`);
  const players = Array.from(inputs).map(inp => inp.value.trim()).filter(Boolean);
  players.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerText = p;
    li.tabIndex = 0;
    li.dataset.index = i;
    li.draggable = true; // ADDED: allow drag
    // ADDED: drag handlers
    li.addEventListener('dragstart', (ev) => { ev.dataTransfer.setData('text/plain', i); ev.currentTarget.classList.add('dragging'); });
    li.addEventListener('dragend', (ev) => { ev.currentTarget.classList.remove('dragging'); });
    li.addEventListener('dragover', (ev) => ev.preventDefault());
    li.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const src = parseInt(ev.dataTransfer.getData('text/plain'));
      const dst = Array.from(list.children).indexOf(ev.currentTarget);
      if (isNaN(src)) return;
      if (src === dst) return;
      const children = Array.from(list.children);
      const node = children[src];
      if (src < dst) list.insertBefore(node, children[dst].nextSibling);
      else list.insertBefore(node, children[dst]);
      // reindex dataset
      Array.from(list.children).forEach((c, idx) => c.dataset.index = idx);
    });
    list.appendChild(li);
  });

  list.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      const items = list.querySelectorAll('li');
      items.forEach(it => it.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });

  document.getElementById('moveUp').addEventListener('click', () => moveSelected(list, -1));
  document.getElementById('moveDown').addEventListener('click', () => moveSelected(list, 1));
  document.getElementById('saveOrder').addEventListener('click', () => {
    // ADDED: save arranged order back to player inputs
    const items = Array.from(list.querySelectorAll('li')).map(li => li.innerText);
    const inputs = document.querySelectorAll(`#${containerId} input`);
    inputs.forEach((inp, idx) => {
      inp.value = items[idx] || '';
    });
    // update battingOrder for team
    battingOrder[team] = items.slice();
    closeArranger(team);
  });
  document.getElementById('closeOrder').addEventListener('click', () => closeArranger(team));
}

function moveSelected(list, dir) {
  const sel = list.querySelector('li.selected');
  if (!sel) return;
  const idx = Array.from(list.children).indexOf(sel);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= list.children.length) return;
  const swapWith = list.children[newIdx];
  if (dir === -1) list.insertBefore(sel, swapWith);
  else list.insertBefore(swapWith, sel);
}

function closeArranger() {
  // backward-compatible: remove any overlay
  const overlay = document.getElementById('arrangeOverlay') || document.getElementById('arrangeOverlay1') || document.getElementById('arrangeOverlay2');
  if (overlay) overlay.remove();
}


function closeResultModal() {
  const modal = document.getElementById('resultModal');
  if (modal) modal.style.display = 'none';
}

function computeMarginText() {
  // crude margin calculation
  if (innings === 2) {
    if (score >= target) {
      const by = score - target + 1;
      return `Won by ${by} runs`; // for simplicity
    } else {
      const wicketsLeft = 10 - wickets;
      return `Won by ${wicketsLeft} wickets`;
    }
  }
  return '';
}

function generateSummaryHTML() {
  // ADDED: simplified summary - only scores, top batter, best bowler
  const t1 = buildTeamSummary('team1', team1, battingOrder[1]);
  const t2 = buildTeamSummary('team2', team2, battingOrder[2]);
  return `<div class="summary">
    <h4>${team1}: ${innings1Score}/${innings1Wickets}</h4>
    ${t1}
    <h4>${team2}: ${innings2Score}/${innings2Wickets}</h4>
    ${t2}
  </div>`;
}

function buildTeamSummary(key, teamName, order) {
  // ADDED: simplified summary - only score, top batter, best bowler
  const stats = playerStats[key] || {};
  
  // find total team score (already known from innings result)
  let topBatter = null;
  let topRuns = 0;
  let bestBowler = null;
  let bestWickets = 0;
  
  order.forEach(name => {
    const s = stats[name] || { runs:0, balls:0, fours:0, sixes:0, bowling: { balls:0, runs:0, wickets:0 } };
    if (s.runs > topRuns) { topRuns = s.runs; topBatter = { name, runs: s.runs, balls: s.balls }; }
    const b = s.bowling || { balls:0, runs:0, wickets:0 };
    if (b.wickets > bestWickets) { bestWickets = b.wickets; bestBowler = { name, wickets: b.wickets, runs: b.runs, balls: b.balls }; }
  });
  
  const batHTML = topBatter ? `<div class="team-summary">Top Scorer: ${topBatter.name} - ${topBatter.runs} (${topBatter.balls})</div>` : '';
  const bowlHTML = bestBowler ? `<div class="team-summary">Best Bowler: ${bestBowler.name} - ${bestBowler.wickets}w, ${bestBowler.runs} runs</div>` : '';
  return `${batHTML}${bowlHTML}`;
}

/* ADDED: simple WebAudio tones for feedback without external files */
function playTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    let freq = 440;
    let dur = 0.08;
    switch(type) {
      case 'four': freq = 660; dur = 0.12; break;
      case 'six': freq = 880; dur = 0.16; break;
      case 'wicket': freq = 220; dur = 0.18; break;
      case 'extra': freq = 300; dur = 0.09; break;
      case 'noBall': freq = 520; dur = 0.1; break;
      default: freq = 440; dur = 0.06; break;
    }
    o.type = 'sine'; o.frequency.value = freq; g.gain.value = 0.02; o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, dur*1000);
  } catch (e) { /* ignore audio errors */ }
}

function downloadSummary() {
  const text = `Match Summary\n${team1} vs ${team2}\n\n${stripHTML(generateSummaryHTML())}`;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'match-summary.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function stripHTML(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g,'');
}