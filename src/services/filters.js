let haversineDistance = (coords1, coords2) => {

    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lat1 = coords1[0];
    var lon1 = coords1[1];

    var lat2 = coords2[0];
    var lon2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = d * 1000;

    return d;
}

let sortRiders = (riders, lat, lng) => {
    const distanceMatrix = [];

    riders.forEach(rider => {

        let distance = 0;

        distance = Math.sqrt((rider.lat - lat) * (rider.lat - lat) + (rider.lng - lng) * (rider.lng - lng));

        distanceMatrix.push({
            distance,
            id: rider.rider
        });
    });

    let a = distanceMatrix[0].distance;
    let id = distanceMatrix[0].id;
    let b = 0;

    distanceMatrix.forEach(item => {
        b = item.distance;
        if (b < a) {
            a = b;
            id = item.id;
        }
    });

    return id;
}


module.exports = {

    availableRiders: async (riders, requestedRiders) => {
        const available_riders = []; 

        if (requestedRiders.length == 0) {
            return riders_db;
        }
    
        riders.forEach(rider => {
            let flag = true;
    
            requestedRiders.forEach(id => {
                if (rider.rider == id) {
                    flag = false;
                }
            });
    
            if (flag) {
                available_riders.push(rider);
            }
        });
    
        return available_riders;
    },

    suitableRider: (riders, lat, lng) => {
 
        if (riders.length == 0) {
            return { ok: false };
        }
    
        const riders_mod = { moto: [], bicicleta: [], auto: [] };
    
        let radio_de_busqueda = {
            moto: 10000,
            bicicleta: 2000,
            auto: 10000
        };
    
        riders.forEach(rider => {
    
            const riderCoors = [rider.lat, rider.lng];
            const destinoCoors = [lat, lng];
    
            const distance = haversineDistance(riderCoors, destinoCoors);
    
            if (distance < radio_de_busqueda[rider.vehiculo]) {
                riders_mod[rider.vehiculo].push(rider);
            }
    
        });
    
        if (!(riders_mod.moto.length > 0 || riders_mod.bicicleta.length > 0 || riders_mod.auto.length > 0)) {
            return { ok: false };
        }
    
        let id = sortRiders(riders_mod.moto, lat, lng);
      
        return { ok: true, id };
    },

    clearRequestedList: async (consumer) => {
        rejections.forEach(rejection => {
            if (rejection.consumer == consumer) {
                rejection.riders = []
            }        
        });
    }
}



let addRiderToRequestedList = (id, consumer) => {
    rejections.forEach(rejection => {
        if (rejection.consumer == consumer) {
            rejection.riders.push(id)
        }        
    });
}

let limpiar_riders_rechazados = async () => {

    if (this.riders_rechazados.length == 0) {
        return;
    }

    let promesas = [];

    this.riders_rechazados.forEach(id => {
        promesas.push(
            this.updateRider(id, 'rider', { rechazadoId: '' })
        )
    });

    await Promise.all(promesas);
    this.riders_rechazados = [];
}

let add_riders = (riders, orden) => {
    let res = [];

    orden.forEach(vehiculo => {
        riders[vehiculo].forEach((rider, i) => {
            if (i < 2) {
                res.push(rider);
            }
        });
    });

    return res;
}



