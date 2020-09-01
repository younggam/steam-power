const heatL=require("heatWrapper");
const heatPhaseBridge=heatL.heatBridge(ItemBridge,ItemBridge.ItemBridgeEntity,"heat-phase-bridge",{
  heatCapacity:1000,
  setBars(){
    this.super$setBars();
    this.bars.add("heat",func(entity=>
      new Bar(prov(()=>Core.bundle.format("bar.heat")+": "+(typeof  entity["getHeat"]!=="function"?0:entity.getHeat()).toFixed(1)),prov(()=>Pal.lightFlame),floatp(()=>typeof entity["getHeat"]!=="function"?0:entity.getHeat()/this.heatCapacity))
    ));
  },
  inputsHeat(tile){
    return this.linkValid(tile,Vars.world.tile(tile.entity.link));
  },
  acceptItem(item,tile,source){return false;},
  acceptLiquid(tile,source,liquid,amount){return false;},
  update(tile){
    const entity=tile.ent();
    entity.coolDownHeat();
    var other=Vars.world.tile(entity.link);
    if(!this.linkValid(tile,other)){
      entity.uptime=0;
      this.giveHeat(tile);
    }else if(entity.cons.valid()&&Mathf.zero(1-entity.efficiency())){
      entity.uptime=Mathf.lerpDelta(entity.uptime,1,0.04);
      this.updateTransport(tile,other);
    }else entity.uptime=Mathf.lerpDelta(entity.uptime,0,0.02);
    if(entity.getHeat()>=this.heatCapacity) entity.kill();
  },
  updateTransport(tile,other){
    const entity=tile.ent();
    if(other.entity.getHeat()<entity.getHeat()){
      var avgHeat=(other.entity.getHeat()+entity.getHeat())/2;
      other.entity.setHeat(avgHeat);
      entity.setHeat(avgHeat);
    }
  },
  linkValid(tile,other,checkDouble){
    if(other==null||tile==null||tile==other) return false;
    if(other.ent()==null) return false;
    if(other.ent().link==tile.pos()) return false;
    if(!Mathf.within(tile.x,tile.y,other.x,other.y,this.range+0.5)) return false;
    return other.block()==this&&(!checkDouble||other.ent().link!=tile.pos());
  },
  drawPlace(x,y,rotation,valid){
    var link=this.findLink(x,y);
    Drawf.dashCircle(x*Vars.tilesize,y*Vars.tilesize,this.range*Vars.tilesize,Pal.placing);
    Draw.reset();
    Draw.color(Pal.placing);
    if(link!=null){
      var rot=Mathf.angle(x-link.x,y-link.y);
      var dst=Mathf.dst(x,y,link.x,link.y);
      var cos=Mathf.cosDeg(rot),sin=Mathf.sinDeg(rot);
      var h=Vars.tilesize;
      var w=(dst-1)*h;
      Fill.rect((link.x+cos*dst/2+sin/2)*h,(link.y+sin*dst/2-cos/2)*h,w,1,rot);
      Fill.rect((link.x+cos*dst/2-sin/2)*h,(link.y+sin*dst/2+cos/2)*h,w,1,rot);
      Fill.rect((link.x+cos/2)*h,(link.y+sin/2)*h,1,h,rot);
      Fill.rect((x-cos/2)*h,(y-sin/2)*h,1,h,rot);
      Draw.rect("bridge-arrow",link.x*h+cos*h,link.y*h+sin*h,rot);
    }
    Draw.reset();
  },
  drawConfigure(tile){
    const entity=tile.ent();
    Draw.color(Pal.accent);
    Lines.stroke(1);
    Lines.square(tile.drawx(),tile.drawy(),tile.block().size*Vars.tilesize/2+1);
    Geometry.circle(tile.x,tile.y,this.range+1,new Intc2(){get:(x, y) => {
      other=Vars.world.ltile(x,y);
      if(this.linkValid(tile,other)) {
          var linked=other.pos()==entity.link;
          Draw.color(linked?Pal.place:Pal.breakInvalid);
          Lines.square(other.drawx(),other.drawy(),
          other.block().size*Vars.tilesize/2+1+(linked?0:Mathf.absin(Time.time(),4,1)));
      	}
      }
    });
    Draw.reset();
  },
  drawLayer(tile){
    const entity=tile.ent();
    var other=Vars.world.tile(entity.link);
    if(!this.linkValid(tile,other)) return;
    var opacity=Core.settings.getInt("bridgeopacity")/100;
    if(Mathf.zero(opacity)) return;
    var rot=Mathf.angle(other.x-tile.x,other.y-tile.y);
    Draw.color(Color.white,Color.salmon,entity.getHeat()/this.heatCapacity);
    Draw.alpha(Math.max(0.25,entity.uptime)*opacity);
    Draw.rect(this.endRegion,tile.drawx(),tile.drawy(),rot+90);
    Draw.rect(this.endRegion,other.drawx(),other.drawy(),rot+270);
    Lines.stroke(8);
    Lines.line(this.bridgeRegion,tile.worldx(),tile.worldy(),other.worldx(),other.worldy(),CapStyle.none,-Vars.tilesize/2);
    Draw.color();
  },
  draw(tile){
    this.super$draw(tile);
    Draw.color(Color.red,Color.orange,Math.max(0,Math.min((tile.entity.getHeat()-374)/100,1)));
    Draw.alpha(tile.entity.getHeat()/this.heatCapacity);
    Draw.rect(this.heatRegion,tile.drawx(),tile.drawy());
    Draw.color();
  },
  load(){
    this.super$load();
    this.heatRegion=Core.atlas.find(this.name+"-heat");
  }
},
{
  coolDownHeat(){
    if(this._heat>25){
      this._heat-=Time.delta()*this._heat/12000;
    }else if(this._heat<25){
      this._heat=25;
    }
  },
});
heatPhaseBridge.hasLiquids=false;
heatPhaseBridge.hasItems=false;
heatPhaseBridge.canOverdrive=false;
