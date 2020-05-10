const fs = require('fs');
const path = require('path');
// https://github.com/sergeyksv/tingodb
const Engine = require('tingodb')();
const appPath = require('electron').remote.app.getAppPath();
const dbDirName = 'db' + (process.env.NODE_ENV.match(/test/) ? '-test' : '');
const dbPath = path.join(appPath, dbDirName);
const CryptoJS = require("crypto-js");
const _ = require('underscore');

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
                try
                {
                    if (args.length && _.isFunction(args[args.length - 1]))
                    {
                        const argsArr = [...args];
                        const func = argsArr.pop();
                        const newArgs = [...argsArr, (err, d) => {
                            func(err, d);
                            resolveFunc(err, d)
                        }];
                        oldInsert.apply(obj, newArgs);
                    } else
                    {
                        oldInsert.apply(obj, [...args, resolveFunc]);
                    }
                } catch (e)
                {
                    console.log(e);
                }
            })
        }
    }
    return obj;
}

/**
 * @param res
 * @param rej
 * @returns {function(...[*]=)}
 */
export const promiseData = function (res, rej) {
    return function (err, p) {
        if (err)
        {
            console.error(err);
            return rej(err)
        }
        return res(p);
    }
};

/**
 * @param name
 * @returns {Promise<tcoll>}
 */
export const createCollection = async function (name) {
    return new Promise((res, rej) => {
        const encodedName = CryptoJS.MD5(name).toString();
        const collectionPath = path.join(appPath, dbDirName, encodedName);
        if (!fs.existsSync(collectionPath))
        {
            fs.closeSync(fs.openSync(collectionPath, 'w'));
        }
        db.collection(encodedName, (err, collection) => {
            if (err)
            {
                return rej(err);
            }
            wrapToPromise(collection, 'insert');
            wrapToPromise(collection, 'findOne');
            wrapToPromise(collection, 'remove');
            wrapToPromise(collection, 'update');
            wrapToPromise(collection, 'createIndex');
            wrapToPromise(collection, 'findAndModify');
            wrapToPromise(collection, 'findAndRemove');
            res(collection);
        });
    })
};