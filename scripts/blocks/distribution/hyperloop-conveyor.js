const hyperloopConveyor = extendContent(ArmoredConveyor, "hyperloop-conveyor", {
    update(tile) {
        const e = tile.ent();
        if(e.cons.valid() && e.efficiency() >= 0.9) {
            this.super$update(tile);
            e.cons.trigger();
        }
        else {
            return;
        }
    },
    shouldIdleSound(tile) {
        if(tile.entity.cons.valid() && tile.entity.efficiency() >= 0.9 && tile.entity.clogHeat <= 0.5) {
            return false;
        } else {
            return true;;
        }
    },
    draw(tile) {
        if(tile.entity.cons.valid() && tile.entity.efficiency() >= 0.9 && !tile.entity.isSleeping()) {
            this.super$draw(tile);
        } else {
            Draw.rect(this.stopRegions[Mathf.clamp(tile.entity.getBlend(0), 0, 3)], tile.drawx(), tile.drawy(), Vars.tilesize * tile.entity.getBlend(1), Vars.tilesize * tile.entity.getBlend(2), tile.rotation() * 90);
        }
    },
    onProximityUpdate(tile) {
        this.super$onProximityUpdate(tile);
        const entity = tile.ent();
        entity.setBlend(this.buildBlending(tile, tile.rotation(), null, true));
    },
    load() {
        this.super$load();
        this.stopRegions = [];
        for(var i = 0; i < 4; i++) this.stopRegions[i] = Core.atlas.find(this.name + "-" + i + "-" + 0);
    },
    getPowerConnections(tile, out) {
        out.clear();
        if(tile == null || tile.entity == null || tile.entity.power == null) return out;
        var iter = tile.entity.proximity().iterator();
        while(iter.hasNext()) {
            var other = iter.next();
            if(other != null && other.entity != null && other.entity.power != null && other.block().name == "steam-power-electric-conveyor" || other.block().name == "steam-power-hyperloop-conveyor") out.add(other);
        }
        return out;
    }
});
hyperloopConveyor.entityType = prov(() => extend(Conveyor.ConveyorEntity, {
    setBlend(a) {
        this._blend0 = a[0];
        this._blend1 = a[1];
        this._blend2 = a[2];
    },
    getBlend(b) {
        if(b == 0) return this._blend0;
        if(b == 1) return this._blend1;
        if(b == 2) return this._blend2
    },
    _blend0: null,
    _blend1: null,
    _blend2: null,
}));
