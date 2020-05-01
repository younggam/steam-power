const plasma=extend(FlakBulletType,{
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
    Effects.effect(this.hitEffect,x,y,b.rot());
    this.hitSound.at(b);
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
                catch(e){print("c");}
              }))
            }
          } catch(e) {
            pirnt("b");
            return;}
          }))
      }
    }catch(e) {
      print("a");
      return;}
  }
});
plasma.speed=2;
plasma.damage=0;
plasma.hitEffect=Fx.hitLancer;
plasma.knockback=2;
plasma.lifetime=135;
plasma.splashDamageRadius=30;
plasma.splashDamage=800;
const ravage=extendContent(ItemTurret,"ravage",{
  powerUse:4.5,
  init(){
    this.hasPower=true;
    this.consumes.powerCond(this.powerUse,boolf(entity=>entity.tile.entity!=null?entity.tile.entity.target!=null:false));
    this.ammo(Items.phasefabric,plasma);
    this.super$init();
  },
  baseReloadSpeed(tile){
    return tile.isEnemyCheat()?1:tile.entity.power.status;
  },
  drawLayer(tile){
    const entity=tile.ent();
    this.tr2.trns(entity.rotation,-entity.recoil);
    this.drawer.get(tile,entity);
    this.heatDrawer.get(tile,entity);
    Draw.rect(Core.atlas.find(this.name+"-barrel"),tile.drawx()+2*this.tr2.x,tile.drawy()+2*this.tr2.y,entity.rotation-90);
  },
  update(tile){
    /*if(tile.entity.getShield()==null) {
      tile.entity.setShield(extendContent(ForceProjector.ShieldEntity,this,{}));
      tile.entity.getShield().add();
      print(tile.entity.getShield());
    }*/
    this.super$update(tile);
  },
  shoot(tile,ammo){
    this.super$shoot(tile,ammo);
  }
});
ravage.entityType=prov(()=>extendContent(ItemTurret.ItemTurretEntity,ravage,{
  getShield(){
    return this._shield;
  },
  setShield(a){
    return this._shield;
  },
  _shield:null,
  getLifeScl(){
    return this._lifeScl;
  },
  setLifeScl(b){
    this._lifeScl.unshift(b);
  },
  _lifeScl:[],
  _lifeSclLen:0,
}));
ravage.heatColor=Color.red;
