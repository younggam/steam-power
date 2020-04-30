const heatL=require("heatWrapper");
const heatRegulator=heatL.heatUser(Block,TileEntity,"heat-regulator",{
  heatCapacity:500,
  update(tile){
    const entity=tile.ent();
    entity.coolDownHeat();
    if(entity.getHeat()>=this.heatCapacity) entity.kill();
  },
  drawSelect(tile){
    this.drawPlaceText(tile.entity.getUpperLimit(),tile.x,tile.y,true);
  },
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+entity.tile.entity.getHeat().toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>entity.tile.entity==null?0:entity.tile.entity.getHeat()/this.heatCapacity))
    ));
    this.bars.add("heat/sec",func(entity=>
      new Bar(prov(()=>"-"+(entity.getRegulate()*60).toFixed(1)+Core.bundle.get("steam-power-heat-per-sec")),prov(()=>Pal.lancerLaser),floatp(()=>entity.getRegulate()*2))
    ));
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    var group=new ButtonGroup();
    group.setMinCheckCount(0);
    for(var i=0;i<6;i++){
      (function (i,tile){
        if(i/3<1) var button=table.addImageButton(Icon.upOpen,Styles.clearToggleTransi,run(()=>tile.configure(i))).size(44).group(group).update(cons(b=>b.setChecked(false)));
        else {
          if (i/3==1) table.row();
          var button=table.addImageButton(Icon.downOpen,Styles.clearToggleTransi,run(()=>tile.configure(i))).size(44).group(group).update(cons(b=>b.setChecked(false)));
        }
      })(i,tile)
    }
  },
  drawConfigure(tile){
    this.super$drawConfigure(tile);
    this.drawPlaceText(tile.entity.getUpperLimit(),tile.x,tile.y,true);
  },
  configured(tile,player,value){
    const entity=tile.ent();
    switch(value){
      case 0:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()+100,25,499));
        break;
      case 1:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()+10,25,499));
        break;
      case 2:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()+1,25,499));
        break;
      case 3:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()-100,25,499));
        break;
      case 4:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()-10,25,499));
        break;
      case 5:
        entity.setUpperLimit(Mathf.clamp(entity.getUpperLimit()-1,25,499));
        break;
    }
    if(499>=value&&value>=25) entity.setUpperLimit(value);
  },
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    Draw.color(Pal.lancerLaser);
    Draw.alpha(entity.getRegulate()*2);
    Draw.rect(Core.atlas.find(this.name+"-light"),tile.drawx(),tile.drawy());
    Draw.color();
    Draw.rect(this.name+"-top",tile.drawx(),tile.drawy());
  },
  generateIcons(){
    return [
      Core.atlas.find(this.name),
      Core.atlas.find(this.name+"-top")
    ];
  },
  drawLight(tile){
    Vars.renderer.lights.add(tile.drawx(),tile.drawy(),(Mathf.absin(10,0.5)+20*(0.5+2*tile.entity.getRegulate()))*this.size,Pal.lancerLaser,0.4);
  },
},
{
  coolDownHeat(){
    if(this._heat>25){
      this._heat-=Time.delta()*this._heat/1200;
    }else if(this._heat<25){
      this._heat=25;
    }
    if(this.power.status>0){
      this._regulate=Mathf.clamp(this._heat-this._upperLimit,0,0.5);
      this._heat-=this._regulate*this.power.status*Time.delta();
    }
  },
  getUpperLimit(){
    return this._upperLimit;
  },
  setUpperLimit(a){
    this._upperLimit=a;
  },
  _upperLimit:100,
  getRegulate(){
    return this._regulate;
  },
  _regulate:0,
  config(){
    return this._upperLimit;
  },
  write(stream){
    this.super$write(stream);
    stream.writeFloat(this._heat);
    stream.writeShort(this._upperLimit);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._heat=stream.readFloat();
    this._upperLimit=stream.readShort();
  }
});
heatRegulator.consumes.add(extend(ConsumePower,{
  requestedPower(entity){
    return entity==null?0:Math.round(entity.getRegulate()*100)/10;
  }
}));
heatRegulator.update=true;
heatRegulator.sync=true;
heatRegulator.baseExplosive=5;
heatRegulator.solid=true;
heatRegulator.canOverdrive=false;
heatRegulator.configurable=true;
