const nuclearReactor=extendContent(LiquidConverter,"nuclear-reactor",{
  heatProduction:1.2,
  heatCapacity:1000,
  heatCons:1.15,
  explosionDamage:1350,
  explosionRadius:40,
  tr: new Vec2(),

  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.output);
    this.stats.add(BlockStat.output,this.outputLiquid.liquid,this.outputLiquid.amount*60,true);
    this.stats.remove(BlockStat.input);
    this.stats.add(BlockStat.input,this.consumes.get(ConsumeType.liquid).liquid,this.consumes.get(ConsumeType.liquid).amount*60,true);
    this.stats.add(BlockStat.basePowerGeneration,String(this.heatProduction*60.0)+" heat/sec","");
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+entity.tile.entity.getHeat().toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>entity.tile.entity==null?0:entity.tile.entity.getHeat()/this.heatCapacity))
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
    if(entity.getHeat()>60&&entity.liquids.get(c1.liquid)>=c1.amount&&entity.liquids.get(this.outputLiquid.liquid)<this.liquidCapacity-0.001){
      var use=Math.min(c1.amount*entity.delta(),this.liquidCapacity-entity.liquids.get(this.outputLiquid.liquid));
      this.useContent(tile,this.outputLiquid.liquid);
      entity.liquids.add(this.outputLiquid.liquid,use);
      entity.liquids.remove(c1.liquid,use);
      entity.addHeat(-this.heatCons*(use/c1.amount));
    }
    if(entity.items.total()>0){
      entity.progress+=this.getProgressIncrease(entity,this.craftTime);
      entity.addHeat(entity.delta()*entity.items.total()*this.heatProduction/this.itemCapacity);
      if(entity.progress>=1){
        entity.items.remove(c2.items[0]);
        entity.progress=0;
      }
    }
    this.tryDumpLiquid(tile,this.outputLiquid.liquid);
    if(entity.getHeat()>=this.heatCapacity){
      entity.kill();
    }
  },
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    Sounds.explosionbig.at(tile);
    const entity=tile.ent();
    if((entity.items.total()<5&&entity.getHeat()<350)||!Vars.state.rules.reactorExplosions) return;
    Effects.shake(6,16,tile.worldx(),tile.worldy());
    Effects.effect(Fx.nuclearShockwave,tile.worldx(),tile.worldy());
    for(var i=0;i<6;i++){
      Time.run(Mathf.random(40),run(()=>Effects.effect(Fx.nuclearcloud,tile.worldx(),tile.worldy())));
    }
    Damage.damage(tile.worldx(),tile.worldy(),this.explosionRadius*Vars.tilesize,this.explosionDamage*4);
    for(var i=0;i<20;i++){
      Time.run(Mathf.random(50),run(()=>{
        this.tr.rnd(Mathf.random(40));
        Effects.effect(Fx.explosion,this.tr.x+tile.worldx(),this.tr.y+tile.worldy());
      }));
    }
    for(var i=0;i<70;i++){
      Time.run(Mathf.random(80),run(()=>{
        this.tr.rnd(Mathf.random(120));
        Effects.effect(Fx.nuclearsmoke,this.tr.x+tile.worldx(),this.tr.y+tile.worldy());
      }))
    }
  },
  shouldConsume(tile){
    return false;
  }
});
nuclearReactor.entityType=prov(()=>extend(GenericCrafter.GenericCrafterEntity,{
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
nuclearReactor.sync=true;
