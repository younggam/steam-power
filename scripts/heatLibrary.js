const _common={
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
};
const _user=Object.assign({
  inputsHeat(tile){
    return true;
  },
},_common);
const _giver=Object.assign({
  giveHeat(tile){
    var proximity=tile.entity.proximity();
    var dump=tile.rotation();
    var index=0;
    var others=[];
    var totalHeat=0;
    for(var i=0;i<proximity.size;i++){
      this.incrementDump(tile,proximity.size);
      var other=proximity.get((i+dump)%proximity.size);
      if(other.getTeam()==tile.getTeam()&&typeof(other.block()["inputsHeat"])==="function"){
        if(other.entity.getHeat()<tile.entity.getHeat()&&other.block().inputsHeat(other)){
          totalHeat+=other.entity.getHeat();
          others[index]=other;
          index++;
        }
      }
    }
    if(others.length>0){
      var avgHeat=(totalHeat+tile.entity.getHeat())/(others.length+1);
      for(var j=0;j<others.length;j++){
        others[j].entity.setHeat(avgHeat);
      }
      tile.entity.setHeat(avgHeat);
    }
  }
},_common);
const _heatProps={
  getHeat(){
    return this._heat;
  },
  setHeat(a){
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
  write(stream){
    this.super$write(stream);
    stream.writeFloat(this._heat);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._heat=stream.readFloat();
  }
}
module.exports={
  user:_user,
  giver:_giver,
  common:_common,
  heatProps:_heatProps
}
