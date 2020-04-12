const EventEmitter = require('events').EventEmitter;
const event = new EventEmitter;

const PandaPedido = require('../models/panda-pedido');

const _solicitud = require('./services/solicitud');


let consumer = (channel, queue, consumer) => {

    channel.consume(queue, async (msg) => {

        let message = JSON.parse(msg.content.toString())

        let order = await getOrder(message.order);

        if (order.discard)
            return channel.ack(msg);

        let search = await _search.searchRider(message, consumer);

        if (search.ok)
            return channel.ack(msg);


        await error_handler(search.riderId, channel)
        channel.ack(msg)


    }, { noAck: false });
}


let obtener_pedido = (id) => {
    return PandaPedido.findOne({ pedido: id });
}


let enviar_solicitud_a_riders = (msg, consumer) => {

    let query = {
        ciudad: 'santiago',
        vehiculo: 'moto',
        lat: msg.origen.lat,
        lng: msg.origen.lng
    };

    return _solicitud.searchRider(query, consumer);
}


let error_solicitud_handler = (request, channel) => {

    event.on(``, userJoined);


    setTimeout(() => {


    }, 1000 * 45);

}

let requestHandler = () => {

}


module.exports = { consumer }