document.addEventListener('DOMContentLoaded', function () {

    const params = new URLSearchParams(window.location.search);
    const idcliente = params.get('id');
    const nombre = params.get('nombre');

    console.log('ID:', idcliente);
    console.log('Nombre:', nombre);

    fetch('http://34.42.1.3:3000/api/cliente/find/' + idcliente + '/cuentas')
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('La respuesta no fue exitosa');
        })
        .then(function (data) {
            let tableBody = document.getElementById('cuentasbody');
            console.log(data);
            // Eliminar filas existentes
            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }

            // Crear nuevas filas con los datos recibidos
            data.Cuenta.forEach(cuenta => {
                agregarCuentasATabla(idcliente, nombre, cuenta);
            });

            $('#cuentas').DataTable();

        }).catch(function (error) {
            console.log(error);
        });

    function createTransaccionButton() {
        var boton = document.createElement("button");
        boton.innerHTML = "Transacciones";
        boton.id = "accountButton";
        boton.type = "button";
        boton.classList.add("btn", "btn-primary", "btn-sm");
        boton.setAttribute("data-bs-toggle", "modal");
        boton.setAttribute("data-bs-target", "#transaccionesModal");
        return boton;
    }

    function createHistorialButton(){
        var botonUno = document.createElement("button");
        botonUno.innerHTML = "Historial";
        botonUno.id = "accountButton";
        botonUno.type = "button";
        botonUno.classList.add("btn", "btn-primary", "btn-sm");
        botonUno.setAttribute("data-bs-toggle", "modal");
        botonUno.setAttribute("data-bs-target", "#historialModal");
        return botonUno;
    }

    function agregarCuentasATabla(idcliente, nombre, cuenta) {
        let tableBody = document.getElementById('cuentasbody');
        let row = tableBody.insertRow();
        let idCell = row.insertCell(0);
        let nombreCell = row.insertCell(1);
        let cuentaCell = row.insertCell(2);
        let monedaCell = row.insertCell(3);
        let saldoCell = row.insertCell(4);
        var transaccionButton = createTransaccionButton();
        transaccionButton.setAttribute("data-cuenta", cuenta.no_cuenta);
        var historialButton = createHistorialButton();
        historialButton.setAttribute("data-ctaId", cuenta.id);
        historialButton.setAttribute("data-ctaNo", cuenta.no_cuenta);

        let botonCell = row.insertCell(5);
        let botonUnoCell = row.insertCell(6);
        
        idCell.textContent = idcliente;
        nombreCell.textContent = nombre;
        cuentaCell.textContent = cuenta.no_cuenta;
        monedaCell.textContent = cuenta.moneda;
        saldoCell.textContent = cuenta.saldo;
        botonCell.append(transaccionButton);
        botonUnoCell.append(historialButton);

        transaccionButton.addEventListener('click', function () {
            var nocuenta = transaccionButton.getAttribute('data-cuenta');
            console.log('cuenta ' + nocuenta);
            document.getElementById('modalcuentanumero').value = nocuenta;
            document.getElementById('modalmoneda').value = cuenta.moneda;
            document.getElementById('modalcuentaid').value = cuenta.id;
            document.getElementById('modalsaldocuenta').value = cuenta.saldo;
        });

        historialButton.addEventListener('click', function(){
            var hnocuenta=historialButton.getAttribute('data-ctaNo');
            var idcuenta=historialButton.getAttribute('data-ctaId');
            
            console.log(hnocuenta);
            console.log(idcuenta);
            document.getElementById('txtcuenta').value=hnocuenta;
            
            fetch('http://34.42.1.3:3000/api/cuenta/find/'+idcuenta+'/transacciones')
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('La respuesta no fue exitosa');
        })
        .then(function (data) {
            let tableBody = document.getElementById('historialbody');
            console.log(data);
            // Eliminar filas existentes
            
            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }
            var saldo=0;
            //Crear nuevas filas con los datos recibidos
            data.Transaccions.forEach(transaccion => {
                let montoTransaccion=parseFloat(transaccion.monto);
                if(transaccion.tipo_movimiento==="Deposito"){
                    saldo=saldo+montoTransaccion;
                }else{
                    saldo=saldo-montoTransaccion;
                }
                agregarTransaccionesATabla(transaccion.fecha, transaccion.tipo_movimiento, transaccion.monto,saldo);
            });
            
            $('#historial').DataTable().destroy();
            $('#historial').DataTable();
            
        }).catch(function (error) {
            console.log(error);
        });
            

        });

        function agregarTransaccionesATabla(fecha, tipo_movimiento, monto, saldo){
            console.log(fecha, tipo_movimiento, monto, saldo);
            let bodyTable=document.getElementById('historialbody');
            let fila = bodyTable.insertRow();
            let fechaCell = fila.insertCell(0);
            let transaccionCell = fila.insertCell(1);
            let montoCell = fila.insertCell(2);
            let saldoCell = fila.insertCell(3);

            fechaCell.textContent = fecha;
            transaccionCell.textContent = tipo_movimiento;
            montoCell.textContent = monto;
            saldoCell.textContent = saldo;



        }

    }




});

function prepararTransaccion() {
    console.log('preparando');

    var saldoactual = parseFloat(document.getElementById('modalsaldocuenta').value);
    var montoretiro = parseFloat(document.getElementById('modalmonto').value);

    //obtener los valores del formulario
    var select = document.getElementById('transaccionselect');

    const tipo_movimiento = select.options[select.selectedIndex].text;
    const monto = parseFloat(document.getElementById('modalmonto').value);
    const cuenta_id = document.getElementById('modalcuentaid').value;
    let saldo_cuenta = parseFloat(document.getElementById('modalsaldocuenta').value);
    let numero_cuenta=document.getElementById('modalcuentanumero').value;
    console.log('el numero de cuenta es '+numero_cuenta);

    if (saldoactual < montoretiro && tipo_movimiento === 'Retiro') {
        alert('saldo menor al retiro');
        return;
    }

    if (tipo_movimiento === 'Deposito') {
        saldo_cuenta += monto;
    } else {
        saldo_cuenta -= monto;
    }

    enviarTransaccion(cuenta_id, tipo_movimiento, monto);
    if (monto > 0) {
        actualizarSaldo(cuenta_id, saldo_cuenta, numero_cuenta);
        
    }
}

function enviarTransaccion(cuenta_id, tipo_movimiento, monto) {
    if (monto > 0) {
        const cuentaData = {
            cuenta_id: cuenta_id,
            tipo_movimiento: tipo_movimiento,
            monto: monto
        };

        fetch('http://34.42.1.3:3000/api/transaccion/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuentaData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al registrar transaccion');
                }
                return response.json();
            })
            .then(data => {
                alert('transaccion creada exitosamente:', data);

                $('#transaccionesform').trigger("reset");
                $('#transaccionesModal').modal('hide');
                $('.modal-backdrop').remove();
            })
            .catch(error => {
                alert(error);
            });
    } else {
        document.getElementById('aviso').innerHTML = 'Revise el monto de la transaccion';
    }
}

function habilitarBoton() {
    var btn_transaccion = document.getElementById('modalboton');
    btn_transaccion.disabled = false;
}

function limpiarModal() {
    $('#transaccionesform').trigger("reset");
    $('#transaccionesModal').modal('hide');
    $('.modal-backdrop').remove();
    document.getElementById('aviso').innerHTML = '';
}

function actualizarSaldo(cuenta_id, saldo_cuenta, numero_cuenta) {
    console.log('el nuevo saldo de la cuenta es ' + saldo_cuenta);
    console.log('el id de la cuenta es ' + cuenta_id);

    const transaccionData = {
        id: cuenta_id,
        saldo: saldo_cuenta
    };
    const url = 'http://34.42.1.3:3000/api/cuenta/' + cuenta_id;

    console.log('la ruta es ' + url);

    fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaccionData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al registrar transaccion');
            }
            return response.json();
        })
        .then(data => {
            //actualizarFilaTabla(numero_cuenta, saldo_cuenta);
        })
        .catch(error => {
            alert(error);
        });
}

function actualizarFilaTabla(numero_cuenta, nuevoSaldo) {
    console.log('Actualizando la fila');

    let table = $('#cuentas').DataTable();
    let rows = table.rows().nodes();

    $(rows).each((index, row) => {
        let rowData = table.row(row).data();

        let cuenta = rowData[2];

        if (cuenta === numero_cuenta) {
            console.log('las cuentas son iguales');
            
            // Actualiza el saldo directamente en la celda
            table.cell(row, 4).data(nuevoSaldo).draw(false);
            

            console.log(`Saldo actualizado a ${nuevoSaldo}`);
            nuevoSaldo=0;
            return false; // Salir del bucle
        }
    });

    console.log(`Actualización de cuenta ${numero_cuenta} completada.`);
}
