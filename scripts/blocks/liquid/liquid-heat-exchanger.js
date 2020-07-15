const heatL=require("heatWrapper");
const liquidHeatExchanger=heatL.heatGiver(GenericCrafter,GenericCrafter.GenericCrafterEntity,"liquid-heat-exchanger",{
  heatCapacity:1000,
  heatProduction:1.2,
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.output);
    this.stats.add(BlockStat.output,this.outputLiquid.liquid,this.outputLiquid.amount*60,true);
    this.stats.remove(BlockStat.input);
    this.stats.add(BlockStat.input,this.consumes.get(ConsumeType.liquid).liquid,this.consumes.get(ConsumeType.liquid).amount*60,true);
    this.stats.add(BlockStat.basePowerGeneration,String(this.heatProduction*60.0)+" heat/sec","");
    this.stats.remove(BlockStat.productionTime);
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof(entity["getHeat"])!=="function"?0.0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.tile.entity.getHeat()/this.heatCapacity))
    ));
    this.bars.add("liquid2",func(entity=>
      new Bar(prov(()=>entity.liquids.get(this.outputLiquid.liquid)<=0.001?Core.bundle.get("bar.liquid"):this.outputLiquid.liquid.localizedName),prov(()=>this.outputLiquid.liquid.barColor()),floatp(()=>entity.liquids.get(this.outputLiquid.liquid)/this.liquidCapacity))
    ));
  },
  update(tile){
    const entity=tile.ent();
    c1=this.consumes.get(ConsumeType.liquid);
    entity.coolDownHeat();
    if(entity.getHeat()>25){
      this.giveHeat(tile);
    }
    if(entity.power.status>0&&entity.liquids.get(c1.liquid)>=c1.amount&&entity.liquids.get(this.outputLiquid.liquid)<this.liquidCapacity-0.001){
      var use=entity.power.status*Math.min(c1.amount*entity.delta(),this.liquidCapacity-entity.liquids.get(this.outputLiquid.liquid));
      this.useContent(tile,this.outputLiquid.liquid);
      entity.liquids.add(this.outputLiquid.liquid,this.outputLiquid.amount*use/c1.amount);
      entity.addHeat(this.heatProduction*use/c1.amount);
      entity.liquids.remove(c1.liquid,use);
      if(Mathf.chance(Time.delta()/30)){
        Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }
    this.tryDumpLiquid(tile,this.outputLiquid.liquid);
    if(entity.getHeat()>=this.heatCapacity){
      entity.kill();
    }
  },
  shouldConsume(tile){
    return false;
  },
  draw(tile){
    this.super$draw(tile);
    var mod=tile.entity.liquids
    var input=this.consumes.get(ConsumeType.liquid).liquid;
    var output=this.outputLiquid.liquid;
    if(mod.get(input)>0.001){
      Draw.color(input.color);
      Draw.alpha(mod.get(input)/this.liquidCapacity);
      Draw.rect(Core.atlas.find(this.name+"-liquid-1"),tile.drawx(),tile.drawy(),0);
      Draw.color();
    }
    if(mod.get(output)>0.001){
      Draw.color(output.color);
      Draw.alpha(mod.get(output)/this.liquidCapacity);
      Draw.rect(Core.atlas.find(this.name+"-liquid-2"),tile.drawx(),tile.drawy(),0);
      Draw.color();
    }
    Draw.rect(Core.atlas.find(this.name+"-top"),tile.drawx(),tile.drawy(),0);
  },
  generateIcons:function(){
    return [
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-top")
    ];
  }
},{});
liquidHeatExchanger.outputsLiquid=true;
liquidHeatExchanger.sync=true;
liquidHeatExchanger.baseExplosive=5;
