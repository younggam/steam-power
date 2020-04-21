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
      if(Mathf.chance(Time.delta()*0.3)){
        Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }
    if(entity.getHeat()>=this.heatCapacity){
      entity.kill();
    }
  },
  draw(tile){
    this.super$draw(tile);
  },
  drawLight(tile){

  },

},{});
electricBurner.update=true;
electricBurner.sync=true;
electricBurner.baseExplosive=5;
electricBurner.solid=true;
electricBurner.hasItems=false;
