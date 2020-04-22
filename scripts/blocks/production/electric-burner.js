const heatL=require("heatWrapper");
const electricBurner=heatL.heatGiver(Block,TileEntity,"electric-burner",{
  heatCapacity:500,
  heatProduction:1/3,
  setStats(){
    this.super$setStats();
    this.stats.add(BlockStat.basePowerGeneration,String(this.heatProduction*60.0)+" heat/sec","");
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+entity.tile.entity.getHeat().toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>entity.tile.entity==null?0:entity.tile.entity.getHeat()/this.heatCapacity))
    ));
  },
  outputsItems(){
    return false;
  },
  update(tile){
    const entity=tile.ent();
    entity.coolDownHeat();
    if(entity.getHeat()>25){
      this.giveHeat(tile);
    }
    if(entity.cons.valid()){
      entity.cons.trigger();
      entity.addHeat(this.heatProduction*entity.efficiency()*entity.delta());
      if(Mathf.chance(Time.delta()/30)){
        Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }
    if(entity.getHeat()>=this.heatCapacity){
      entity.kill();
    }
  },
  draw(tile){
    this.super$draw(tile);
    Draw.color(Color.red,Color.orange,Math.max(0,Math.min((tile.entity.getHeat()-374)/100,1)));
    Draw.alpha(tile.entity.getHeat()/this.heatCapacity);
    Draw.rect(Core.atlas.find(this.name+"-heat"),tile.drawx(),tile.drawy());
    Draw.color();
  },
},{});
electricBurner.update=true;
electricBurner.sync=true;
electricBurner.baseExplosive=5;
electricBurner.solid=true;
electricBurner.hasItems=false;
