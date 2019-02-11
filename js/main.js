Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

var SHOW_DEC_DELAY = 3000; // 延时3秒显示10进制电话
var HOLD_COLOR_DELAY = 50; // 50次后保持电话颜色，不在淡化
var DISPLAY_DEC_ROW = 20; // 显示10进制电话的行
var DISPLAY_BIN_ROW = 40; // 显示2进制电话的行
var PHONE_DEC_LENGTH = 11; // 手机号，固定11位
var PHONE_DEC_PADDER = 2;
var COLOR = '#0F0';
var PHONE_COLOR = '#F00';
var PADDER = 20; // 左右填充列
var MONKEY_TOP = 8; //TODO 8
var isStop = false;
var isShowDec = false;
var texts = '01'.split('');
var holdColorDelay = 0;
var luckPhone;
var luckPhones = [];
var isDrawDec = false;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var columns = 4 * PHONE_DEC_LENGTH + 2 * PADDER;
var fontSize = canvas.width / columns;
// 用于计算输出文字时坐标，所以长度即为列数
var drops = [];
//初始值
for (var x = 0; x < columns; x++) {
    drops[x] = 1;
}

// 渐隐
function fade() {
    //让背景逐渐由透明到不透明
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    if (isStop) {
        var offsetLeft = Math.floor((columns - (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2) * 2) / 2);
        var offsetTop = DISPLAY_DEC_ROW - 3;
        if (holdColorDelay-- > 0) {
            ctx.fillRect( // 手机号区域
                fontSize * (offsetLeft + 1),
                fontSize * offsetTop,
                fontSize * 2 * (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2),
                fontSize * 4
            );


        }

        ctx.fillRect( // 上
            0,
            0,
            canvas.width,
            fontSize * offsetTop
        );

        ctx.fillRect( // 下
            0,
            fontSize * (DISPLAY_DEC_ROW + 1),
            canvas.width,
            canvas.height
        );

        ctx.fillRect( // 左
            0,
            fontSize * offsetTop,
            fontSize * (offsetLeft + 1),
            fontSize * 4
        );

        ctx.fillRect( // 右
            fontSize * (offsetLeft + 1 + (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2) * 2),
            fontSize * offsetTop,
            canvas.width,
            fontSize * 4
        );

    } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// 绘图
function draw() {
    fade();
    //文字颜色
    ctx.fillStyle = COLOR;
    ctx.font = fontSize + 'px arial';
    //逐行输出文字
    for (var i = 0; i < drops.length; i++) {
        var text = texts[Math.floor(Math.random() * texts.length)];
        if (isStop) {
            text = showLuckyPhone(i, text);
        } else {
            text = showMonkey(i, text);
        }

        ctx.font = (isDrawDec ? 2 : 1) * fontSize + 'px arial';

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height || (Math.random() > 0.9 && drops[i] > canvas.height * 3 / 4 / fontSize)) {
            drops[i] = 0;
        }
        drops[i]++;
    }

}

// 显示中奖手机号
function showLuckyPhone(i, text) {
    if (drops[i] === DISPLAY_BIN_ROW - 1 || drops[i] === DISPLAY_BIN_ROW + 1) {
        text = '';
    }
    if (drops[i] === DISPLAY_BIN_ROW) {
        text = luckPhone.bin[i];
    }

    if (isShowDec) {
        var offset = Math.floor((columns - (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2) * 2) / 2);
        if (drops[i] === DISPLAY_DEC_ROW - 2 || drops[i] === DISPLAY_DEC_ROW - 1 || drops[i] === DISPLAY_DEC_ROW + 1) {
            if (i > offset && i <= offset + (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2) * 2) {
                text = '';
            }
        }
        if (drops[i] === DISPLAY_DEC_ROW) {
            if (i > offset && i <= offset + (PHONE_DEC_LENGTH + PHONE_DEC_PADDER * 2) * 2) {
                text = '';
                if (1 === (i - offset) % 2) {
                    isDrawDec = true;
                    text = luckPhone.dec[Math.floor((i - offset) / 2)];
                    ctx.fillStyle = PHONE_COLOR;
                }
            }
        } else {
            isDrawDec = false;
            ctx.fillStyle = COLOR;
        }
    }
    return text;
}

// 显示猴子
function showMonkey(i, text) {
    var monkeyCol = MONKEY[0].length;
    var monkeyRow = MONKEY.length;
    if (drops[i] >= MONKEY_TOP && drops[i] < MONKEY_TOP + monkeyRow) {
        var offset = Math.floor((columns - monkeyCol) / 2);
        if (i > offset && i <= offset + monkeyCol) {
            text = MONKEY[drops[i] - MONKEY_TOP][i - offset - 1];
        }
    }
    return text;
}

// 10进制->2进制
function dec2Bin(decNumber) {
    decNumber = parseInt(decNumber);
    var decStack = [];
    var rem;
    var decString = '';

    while (decNumber > 0) {
        rem = decNumber % 2;
        decStack.push(rem);
        decNumber = Math.floor(decNumber / 2);
    }

    while (decStack.length != 0) {
        decString += decStack.pop().toString();
    }
    while (decString.length < 4) {
        decString = '0' + decString;
    }
    return decString;
}

// 手机号10进制->2机制
function decPhone2Bin(phone) {
    var pArr = phone.toString().split('');
    var binString = '';
    while (pArr.length > 0) {
        binString = dec2Bin(pArr.pop()) + binString;
    }
    return binString;

}

// 手机号填充空白
function fixPhoneNumber(phone, type) {
    var fixer = '';
    var padder = 'dec' === type ? PHONE_DEC_PADDER : PADDER;
    while (padder--) {
        fixer += ' ';
    }
    return fixer + phone + fixer;
}

// 手机号码*保护
function protectPhone(phone) {
    phone.dec = phone.dec.slice(0, PHONE_DEC_PADDER + 3) + '****' + phone.dec.slice(PHONE_DEC_PADDER + 7);
    return phone;
}

// 开始抽奖
function start() {
    isStop = false;
    isShowDec = false;
}

// 结束抽奖
function stop() {
    luckPhone = randomPhone();
    luckPhoneDec = parseInt(luckPhone.dec);
    luckPhones.push(luckPhoneDec);
    localStorage.setItem('luckPhones', JSON.stringify(luckPhones));
    phoneNumbers.remove(luckPhoneDec); //移除已中奖手机号
    console.log(phoneNumbers);
    luckPhone = protectPhone(luckPhone);
    isStop = true;
    setTimeout(function () {
        holdColorDelay = HOLD_COLOR_DELAY;
        isShowDec = true;
    }, SHOW_DEC_DELAY);
}

// 回车
document.onkeydown = function (e) {
    if (e.keyCode == 13) {
        isStop ? start() : stop();
    }
};

// 随机获取手机号
function randomPhone() {
    var phone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
    return {
        dec: fixPhoneNumber(phone.toString(), 'dec'),
        bin: fixPhoneNumber(decPhone2Bin(phone), 'bin')
    };
}

localStorage.clear();
start();
setInterval(draw, 70);