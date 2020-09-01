const multiLib=require("multi-lib2/wrapper");
const furnaces=this.global.furnaces;
const advancedFurnace=multiLib.extend(GenericCrafter,"advanced-furnace",
[
  {
    input:{
      items:["steam-power-copper-ore/1"],
      power:0.6
    },
    output:{
      items:["copper/1"],
      liquids:["slag/1"]
    },
    craftTime:50
  },
  {
    input:{
      items:["steam-power-lead-ore/1"],
      power:0.6
    },
    output:{
      items:["lead/1"],
      liquids:["slag/1"]
    },
    craftTime:50
  },
  {
    input:{
      items:["steam-power-iron-ore/1"],
    },
    output:{
      items:["steam-power-iron/1"],
      liquids:["slag/1"]
    },
    craftTime:100
  },
  {
    input:{
      items:["steam-power-titanium-ore/1"],
      power:0.6
    },
    output:{
      items:["titanium/1"],
      liquids:["slag/1"]
    },
    craftTime:50
  },
  {
    input:{
      items:["sand/1"],
      power:0.6
    },
    output:{
      items:["steam-power-glass/1"],
      liquids:[]
    },
    craftTime:50
  },
  {
    input:{
      items:["scrap/1"],
      power:0.6
    },
    output:{
      liquids:["slag/2"]
    },
    craftTime:25
  },
],
{
  setBars(){
    this.super$setBars();
    //initialize
    this.bars.remove("liquid");
    this.bars.remove("items");
    //display every Liquids that can contain
    var i=0;
    if(!this.liquidSet.isEmpty()){
      this.liquidSet.each(cons(k=>{
        this.bars.add("liquid"+i,func(entity=>
          new Bar(prov(()=>k.localizedName),prov(()=>k.barColor()),floatp(()=>entity.liquids.get(k)/this.liquidCapacity))
        ));
        i++;
      }));
    }
    this.bars.add("multiplier",func(entity=>
      new Bar(prov(()=>Core.bundle.formatFloat("bar.efficiency",entity.warmup*100*(entity.items.get(Items.coal)>0?2.5:1),1)),prov(()=>Pal.ammo),floatp(()=>entity.warmup*(entity.items.get(Items.coal)>0?2.5:1)))
    ));
  },
  //for dislpying info
  setStats(){
    this.itemList[this.itemList.length]=Items.coal;
    this.super$setStats();
    this.stats.remove(BlockStat.powerUse);
    this.stats.remove(BlockStat.productionTime);
    this.stats.add(BlockStat.booster,new ItemListValue(ItemStack(Items.coal,1)))
    this.stats.add(BlockStat.boostEffect,2.5,StatUnit.timesSpeed);
    var recLen=this.recs.length;
    //crafTimes
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
      if(this.powerBarI){
        this.stats.add(BlockStat.powerUse,i+1,StatUnit.none);
        if(this.recs[i].input.power>0) this.stats.add(BlockStat.powerUse,this.recs[i].input.power*60,StatUnit.powerSecond);
        else this.stats.add(BlockStat.powerUse,0,StatUnit.powerSecond);
      }
    }
  },
  //custom function for consumeing items and liquids
  customCons(tile,i){
    const entity=tile.ent();
    var excute=this.checkCond(tile,i);
    entity.saveCond(excute);
    if(excute){
      //do produce
      if(entity.getProgress(i)!=0&&entity.getProgress(i)!=null){
        entity.progress=entity.getProgress(i);
        entity.saveProgress(i,0);
      }
      entity.progress+=(entity.items.get(Items.coal)>0?2.5:1)*entity.warmup*this.getProgressIncreaseA(entity,i,this.recs[i].craftTime);
      if(entity.items.get(Items.coal)>0){
        var oldProgress=entity.totalProgress;
        var prog=Time.delta()
        entity.totalProgress+=prog;
        if(entity.totalProgress>=120) {
          entity.items.remove(Items.coal,1);
          entity.totalProgress=0;
        }
        if(entity.totalProgress%120<=prog&&entity.totalProgress!=0&&!(oldProgress<=prog)) entity.items.remove(Items.coal,1);
      }
      entity.warmup=Mathf.lerpDelta(entity.warmup,1,0.02);
      if(Mathf.equal(entity.warmup,1,0.02)){
        entity.warmup=1;
      }
      if(Mathf.chance(Time.delta()*this.updateEffectChance)){
        Effects.effect(this.updateEffect,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }else  entity.warmup=Mathf.lerp(entity.warmup,0,0.02);
  },
  //decides which item to accept
  acceptItem(item,tile,source){
    const entity=tile.ent();
    if(typeof entity["items"]!=="object") return false;
    if(entity.items.get(item)>=this.itemCapacity) return false;
    return item==Items.coal||this.inputItemSet.contains(item);
  },
  placed(tile){
    this.super$placed(tile);
    this.register(tile.entity,1);
  },
  register(entity,value){
    if(entity!=null)furnaces.update(entity,value);
  },
  removed(tile){
    this.register(tile.entity,1);
    this.register(tile.entity,0);
    this.invFrag.hide();
  },
  customUpdate(tile){
    const entity=tile.ent();
    if(entity==null) return;
    if(entity.getToggle()==-1)entity.warmup=Mathf.lerp(entity.warmup,0,0.02);
    if(Time.time()%60<Time.delta()) this.register(entity,1);
  },
  //custom function that checks space for item and liquid
  checkoutput(tile,i){
    const entity=tile.ent();
    //items
    var items=this.recs[i].output.items;
    for(var j=0,len=items.length;j<len;j++){
      if(entity.items.get(items[j].item)+items[j].amount>this.itemCapacity) return true;
    }
    return false;
  },
  configured(tile,player,value){
    const entity=tile.ent();
    const old=entity.getToggle();
    if((old==1||old==0)&&value!=1&&value!=0) furnaces.sizes[tile.getTeam()]--;
    if((value==1||value==0)&&old!=1&&old!=0) furnaces.sizes[tile.getTeam()]++;
    if(old>=0) entity.saveProgress(old,entity.progress);
    if(value==-1) entity.saveCond(false);
    entity.progress=0;
    entity.setToggle(value);
  },
  random:new Rand(0),
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    if(entity.warmup>0.01) {
      Draw.color(Color.salmon);
      Draw.alpha(entity.warmup);
      Draw.rect(this.topRegion,tile.drawx(),tile.drawy());
      if(entity.warmup>0.4) {
        var seeds=Math.round(entity.warmup*12);
        Draw.color(Color.valueOf("474747"),Color.gold,entity.warmup);
        this.random.setSeed(tile.pos());
        for(var i=0;i<seeds;i++){
          var offset=this.random.nextFloat()*999999;
          var x=this.random.range(6),y=this.random.range(6);
          var life=1-(((Time.time()+offset)/50)%6);
          if(life>0){
            Lines.stroke(entity.warmup*(life*1+0.2));
            Lines.poly(tile.drawx()+x,tile.drawy()+y,8,(1-life)*3);
          }
        }
      }
      Draw.color();
    }
  },
  load(){
    this.super$load();
    this.topRegion=Core.atlas.find(this.name+"-top")
  }
},{});
advancedFurnace.dumpToggle=false;
