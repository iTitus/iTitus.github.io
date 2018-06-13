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
        title: "Paste the saved game as JSON",
        buttons: {
            "Load": function () {
                loadGameFromString($('#json-input-field').val());
            }
        }
    });

    initHome();

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

    var newGame = $('<button>');
    newGame.text('New Game');
    newGame.click(function () {
        loadNewGame()
    });

    var loadPrevious = $('<button>');
    loadPrevious.text('Load Previous');
    loadPrevious.click(function () {
        loadPreviousGame()
    });

    var loadJSON = $('<button>');
    loadJSON.text('Load from JSON');
    loadJSON.click(function () {
        $("#json-input-modal").dialog('open');
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
    var main = $('#main');
    main.empty();

    var tableDiv = $('<div>').addClass('table');

    main.append(tableDiv);
}

function sanitizeData(json) {
    var data = {};
    if (json) {
        var players = json['players'];
        if (!players || !Array.isArray(players)) {
            console.log('Error: "players" invalid');
            players = [];
        }
        players = players.filter(function (player) {
            return typeof player === 'string' && player.length > 0;
        });
        if (players.length > MAX_PLAYERS) {
            console.log('Error: Too many players');
            players = [];
        }
        data['players'] = players;

        var game = {};
        var gameJSON = json['game'];
        if (!gameJSON || !(typeof gameJSON === 'object')) {
            console.log('Error: "game" invalid');
            gameJSON = {};
        }
        players.forEach(function (player) {
            var heroIndex = gameJSON[player];
            if (!(typeof heroIndex === 'number') || (heroIndex % 1) !== 0 || heroIndex < 0 || heroIndex >= HEROES.length) {
                console.log('Error: "heroIndex" for player "' + player + '" invalid');
                game[player] = 0;
            } else {
                game[player] = heroIndex;
            }
        });
        data['game'] = game;
    } else {
        console.log('Error: JSON object invalid');
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