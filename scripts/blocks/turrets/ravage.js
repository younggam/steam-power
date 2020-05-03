if (typeof(floatc2)== "undefined"){
	const floatc2 = method => new Floatc2(){get : method};
}
const plasmaBoom1=newEffect(48,e=>{
  Draw.color(Color.white);
  Lines.stroke(e.fout()*2)
  Angles.randLenVectors(e.id,30,e.finpow()*60,e.rotation,360,floatc2((x,y)=>{
    var ang=Mathf.angle(x,y);
    Lines.lineAngle(e.x+x,e.y+y,ang,e.fout()*4+1);
  }))
})
const plasmaBoom2=newEffect(48,e=>{
  Draw.color(Color.valueOf("f4ba6e"));
  Lines.stroke(e.fout()*2)
  Angles.randLenVectors(e.id,30,e.finpow()*60,e.rotation,360,floatc2((x,y)=>{
    var ang=Mathf.angle(x,y);
    Lines.lineAngle(e.x+x,e.y+y,ang,e.fout()*4+1);
  }))
})
const plasma1=extend(FlakBulletType,{
  vec:new Vec2(),
  cColors:[Pal.lancerLaser.cpy().mul(1,1,1,0.4),Pal.lancerLaser,Color.white],
  cScales:[1,0.7,0.4],
  draw(b){
    for(var i=0;i<this.cColors.length;i++){
      Draw.color(this.cColors[i]);
      Fill.circle(b.x,b.y,this.splashDamageRadius*this.cScales[i]*(0.4+0.6*b.fin()));
    }
  },
  hit(b,hitx,hity){
    if(b==null) return;
    x=hitx==null?b.x:hitx;
    y=hity==null?b.y:hity;
    Effects.effect(plasmaBoom1,b.x,b.y,b.rot());
    this.hitSound.at(b,1/Math.pow(2,1));
    Fire.create(Vars.world.tileWorld(hitx+Mathf.range(5),hity+Mathf.range(5)));
    Damage.damage(b.getTeam(),x,y,1.6*this.splashDamageRadius*(0.4+0.6*b.fin()),this.splashDamage*b.damageMultiplier()/(0.4+0.6*b.fin()));
  },
  despawned(b){
    if(b==null) return;
    this.hit(b);
  },
  update(b){
    if(b==null) return;
    this.vec.trns(b.rot(),this.speed*4);
    if(Mathf.chance(0.4*Time.delta())) Lightning.createLighting(Lightning.nextSeed(),b.getTeam(),Pal.lancerLaser,8,b.x+this.vec.x,b.y+this.vec.y,Mathf.random(360),Math.floor(0.4*this.splashDamageRadius*(0.3+0.7*b.fin())));
    try {
      if(b.timer.get(2,6)){
        Units.nearbyEnemies(b.getTeam(),this.rect.setSize(this.splashDamageRadius*1.8*(0.4+0.6*b.fin())).setCenter(b.x,b.y),cons((unit)=>{
          try{
            if(unit.dst(b)<this.splashDamageRadius*1.8*(0.4+0.6*b.fin())){
              b.setData(0);
              Time.run(5,run(()=>{
                try {this.despawned(b);
                  b.remove();}
                catch(e){}
              }))
            }
          } catch(e) {return;}
          }))
      }
    }catch(e) {return;}
  }
});
plasma1.speed=2;
plasma1.damage=0;
plasma1.knockback=2;
plasma1.lifetime=160;
plasma1.splashDamageRadius=30;
plasma1.splashDamage=240;
plasma1.hitSound=Sounds.artillery;
plasma1.ammoMultiplier=1;
const plasma2=extend(FlakBulletType,{
  vec:new Vec2(),
  cColors:[Color.valueOf("f4ba6e").cpy().mul(1,1,1,0.4),Color.valueOf("f4ba6e"),Color.white],
  cScales:[1,0.7,0.4],
  draw(b){
    for(var i=0;i<this.cColors.length;i++){
      Draw.color(this.cColors[i]);
      Fill.circle(b.x,b.y,this.splashDamageRadius*this.cScales[i]*(0.4+0.6*b.fin()));
    }
  },
  hit(b,hitx,hity){
    if(b==null) return;
    x=hitx==null?b.x:hitx;
    y=hity==null?b.y:hity;
    Effects.effect(plasmaBoom2,b.x,b.y,b.rot());
    this.hitSound.at(b,1/Math.pow(2,1));
    Fire.create(Vars.world.tileWorld(hitx+Mathf.range(5),hity+Mathf.range(5)));
    Damage.damage(b.getTeam(),x,y,1.6*this.splashDamageRadius*(0.4+0.6*b.fin()),this.splashDamage*b.damageMultiplier()/(0.4+0.6*b.fin()));
  },
  despawned(b){
    if(b==null) return;
    this.hit(b);
  },
  update(b){
    if(b==null) return;
    this.vec.trns(b.rot(),this.speed*4);
    if(Mathf.chance(0.4*Time.delta())) Lightning.createLighting(Lightning.nextSeed(),b.getTeam(),Color.valueOf("f4ba6e"),8,b.x+this.vec.x,b.y+this.vec.y,Mathf.random(360),Math.floor(0.4*this.splashDamageRadius*(0.3+0.7*b.fin())));
    try {
      if(b.timer.get(2,6)){
        Units.nearbyEnemies(b.getTeam(),this.rect.setSize(this.splashDamageRadius*1.8*(0.4+0.6*b.fin())).setCenter(b.x,b.y),cons((unit)=>{
          try{
            if(unit.dst(b)<this.splashDamageRadius*1.8*(0.4+0.6*b.fin())){
              b.setData(0);
              Time.run(5,run(()=>{
                try {this.despawned(b);
                  b.remove();}
                catch(e){}
              }))
            }
          } catch(e) {return;}
          }))
      }
    }catch(e) {return;}
  }
});
plasma2.speed=2;
plasma2.damage=0;
plasma2.knockback=2;
plasma2.lifetime=160;
plasma2.splashDamageRadius=30;
plasma2.splashDamage=600;
plasma2.hitSound=Sounds.artillery;
const ravage=extendContent(ItemTurret,"ravage",{
  vec:new Vec2(),
  powerUse:4.5,
  cColors1:[Pal.lancerLaser.cpy().mul(1,1,1,0.4),Pal.lancerLaser,Color.white],
  cColors2:[Color.valueOf("f4ba6e").cpy().mul(1,1,1,0.4),Color.valueOf("f4ba6e"),Color.white],
  cScales:[1,0.9,0.8],
  soundTimer:0,
  init(){
    this.hasPower=true;
    this.consumes.powerCond(this.powerUse,boolf(entity=>entity.tile.entity!=null?entity.tile.entity.target!=null:false));
    this.ammo(Items.graphite,plasma1,Items.phasefabric,plasma2);
    this.super$init();
    this.soundTimer=this.timers++;
  },
  baseReloadSpeed(tile){
    return tile.isEnemyCheat()?1:tile.entity.power.status;
  },
  drawLayer(tile){
    const entity=tile.ent();
    this.tr2.trns(entity.rotation,-entity.recoil);
    this.vec.trns(entity.rotation,Vars.tilesize*this.size/2);
    this.drawer.get(tile,entity);
    this.heatDrawer.get(tile,entity);
    Draw.rect(Core.atlas.find(this.name+"-barrel"),tile.drawx()+2*this.tr2.x,tile.drawy()+2*this.tr2.y,entity.rotation-90);
    if(this.hasAmmo(tile)&&entity.target!=null&&entity.cons.valid()){
      var fin=entity.reload/this.reload;
      var afin=10*fin-Math.floor(10*fin);
      if(entity.timer.get(this.soundTimer,20)) Sounds.message.at(tile,1/Math.pow(2,22/12));
      for(var i=0;i<this.cColors1.length;i++){
        Draw.color(this.peekAmmo(tile).splashDamage==240?this.cColors1[i]:this.cColors2[i]);
        Fill.circle(tile.drawx()+this.vec.x+this.tr2.x,tile.drawy()+this.vec.y+this.tr2.y,this.peekAmmo(tile).splashDamageRadius*this.cScales[i]*(Math.max(fin-0.2,0))*0.5);
      }
      var bfin=(Time.time()%this.reload)/this.reload;
      var cfin=10*bfin-Math.floor(10*bfin);
      Angles.randLenVectors(Math.floor(10*bfin),18,18*(1-cfin),entity.rotation,360,floatc2((x,y)=>{
        var ang=Mathf.angle(x,y);
        Lines.lineAngle(tile.drawx()+this.vec.x+this.tr2.x+x,tile.drawy()+this.vec.y+this.tr2.y+y,ang,(1-cfin)*4+1);
      }))
    }
  },
});
ravage.heatColor=Color.red;
ravage.shootSound=Sounds.release;
