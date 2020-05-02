const fs = require('fs');
const path = require('path');
const Engine = require('tingodb')();
const appPath = require('electron').remote.app.getAppPath();
const dbDirName = 'db' + (process.env.NODE_ENV.match(/test/) ? '-test' : '');
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
        obj[funcName] = function () {
            const args = arguments;
            return new Promise((resolve, reject) => {
                const resolveFunc = (err, data) => {
                    if (err)
                    {
                        return reject(err);
                    }
                    return resolve(data);
                };

                oldInsert.apply(obj, [...args, resolveFunc]);
            })
        }
    }
    return obj;
}

export const promiseData = function(res, rej) {
    return function(err, p) {
        if (err) {
            console.error(err);
            return rej(err)
        }
        return res(p);
    }
};

export const createCollection = function (name) {
    const encodedName = CryptoJS.MD5(name).toString();
    const collectionPath = path.join(appPath, dbDirName, encodedName);
    if (!fs.existsSync(collectionPath))
    {
        fs.closeSync(fs.openSync(collectionPath, 'w'));
    }
    const collection = db.collection(encodedName);
    wrapToPromise(collection, 'insert');
    wrapToPromise(collection, 'findOne');
    wrapToPromise(collection, 'remove');
    wrapToPromise(collection, 'update');
    wrapToPromise(collection, 'findAndModify');
    wrapToPromise(collection, 'findAndRemove');
    return collection;
};