const heatL=require("heatWrapper");
const steamGenerator=heatL.heatUser(LiquidConverter,GenericCrafter.GenericCrafterEntity,"steam-generator",{
  heatCons:0.15,
  heatCapacity:300,
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.output);
    this.stats.add(BlockStat.output,this.outputLiquid.liquid,this.outputLiquid.amount*60,true);
    this.stats.remove(BlockStat.input);
    this.stats.add(BlockStat.input,String(this.heatCons*60.0)+" heat/sec","");
    this.stats.add(BlockStat.input,this.consumes.get(ConsumeType.liquid).liquid,this.consumes.get(ConsumeType.liquid).amount*60,true);
    this.stats.remove(BlockStat.productionTime);
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof(entity["getHeat"])!=="function"?0.0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
    this.bars.add("liquid2",func(entity=>
      new Bar(prov(()=>entity.liquids.get(this.outputLiquid.liquid)<=0.001?Core.bundle.get("bar.liquid"):this.outputLiquid.liquid.localizedName),prov(()=>this.outputLiquid.liquid.barColor()),floatp(()=>entity.liquids.get(this.outputLiquid.liquid)/this.liquidCapacity))
    ));
  },
  update(tile){
    const entity=tile.ent();
    c1=this.consumes.get(ConsumeType.liquid);
    entity.coolDownHeat();
    if(entity.liquids.get(c1.liquid)>=c1.amount&&entity.getHeat()>=100&&entity.liquids.get(this.outputLiquid.liquid)<this.liquidCapacity-0.001){
      var use=Math.min(c1.amount*entity.delta(),this.liquidCapacity-entity.liquids.get(this.outputLiquid.liquid));
      this.useContent(tile,this.outputLiquid.liquid);
      entity.liquids.add(this.outputLiquid.liquid,use);
      entity.addHeat(-this.heatCons*(use/c1.amount));
      entity.liquids.remove(c1.liquid,use);
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
    var output=this.outputLiquid.liquid;
    if(mod.get(output)>0.001){
      Draw.color(output.color);
      Draw.alpha(mod.get(output)/this.liquidCapacity);
      Draw.rect(this.liquidRegion,tile.drawx(),tile.drawy(),0);
      Draw.color();
    }
    Draw.rect(this.topRegion,tile.drawx(),tile.drawy(),0);
  },
  load(){
    this.super$load();
    this.topRegion=Core.atlas.find(this.name+"-top");
    this.liquidRegion=Core.atlas.find(this.name+"-liquid");
  },
  generateIcons:function(){
    return [
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-top")
    ];
  }
},{});
steamGenerator.sync=true;
steamGenerator.outputsLiquid=true;
