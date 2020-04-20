const reservoir=extendContent(Pump,"reservoir",{
  load(){
    this.super$load();
    this.liquidRegion=Core.atlas.find(this.name+"-liquid");
  }
});
