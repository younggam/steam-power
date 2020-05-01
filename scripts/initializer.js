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
    print(Object.keys(ForceProjector.ShieldEntity));
    Blocks.fuse.ammo.put(Items.phasefabric,phaseRay);
  }
});
