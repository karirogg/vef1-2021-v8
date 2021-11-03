// TODO hér vantar að sækja viðeigandi föll úr öðrum modules
import { show, createButtons, updateResultScreen } from './lib/ui.js';
import { isValidBestOf, checkGame, computerPlay } from './lib/rock-paper-scissors.js';
import { el } from './lib/helpers.js';

/** Hámarks fjöldi best-of leikja, ætti að vera jákvæð heiltala stærri en 0 */
const MAX_BEST_OF = 10;

/** Fjöldi leikja sem á að spila í núverandi umferð */
let totalRounds;

/** Númer umferðar í núverandi umferð */
let currentRound;

/** Sigrar spilara í núverandi umferð */
let playerWins = 0;

/** Töp spilara í núverandi umferð */
let computerWins = 0;

/**
 * Fjöldi sigra spilara í öllum leikjum. Gætum reiknað útfrá `games` en til
 * einföldunar höldum við utan um sérstaklega.
 */
let totalWins = 0;

/**
 * Utanumhald um alla spilaða leiki, hver leikur er geymdur á forminu:
 *
 * ```
 * {
 *   player: 2,
 *   computer: 1,
 *   win: true,
 * }
 * ```
 */
const games = [];

/**
 * Uppfærir stöðu eftir að spilari hefur spilað.
 * Athugar hvort leik sé lokið, uppfærir stöðu skjá með `updateResultScreen`.
 * Birtir annað hvort `Næsti leikur` takka ef leik er lokið eða `Næsta umferð`
 * ef spila þarf fleiri leiki.
 *
 * @param {number} player Það sem spilari spilaði
 */
function playRound(player) {
    // Komumst að því hvað tölva spilaði og athugum stöðu leiks
    let computer = computerPlay();
    let result = checkGame(player.toString(), computer.toString());

    if(result === 1) playerWins++;
    if(result === -1) computerWins++;

    // Uppfærum result glugga áður en við sýnum, hér þarf að importa falli
    updateResultScreen({
        player: player.toString(),
        computer: computer,
        result: result,
        currentRound: currentRound,
        totalRounds: totalRounds,
        playerWins: playerWins,
        computerWins: computerWins,
    });

    // Uppfærum teljara ef ekki jafntefli, verðum að gera eftir að við setjum titil
    if(result != 0) currentRound++;

    document.querySelector('.result__status').textContent = `Staðan er ${playerWins} – ${computerWins}`;

    // Ákveðum hvaða takka skuli sýna
    const finishGameButton = document.querySelector('button.finishGame');
    const nextRoundButton = document.querySelector('button.nextRound');

    finishGameButton.classList.add('hidden');
    nextRoundButton.classList.add('hidden');

    if(playerWins == (totalRounds+1)/2 || computerWins == (totalRounds+1)/2) {
        finishGameButton.classList.remove('hidden');
    } else {
        nextRoundButton.classList.remove('hidden');
    }

    // Sýnum niðurstöðuskjá
    show('result');
}

/**
 * Fall sem bregst við því þegar smellt er á takka fyrir fjölda umferða
 * @param {Event} e Upplýsingar um atburð
 */
function round(e) {
    // TODO útfæra
    const proposedBestOf = Number.parseInt(e.target.textContent);
    if(isValidBestOf(proposedBestOf)) {
        totalRounds = proposedBestOf;
        currentRound = 1;
    }
    else console.error('Ólöglegur fjöldi leikja.');

    show('play');
}

show('start');

// Takki sem byrjar leik
document
  .querySelector('.start button')
  .addEventListener('click', () => show('rounds'));

// Búum til takka
createButtons(MAX_BEST_OF, round);

// Event listeners fyrir skæri, blað, steinn takka
// TODO
document.querySelector('button.scissor').addEventListener('click', () => playRound(1));
document.querySelector('button.paper').addEventListener('click', () => playRound(2));
document.querySelector('button.rock').addEventListener('click', () => playRound(3));

/**
 * Uppfærir stöðu yfir alla spilaða leiki þegar leik lýkur.
 * Gerir tilbúið þannig að hægt sé að spila annan leik í framhaldinu.
 */
function finishGame() {
  // Bætum við nýjasta leik
    games.push({
        player: playerWins,
        computer: computerWins,
        win: playerWins > computerWins
    })

    // Uppfærum stöðu
    if(playerWins > computerWins) totalWins++;

    // Bætum leik við lista af spiluðum leikjum
    const gamesList = document.querySelector('.games__list');

    const newestGame = games[games.length-1];

    const gameDescription = el('li', `${newestGame.win ? 'Þú vannst' : 'Tölva vann'} ${newestGame.player} – ${newestGame.computer}`);
    gamesList.appendChild(gameDescription);

    document.querySelector('.games__played').textContent = games.length;

    document.querySelector('.games__wins').textContent = totalWins;
    document.querySelector('.games__winratio').textContent = ((totalWins/games.length)*100).toFixed(2);

    document.querySelector('.games__losses').textContent = games.length - totalWins;
    document.querySelector('.games__lossratio').textContent = ((1 - totalWins/games.length)*100).toFixed(2);

    // Núllstillum breytur
    playerWins = 0;
    computerWins = 0;
    currentRound = 0;
    totalRounds = 0;

    // Byrjum nýjan leik!
    show('rounds');
}

// Næsta umferð og ljúka leik takkar
document.querySelector('button.finishGame').addEventListener('click', finishGame);
// TODO takki sem fer með í næstu umferð
document.querySelector('button.nextRound').addEventListener('click', () => show('play'));
