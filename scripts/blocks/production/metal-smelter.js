const multiLib=require("multi-lib2/wrapper");
const metalSmelter=multiLib.extend(GenericSmelter,"metal-smelter",[
  {
    input:{
      items:["copper/3","lead/4","titanium/2","steam-power-iron/3"],
      power:5
    },
    output:{
      items:["surge-alloy/1"]
    },
    craftTime:75
  },
  {
    input:{
      items:["steam-power-iron/2","graphite/1"],
      power:8
    },
    output:{
      items:["steam-power-steel/1"]
    },
    craftTime:90
  },
  {
    input:{
      items:["steam-power-steel/2","steam-power-depleted-uranium/1","plastanium/1"],
      power:11
    },
    output:{
      items:["steam-power-dense-alloy/1"]
    },
    craftTime:90
  },
  {
    input:{
      items:["steam-power-quantum-mass/1","plastanium/2","graphite/1"],
      power:20
    },
    output:{
      items:["steam-power-dimension-armour/1"]
    },
    craftTime:150
  },
],
{
  heatCons:[0,0.15,0.2,0.25],
  heatCond:[0,100,360,840],
  heatCapacity:1500,
  update(tile){
    const entity=tile.ent();
    if(!this.invFrag.isShown()&&Vars.control.input.frag.config.isShown()&&Vars.control.input.frag.config.getSelectedTile()==tile){  this.invFrag.showFor(tile);}
    var recLen=this.recs.length;
    var current=entity.getToggle();
    entity.coolDownHeat();
    //calls customCons and customProd
    if(current>=0) {
      this.customCons(tile,current);
      if(entity.progress>=1) this.customProd(tile,current);
    }
    var eItems=entity.items;
    var eLiquids=entity.liquids;
    //dump
    var itemTimer=entity.timer.get(this.timerDump,this.dumpTime);
    if(this.dumpToggle&&current>-1){
      var items=this.recs[current].output.items;
      var liquids=this.recs[current].output.liquids;
      if(itemTimer){
        for(var i=0,len=items.length;i<len;i++){
          if(eItems.has(items[i].item)){
            this.tryDump(tile,items[i].item);
            break;
          }
        }
      }
      for(var i=0,len=liquids.length;i<len;i++){
        if(eLiquids.get(liquids[i].liquid)>0.001){
          this.tryDumpLiquid(tile,liquids[i].liquid);
          break;
        }
      }
    }else{
      //TODO 반복문 줄이기
      if(itemTimer&&eItems.total()>0){
        var itemIter=this.outputItemSet.iterator();
        while(itemIter.hasNext()){
          var item=itemIter.next();
          if(eItems.has(item)){
            this.tryDump(tile,item);
            break;
          }
        }
      }
      if(eLiquids.total()>0.001){
        var liquidIter=this.outputLiquidSet.iterator();
        while(liquidIter.hasNext()){
          var liquid=liquidIter.next();
          if(eLiquids.get(liquid)>0.001){
            this.tryDumpLiquid(tile,liquid);
            break;
          }
        }
      }
    }
    if(entity.getHeat()>=this.heatCapacity) entity.kill();
  },
  setStats(){
    this.super$setStats();
    var heatPSec=Core.bundle.get("steam-power-heat-per-sec");
    var heatC=Core.bundle.get("steam-power-heat-cond");
    this.stats.remove(BlockStat.powerUse);
    this.stats.remove(BlockStat.productionTime);
    var recLen=this.recs.length;
    for(var i=0;i<recLen;i++){
      var rec=this.recs[i];
      var outputItems=rec.output.items,inputItems=rec.input.items;
      var outputLiquids=rec.output.liquids,inputLiquids=rec.input.liquids;
      this.stats.add(BlockStat.productionTime,i+1,StatUnit.none);
      this.stats.add(BlockStat.productionTime,rec.craftTime/60,StatUnit.seconds);
      this.stats.add(BlockStat.input,i+1,StatUnit.none);
      //items
      for(var l=0,len=inputItems.length;l<len;l++) this.stats.add(BlockStat.input,inputItems[l]);
      //liquids
      for(var l=0,len=inputLiquids.length;l<len;l++) this.stats.add(BlockStat.input,inputLiquids[l].liquid,inputLiquids[l].amount,false);
      this.stats.add(BlockStat.output,i+1,StatUnit.none);
      //items
      for(var jj=0,len=outputItems.length;jj<len;jj++) this.stats.add(BlockStat.output,outputItems[jj]);
      //liquids
      for(var jj=0,len=outputLiquids.length;jj<len;jj++) this.stats.add(BlockStat.output,outputLiquids[jj].liquid,outputLiquids[jj].amount,false);
      this.stats.add(BlockStat.powerUse,i+1,StatUnit.none);
      this.stats.add(BlockStat.powerUse,this.recs[i].input.power*60,StatUnit.powerSecond);
      this.stats.add(BlockStat.powerDamage,i+1,StatUnit.none);
      this.stats.add(BlockStat.powerDamage,heatPSec,String(this.heatCons[i]*60));
      this.stats.add(BlockStat.powerRange,i+1,StatUnit.none);
      this.stats.add(BlockStat.powerRange,heatC,String(this.heatCond[i]));
    }
  },
  setBars(){
    this.super$setBars();
    //initialize
    this.bars.remove("liquid");
    this.bars.remove("items");
    this.outputsPower=false;
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof(entity["getHeat"])!=="function"?0.0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
  },
  inputsHeat(tile){
    return true;
  },
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    Sounds.explosionbig.at(tile);
    const entity=tile.ent();
    if(entity.getHeat()<this.heatCapacity/2) return;
    Effects.effect(Fx.pulverize,tile.worldx(),tile.worldy());
    Damage.damage(tile.worldx(),tile.worldy(),16*this.size,50);
  },
  drawLight(tile){
    Vars.renderer.lights.add(tile.drawx(),tile.drawy(),(10+tile.entity.getHeat()/20+Mathf.absin(10,0.5))*this.size,Color.scarlet,0.4);
  },
  checkinput(tile,i){
    const entity=tile.ent();
    //items
    var items=this.recs[i].input.items;
    var liquids=this.recs[i].input.liquids;
    for(var j=0,len=items.length;j<len;j++){
      if(entity.items.get(items[j].item)<items[j].amount) return true;
    }
    //liquids
    for(var j=0,len=liquids.length;j<len;j++){
      if(entity.liquids.get(liquids[j].liquid)<liquids[j].amount) return true;
    }
    return this.heatCond[i]>entity.getHeat();
  },
},{
  _heat:25,
  getHeat(){
    return this._heat;
  },
  setHeat(a){
    this._heat=a;
  },
  addHeat(b){
    this._heat+=b;
  },
  coolDownHeat(){
    if(this._heat>25){
      this._heat-=Time.delta()*this._heat/1200;
    }else if(this._heat<25){
      this._heat=25;
    }
  },
  write(stream){
    this.super$write(stream);
    stream.writeShort(this._toggle);
    stream.writeFloat(this._heat);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._toggle=stream.readShort();
    this._heat=stream.readFloat();
  }
});
metalSmelter.dumpToggle=true;
