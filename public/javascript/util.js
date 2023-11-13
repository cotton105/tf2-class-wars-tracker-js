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

/**
 * Set a value to a cookie.
 * @param {string} cname Name of the cookie to set.
 * @param {any} cvalue Value to set for the cookie.
 * @param {number} exdays How many days the cookie should persist for. Leave null to expire with session.
 */
function setCookie(cname, cvalue, exdays) {
    const date = new Date();
    date.setTime(date.getTime() + (exdays*24*60*60*1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

/**
 * Gets the value of the specified cookie.
 * @param {string} cname Name of the cookie to read.
 * @returns Value of the specified cookie.
 */
function getCookie(cname) {
    const decodedCookies = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookies.split(';');
    const valRegExp = /=([^;]+)/;
    const targetCookie = cookieArray.find((element) => element.includes(`${cname}=`));
    const result = targetCookie && valRegExp.exec(targetCookie)[1];
    return result;
}

/**
 * Delete a cookie given its name.
 * @param {string} cname Name of the cookie to delete.
 */
function deleteCookie(cname) {
    document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
