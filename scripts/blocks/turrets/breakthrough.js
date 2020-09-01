const customLaser=extend(BasicBulletType,{
  tmpColor:new Color(),
  colors:[Color.valueOf("6464ff55"),Color.valueOf("6464ffaa"),Color.valueOf("5078ff"),Color.white],
  tscales:[1,0.7,0.5,0.2],
  strokes:[4,3,2,0.6],
  lenscales:[1,1.12,1.15,1.17],
  length:280,
  update(b){
    if(b==null) return;
    if(b.timer.get(1,5)){
      Damage.collideLine(b,b.getTeam(),this.hitEffect,b.x+3*Mathf.sinDeg(b.rot()),b.y+3*Mathf.cosDeg(b.rot()),b.rot(),this.length,true);
      Damage.collideLine(b,b.getTeam(),this.hitEffect,b.x-3*Mathf.sinDeg(b.rot()),b.y-3*Mathf.cosDeg(b.rot()),b.rot(),this.length,true);
    }
    Effects.shake(1,1,b.x,b.y);
  },
  hit(b,hitx,hity){
    Effects.effect(this.hitEffect,this.colors[2],hitx!=null?hitx:b.x,hity!=null?hity:b.y);
    if(Mathf.chance(0.4)){
      Fire.create(Vars.world.tileWorld(hitx+Mathf.range(5),hity+Mathf.range(5)));
    }
  },
  draw(b){
    var baseLen=this.length*b.fout();
    Lines.lineAngle(b.x,b.y,b.rot(),baseLen);
    for(var s=0;s<this.colors.length;s++){
      Draw.color(this.tmpColor.set(this.colors[s]).mul(1+Mathf.absin(Time.time(),1,0.1)));
      for(var i=0;i<this.tscales.length;i++){
        Tmp.v1.trns(b.rot()+180,(this.lenscales[i]-1)*35);
        Lines.stroke((9+Mathf.absin(Time.time(),0.8,1.5))*b.fout()*this.strokes[s]*this.tscales[i]);
        Lines.lineAngle(b.x+Tmp.v1.x,b.y+Tmp.v1.y,b.rot(),baseLen*this.lenscales[i],CapStyle.none);
      }
    }
    Draw.reset();
  }
});
customLaser.hitEffect=Fx.hitMeltdown;
customLaser.despawnEffect=Fx.none;
customLaser.hitSize=14;
customLaser.drawSize=420;
customLaser.lifetime=16;
customLaser.pierce=true;
customLaser.damage=100;
customLaser.collidesTiles=false;
customLaser.speed=0.001;
const breakthrough=extendContent(LaserTurret,"breakthrough",{
  update(tile){
    const entity=tile.ent();
    this.super$update(tile);
    if(entity.target==null&&!this.shouldActiveSound(tile)){
      if(entity.reload<40){
        var liquid=entity.liquids.current();
        var maxUsed=this.consumes.get(ConsumeType.liquid).amount;
        var used=this.baseReloadSpeed(tile)*(tile.isEnemyCheat()?maxUsed:Math.min(entity.liquids.get(liquid),maxUsed*Time.delta()))*liquid.heatCapacity*this.coolantMultiplier;
        entity.reload+=used;
        entity.liquids.remove(liquid,used);
        if(Mathf.chance(0.06*used)){
          Effects.effect(this.coolEffect,tile.drawx()+Mathf.range(this.size*Vars.tilesize/2),tile.drawy()+Mathf.range(this.size*Vars.tilesize/2));
        }
      }
    }
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



breakthrough.shootType=customLaser
breakthrough.shootEffect=Fx.shootBigSmoke2;
breakthrough.shootCone=40;
breakthrough.recoil=2;
breakthrough.size=6;
breakthrough.shootShake=2;
breakthrough.range=240;
breakthrough.reload=80;
breakthrough.firingMoveFract=0.4;
breakthrough.shootDuration=240;
breakthrough.powerUse=20;
breakthrough.shootSound=Sounds.laserbig;
breakthrough.activeSound=Sounds.beam;
breakthrough.activeSoundVolume=2;
breakthrough.health=5400;
breakthrough.consumes.add(new ConsumeLiquidFilter(boolf(liquid=>liquid.temperature<=0.5&&liquid.flammability<0.1),0.5)).update(false);
