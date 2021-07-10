const { duaGram, terminal, lessLog } = require("duagram");
const { performance } = require('perf_hooks');
const covid = require("covid19-scrape")
const bmkg = require("bmkg-scrape")
const bot = new duaGram({
    api_id: process.env.app_id,
    api_hash: process.env.app_hash,

    logLevel: 1, // 0 false, 1 event, 2 detail
    logDetail: "none", // none, error, warn, info, debug

    // Fill in the session here if you have one, or leave it blank
    session: process.env.session,
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
        if (new RegExp("^\/covid ", "i").exec(update.message)) {
            var data = await (await covid.covid(update.message.replace(/(\/covid )/ig,""))).message
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


bot.start();
