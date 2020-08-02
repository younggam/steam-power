const phaseRay=extend(BasicBulletType,{
  rays:1,
  rayLength:Blocks.fuse.range+10,
  init(b){
    if (b==null) return;
    for(var i=0;i<this.rays;i++){
      Damage.collideLine(b,b.getTeam(),this.hitEffect,b.x,b.y,b.rot(),this.rayLength-Math.abs(i-(this.rays/2))*20);
    }
  },
  draw(b){
    Draw.color(Color.white,Color.valueOf("f4ba6e"),b.fin());
    for(var i=0;i<7;i++){
      Tmp.v1.trns(b.rot(),i*8);
      var s1=Mathf.clamp(b.fout()-0.5)*(80-i*10);
      Drawf.tri(b.x+Tmp.v1.x,b.y+Tmp.v1.y,4,s1,b.rot()+90);
      Drawf.tri(b.x+Tmp.v1.x,b.y+Tmp.v1.y,4,s1,b.rot()-90);
    }
    Drawf.tri(b.x,b.y,20*b.fout(),this.rayLength+50,b.rot());
    Drawf.tri(b.x,b.y,20*b.fout(),10,b.rot()+180);
    Draw.reset();
  }
});
phaseRay.hitEffect=Fx.hitLancer;
phaseRay.shootEffect=Fx.lightningShoot;
phaseRay.smokeEffect=Fx.lightningShoot;
phaseRay.lifetime=10;
phaseRay.despawnEffect=Fx.none;
phaseRay.pierce=true;
phaseRay.speed=0.01;
phaseRay.damage=245;
furnaces=this.global.furnaces
const initializer=extendContent(Block,"initializer",{
  init(){
    this.super$init();
    Blocks.fuse.ammo.put(Items.phasefabric,phaseRay);
  },
});
/*initializer.requirements(Category.turret,ItemStack.with(Items.copper,1));
initializer.update=true;
initializer.sync=true;
initializer.solid=true;*/
Bullets.standardDense.damage=22;
Bullets.standardIncendiary.damage=13;
Bullets.standardHoming.damage=11;
Bullets.basicFlame.damage=7;
Bullets.pyraFlame.damage=11;
Bullets.artilleryDense.splashDamage=39;
Bullets.artilleryHoming.splashDamage=39;
Bullets.artilleryIncendiary.splashDamage=36;
Bullets.slagShot.damage=5;
Bullets.missileExplosive.splashDamage=36;
Bullets.missileIncendiary.splashDamage=14;
Bullets.missileSurge.splashDamage=27;
Bullets.standardThorium.damage=35;
Bullets.artilleryExplosive.splashDamage=60;
Bullets.artilleryPlastic.splashDamage=54;
Bullets.flakExplosive.splashDamage=18;
Bullets.flakPlastic.splashDamage=30;
Bullets.flakSurge.splashDamage=39;
Bullets.standardDenseBig.damage=50;
Bullets.standardIncendiaryBig.damage=46;
Bullets.standardThoriumBig.damage=78;
