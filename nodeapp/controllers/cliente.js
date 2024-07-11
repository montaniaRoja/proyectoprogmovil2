const { Cliente, Cuenta } = require('../models');
require('dotenv').config();
const nodemailer = require('nodemailer');

function getRandomInt() {
    return Math.floor(Math.random() * 900000) + 100000;
}

async function sendEmail(clave, correo) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Tu número aleatorio de 6 dígitos',
        text: `Tu número aleatorio de 6 dígitos es: ${clave}`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}

module.exports = {
    create(req, res) {
        const { no_doc, nombre, correo, direccion } = req.body;

        if (!no_doc || !nombre || !correo || !direccion) {
            return res.status(400).send({ message: 'Todos los campos son requeridos' });
        }

        return Cliente.create({
            no_doc,
            nombre,
            correo,
            direccion
        })
        .then(cliente => res.status(201).send(cliente))
        .catch(error => res.status(400).send({ message: error.message }));
    },
    list(_, res) {
        return Cliente.findAll({})
            .then(clientes => res.status(200).send(clientes))
            .catch(error => res.status(400).send({ message: error.message }));
    },
    find(req, res) {
        const { id } = req.params;

        return Cliente.findOne({
            where: { id }
        })
        .then(cliente => {
            if (!cliente) {
                return res.status(404).send({ message: 'Cliente no encontrado' });
            }
            return res.status(200).send(cliente);
        })
        .catch(error => res.status(400).send({ message: error.message }));
    },
    async findWithCuentas(req, res) {
        const { id } = req.params;

        try {
            const cliente = await Cliente.findOne({
                where: { id },
                include: {
                    model: Cuenta,
                    attributes: ['id', 'no_cuenta', 'moneda', 'saldo'],
                },
            });

            if (!cliente) {
                return res.status(404).send({ message: 'Cliente no encontrado' });
            }

            return res.status(200).send(cliente);
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }
    },
    async findCorreo(req, res) {
        const { correo } = req.params;

        if (!correo) {
            return res.status(400).send({ message: 'El campo correo es requerido' });
        }

        try {
            const cliente = await Cliente.findOne({
                where: { correo },
            });

            if (!cliente) {
                return res.status(404).send({ message: 'Cliente no encontrado' });
            }

            const clave = getRandomInt();

            const [updated] = await Cliente.update(
                { clave_secreta: clave },
                { where: { correo } }
            );

            if (updated === 0) {
                return res.status(400).send({ message: 'Error al actualizar la clave secreta' });
            }

            await sendEmail(clave, correo);

            return res.status(200).send({ message: 'Clave secreta generada y enviada exitosamente' });
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }
    }
};
