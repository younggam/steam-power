bullet1=extend(BasicBulletType,{
  hit(b,x,y){
    this.super$hit(b,x!=null?x:b.x,y!=null?y:b.y);
    var i=b.getOwner().getPierce();
    if(i==0){
      b.remove();
    }
  },
});
bullet1.damage=324;
bullet1.pierce=true;
bullet1.speed=15;
bullet1.bulletWidth=9;
bullet1.bulletHeight=36;
bullet1.ammoMultiplier=5;
bullet1.lifetime=30;
bullet1.knockback=2.4;
bullet1.hitEffect=Fx.hitBulletBig;
const penetrate=extendContent(ItemTurret,"penetrate",{
  powerUse:3,
  _ammo:Vars.content.getByName(ContentType.item,"steam-power-armor-piercing-shell"),
  init(){
    this.hasPower=true;
    this.consumes.powerCond(this.powerUse,boolf(entity=>entity.tile.entity!=null?entity.tile.entity.target:false));
    this.ammo(Vars.content.getByName(ContentType.item,"steam-power-armor-piercing-shell"),bullet1);
    this.super$init();
  },
  baseReloadSpeed(tile){
    return tile.isEnemyCheat()?1:tile.entity.power.status;
  },
  shoot(tile,type){
    this.super$shoot(tile,type);
    tile.entity.resetPierce();
  }
});
penetrate.entityType=prov(()=>extendContent(ItemTurret.ItemTurretEntity,penetrate,{
  getPierce(){
    if(this._pierce>0){
      this._pierce--;
    }
    return this._pierce
  },
  resetPierce(){
    this._pierce=7;
  },
  _pierce:7,
}));
