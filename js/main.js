const grid = new Muuri('.grid',{
    items: listarContactos(true),
    layout: {
        rounding: false
    }
});

var isLoading = false;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {

        navigator.serviceWorker.register('/service-worker.js').then( function(reg) {
          if(reg.active) {
              toastr.info("","Listo para funcionar Offline!", { positionClass: "toast-bottom-left", timeOut: "3000"});
          }else {
              toastr.info("","Preparando modo Offline!", { positionClass: "toast-bottom-left", timeOut: "3000"});
          }
        }).catch(function(error) {
          console.log('Fallo el registro: ' + error);
        });
        
    });
}

window.addEventListener('load', () => {
    iniciarListeners();
    grid.refreshItems().layout();
    document.getElementById('grid').classList.add('images-load');

    //Enlaces Listeners - Category Filter
    const enlaces = document.querySelectorAll('#categories a');
    enlaces.forEach( (elemento) => {
        elemento.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.getElementById('search-bar').value="";
            enlaces.forEach( (enlace) => enlace.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.innerHTML.toLowerCase();
            category === 'todos' ? grid.filter('[data-category]') : grid.filter('[data-category="'+category+'"]');
        });
    });
    //Search Bar Listeners - Tags Filter
    document.querySelector('#search-bar').addEventListener('input', (e) => {
        const  search = e.target.value.toLowerCase();
        grid.filter( (item) => item.getElement().dataset.tags.includes(search));
    });
    //Search Bar Listeners - Change tag active to Todos
    document.querySelector('#search-bar').addEventListener('click', (e) => {
        enlaces.forEach( (enlace) => enlace.classList.remove('active'));
        enlaces.forEach( (enlace) => {
            if(enlace.innerHTML === 'Todos'){
                enlace.classList.add('active');
                grid.filter('[data-category]')
            }
        });
    });
    //Scroll Top Listeners - Ir al principio.
    document.querySelector('#btnScroll').addEventListener('click', (e) => {
        e.preventDefault();

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
    // Form Agregar - IAgregar usuarios.
    document.querySelector('#contact').addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = capitalize(document.querySelector('#name').value);
        const telefono = document.querySelector('#telf').value;

        if(verificarDatos(nombre, telefono)){
            if(!isLoading){
                isLoading = true;
                const btn = document.querySelector('#contact-submit');
                const btnText = document.querySelector('#contact-submit .btn-text');
                const submitType = btn.dataset.submit;
    
                btn.classList.add('saving');
                btn.disabled = true;
                btnText.innerHTML = "Guardando...";
    
                if(submitType === 'Agregar')
                    agregarContacto();
                else
                    modificarContacto();
            }
        }


    });

    //Listener Input File - Validamos que el archivo que suban sea una imagen .jpg .jpeg o .png :D
    document.querySelector('#imagen').addEventListener('change', (evento) => {
        const archivo = evento.target.files[0];
        const input = evento.target;

        input.nextElementSibling.classList.contains("show") ? input.nextElementSibling.classList.remove("show") : '';

        let nombre = archivo.name,
            lastDot = nombre.lastIndexOf(".") + 1,
            extension = nombre.substr(lastDot, nombre.length).toLowerCase();

        if (!["jpg", "jpeg", "png"].includes(extension)){
            input.nextElementSibling.innerHTML = "Solo los formatos .jpg/.jpeg y .png estan permitidos!";
            input.nextElementSibling.classList.add("show");
            evento.target.value = "";
        }
    });

    listenersPopUp();
    listenersOverlay();
    listenersForm();
    listenerInputs();

    // document.querySelectorAll('#logo path').forEach( (path) => {
    //     console.log(path.getTotalLength());
    // });

});

/* ****************************** */
/* Boton Scroll */
/* ****************************** */
window.addEventListener('scroll', () => {

    if( window.innerWidth < 700 && (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) ){
        document.getElementById("btnAdd").classList.add("hide");
    }else{
        document.getElementById("btnAdd").classList.remove("hide");
    }

    scrollUp();
});

var scrollTop = document.getElementById("btnScroll");

function scrollUp() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollTop.classList.add("activo");
  } else {
    scrollTop.classList.remove("activo");
  }
}

function loaded() {
    document.querySelector('#contact-submit .btn-text').innerHTML = "Guardar";
    document.querySelector('#contact-submit').classList.remove('saving');;
    document.querySelector('#contact-submit').disabled = false;
    isLoading = false;
}

async function agregarContacto(){
    let contacto = {
        id: 1,
        nombre: "Contacto por Defecto",
        telefono: "",
        grupo: "3",
        imagen: "img/otros.png" 
    }
    let grupos = ["familia", "amigos", "trabajo", "otros"];
    let imagenes = ["img/familia.png", "img/amigos.png", "img/trabajo.png", "img/otros.png"];

    //Obtenemos los datos del Form y se los asignamos a nuestro objeto JSON
    contacto.nombre = capitalize(document.querySelector('#name').value);
    contacto.telefono = document.querySelector('#telf').value;
    contacto.grupo = grupos[document.querySelector('#group').value];

    const inputImg = document.querySelector("#imagen");
    contacto.imagen = (inputImg.files.length != 0) ? await convertir(inputImg.files[0]) : imagenes[document.querySelector('#group').value];

    /***************** Usamos localStorage ***********************************************/
    //OBtenemos todos los datos que almacenamos en "contactos" y si no hay daos creamos un arreglo vacio []
    let contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    //Asignamos el ID del Contacto dependiendo de cuantos Contactos tengamos en la Lista..
    let newId = localStorage.getItem("idCount") ? parseInt(localStorage.getItem("idCount"))+1: 1;
    contacto.id = newId;

    //Agregamos el nuevo contacto al Arreglo  de Contactos que es nuestra lista :D
    contactos.push(contacto);

    //Ordenamos todos los contactos en orden Alfabetico :D
    contactos.sort( ( a, b ) => {
        a = a.nombre.toLowerCase();
        b = b.nombre.toLowerCase();
    
        return a < b ? -1 : a > b ? 1 : 0;
    });

    //Guardamos  la nueva lista de los contactos en el campo "contactos" dentro del LocalStorage.
    localStorage.setItem("contactos", JSON.stringify(contactos));

    localStorage.setItem("idCount", newId);
    //********************************************************************************** */
    // Limpiamos el form y mostramos un alerta de que se agrego :D
    listarContactos().then(() => {

        const enlaces = document.querySelectorAll('#categories a');
        enlaces.forEach( (enlace) => enlace.classList.remove('active'));
        enlaces.forEach( (enlace) => (enlace.innerHTML === 'Todos') ? enlace.classList.add('active') : '' );

        loaded();
        document.querySelector('#contact').reset();
        toastr.success(`Contacto ${contacto.nombre} agregado!!`);
    });
}

async function modificarContacto(){
    let grupos = ["familia", "amigos", "trabajo", "otros"];
    const btnSubmit = document.querySelector('#contact-submit');
    const id = btnSubmit.dataset.id;


    //Obtenemos los Contactos del localStorage :D
    let contactos = JSON.parse(localStorage.getItem("contactos"));

    //Buscamos la posicion del contacto que vamos a modificar:
    const indice = contactos.findIndex( contacto => contacto.id == id);


    //Obtenemos los datos del Form y se los asignamos a nuestro objeto JSON
    contactos[indice].nombre = capitalize(document.querySelector('#name').value);
    contactos[indice].telefono = document.querySelector('#telf').value;
    contactos[indice].grupo = grupos[document.querySelector('#group').value];

    const inputImg = document.querySelector("#imagen");
    contactos[indice].imagen = (inputImg.files.length != 0) ? await convertir(inputImg.files[0]) : contactos[indice].imagen;

    let tiempo = (inputImg.files.length != 0) ? 1000 : 1500;

    //Ordenamos todos los contactos en orden Alfabetico por si acaso :D
    contactos.sort( ( a, b ) => {
        a = a.nombre.toLowerCase();
        b = b.nombre.toLowerCase();
    
        return a < b ? -1 : a > b ? 1 : 0;
    });

    //Guardamos  la nueva lista con el Contacto actualizado.
    localStorage.setItem("contactos", JSON.stringify(contactos));

    // Limpiamos el form, lo ocultamos y mostramos un alerta de que se modifico :P
    listarContactos(false, tiempo).then(() => {

        const enlaces = document.querySelectorAll('#categories a');
        enlaces.forEach( (enlace) => enlace.classList.remove('active'));
        enlaces.forEach( (enlace) => (enlace.innerHTML === 'Todos') ? enlace.classList.add('active') : '' );
        
        loaded();
        document.querySelector('#contact').reset();
        document.querySelector('#overlayForm').classList.remove('active');

        toastr.success("Contacto modificado!!");
    });
}

function iniciarListeners() {
    //Overlay Listeners - Popup
    const overlay = document.querySelector('#overlay');
    document.querySelectorAll('.grid .item img').forEach( (elemento) => {

        if( elemento.parentNode.parentNode.dataset.nombre.localeCompare("0 Contactos agregados!") != 0 ){
            elemento.addEventListener('click', (e) => {
                e.preventDefault();
                
                const ruta = elemento.getAttribute('src');
    
                const nombre = elemento.parentNode.parentNode.dataset.nombre;
                const telefono = elemento.parentNode.parentNode.dataset.telefono;
    
                document.querySelector('#overlay img').src = ruta;
    
                document.querySelector('#overlay .name').innerHTML = nombre;
                document.querySelector('#overlay .tlf').innerHTML = telefono;
                document.querySelector('#overlay .phone').href = "tel:"+telefono;
                
                if(validarWhatsApp(telefono)){
                    document.querySelector('#overlay .whatsapp').classList.remove('hide');
                    document.querySelector('#overlay .whatsapp').href = "https://wa.me/"+validarWhatsApp(telefono);
                }else
                    document.querySelector('#overlay .whatsapp').classList.add('hide');
    
                overlay.classList.add('active');
            });
        }   

    });

    //Listener  Boton de Eliminar :
    const overlayDel = document.querySelector('#overlayDel');
    document.querySelectorAll('.borrar').forEach( elemento => {

        if( elemento.parentNode.parentNode.parentNode.dataset.nombre.localeCompare("0 Contactos agregados!") != 0 ){
            elemento.addEventListener('click', (evento) => {
                evento.preventDefault();
                
                const id = elemento.parentNode.parentNode.parentNode.dataset.id;
                const nombre = elemento.parentNode.parentNode.parentNode.dataset.nombre;

                document.querySelector(".container-popup .botones .confirmar").dataset.id = id;
                overlayDel.classList.add('active');
            });
        }

    });
    
    //Listener Boton de Editar
    const overlayForm = document.querySelector('#overlayForm');
    const gruposId = new Map([ ['familia', 0], ['amigos', 1], ['trabajo', 2], ['otros', 3], ]);
    document.querySelectorAll('.editar').forEach( elemento => {

        if( elemento.parentNode.parentNode.parentNode.dataset.nombre.localeCompare("0 Contactos agregados!") != 0 ){
            elemento.addEventListener('click', (evento) => {
                evento.preventDefault();
                //Limpiamos el form y cambianmos el Titulo.
                overlayForm.firstElementChild.children[1].reset();
                overlayForm.firstElementChild.children[1].firstElementChild.innerHTML="Editar Contacto";

                // Obtenemos los datos del Contacto seleccionado en la Lista.
                const id = elemento.parentNode.parentNode.parentNode.dataset.id;
                const nombre = elemento.parentNode.parentNode.parentNode.dataset.nombre;
                const telefono = elemento.parentNode.parentNode.parentNode.dataset.telefono;
                const grupo = gruposId.get(elemento.parentNode.parentNode.parentNode.dataset.category);

                //Le asignamos los valores a los campos:
                document.querySelector('#name').value = nombre;
                document.querySelector('#telf').value = telefono;
                document.querySelector('#group').value = grupo;

                //Le asignamos el ID y la palabra "Editar" para saber que vamos a editar.
                document.querySelector("#contact-submit").dataset.id = id;
                document.querySelector("#contact-submit").dataset.submit = "Editar";
                overlayForm.classList.add('active');
            });
        }
        
    });
}

function listenersOverlay(){
    const overlay = document.querySelector('#overlay');    

    //Close Listeners - Close Button
    document.querySelector('#overlay #btn-close-popup').addEventListener('click', (e) => {
        e.preventDefault();

        overlay.classList.remove('active');
    });

    //Overlay Close Listeners - Overlay Close
    overlay.addEventListener('click', (e) => {

        e.target.id === 'overlay' ? overlay.classList.remove('active') : "";
    });
}

function listenersForm(){
    const overlayForm = document.querySelector('#overlayForm');

    document.querySelector('#btnAdd').addEventListener('click', (e) => {
        e.preventDefault();
        overlayForm.firstElementChild.children[1].firstElementChild.innerHTML="Agregar Contacto";

        overlayForm.firstElementChild.children[1].reset();
        document.querySelector("#contact-submit").dataset.submit = "Agregar";
        overlayForm.classList.add('active');
    });

    document.querySelector('#overlayForm #btn-close-popup').addEventListener('click', (e) => {
        e.preventDefault();

        const errores = document.querySelectorAll('.error');
        errores.forEach( error => {
            error.classList.contains('show') ? error.classList.remove('show'): '';
        });

        document.querySelector("#contact-submit").dataset.id = -1;
        overlayForm.firstElementChild.children[1].reset();
        overlayForm.classList.remove('active');
    });
    
    overlayForm.addEventListener('click', (e) => {
        if(e.target.id === 'overlayForm'){

            const errores = document.querySelectorAll('.error');
            errores.forEach( error => {
                error.classList.contains('show') ? error.classList.remove('show'): '';
            });

            document.querySelector("#contact-submit").dataset.id = -1;
            overlayForm.firstElementChild.children[1].reset();
            overlayForm.classList.remove('active');
        }
    });
}

function listarContactos(init = false, tiempo = 1500) {
    let contacto = {
        id: 1,
        nombre: "0 Contactos agregados!",
        telefono: "",
        grupo: "3",
        imagen: "img/otros.png" 
    }

    let contactos = JSON.parse(localStorage.getItem("contactos")) || [contacto];

    let listado = [];
    
    contactos.forEach( contacto => {
        let componente = document.createElement('div');

        componente.innerHTML = `<div class="item" 
                                    data-category="${contacto.grupo}" 
                                    data-tags="${contacto.grupo} ${contacto.nombre.toLowerCase()}"
                                    data-id="${contacto.id}"
                                    data-nombre="${contacto.nombre}"
                                    data-telefono="${contacto.telefono}">
                                    
                                    <div class="item-content">
                                        <img src="${contacto.imagen}" alt="">
                            
                                        <h2>${contacto.nombre}</h2>
                                        <div class="iconitos">
                                            <a class="editar"><i class="fa fa-edit"></i></a>
                                            <a class="borrar"><i class="fa fa-trash"></i></a>
                                        </div>
                                    </div>
                                </div>`;

        listado.push(componente.firstChild);
    });

    if(init){
        return listado;
    }else{
        return new Promise( (resolve, reject) => {

            actGrid(listado, tiempo).then((resp) => {
                grid.refreshItems().layout();
                document.getElementById('grid').classList.add('images-load');
                resolve();
            });

        });
    }
}

function actGrid(listado, tiempo){
    return new Promise( (resolve, reject) => {
        document.getElementById('grid').classList.remove('images-load');
        setTimeout(() => {
            grid.remove(grid.getItems(),{removeElements: true});
            grid.add(listado);
            iniciarListeners();
            resolve();
        }, tiempo);
    });
}

function convertir(imagen) {
    const ancho = 388;
    const alto = 388;
    const mime = 'image/png';
    const calidad = 1;
    
    const reader = new FileReader();
    reader.readAsDataURL(imagen);

    const convert = new Promise((resolve, reject) => {
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                    const elem = document.createElement('canvas');
                    elem.width = ancho;
                    elem.height = alto;
                    const ctx = elem.getContext('2d');
    
                    ctx.drawImage(img, 0, 0, ancho, alto);
                    const url = ctx.canvas.toDataURL(img, mime, calidad);
                    resolve(url);
                },
                reader.onerror = error => {
                    console.log(error);
                    reject(error);
                }
        };
    });

    return convert;
}

const capitalize = (str, lower = false) => 
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

function listenersPopUp(){
    const overlayDel = document.querySelector('#overlayDel');

    //Confirmar Listener - Toma el ID en el input oculto para asi eliminar el contacto.
    document.querySelector(".confirmar").addEventListener('click', (evento) => { 
        evento.preventDefault();
        
        const id = evento.target.dataset.id;
        eliminarContacto(id);

        overlayDel.classList.remove('active');
    }); 

    // Cancelar Listener - Para que cierre el popup :D
    document.querySelector(".cancelar").addEventListener('click', (evento) => {
        evento.preventDefault();

        overlayDel.classList.remove('active');
    }); 
    //Overlay Close Listeners - Overlay Close Popup
    overlayDel.addEventListener('click', (e) => {
        e.target.id === 'overlayDel' ? overlayDel.classList.remove('active') : "";
    });
}

function eliminarContacto(id){
    let contacto = {
        id: 1,
        nombre: "0 Contactos agregados!",
        telefono: "",
        grupo: "3",
        imagen: "img/otros.png" 
    }

    let contactos = JSON.parse(localStorage.getItem("contactos")) || [contacto];

    const indice = contactos.findIndex( contacto => contacto.id == id);
    (indice != undefined) ? contactos.splice(indice, 1) : '';
    
    if(contactos.length  == 0){
        localStorage.removeItem("contactos");
        localStorage.removeItem("idCount");;
        listarContactos();
    }else {
        localStorage.setItem("contactos", JSON.stringify(contactos));

        let elemento = document.querySelector(`.item[data-id="${id}"]`);
        grid.remove([elemento],{removeElements: true});
    }

}

function verificarDatos(nombre, numero){
    const name = document.querySelector('#name');
    const telf = document.querySelector('#telf');

    let nomb = nombre.trim(),
        num = numero.trim(),
        valid = true;

    if(nomb.length === 0 || nomb.length > 22){

        name.nextElementSibling.innerHTML = "Error: El nombre debe tener maximo 22 caracteres!";
        name.nextElementSibling.classList.add("show");

        valid = false;
    }

    if(num.match(/0{5,}/) || num.length === 0 || !num.match(/^[0-9\s\-\+\*\#]{3,20}$/g) || num.match(/[A-Za-z]/)) {

        telf.nextElementSibling.innerHTML = "Error: Solo se acepta entre 3-20 digitos, los caracteres especiales + - * # y no se acepta cinco 0 seguidos!";
        telf.nextElementSibling.classList.add("show");

        valid = false;
    }

    return valid;
}

function listenerInputs(){
    document.querySelector('#name').addEventListener('focus', (e) => {
        let campo = e.target;

        campo.nextElementSibling.classList.contains('show') ? campo.nextElementSibling.classList.remove('show'): '';
    });

    document.querySelector('#telf').addEventListener('focus', (e) => {
        let campo = e.target;

        campo.nextElementSibling.classList.contains('show') ? campo.nextElementSibling.classList.remove('show'): '';
    });

    document.querySelector('#telf').addEventListener('input', (e) => {
        var caret = e.target.selectionStart,
            valor = e.target.value;
        
        if(valor.match(/[A-Za-z]/g)){
            e.target.value = valor.replace(/[A-Za-z]/g, '');
            caret--;
        }

        e.target.setSelectionRange(caret, caret);
    });
}

function validarWhatsApp(numero){

    if(numero.match(/^(\+\d{1,4}[- ]?)\d{6,19}$/))
        return numero.replace(/[-+ ]/g, '');
    else
        return null;

}