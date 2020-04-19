const definitions = [
    [' year', ' y'],
    [' day', ' d'],
    [' hour', ' h'],
    [' minute', ' m'],
    [' second', ' s'],
];

export const humanReadableSeconds = function (seconds, short) {
    if (!seconds) {
        return '';
    }
    const numyears = Math.floor(seconds / 31536000);
    const numdays = Math.floor((seconds % 31536000) / 86400);
    const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    const numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    const text = [];

    numyears > 0 ? text.push(numyears + definitions[0][short ? 1 : 0] + (numyears > 1 && !short ? 's' : '')) : undefined;
    numdays > 0 ? text.push(numdays + definitions[1][short ? 1 : 0] + (numdays > 1 && !short ? 's' : '')) : undefined;
    numhours > 0 ? text.push(numhours + definitions[2][short ? 1 : 0] + (numhours > 1 && !short ? 's' : '')) : undefined;
    numminutes > 0 ? text.push(numminutes + definitions[3][short ? 1 : 0] + (numminutes > 1 && !short ? 's' : '')) : undefined;
    numseconds > 0 ? text.push(numseconds + definitions[4][short ? 1 : 0] + (numseconds > 1 && !short ? 's' : '')) : undefined;
    if (!text.length) {
        return '';
    }
    return text.join(' ');
};