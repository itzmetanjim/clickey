console.log("Clickey: Loading... ");
basicc = ()=>{return Array.from(document.querySelectorAll("a[href],button,input[type='button'],input[type='submit'],input[type='image'],input,[role='button'],[role='link'],[onclick],[tabindex]:not([tabindex='-1'])"))}
visibleEnabled=(e)=>{
    if(!(e instanceof Element)) return false;
    style=window.getComputedStyle(e)
    if(style.display==="none"||style.visibility==="hidden"||/*style.opacity==="0"||*/style.pointerEvents==="none") return false;
    if(parseFloat(style.opacity)===0) return false;
    const rect=e.getBoundingClientRect()
    if(rect.width<=0||rect.height<=0)return false;
    const vh=window.innerHeight||document.documentElement.clientHeight;
    const vw=window.innerWidth||document.documentElement.clientWidth;
    if(rect.bottom<0||rect.top>vh||rect.right<0||rect.left>vw)return false;
    return true;
}

spir=(rect,gridsize=1,ins=0.05)=>{
    let points=[]
    const w=rect.width
    const h=rect.height
    const ic=Math.max(0,Math.min(0.5,ins))
    const sx=rect.left+(w)*(ic)
    const sy=rect.top+(h)*(ic)
    const ex=rect.right-(w)*(ic)
    const ey=rect.bottom-(h)*(ic)
    if(gridsize===1){points.push({x:rect.left+w/2,y:rect.top+h/2});return points;}
    for(let r=0;r<gridsize;r++){for(let c=0;c<gridsize;c++){
        const fx=c/(gridsize-1)
        const fy=r/(gridsize-1)
        const px=sx+fx*(ex-sx)
        const py=sy+fy*(ey-sy)
        points.push({x:px,y:py})
    }}
    return points;
}//SPIR: sample points in rectangle
itap=(e,x,y)=>{
    let top=document.elementFromPoint(x,y);
    if(!top)return false;
    return (top===e)||e.contains(top);
}//ITAP: is top at point
//---//
topscore=(el, { gridSize = 5, inset = 0.05, threshold = 0.3 } = {})=>{
    const rect=el.getBoundingClientRect()
    const points=spir(rect,gridSize,inset)
    const vw=window.innerWidth||document.documentElement.clientWidth
    const vh=window.innerHeight||document.documentElement.clientHeight
    let hit=0
    let val=0
    for(const p of points){if(p.x<0||p.x>vw||p.y<0||p.y>vh)continue;val++
                           if(itap(el,p.x,p.y)){hit++}}
    if(val===0){return false;}
    score=hit/val
    if (score>=threshold) {return true}
    return false
}

///---///
findVisibleClickable=(options={})=>{
    const { gridSize = parseInt(window.localStorage.getItem('clickeyConfigGridSize'))||1, threshold = parseFloat(window.localStorage.getItem('clickeyConfigThreshold')||1.0), inset = parseFloat(window.localStorage.getItem('clickeyConfigInset')||0.05) } = options;
    const nodes=[];
    for(const i of basicc()){
        if(!visibleEnabled(i))continue;
        if(!topscore(i,{gridSize,threshold,inset}))continue;
        nodes.push(i);
    }
    return nodes;
}
window.findVisibleClickable=findVisibleClickable;
console.log(findVisibleClickable)
appendBadge=(e,text)=>{
    const badge = document.createElement('span');
    badge.className='clickey-badge'
    badge.style.position='absolute'
    badge.style.backgroundColor='rgba(227, 76, 38,0.75)'
    badge.style.color='white'
    badge.style.top='0px'
    badge.style.right='0px'
    badge.style.fontSize='10px'
    badge.style.width='fit-content'
    badge.style.height='fit-content'
    badge.style.fontFamily='monospace'
    
    badge.style.padding='2px'
    badge.style.borderRadius='3px'
    badge.style.zIndex='9999'
    badge.style.pointerEvents="none"
    badge.innerText=text;
    e.style.position=(window.getComputedStyle(e).position==='static')?'relative':window.getComputedStyle(e).position;
    e.appendChild(badge)
}
clearBadges=()=>{document.querySelectorAll('.clickey-badge').forEach(e=>e.remove())}
window.clickeyBuffer="";
window.clickeyElems=[];
window.addEventListener('keydown',(e)=>{
    if(e.key==="Escape"){clearBadges();window.clickeyBuffer="";window.clickeyElems=[];return;}
    if(['0','1','2','3','4','5','6','7','8','9'].includes(e.key)){
        window.clickeyBuffer+=e.key;
        if(window.clickeyBuffer.length>=`${window.clickeyElems.length-1}`.length){
            if(parseInt(window.clickeyBuffer)>=window.clickeyElems.length){
                clearBadges();
                window.clickeyBuffer="";
                window.clickeyElems=[];
                e.preventDefault();
                return;
            }
            window.clickeyElems[parseInt(window.clickeyBuffer)].click();
            clearBadges();
            window.clickeyBuffer="";
            window.clickeyElems=[];
            e.preventDefault();
        }
    }
    matches=e.key==(window.localStorage.getItem('clickeyConfigHotkey')||'m')&&
            (e.ctrlKey===((window.localStorage.getItem('clickeyConfigHotkeyCtrl')||'true')==='true'))&&
            (e.altKey===((window.localStorage.getItem('clickeyConfigHotkeyAlt')||'false')==='true'))&&
            (e.shiftKey===((window.localStorage.getItem('clickeyConfigHotkeyShift')||'false')==='true'))&&
            (e.metaKey===((window.localStorage.getItem('clickeyConfigHotkeyMeta')||'false')==='true'));
    if(!matches)return;
    if(window.localStorage.getItem('clickeyConfigHotkeyPreventDefault')==='true'){e.preventDefault();}
    clearBadges();
    window.clickeyElems=findVisibleClickable()/*basicc()*/;
    window.clickeyElems.forEach((el,idx)=>{
        appendBadge(el,idx.toString().padStart(`${window.clickeyElems.length-1}`.length,'0'));
    })
})

console.log("Clickey: Loaded ");
//its done!