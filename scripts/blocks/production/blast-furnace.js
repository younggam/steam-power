const multiLib = require("multi-lib2/wrapper");
const furnaces = this.global.furnaces;
const blastFurnace = multiLib.extend(GenericCrafter, "blast-furnace", [{
    input: {
        items: ["steam-power-copper-ore/1"],
    },
    output: {
        items: ["copper/1"],
        liquids: ["slag/1"]
    },
    craftTime: 100
}, {
    input: {
        items: ["steam-power-lead-ore/1"],
    },
    output: {
        items: ["lead/1"],
        liquids: ["slag/1"]
    },
    craftTime: 100
}, {
    input: {
        items: ["steam-power-iron-ore/1"],
    },
    output: {
        items: ["steam-power-iron/1"],
        liquids: ["slag/1"]
    },
    craftTime: 100
}, {
    input: {
        items: ["steam-power-titanium-ore/1"],
    },
    output: {
        items: ["titanium/1"],
        liquids: ["slag/1"]
    },
    craftTime: 100
}, {
    input: {
        items: ["sand/1"],
    },
    output: {
        items: ["steam-power-glass/1"],
        liquids: []
    },
    craftTime: 100
}, {
    input: {
        items: ["scrap/1"],
    },
    output: {
        liquids: ["slag/2"]
    },
    craftTime: 50
}, ], {
    setBars() {
        this.super$setBars();
        //initialize
        this.bars.remove("liquid");
        this.bars.remove("power")
        //display every Liquids that can contain
        var i = 0;
        if(!this.liquidSet.isEmpty()) {
            this.liquidSet.each(cons(k => {
                this.bars.add("liquid" + i, func(entity => new Bar(prov(() => k.localizedName), prov(() => k.barColor()), floatp(() => entity.liquids.get(k) / this.liquidCapacity))));
                i++;
            }));
        }
        this.bars.add("multiplier", func(entity => new Bar(prov(() => Core.bundle.formatFloat("bar.efficiency", entity.warmup * 100 * (entity.items.get(Items.coal) > 0 ? 2.5 : 1), 1)), prov(() => Pal.ammo), floatp(() => entity.warmup * (entity.items.get(Items.coal) > 0 ? 2.5 : 1)))));
    },
    //for dislpying info
    setStats() {
        this.super$setStats();
        this.stats.remove(BlockStat.powerUse);
        this.stats.remove(BlockStat.productionTime);
        this.stats.add(BlockStat.booster, new ItemListValue(ItemStack(Items.coal, 1)))
        this.stats.add(BlockStat.boostEffect, 2.5, StatUnit.timesSpeed);
    },
    //custom function for consumeing items and liquids
    customCons(tile, i) {
        const entity = tile.ent();
        //do produce
        entity.saveCond(true);
        if(entity.getProgress(i) != 0 && entity.getProgress(i) != null) {
            entity.progress = entity.getProgress(i);
            entity.saveProgress(i, 0);
        }
        entity.progress += (entity.items.get(Items.coal) > 0 ? 2.5 : 1) * entity.warmup * this.getProgressIncreaseA(entity, i, this.recs[i].craftTime);
        if(entity.items.get(Items.coal) > 0) {
            var oldProgress = entity.totalProgress;
            var prog = Time.delta()
            entity.totalProgress += prog;
            if(entity.totalProgress >= 120) {
                entity.items.remove(Items.coal, 1);
                entity.totalProgress = 0;
            }
            if(entity.totalProgress % 120 <= prog && entity.totalProgress != 0 && !(oldProgress <= prog)) entity.items.remove(Items.coal, 1);
        }
        entity.warmup = Mathf.lerpDelta(entity.warmup, 1, 0.002);
        if(Mathf.equal(entity.warmup, 1, 0.002)) {
            entity.warmup = 1;
        }
        if(Mathf.chance(Time.delta() * this.updateEffectChance)) {
            Effects.effect(this.updateEffect, entity.x + Mathf.range(this.size * 4), entity.y + Mathf.range(this.size * 4));
        }
    },
    //decides which item to accept
    acceptItem(item, tile, source) {
        const entity = tile.ent();
        if(entity == null) return false;
        if(entity.items.get(item) >= this.itemCapacity) return false;
        return item == Items.coal || this.inputItemSet.contains(item);
    },
    customUpdate(tile) {
        const entity = tile.ent();
        if(entity.getToggle() == -1) entity.warmup = Mathf.lerp(entity.warmup, 0, 0.02);
        if(entity.isTeamChanged()) {
            furnaces[tile.getTeam().toString()].put(entity, furnaces[entity.getPreviousTeam().toString()].remove(entity, 0));
            entity.setPreviousTeam(tile.getTeam());
        }
    },
    update(tile) {
        const entity = tile.ent();
        var recLen = this.recs.length;
        var eItems = entity.items;
        var eLiquids = entity.liquids;
        //to not rewrite whole update
        if(typeof this["customUpdate"] === "function") this.customUpdate(tile);
        for(var i = 0; i < recLen; i++) {
            var input = this.recs[i].input.items[0].item;
            var output = this.recs[i].output.items[0];
            if((output == null || eItems.get(output.item) < this.itemCapacity) && eItems.has(input)) {
                this._configure(entity, i);
                this.customCons(tile, i);
                if(entity.getToggle() == i && entity.progress >= 1) this.customProd(tile, i);
                break;
            }
        }
        if(i == recLen) {
            entity.warmup = Mathf.lerp(entity.warmup, 0, 0.02);
            entity.saveCond(false);
        }
        var que = entity.getToOutputItemSet().orderedItems(),
            len = que.size,
            itemEntry = entity.getDumpItemEntry();
        if(entity.timer.get(this.dumpTime) && len > 0) {
            for(var i = 0; i < len; i++) {
                var candidate = que.get((i + itemEntry) % len);
                if(this.tryDump(tile, candidate)) {
                    if(!eItems.has(candidate)) entity.getToOutputItemSet().remove(candidate);
                    break;
                }
            }
            if(i != len) entity.setDumpItemEntry((i + itemEntry) % len);
        }
        var que = entity.getToOutputLiquidSet().orderedItems(),
            len = que.size;
        if(len > 0) {
            for(var i = 0; i < len; i++) {
                var liquid = que.get(i);
                this.tryDumpLiquid(tile, liquid);
                if(eLiquids.get(liquid) <= 0.001) entity.getToOutputLiquidSet().remove(liquid);
            }
        }
    },
    _configure(entity, value) {
        const i = entity.getToggle();
        if(i >= 0) entity.saveProgress(i, entity.progress);
        entity.progress = 0;
        entity.setToggle(value);
    },
    random: new Rand(0),
    draw(tile) {
        const entity = tile.ent();
        Draw.rect(this.region, tile.drawx(), tile.drawy());
        if(entity.warmup > 0.01) {
            Draw.color(Color.salmon);
            Draw.alpha(entity.warmup);
            Draw.rect(this.topRegion, tile.drawx(), tile.drawy());
            if(entity.warmup > 0.4) {
                var seeds = Math.round(entity.warmup * 12);
                Draw.color(Color.valueOf("474747"), Color.gold, entity.warmup);
                this.random.setSeed(tile.pos());
                for(var i = 0; i < seeds; i++) {
                    var offset = this.random.nextFloat() * 999999;
                    var x = this.random.range(6),
                        y = this.random.range(6);
                    var life = 1 - (((Time.time() + offset) / 50) % 6);
                    if(life > 0) {
                        Lines.stroke(entity.warmup * (life * 1 + 0.2));
                        Lines.poly(tile.drawx() + x, tile.drawy() + y, 8, (1 - life) * 3);
                    }
                }
            }
            Draw.color();
        }
    },
    load() {
        this.super$load();
        this.topRegion = Core.atlas.find(this.name + "-top")
    }
}, {
    _previousTeam: null,
    getPreviousTeam() {
        return this._previousTeam;
    },
    setPreviousTeam(t) {
        this._previousTeam = t;
    },
    isTeamChanged() {
        return this._previousTeam != this.getTeam();
    },
    added() {
        furnaces[this.getTeam().toString()].put(this, 0);
        this._previousTeam = this.getTeam();
    },
    removed() {
        this.super$removed();
        if(this.isTeamChanged()) furnaces[this._previousTeam.toString()].remove(this, 0);
        else furnaces[this.getTeam().toString()].remove(this, 0);
    },
});
blastFurnace.dumpToggle = false;
blastFurnace.configurable = false;
