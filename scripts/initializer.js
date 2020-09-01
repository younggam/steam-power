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
new Separator("crystallizer");
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
const stone=new Item("stone",Color.valueOf("989aa4"));
stone.type=ItemType.material;
stone.cost=0.7;
const copperOre=new Item("copper-ore",Color.valueOf("b8705c"));
copperOre.hardness=1;
const leadOre=new Item("lead-ore",Color.valueOf("6f687e"));
leadOre.hardness=1;
const ironOre=new Item("iron-ore",Color.valueOf("966e5a"));
ironOre.hardness=3;
const titaniumOre=new Item("titanium-ore",Color.valueOf("7575c8"));
titaniumOre.hardness=3;
const thoriumOre=new Item("thorium-ore",Color.valueOf("cb8ebf"));
thoriumOre.radioactivity=0.3;
thoriumOre.hardness=4;
const glass=new Item("glass",Color.valueOf("ffffff"));
glass.type=ItemType.material;
glass.cost=0.8;
const iron=new Item("iron",Color.valueOf("b0bac0"));
iron.type=ItemType.material;
const uranium=new Item("uranium",Color.valueOf("cce745"));
uranium.type=ItemType.material;
uranium.explosiveness=0.2;
uranium.radioactivity=1.3;
uranium.cost=1.6;
const depletedUranium=new Item("depleted-uranium",Color.valueOf("89a015"));
depletedUranium.type=ItemType.material;
depletedUranium.explosiveness=0.1;
depletedUranium.radioactivity=0.4;
const circuit=new Item("circuit",Color.valueOf("4cb482"));
circuit.type=ItemType.material;
circuit.flammability=0.19;
circuit.cost=3;
const semiconductor=new Item("semiconductor",Color.valueOf("b4b428"));
semiconductor.type=ItemType.material;
semiconductor.explosiveness=0.1;
semiconductor.flammability=0.19;
semiconductor.cost=4;
const computer=new Item("computer",Color.valueOf("6e7080"));
computer.type=ItemType.material;
computer.explosiveness=0.2;
computer.flammability=0.19;
computer.cost=5;
const steel=new Item("steel",Color.valueOf("767a84"));
steel.type=ItemType.material;
steel.cost=1.6;
const denseAlloy=new Item("dense-alloy",Color.valueOf("8c8c78"));
denseAlloy.type=ItemType.material;
denseAlloy.radioactivity=0.1;
denseAlloy.cost=2;
const dimensionArmour=new Item("dimension-armour",Color.valueOf("d0e0ff"));
dimensionArmour.type=ItemType.material;
dimensionArmour.cost=2.4;
const quantumMass=new Item("quantum-mass",Color.valueOf("000080"));
quantumMass.type=ItemType.material;
quantumMass.cost=3.2;
//TODO 새 값 추가하기
const bullet=new Item("bullet",Color.valueOf("c88c50"));
bullet.explosiveness=0.1;
const ap=new Item("armor-piercing-shell",Color.valueOf("ffff00"));
ap.explosiveness=0.1;
const clusterBullet=new Item("cluster-bullet",Color.valueOf("ff8080"));
clusterBullet.explosiveness=0.3;
const he=new Item("high-explosive",Color.valueOf("ec1c24"));
he.explosiveness=0.8;
he.flammability=0.19;
const missile=new Item("missile",Color.valueOf("88001b"));
missile.explosiveness=1;
missile.flammability=0.19;
const doom=new Item("doom",Color.valueOf("96c80e"));
doom.explosiveness=1;
doom.flammability=0.19;
doom.radioactivity=0.6;
