class ClientError extends Error {
    constructor(message, ip, status) {
        super(message);
        this.ip = ip;
        this.status = status;
    }
}

module.exports = ClientError;
