importPackage(Packages.arc.audio);
importPackage(Packages.arc.mock);
var sounds=this.global.sounds;
function loadsound(name){
  var path="sounds/"+name+".ogg";
  if(Vars.headless) {
    sounds[name]=new MockSound();
    return;
  }
  if(Core.assets.contains(path,Sound)) sounds[name]=Core.assets.get(path,Sound);
  else Core.assets.load(path,Sound).loaded=cons(a=>sounds[name]=a);
}
loadsound("yamato-charge");
loadsound("yamato-fire");
loadsound("laser-0");
loadsound("laser-1");
loadsound("laser-2");
if (typeof(floatc)==="undefined")  const floatc = method => new Floatc(){get : method};
if (typeof(floatc2)==="undefined")  const floatc2 = method => new Floatc2(){get : method};
var yamatoHit=newEffect(14,e=>{
  Draw.color(Color.white,Pal.lightOrange,e.fin());
  e.scaled(7,cons(s=>{
    Lines.stroke(0.5+s.fout());
    Lines.circle(e.x,e.y,s.fin()*20);
  }));
  Lines.stroke(0.5+e.fout());
  Angles.randLenVectors(e.id,12,e.fin()*60,floatc2((x,y)=>{
    var ang=Mathf.angle(x,y);
    Lines.lineAngle(e.x+x,e.y+y,ang,e.fout()*4+1.5);
  }));
})
const soundBullet=new BasicBulletType();
soundBullet.damage=0;
soundBullet.lifetime=0;
soundBullet.speed=0;
soundBullet.shootEffect=Fx.none;
soundBullet.smokeEffect=Fx.none;
soundBullet.hitEffect=Fx.none;
soundBullet.despawnEffect=Fx.none;
const yamatocannon=extend(ArtilleryBulletType,{
  init(b){
    if(b==null) return;
    this["target"+b.id]=b.getOwner().getTmpTarget();
  },
  update(b){
    var t=this["target"+b.id];
    if(b==null||t==null) return;
    var range=typeof t["getType"]==="function"?t.getType().hitsize:typeof t["mech"]==="object"?t.mech.hitsize:t instanceof TileEntity?t.block.size*4:16;
    if((Vars.net.client()?false:t.isDead())||b.dst2(t)<(range*range+4)){
      delete this["target"+b.id];
      b.time(this.lifetime);
    }else{
      b.time(0);
      b.rot(Angles.angle(b.x,b.y,t.x,t.y));
    }
  },
});
yamatocannon.speed=8;
yamatocannon.damage=0;
yamatocannon.hitEffect=Fx.blastExplosion;
yamatocannon.lifetime=30;
yamatocannon.bulletWidth=22;
yamatocannon.bulletHeight=22;
yamatocannon.splashDamage=240;
yamatocannon.splashDamageRadius=32;
yamatocannon.frontColor=Pal.lightishOrange;
yamatocannon.backColor=Pal.lightOrange;
yamatocannon.status=StatusEffects.burning;
yamatocannon.recoil=0.6;
yamatocannon.hitSound=Sounds.none;
yamatocannon.shootEffect=Fx.hitBulletBig;
yamatocannon.hitEffect=yamatoHit;
const laser=new FlakBulletType(10,0);
laser.bulletSprite="bullet";
laser.bulletWidth=4;
laser.bulletHeight=9;
laser.keepVelocity=true;
laser.lifetime=20
laser.collidesAir=true;
laser.splashDamage=40;
laser.splashDamageRadius=15;
laser.hitEffect=Fx.hitBulletSmall;
laser.despawnEffect=Fx.hitBulletSmall;
laser.frontColor=Color.valueOf("ff0000");
laser.backColor=Color.valueOf("e61919");
laser.knockback=0.1;
const weaponLaser=extend(Weapon,{
  updateLaser(shooter,pointerX,pointerY,current){
    var x=shooter.getX(),y=shooter.getY();
    Tmp.v1.set(pointerX,pointerY).sub(x, y);
    if(Tmp.v1.len() < this.minPlayerDist) Tmp.v1.setLength(this.minPlayerDist);
    var cx = Tmp.v1.x + x, cy = Tmp.v1.y + y;
    var offset=this.convertOffset(current);
    Tmp.v1.trns(shooter.rotation-90,offset[0] ,offset[1] );
    this.shootSound=sounds["laser-"+Mathf.floor(Mathf.random(3))];
    weaponLaser.shoot(shooter,Tmp.v1.x,Tmp.v1.y,Angles.angle(x+Tmp.v1.x,y+Tmp.v1.y,cx,cy),false);
  },
  convertOffset(i){
    var x=(i%2-0.5)*(i<2?28:12);
    var y=(Math.floor(i/2)-1.6)*10;
    return [x,y];
  },
});
weaponLaser.reload=5;
weaponLaser.alternate=false;
weaponLaser.bullet=laser;
weaponLaser.inaccuracy=8;
const weaponYamato=extend(Weapon,{
  update(shooter,pointerX,pointerY){
    shooter.beginReload();
  },
  updateYamato(shooter,pointerX,pointerY){
    var x=shooter.getX(),y=shooter.getY();
    Tmp.v1.set(pointerX, pointerY).sub(x, y);
    if(Tmp.v1.len() < this.minPlayerDist) Tmp.v1.setLength(this.minPlayerDist);
    var cx = Tmp.v1.x + x, cy = Tmp.v1.y + y;
    Tmp.v1.trns(shooter.rotation,28);
    this.shoot(shooter,Tmp.v1.x,Tmp.v1.y,Angles.angle(x+Tmp.v1.x,y+Tmp.v1.y,cx,cy),false);
  },
});
weaponYamato.reload=180;
weaponYamato.alternate=false;
weaponYamato.bullet=yamatocannon;
weaponYamato.inaccuracy=8;
const younggam=new UnitType("younggam");
younggam.create(prov(()=>new JavaAdapter(HoverUnit,{
  _beginReload:false,
  beginReload(){
    this._beginReload=true;
  },
  _reload:0,
  last:0,
  _timer:new Interval(1),
  _timerIndex:0,
  get_Timer(reload){
    var ret=[];
    ret[0]=this._timer.get(0,reload);
    if(ret[0]) {
      ret[1]=this._timerIndex++;
      if(this._timerIndex>=6) this._timerIndex=0;
    }
    return ret;
  },
  _target:null,
  get_Target(){
    return this._target;
  },
  getTarget(){
    return this.target;
  },
  _tmpTarget:null,
  getTmpTarget(){
    return this._tmpTarget;
  },
  drawWeapons(){ return },
  added(){
    this.super$added();
    weaponYamato.shootSound=sounds["yamato-fire"];
    soundBullet.hitSound=sounds["yamato-charge"];
  },
  getWeapon(){
    if(!Vars.net.client()) return this.type.weapon;
    else if(this._reload<weaponYamato.reload) {
      weaponLaser.shootSound=sounds["laser-"+Mathf.floor(Mathf.random(3))];
      return weaponLaser;
    }
    else {
      this._reload=0;
      return weaponYamato;
    }
  },
  collision(other,x,y){
    if(typeof other["getBulletType"]==="function"){
      var wasDead=this.isDead();
      this.damage(other.damage()*(other.getBulletType().speed<0.1?0.25:1));
      if(!wasDead&&this.isDead()) other.killed(this);
    }
  },
  targetClosest(){
    if(this.target==null?true:this.dst(this.target)>=yamatocannon.range()&&!this._beginReload) this.super$targetClosest();
    var newTarget=Units.closestTarget(this.team,this.x,this.y,Math.max(laser.range(),this.type.range));
    if(newTarget!=null) this._target=newTarget;
  },
  updateTargeting(){
    this.super$updateTargeting();
    var t=this._target;
    if(t==null) return;
    if(t instanceof Unit?(t.isDead()||t.getTeam()==this.team):t instanceof TileEntity?t.tile.entity==null:true) this._target=null;
  },
  update(){
    var current=this.get_Timer(5);
    if(Vars.net.client()&&this._reload!=0) this._reload+=Time.delta();
    this.super$update();
    var fired=false;
    if(this._beginReload){
      if(this._reload==0) {
        this._tmpTarget=this.target;
        Call.createBullet(soundBullet,this.team,this.x,this.y,0,1,1);
      }
      if(this._reload>=weaponYamato.reload){
        if(this.target==this._tmpTarget){
          fired=true;
          var to=Predict.intercept(this,this.target,yamatocannon.speed);
          this.type.weapon=weaponYamato;
          weaponYamato.updateYamato(this,to.x,to.y);
        }
        this._reload=0;
        this._beginReload=false;
      }else this._reload+=Time.delta();
    }
    if(this._target!=null&&!fired)  if(this.dst(this._target)<laser.range()&&current[0]){
      var to=Predict.intercept(this,this._target,laser.speed);
      this.type.weapon=weaponLaser;
      weaponLaser.updateLaser(this,to.x,to.y,current[1]);
      this.type.weapon=weaponYamato;
    }
  },
  drawUnder(){
    var rot=this.rotation
    var c=Tmp.v1.trns(rot,-33);
    var l=Tmp.v2.trns(rot,-32,5);
    var r=Tmp.v3.trns(rot,-32,-5);
    var x=this.x,y=this.y,size=this.type.engineSize;
    Draw.color(Pal.engine);
    Fill.circle(x+c.x,y+c.y,size+Mathf.absin(Time.time(),2,size*0.25));
    Fill.circle(x+l.x,y+l.y,size+Mathf.absin(Time.time(),2,size*0.25));
    Fill.circle(x+r.x,y+r.y,size+Mathf.absin(Time.time(),2,size*0.25));
    Draw.color(Color.white);
    c.scl(0.98);
    l.scl(0.98);
    r.scl(0.98);
    Fill.circle(x+c.x,y+c.y,(size+Mathf.absin(Time.time(),2,size*0.25))*0.5);
    Fill.circle(x+l.x,y+l.y,(size+Mathf.absin(Time.time(),2,size*0.25))*0.5);
    Fill.circle(x+r.x,y+r.y,(size+Mathf.absin(Time.time(),2,size*0.25))*0.5);
    Draw.color();
  },
  write(data){
    this.super$write(data);
    data.writeFloat(this._reload);
    var b=this._tmpTarget!=null
    data.writeInt(b?this._tmpTarget.tileX()*8:0);
    data.writeInt(b?this._tmpTarget.tileY()*8:0);
  },
  read(data){
    this.super$read(data);
    this.last=this._reload;
    this._reload=data.readFloat();
    this._tmpTarget=new Vec2(data.readInt(),data.readInt());
  }
})));
younggam.weapon=weaponYamato;
