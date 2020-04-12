const _filters = require('./services/rider');
const _notificaciones = require('./services/rider');
const _rider = require('./services/rider');
const _request = require('./services/rider');

module.exports = {
    searchRider
}

let initModel = {
    requested_riders: []
}

const MSGS = {
    ADD: 'ADD',
    CLEAR: 'CLEAR',
    FAIL: 'CLEAR',
    SUCCESS: 'CLEAR'
}

let updateModel = (msg, model, id = '') => {
    switch (msg) {
        case MSGS.ADD:
            return model.requested_riders.push(id)
        case MSGS.CLEAR:
            return model.requested_riders = []
    }
}

let searchRider = (query, consumer) => {

    return new Promise((resolve, reject) => {

        let model = initModel
        let tries = 5

        let search = () => {

            let rider = await getNeerestRider(query, model);

            if (tries === 0)
                resolve({ ok: false })

            if (!rider.ok)
                return setTimeout(() => {
                    tries -= 1;
                    search()
                }, 5 * 1000);


            const handShake = await doHandShake(rider.id);

            if (!handShake.ok)
                return search()

            const request = await _request.sendRequest(rider.id)
            model = updateModel(MSGS.ADD, model, rider.id)

            if (!request.ok) {
                await _request.requestRejected(rider)
                return search()
            }

            await _request.requestAccepted(rider)
            resolve({ ok: true, rider: request.rider })
        }

        search()
    });
}


let sleep = (id) => {
    this.timer = setTimeout(async () => {

        this._fire.riders_consultados.push(id);

        searchRider();

        this._fire.getRiderPromise(id).then(rider => {

            if (rider.pedidos_perdidos >= 1) {

                this._fire.updateRider(id, 'rider', {
                    cliente_activo: '',
                    pagoPendiente: false,
                    nuevaSolicitud: false,
                    isOnline: false,
                    pedidos_perdidos: 0
                });

                this._fire.updateRider(id, 'coors', {
                    pagoPendiente: false,
                    isOnline: false
                });
            } else {

                this._fire.updateRider(id, 'rider', {
                    cliente_activo: '',
                    pagoPendiente: false,
                    nuevaSolicitud: false,
                    pedidos_perdidos: rider.pedidos_perdidos + 1
                });

                this._fire.updateRider(id, 'coors', {
                    pagoPendiente: false
                });

            }
        });

    }, 5 * 1000);
}


let doHandShake = (id) => {
    return new Promise(async (resolve, reject) => {

        const rider = await _rider.getRider(id);

        if (rider.cliente_activo != '')
            resolve({ ok: false })

        const clientID = new Date().getTime().toString(36);
        const updatedRider = await _rider.updateRider(id, 'rider', { cliente_activo: clientID })

        if (updatedRider.cliente_activo != clientID && rider.cliente_activo != '')
            resolve({ ok: false })

        if (updatedRider.cliente_activo === clientID && rider.cliente_activo != '')
            resolve({ ok: true, rider: updatedRider })


        this._rider.getRider(id).then(rider => {

            if (rider.cliente_activo == '') {
                this._rider.updateRider(id, 'rider', { cliente_activo: this.usuario._id })
                    .then(() => this.handShake(id));
            }

            if (rider.cliente_activo != this.usuario._id && rider.cliente_activo != '') {
                getNeerestRider();
            }

            if (rider.cliente_activo == this.usuario._id && rider.cliente_activo != '') {
                sendRiderRequest(id);
            }
        });
    })

}

let getNeerestRider = (query) => {

    const { ciudad, lat, lng } = query;

    return new Promise(async (resolve, reject) => {

        const riders = await _rider.getAll({ ciudad, cliente_activo: '' });

        if (riders.length == 0) {
            return resolve({ ok: false });
        }

        const ridersDisponibles = _filtros.ridersDisponibles(riders);

        if (!ridersDisponibles.ok) {
            return resolve({ ok: false });
        }

        const riderCercano = _filtros.riderMasCercano(ridersDisponibles.riders, lat, lng);

        if (!riderCercano.ok) {
            return resolve({ ok: false });
        }

        resolve({ ok: true, id: riderCercano.id });
    });
}





let consumerSleep = () => {

}


let cancelarServicio = async (id, pedido) => {

    const rider: any = await this.getRiderPromise(id);

    if (rider.fase == 'navegando_al_origen') {

        const data_rider = {
            actividad: 'disponible',
            cliente_activo: '',
            pedido: '',
            servicio_cancelado: true
        };

        const data_coors = {
            actividad: 'disponible',
            cliente: ''
        };

        this.updateRider(id, 'rider', data_rider);
        this.updateRider(id, 'coors', data_coors);

        const bodyPedido = {
            pedido: pedido._id,
            rider: id
        };

        this._data.cancelarPedido(bodyPedido);
    }

    if (rider.fase != 'navegando_al_origen') {

        const data_rider = {
            bloqueado: true,
            servicio_cancelado: true
        };

        this.updateRider(id, 'rider', data_rider);
        this.toast_devolucion_paquete();

        const bodyPedido = {
            pedido: pedido._id,
            rider: id
        };

        this._data.cancelarPedido(bodyPedido);
    }
}

let detectarRidersCercanos = (body) => {
    return new Promise(async (resolve, reject) => {

        const { ciudad, lat, lng } = body;

        let riders: any = [];

        riders = await this.getRidersCollection(ciudad, 'disponible');

        if (riders.length == 0) {
            riders = await this.getRidersCollection(ciudad, 'ocupado');
        }

        if (riders.length == 0) {
            return resolve({ isMoto: false, isBici: false, isAuto: false });
        }

        const data = this.filtro_dos(riders, lat, lng);
        resolve({ isMoto: data.isMoto, isBici: data.isBici, isAuto: data.isAuto });
    });
}




let subscribeToRider = (id) => {
    this.riderSub$ = this._fire.getRider(id).subscribe(data => {
        const riderFire: any = data[0];
        this.riderActivoEnBusqueda = riderFire.rider;

        if (riderFire.rechazadoId == this.usuario._id) {
            clearTimeout(this.timer);
            this.riderSub$.unsubscribe();
            this._fire.updateRider(id, 'rider', { rechazadoId: '', cliente_activo: '' })
            this.getNeerestRider();
        }

        if (riderFire.aceptadoId == this.usuario._id) {

            this.tiempoLlegada = riderFire.tiempoLlegada;

            clearTimeout(this.timer);
            this.riderSub$.unsubscribe();
            this.loadingRider = false;

            this._data.getOneRider(riderFire.rider).then(rider => {

                this.rider = rider;

                const data = {
                    actividad: riderFire.actividad,
                    monto: this.precio,
                    monto_promo: this.precio_promo,
                    rider: this.rider,
                    usuario: this.usuario,
                    pedido: {
                        origen: this._control.origen,
                        destino: this._control.destino,
                        distancia: this.distancia,
                        tiempo: this.tiempo + this.tiempoLlegada
                    }
                }

                if (this.vehiculo != this.vehiculo_alternativo) {
                    this.presentAlternative(this.vehiculo, this.vehiculo_alternativo, data);
                } else {
                    this.openPayModal(data);
                }

            });
        }

    });
}

