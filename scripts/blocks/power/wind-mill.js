const windMill = extendContent(PowerGenerator, "wind-mill", {
    update(tile) {
        const entity = tile.ent();
        if(entity.timer.get(0, 60)) entity.productionEfficiency = 0.5 + Mathf.random();
        entity.generateTime += entity.productionEfficiency;
    },
    canPlaceOn(tile) {
        return !Vars.indexer.hasOre(Items.coal);
    },
    drawPlace(x, y, rotation, valid) {
        if(Vars.indexer.hasOre(Items.coal)) this.drawPlaceText(Core.bundle.get(this.name + "-invalid"), x, y, valid);
    },
    draw(tile) {
        Draw.rect(this.region, tile.drawx(), tile.drawy());
        Draw.rect(this.rotateRegion, tile.drawx(), tile.drawy(), tile.ent().generateTime);
    },
    load() {
        this.super$load();
        this.rotateRegion = Core.atlas.find(this.name + "-rotator");
    },
    generateIcons() {
        return [
            Core.atlas.find(this.name),
            Core.atlas.find(this.name + "-rotator")
        ];
    }
});
