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
