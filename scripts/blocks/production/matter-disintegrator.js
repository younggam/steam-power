function getItem(name){
  return Vars.content.getByName(ContentType.item,name);
}
Blocks.overdriveProjector.consumes.add(new ConsumeItemFilter(boolf(item=>item==Items.phasefabric||item==getItem("steam-power-quantum-mass")))).boost();
Blocks.mendProjector.consumes.add(new ConsumeItemFilter(boolf(item=>item==Items.phasefabric||item==getItem("steam-power-quantum-mass")))).boost();
Blocks.forceProjector.consumes.add(new ConsumeItemFilter(boolf(item=>item==Items.phasefabric||item==getItem("steam-power-quantum-mass")))).boost();
const heatL=require("heatWrapper");
const matterDisintegrator=heatL.heatUser(GenericCrafter,GenericCrafter.GenericCrafterEntity,"matter-disintegrator",{
  heatCapacity:3000,
  itemValues:[],
  tmpImage:null,
  pauseImg:null,
  playImg:null,
  cancelImg:null,
  invFrag:extend(BlockInventoryFragment,{
    visible:false,
    isShown(){  return this.visible;},
    showFor(t){
      this.visible=true;
      this.super$showFor(t);
    },
    hide(){
      this.visible=false;
      this.super$hide();
    }
  }),
  _containerItems:[],
  _containerItemMap:new IntMap(4,1),
  getContainerItems(){return this._containerItems;},
  load(){
    this.super$load();
    this.glowRegion=Core.atlas.find(this.name+"-glow");
  },
  init(){
    this.super$init();
    this._containerItems=[new ItemStack(getItem("steam-power-semiconductor"),1),new ItemStack(getItem("metaglass"),2),new ItemStack(getItem("steam-power-dense-alloy"),2)];
    this._containerItems.forEach(item=>this._containerItemMap.put(item.item.id,item));
    var regExpA=/-ore|-dense/i;
    var regExpB=/-alloy|-alloy/i;
    Vars.content.items().each(cons(item=>{
      var value=0;
      value+=Math.pow(Math.max(item.hardness+2,2),0.75);
      value+=Math.pow(Math.max(item.cost,0),0.5);
      value+=regExpA.test(item.name)?0.8:0;
      value+=regExpB.test(item.name)?1.6:0;
      value-=(item.explosiveness+item.flammability+item.radioactivity)*0.25;
      this.itemValues[item.id]=Math.max(value*10,1);
    }));
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(BlockStat.itemCapacity);
    this.stats.add(BlockStat.itemCapacity,"20/10/5 {0}",StatUnit.items.localized());
    this.stats.add(BlockStat.booster,Core.bundle.get("steam-power-heat-cond"),"500");
    this.stats.add(BlockStat.booster,Core.bundle.get("steam-power-heat-per-sec"),"4~24")
    this.stats.add(BlockStat.boostEffect,"0~2.00{0}",StatUnit.timesSpeed.localized());
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof(entity["getHeat"])!=="function"?0.0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof(entity["getHeat"])!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
    this.bars.remove("items");
  },
  acceptItem(item,tile,source){
    if(item==this.outputItem.item) return false;
    const items=tile.ent().items;
    var cap=this.getMaximumAccepted(tile,item);
    if(cap<=10) return items.get(item)<cap;
    var exclude=0;
    this._containerItems.forEach(item=>exclude+=items.get(item.item));
    return items.total()-exclude-items.get(this.outputItem.item)<cap;
  },
  acceptStack(item,amount,tile,source){
    if(item==this.outputItem.item)  return false;
    const items=tile.ent().items;
    if(source!=null&&source.getTeam()!=tile.getTeam()) return 0;
    var cap=this.getMaximumAccepted(tile,item);
    if(cap<=10) return Math.min(cap-items.get(item),amount);
    var exclude=0;
    this._containerItems.forEach(item=>exclude+=items.get(item.item));
    return Math.min(cap+exclude-items.total()+items.get(this.outputItem.item),amount);
  },
  getMaximumAccepted(tile,item){
    var containerItem=this._containerItemMap.get(item.id);
    return containerItem!=null?5*containerItem.amount:20;
  },
  handleStack(item,amount,tile,source){
    const entity=tile.ent();
    const que=entity.getItemQueue();
    entity.items.add(item,amount);
    if(this._containerItemMap.get(item.id)!=null||item==this.outputItem.item) return;
    for(;amount>0;amount--)  que.addLast(item);
  },
  handleItem(item,tile,source){
    const entity=tile.ent();
    const que=entity.getItemQueue();
    entity.items.add(item,1);
    if(this._containerItemMap.get(item.id)!=null||item==this.outputItem.item) return;
    que.addLast(item);
  },
  removeStack(tile,item,amount){
    const entity=tile.ent();
    if(entity==null||entity.items==null) return 0;
    amount=Math.min(amount,entity.items.get(item));
    if(this._containerItemMap.get(item.id)==null&&item!=this.outputItem.item){
      const que=entity.getItemQueue().iterator();
      var tmp,i=amount;
      while(que.hasNext()&&i>0){
        tmp=que.next();
        if(tmp==item){
          que.remove();
          i--;
        }
      }
    }
    entity.items.remove(item,amount);
    return amount;
  },
  update(tile){
    const entity=tile.ent();
    if(entity.isFragShown()&&!this.invFrag.isShown()&&entity.items.total()>0){  this.invFrag.showFor(tile);}
    if(entity.timer.get(this.timerDump,this.dumpTime)) this.tryDump(tile,this.outputItem.item);
    entity.coolDownHeat();
    if(entity.isPaused()||entity.power.status<=0) return;
    if(entity.progress<1){
      var prog=this.getProgressIncrease(entity,this.craftTime);
      if(entity.getCurrentItem()==null){
        const que=entity.getItemQueue();
        if(!que.isEmpty()){
          var tmp=que.removeFirst();
          entity.items.remove(tmp,1);
          entity.setCurrentItem(tmp);
          entity.setValue(this.itemValues[tmp.id]);
          entity.progressValue(prog);
          entity.progress+=prog;
        }
      }else {
        entity.progressValue(prog);
        entity.progress+=prog;
      }
    }else if(entity.progress>=1&&entity.items.has(this._containerItems)&&entity.items.get(this.outputItem.item)<10){
      this.offloadNear(tile,this.outputItem.item);
      entity.progress=0;
    }
  },
  flameColor:Color.valueOf("ffc999a0"),
  darkColor:Color.valueOf("003040ff"),
  lightColor:Color.valueOf("40ff80ff"),
  draw(tile){
    const entity=tile.ent();
    var x=tile.drawx(),y=tile.drawy();
    var doEffect=entity.power.status>0&&entity.getCurrentItem()!=null,scl=Mathf.absin(entity.progress,0.001,1);
    Draw.rect(this.region,x,y);
    Draw.color(this.darkColor,this.lightColor,doEffect?scl:0);
    Draw.rect(this.glowRegion,x,y);
    if(doEffect){
      Draw.color(Color.white);
      Lines.stroke(1.5);
      Lines.circle(x,y,scl+3);
      Draw.color(this.flameColor);
      Lines.stroke(1);
      Lines.circle(x,y,scl+2.75);
    }
    Draw.color();
  },
  buildCommon(entity){
    var cb=Core.bundle;
    var display2=cb.get(this.name+"-display-2");
    var display3=cb.get(this.name+"-display-3");
    if(this.dialog0==null){
      this.dialog0=new FloatingDialog(cb.get(this.name+"-dialog-0"));
      this.dialog0.addCloseButton();
      this.dialog0.marginTop(10);
      this.pauseImg=new Image(Icon.pause);
      this.playImg=new Image(Icon.play);
      this.cancelImg=new Image(Icon.cancel,Pal.remove);
    }
    if(this.dialog1==null){
      this.dialog1=new FloatingDialog("");
      this.dialog1.addCloseButton();
      var valueTable=this.dialog1.cont;
      valueTable.clear();
      valueTable.add(cb.get(this.name+"-dialog-1")).row();
      valueTable.addImage().height(4).pad(6).color(Pal.gray).growX().width(300).row();
      valueTable.table(cons(t=>{
        var a=0;
        for(var i=0;i<this.itemValues.length;i++){
          if(this._containerItemMap.get(i)!=null||i==this.outputItem.id){ continue;}
          t.addImage(Vars.content.items().get(i).icon(Cicon.medium)).padTop(16);
          t.add(this.itemValues[i].toFixed(1)).padRight(16).padTop(16).padLeft(8);
          if(a%4==3) t.row();
          a++;
        }
      }));
    }
    this.dialog0.setUserObject(entity);
    this.dialog0.update(run(()=>{
      if(this.dialog0.getUserObject().isDead()){
        this.dialog0.hide();
        this.dialog1.hide();
      }
    }));
    var cont=this.dialog0.cont;
    cont.clear();
    cont.table(cons(t=>{
      t.add(cb.get(this.name+"-title-0"));
      t.addImage(Icon.warning).color(Pal.remove).visible(boolp(()=>entity.isContainerValid())).padLeft(8);
    })).row();
    cont.addImage().height(4).pad(6).color(Pal.gray).growX().width(300).row();
    cont.table(cons(t=>{
      var items=entity.items;
      for(var i=0;i<3;i++){
        var itemStack=this._containerItems[i];
        t.addImage(itemStack.item.icon(Cicon.medium)).size(48).padBottom(8).padTop(8);
        (function(i,item,amount){
          t.add(items.get(item)+"/").padLeft(8).update(cons(e=>e.setText(items.get(item)+"/")));
          t.add(String(amount)).padLeft(4).padRight(16).update(cons(e=>{if(items.get(item)<amount)e.setColor(Pal.remove);}));
        })(i,itemStack.item,itemStack.amount);
      }
    })).row();
    cont.table(cons(t=>{
      t.add(cb.get(this.name+"-title-1")).padTop(16);
      t.addButton(cons(b=>{
        this.tmpImage=b.add(this.pauseImg);
      }),run(()=>{
        entity.pause();
        this.tmpImage.setElement(entity.isPaused()?this.playImg:this.pauseImg);
      })).size(48).padLeft(8);
      t.addImageButton(Icon.info,run(()=>{
        Vars.ui.showOkText(cb.get(this.name+"-display-0"),cb.get(this.name+"-display-1"),run(()=>{}));
      })).size(48).padLeft(8);
      t.addImageButton(Icon.book,run(()=>{
        this.dialog1.show();
      })).size(48).padLeft(8);
    })).width(300).row();
    cont.addImage().height(4).pad(6).color(Pal.gray).growX().width(300).row();
    cont.add(func(e=>new Bar(prov(()=>(e.progress*100).toFixed(1)+"/100 %"),prov(()=>Color.valueOf("000040")),floatp(()=>e.progress))).get(entity)).width(300).height(72).row();
    cont.add(cb.get(this.name+"-title-2")).padTop(16).row();
    cont.addImage().height(4).pad(6).color(Pal.gray).growX().width(300).row();
    cont.table(cons(tt=>{
      tt.add(new Label("")).update(cons(e=>e.setText(display2+" x"+(entity.power.status*entity.timeScale+Math.max(0,entity.getHeat()/1250-0.4)).toFixed(2)))).padRight(8);
      tt.table(Tex.inventory).update(cons(t=>{
        t.clear();
        var cur=entity.getCurrentItem(),status=entity.power.status;
        t.addImage(Icon.power).color(status<=0?Pal.remove:status>0.99?Pal.accent:Pal.lightOrange).padRight(4);
        if(cur!=null) {
          t.addImage(cur.icon(Cicon.medium));
          var dots="",time=Time.time()%60/15;
          for(var i=1;i<time;i++) dots+=".";
          t.add(display3+dots).padLeft(8);
        }else t.add(this.cancelImg);
      }));
    })).row();
    cont.table().update(cons(t=>{
      t.clear();
      var que=entity.getItemQueue().iterator(),i=0,tmp,tmpAmount=0,last;
      while(que.hasNext())  {
        var tmp=que.next();
        if(last!=tmp){
          if(i!=0)  {
            t.add(String(tmpAmount));
            if(i%4==0) t.row();
            else t.addImage(Icon.left).padRight(8).padLeft(8);
          }
          t.addImage(tmp.icon(Cicon.medium));
          last=tmp;
          tmpAmount=1;
          i++;
        }else tmpAmount++;
      }
      if(i!=0)t.add(String(tmpAmount));
    }));
    this.dialog0.show();
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    this.invFrag.build(table.getParent());
    if(entity.isFragShown()){
      this.invFrag.hide();
      Vars.control.input.frag.config.hideConfig();
    }else{
      table.addImageButton(Icon.info,run(()=>{
        this.buildCommon(entity);
        this.invFrag.hide();
        Vars.control.input.frag.config.hideConfig();
        entity.switchFrag();
      }));
    }
    entity.switchFrag();
  },
  onConfigureTileTapped(tile,other){
    if(tile!=other) {
      tile.entity.switchFrag();
      this.invFrag.hide();
    }
    return true;
  },
  removed(tile){
    this.invFrag.hide();
  },
  generateIcons(){
    return[
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-glow")
    ];
  },
},
{
  _pause:false,
  isPaused(){ return this._pause;},
  pause(){  this._pause=!this._pause;},
  isContainerValid(){ return !this.items.has(this.block.getContainerItems());},
  _isFragShown:false,
  isFragShown(){  return this._isFragShown;},
  switchFrag(){ this._isFragShown=!this._isFragShown;},
  _itemQueue:null,
  getItemQueue(){  return this._itemQueue;},
  _currentItem:null,
  getCurrentItem(){ return this._currentItem;},
  setCurrentItem(a){  this._currentItem=a;},
  _value:0,
  setValue(a){  this._value=a/100;},
  progressValue(b){
    this._value-=b;
    if(this._heat>=500) this._heat-=Time.delta()*this.timeScale*this._heat/7500;
    if(this._value<=0) this._currentItem=null;
  },
  added(){
    if(this._itemQueue==null) this._itemQueue=new Queue(20);
  },
  delta(){
    return Time.delta()*(this.timeScale+Math.max(0,this._heat/1250-0.4));
  },
  write(stream){
    this.super$write(stream);
    stream.writeFloat(this._heat);
    stream.writeByte(this._itemQueue.size);
    var que=this._itemQueue.iterator();
    while(que.hasNext())  stream.writeByte(que.next().id);
    stream.writeByte(this._currentItem==null?-1:this._currentItem.id);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._heat=stream.readFloat();
    var count=stream.readByte();
    var que=new Queue(20);
    for(var i=0;i<count;i++) que.addLast(Vars.content.getByID(ContentType.item,stream.readByte()));
    this._itemQueue=que;
    this._currentItem=Vars.content.getByID(ContentType.item,stream.readByte());
  }
});
matterDisintegrator.configurable=true;
matterDisintegrator.consumes.powerCond(60,boolf(e=>{
  if(typeof e["getCurrentItem"]==="function") return e.getCurrentItem()!=null&&!e.isPaused()&&e.isContainerValid();
  return false;
}));
