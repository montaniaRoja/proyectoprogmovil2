const { Transaccion } = require('../models');  // Asegúrate de que la ruta sea correcta

module.exports = {
    create(req, res) {
        const { cuenta_id, tipo_movimiento, monto, } = req.body;

        if (!cuenta_id || !tipo_movimiento || !monto) {
            return res.status(400).send({ message: 'Todos los campos son requeridos' });
        }

        return Transaccion.create({
            cuenta_id,
            tipo_movimiento,
            monto
            
        })
        .then(transaccion => res.status(201).send(transaccion))
        .catch(error => res.status(400).send({ message: error.message }));
    },
    list(_, res) {
        return Transaccion.findAll({})
            .then(transacciones => res.status(200).send(transacciones))
            .catch(error => res.status(400).send({ message: error.message }));
    },
    find(req, res) {
        const { id } = req.params;

        return Transaccion.findOne({
            where: { id }
        })
        .then(transaccion => {
            if (!transaccion) {
                return res.status(404).send({ message: 'Deposito no encontrado' });
            }
            return res.status(200).send(transaccion);
        })
        .catch(error => res.status(400).send({ message: error.message }));
    },
};