// Script temporal para generar claves VAPID
// Se ejecuta UNA SOLA VEZ y luego se puede borrar
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== CLAVES VAPID GENERADAS ===');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('⚠️  Copialas y pegalas en .env.local y en Vercel');
console.log('⚠️  La privada NUNCA la subas a GitHub');