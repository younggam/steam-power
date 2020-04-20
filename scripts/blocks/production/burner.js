const burner=extendContent(Block,"burner",{
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
  giveHeat(tile){
    var proximity=tile.entity.proximity();
    var dump=tile.rotation();
    var index=0;
    var others=[];
    var totalHeat=0;
    for(var i=0;i<proximity.size;i++){
      this.incrementDump(tile,proximity.size);
      var other=proximity.get((i+dump)%proximity.size);
      if(other.getTeam()==tile.getTeam()&&typeof(other.block()["inputsHeat"])==="function"){
        if(other.entity.getHeat()<tile.entity.getHeat()){
          totalHeat+=other.entity.getHeat();
          others[index]=other;
          index++;
        }
      }
    }
    if(others.length>0){
      var avgHeat=(totalHeat+tile.entity.getHeat())/(others.length+1);
      for(var j=0;j<others.length;j++){
        others[j].entity.addHeat(avgHeat-others[j].entity.getHeat());
      }
      tile.entity.addHeat(-tile.entity.getHeat()+avgHeat);
    }
  },
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    Sounds.explosionbig.at(tile);
    const entity=tile.ent();
    if(entity.items.total()<4||entity.getHeat()<350) return;
    Effects.effect(Fx.pulverize,tile.worldx(),tile.worldy());
    Damage.damage(tile.worldx(),tile.worldy(),16*this.size,50);
  },
  draw(tile){
    this.super$draw(tile);
  },
  drawLight(tile){

  },
  getItemEfficiency(item){
    return item!==null?item.flammability:true;
  }
});
burner.entityType=prov(()=>extend(TileEntity,{
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

  getHeat(){
    return this._heat;
  },
  modifyHeat(a){
    this._heat=a
  },
  addHeat(b){
    this._heat+=b
  },
  coolDownHeat(){
    if(this._heat>25){
      this._heat-=Time.delta()*this._heat/1200;
    }else if(this._heat<25){
      this._heat=25;
    }
  },
  _heat:25,
  setCurrentItem(c){
    this._currentItem=c;
  },
  getCurrentItem(){
    return this._currentItem;
  },
  _currentItem:null,
}));
burner.update=true;
burner.sync=true;
burner.baseExplosive=5;
burner.solid=true;
burner.hasPower=false;
burner.craftTime=60;
