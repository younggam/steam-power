if(typeof(newEffectDst)=="undefined"){
  function newEffectDst(lifetime,dst,renderer){
    return new Effects.Effect(lifetime,dst,new Effects.EffectRenderer({render:renderer}));
  }
}
const boom=newEffectDst(80,480,e=>{
  const scale=e.data.splashDamageRadius;
  const scaleCen=[scale*0.5*0.4,scale*0.5*0.7,scale*0.5];
  const colorCen=[Color.yellow,Color.valueOf("ffa500d4"),Color.valueOf("ff0000a9")];
  const colorSmoke=[Color.valueOf("646464a9"),Color.valueOf("787878d4")];
  for(var i=scaleCen.length-1;i>=0;i--){
      Draw.color(colorCen[i]);
      Fill.circle(e.x,e.y,e.fslope()*scaleCen[i]);
  }
  for(var i=0;i<colorSmoke.length;i++){
    Draw.color(colorSmoke[i]);
    Lines.stroke(e.fin()*scale/ (16*(0.5+i)) );
    Lines.circle(e.x,e.y,e.finpow()*scale);
  }
  for(var i=0;i<colorSmoke.length;i++){
    Draw.color(colorSmoke[i]);
    Lines.stroke(Math.max(e.fin()-0.2,0)*scale/ (16*(0.5+i)) );
    Lines.circle(e.x,e.y,Math.max(e.finpow()-0.2,0)*scale);
  }
});
const launch=newEffect(120,e=>{
  const scale=40;
  const colorSmoke=[Color.valueOf("646464a9"),Color.valueOf("787878d4")];
  const launchScales=[6,5,4.5,3];
  const colorLaunch=[Color.valueOf("ff0000a9"),Color.valueOf("ffa500d4"),Color.valueOf("646464"),Color.valueOf("787878")];
  for(var i=0;i<colorLaunch.length;i++){
    Draw.color(colorLaunch[i]);
    Fill.circle(e.x,e.y,(i<=1?0.95+Mathf.absin(e.time,1,0.1):1)*(0.5+0.5*e.fout())*launchScales[i]);
  }
  var actualFin=10*e.finpow()-Math.floor(10*e.finpow());
  for(var i=0;i<colorSmoke.length;i++){
    Draw.color(colorSmoke[i]);
    Lines.stroke(actualFin*scale/(6*(0.5+i)));
    Lines.circle(e.x,e.y,actualFin*scale);
  }
  for(var i=0;i<colorSmoke.length;i++){
    Draw.color(colorSmoke[i]);
    Lines.stroke(Math.max(actualFin-0.2,0)*scale/ (16*(0.5+i)) );
    Lines.circle(e.x,e.y,Math.max(actualFin-0.2,0)*scale);
  }
  if(actualFin<=0.2) Sounds.respawn.at(e.data);
});
const launchpad=extendContent(ItemTurret,"launchpad",{
  placed(tile){
    this.super$placed(tile);
    tile.entity.setTargetSpot(tile);
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.booster);
  },
  setBars(){
    this.super$setBars();
    this.bars.remove("liquid");
    this.bars.remove("items");
  },
  acceptLiquid(tile,source,liquid,amount){
    return false;
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    var group=new ButtonGroup();
    group.setMinCheckCount(0);
    group.setMaxCheckCount(-1);
    for(var i=0;i<2;i++){
      (function (i,tile){
        var button=table.addImageButton(i==0?Vars.ui.getIcon("command"+Strings.capitalize(UnitCommand.rally.name())):Icon.settings,Styles.clearToggleTransi,run(()=>tile.configure(i))).size(44).group(group).update(cons(b=>b.setChecked(entity.getLaunchInterval()>0&&i==0?true:entity.getToggle()==1&&entity.getToggle()==i?true:false)));
      })(i,tile)
    }
  },
  configured(tile,player,value){
    const entity=tile.ent();
    entity.setToggle(value==0&&entity.getLaunchInterval()>0?-1:value);
  },
  onConfigureTileTapped(tile,other){
    const entity=tile.ent();
    if(entity.getToggle()!=1) return this.super$onConfigureTileTapped(tile,other);
    entity.setToggle(-1);
    entity.setTargetSpot(other);
    return true;
  },
  update(tile){
    const entity=tile.ent();
    entity.timerLaunchInterval();
    entity.heat=Mathf.lerpDelta(entity.heat,0,1/120);
    entries=entity.getLaunchTimer().length;
    for(var i=0;i<entries;i++){
      entity.getLaunchTimer()[i]-=Time.delta();
    }
    if(entity.getToggle()==0) {
      entity.setToggle(-1);
      if(this.hasAmmo(tile)){
        Effects.effect(launch,tile.drawx(),tile.drawy(),0,tile);
        entity.heat=1;
        entity.setLaunchInterval(120);
        const spot=entity.getTargetSpot();
        const type=this.useAmmo(tile);
        entity.getLaunchEntry().unshift(type);
        entity.getLaunchEntry().unshift(spot);
        entity.getLaunchTimer().unshift(this.reload);
      }
    }
    if(entity.getLaunchTimer()[entries-1]<=0){
      var tilex=entity.getLaunchEntry()[entries*2-2].worldx();
      var tiley=entity.getLaunchEntry()[entries*2-2].worldy();
      var radius=entity.getLaunchEntry()[entries*2-1].splashDamageRadius;
      Sounds.explosionbig.at(entity.getLaunchEntry()[entries*2-2]);
      entity.getLaunchTimer().splice(entries-1,1);
      Damage.damageUnits(tile.getTeam(),tilex,tiley,radius,0,boolf(e=>{return Mathf.dst(tilex,tiley,e.x,e.y)<=radius}),cons((e2)=>{e2.damage(entity.getLaunchEntry()[entries*2-1].splashDamage*Mathf.lerp(1-Mathf.dst(tilex,tiley,e2.getX(),e2.getY())/radius,1,0.4))}));
      var trad=Math.floor(radius/Vars.tilesize);
      for(var dx=-trad;dx<=trad;dx++){
        for(var dy=-trad;dy<=trad;dy++){
          var _tile=Vars.world.tile(Math.round(tilex/Vars.tilesize)+dx,Math.round(tiley/Vars.tilesize)+dy);
          if(_tile!=null&&_tile.entity!=null&&(tile.getTeam()==null||Vars.state.teams.areEnemies(tile.getTeam(),_tile.getTeam()))&&Mathf.dst(dx,dy)<=trad){
            _tile.entity.damage(entity.getLaunchEntry()[entries*2-1].splashDamage*Mathf.lerp(1-Mathf.dst(tilex,tiley,_tile.worldx(),_tile.worldy())/radius,1,0.4));
          }
        }
      }
      Effects.effect(boom,tilex,tiley,0,entity.getLaunchEntry()[entries*2-1]);
      entity.getLaunchEntry().splice(entries*2-2,2);
    }
  },
  drawSelect(tile){
    const entity=tile.ent();
    Drawf.dashCircle(entity.getTargetSpot().worldx(),entity.getTargetSpot().worldy(),10,tile.getTeam().color);
    if(this.hasAmmo(tile)) Drawf.dashCircle(entity.getTargetSpot().worldx(),entity.getTargetSpot().worldy(),this.peekAmmo(tile).splashDamageRadius,tile.getTeam().color);
    if(entity.getLaunchTimer()[0]!=null){
      const entries=entity.getLaunchTimer().length;
      for(var i=0;i<entries;i++){
        (function(i,tile,entity){
          Drawf.dashCircle(entity.getLaunchEntry()[i*2].worldx(),entity.getLaunchEntry()[i*2].worldy(),entity.getLaunchEntry()[i*2+1].splashDamageRadius,Color.red);
        })(i,tile,entity)
      }
    }
  },
  drawConfigure(tile){
    this.super$drawConfigure(tile);
    if(tile.entity.getToggle()==1) {
      var vec=Core.input.mouseWorld(Vars.control.input.getMouseX(),Vars.control.input.getMouseY());
      if(this.hasAmmo(tile)) Drawf.dashCircle(vec.x,vec.y,this.peekAmmo(tile).splashDamageRadius,tile.getTeam().color);
      Drawf.dashCircle(vec.x,vec.y,10,tile.getTeam().color);
    }
  },
  drawLayer(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy(),0);
    this.heatDrawer.get(tile,entity);
  },
  load(){
    this.super$load();
    this.baseRegion=Core.atlas.find(this.name+"-base");
  },
  generateIcons: function(){
    return [
      Core.atlas.find(this.name+"-base"),
      Core.atlas.find(this.name)
    ];
  }
});
launchpad.entityType=prov(()=>extendContent(ItemTurret.ItemTurretEntity,launchpad,{
  getTargetSpot(){
    return this._targetSpot;
  },
  setTargetSpot(a){
    this._targetSpot=a;
  },
  _targetSpot:null,
  getToggle(){
    return this._toggle;
  },
  setToggle(b){
    this._toggle=b;
  },
  _toggle:-1,
  getLaunchEntry(){
    return this._launchEntry;
  },
  _launchEntry:[],
  getLaunchTimer(){
    return this._launchTimer;
  },
  _launchTimer:[],
  getLaunchInterval(){
    return this._launchInterval;
  },
  setLaunchInterval(c){
    this._launchInterval=c;
  },
  timerLaunchInterval(){
    if(this._launchInterval>0) this._launchInterval-=Time.delta();
    else this._launchInterval=0;
  },
  _launchInterval:0,
  write(stream){
    this.super$write(stream);
    stream.writeShort(this._targetSpot.x);
    stream.writeShort(this._targetSpot.y);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._targetSpot=Vars.world.tile(stream.readShort(),stream.readShort());
  },
}));
launchpad.configurable=true;
launchpad.heatCons=Color.red;
