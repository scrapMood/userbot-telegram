const { duaGram, terminal, lessLog } = require("duagram");
const { performance } = require('perf_hooks');
const covid = require("covid19-scrape")
const bmkg = require("bmkg-scrape")
const os = require("os")
const bot = new duaGram({
    api_id: Number(process.env.app_id),
    api_hash: String(process.env.app_hash),

    logLevel: 1, // 0 false, 1 event, 2 detail
    logDetail: "none", // none, error, warn, info, debug

    // Fill in the session here if you have one, or leave it blank
    session: String(process.env.session),
    
    // The most common error is the FloodWait error which is caused by calling a method multiple times in a short period and acts as a spam filter from telegram. So:
    floodSleepThreshold: 60,

    // Mark message history as read
    markRead: true
});

// event all new message
bot.on('message', async function (update) {
    // simple log
    lessLog(update);
    try {
        
        if (new RegExp("^\/start$", "i").exec(update.message)) {
            return await bot.sendMessage(update, 'hay how are you');
        }
        
        if (new RegExp("^\/ping$", "i").exec(update.message)) {
            //--! Hasil nyolong script @butthx !--\\
            var time = (Date.now() / 1000) - update.date
            return await bot.sendMessage(update, `Pong ${time.toFixed(3)}`);
        }
        
        if (new RegExp("^\/exec ", "i").exec(update.message)) {
            var data = (await eval(update.message.replace(/(\/exec )/ig,"")))
            return await bot.sendMessage(update, JSON.stringify(data,null,2), { parse_mode: 'html' });
        }
        
        if (new RegExp("^\/covid ", "i").exec(update.message)) {
            var data = await (await covid.covid(update.message.replace(/(\/covid )/ig,""))).message
            return await bot.sendMessage(update, data, { parse_mode: 'html' });
        }
        
        if (new RegExp("^\/info", "i").exec(update.message)) {
            var data = systeminfo().message
            return await bot.sendMessage(update, data, { parse_mode: 'html' });
        }

        if (new RegExp("^\/gempa", "i").exec(update.message)) {
            var data = (await bmkg.autogempa()).message
            if (data.Infogempa && data.Infogempa.gempa) {
                var hasil = data.Infogempa.gempa
                var teks = `Hasil gempa ${hasil.Tanggal}`
                teks += `\nJam ${hasil.Jam}`
                teks += `\nWilayah ${hasil.Wilayah}`
                teks += `\nPotensi ${hasil.Potensi}`
            }   else    {
                var teks = "gagal mungkin sedang dalam perbaikan"
            }
            return await bot.sendMessage(update, teks, { parse_mode: 'html' });
        }

    } catch (e) {
        console.log(e)
    }

});

function systeminfo() {
    /*
    lib @azkadev

    */
    function file_Size(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        for (var i = 0; i < sizes.length; i++) {
            if (bytes <= 1024) {
                return bytes + ' ' + sizes[i];
            } else {
                bytes = parseFloat(bytes / 1024).toFixed(2)
            }
        }
        return bytes + ' P';
    }

    function formatsc(seconds) {
        function pad(s) {
            return (s < 10 ? '0' : '') + s;
        }
        var hours = Math.floor(seconds / (60 * 60));
        var minutes = Math.floor(seconds % (60 * 60) / 60);
        var seconds = Math.floor(seconds % 60);
        var msg = ``
        if (pad(hours) == 00) {
    
        } else {
            msg += pad(hours) + " Hours "
        }
    
        if (pad(minutes) == 00) {
    
        } else {
            msg += pad(hours) + " Minutes "
        }
        msg += pad(seconds) + " Seconds"
    
        return msg
    }

    var free = file_Size(os.freemem())
    var ram = file_Size(os.totalmem())
    var data = os.cpus()
    var json = {}

    json.os = `${os.type()} ${os.hostname()}`
    json.ram = `${ram} / ${free}`
    json.uptimeos = formatsc(os.uptime())
    json.uptimescript = formatsc(process.uptime())

    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var element = data[i];
            json.cpu = element.model
        }
    }
    var caption = "\n╭" + "─".repeat(10) + `「 ℹ️ Info Bot ℹ️ 」`.padStart(15)
    caption += "\n│"
    caption += "\n├ •" + "OS".padStart(3) + ":".padStart(24) + `${os.type()}`.padStart(5)
    caption += "\n├ •" + `CPU`.padStart(4) + `:`.padStart(21) + json.cpu.padStart(10)
    caption += "\n├ •" + `RAM`.padStart(4) + `:`.padStart(20) + `${ram} / ${free} Free`.padStart(9)
    caption += "\n├ •" + `Uptime-OS`.padStart(10) + `:`.padStart(8) + formatsc(os.uptime()).padStart(23)
    caption += "\n├ •" + `Uptime-Script`.padStart(14) + `:`.padStart(2) + formatsc(process.uptime()).padStart(10)
    caption += "\n│"
    caption += "\n╰" + "─".repeat(3) + `「 azkadev 」`.padStart(8)
    json.message = caption
    return json
}


bot.start();
