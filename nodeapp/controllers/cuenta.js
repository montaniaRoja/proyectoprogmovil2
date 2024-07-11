const { Cuenta, Transaccion, Cliente } = require('../models');  // Asegúrate de que la ruta sea correcta
const bcrypt=require ('bcryptjs');

module.exports = {
    create(req, res) {
        const { no_cuenta, id_cliente, moneda } = req.body;

        if (!no_cuenta || !id_cliente || !moneda) {
            return res.status(400).send({ message: 'Todos los campos son requeridos' });
        }

        return Cuenta.create({
            no_cuenta,
            id_cliente,
            moneda
        })
            .then(cuenta => res.status(201).send(cuenta))
            .catch(error => res.status(400).send({ message: error.message }));
    },
    list(_, res) {
        return Cuenta.findAll({})
            .then(cuentas => res.status(200).send(cuentas))
            .catch(error => res.status(400).send({ message: error.message }));
    },
    find(req, res) {
        const { id } = req.params;

        return Cuenta.findOne({
            where: { id }
        })
            .then(cuenta => {
                if (!cuenta) {
                    return res.status(404).send({ message: 'Cuenta no encontrado' });
                }
                return res.status(200).send(cuenta);
            })
            .catch(error => res.status(400).send({ message: error.message }));
    },
    update(req, res) {
        const { id } = req.params; // Obtenemos el id de los parámetros de la URL
        const { saldo } = req.body;

        if (!saldo) {
            return res.status(400).send({ message: 'El saldo es requerido' });
        }

        return Cuenta.update({ saldo }, {
            where: { id }
        })
            .then(rowsUpdated => {
                if (rowsUpdated[0] === 0) {
                    return res.status(404).send({ message: 'Cuenta no encontrada' });
                }
                return res.status(200).send({ message: 'Cuenta actualizada correctamente' });
            })
            .catch(error => res.status(400).send({ message: error.message }));
    }, async findWithTransacciones(req, res) {
        const { id } = req.params;

        try {
            const cuenta = await Cuenta.findOne({
                where: { id },
                include: {
                    model: Transaccion,
                    attributes: ['fecha', 'tipo_movimiento', 'monto'],
                },
            });

            if (!cuenta) {
                return res.status(404).send({ message: 'Cuenta no encontrada' });
            }
            return res.status(200).send(cuenta);
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }
    },
    async findWithClienteId(req, res) {
        const { no_cuenta, usuario, keyword, clave } = req.body;
    
        if (!no_cuenta || !usuario || !keyword || !clave) {
            return res.status(400).send({ message: 'Todos los campos son requeridos' });
        }
    
        try {
            const cuenta = await Cuenta.findOne({
                where: { no_cuenta },
            });
            
            if (!cuenta) {
                return res.status(404).send({ message: 'Cuenta no encontrada' });
            }
    
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(keyword, salt);
    
            const [rowsUpdated] = await Cliente.update(
                { usuario, keyword: hash },
                { where: { id: cuenta.id_cliente, clave_secreta: clave } } 
            );
    
            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Cliente o correo no encontrado' });
            }
    
            return res.status(200).send({ message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }
    }     
    };
