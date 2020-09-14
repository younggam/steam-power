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
        Damage.collideLine(b, b.getTeam(), this.hitEffect, b.x, b.y, b.rot(), this.length, true);
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
        if(shooter.isCharged()) {
            shooter.resetCharging();
            Tmp.v1.trns(shooter.rotation, 16);
            this.shoot(shooter, Tmp.v1.x, Tmp.v1.y, shooter.rotation, true);
        }
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
longinusMissile.drag = -0.02;
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
    charging: 0,
    isCharging: false,
    lastCharged: 0,
    missileSequence: 0,
    left: false,
    fired: false,
    resetCharging() {
        this.charging = 0;
    },
    isCharged() {
        this.charging += Time.delta();
        this.isCharging = true;
        return this.charging >= 240;
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
        if(this.charging > 0) {
            var fin = this.charging / 240;
            var efout = 1 - fin * 10 % 1;
            var ex = this.x + Tmp.v1.x,
                ey = this.y + Tmp.v1.y;
            Draw.color(Color.white);
            if(this.lastCharged < this.charging) Angles.randLenVectors(this.id + Math.floor(fin * 10), 4, efout * (16 + 8 * fin), floatc2((x, y) => Fill.circle(ex + x, ey + y, 1 * efout + fin)));
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
        if((this.charging >= 240 - range || this.charging <= range) && this.isCharging && !this.fired) {
            this.timer.get(1, 0);
            this.fired = true;
            return longinusWeapon;
        }
        else return longinusInterceptor;
    },
    targetClosest() {
        if(this.target == null ? true : this.dst2(this.target) >= 240 * 240 && !this._beginReload) this.super$targetClosest();
    },
    update() {
        this.lastCharged = this.charging;
        this.super$update();
        if(!Vars.net.client()) {
            if(this.target != null && this.dst2(this.target) < 240 * 240 && (this.timer.get(2, 64) || (this.missileSequence % 4 != 0 && this.timer.get(3, 6)))) {
                this.type.weapon = longinusInterceptor;
                longinusInterceptor.updateMissile(this, this.missileSequence);
                this.type.weapon = longinusWeapon;
                this.missileSequence++;
                if(this.missileSequence > 7) this.missileSequence = 0;
            }
            if(!this.isCharging) this.charging = Math.max(this.charging - 4 * Time.delta(), 0);
            this.isCharging = false;
        } else {
            if(this.fired && this.timer.get(1, 120)) this.fired = false;
            this.updateTargeting();
            if(Units.invalidateTarget(this.target, this.team, this.x, this.y)) this.target = null;
            if(this.retarget()) {
                this.targetClosest();
                if(this.target == null) this.targetClosestEnemyFlag(BlockFlag.producer);
                if(this.target == null) this.targetClosestEnemyFlag(BlockFlag.turret);
            }
            if(this.target != null && this.dst2(this.target) < 240 * 250 && Angles.near(this.angleTo(this.target), this.rotation, this.type.shootCone)) {
                if(this.isCharged()) this.charging = 0;
            } else this.isCharging = false;
        }
    },
    writeSave(data) {
        this.super$writeSave(data, false);
        data.writeByte(this.type.id);
        data.writeInt(this.spawner);
        data.writeInt(Math.floor(this.charging));
        data.writeInt(this.missileSequence);
    },
    readSave(data, version) {
        this.super$readSave(data, version);
        this.charging = data.readInt();
        this.missileSequence = data.readInt();
    },
    write(data) {
        this.super$write(data);
        data.writeInt(Math.floor(this.charging));
        data.writeInt(this.missileSequence);
        data.writeBoolean(this.isCharging);
    },
    read(data) {
        this.super$read(data);
        this.charging = data.readInt();
        this.missileSequence = data.readInt();
        this.isCharging = data.readBoolean();
    }
})));
longinus.weapon = longinusWeapon;
