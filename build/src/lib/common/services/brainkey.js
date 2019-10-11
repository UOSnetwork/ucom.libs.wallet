"use strict";
const dictionary = require('./dictionary');
const BRAINKEY_LENGTH = 12;
class Brainkey {
    // #task - this is non-production brainkey generator
    static generateSimple() {
        const words = dictionary.en.split(',');
        const wordsLength = words.length;
        const res = [];
        for (let i = 0; i < BRAINKEY_LENGTH; i += 1) {
            const index = Math.floor(Math.random() * wordsLength);
            res.push(words[index]);
        }
        return res.join(' ');
    }
}
module.exports = Brainkey;
