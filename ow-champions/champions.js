'use strict';

const NAME = 'Name';
const HERO = 'Hero';
const WINNER = 'Winner';
const POTG = 'PotG';

const EMPTY_GAME = {players: [], game: {}};

const MAX_PLAYERS = 12;
const HEROES = [
    'Doomfist',
    'Genji',
    'McCree',
    'Pharah',
    'Reaper',
    'Soldier: 76',
    'Sombra',
    'Tracer',
    'Bastion',
    'Hanzo',
    'Junkrat',
    'Mei',
    'Tracer',
    'Torbjörn',
    'Widowmaker',
    'D.Va',
    'Orisa',
    'Reinhardt',
    'Roadhog',
    'Winston',
    'Zarya',
    'Ana',
    'Brigitte',
    'Lúcio',
    'Mercy',
    'Moira',
    'Symmetra',
    'Zenyatta',
    'WINNER'
];
const LAST_HERO = HEROES.length - 1 - 1;
const WINNER_INDEX = LAST_HERO + 1;

let game;

$(function () {
    let select = $('#load-prev-select');
    const games = load();

    games.forEach(function (game_, i) {
        const option = $('<option>').text(game_.date).attr('value', i).tooltip({
            items: '*',
            content: getTooltip(game_)
        });
        select.append(option);
    });
    select.attr('size', Math.max(2, select.children().length));
    $('#load-prev-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Select previous game to load',
        buttons: {
            'Load': function () {
                const s = $('#load-prev-select');
                const gameIndex = parseInt(s.val());
                if (games && games[gameIndex] && games[gameIndex].game) {
                    loadGameFromJSON(games[gameIndex].game);
                    $(this).dialog('close');
                }
            }
        }
    });
    $('#json-input-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Paste the saved game as JSON',
        buttons: {
            'Load': function () {
                const f = $('#json-input-field');
                if (loadGameFromJSONString(f.val())) {
                    $(this).dialog('close');
                    f.val('');
                }
            }
        }
    });
    $('#url-export-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Copy the exported game link',
        buttons: {
            'Copy': function () {
                const f = $('#url-export-field');
                f.select();
                document.execCommand('copy');
            }
        }
    });
    $('#url-export-field').click(function () {
        $(this).select();
    });
    $('#table-copy-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Copy the table',
        buttons: {
            'Copy': function () {
                const f = $('#table-copy-field');
                f.select();
                document.execCommand('copy');
            }
        }
    });
    $('#table-copy-field').click(function () {
        $(this).select();
    });

    select = $('#add-player-select');
    HEROES.forEach(function (hero, i) {
        const option = $('<option>').text(hero).attr('value', i);
        select.append(option);
    });
    $('#add-player-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Enter player name and hero',
        buttons: {
            'Add': function () {
                const pF = $('#add-player-field');
                const hF = $('#add-player-select');
                const player = pF.val();
                const heroIndex = parseInt(hF.val());
                if (addPlayer(player, heroIndex)) {
                    $(this).dialog('close');
                    pF.val('');
                    hF.val('0');
                }
            }
        }
    });

    initHome();

    const url = new URL(window.location.href);
    if ((window.location.href.includes('localhost') || window.location.href.startsWith('file://')) && !url.searchParams.has('load')) {
        const obj = {players: [], game: {}};
        for (let i = 0; i < 12; i++) {
            obj.players.push('player' + (i < 10 ? '0' : '') + i);
        }
        obj.players.forEach(function (player, i) {
            obj.game[player] = i;
        });
        url.searchParams.set('load', JSON.stringify(obj));
    }

    if (url.searchParams.has('load')) {
        let toLoad = url.searchParams.get('load');
        if (toLoad === 'new') {
            loadNewGame();
        } else if (typeof toLoad === 'string' && toLoad.startsWith('{') && toLoad.endsWith('}')) {
            loadGameFromJSONString(toLoad);
        }
    }
});

function initHome() {
    game = undefined;
    const main = $('#main');
    main.empty();

    const newGame = $('<button>').text('New Game').click(function () {
        loadNewGame()
    });

    const loadPrevious = $('<button>').text('Load Previous').click(function () {
        $('#load-prev-modal').dialog('open');
    });

    const loadJSON = $('<button>').text('Load from JSON').click(function () {
        $('#json-input-modal').dialog('open');
    });

    main.append(newGame, loadPrevious, loadJSON);
}


function loadNewGame() {
    loadGameFromJSON(EMPTY_GAME);
}

function loadGameFromJSONString(s) {
    let json;
    try {
        json = JSON.parse(s);
    } catch (e) {
        return false;
    }
    loadGameFromJSON(json);
    return true;
}

function loadGameFromJSON(json) {
    game = sanitizeData(json);
    save();

    displayGame();
}

function displayGame() {
    const main = $('#main');
    main.empty();
    const tableDiv = $('<div>').addClass('table-container');
    const table = $('<table>');
    const headerRow = $('<tr>');
    const headerName = $('<th>').text(NAME);
    const headerHero = $('<th>').text(HERO);
    const headerWinner = $('<th>').text(WINNER);
    const headerPotG = $('<th>').text(POTG);
    headerRow.append(headerName, headerHero, headerWinner, headerPotG);
    table.append(headerRow);
    if (game) {
        const players = game.players;
        players.sort(function (a, b) {
            return game.game[b] - game.game[a];
        });
        players.forEach(function (player) {
            const heroIndex = game.game[player];
            const row = $('<tr>');
            const dataName = $('<td>').text(player);
            const dataHero = $('<td>').text(HEROES[heroIndex]).tooltip({
                items: '*',
                content: 'Hero: ' + heroIndex + '/' + LAST_HERO
            });
            const dataWinner = $('<td>');
            const radioWinner = $('<input>').attr('type', 'radio').attr('id', 'winner_' + player).attr('name', 'winner').prop('disabled', heroIndex === WINNER_INDEX).data('player', player).change(function () {
                if (canGoToNextRound()) {
                    $('#next-round-button').prop('disabled', false);
                }
            });
            dataWinner.append(radioWinner);
            const dataPotG = $('<td>');
            const radioPotG = $('<input>').attr('type', 'radio').attr('id', 'potg_' + player).attr('name', 'potg').prop('disabled', heroIndex === WINNER_INDEX).data('player', player).change(function () {
                if (canGoToNextRound()) {
                    $('#next-round-button').prop('disabled', false);
                }
            });
            dataPotG.append(radioPotG);
            row.append(dataName, dataHero, dataWinner, dataPotG);
            table.append(row);
        });
    }
    tableDiv.append(table);

    const buttonDiv = $('<div>').addClass('button-container');
    const nextRoundButton = $('<button>').attr('id', 'next-round-button').text('Next round').prop('disabled', true).click(function () {
        nextRound();
    });
    const addPlayerButton = $('<button>').text('Add Player').prop('disabled', game.players.length >= MAX_PLAYERS).click(function () {
        $('#add-player-modal').dialog('open');
    });
    const shareButton = $('<button>').text('Share game').click(function () {
        const field = $('#url-export-field');
        field.val(exportURL());
        field.select();
        $('#url-export-modal').dialog('open');
        field.width(field.prop('scrollWidth'));
    });
    const copyButton = $('<button>').text('Copy table').click(function () {
        const field = $('#table-copy-field');
        exportTable(game, field);
        field.select();
        $('#table-copy-modal').dialog('open');
    });
    buttonDiv.append(nextRoundButton, addPlayerButton, shareButton, copyButton);

    main.append(tableDiv, buttonDiv);
}

function nextRound() {
    let winner = $('input[name=winner]:checked').data('player');
    let potg = $('input[name=potg]:checked').data('player');

    if (typeof winner !== 'string' || winner.length === 0 || typeof  potg !== 'string' || potg.length === 0) {
        console.log('Error: Cannot progress to next round with winner "' + winner + '" and PotG "' + potg + '"');
        return false;
    }

    game.players.forEach(function (player) {
        let heroIndex = game.game[player];
        if (heroIndex <= LAST_HERO) {
            const isWinner = player === winner;
            const isPotG = player === potg;
            if (heroIndex === LAST_HERO) {
                if (isWinner || isPotG) {
                    heroIndex = WINNER_INDEX;
                }
            } else {
                heroIndex = Math.min(heroIndex + 1 + (isWinner ? 1 : 0) + (isPotG ? 1 : 0), LAST_HERO);
            }
            game.game[player] = heroIndex;
        }
    });

    save();
    displayGame();
    return true;
}

function addPlayer(player, heroIndex) {
    if (!(typeof player === 'string') || player.length === 0) {
        console.log('Error: "' + player + '" is not a valid new player name');
        return false;
    }
    if (game.players.length >= MAX_PLAYERS) {
        console.log('Error: Too many players in "' + game.players + '"');
        return false;
    }
    if (game.players.includes(player)) {
        console.log('Error: New player "' + player + '" already in players: "' + game.players + '"');
        return false;
    }
    if (!(typeof heroIndex === 'number') || (heroIndex % 1) !== 0 || heroIndex < 0 || heroIndex >= HEROES.length) {
        console.log('Error: "heroIndex": "' + heroIndex + '" for new player "' + player + '" invalid');
        return false;
    }
    game.players.push(player);
    game.game[player] = heroIndex;
    save();

    displayGame();
    return true;
}

function sanitizeData(json) {
    const data = {};
    if (json) {
        let players = json.players;
        if (!players || !Array.isArray(players)) {
            console.log('Error: "players": "' + players + '" invalid');
            players = [];
        }
        players = players.filter(function (player) {
            if (!(typeof player === 'string') || player.length === 0) {
                console.log('Error: "' + player + '" is not a valid player name');
                return false;
            }
            return true;
        });
        if (players.length > MAX_PLAYERS) {
            console.log('Error: Too many players in "' + players + '"');
            players = [];
        }
        data['players'] = players;

        const game = {};
        let gameJSON = json.game;
        if (!gameJSON || !(typeof gameJSON === 'object')) {
            console.log('Error: "game": "' + game + '" invalid');
            gameJSON = {};
        }
        players.forEach(function (player) {
            let heroIndex = gameJSON[player];
            if (!(typeof heroIndex === 'number') || (heroIndex % 1) !== 0 || heroIndex < 0 || heroIndex >= HEROES.length) {
                console.log('Error: "heroIndex": "' + heroIndex + '" for player "' + player + '" invalid');
                game[player] = 0;
            } else {
                game[player] = heroIndex;
            }
        });
        data['game'] = game;
    } else {
        console.log('Error: JSON "' + json + '" invalid');
        data.players = [];
        data.game = {};
    }
    return data;
}

function save() {
    if (game) {
        const games = {games: [{date: new Date(), game: sanitizeData(game)}]};
        const gamesJSON = Cookies.getJSON('games');
        if (gamesJSON && Array.isArray(gamesJSON.games)) {
            gamesJSON.games.forEach(function (game_) {
                if (game_.date && game_.game) {
                    const date = new Date(game_.date);
                    const game__ = sanitizeData(game_.game);
                    if (game__.players.length > 0) {
                        games.games.push({date: date, game: game__});
                    }
                }
            })
        }
        Cookies.set('games', games, {expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)});
    }
}

function load() {
    const games = Cookies.getJSON('games');
    const list = [];
    if (games && Array.isArray(games.games)) {
        games.games.forEach(function (game_) {
            if (game_.date && game_.game) {
                const date = new Date(game_.date);
                const game__ = sanitizeData(game_.game);
                if (game__.players.length > 0) {
                    list.push({date: date, game: game__});
                }
            }
        });
    }
    return list;
}

function exportGame() {
    if (game) {
        return JSON.stringify(game);
    }
    return '';
}

function exportURL() {
    let savedGame = exportGame();
    const url = new URL(window.location.href);
    if (savedGame && typeof savedGame === 'string' && savedGame.length > 0) {
        url.searchParams.set('load', savedGame);
    }
    return url.toString();
}

function getTooltip(game) {
    let s = '';
    if (game) {
        if (game.date) {
            s += 'Date: ' + game.date + '<br>';
        }
        s += 'Game:<br>' + exportTable(game.game);
    }
    return s;
}

function exportTable(game, textarea) {
    game = sanitizeData(game);
    let text = '';
    let rows = 1;
    let cols = 1;
    game.players.forEach(function (player) {
        const heroIndex = game.game[player];
        const line = player + ': ' + HEROES[heroIndex] + ' (' + heroIndex + '/' + LAST_HERO + ')';
        const length = line.length;
        if (length > cols) {
            cols = length;
        }
        rows++;
        text += line + (textarea ? '\n' : '<br>');
    });
    if (textarea) {
        textarea.attr('rows', rows).attr('cols', cols).text(text);
    } else {
        return text;
    }
}

function canGoToNextRound() {
    const winner = $('input[name=winner]:checked');
    const potg = $('input[name=potg]:checked');
    return winner.length === 1 && game.game[winner.data('player')] !== WINNER_INDEX && potg.length === 1 && game.game[potg.data('player')] !== WINNER_INDEX
}
