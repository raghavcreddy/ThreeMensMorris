function connect(div1, div2, color, thickness, from, to) {
    var off1 = getOffset(div1),
        off2 = getOffset(div2),

        // center of first div
        x1 = off1.left + off1.width / 2,
        y1 = off1.top + off1.height / 2,

        // center of second div
        x2 = off2.left + off2.width / 2,
        y2 = off2.top + off2.height / 2,

        // distance
        length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1))),

        // center
        cx = ((x1 + x2) / 2) - (length / 2),
        cy = ((y1 + y2) / 2) - (thickness / 2),

        // angle
        angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI),

        // make hr
        htmlLine = "<div class='connector' id='" + from + "" + to + "' style='z-index:-9999;padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";

    //append html to body
    document.body.innerHTML += htmlLine;
}

function getOffset(el) {
    var _x = 0,
        _y = 0,
        _w = el.offsetWidth | 0,
        _h = el.offsetHeight | 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        top: _y + $(window).scrollTop(),
        left: _x + $(window).scrollLeft(),
        width: _w,
        height: _h
    };
}

var join = "1-2 2-3 1-4 4-7 3-6 6-9 7-8 8-9 1-5 2-5 3-5 4-5 5-6 5-7 5-8 5-9".split(" ");

$.each(join, function (index, item) {
    connect(document.getElementById('droppable' + item.split('-')[0]), document.getElementById('droppable' + item.split('-')[1]), "#00b2b2", 3, item.split('-')[0], item.split('-')[1]);
});

// convert mouse events to touch events
function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function touch() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}

var lastMessage = '';
var logger = {
    log: function (message) {
        var html = '<br>' + message;
        if (lastMessage != message)
            $('#log').append(html);
        lastMessage = message;

        $('#log').stop().animate({
            scrollTop: $("#log")[0].scrollHeight
        }, "slow");

    }
};

$(document).ready(function () {

    //touch();

    var getValidMoves = function (from) {
        var to = [];
        switch (from) {
        case '0':
            to = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            break;
        case '1':
            to = ['2', '4', '5'];
            break;
        case '2':
            to = ['1', '3', '5'];
            break;
        case '3':
            to = ['2', '5', '6'];
            break;
        case '4':
            to = ['1', '5', '7'];
            break;
        case '5':
            to = ['1', '2', '3', '4', '6', '7', '8', '9'];
            break;
        case '6':
            to = ['3', '5', '9'];
            break;
        case '7':
            to = ['4', '5', '8'];
            break;
        case '8':
            to = ['5', '7', '9'];
            break;
        case '9':
            to = ['5', '6', '8'];
            break;
        };
        return to;
    };

    var sourceElement;
    $(".draggable").draggable({

        scroll: false,
        start: function () {

            // contains coin false
            $('.droppable[data-target-id=' + $(this).attr('data-in-target') + ']').attr('data-contains-coin', 'false');

            //record this coins present container
            sourceElement = $(this).attr('data-in-target');

        },

        drag: function () {},

        stop: function () {
            // contains coin true
            $('.droppable[data-target-id=' + $(this).attr('data-in-target') + ']').attr('data-contains-coin', 'true');
        },

        revert: 'invalid'

    });

    var lastMovedCoin = '';
    $(".droppable").droppable({

        activeClass: "dropTargetActive",
        hoverClass: "dropTargetHover",

        accept: function (elem) {

            //last moved item
            if ($(elem).attr('data-player') == lastMovedCoin)
                return false;

            //valid moves only in grid
            if ($.inArray($(this).attr('data-target-id'), getValidMoves($(elem).attr('data-in-target'))) < 0)
                return false;

            //reject from same location as revert will work as it should
            if ($(this).attr('data-target-id') == sourceElement)
                return false;

            // stop moving any elements till all coins are placed first
            var allPlaced = true;
            if ($('.draggable[data-in-target="0"]').length > 0 && $(elem).attr('data-in-target') != 0) {
                allPlaced = false;
                $('.droppable').removeClass('dropTargetActive');
                logger.log('<i class="fa fa-warning"></i> Please place all coins first!');
            }
            if (!allPlaced) return false;

            //reject a coin if already a coin is in place
            if ($(this).attr('data-contains-coin') == 'true')
                return false;

            return true;

        },

        drop: function (event, ui) {

            //lastMovedCoin
            lastMovedCoin = $(ui.draggable).attr('data-player');
            if ($(ui.draggable).attr('data-player') == 'B')
                logger.log('<i class="fa fa-info-circle"></i>&nbsp;&nbsp; Player A\'s turn now!');
            else
                logger.log('<i class="fa fa-info-circle"></i>&nbsp;&nbsp; Player B\'s turn now!');

            //remove if any droppable is highlighted
            $('.droppable').removeClass('dropTargetActive');

            // contains coin true on drop
            $(this).attr('data-contains-coin', 'true');

            // set target id to coin which it is currently in
            $(ui.draggable).attr('data-in-target', $(this).attr('data-target-id'));

            //snap draggable in droppable
            var offset = $(this).offset();
            offset.left += 15;
            offset.top += 15;
            $(ui.draggable).offset(offset);

            calculateResult();

        }
    });

    var showGameWin;
    var winSituation = "123 456 789 147 258 369 357 159".split(" ");
    var calculateResult = function () {
        var winArr = [];
        $('.A').each(function () {
            winArr.push($(this).attr('data-in-target'));
        });
        if ($.inArray(winArr.sort().join(''), winSituation) > -1) {
            logger.log('<br><br><div class="gameWin" id="gameWin"></div><br>');
            $('#gameWin').html('<i class="fa fa-gamepad"></i> Player \'A\' wins!');
            $.each(winArr, function (index, value) {
                $('.droppable[data-target-id=' + value + ']').addClass('dropTargetWon');
            });
            $('#' + winArr[0] + '' + winArr[1]).css('background-color', '#f00');
            $('#' + winArr[1] + '' + winArr[2]).css('background-color', '#f00');
            showGameWin = setInterval(flashtext, 200, 'gameWin', 'red');
            $('#reset').html('Play again').removeClass('btn-danger').addClass('btn-success');
            return;
        }
        winArr = [];
        $('.B').each(function () {
            winArr.push($(this).attr('data-in-target'));
        });
        if ($.inArray(winArr.sort().join(''), winSituation) > -1) {
            logger.log('<br><div class="gameWin" id="gameWin"></div><br>');
            $('#gameWin').html('<i class="fa fa-gamepad"></i> Player \'B\' wins!');
            $.each(winArr, function (index, value) {
                $('.droppable[data-target-id=' + value + ']').addClass('dropTargetWon');
            });
            $('#' + winArr[0] + '' + winArr[1]).css('background-color', '#f00');
            $('#' + winArr[1] + '' + winArr[2]).css('background-color', '#f00');
            showGameWin = setInterval(flashtext, 200, 'gameWin', 'red');
            $('#reset').html('Play again').removeClass('btn-danger').addClass('btn-success');
        }
    };

    var color = 0;

    function flashtext(ele, col) {
        var colors = ['red', '#00f900', '#41a0dc', 'black', 'yellow', 'white', 'magenta', 'cyan', 'silver'];
        document.getElementById(ele).style.color = colors[color++];
        if (color == 8) color = 0;
    }

    $('#reset').click(function () {
        clearInterval(showGameWin);
        $('.draggable').animate({
            top: '0px',
            left: '0px'
        }, 600);
        $('.droppable').attr('data-contains-coin', 'false');
        $('.draggable').attr('data-in-target', '0');
        lastMovedCoin = '';
        $('.droppable').removeClass('dropTargetWon');
        $('.connector').css('background-color', '#00b2b2');
        $('#log').stop().animate({
            scrollTop: 0
        }, 600);
        setTimeout(function () {
            $('#log').html('<i class="fa fa-info-circle"></i>&nbsp;&nbsp; Any player can start by moving a coin either \'A\' or \'B\'');
            $('#reset').html('Reset Game').removeClass('btn-success').addClass('btn-danger');
        }, 600);

    });

});