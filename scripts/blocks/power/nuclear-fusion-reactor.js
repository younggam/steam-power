const heatL=require("heatWrapper");
const nuclearFusionReactor=heatL.heatRecator(LiquidConverter,GenericCrafter.GenericCrafterEntity,"nuclear-fusion-reactor",{
  heatProduction:4.8,
  heatCapacity:6000,
  heatCons:4.8,
  explosionDamage:6000,
  explosionRadius:50,
  powerCons:25,
  init(){
    this.super$init();
    this.consumes.get(ConsumeType.liquid).update(false);
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.output);
    this.stats.add(BlockStat.output,this.outputLiquid.liquid,this.outputLiquid.amount*60,true);
    this.stats.remove(BlockStat.input);
    this.stats.add(BlockStat.input,this.consumes.get(ConsumeType.liquid).liquid,this.consumes.get(ConsumeType.liquid).amount*60,true);
    this.stats.add(BlockStat.basePowerGeneration,Core.bundle.get("steam-power-heat-per-sec"),String(this.heatProduction*60));
    this.stats.add(BlockStat.input,Items.blastCompound);
    this.stats.remove(BlockStat.powerUse);
    this.stats.add(BlockStat.powerUse,this.powerCons*60,StatUnit.powerSecond);
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
    c2=this.consumes.get(ConsumeType.item);
    entity.coolDownHeat();
    if(entity.getHeat()>=this.heatCapacity){
      entity.warmup=Mathf.lerpDelta(entity.warmup,0,0.01);
      return;
    }else{
      if(entity.getHeat()>60&&entity.liquids.get(c1.liquid)>=c1.amount&&entity.liquids.get(this.outputLiquid.liquid)<this.liquidCapacity-0.001){
        var use=Math.min(c1.amount*entity.delta(),this.liquidCapacity-entity.liquids.get(this.outputLiquid.liquid));
        this.useContent(tile,this.outputLiquid.liquid);
        entity.liquids.add(this.outputLiquid.liquid,use);
        entity.liquids.remove(c1.liquid,use);
        entity.addHeat(-this.heatCons*(use/c1.amount)+Time.delta()/20);
      }
      if(entity.items.total()>0&&entity.power.status>=0.99){
        entity.progress+=this.getProgressIncrease(entity,this.craftTime);
        entity.addHeat(entity.delta()*entity.items.total()*this.heatProduction/this.itemCapacity);
        entity.warmup=Mathf.lerpDelta(entity.warmup,1,0.001)
        if(Mathf.equal(entity.warmup,1,0.001)){
          entity.warmup=1;
        }
        if(entity.progress>=1){
          entity.items.remove(c2.items[0]);
          entity.progress=0;
        }
      }else{
        entity.warmup=Mathf.lerpDelta(entity.warmup,0,0.01);
      }
    }
    this.tryDumpLiquid(tile,this.outputLiquid.liquid);

  },
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    const entity=tile.ent();
    if((entity.items.total()<3&&entity.getHeat()<350)||!Vars.state.rules.reactorExplosions) return;
    Sounds.explosionbig.at(tile);
    Effects.shake(6,16,tile.worldx(),tile.worldy());
    Effects.effect(Fx.nuclearShockwave,tile.worldx(),tile.worldy());
    for(var i=0;i<6;i++){
      Time.run(Mathf.random(80),run(()=>Effects.effect(Fx.impactcloud,tile.worldx(),tile.worldy())));
    }
    Damage.damage(tile.worldx(),tile.worldy(),this.explosionRadius*Vars.tilesize,this.explosionDamage*4);
    for(var i=0;i<20;i++){
      Time.run(Mathf.random(80),run(()=>{
        Tmp.v1.rnd(Mathf.random(40));
        Effects.effect(Fx.explosion,Tmp.v1.x+tile.worldx(),Tmp.v1.y+tile.worldy());
      }));
    }
    for(var i=0;i<70;i++){
      Time.run(Mathf.random(90),run(()=>{
        Tmp.v1.rnd(Mathf.random(120));
        Effects.effect(Fx.impactsmoke,Tmp.v1.x+tile.worldx(),Tmp.v1.y+tile.worldy());
      }))
    }
  },
  shouldConsume(tile){
    return true;
  },
  plasma1:Color.valueOf("ffd06b"),
  plasma2:Color.valueOf("ff361b"),
  plasmas:4,
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.bottomRegion,tile.drawx(),tile.drawy());
    for(var i=0;i<this.plasmas;i++){
      var r=this.size*Vars.tilesize-3+Mathf.absin(Time.time(),2+i*1,5-i*0.5);
      Draw.color(this.plasma1,this.plasma2,i/this.plasmas);
      Draw.alpha((0.3+Mathf.absin(Time.time(),2+i*2,0.3+i*0.05))*entity.warmup);
      Draw.blend(Blending.additive);
      Draw.rect(this.plasmaRegion[i],tile.drawx(),tile.drawy(),r,r,Time.time()*(12+1*6)*entity.warmup);
      Draw.blend();
    }
    Draw.color();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    Draw.color();
  },
  load(){
    this.super$load();
    this.bottomRegion=Core.atlas.find(this.name+"-bottom");
    this.plasmaRegion=[];
    for(var i=0;i<this.plasmas;i++) this.plasmaRegion[i]=Core.atlas.find(this.name+"-plasma-"+i)
  },
  generateIcons:function(){
    return[
      Core.atlas.find(this.name+"-bottom"),
      Core.atlas.find(this.name)
    ];
  }
},{});
nuclearFusionReactor.outputsLiquid=true;
nuclearFusionReactor.sync=true;
nuclearFusionReactor.consumes.add(extend(ConsumePower,{
  requestedPower(entity){
    if(entity==null){
      return 0;
    }
    if(entity.items.total()>0){
      return 25;
    }else return 0;
  }
}));
