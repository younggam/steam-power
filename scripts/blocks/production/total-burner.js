const heatL=require("heatWrapper");
const totalBurner=heatL.heatGiver(Block,TileEntity,"total-burner",{
  heatCapacity:3000,
  heatProduction:[0.4,1,1],
  minItemEfficiency:0.2,
  consumeItems:[],
  consLiquid:null,
  outputLiquid:null,
  invFrag:extend(BlockInventoryFragment,{
    _built:false,
    isBuilt(){  return this._built;},
    visible:false,
    isShown(){  return this.visible;},
    showFor(t){
      this.visible=true;
      this.super$showFor(t);
    },
    hide(){
      this.visible=false;
      this.super$hide();
    },
    build(parent){
      this._built=true;
      this.super$build(parent);
    }
  }),
  outputsItems(){
    return false;
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.powerUse);
    for(var i=0;i<3;i++){
      this.stats.add(BlockStat.basePowerGeneration,i+1,StatUnit.none);
      this.stats.add(BlockStat.basePowerGeneration,Core.bundle.get("steam-power-heat-per-sec"),String(this.heatProduction[i]*60));
      this.stats.add(BlockStat.powerUse,i+1,StatUnit.none);
      this.stats.add(BlockStat.powerUse,i==0?300:i==2?480:0,StatUnit.powerSecond);
    }
    this.stats.add(BlockStat.input,new ItemFilterValue(boolf(item=>item.flammability>=this.minItemEfficiency&&item.explosiveness<=0.7)));
    this.stats.add(BlockStat.input,this.consLiquid.liquid,this.consLiquid.amount*60,true);
    this.stats.add(BlockStat.productionTime,1,StatUnit.seconds);
  },
  setBars(){
    this.super$setBars();
    this.bars.remove("liquid");
    this.bars.remove("items");
    var hotCryofluid=this.consLiquid.liquid;
    this.bars.add("hotCryo",func(entity=>
      new Bar(prov(()=>hotCryofluid.localizedName),prov(()=>hotCryofluid.barColor()),floatp(()=>entity.liquids.get(hotCryofluid)/this.liquidCapacity))
    ));
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof  entity["getHeat"]!=="function"?0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
    var cryofluid=Liquids.cryofluid
    this.bars.add("cryo",func(entity=>
      new Bar(prov(()=>cryofluid.localizedName),prov(()=>cryofluid.barColor()),floatp(()=>entity.liquids.get(cryofluid)/this.liquidCapacity))
    ));
  },
  displayConsumption(tile,table){
    const entity=tile.ent();
    table.left();
    var image=new MultiReqImage();
    this.consumeItems.forEach(i=>image.add(new ReqImage(new ItemImage(i.icon(Cicon.medium),1),boolp(()=>typeof entity["items"]==="object"&&entity.items.has(i)))));
    table.add(image).size(8*4);
    var liquid=this.consLiquid;
    table.add(new ReqImage(new ItemImage(liquid.liquid.icon(Cicon.medium),liquid.amount),boolp(()=>typeof entity["liquids"]==="object"&&entity.liquids.get(liquid.liquid)>liquid.amount))).size(8*4);
  },
  init(){
    Vars.content.items().each(cons(item=>{
      if(item.flammability>=this.minItemEfficiency&&item.explosiveness<=0.7)  this.consumeItems.push(item);
    }));
    this.consLiquid=new LiquidStack(Vars.content.getByName(ContentType.liquid,"steam-power-hot-cryofluid"),1.2);
    this.outputLiquid=new LiquidStack(Liquids.cryofluid,0.4);
    this.super$init();
  },
  acceptItem(item,tile,source){
    return tile.entity.items.get(item)<this.itemCapacity&&this.consumeItems.includes(item);
  },
  acceptLiquid(tile,source,liquid,amount){
    return tile.entity.liquids.get(liquid)+amount<=this.liquidCapacity&&liquid==this.consLiquid.liquid;
  },
  update(tile){
    const entity=tile.ent();
    if(!this.invFrag.isShown()&&Vars.control.input.frag.config.isShown()&&Vars.control.input.frag.config.getSelectedTile()==tile){  this.invFrag.showFor(tile);}
    entity.coolDownHeat();
    if(entity.getHeat()>25) this.giveHeat(tile);
    var delta=entity.delta();
    var power=entity.power.status;
    var doEffect=false;
    var toggle=entity.getToggle();
    var eLiquids=entity.liquids;
    var toAdd=0;
    if(toggle[0]&&power>0){
      doEffect=true;
      toAdd+=this.heatProduction[0]*power*delta;
    }
    if(toggle[1]){
      if(entity.getProgressItem()<=0&&entity.items.total()>0){
        doEffect=true;
        entity.setCurrentItem(entity.items.take());
        entity.setProgressItem(1);
        toAdd+=this.heatProduction[1]*entity.getCurrentItem().flammability*delta;
      }else if(entity.getProgressItem()>0){
        doEffect=true;
        entity.doProgressItem();
        toAdd+=this.heatProduction[1]*entity.getCurrentItem().flammability*delta;
      }
    }
    entity.setUsed(0);
    var o=this.outputLiquid;
    if(toggle[2]&&power>0){
      var c=this.consLiquid;
      var current=eLiquids.get(c.liquid);
      var space=this.liquidCapacity-eLiquids.get(o.liquid);
      if(current>0&&space>0.001){
        var used=power*Math.min(c.amount*delta,current*delta,space);
        var rate=used/c.amount;
        entity.setUsed(rate/delta);
        this.useContent(tile,o.liquid);
        eLiquids.add(o.liquid,o.amount*rate);
        toAdd+=this.heatProduction[2]*rate;
        eLiquids.remove(c.liquid,used);
        doEffect=true;
      }
    }
    entity.addHeat(toAdd);
    this.tryDumpLiquid(tile,o.liquid);
    if(doEffect&&Mathf.chance(Time.delta()/40)) Effects.effect(Fx.pulverizeSmall,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
    if(entity.getHeat()>=this.heatCapacity) entity.kill();
  },
  draw(tile){
    this.super$draw(tile);
    const entity=tile.ent();
    var eLiquids=entity.liquids;
    var liquid1=this.consLiquid.liquid,liquid2=this.outputLiquid.liquid;
    var x=tile.drawx(),y=tile.drawy();
    if(entity.getHeat()>=300) {
      Draw.color(Color.red,Color.orange,Math.min(entity.getHeat()/2500,1));
      Draw.alpha(tile.entity.getHeat()/this.heatCapacity);
      Draw.rect(this.heatRegion,x,y);
    }
    if(eLiquids.get(liquid1)>0.001){
      Draw.color(liquid1.color);
      Draw.alpha(eLiquids.get(liquid1)/this.liquidCapacity);
      Draw.rect(this.liquid1Region,x,y);
    }
    if(eLiquids.get(liquid2)>0.001){
      Draw.color(liquid2.color);
      Draw.alpha(eLiquids.get(liquid2)/this.liquidCapacity);
      Draw.rect(this.liquid2Region,x,y);
    }
    Draw.color();
    Draw.rect(this.topRegion,x,y);
  },
  load(){
    this.super$load();
    this.heatRegion=Core.atlas.find(this.name+"-heat");
    this.topRegion=Core.atlas.find(this.name+"-top");
    this.liquid1Region=Core.atlas.find(this.name+"-liquid-1");
    this.liquid2Region=Core.atlas.find(this.name+"-liquid-2");
  },
  generateIcons(){
    return[
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-top")
    ];
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    if(!this.invFrag.isBuilt()) this.invFrag.build(table.getParent());
    if(this.invFrag.isShown()){
      this.invFrag.hide();
      Vars.control.input.frag.config.hideConfig();
      return;
    }
    var group=new ButtonGroup();
    group.setMinCheckCount(0);
    group.setMaxCheckCount(-1);
    var itemLen=this.consumeItems.length;
    var toggle=entity.getToggle();
    var liquidIcon=new TextureRegionDrawable(this.consLiquid.liquid.icon(Cicon.medium));
    var itemIcons=this.consumeItems.map(a=>new TextureRegionDrawable(a.icon(Cicon.medium)));
    for(var i=0;i<3;i++){
      (function(i){
        var b=table.addImageButton(Tex.whiteui,Styles.clearToggleTransi,40,run(()=>{
          tile.configure(i);
        })).group(group).get();
        b.update(run(()=>{
          b.setChecked(toggle[i]);
          b.getStyle().imageUp=i==0?Icon.power:i==2?liquidIcon:itemIcons[Math.floor((Time.time()/60)%itemLen)];
        }));
      })(i);
    }
  },
  configured(tile,player,value){
    const entity=tile.ent();
    var toggle=entity.getToggle();
    if(value<=2)  entity.switchToggle(value);

    else {
      toggle[0]=(value&16)>0;
      toggle[1]=(value&8)>0;
      toggle[2]=(value&4)>0;
    }
  },
  onConfigureTileTapped(tile,other){
    if(tile!=other) this.invFrag.hide();
    return true;
  },
  removed(tile){
    this.invFrag.hide();
  }
},{
  _currentItem:null,
  setCurrentItem(i){  this._currentItem=i;},
  getCurrentItem(){ return this._currentItem;},
  _progressItem:0,
  setProgressItem(p){ this._progressItem=p;},
  doProgressItem(){  this._progressItem-=this.delta()/60;},
  getProgressItem(){  return this._progressItem;},
  _progressLiquid:0,
  setProgressLiquid(p){ this._progressLiquid=p;},
  getProgressLiquid(){  return this._progressLiquid;},
  _toggle:[true,true,true],
  getToggle(){ return this._toggle;},
  switchToggle(i){  this._toggle[i]=!this._toggle[i];},
  _used:0,
  getUsed(){ return this._used;},
  setUsed(b){ this._used=b;},
  config(){
    var t=this._toggle;
    return (t[0]?16:32)+(t[1]?8:32)+(t[2]?4:32);
  },
  write(stream){
    this.super$write(stream);
    stream.writeFloat(this._heat);
    for(var i=0;i<3;i++)  stream.writeBoolean(this._toggle[i]);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._heat=stream.readFloat();
    for(var i=0;i<3;i++)  this._toggle[i]=stream.readBoolean();
  }
});
totalBurner.update=true;
totalBurner.sync=true;
totalBurner.baseExplosive=5;
totalBurner.hasItems=true;
totalBurner.hasLiquids=true;
totalBurner.solid=true;
totalBurner.hasPower=true;
totalBurner.consumes.add(extend(ConsumePower,{
  requestedPower(entity){
    if(typeof entity["getToggle"]!=="function") return 0;
    var toggle=entity.getToggle();
    return (toggle[0]?5:0)+(toggle[2]&&entity.getUsed()>0?8*entity.getUsed():0);
  }
}));
totalBurner.configurable=true;
