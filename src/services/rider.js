const RiderLocation = require('../models/panda-rider-localizacion');
const Rider = require('../models/panda-rider');

const UPDATE_MSG = {
    LOCATION: 'LOCATION',
    STATE: 'STATE'
}

module.exports = {
    getCollection: () => {

        let query = {
            isOnline: true,
            ciudad: 'santiago',
            isActive: true,
            pagoPendiente: false,
            actividad: DISPONIBLE
        }

        return Rider.find(query);
    },

    getOne: (id) => {
        return Rider.findOne({ rider: id });
    },

    update: (msg, id, body) => {
        switch (msg) {
            case msgs.rider.update.LOCATION:
                return RiderLocation.findByIdAndUpdate(id, body)
            case msgs.rider.update.STATE:
                return RiderState.findByIdAndUpdate(id, body)
        }
    }
}

