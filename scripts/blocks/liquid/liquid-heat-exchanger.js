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
    this.stats.add(BlockStat.basePowerGeneration,Core.bundle.get("steam-power-heat-per-sec"),String(this.heatProduction*60));
    this.stats.remove(BlockStat.productionTime);
  },
  setBars(){
    this.super$setBars();
    this.bars.remove("liquid");
    var hotCryo=this.consumes.get(ConsumeType.liquid).liquid;
    this.bars.add("liquid1",func(entity=>
      new Bar(prov(()=>hotCryo.localizedName),prov(()=>hotCryo.barColor()),floatp(()=>entity.liquids.get(hotCryo)/this.liquidCapacity))
    ));
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof(entity["getHeat"])!=="function"?0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
    this.bars.add("liquid2",func(entity=>
      new Bar(prov(()=>this.outputLiquid.liquid.localizedName),prov(()=>this.outputLiquid.liquid.barColor()),floatp(()=>entity.liquids.get(this.outputLiquid.liquid)/this.liquidCapacity))
    ));
  },
  init(){
    this.super$init();
    this.consumes.get(ConsumeType.liquid).update(false);
  },
  update(tile){
    const entity=tile.ent();
    var c1=this.consumes.get(ConsumeType.liquid);
    entity.coolDownHeat();
    if(entity.getHeat()>25){
      this.giveHeat(tile);
    }
    entity.setUsed(0);
    if(entity.power.status>0&&entity.liquids.get(c1.liquid)>=c1.amount&&entity.liquids.get(this.outputLiquid.liquid)<this.liquidCapacity-0.001){
      var use=entity.power.status*Math.min(c1.amount*entity.delta(),this.liquidCapacity-entity.liquids.get(this.outputLiquid.liquid));
      var rate=use/c1.amount;
      entity.setUsed(rate);
      this.useContent(tile,this.outputLiquid.liquid);
      entity.liquids.add(this.outputLiquid.liquid,this.outputLiquid.amount*rate);
      entity.addHeat(this.heatProduction*rate);
      entity.liquids.remove(c1.liquid,use);
      if(Mathf.chance(Time.delta()/30)){
        Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }
    this.tryDumpLiquid(tile,this.outputLiquid.liquid);
    if(entity.getHeat()>=this.heatCapacity) entity.kill();
  },
  draw(tile){
    this.super$draw(tile);
    var mod=tile.entity.liquids
    var input=this.consumes.get(ConsumeType.liquid).liquid;
    var output=this.outputLiquid.liquid;
    if(mod.get(input)>0.001){
      Draw.color(input.color);
      Draw.alpha(mod.get(input)/this.liquidCapacity);
      Draw.rect(Core.atlas.find(this.name+"-liquid-1"),tile.drawx(),tile.drawy());
    }
    if(mod.get(output)>0.001){
      Draw.color(output.color);
      Draw.alpha(mod.get(output)/this.liquidCapacity);
      Draw.rect(Core.atlas.find(this.name+"-liquid-2"),tile.drawx(),tile.drawy());
    }
    Draw.color();
    Draw.rect(Core.atlas.find(this.name+"-top"),tile.drawx(),tile.drawy(),0);
  },
  generateIcons:function(){
    return [
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-top")
    ];
  }
},{
  _used:0,
  getUsed(){ return this._used;},
  setUsed(b){ this._used=b;}
});
liquidHeatExchanger.consumes.add(extend(ConsumePower,{
  requestedPower(entity){
    if(typeof entity["getUsed"]!=="function") return 0;
    return entity.getUsed()*2/entity.delta();
  }
}));
liquidHeatExchanger.outputsLiquid=true;
liquidHeatExchanger.baseExplosive=5;
