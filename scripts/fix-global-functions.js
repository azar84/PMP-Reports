const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixGlobalFunctions() {
  try {
    console.log('🔧 Fixing global functions...');
    
    const functions = `function openYouTubePopup(videoId) {
    console.log("openYouTubePopup called with ID:", videoId);

    if (!videoId || typeof videoId !== "string") {
      console.error("Invalid or missing video ID");
      return;
    }

    try {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = 9999;

      const modal = document.createElement("div");
      modal.style.position = "relative";
      modal.style.width = "90%";
      modal.style.maxWidth = "800px";
      modal.style.aspectRatio = "16 / 9";
      modal.innerHTML = \`
        <iframe width="100%" height="100%"
          src="https://www.youtube.com/embed/\${videoId}?autoplay=1"
          frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
        </iframe>
        <button onclick="document.body.removeChild(this.parentElement.parentElement)"
          style="position: absolute; top: -12px; right: -12px; background: #5243E9;
          color: white; border: none; border-radius: 50%; width: 32px; height: 32px;
          font-size: 16px; cursor: pointer;">×</button>
      \`;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      console.log("YouTube modal created and shown.");
    } catch (err) {
      console.error("Error while showing video popup:", err);
    }
  }

function loadGtagScript(id = 'G-QTTME266CC') {
    if (!id) {
      console.error('Missing Google Tag ID');
      return;
    }

    const existing = document.querySelector(\`script[src*="\${id}"]\`);
    if (existing) {
      console.log('Gtag script already loaded.');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = \`https://www.googletagmanager.com/gtag/js?id=\${id}\`;
    document.head.appendChild(script);

    script.onload = () => {
      console.log('Gtag script loaded');
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', id);
    };
  }
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-QTTME266CC');

function gtag_report_conversion(url) {
  
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-17114096008/yngOCLiLoc0aEIjD0eA_',
      'value': 1.0,
      'currency': 'CAD',
      'transaction_id': '',
      'event_callback': callback
  });
  return false;
}

function getFullQueryString() {
  return window.location.search || '';
}

function goToLogin() {
  const fullUrl = 'https://app.saskiai.com/login' + getFullQueryString();
  window.location.href = fullUrl;
}`;

    await prisma.globalFunctions.upsert({
      where: { id: 1 },
      update: { functions },
      create: { id: 1, functions }
    });

    console.log('✅ Global functions updated successfully');
    console.log('Fixed getFullQueryString() to use window.location.search');

  } catch (error) {
    console.error('Error fixing global functions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGlobalFunctions(); 