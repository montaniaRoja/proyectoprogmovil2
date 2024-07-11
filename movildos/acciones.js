function crearCliente() {
    // Obtener los valores del campo del formulario
    const no_doc = document.getElementById('numeroDoc').value;
    const nombre = document.getElementById('nombreCliente').value;
    const correo = document.getElementById('email1').value;
    const direccion = document.getElementById('dirCliente').value;

    // Crear un objeto con los datos
    const clienteData = {
        no_doc: no_doc,
        nombre: nombre,
        correo: correo,
        direccion: direccion
    };

    // Enviar los datos del formulario
    fetch('http://34.42.1.3:3000/api/cliente/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clienteData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al registrar cliente');
            }
            return response.json();
        })
        .then(data => {
            alert('Cliente registrado exitosamente:', data);
            // Resetear el formulario y cerrar el modal
            $('#registroform').trigger("reset");
            $('#registroModal').modal('hide');
            $('.modal-backdrop').remove();

            // Agregar el nuevo cliente a la tabla
            agregarClienteATabla(data);
        })
        .catch(error => {
            alert(error);
        });
}

function agregarClienteATabla(cliente) {
    let table = $('#example').DataTable();

    let createAccountButton = '<button class="btn btn-primary btn-sm" data-id="' + cliente.id + '" data-nombre="' + cliente.nombre + '" data-nodoc="' + cliente.no_doc + '" data-bs-toggle="modal" data-bs-target="#staticBackdrop02">Crear Cuenta</button>';
    let transButton = '<a class="btn btn-primary btn-sm" href="transacciones.html?id=' + cliente.id + '&nombre=' + encodeURIComponent(cliente.nombre) + '" data-id="' + cliente.id + '">Transacciones</a>';

    let rowNode = table.row.add([
        cliente.id,
        cliente.no_doc,
        cliente.nombre,
        cliente.correo,
        cliente.direccion,
        createAccountButton,
        transButton
    ]).draw().node();

    // Agregar el event listener al botón de crear cuenta
    $(rowNode).find('button').on('click', function () {
        var id = $(this).data('id');
        var nombre = $(this).data('nombre');
        var nodoc = $(this).data('nodoc');

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses comienzan en 0
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const uniqueNumber = `${year}${month}${day}${hours}${minutes}${seconds}`;

        document.getElementById('numeroDoc1').value = nodoc;
        document.getElementById('nombreCliente1').value = nombre;
        document.getElementById('nocuenta').value = uniqueNumber;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://34.42.1.3:3000/api/cliente/list')
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('La respuesta no fue exitosa');
        })
        .then(function (data) {
            let tableBody = document.getElementById('tablebody');

            // Eliminar filas existentes
            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }

            if (Array.isArray(data)) {
                console.log(data);
                data.forEach(function (item) {
                    let row = tableBody.insertRow();
                    row.insertCell().textContent = item.id;
                    row.insertCell().textContent = item.no_doc;
                    row.insertCell().textContent = item.nombre;
                    row.insertCell().textContent = item.correo;
                    row.insertCell().textContent = item.direccion;
                    var accountButton = createAccountButton();
                    var transButton = createTransButton();
                    row.insertCell().append(accountButton);

                    accountButton.setAttribute("data-id", item.id);
                    accountButton.setAttribute("data-nombre", item.nombre);
                    accountButton.setAttribute("data-nodoc", item.no_doc);

                    row.insertCell().append(transButton);
                    transButton.setAttribute("href", `transacciones.html?id=${item.id}&nombre=${encodeURIComponent(item.nombre)}`);
                    transButton.setAttribute("data-id", item.id);

                    accountButton.addEventListener('click', function () {
                        var id = accountButton.getAttribute('data-id');
                        var nombre = accountButton.getAttribute('data-nombre');
                        var nodoc = accountButton.getAttribute('data-nodoc');
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses comienzan en 0
                        const day = String(now.getDate()).padStart(2, '0');
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
                        const seconds = String(now.getSeconds()).padStart(2, '0');

                        const uniqueNumber = `${year}${month}${day}${hours}${minutes}${seconds}`;
                        console.log(uniqueNumber);
                        console.log(id);
                        document.getElementById('clienteId').value = id;
                        document.getElementById('numeroDoc1').value = nodoc;
                        document.getElementById('nombreCliente1').value = nombre;
                        document.getElementById('nocuenta').value = uniqueNumber;
                    });
                });

                $('#example').DataTable();
            } else {
                console.error('La respuesta del servidor no es un array');
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    function createAccountButton() {
        var boton = document.createElement("button");
        boton.innerHTML = "Crear Cuenta";
        boton.id = "accountButton";
        boton.type = "button";
        boton.classList.add("btn", "btn-primary", "btn-sm");
        boton.setAttribute("data-bs-toggle", "modal");
        boton.setAttribute("data-bs-target", "#staticBackdrop02");
        return boton;
    }

    function createTransButton() {
        var boton1 = document.createElement("a");
        boton1.innerHTML = "Transacciones";
        boton1.id = "transButton";
        boton1.classList.add("btn", "btn-primary", "btn-sm");
        return boton1;
    }
});

function crearCuenta() {
    console.log('crear cuenta');

    const no_cuenta = document.getElementById('nocuenta').value;
    const idcliente = document.getElementById('clienteId').value;
    const moneda = document.getElementById('moneda').value;

    console.log(moneda);

    // Crear un objeto con los datos
    const cuentaData = {
        no_cuenta: no_cuenta,
        id_cliente: idcliente,
        moneda: moneda
    };

    fetch('http://34.42.1.3:3000/api/cuenta/create/' + idcliente, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuentaData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al registrar cuenta');
            }
            return response.json();
        })
        .then(data => {
            alert('Cuenta creada exitosamente:', data);
            // Resetear el formulario y cerrar el modal
            $('#cuentaform').trigger("reset");
            $('#staticBackdrop02').modal('hide');
            $('.modal-backdrop').remove();
        })
        .catch(error => {
            alert(error);
        });
}
