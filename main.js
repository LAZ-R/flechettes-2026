const MAIN = document.getElementById('main');

// TARGET /////////////////////////////////////////////////

// CONSTANTS ==========================
const SEGMENTS_COUNT = 20;
const SEGMENT_VALUES = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
  3, 19, 7, 16, 8, 11, 14, 9, 12, 5
];
const RINGS = [
  0.10, // bullseye
  0.25,  // outer bull
  0.30, // simple inner
  0.55,  // triple
  0.80, // simple outer
  1,  // double
  //1     // bord
];

const HIGHLIGHT_DURATION = 750;

// FUNCTIONS ==========================

function getTargetDom() {
  return `
    <div class="target-block">
      <div class="target-ring double-ring"></div>
      <div class="target-ring simple-ring"></div>
      <div class="target-ring triple-ring"></div>
      <div class="target-ring simple-ring-inner"></div>
      <div id="bullRing" class="target-ring bull-ring"></div>
      <div id="bullEyeRing" class="target-ring bull-eye-ring"></div>
      <div id="highlightLayer" class="highlight-layer"></div>
      <div class="numbers-layer">${getNumbersLayout()}</div>
      <div id="target" class="target-hidden-div" onclick="onTargetClick(event)"></div>
    </div>
  `;
}

function getRingNameByRingNumber(ringNumber) {
  if (ringNumber == 0) return `Bull's Eye`;
  if (ringNumber == 1) return `Bull`;
  if (ringNumber == 2) return `Simple inner`;
  if (ringNumber == 3) return `Triple`;
  if (ringNumber == 4) return `Simple outter`;
  if (ringNumber == 5) return `Double`;
}

function getNumbersLayout() {
  const radiusFactor = 0.895;
  const FULL_CIRCLE = 2 * Math.PI;
  const SEGMENT_ANGLE = FULL_CIRCLE / SEGMENTS_COUNT;

  let str = '';

  for (let i = 0; i < SEGMENTS_COUNT; i++) {
    const value = SEGMENT_VALUES[i];

    let angle = i * SEGMENT_ANGLE;
    angle -= Math.PI / 2;

    // 👉 coordonnées normalisées directement (0 → 1)
    const nx = 0.5 + Math.cos(angle) * 0.5 * radiusFactor;
    const ny = 0.5 + Math.sin(angle) * 0.5 * radiusFactor;

    str += `
      <span style="left: ${nx * 100}%; top: ${ny * 100}%;">
        ${value}
      </span>
    `;
  }

  return str;
}

function onTargetClick(event) {
  const TARGET = document.getElementById('target');
  const rect = TARGET.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const dx = x - cx;
  const dy = y - cy;

  const distance = Math.sqrt(dx * dx + dy * dy);

  const radius = rect.width / 2;

  const ratio = distance / radius; // entre 0 (centre) et 1 (bord)

  let ring = -1;

  for (let i = 0; i < RINGS.length; i++) {
    if (ratio <= RINGS[i]) {
      ring = i;
      break;
    }
  }
  const RESULT = {
    segment: null,
    value: null,
    label: null,
  }

  if (ring === -1) { // clic hors du cercle
    // hors cible
    RESULT.segment = 'Miss';
    RESULT.value = 0;
    RESULT.label = 'Miss';
  } else {
    if (ring == 0) { // Bull's Eye
      RESULT.segment = 'BullEye';
      RESULT.value = 50;
      RESULT.label = 'Bull\'s Eye';
      // HIGHLIGHTING
      document.getElementById('bullEyeRing').classList.add('highlighted');
      setTimeout(() => {
        document.getElementById('bullEyeRing').classList.remove('highlighted');
      }, HIGHLIGHT_DURATION);
    } else if (ring == 1) { // Bull
      RESULT.segment = 'Bull';
      RESULT.value = 25;
      RESULT.label = 'Bull';
      // HIGHLIGHTING
      document.getElementById('bullRing').classList.add('highlighted');
      setTimeout(() => {
        document.getElementById('bullRing').classList.remove('highlighted');
      }, HIGHLIGHT_DURATION);
    } else {
      let angle = Math.atan2(dy, dx); // atan2 donne un angle entre -π et π
      angle = (angle + 2 * Math.PI) % (2 * Math.PI); // convertir en [0 → 2π]
      angle = (angle + Math.PI / 2) % (2 * Math.PI); // décaler pour que 0 soit en haut
      const segmentAngle1 = (2 * Math.PI) / SEGMENTS_COUNT;
      angle = (angle + segmentAngle1 / 2) % (2 * Math.PI); // décaler de la moitié d'un segment pour que le MILIEU du 20 soit en haut 
      const normalizedAngle = angle / (2 * Math.PI); // On normalise en [0 → 1]
      const segment = Math.floor(normalizedAngle * SEGMENTS_COUNT); // Numéro brut du segment
      const value = SEGMENT_VALUES[segment];
      
      RESULT.segment = value;
      RESULT.value = getRingNameByRingNumber(ring) == "Simple outter" || getRingNameByRingNumber(ring) == "Simple inner" ? value : getRingNameByRingNumber(ring) == "Double" ? value * 2 : value * 3;
      RESULT.label = getRingNameByRingNumber(ring) == "Simple outter" || getRingNameByRingNumber(ring) == "Simple inner" ? value : getRingNameByRingNumber(ring) == "Double" ? `D${value}` : `T${value}`;
      
      // HIGHLIGHTING
      const segmentAngle2 = 360 / SEGMENTS_COUNT;
      const startAngle = segment * segmentAngle2;
      const endAngle = startAngle + segmentAngle2;
      const rotation = -9;
      const inner = RINGS[ring - 1];
      const outer = RINGS[ring];
      const highlightLayer = document.getElementById('highlightLayer');
      highlightLayer.style.background = `cyan`;
      highlightLayer.style.mask = `
        radial-gradient(circle closest-side,
          transparent ${inner * 100}%,
          black ${inner * 100}% ${outer * 100}%,
          transparent ${outer * 100}%
        ),
        conic-gradient(
          from ${rotation}deg,
          transparent ${startAngle}deg,
          black ${startAngle}deg ${endAngle}deg,
          transparent ${endAngle}deg
        )
      `;
      highlightLayer.style.maskComposite = 'intersect';
      highlightLayer.style.webkitMaskComposite = 'source-in';

      setTimeout(() => {
        highlightLayer.style.background = '';
      }, HIGHLIGHT_DURATION);
    }
  }
  
  if (currentDart != 4) {
    const currentPlayer = PLAYERS.find((e) => e.id == currentPlayerId);

    currentTurnThrows.push({
      result: RESULT,
      previousScore: currentPlayer.score
    });
    updateScores(RESULT);
    currentDart += 1;
    const dartDom = document.getElementById(`dart${currentDart}Score`);
    if (dartDom !== null) {
      dartDom.classList.add('current');
    }
    if (currentDart == 4 && !isBust && !isGameFinished) {
      // Confirm popup
      setTimeout(() => {
        const popUp = document.getElementById('popUp');
        popUp.innerHTML = `
          <div class="pop-up-block">
            <span>Confirmer le tour ?</span>
            <div class="turn-recap">
              <span class="dart-recap">${document.getElementById('dart1Score').innerHTML}</span>
              <span class="dart-recap">${document.getElementById('dart2Score').innerHTML}</span>
              <span class="dart-recap">${document.getElementById('dart3Score').innerHTML}</span>
            </div>
            <span style="color: hsl(${previousTurnScore - currentPlayer.score}, 100%, 50%);">${previousTurnScore - currentPlayer.score} pts</span>
            <div class="pop-up-buttons-container">
              <button class="cancel-button" onclick="onCancelTurnClick()">Annuler</button>
              <button class="confirm-button" onclick="onConfirmTurnClick()">Confirmer</button>
            </div>
          </div>
        `;
        popUp.classList.remove('hidden');
      }, POPUP_DELAY);
    }
  }
}
window.onTargetClick = onTargetClick;

function onCancelTurnClick() {
  isGameFinished = false;
  isBust = false;
  console.log('cancel turn');
  document.getElementById('popUp').classList.add('hidden');
}
window.onCancelTurnClick = onCancelTurnClick;

function onConfirmTurnClick() {
  console.log('confirm turn');
  endPlayerTurn();
  document.getElementById('popUp').classList.add('hidden');
}
window.onConfirmTurnClick = onConfirmTurnClick;

function onConfirmBustClick() {
  const currentPlayer = PLAYERS.find((e) => e.id == currentPlayerId);
  currentPlayer.score = previousTurnScore;
  document.getElementById(`player${currentPlayer.id}GlobalScore`).innerHTML = currentPlayer.score;
  isBust = false;
  endPlayerTurn();
  document.getElementById('popUp').classList.add('hidden');
}
window.onConfirmBustClick = onConfirmBustClick;

function onConfirmWinClick() {
  console.log('confirm win');
  document.getElementById('popUp').classList.add('hidden');
  // Restart game
  onSubmitGameClick();
}
window.onConfirmWinClick = onConfirmWinClick;

function onReconfigureClick() {
  console.log('GO TO reconfigure');
  document.getElementById('popUp').classList.add('hidden');
  MAIN.innerHTML = getConfigurePageDom();
}
window.onReconfigureClick = onReconfigureClick;

function updateScores(result) {
  let currentPlayer = PLAYERS.find((e) => e.id == currentPlayerId);
  const playerGlobalScoreDom = document.getElementById(`player${currentPlayer.id}GlobalScore`);

  currentPlayer.score -= result.value;
  const dartDom = document.getElementById(`dart${currentDart}Score`);

  if (result.value == result.label) {
    dartDom.innerHTML = result.value;
  } else {
    dartDom.innerHTML = `${result.label} (${result.value})`;
  }
  dartDom.classList.remove('current');

  playerGlobalScoreDom.innerHTML = currentPlayer.score;

  if (currentPlayer.score < 0) {
    // BUST
    console.log('Bust');
    isBust = true;
    setTimeout(() => {
      const popUp = document.getElementById('popUp');
      popUp.innerHTML = `
        <div class="pop-up-block">
          <span>BUST</span>
          <span style="color: hsl(0, 100%, 50%);">${previousTurnScore - currentPlayer.score} pts</span>
          <div class="pop-up-buttons-container">
            <button class="cancel-button" onclick="onCancelTurnClick()">Annuler</button>
            <button class="confirm-button" onclick="onConfirmBustClick()">Confirmer</button>
          </div>
        </div>
      `;
      popUp.classList.remove('hidden');
    }, POPUP_DELAY);
  } else {
    // calcul meilleur score
    const uniqueScores = [...new Set(
      PLAYERS.map(player => player.score)
    )].sort((a, b) => a - b);

    for (const player of PLAYERS) {
      const playerDom = document.getElementById(`player${player.id}GlobalScoreContainer`);

      playerDom.classList.remove('gold', 'silver', 'bronze');

      const rank = uniqueScores.indexOf(player.score);

      if (rank === 0) {
        playerDom.classList.add('gold');
      } else if (rank === 1) {
        playerDom.classList.add('silver');
      } else if (rank === 2) {
        playerDom.classList.add('bronze');
      }
    }

    if (currentPlayer.score == 0) {
      // Win
      console.log('YOU WIN');
      isGameFinished = true;
      let currentPlayer = PLAYERS.find((e) => e.id == currentPlayerId)
      setTimeout(() => {
        const popUp = document.getElementById('popUp');
        popUp.innerHTML = `
          <div class="pop-up-block">
            <span>C'est ${currentPlayer.name} qui gagne !</span>
            <span>(en ${currentGlobalTurn} tours)</span>
            <div class="pop-up-buttons-container">
              <button class="cancel-button" onclick="onCancelTurnClick()">Annuler</button>
              <button class="confirm-button" onclick="onConfirmWinClick()">Rejouer</button>
            </div>
            <button onclick="onReconfigureClick()">Reconfigurer</button>
          </div>
        `;
        popUp.classList.remove('hidden');
      }, POPUP_DELAY);
    }
  }
}

const POPUP_DELAY = 200;
let GAME_TYPE = '301';
let PLAYERS_COUNT = 2;
let PLAYERS = [
  {
    id: 0,
    name: 'Joueur 1',
    score: 301,
  },
  {
    id: 1,
    name: 'Joueur 2',
    score: 301,
  },
];

let currentGlobalTurn = 0;
let currentPlayerTurn = 1;
let currentPlayerId = 0;
let currentPlayerIndex = 0;
let currentDart = 1;
let currentTurnThrows = [];
let isBust = false;

let previousTurnScore = 0;
let isGameFinished = false;

////////////////////////////////

function getConfigurePageDom() {
  return `
    <div class="page-block">
      <fieldset>
        <legend>Sélectionnez un mode de jeu :</legend>

        <div>
          <input type="radio" id="301" name="gameType" onclick="onRadioClick(event, 'gameType')" value="301" ${GAME_TYPE == '301' ? 'checked' : ''} />
          <label for="301">301</label>
        </div>

        <div>
          <input type="radio" id="501" name="gameType" onclick="onRadioClick(event, 'gameType')" value="501" ${GAME_TYPE == '501' ? 'checked' : ''} />
          <label for="501">501</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Sélectionnez un nombre de joueurs :</legend>

        <div>
          <input type="radio" id="1player" name="playersCount" onclick="onRadioClick(event, 'playersCount')" value="1" ${PLAYERS_COUNT == 1 ? 'checked' : ''} />
          <label for="1player">1</label>
        </div>

        <div>
          <input type="radio" id="2player" name="playersCount" onclick="onRadioClick(event, 'playersCount')" value="2" ${PLAYERS_COUNT == 2 ? 'checked' : ''} />
          <label for="2player">2</label>
        </div>

        <div>
          <input type="radio" id="3player" name="playersCount" onclick="onRadioClick(event, 'playersCount')" value="3" ${PLAYERS_COUNT == 3 ? 'checked' : ''} />
          <label for="3player">3</label>
        </div>

        <div>
          <input type="radio" id="4player" name="playersCount" onclick="onRadioClick(event, 'playersCount')" value="4" ${PLAYERS_COUNT == 4 ? 'checked' : ''} />
          <label for="4player">4</label>
        </div>
      </fieldset>

      <fieldset id="playersNameField">
        <legend>Sélectionnez le nom des joueurs :</legend>
        <input type="text" id="player0" placeholder="Joueur 1" oninput="onPlayerNameInput(event)" />
        <input type="text" id="player1" placeholder="Joueur 2" oninput="onPlayerNameInput(event)" />
      </fieldset>

      <button class="start-game-button" onclick="onSubmitGameClick()">Commencer</button>
    </div>
  `;
}

function onRadioClick(event, name) {
  if (name == 'gameType') {
    GAME_TYPE = event.target.value;
    for (const player of PLAYERS) {
      player.score = Number(GAME_TYPE);
    }
  }
  if (name == 'playersCount') {
    PLAYERS_COUNT = Number(event.target.value);
    PLAYERS = [];
    for (let index = 0; index < PLAYERS_COUNT; index++) {
      PLAYERS.push({
        id: index,
        name: `Joueur ${index + 1}`,
        score: Number(GAME_TYPE),
      });
    }
    let str = '';
    for (const player of PLAYERS) {
      str += `
        <input type="text" id="player${player.id}" placeholder="Joueur ${player.id + 1}" oninput="onPlayerNameInput(event)" />
      `;
    }
    document.getElementById('playersNameField').innerHTML = `
      <legend>Sélectionnez le nom des joueurs :</legend>
      ${str}
    `;
  }
}
window.onRadioClick = onRadioClick;

function onPlayerNameInput(event) {
  const value = event.target.value;
  const playerIndex = event.target.id[6];
  PLAYERS[playerIndex].name = value;
}
window.onPlayerNameInput = onPlayerNameInput;

function onSubmitGameClick() {
  isBust = false;
  isGameFinished = false;
  currentTurnThrows = [];
  console.log(`Partie de ${GAME_TYPE} à ${PLAYERS_COUNT} joueur(s) :`);

  // On mélange les joueurs aléatoirement
  shuffle(PLAYERS);
  currentPlayerIndex = 0;
  currentPlayerId = PLAYERS[currentPlayerIndex].id;

  for (const player of PLAYERS) {
    player.score = Number(GAME_TYPE);
    console.log(`Joueur ${player.id + 1}: ${player.name} (score: ${player.score})`);
  }

  function getPlayersGlobalScoreBlockDom() {
    let str = '';
    for (let index = 0; index < PLAYERS.length; index++) {
      const player = PLAYERS[index];
      str += `
        <div id="player${player.id}GlobalScoreContainer" class="player-global-score-container ${index == 0 ? 'active' : ''}">
          <span>${player.name}</span>
          <span id="player${player.id}GlobalScore" class="global-score-txt">${player.score}</span>
        </div>`;
    }
    return str;
  }

  // On met en place le DOM
  MAIN.innerHTML = `
    <div class="global-infos-block">
      <span>Mode de jeu: ${GAME_TYPE}</span>
      <span id="currentGlobalTurn">Tour ${currentGlobalTurn}</span>
    </div>
    <div class="players-global-score-block" style="--players-count: ${PLAYERS_COUNT};">
      ${getPlayersGlobalScoreBlockDom()}
    </div>
    <div id="currentPlayerTurnBlock" class="player-turn-block"></div>
    ${getTargetDom()}
    <button class="cancel-dart-button" onclick="onCancelDartClick()">Annuler la dernière fléchette</button>
  `;

  startGlobalTurn();
}
window.onSubmitGameClick = onSubmitGameClick;

function startGlobalTurn() {
  currentGlobalTurn = 1;
  document.getElementById('currentGlobalTurn').innerHTML = `Tour ${currentGlobalTurn}`;
  startPlayerTurn();
}

function startPlayerTurn() {
  currentDart = 1;
  document.getElementById('currentPlayerTurnBlock').innerHTML = `
    <span id="dart1Score" class="dart-score current">-</span>
    <span id="dart2Score" class="dart-score">-</span>
    <span id="dart3Score" class="dart-score">-</span>
  `;
  previousTurnScore = PLAYERS.find((e) => e.id == currentPlayerId).score;
}

function onCancelDartClick() {
  if (currentTurnThrows.length === 0) return;
  isBust = false;

  const lastThrow = currentTurnThrows.pop();

  const currentPlayer = PLAYERS.find((e) => e.id == currentPlayerId);

  // restore score
  currentPlayer.score = lastThrow.previousScore;

  // update DOM
  document.getElementById(`player${currentPlayer.id}GlobalScore`).innerHTML = currentPlayer.score;

  // rollback dart display
  currentDart -= 1;

  const dartDom = document.getElementById(`dart${currentDart}Score`);
  dartDom.innerHTML = '-';
  dartDom.classList.add('current');

  if (currentDart < 3) {
    document.getElementById(`dart${currentDart + 1}Score`)?.classList.remove('current');
  }
}
window.onCancelDartClick = onCancelDartClick;

function endPlayerTurn() {
  document.getElementById(`player${currentPlayerId}GlobalScoreContainer`).classList.remove('active');

  currentPlayerIndex += 1;

  if (currentPlayerIndex > PLAYERS.length - 1) {
    currentPlayerIndex = 0;
    currentGlobalTurn += 1;
    document.getElementById('currentGlobalTurn').innerHTML = `Tour ${currentGlobalTurn}`;
  }

  currentPlayerId = PLAYERS[currentPlayerIndex].id;

  document.getElementById(`player${currentPlayerId}GlobalScoreContainer`).classList.add('active');

  currentTurnThrows = [];

  startPlayerTurn();
}

// EXECUTION //////////////////////////////////////////////
MAIN.innerHTML = getConfigurePageDom();


// UTILS //////////////////////////////////////////////////

export const getRandomIntegerBetween = (min, max) => {
  const nMin = Number(min);
  const nMax = Number(max);

  if (Number.isNaN(nMin) || Number.isNaN(nMax)) {
    throw new Error(`Arguments invalides : min="${min}", max="${max}"`);
  }

  if (nMin > nMax) {
    throw new Error(`La borne minimale (${nMin}) ne peut pas être supérieure à la borne maximale (${nMax}).`);
  }

  return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}