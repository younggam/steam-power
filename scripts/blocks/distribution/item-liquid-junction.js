const itemLiquidJunction = extendContent(Block, "item-liquid-junction", {
    acceptStack(item, amount, tile, source) {
        return 0;
    },
    outputsItems() {
        return true;
    },
    update(tile) {},
    handleItem(item, tile, source) {},
    acceptItem(item, tile, source) {},
    setStats() {
        this.super$setStats();
        this.stats.remove(BlockStat.liquidCapacity);
    },
    setBars() {
        this.super$setBars();
        this.bars.remove("liquid");
    },
    getLiquidDestination(tile, source, liquid) {
        var dir = source.relativeTo(tile.x, tile.y);
        dir = (dir + 4) % 4;
        if(dir%2 == tile.ent().getDir()) return tile;
        var next = tile.getNearbyLink(dir);
        if(next == null || !next.block().acceptLiquid(next, tile, liquid, 0) && !(next.block() instanceof LiquidJunction)) return tile;
    },
});
itemLiquidJunction.entityType = prov(() => extend(TileEntity, {
    _dir: true,
    getDir() {
        return this._dir;
    },
    updateProximity() {
        this.super$updateProximity();
        this._dir = this.tile.rotation() % 2;
    }
}));
itemLiquidJunction.update = true;
itemLiquidJunction.solid = true;
itemLiquidJunction.group = BlockGroup.transportation;
itemLiquidJunction.unloadable = false;
itemLiquidJunction.outputsLiquid = true;
itemLiquidJunction.hasLiquids = true;
itemLiquidJunction.rotate = true;
