const hyperloopConveyor=extendContent(ArmoredConveyor,"hyperloop-conveyor",{
  update(tile){
    const e=tile.ent();
    if(e.cons.valid()&&e.efficiency()>=0.9){
      this.super$update(tile);
      e.cons.trigger();
    }
    else{
      return;
    }
  },
  shouldIdleSound(tile){
    if(tile.entity.cons.valid()&&tile.entity.efficiency()>=0.9&&tile.entity.clogHeat<=0.5){
      return false;
    }else{
      return true;;
    }
  },
  draw(tile){
    if(tile.entity.cons.valid()&&tile.entity.efficiency()>=0.9){
      this.super$draw(tile);
    }else{
      Draw.rect(
        Core.atlas.find(this.name+"-"+Mathf.clamp(tile.entity.getBlend(0), 0, 3)+"-"+0)
        , tile.drawx(), tile.drawy()
        , Vars.tilesize * tile.entity.getBlend(1)
        , Vars.tilesize * tile.entity.getBlend(2), tile.rotation() * 90);
    }
  },
  onProximityUpdate(tile){
    this.super$onProximityUpdate(tile);
    const entity=tile.ent();
    entity.setBlend(this.buildBlending(tile,tile.rotation(),null,true));
  },
});
hyperloopConveyor.entityType=prov(()=>extend(Conveyor.ConveyorEntity,{
  setBlend(a){
    this._blend0=a[0];
    this._blend1=a[1];
    this._blend2=a[2];
  },
  getBlend(b){
    if (b==0)return this._blend0;
    if (b==1)return this._blend1;
    if (b==2)return this._blend2
  },
  _blend0:null,
  _blend1:null,
  _blend2:null,
}));
