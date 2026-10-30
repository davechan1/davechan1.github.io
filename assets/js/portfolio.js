(() => {
  const viewer = document.querySelector('#image-viewer');
  if (viewer) {
    document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
      viewer.querySelector('img').src = button.dataset.image;
      viewer.querySelector('img').alt = button.dataset.caption;
      viewer.showModal();
    }));
    viewer.querySelector('button').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  }
  const canvas = document.querySelector('#city');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width, height, scale;
  let seed = 86;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const blocks = [];
  for (let x = -22; x < 23; x++) for (let y = -22; y < 23; y++) {
    if (y >= 3 && y <= 5) continue;
    if (x % 5 === 0 || y % 5 === 0) continue;
    const park = (x > 5 && x < 10 && y < 0 && y > -5) || random() < .08;
    const density = Math.max(0, 1 - Math.hypot(x - 4, y + 3) / 14);
    blocks.push({ x: x * 31, y: y * 31, w: 15 + random() * 9, d: 15 + random() * 9, h: park ? 0 : 8 + random() * 25 + (random() > .72 ? random() * 150 * density : 0), park, tone: Math.floor(random() * 12) });
  }
  blocks.sort((a,b) => (a.x+a.y)-(b.x+b.y));
  function draw() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.max(width / 1350, height / 850);
    ctx.fillStyle = '#e5e8df'; ctx.fillRect(0, 0, width, height);
    const p = (x,y,z=0) => [width*.72+(x-y)*.88*scale, height*.39+(x+y)*.43*scale-z*scale];
    const polygon = (points, color) => {ctx.beginPath();points.forEach((v,i)=>{ const q=p(...v); i ? ctx.lineTo(...q) : ctx.moveTo(...q); });ctx.closePath();ctx.fillStyle=color;ctx.fill();};
    polygon([[-1100,90],[1100,90],[1100,181],[-1100,181]],'#bac9bf');
    for (let x = -22; x < 23; x++) if(x%5===0) {
      polygon([[x*31-3,-900],[x*31+23,-900],[x*31+23,900],[x*31-3,900]],'#d1d6cc');
      if(x%10===0) polygon([[x*31+9,-900],[x*31+10,-900],[x*31+10,900],[x*31+9,900]],'#e7e9e1');
    }
    for (const b of blocks) {
      const {x,y,w,d,h,tone:t}=b;
      if(b.park) {
        polygon([[x-3,y-3],[x+w+3,y-3],[x+w+3,y+d+3],[x-3,y+d+3]],'#bcc9ab');
        for(let i=0;i<3;i++) {const q=p(x+4+i*6,y+5+i*3,5);ctx.fillStyle='#879a79';ctx.beginPath();ctx.ellipse(q[0],q[1],3.3*scale,5*scale,0,0,Math.PI*2);ctx.fill();}continue;
      }
      polygon([[x+w,y,h],[x+w+10+h*.25,y+6,0],[x+w+10+h*.25,y+d+6,0],[x,y+d,0]],'#c9cec3');
      polygon([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],`rgb(${245-t},${246-t},${237-t})`);
      polygon([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],`rgb(${216-t},${220-t},${208-t})`);
      polygon([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],`rgb(${192-t},${200-t},${187-t})`);
      if(h>55) {for(let z=10;z<h-6;z+=9) {const a=p(x+w+.2,y+3,z),c=p(x+w+.2,y+d-3,z);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.strokeStyle='#a7b1a1';ctx.lineWidth=.6*scale;ctx.stroke();}}
    }
    // A quiet flight path over the illustrative urban model.
    ctx.beginPath(); [[-280,-260,90],[-160,-180,100],[-20,-90,115],[100,-35,105],[230,0,120],[390,0,130]].forEach((v,i)=>{ const q=p(...v);i?ctx.lineTo(...q):ctx.moveTo(...q); });ctx.strokeStyle='#768f72';ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);
  }
  let queued = false;
  new ResizeObserver(() => {if(!queued){queued=true;requestAnimationFrame(()=>{draw();queued=false;});}}).observe(canvas);
})();
