import fs from "node:fs";
import path from "node:path";

const dist = "dist";
const htmls = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const p = path.join(d,e.name); if (e.isDirectory()) { if (e.name !== "admin") walk(p); /* yonetim paneli site sayfasi degil */ } else if (e.name.endsWith(".html")) htmls.push(p); } })(dist);

let sorun = 0;
for (const f of htmls.sort()) {
  const h = fs.readFileSync(f, "utf8");
  const body = h.slice(h.indexOf("<body"));
  const notlar = [];

  // 1) Baslik hiyerarsisi
  const basliklar = [...body.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
  const h1 = basliklar.filter(n => n === 1).length;
  if (h1 !== 1) notlar.push(`h1 sayisi = ${h1}`);
  let onceki = 0;
  for (const s of basliklar) { if (onceki && s > onceki + 1) notlar.push(`h${onceki} -> h${s} atlamasi`); onceki = s; }

  // 2) alt metni olmayan gorseller
  const imgs = body.match(/<img\b[^>]*>/g) || [];
  // alt="" bos birakilan dekoratif gorseller gecerlidir; Astro bunu ciplak `alt` olarak yazar
  const altsiz = imgs.filter(t => !/\salt(=|[\s>])/.test(t)).length;
  if (altsiz) notlar.push(`${altsiz} gorsel alt metinsiz`);

  // 3) Bos baglanti metni
  const bosLink = (body.match(/<a\b[^>]*>\s*<\/a>/g) || []).length;
  if (bosLink) notlar.push(`${bosLink} bos <a>`);

  // 4) aria-labelledby / aria-controls hedefleri
  const idler = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const attr of ["aria-labelledby", "aria-controls", "aria-describedby"]) {
    for (const m of body.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))) {
      for (const ref of m[1].split(/\s+/)) if (!idler.has(ref)) notlar.push(`${attr} -> #${ref} yok`);
    }
  }

  // 5) Tekrarlanan id
  const tumId = [...body.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const tekrar = tumId.filter((v,i)=>tumId.indexOf(v)!==i);
  if (tekrar.length) notlar.push(`tekrarlanan id: ${[...new Set(tekrar)].join(", ")}`);

  // 6) lang / title / description
  if (!/<html[^>]*lang="tr"/.test(h)) notlar.push("lang=tr yok");
  const t = h.match(/<title>([^<]*)<\/title>/);
  if (!t || !t[1].trim()) notlar.push("title bos");
  const d = h.match(/<meta name="description" content="([^"]*)"/);
  if (!d) notlar.push("description yok");
  else if (d[1].length < 70 || d[1].length > 175) notlar.push(`description ${d[1].length} karakter`);

  // 7) Sayfa agirligi
  const kb = Math.round(Buffer.byteLength(h) / 1024);

  const yol = f.replace(/\\/g, "/").replace("dist", "") || "/";
  if (notlar.length) { sorun += notlar.length; console.log(`X ${yol}  (${kb} KB)`); notlar.forEach(n => console.log(`    - ${n}`)); }
  else console.log(`OK ${yol}  (${kb} KB, ${imgs.length} gorsel, h1=${h1})`);
}
console.log(sorun === 0 ? "\nTum sayfalar temiz." : `\nToplam ${sorun} not.`);
