const NAME = 'Name';
const HERO = 'Hero';
const WINNER = 'Winner';
const POTG = 'PotG';

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
    'Zenyatta'
];

var game;

$(function () {

    var url = new URL(window.location.href);

    $('#json-input-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Paste the saved game as JSON',
        buttons: {
            'Load': function () {
                loadGameFromString($('#json-input-field').val());
            }
        }
    });
    $('#url-export-modal').dialog({
        modal: true,
        autoOpen: false,
        title: 'Copy the exported game link',
        buttons: {
            'Copy': function () {
                console.log('copy');
            }
        }
    });

    initHome();

    //DEBUG:
    url.searchParams.set('load', '{"players":["player1","player2","player3","player4"],"game":{"player1":0,"player2":1,"player3":0,"player4":4}}');
    //

    if (url.searchParams.has('load')) {
        var toLoad = url.searchParams.get('load');
        if (toLoad === 'new') {
            loadNewGame();
        } else if (toLoad === 'prev') {
            loadPreviousGame()
        } else {
            loadGameFromString(toLoad);
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
        loadPreviousGame()
    });

    var loadJSON = $('<button>').text('Load from JSON').click(function () {
        $('#json-input-modal').dialog('open');
    });

    main.append(newGame, loadPrevious, loadJSON);
}


function loadNewGame() {
    loadGameFromJSON();
}

function loadPreviousGame() {
    loadGameFromJSON(Cookies.getJSON('game'));
}

function loadGameFromString(s) {
    var json;
    try {
        json = JSON.parse(s);
    } catch (e) {
    }
    loadGameFromJSON(json);
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
            var radioWinner = $('<input>').attr('type', 'radio').attr('id', 'winner_' + player).attr('name', 'winner').data('player', player);
            dataWinner.append(radioWinner);

            var dataPotG = $('<td>');
            var radioPotG = $('<input>').attr('type', 'radio').attr('id', 'potg_' + player).attr('name', 'potg').data('player', player);
            dataPotG.append(radioPotG);
            row.append(dataName, dataHero, dataWinner, dataPotG);
            table.append(row);
        });
    }
    tableDiv.append(table);

    var buttonDiv = $('<div>').addClass('button-container');
    var nextRoundButton = $('<button>').text('Next round').click(function () {
        nextRound();
    });
    var shareButton = $('<button>').text('Share game').click(function () {
        console.log(exportURL());
        $('#url-export-modal').dialog('open');
    });
    buttonDiv.append(nextRoundButton, shareButton);

    main.append(tableDiv, buttonDiv);
}

function nextRound() {
    var winner = $('input[name=winner]:checked').data('player');
    var potg = $('input[name=potg]:checked').data('player');

    game.players.forEach(function (player) {
        game.game[player] += 1 + (player === winner ? 1 : 0) + (player === potg ? 1 : 0);
    });

    save();
    displayGame();
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
        data['players'] = [];
        data['game'] = {};
    }
    return data;
}

function save() {
    if (game) {
        Cookies.set('game', game);
    }
}

function exportGame() {
    if (game) {
        return JSON.stringify(game);
    }
    return '';
}

function exportURL() {
    var savedGame = exportGame();
    var url = 'http://ititus.github.io/ow-champions/champions.html';
    if (savedGame && typeof savedGame === 'string' && savedGame.length > 0) {
        url += '?load=' + savedGame;
    }
    return url;
}