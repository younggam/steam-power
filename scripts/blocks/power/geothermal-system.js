const geothermalSystem=extendContent(Block,"geothermal-system",{
  attribute:Attribute.heat,
  heatProduction:7/30,
  heatCapacity:500,
  setStats(){
    this.super$setStats();
    this.stats.add(BlockStat.basePowerGeneration,String(this.heatProduction*60.0)+" heat/sec","");
    this.stats.add(BlockStat.tiles,this.attribute);
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+entity.tile.entity.getHeat().toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>entity.tile.entity==null?0:entity.tile.entity.getHeat()/this.heatCapacity))
    ));
    this.bars.add("multiplier",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.efficiency",100*this.sumAttribute(this.attribute,entity.tile.x,entity.tile.y))),prov(()=>Pal.ammo),floatp(()=>this.sumAttribute(this.attribute,entity.tile.x,entity.tile.y)))
    ));
  },
  outputsItems(){
    return false;
  },
  drawPlace(x,y,rotation,valid){
    this.drawPlaceText(Core.bundle.formatFloat("bar.efficiency",this.sumAttribute(this.attribute,x,y)*100,1),x,y,valid);
  },
  canPlaceOn(tile){
    return tile.getLinkedTilesAs(this,this.tempTiles).sumf(floatf(other=>other.floor().attributes.get(this.attribute)))>0.01
  },
  update(tile){
    const entity=tile.ent();
    entity.coolDownHeat();
    if(entity.getHeat()>25){
      this.giveHeat(tile);
    }

    entity.addHeat(entity.delta()*this.heatProduction*this.sumAttribute(this.attribute,tile.x,tile.y));
    if(Mathf.chance(Time.delta()*0.3)){
      Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
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
        others[j].entity.addHeat((tile.entity.getHeat()-avgHeat)/others.length);
      }
      tile.entity.addHeat(-tile.entity.getHeat()+avgHeat);
    }
  },
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    Sounds.explosionbig.at(tile);
    const entity=tile.ent();
    if(entity.getHeat()<350) return;
    Effects.effect(Fx.pulverize,tile.worldx(),tile.worldy());
    Damage.damage(tile.worldx(),tile.worldy(),16*this.size,50);
  },
  draw(tile){
    this.super$draw(tile);
  },
  drawLight(tile){

  },
});
geothermalSystem.entityType=prov(()=>extend(TileEntity,{
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
}));
geothermalSystem.update=true;
geothermalSystem.sync=true;
geothermalSystem.baseExplosive=5;
geothermalSystem.solid=true;
geothermalSystem.hasPower=false;
geothermalSystem.canOverdrive=false;
