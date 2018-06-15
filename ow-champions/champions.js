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

var game;

$(function () {
    var select = $('#load-prev-select');
    var games = load();

    games.forEach(function (game_, i) {
        var option = $('<option>').text(game_.date).attr('value', i).tooltip({
            items: '*',
            content: getTooltip(game_)
        });
        select.append(option);
    });
    select.attr('size', Math.max(1, select.children().length));
    $('#load-prev-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Select previous game to load',
        buttons: {
            'Load': function () {
                var s = $('#load-prev-select');
                var gameIndex = parseInt(s.val());
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
                var f = $('#json-input-field');
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
                var f = $('#url-export-field');
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
                var f = $('#table-copy-field');
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
        var option = $('<option>').text(hero).attr('value', i);
        select.append(option);
    });
    $('#add-player-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Enter player name and hero',
        buttons: {
            'Add': function () {
                var pF = $('#add-player-field');
                var hF = $('#add-player-select');
                var player = pF.val();
                var heroIndex = parseInt(hF.val());
                if (addPlayer(player, heroIndex)) {
                    $(this).dialog('close');
                    pF.val('');
                    hF.val('0');
                }
            }
        }
    });

    initHome();

    var url = new URL(window.location.href);
    if ((window.location.href.includes('localhost') || window.location.href.startsWith('file://')) && !url.searchParams.has('load')) {
        var obj = {players: [], game: {}};
        for (var i = 0; i < 12; i++) {
            obj.players.push('player' + (i < 10 ? '0' : '') + i);
        }
        obj.players.forEach(function (player, i) {
            obj.game[player] = i;
        });
        url.searchParams.set('load', JSON.stringify(obj));
    }

    if (url.searchParams.has('load')) {
        var toLoad = url.searchParams.get('load');
        if (toLoad === 'new') {
            loadNewGame();
        } else if (typeof toLoad === 'string' && toLoad.startsWith('{') && toLoad.endsWith('}')) {
            loadGameFromJSONString(toLoad);
        }
    }
});

function initHome() {
    game = undefined;
    var main = $('#main');
    main.empty();

    var newGame = $('<button>').text('New Game').click(function () {
        loadNewGame()
    });

    var loadPrevious = $('<button>').text('Load Previous').click(function () {
        $('#load-prev-modal').dialog('open');
    });

    var loadJSON = $('<button>').text('Load from JSON').click(function () {
        $('#json-input-modal').dialog('open');
    });

    main.append(newGame, loadPrevious, loadJSON);
}


function loadNewGame() {
    loadGameFromJSON(EMPTY_GAME);
}

function loadGameFromJSONString(s) {
    var json;
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
    var main = $('#main');
    main.empty();
    var tableDiv = $('<div>').addClass('table-container');
    var table = $('<table>');
    var headerRow = $('<tr>');
    var headerName = $('<th>').text(NAME);
    var headerHero = $('<th>').text(HERO);
    var headerWinner = $('<th>').text(WINNER);
    var headerPotG = $('<th>').text(POTG);
    headerRow.append(headerName, headerHero, headerWinner, headerPotG);
    table.append(headerRow);
    if (game) {
        var players = game.players;
        players.sort(function (a, b) {
            return game.game[b] - game.game[a];
        });
        players.forEach(function (player) {
            var heroIndex = game.game[player];
            var row = $('<tr>');
            var dataName = $('<td>').text(player);
            var dataHero = $('<td>').text(HEROES[heroIndex]);
            var dataWinner = $('<td>');
            var radioWinner = $('<input>').attr('type', 'radio').attr('id', 'winner_' + player).attr('name', 'winner').prop('disabled', heroIndex === WINNER_INDEX).data('player', player).change(function () {
                var winner = $('input[name=winner]:checked');
                var potg = $('input[name=potg]:checked');
                if (winner.length === 1 && game.game[winner.data('player')] !== WINNER_INDEX && potg.length === 1 && game.game[potg.data('player')] !== WINNER_INDEX) {
                    $('#next-round-button').prop('disabled', false);
                }
            });
            dataWinner.append(radioWinner);
            var dataPotG = $('<td>');
            var radioPotG = $('<input>').attr('type', 'radio').attr('id', 'potg_' + player).attr('name', 'potg').prop('disabled', heroIndex === WINNER_INDEX).data('player', player).change(function () {
                var winner = $('input[name=winner]:checked');
                var potg = $('input[name=potg]:checked');
                if (winner.length === 1 && game.game[winner.data('player')] !== WINNER_INDEX && potg.length === 1 && game.game[potg.data('player')] !== WINNER_INDEX) {
                    $('#next-round-button').prop('disabled', false);
                }
            });
            dataPotG.append(radioPotG);
            row.append(dataName, dataHero, dataWinner, dataPotG);
            table.append(row);
        });
    }
    tableDiv.append(table);

    var buttonDiv = $('<div>').addClass('button-container');
    var nextRoundButton = $('<button>').attr('id', 'next-round-button').text('Next round').prop('disabled', true).click(function () {
        nextRound();
    });
    var addPlayerButton = $('<button>').text('Add Player').click(function () {
        $('#add-player-modal').dialog('open');
    });
    var shareButton = $('<button>').text('Share game').click(function () {
        var field = $('#url-export-field');
        field.val(exportURL());
        field.select();
        $('#url-export-modal').dialog('open');
        field.width(field.prop('scrollWidth'));
    });
    var copyButton = $('<button>').text('Copy table').click(function () {
        var field = $('#table-copy-field');
        exportTable(game, field);
        field.select();
        $('#table-copy-modal').dialog('open');
    });
    buttonDiv.append(nextRoundButton, addPlayerButton, shareButton, copyButton);

    main.append(tableDiv, buttonDiv);
}

function nextRound() {
    var winner = $('input[name=winner]:checked').data('player');
    var potg = $('input[name=potg]:checked').data('player');

    if (typeof winner !== 'string' || winner.length === 0 || typeof  potg !== 'string' || potg.length === 0) {
        console.log('Error: Cannot progress to next round with winner "' + winner + '" and PotG "' + potg + '"');
        return false;
    }

    game.players.forEach(function (player) {
        var heroIndex = game.game[player];
        if (heroIndex <= LAST_HERO) {
            var isWinner = player === winner;
            var isPotG = player === potg;
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
    var data = {};
    if (json) {
        var players = json.players;
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

        var game = {};
        var gameJSON = json.game;
        if (!gameJSON || !(typeof gameJSON === 'object')) {
            console.log('Error: "game": "' + game + '" invalid');
            gameJSON = {};
        }
        players.forEach(function (player) {
            var heroIndex = gameJSON[player];
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
        var games = {games: [{date: new Date(), game: sanitizeData(game)}]};
        var gamesJSON = Cookies.getJSON('games');
        if (gamesJSON && Array.isArray(gamesJSON.games)) {
            gamesJSON.games.forEach(function (game_) {
                if (game_.date && game_.game) {
                    var date = new Date(game_.date);
                    var game__ = sanitizeData(game_.game);
                    if (game__.players.length > 0) {
                        games.games.push({date: date, game: game__});
                    }
                }
            })
        }
        Cookies.set('games', games, {expires: new Date(Number.MAX_VALUE)});
    }
}

function load() {
    var games = Cookies.getJSON('games');
    var list = [];
    if (games && Array.isArray(games.games)) {
        games.games.forEach(function (game_) {
            if (game_.date && game_.game) {
                var date = new Date(game_.date);
                var game__ = sanitizeData(game_.game);
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
    var savedGame = exportGame();
    var url = new URL(window.location.href);
    if (savedGame && typeof savedGame === 'string' && savedGame.length > 0) {
        url.searchParams.set('load', savedGame);
    }
    return url.toString();
}

function getTooltip(game) {
    var s = '';
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
    var text = '';
    var rows = 1;
    var cols = 1;
    game.players.forEach(function (player) {
        var line = player + ': ' + HEROES[game.game[player]];
        var length = line.length;
        if (length > cols) {
            cols = line;
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
