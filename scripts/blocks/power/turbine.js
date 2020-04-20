const turbine=extendContent(ItemLiquidGenerator,"turbine",{
  update(tile){
    const entity=tile.ent();
    var calculationDelta=entity.delta();
    if(!entity.cons.valid()){
      entity.productionEfficiency=0;
    }
    var liquid=null;
    if(this.hasLiquids&&entity.liquids.get(Vars.content.getByName(ContentType.liquid,"steam-power-high-pressure-steam"))>=0.001){
      liquid=Vars.content.getByName(ContentType.liquid,"steam-power-high-pressure-steam");
    }else if(this.hasLiquids&&entity.liquids.get(Vars.content.getByName(ContentType.liquid,"steam-power-steam"))>=0.001){
      liquid=Vars.content.getByName(ContentType.liquid,"steam-power-steam");
    }
    if(this.hasLiquids&&liquid!=null&&entity.liquids.get(liquid)>=0.001){
      var baseLiquidEfficiency=this.getLiquidEfficiency(liquid);
      var maximumPossible=this.maxLiquidGenerate*calculationDelta;
      var used=Math.min(entity.liquids.get(liquid)*calculationDelta,maximumPossible);
      entity.liquids.remove(liquid,used*entity.power.graph.getUsageFraction());
      entity.productionEfficiency=baseLiquidEfficiency*used/maximumPossible;
        entity.heat=Mathf.lerpDelta(entity.heat,1,0.05);
      if(used>0.001&&Mathf.chance(0.05*entity.delta())){
        Effects.effect(this.generateEffect,tile.drawx()+Mathf.range(3),tile.drawy()+Mathf.range(3));
      }
    }else{
      entity.heat=Mathf.lerpDelta(entity.heat,0,0.05);
      entity.productionEfficiency=0;
    }
  },
  getLiquidEfficiency(liquid){
    return liquid==Vars.content.getByName(ContentType.liquid,"steam-power-high-pressure-steam")?4:liquid==Vars.content.getByName(ContentType.liquid,"steam-power-steam")?1:0;
  },
});
