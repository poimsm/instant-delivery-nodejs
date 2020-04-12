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



module.exports = {

    calcular_cobertura: async (req, res, next) => {
        const radio_santiago = 70000;
        const radio_la_serena_coquimbo = 15000;
        const radio_valdivia = 15000;
    
        const santiago = [-33.444012, -70.653651];
        const la_serena_coquimbo = [-29.948767, -71.292337];
        const valdivia = [-39.819996, -73.239510];
    
        const delta_santiago = haversineDistance(coors, santiago);
        const delta_la_serena_coquimbo = haversineDistance(coors, la_serena_coquimbo);
        const delta_valdivia = haversineDistance(coors, valdivia);
    
        let flag_santiago = false;
        let flag_la_serena_coquimbo = false;
        let flag_valdivia = false;
    
        if (delta_santiago < radio_santiago) {
            flag_santiago = true;
        }
    
        if (delta_la_serena_coquimbo < radio_la_serena_coquimbo) {
            flag_la_serena_coquimbo = true;
        }
    
        if (delta_valdivia < radio_valdivia) {
            flag_valdivia = true;
        }
    
        if (flag_santiago || flag_la_serena_coquimbo || flag_valdivia) {
            return { ok: true }
        } else {
            return { ok: false };
        }
    },

    calcular_ciudad: async (req, res, next) => {
        const santiago = [-33.444012, -70.653651];
        const la_serena_coquimbo = [-29.948767, -71.292337];
        const valdivia = [-39.819996, -73.239510];
    
        const delta_santiago = haversineDistance(coors, santiago);
        const delta_la_serena_coquimbo = haversineDistance(coors, la_serena_coquimbo);
        const delta_valdivia = haversineDistance(coors, valdivia);
    
        const ciudades = [
            {
                value: 'santiago',
                delta: delta_santiago
            },
            {
                value: 'la_serena_coquimbo',
                delta: delta_la_serena_coquimbo
            },
            {
                value: 'valdivia',
                delta: delta_valdivia
            }
        ];
    
        let a = ciudades[0].delta;
        let b = 0;
        let id = ciudades[0].value;
    
        ciudades.forEach(ciudad => {
            b = ciudad.delta;
            if (b < a) {
                a = b;
                id = ciudad.value
            }
        });
    
        return id;
    }
}

