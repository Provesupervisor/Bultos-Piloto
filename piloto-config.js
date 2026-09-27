/*  CONFIGURACIÓN DEL PILOTO DE BULTOS
    ----------------------------------------------------------------
    Este es el ÚNICO archivo que hay que editar para conectar el piloto.
    Lo leen la app de patio y la app de registro de picking.

    Pega entre las comillas de "url" la dirección del Apps Script del
    piloto (la que termina en /exec). No es la del planificador.

    Si "url" queda vacía, el piloto queda apagado: la app de patio
    funciona exactamente como siempre, solo por factura.
*/
window.PILOTO_BULTOS = {
  url: 'https://script.google.com/macros/s/AKfycbwnKNK0D2uELcEg4OCIeDe1jP7RLoQlSj0Z_SpIMwqmYL1MvWxg4BT6rX7Fg01hByJVjw/exec',
  clave: 'bultos-huachipa-2026'
};
