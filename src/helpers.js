export function castBool(value) {
    return ['1', 'true', 'on'].indexOf(String(value).toLowerCase()) > -1;
}

export function printError(text) {
    console.error('\x1b[41m\n\n /!\\ %s\n\x1b[0m', text);
}
