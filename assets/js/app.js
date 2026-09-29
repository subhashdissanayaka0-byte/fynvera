/* =========================================================
   FYNVERA SHARED JAVASCRIPT
   No external libraries or API keys are required in this starter.
   ========================================================= */

/* Convert text into stable URL slugs for subcategory pages. */
const slugify = t => t.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* Build one independent dropdown for EACH main category. The category title
   itself is a normal link to its dedicated category page. */
function buildCategoryNav({rootId='categoryNav', prefix='' }={}){
  const root=document.getElementById(rootId);
  if(!root) return;
  root.innerHTML = `<a href="${prefix}index.html">Home</a>` + FYNVERA_CATEGORIES.map(c=>`
    <div class="nav-category">
      <a class="nav-category-main" href="${prefix}categories/${c.slug}.html">${c.name}</a>
      <button class="nav-category-toggle" type="button" aria-label="Open ${c.name} subcategories">⌄</button>
      <div class="nav-submenu">
        ${c.subs.map(s=>`<a href="${prefix}subcategories/${c.slug}/${slugify(s)}.html">${s}</a>`).join('')}
        <a class="nav-all" href="${prefix}categories/${c.slug}.html">View all ${c.name} →</a>
      </div>
    </div>`).join('');

  root.querySelectorAll('.nav-category-toggle').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const parent=btn.closest('.nav-category');
      root.querySelectorAll('.nav-category.open').forEach(x=>{if(x!==parent)x.classList.remove('open')});
      parent.classList.toggle('open');
    });
  });
}

/* Build the mobile accordion separately. Each category has its own five
   subcategories, so the user never sees every category in one giant panel. */
function buildMobileCategoryNav({rootId='mobileCategoryNav',prefix=''}={}){
  const root=document.getElementById(rootId);
  if(!root) return;
  root.innerHTML = `<a class="mobile-home" href="${prefix}index.html">Home</a>` + FYNVERA_CATEGORIES.map(c=>`
    <div class="mobile-category">
      <div class="mobile-category-head">
        <a href="${prefix}categories/${c.slug}.html">${c.name}</a>
        <button type="button" aria-label="Open ${c.name} subcategories">⌄</button>
      </div>
      <div class="mobile-submenu">
        ${c.subs.map(s=>`<a href="${prefix}subcategories/${c.slug}/${slugify(s)}.html">${s}</a>`).join('')}
      </div>
    </div>`).join('');

  root.querySelectorAll('.mobile-category-head button').forEach(btn=>btn.addEventListener('click',()=>{
    const p=btn.closest('.mobile-category');
    root.querySelectorAll('.mobile-category.open').forEach(x=>{if(x!==p)x.classList.remove('open')});
    p.classList.toggle('open');
  }));
}

/* Homepage category ribbon. Crypto is intentionally absent from this data set. */
const ribbon=document.getElementById('categoryRibbon');
if(ribbon){
  ribbon.innerHTML=FYNVERA_CATEGORIES.map(c=>`<a class="cat-link" href="categories/${c.slug}.html"><div class="cat-icon">${c.icon}</div><h3>${c.name}</h3><p>${c.short}</p></a>`).join('');
}

/* Full category grid with all five clickable subcategories. */
const catGrid=document.getElementById('categoryGrid');
if(catGrid){
  catGrid.innerHTML=FYNVERA_CATEGORIES.map((c,i)=>`<article class="category-card">
    <div class="num">${String(i+1).padStart(2,'0')} / CATEGORY</div>
    <h3>${c.name}</h3><p>${c.desc}</p>
    <div class="chips">${c.subs.map(s=>`<a href="subcategories/${c.slug}/${slugify(s)}.html">${s}</a>`).join('')}</div>
    <a class="card-link" href="categories/${c.slug}.html">Open ${c.name} →</a>
  </article>`).join('');
}

/* Browser-local content storage for the free starter publisher. */
function getArticles(){
  try{return [...JSON.parse(localStorage.getItem('fynvera_articles')||'[]'),...FYNVERA_ARTICLES]}
  catch(e){return FYNVERA_ARTICLES}
}
function savedIds(){
  try{return JSON.parse(localStorage.getItem('fynvera_saved')||'[]')}
  catch(e){return []}
}
function saveArticle(id){
  const ids=savedIds();
  const next=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];
  localStorage.setItem('fynvera_saved',JSON.stringify(next));
  document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>b.textContent=next.includes(id)?'Saved ✓':'Save');
}

/* Article card. Images intentionally fail safely to a styled placeholder. */
function card(a){
  const id=a.id, saved=savedIds().includes(id);
  return `<article class="article-card">
    <!-- IMAGE PLACEHOLDER: Put your generated image at the article.image path. -->
    <div class="article-image" style="background-image:linear-gradient(135deg,rgba(10,53,90,.10),rgba(26,106,232,.40)),url('${a.image}');background-size:cover;background-position:center">ARTICLE IMAGE</div>
    <div class="article-body">
      <div class="meta"><span class="tag">${a.cat||a.category}</span><span>•</span><span>${a.date}</span><span>•</span><span>${a.read||'6 min'}</span></div>
      <h3><a href="article.html?id=${encodeURIComponent(id)}">${a.title}</a></h3>
      <p>${a.excerpt||''}</p>
      <div style="display:flex;gap:8px;align-items:center;margin-top:12px">
        <a class="card-link" href="article.html?id=${encodeURIComponent(id)}">Read →</a>
        <button class="save-btn" data-save="${id}" onclick="saveArticle('${id}')">${saved?'Saved ✓':'Save'}</button>
      </div>
    </div>
  </article>`;
}

/* Homepage latest articles. */
const latest=document.getElementById('latestArticles');
if(latest){getArticles().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3).forEach(a=>latest.insertAdjacentHTML('beforeend',card(a)));}

/* Article library with search and URL query support. */
const library=document.getElementById('articleLibrary'),search=document.getElementById('articleSearch');
function renderLibrary(q=''){
  if(!library)return;
  const x=q.toLowerCase();
  const items=getArticles().filter(a=>!x||`${a.title} ${a.cat||a.category} ${a.excerpt}`.toLowerCase().includes(x)).sort((a,b)=>b.date.localeCompare(a.date));
  library.innerHTML=items.map(card).join('')||'<p class="muted">No matching articles.</p>';
}
const initialQ=new URLSearchParams(location.search).get('q')||'';
if(search)search.value=initialQ;
renderLibrary(initialQ);
if(search)search.oninput=()=>renderLibrary(search.value);

/* Article page. */
const detail=document.getElementById('articleContent');
if(detail){
  const id=new URLSearchParams(location.search).get('id');
  const a=getArticles().find(x=>x.id===id);
  if(!a){detail.innerHTML='<h1>Article not found</h1><p class="muted">Return to the article library.</p>'}
  else{
    document.title=`${a.title} | Fynvera`;
    detail.innerHTML=`<div class="page-hero"><div class="eyebrow">${a.cat||a.category} • ${a.date} • ${a.read||'6 min'}</div><h1>${a.title}</h1><p class="muted">${a.excerpt||''}</p></div><div class="article-hero" style="background-image:linear-gradient(135deg,#d5e6f7,#b5d0e8),url('${a.image}');background-size:cover;background-position:center">ARTICLE HERO IMAGE</div><article><p>This starter article is ready for your original content. Replace the body with your researched article, add internal links to related Fynvera pages, and cite current sources when discussing time-sensitive information.</p><h2>Why this topic matters</h2><p>Keep definitions, data and interpretation distinct. Explain the core concept first, then connect it to practical examples and related topics.</p><h2>Explore more on Fynvera</h2><p><a class="card-link" href="categories/${slugify(a.cat||a.category)}.html">Browse ${a.cat||a.category} →</a></p><div class="callout">Fynvera provides general educational information and does not provide personalised investment or financial advice.</div></article>`;
  }
}

/* Start the per-category desktop/mobile menus wherever their mount points exist. */
buildCategoryNav({rootId:'categoryNav',prefix:''});
buildMobileCategoryNav({rootId:'mobileCategoryNav',prefix:''});

/* Workspace session helper. */
function currentUser(){
  try{return JSON.parse(localStorage.getItem('fynvera_user')||'null')}
  catch(e){return null}
}
function requireSession(){
  if(!localStorage.getItem('fynvera_session')) location.href='../login.html';
}
