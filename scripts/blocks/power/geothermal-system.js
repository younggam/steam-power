const heatL=require("heatWrapper");
const geothermalSystem=heatL.heatGiver(Block,TileEntity,"geothermal-system",{
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
  drawLight(tile){
    Vars.renderer.lights.add(tile.drawx(),tile.drawy(),(40+Mathf.absin(10,5))*this.sumAttribute(this.attribute,tile.x,tile.y)*this.size,Color.scarlet,0.4);
  },
},{});

geothermalSystem.update=true;
geothermalSystem.sync=true;
geothermalSystem.baseExplosive=5;
geothermalSystem.solid=true;
geothermalSystem.hasPower=false;
geothermalSystem.canOverdrive=false;
