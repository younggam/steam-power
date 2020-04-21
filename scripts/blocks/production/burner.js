const heatL=require("heatWrapper");

const burner=heatL.heatGiver(Block,TileEntity,"burner",{
  heatCapacity:500,
  minItemEfficiency:0.2,
  heatProduction:5/12,
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
  setDefaults(){
    this.consumes.add(new ConsumeItemFilter(boolf(item=>this.getItemEfficiency(item)>=this.minItemEfficiency&&item.explosiveness<=0.7)).update(false).optional(true,false));
  },
  init(){
    this.setDefaults();
    this.super$init();
  },
  update(tile){
    const entity=tile.ent();
    entity.coolDownHeat();
    if(entity.getHeat()>25){
      this.giveHeat(tile);
    }
    if(entity.getProgress()<=0&&entity.items.total()>0){
      entity.setCurrentItem(entity.items.take());
      entity.modifyProgress(1);
    }else if(entity.getProgress()>0){
      entity.subProgress(this.getProgressIncrease(entity,60));
      entity.addHeat(this.heatProduction*this.getItemEfficiency(entity.getCurrentItem())*entity.delta());
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
  getItemEfficiency(item){
    return item!==null?item.flammability:true;
  }
},
{
  getProgress(){
    return this._progress;
  },
  modifyProgress(z){
    this._progress=z;
  },
  subProgress(y){
    this._progress-=y;
  },
  _progress:0,
  setCurrentItem(c){
    this._currentItem=c;
  },
  getCurrentItem(){
    return this._currentItem;
  },
  _currentItem:null,
});
burner.update=true;
burner.sync=true;
burner.baseExplosive=5;
burner.solid=true;
burner.hasPower=false;
burner.craftTime=60;
