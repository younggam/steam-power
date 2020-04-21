if (typeof(cons2)== "undefined"){
	const cons2 = method => new Cons2(){get : method};
}
const tesla=extendContent(PowerTurret,"tesla",{
  _drawer:cons2((tile,entity)=>{Draw.rect(this.region,tile.drawx(),tile.drawy(),entity.rotation-90)}),
  bullet(tile,type,angle){
    Bullet.create(type,tile.entity,tile.getTeam(),tile.drawx(),tile.drawy(),angle);
  },
  drawLayer(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy(),0);
    //this._drawer.get(tile,entity);
    if(this.heatRegion!=Core.atlas.find("error")){
      this.headDrawer.get(tile,entity);
    }
  }
});
tesla.shootType=extend(BasicBulletType,{
  draw(b){},
  init(b){
    if(b==null) return;
    Lightning.create(b.getTeam(),Pal.lancerLaser,this.damage,b.x,b.y,b.rot(),30+Mathf.round(Mathf.random()*20));
  }
});
tesla.shootType.lifetime=1
tesla.shootType.speed=0.001
tesla.shootType.hitEffect=Fx.hitLancer;
tesla.shootType.damage=32;
