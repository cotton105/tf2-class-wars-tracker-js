const request = require('supertest');
const server = require('../app.js');

const mercenaryArray = [
    'Scout',
    'Soldier',
    'Pyro',
    'Demoman',
    'Heavy',
    'Engineer',
    'Medic',
    'Sniper',
    'Spy'
];

beforeAll(() => {
    server.start();
});

test('gets mercenaries', async () => {
    const res = await request(server.app)
    .get('/api/getMercenaries');
    expect(res.body).toStrictEqual(mercenaryArray);
});

afterAll(() => {
    server.close();
});
