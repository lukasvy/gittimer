const fs = require('fs');
const path = require('path');
const Engine = require('tingodb')();
const appPath = require('electron').remote.app.getAppPath();
const dbDirName = 'db';
const dbPath = path.join(appPath, dbDirName);
const CryptoJS = require("crypto-js");
import Base64 from 'crypto-js/enc-base64';

if (!fs.existsSync(dbPath))
{
    fs.mkdirSync(dbPath);
}

const db = new Engine.Db(dbPath, {});

/**
 * @param obj
 * @param funcName
 * @returns {*}
 */
function wrapToPromise(obj, funcName) {
    if (obj[funcName])
    {
        const oldInsert = obj[funcName];
        obj[funcName] = function (o) {
            return new Promise((resolve, reject) => {
                const resolveFunc = (err, data) => {
                    if (err)
                    {
                        return reject(err);
                    }
                    return resolve(data);
                };
                oldInsert.apply(obj, [o,resolveFunc]);
            })
        }
    }
    return obj;
}

export const createCollection = function (name) {
    const encodedName = CryptoJS.MD5(name).toString();
    const collectionPath = path.join(appPath, dbDirName, encodedName);
    if (!fs.existsSync(collectionPath))
    {
        fs.closeSync(fs.openSync(collectionPath, 'w'));
    }
    const collection = db.collection(encodedName);
    wrapToPromise(collection, 'insert');
    return collection;
};