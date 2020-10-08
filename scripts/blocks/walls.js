new Wall("iron-wall");
new Wall("iron-wall-large");
const radiationExposure=new StatusEffect("radiation-exposure");
radiationExposure.speedMultiplier=0.9;
radiationExposure.damage=0.1;
const uraniumWall=extendContent(Wall,"uranium-wall",{});
uraniumWall.entityType=prov(()=>extend(TileEntity,{
  damage(damage){
    this.super$damage(damage);
    if(this.timer.get(60)) {
      Units.nearbyEnemies(this.getTeam(),this.x-120,this.y-120,240,240,cons(u=>{
        if(this.dst2(u)<120*120) u.applyEffect(radiationExposure,60);
      }));
    }
  },
}));
const uraniumWallLarge=extendContent(Wall,"uranium-wall-large",{});
uraniumWallLarge.entityType=prov(()=>extend(TileEntity,{
  damage(damage){
    this.super$damage(damage);
    if(this.timer.get(60)) {
      Units.nearbyEnemies(this.getTeam(),this.x-120,this.y-120,240,240,cons(u=>{
        if(this.dst2(u)<120*120) u.applyEffect(radiationExposure,60);
      }));
    }
  },
}));
const steelWall=extendContent(Wall,"steel-wall",{
  handleDamage(tile,amount){
    return Math.max(0,amount-3/Vars.state.rules.blockHealthMultiplier);
  }
});
const steelWallLarge=extendContent(Wall,"steel-wall-large",{
  handleDamage(tile,amount){
    return Math.max(0,amount-3/Vars.state.rules.blockHealthMultiplier);
  }
});
const denseAlloyWall=extendContent(Wall,"dense-alloy-wall",{
  handleDamage(tile,amount){
    return tile.entity.isBulletHit()?amount:Math.max(amount*0.75-1000/Vars.state.rules.blockHealthMultiplier,0)
  },
  handleBulletHit(entity,bullet){
    entity.onBulletHit()
    entity.damage(bullet.damage());
  }
});
denseAlloyWall.entityType=prov(()=>extend(TileEntity,{
  _bulletHit:false,
  isBulletHit(){
    var ret=this._bulletHit;
    this._bulletHit=false;
    return ret;
  },
  onBulletHit(){
    this._bulletHit=true;
  }
}));
const denseAlloyWallLarge=extendContent(Wall,"dense-alloy-wall-large",{
  handleDamage(tile,amount){
    return tile.entity.isBulletHit()?amount:Math.max(amount*0.75-40/Vars.state.rules.blockHealthMultiplier,0)
  },
  handleBulletHit(entity,bullet){
    entity.onBulletHit()
    entity.damage(bullet.damage());
  }
});
denseAlloyWallLarge.entityType=prov(()=>extend(TileEntity,{
  _bulletHit:false,
  isBulletHit(){
    var ret=this._bulletHit;
    this._bulletHit=false;
    return ret;
  },
  onBulletHit(){
    this._bulletHit=true;
  }
}));
