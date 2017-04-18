const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
var fs = require('fs');

const selectDirBtn = $('#start');
const img = $('#img');
const x1 = $('#x1');
const x2 = $('#x2');
const x3 = $('#x3');
const x4 = $('#x4');
const y1 = $('#y1');
const y2 = $('#y2');
const y3 = $('#y3');
const y4 = $('#y4');
const dot1 = $('#dot1');
const dot2 = $('#dot2');
const dot3 = $('#dot3');
const dot4 = $('#dot4');
const paint = $('#paint').get(0);
const skip = $('#skip');

selectDirBtn.on('click', function () {
    ipc.send('open-file-dialog')
});

let dir = '~';
let imgs = [];
let imgIndex = 0;
let output = {};

ipc.on('selected-directory', function (event, path) {
    dir = path[0];

    fs.readdir(path[0], function (err, files) {
        imgs = [];
        imgIndex = 0;
        let outPut = {};

        files.forEach(function (file) {
            if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
                imgs.push(file);
            }
        });

        go();
    });
});

function save() {
    output[imgs[imgIndex]] = {
        x1: Number(x1.val()),
        y1: Number(y1.val()),
        x2: Number(x2.val()),
        y2: Number(y2.val()),
        x3: Number(x3.val()),
        y3: Number(y3.val()),
        x4: Number(x4.val()),
        y4: Number(y4.val())
    };


    fs.writeFile(dir + '/' + 'output.json', JSON.stringify(output), {}, function () {
        // Done
    });
}

function getClickPosition(e) {
    return {
        x: e.originalEvent.offsetX,
        y: e.originalEvent.offsetY
    };
}

function clearState() {
    x1.val('');
    x2.val('');
    x3.val('');
    x4.val('');
    y1.val('');
    y2.val('');
    y3.val('');
    y4.val('');
    dot1.css({'left': '-1000px', 'top': '-1000px'});
    dot2.css({'left': '-1000px', 'top': '-1000px'});
    dot3.css({'left': '-1000px', 'top': '-1000px'});
    dot4.css({'left': '-1000px', 'top': '-1000px'});
    paint.getContext('2d').clearRect(0, 0, paint.width, paint.height);
}

function go() {
    clearState();

    img.attr('src', 'file://' + dir + '/' + imgs[++imgIndex]).show();

    img.unbind('load').bind('load', function () {
        paint.width = img.outerWidth();
        paint.height = img.outerHeight();
    });
}

function getPosHandler(dot, loc) {
    return function () {
        let pos = $(this).val();
        let ctx = paint.getContext('2d');

        if (loc === 'x') {
            dot.css({'left': (pos || '-1000') + 'px'})
        }

        if (loc === 'y') {
            dot.css({'top': (pos || '-1000') + 'px'})
        }

        paint.getContext('2d').clearRect(0, 0, paint.width, paint.height);
        ctx.beginPath();

        if (x1.val() !== '' && y1 !== '' && x2.val() !== '' && y2.val() !== '') {
            ctx.moveTo(Number(x1.val()), Number(y1.val()));
            ctx.lineTo(Number(x2.val()), Number(y2.val()));
        }

        if (x2.val() !== '' && y2 !== '' && x3.val() !== '' && y3.val() !== '') {
            ctx.moveTo(Number(x2.val()), Number(y2.val()));
            ctx.lineTo(Number(x3.val()), Number(y3.val()));
        }

        if (x3.val() !== '' && y3 !== '' && x4.val() !== '' && y4.val() !== '') {
            ctx.moveTo(Number(x3.val()), Number(y3.val()));
            ctx.lineTo(Number(x4.val()), Number(y4.val()));
        }

        if (x4.val() !== '' && y4 !== '' && x1.val() !== '' && y1.val() !== '') {
            ctx.moveTo(Number(x4.val()), Number(y4.val()));
            ctx.lineTo(Number(x1.val()), Number(y1.val()));
        }

        ctx.stroke();
    }
}

function next() {
    if (imgs.length - 1 !== imgIndex) {
        save();
        go();
    } else {
        dir = '~';
        imgs = [];
        imgIndex = 0;
        clearState();
        img.hide();
    }
}

x1.on('input', getPosHandler(dot1, 'x'));
x2.on('input', getPosHandler(dot2, 'x'));
x3.on('input', getPosHandler(dot3, 'x'));
x4.on('input', getPosHandler(dot4, 'x'));

y1.on('input', getPosHandler(dot1, 'y'));
y2.on('input', getPosHandler(dot2, 'y'));
y3.on('input', getPosHandler(dot3, 'y'));
y4.on('input', getPosHandler(dot4, 'y'));

img.add('.dot').mousedown(function (e) {
    if (event.which === 3) {
        if (x4.val() !== '' || y4.val() !== '') {
            x4.val('').trigger('input');
            y4.val('').trigger('input');

            return;
        }

        if (x3.val() !== '' || y3.val() !== '') {
            x3.val('').trigger('input');
            y3.val('').trigger('input');

            return;
        }

        if (x2.val() !== '' || y2.val() !== '') {
            x2.val('').trigger('input');
            y2.val('').trigger('input');

            return;
        }

        if (x1.val() !== '' || y1.val() !== '') {
            x1.val('').trigger('input');
            y1.val('').trigger('input');
        }

        return;
    }

    if ($(this).is('.dot')) {
        return;
    }

    let pos = getClickPosition(e);

    if (x1.val() === '' || y1.val() === '') {
        x1.val(pos.x).trigger('input');
        y1.val(pos.y).trigger('input');

        return;
    }

    if (x2.val() === '' || y2.val() === '') {
        x2.val(pos.x).trigger('input');
        y2.val(pos.y).trigger('input');

        return;
    }

    if (x3.val() === '' || y3.val() === '') {
        x3.val(pos.x).trigger('input');
        y3.val(pos.y).trigger('input');

        return;
    }

    if (x4.val() === '' || y4.val() === '') {
        x4.val(pos.x).trigger('input');
        y4.val(pos.y).trigger('input');

        return;
    }

    next();
});

skip.on('click', next);
