module.exports = {
    
    requestAccepted: async () => {
        if (rider.fail_requests >= 3) {
    
            location_body = {
                isOnline: false
            }
    
            state_body = {
                active_customer: '',
                fail_requests: 0,
                isOnline: false
            }
    
        } else {
            state_body = {
                active_customer: '',
                fail_requests: rider.fail_requests + 1
            }
        }
    
        await _rider.update(msgs.rider.LOCATION, id, location_body)
        return _rider.update(msgs.rider.STATE, id, state_body)
    },

    requestRejected: () => {

    },

    sendRequest: async (id) => {

        await this._fire.updateRider(id, 'rider', {
            nuevaSolicitud: true,
            pagoPendiente: true,
            created: new Date().getTime(),
            dataPedido: {
                cliente: {
                    _id: this.usuario._id,
                    nombre: this.usuario.nombre,
                    img: this.usuario.img.url,
                    role: this.usuario.role
                },
                pedido: {
                    distancia: this.distancia,
                    tiempo: this.tiempo,
                    origen: this._control.origen,
                    destino: this._control.destino,
                    costo: this.precio
                }
            }
        });
    
        await this._fire.updateRider(id, 'coors', {
            pagoPendiente: true
        });
    
    
        return new Promise((resolve, reject) => {
    
            let timer = setTimeout(() => {
                resolve({ ok: false })
            }, 45 * 1000);
    
            event.on(events.request.ANSWARE, request => {
                if (request.accepted) {
                    clearTimeout(timer)
                    resolve({ ok: true })
                }
            });
    
        })
    }

}