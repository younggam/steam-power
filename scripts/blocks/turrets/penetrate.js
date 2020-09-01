const bullet1=extend(BasicBulletType,{
  hit(b,x,y){
    this.super$hit(b,x!=null?x:b.x,y!=null?y:b.y);
    var i=b.getData();
    if(i==null) b.setData(6);
    else{
      b.setData(--i);
      if(i==0)  b.remove();
    }
  },
});
bullet1.damage=400;
bullet1.pierce=true;
bullet1.speed=15;
bullet1.bulletWidth=9;
bullet1.bulletHeight=36;
bullet1.ammoMultiplier=5;
bullet1.lifetime=30;
bullet1.knockback=2.4;
bullet1.hitEffect=Fx.hitBulletBig;
const bullet2=extend(BasicBulletType,{
  hit(b,x,y){
    this.super$hit(b,x!=null?x:b.x,y!=null?y:b.y);
    var i=b.getData();
    if(i==null) b.setData(6);
    else{
      b.setData(--i);
      if(i==0)  b.remove();
    }
  },
});
bullet2.damage=130;
bullet2.pierce=true;
bullet2.speed=12.5;
bullet2.bulletWidth=6;
bullet2.bulletHeight=24;
bullet2.ammoMultiplier=5;
bullet2.lifetime=36;
bullet2.knockback=1.8;
bullet2.hitEffect=Fx.hitBulletBig;
const penetrate=extendContent(ItemTurret,"penetrate",{
  powerUse:3,
  init(){
    this.hasPower=true;
    this.consumes.powerCond(this.powerUse,boolf(entity=>entity!=null?entity.target!=null:false));
    this.ammo(Vars.content.getByName(ContentType.item,"steam-power-bullet"),bullet2,Vars.content.getByName(ContentType.item,"steam-power-armor-piercing-shell"),bullet1);
    this.super$init();
  },
  baseReloadSpeed(tile){
    return tile.isEnemyCheat()?1:tile.entity.power.status;
  },
});
penetrate.heatColor=Color.red;
