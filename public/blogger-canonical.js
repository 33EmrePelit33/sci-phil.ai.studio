/* Generated from the primary Turkish article catalogue. */
(function(){
  if (!/(^|\.)blogspot\.com$/i.test(location.hostname)) return;
  function key(v){try{var u=new URL(v,location.href);u.hash='';u.search='';return u.toString().replace(/\/$/,'').toLowerCase()}catch(e){return String(v||'').replace(/\/$/,'').toLowerCase()}}
  var map={}; var target=map[key(location.href)]; if(!target) return;
  var link=document.querySelector('link[rel~="canonical"]'); if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)} link.href=target;
  var og=document.querySelector('meta[property="og:url"]'); if(og) og.content=target;
})();
