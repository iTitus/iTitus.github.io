'use strict';

const EMPTY_GAME = {players: [], game: {}};

const MAX_PLAYERS = 12;
const HEROES = [
    'D.Va',
    'Orisa',
    'Reinhardt',
    'Roadhog',
    'Winston',
    'Wrecking Ball',
    'Zarya',
    'Bastion',
    'Doomfist',
    'Genji',
    'Hanzo',
    'Junkrat',
    'McCree',
    'Mei',
    'Pharah',
    'Reaper',
    'Soldier: 76',
    'Sombra',
    'Symmetra',
    'Torbjörn',
    'Tracer',
    'Widowmaker',
    'Ana',
    'Brigitte',
    'Lúcio',
    'Mercy',
    'Moira',
    'Zenyatta',
    'WINNER'
];
const WINNER_INDEX = HEROES.length - 1;
const LAST_HERO = WINNER_INDEX - 1;

let game;

$(function () {
    const games = load();

    let select = $('#load-prev-select');
    games.forEach(function (game_, i) {
        select.append($('<option>').text('' + game_.date).attr('value', i).tooltip({
            html: true,
            title: getTooltip(game_)
        }));
    });
    select.attr('size', Math.max(2, select.children().length));
    /*$('#load-prev-modal').on('shown.bs.modal', function (e) {
        $('#load-prev-select').focus();
        $(this).modal('handleUpdate');
    });*/
    $('#load-prev-button').click(function () {
        const select = $('#load-prev-select');
        const gameIndex = parseInt(select.val());
        if (games && gameIndex && games[gameIndex] && games[gameIndex].game) {
            loadGame(games[gameIndex].game);
            $('#load-prev-modal').modal('hide');
            select.val('0');
        }
    });

    $('#load-json-button').click(function () {
        const input = $('#load-json-input');
        if (loadGameFromJSONString(input.val())) {
            $('#load-json-modal').modal('hide');
            input.val('');
        }
    });

    select = $('#add-player-select');
    HEROES.forEach(function (hero, i) {
        select.append($('<option>').text(hero).attr('value', i));
    });
    $('#add-player-button').click(function () {
        const input = $('#add-player-input');
        const select = $('#add-player-select');
        if (addPlayer(input.val(), parseInt(select.val()))) {
            $('#add-player-modal').modal('hide');
            input.val('');
            select.val('0');
        }
    });

    select = $('#edit-player-select');
    HEROES.forEach(function (hero, i) {
        select.append($('<option>').text(hero).attr('value', i));
    });
    $('#edit-player-button').click(function () {
        const inputOld = $('#edit-player-input-old');
        const inputNew = $('#edit-player-input-new');
        const select = $('#edit-player-select');
        if (editPlayer(inputOld.val(), inputNew.val(), parseInt(select.val()))) {
            $('#edit-player-modal').modal('hide');
            inputOld.val('');
            inputNew.val('');
            select.val('0');
        }
    });

    $('#copy-link-modal').on('shown.bs.modal', function () {
        const input = $('#copy-link-input');
        input.width(input.prop('scrollWidth')).select();
        $(this).modal('handleUpdate');
    });
    $('#copy-link-input').click(function () {
        $(this).select();
    });
    $('#copy-link-button').click(function () {
        const input = $('#copy-link-input');
        input.select();
        document.execCommand('copy');
        // $('#copy-link-modal').modal('hide');
    });

    $('#copy-game-modal').on('shown.bs.modal', function () {
        $('#copy-game-textarea').select();
        $(this).modal('handleUpdate');
    });
    $('#copy-game-textarea').click(function () {
        $(this).select();
    });
    $('#copy-game-button').click(function () {
        const input = $('#copy-game-input');
        input.select();
        document.execCommand('copy');
        // $('#copy-game-modal').modal('hide');
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
        const toLoad = url.searchParams.get('load');
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

    const newButton = $('<button>').text('New Game').click(function () {
        loadNewGame()
    });
    const prevButton = $('<button>').text('Load Previous').attr('data-toggle', 'modal').attr('data-target', '#load-prev-modal');
    const jsonButton = $('<button>').text('Load from JSON').attr('data-toggle', 'modal').attr('data-target', '#load-json-modal');

    main.append(newButton, prevButton, jsonButton);
}


function loadNewGame() {
    loadGame(EMPTY_GAME);
}

function loadGameFromJSONString(jsonString) {
    let game_;
    try {
        game_ = JSON.parse(jsonString);
    } catch (e) {
        return false;
    }
    loadGame(game_);
    return true;
}

function loadGame(game_) {
    game = sanitizeData(game_);
    save();

    displayGame();
}

function displayGame() {
    const main = $('#main');
    main.empty();
    const tableDiv = $('<div>').addClass('table-container');
    const table = $('<table>');
    const headerRow = $('<tr>');
    const headerName = $('<th>').text('Name');
    const headerHero = $('<th>').text('Hero');
    const headerWinner = $('<th>').text('Winner');
    const headerPotG = $('<th>').text('PotG');
    const headerEdit = $('<th>').text('Edit/Delete');
    headerRow.append(headerName, headerHero, headerWinner, headerPotG, headerEdit);
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
                title: 'Hero: ' + heroIndex + '/' + LAST_HERO
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
            const dataEdit = $('<td>');
            const divDrop = $('<div>').addClass('dropdown');
            const buttonDropToggle = $('<button>').addClass('dropdown-toggle').attr('data-toggle', 'dropdown').text('...');
            const divDropMenu = $('<div>').addClass('dropdown-menu');
            const buttonEdit = $('<button>').addClass('dropdown-item').text('Edit').click(function () {
                const inputOld = $('#edit-player-input-old');
                const inputNew = $('#edit-player-input-new');
                const select = $('#edit-player-select');
                inputOld.val(player);
                inputNew.val(player);
                select.val(heroIndex);
                $('#edit-player-modal').modal('show');
            });
            const buttonDelete = $('<button>').addClass('dropdown-item').text('Delete').click(function () {
                if (confirm('Do you really want to delete "' + player + '" ?')) {
                    deletePlayer(player);
                }
            });
            divDropMenu.append(buttonEdit, buttonDelete);
            divDrop.append(buttonDropToggle, divDropMenu);
            dataEdit.append(divDrop);
            row.append(dataName, dataHero, dataWinner, dataPotG, dataEdit);
            table.append(row);
        });
    }
    tableDiv.append(table);

    const buttonDiv = $('<div>').addClass('button-container');
    const nextRoundButton = $('<button>').attr('id', 'next-round-button').text('Next round').prop('disabled', true).click(function () {
        nextRound();
    });
    const addPlayerButton = $('<button>').text('Add Player').prop('disabled', game.players.length >= MAX_PLAYERS).attr('data-toggle', 'modal').attr('data-target', '#add-player-modal');
    const shareButton = $('<button>').text('Share game').click(function () {
        const input = $('#copy-link-input');
        input.val(exportURL());
        $('#copy-link-modal').modal('show');
    });
    const copyButton = $('<button>').text('Copy table').click(function () {
        exportTable(game, $('#copy-game-textarea'));
        $('#copy-game-modal').modal('show');
    });
    buttonDiv.append(nextRoundButton, addPlayerButton, shareButton, copyButton);

    main.append(tableDiv, buttonDiv);
}

function nextRound() {
    const winner = $('input[name=winner]:checked').data('player');
    const potg = $('input[name=potg]:checked').data('player');

    if (!canGoToNextRound()) {
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
    if (!game) {
        return false;
    }
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

function deletePlayer(player) {
    if (!game) {
        return false;
    }
    if (!(typeof player === 'string') || player.length === 0 || !game.players.includes(player)) {
        console.log('Error: Player "' + player + '" not found in players: "' + game.players + '"');
        return false;
    }

    game.players.splice(game.players.indexOf(player), 1);
    delete game.game[player];

    save();
    displayGame();

    return true;
}

function editPlayer(oldPlayer, newPlayer, newHeroIndex) {
    if (!game) {
        return false;
    }
    if (!(typeof oldPlayer === 'string') || oldPlayer.length === 0 || !game.players.includes(oldPlayer)) {
        console.log('Error: Old player name "' + oldPlayer + '" not found in players: "' + game.players + '"');
        return false;
    }
    if (!(typeof newPlayer === 'string') || newPlayer.length === 0) {
        console.log('Error: New player name"' + newPlayer + '" is not a valid player name');
        return false;
    }
    if (oldPlayer !== newPlayer && game.players.includes(newPlayer)) {
        console.log('Error: New player name "' + newPlayer + '" already found in players: "' + game.players + '"');
        return false;
    }
    if (!(typeof newHeroIndex === 'number') || (newHeroIndex % 1) !== 0 || newHeroIndex < 0 || newHeroIndex >= HEROES.length) {
        console.log('Error: "newHeroIndex": "' + newHeroIndex + '" for new player "' + newPlayer + '" invalid');
        return false;
    }

    if (oldPlayer !== newPlayer) {
        game.players.splice(game.players.indexOf(oldPlayer), 1);
        game.players.push(newPlayer);

        delete game.game[oldPlayer];
    }
    game.game[newPlayer] = newHeroIndex;

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
    const savedGame = exportGame();
    const url = new URL(window.location.href);
    if (savedGame && typeof savedGame === 'string' && savedGame.length > 0) {
        url.searchParams.set('load', savedGame);
    }
    return url.toString();
}

function getTooltip(game) {
    let s = '<p style="text-align:left;">';
    if (game) {
        if (game.date) {
            s += 'Date: ' + game.date + '<br>';
        }
        s += 'Game:<br>' + exportTable(game.game);
    }
    s += '</p>';
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
    return winner.length === 1 && game.game[winner.data('player')] !== WINNER_INDEX && potg.length === 1 && game.game[potg.data('player')] !== WINNER_INDEX;
}
