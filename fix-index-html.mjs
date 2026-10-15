import fs from 'node:fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. İkinci <head> ve Tailwind v3 CDN çakışmasını temizle
html = html.replace(
  /<head>\s*<!-- Mevcut head içerikleriniz\.\.\. -->[\s\S]*?<!-- EKLEYECEĞİNİZ KISIM BİTİŞİ -->\s*<\/head>/i,
  ''
);

// 2. <body> başındaki stilsiz ham test elemanlarını temizle ve koyu kozmik sınıfı uygula
html = html.replace(
  /<body[^>]*>[\s\S]*?<noscript>/i,
  '<body class="bg-[#050814] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">\n    <noscript>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html renk kayması ve çift <head> çakışması başarıyla giderildi.');