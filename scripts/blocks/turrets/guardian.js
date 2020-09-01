const floatc2=this.global.funcs.floatc2;
const cons2=this.global.funcs.cons2;
var sounds=this.global.sounds;
const draining=newEffect(20,e=>{
  Draw.color(Color.white,Color.darkGray,e.fin());
  Lines.stroke(e.fout()*2);
  Angles.randLenVectors(e.id,1,e.fin()*60,e.rotation,60,floatc2((x,y)=>{
    var len=Math.sqrt(x*x+y*y);
    x+=(len*Mathf.cosDeg(e.rotation)-x)*e.fin(),y+=(len*Mathf.sinDeg(e.rotation)-y)*e.fin();
    var ang=Mathf.angle(x,y);
    Lines.lineAngle(e.x+x,e.y+y,ang,e.fout()*4+1);
  }));
});
const drain=extend(BasicBulletType,{
  update(b){
    if(b==null) return;
    var turret=b.getOwner(),target=turret.target;
    if(target!=null&&b.timer.get(1,5)) {
      var amount=this.damage*turret.power.status;
      target.damage(amount);
      turret.addShield(amount);
      Effects.effect(draining,target.x,target.y,b.rot()+180);
      if(Mathf.chance(0.3)) sounds["laserNoise"].at(target);
    }
  },
  hit(b,x,y){

  },
  colors:[Color.valueOf("90909080"),Color.valueOf("606060c0"),Color.darkGray,Color.valueOf("303030ff")],
  strokes:[1.6,1.2,0.8,0.3],
  lenscales:[0.98,0.99,1,1.01],
  draw(b){
    var target=b.getOwner().target;
    var baseLen=b.dst(target)*b.fout();
    for(var s=0;s<4;s++){
      Draw.color(this.colors[s]);
      Lines.stroke((7+Mathf.absin(Time.time(),0.8,1.5))*b.fout()*this.strokes[s]);
      Lines.lineAngle(b.x,b.y,b.rot(),baseLen*this.lenscales[s],CapStyle.none);
    }
    Draw.reset();
  }
});
drain.pierce=true;
drain.speed=0.001;
drain.damage=20;
drain.lifetime=16;
drain.collidesAir=false;
drain.collides=false;
drain.collidesTiles=false;
const customAbsorb=newEffect(12,e=>{
  Draw.color(Pal.lancerLaser);
  var scl=32*Mathf.clamp(1+e.data[1]*0.01,1,2.5)*e.fout();
  var distort=Mathf.clamp(1.2-e.data[0]*0.000064,0.2,1);
  Draw.rect("steam-power-absorb",e.x,e.y,scl,scl*distort,e.rotation+90);
});
const guardian=extendContent(Turret,"guardian",{
  shootType:null,
  shieldRadius:128,
  absorbRegion:null,
  init(){
    this.hasPower=true;
    this.super$init();
    this.heatDrawer=cons2((tile,entity)=>{
      if(entity.heat<=0.00001) return;
      Draw.color(this.heatColor,entity.heat);
      Draw.rect(this.heatRegion,tile.drawx()+this.tr2.x,tile.drawy()+this.tr2.y,entity.rotation-90);
      Draw.color();
    });
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.reload);
    this.stats.remove(BlockStat.shots);
    this.stats.remove(BlockStat.shootRange);
    this.stats.add(BlockStat.shootRange,this.range/Vars.tilesize+"/"+this.shieldRadius/Vars.tilesize+"{0}",StatUnit.blocks.localized());
    this.stats.add(BlockStat.damage,this.shootType.damage*12,StatUnit.perSecond);
    this.stats.remove(BlockStat.powerUse);
    this.stats.add(BlockStat.powerUse,"600+0~840{0}",StatUnit.perSecond.localized());
  },
  setBars(){
    this.super$setBars();
    this.bars.add("shield",func(entity=>
      new Bar(this.name+"-shield",Pal.lancerLaser,floatp(()=>typeof entity["getShield"]!=="function"?0:entity.getShield()/840))
    ));
  },
  update(tile){
    const entity=tile.ent();
    this.super$update(tile);
    if(!entity.isUpdated()&&entity.getBullet()!=null) {
      entity.getBullet().remove();
      entity.setBullet(null);
    }
    entity.setUpdated(false);
    if(entity.onShield()){
      var radius=this.shieldRadius;
      Vars.bulletGroup.intersect(tile.drawx()-radius,tile.drawy()-radius,radius*2,radius*2,cons(trait=>{
        var dst=trait.dst2(entity);
        if(trait.canBeAbsorbed()&&trait.getTeam()!=entity.getTeam()&&dst<(radius*radius)){
          var amount=trait.getShieldDamage();
          if(amount*0.75>entity.getShield()||trait.getGroup()==null) return;
          Effects.effect(customAbsorb,trait.getX(),trait.getY(),entity.angleTo(trait),[dst,amount]);
          entity.subShield(amount);
          trait.absorb();
        }
      }));
      if(entity.timer.get(this.timerDump,5))  entity.lastShield();
    }
  },
  shieldColor:Color.valueOf("96beff"),
  shouldTurn(tile){
    return tile.ent().cons.valid();
  },
  updateShooting(tile){
    const entity=tile.ent();
    if(!entity.cons.valid())  return;
    var bullet=entity.getBullet();
    entity.setUpdated(true);
    if(bullet==null){
      this.shoot(tile,this.shootType);
    }else{
      this.tr.trns(entity.rotation,this.size*Vars.tilesize*0.4,0);
      bullet.rot(entity.rotation);
      bullet.set(tile.drawx()+this.tr.x,tile.drawy()+this.tr.y);
      bullet.time(0);
      entity.heat=1;
      entity.recoil=this.recoil;
    }
  },
  drawSelect(tile){
    this.super$drawSelect(tile);
    Drawf.dashCircle(tile.drawx(),tile.drawy(),this.shieldRadius,Pal.lancerLaser);
  },
  drawPlace(x,y,rotation,valid){
    this.super$drawPlace(x,y,rotation,valid);
    Drawf.dashCircle(x*Vars.tilesize+this.offset(),y*Vars.tilesize+this.offset(),this.shieldRadius,Pal.lancerLaser);
  },
  bullet(tile,type,angle){
    tile.ent().setBullet(Bullet.create(type,tile.entity,tile.getTeam(),tile.drawx()+this.tr.x,tile.drawy()+this.tr.y,angle));
  },
  useAmmo(tile){
    return this.shootType;
  },
  hasAmmo(tile){
    return true;
  },
  peekAmmo(tile){
    return this.shootType;
  },
  shouldActiveSound(tile){
    const entity=tile.ent();
    return typeof entity["getBullet"]==="function"&&entity.getBullet()!=null;
  },
});
guardian.entityType=prov(()=>extend(Turret.TurretEntity,{
  _bullet:null,
  setBullet(b){ this._bullet=b;},
  getBullet(){  return this._bullet;},
  _isUpdated:false,
  isUpdated(){  return this._isUpdated;},
  setUpdated(b){  this._isUpdated=b;},
  _last:0,
  getLast(){return this._last;},
  _shield:0,
  getShield(){  return this._shield;},
  onShield(){ return this._shield>0;},
  lastShield(){ this._shield=Math.max(this._shield-(Time.time()-this._last)*0.001,0);},
  addShield(a){
    this._last=Time.time();
    this._shield=Math.min(840,this._shield+a);
  },
  subShield(a){
    this._last=Time.time();
    this._shield=Math.max(this._shield-a,0);
  },
  init(tile,shouldAdd){
    if(tile.block().activeSound==Sounds.none) tile.block().activeSound=sounds["laserMain"];
    return this.super$init(tile,shouldAdd);
  },
  write(stream){
    this.super$write(stream);
    stream.writeInt(Math.ceil(this._last));
    stream.writeShort(Math.floor(this._shield));
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._last=stream.readInt();
    this._shield=stream.readShort();
  }
}));
guardian.shootType=drain;
guardian.shootSound=Sounds.none;
guardian.heatColor=Color.salmon;
guardian.rotatespeed=4;
guardian.canOverdrive=false;
guardian.activeSoundVolume=1;
guardian.consumes.add(extend(ConsumePower,{
  requestedPower(entity){
    if(typeof entity["getShield"]!=="function") return 0;
    return (entity.target!=null?10:0)+(entity.onShield()?entity.getShield()/60:0);
  }
}));
