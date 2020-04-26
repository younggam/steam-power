if (typeof(cons2)== "undefined"){
	const cons2 = method => new Cons2(){get : method};
}
const tesla=extendContent(PowerTurret,"tesla",{
  bullet(tile,type,angle){
    Bullet.create(type,tile.entity,tile.getTeam(),tile.drawx(),tile.drawy(),angle);
  },
  drawLayer(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy(),0);
    if(this.heatRegion!=Core.atlas.find("error")){
      this.heatDrawer.get(tile,entity);
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
tesla.heatColor=Color.red;
