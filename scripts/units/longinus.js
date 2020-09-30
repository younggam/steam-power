const floatc2 = this.global.funcs.floatc2;
var colors = [Color.valueOf("ff9c5a66"), Color.valueOf("ff9c5a"), Color.white];
const longinusSpear = new JavaAdapter(BulletType, {
    tscales: [1, 0.7, 0.5, 0.2],
    lenscales: [1, 1.05, 1.065, 1.067],
    strokes: [1.5, 1, 0.3],
    length: 240,
    range() {
        return this.length;
    },
    init(b) {
        if(b == null) return;
        Damage.collideLine(b, b.getTeam(), this.hitEffect, b.x + 3 * Mathf.sinDeg(b.rot()), b.y + 3 * Mathf.cosDeg(b.rot()), b.rot(), this.length, true);
        Damage.collideLine(b, b.getTeam(), this.hitEffect, b.x - 3 * Mathf.sinDeg(b.rot()), b.y - 3 * Mathf.cosDeg(b.rot()), b.rot(), this.length, true);
    },
    draw(b) {
        var f = Mathf.curve(b.fin(), 0, 0.2);
        var baseLen = this.length * f;
        Lines.lineAngle(b.x, b.y, b.rot(), baseLen);
        for(var s = 0; s < 3; s++) {
            Draw.color(colors[s]);
            for(var i = 0; i < 4; i++) {
                Lines.stroke(11 * b.fout() * this.strokes[s] * this.tscales[i]);
                Lines.lineAngle(b.x, b.y, b.rot(), baseLen * this.lenscales[i]);
            }
        }
        Draw.reset();
    }
}, 0.001, 800);
longinusSpear.hitEffect = Fx.hitLancer;
longinusSpear.despawnEffect = Fx.none;
longinusSpear.hitSize = 4;
longinusSpear.pierce = true;
longinusSpear.collidesTiles = false;
longinusSpear.lifetime = 16
longinusSpear.drawSize = 440;
longinusSpear.keepVelocity = false;
const longinusWeapon = extend(Weapon, {
    update(shooter, pointerX, pointerY) {
        shooter.beginReload();
    },
    updateLaser(shooter, pointerX, pointerY) {
        Tmp.v1.trns(shooter.rotation, 16);
        this.shoot(shooter, Tmp.v1.x, Tmp.v1.y, shooter.rotation, true);
    }
});
longinusWeapon.bullet = longinusSpear;
longinusWeapon.reload = 240;
longinusWeapon.alternate = false;
longinusWeapon.inaccuracy = 0;
longinusWeapon.shootSound = Sounds.laser;
const longinusMissile = new JavaAdapter(MissileBulletType, {
    init(b) {},
    update(b) {
        if(b == null || b.time() < 30) return;
        if(b.getData() == null) b.setData(Units.closestTarget(b.getTeam(), b.x, b.y, 240, boolf(e => true)));
        else b.velocity().setAngle(Mathf.slerpDelta(b.velocity().angle(), b.angleTo(b.getData()), 0.08));
        if(Mathf.chance(Time.delta() * 0.2)) Effects.effect(Fx.missileTrail, this.trailColor, b.x, b.y, 2);
    }
}, 2.4, 20, "missile");
longinusMissile.bulletWidth = 8;
longinusMissile.bulletHeight = 8;
longinusMissile.bulletShrink = 0;
longinusMissile.drag = -0.04;
longinusMissile.splashDamageRadius = 30;
longinusMissile.splashDamage = 7;
longinusMissile.lifetime = 120;
longinusMissile.hitEffect = Fx.blastExplosion;
longinusMissile.despawnEffect = Fx.blastExplosion;
longinusInterceptor = extend(Weapon, {
    offsets: [new Vec2(-15, -24), new Vec2(-13, -22), new Vec2(-11, -20), new Vec2(-9, -18), new Vec2(9, -18), new Vec2(11, -20), new Vec2(13, -22), new Vec2(15, -24)],
    updateMissile(shooter, i) {
        var current = this.offsets[i];
        Tmp.v1.trns(shooter.rotation - 90, current.x, current.y);
        this.shoot(shooter, Tmp.v1.x, Tmp.v1.y, shooter.rotation + 30 * Mathf.sign(3.5 - i) + 6 * (3.5 - i), false);
    },
});
longinusInterceptor.bullet = longinusMissile;
longinusInterceptor.alternate = false;
longinusInterceptor.shootSound = Sounds.missile;
const longinus = new UnitType("longinus");
longinus.create(prov(() => new JavaAdapter(HoverUnit, {
    missileSequence: 0,
    _beginReload: false,
    last: 0,
    beginReload() {
        this._beginReload = true;
    },
    _reload: 0,
    _target: null,
    fired: false,
    isCharging: false,
    get_Target() {
        return this._target;
    },
    getTarget() {
        return this.target;
    },
    drawWeapons() {},
    draw() {
        this.super$draw();
        Tmp.v1.trns(this.rotation, 16);
        var cx = this.x - Tmp.v1.x * 3.2,
            cy = this.y - Tmp.v1.y * 3.2,
            absin = Mathf.absin(1, 1);
        Draw.color(Color.black);
        Fill.circle(cx, cy, 3 + absin);
        Draw.color(Color.gray);
        Lines.stroke(1);
        Lines.circle(cx, cy, 5 + absin);
        if(this._reload > 0) {
            var fin = this._reload / 240;
            var efout = 1 - fin * 10 % 1;
            var ex = this.x + Tmp.v1.x,
                ey = this.y + Tmp.v1.y;
            Draw.color(Color.white);
            if(this.last < this._reload) Angles.randLenVectors(this.id + Math.floor(fin * 10), 4, efout * (16 + 8 * fin), floatc2((x, y) => Fill.circle(ex + x, ey + y, 1 * efout + fin)));
            for(var i = 0; i < 3; i++) {
                Draw.color(colors[i]);
                Fill.circle(ex, ey, fin * (7 + absin - i));
            }
        }
        Draw.color();
    },
    getWeapon() {
        if(!Vars.net.client()) return this.type.weapon;
        var range = Time.delta() + 0.1;
        //print(this._reload + ': ' + String(this._reload >= 240 - range || this._reload <= range) + " | " + String(this.fired) + " | " + String(this.last < this._reload));
        if((this._reload >= 240 - range || this._reload <= range) && this.isCharging && !this.fired) {
            this.timer.get(1, 0);
            this.fired = true;
            return longinusWeapon;
        } else return longinusInterceptor;
    },
    targetClosest() {
        this.super$targetClosest();
        var newTarget = Units.closestTarget(this.team, this.x, this.y, Math.max(longinusMissile.range(), this.type.range));
        if(newTarget != null) this._target = newTarget;
    },
    updateTargeting() {
        this.super$updateTargeting();
        var t = this._target;
        if(t == null) return;
        if(t instanceof Unit ? (t.isDead() || t.getTeam() == this.team) : t instanceof TileEntity ? t.tile.entity == null : true) this._target = null;
    },
    update() {
        this.last = this._reload;
        this.super$update();
        if(!Vars.net.client()) {
            var fired = false;
            if(this._beginReload) {
                if(this._reload >= longinusWeapon.reload) {
                    if(this.target != null && this.dst2(this.target) < 240 * 240) {
                        fired = true;
                        var to = Predict.intercept(this, this.target, longinusSpear.speed);
                        this.type.weapon = longinusWeapon;
                        longinusWeapon.updateLaser(this, to.x, to.y);
                        this._reload = 0;
                        this._beginReload = false;
                    } else this._reload -= Time.delta() * 0.5;
                } else if(this.target == null) this._reload -= Time.delta();
                else this._reload += Time.delta();
            }
            if(this._target != null && !fired)
                if(this.dst2(this._target) < 288 * 288 && (this.timer.get(2, 64) || (this.missileSequence % 4 != 0 && this.timer.get(3, 6)))) {
                    this.type.weapon = longinusInterceptor;
                    longinusInterceptor.updateMissile(this, this.missileSequence);
                    this.type.weapon = longinusWeapon;
                    this.missileSequence++;
                    if(this.missileSequence > 7) this.missileSequence = 0;
                }
        } else {
            if(this.fired && this.timer.get(1, 120)) this.fired = false;
            this.updateTargeting();
            if(Units.invalidateTarget(this.target, this.team, this.x, this.y)) this.target = null;
            if(this.retarget()) {
                this.targetClosest();
                if(this.target == null) this.targetClosestEnemyFlag(BlockFlag.producer);
                if(this.target == null) this.targetClosestEnemyFlag(BlockFlag.turret);
            }
            if(this._reload > 0) {
                if(this._reload >= longinusWeapon.reload) {
                    if(this.target == null || this.dst2(this.target) > 240 * 240) this._reload -= Time.delta() * 0.5;
                    else this.isCharging = true;
                } else if(this.target == null) this._reload -= Time.delta();
                else {
                    this._reload += Time.delta();
                    this.isCharging = true;
                }
            }
        }
    },
    write(data) {
        this.super$write(data);
        data.writeFloat(this._reload);
        data.writeInt(this.missileSequence);
    },
    read(data) {
        this.super$read(data);
        this.last = this._reload;
        this._reload = data.readFloat();
        this.missileSequence = data.readInt();
    }
})));
longinus.weapon = longinusWeapon;
