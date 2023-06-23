function calculateBias(x, y) {
    if (x != 0 && y == 0) {
        return -1;
    }
    else if (y == 0) {
        return 0;
    }
    else {
        return (1 - x / y) / (1 + x / y);
    }
}

function emptyObject(obj) {
    for (const key of Object.keys(obj)) {
        if (obj[key] == null || typeof obj[key] != 'object') {
            obj[key] = null;
        } else {
            emptyObject(obj[key]);
        }
    }
    return obj;
}
