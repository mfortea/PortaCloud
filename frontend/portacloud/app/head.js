// app/head.js
export default function Head() {
    return (
      <>
        <title>PortaCloud</title>
        <meta name="description" content="Gestor de Portapapeles Multiplataforma con Sincronización en la Nube" />
  
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#222222" />
  
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  
        <meta property="og:title" content="PortaCloud" />
        <meta property="og:description" content="Gestor de Portapapeles Multiplataforma con Sincronización en la Nube" />
        <meta property="og:image" content="/path/to/your/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
  
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
  
        <script
          src="https://cdn.jsdelivr.net/npm/ios-pwa-splash@1.0.0/cdn.min.js"
          async
        ></script>
        <script dangerouslySetInnerHTML={{ __html: `iosPWASplash('logo.png', '#000000');` }} />
      </>
    );
  }