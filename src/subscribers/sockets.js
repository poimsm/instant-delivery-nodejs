 HZ1T
 import events from './events'

const { io } = require('../app')

const EventEmitter = require('events').EventEmitter
const event = new EventEmitter

const Rider = require('../models/panda-rider');
const RiderLocalizacion = require('../models/panda-rider-localizacion');
const Cliente = require('../models/panda-cliente');


io.on('connection', (socket) => {
    event.on('riders', msg => handler(msg, socket, Rider));
    event.on('riders_localizacion', msg => handler(msg, socket, RiderLocalizacion));
    event.on('clientes', msg => handler(msg, socket, Cliente));
});

let handler = (msg, socket, db) => {
     
    if (msg.action == 'UPDATE') {
        updateDB(msg, socket, db);
    }

    if (msg.action == 'GET') {
        getDB(msg, socket, db);
    }
}

let updateDB = async (msg, socket, db) => {

    const id = msg.usuarioId;
    const body = msg.body;

    const data = await db.findOneAndUpdate({ usuario: id }, body);
    socket.emit(msg.channel, data);
}

let getDB = async (msg, socket, db) => {

    const id = msg.usuarioId;
    const data = await db.findOne({ usuario: id });
    socket.emit(msg.channel, data);
}



