// Entorno para pruebas desde dispositivos en la misma red local (WiFi/LAN)
// Usa la IP de tu PC en lugar de "localhost"
// Cambia 192.168.1.20 por la IP real de tu máquina si cambia
export const environment = {
  production: false,
  coreApiUrl: 'http://192.168.1.20:5251',        // Evantix.Core  → --launch-profile network
  identityApiUrl: 'http://192.168.1.20:53056',   // Identity      → --launch-profile network
  googleClientId: '579973959669-m41nol7osd3i1rvdb1fhhm5p4alnh71o.apps.googleusercontent.com',
  appId: 1605,
  homeUrl: 'https://changes-baking-encouraging-lodge.trycloudflare.com',   // Cloudflare Tunnel
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  pageSize: 10
};
