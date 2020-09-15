const itemLiquidJunction = extendContent(Block, "item-liquid-junction", {
    acceptStack(item, amount, tile, source) {
        return 0;
    },
    outputsItems() {
        return true;
    },
    isValidBlock(block) {
        return !(block instanceof LiquidJunction || block instanceof Sorter || block instanceof OverflowGate)
    },
    handleItem(item, tile, source) {
        var to = tile.getNearbyLink(source.relativeTo(tile.x, tile.y));
        to.block().handleItem(item, to, tile);
    },
    acceptItem(item, tile, source) {
        var relative = source.relativeTo(tile.x, tile.y);
        if(relative % 2 != tile.entity.getDir() || relative == -1) return false;
        var to = tile.getNearbyLink(relative);
        return to != null && this.isValidBlock(to.block()) && to.block().acceptItem(item, to, tile) && to.getTeam() == tile.getTeam();
    },
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
        if(dir % 2 == tile.ent().getDir()) return tile;
        var next = tile.getNearbyLink(dir);
        if(next == null || !next.block().acceptLiquid(next, tile, liquid, 0) && !(next.block() instanceof LiquidJunction)) return tile;
        return next.block().getLiquidDestination(next, tile, liquid);
    },
    tapped(tile, player) {
        tile.rotation(tile.ent().shiftDir());
    },
    draw(tile) {
        Draw.rect(this.region, tile.drawx(), tile.drawy(), tile.rotation() * 90);
    }
});
itemLiquidJunction.entityType = prov(() => extend(TileEntity, {
    _dir: 0,
    getDir() {
        return this._dir;
    },
    shiftDir() {
        this._dir = (this._dir + 1) % 2
        return this._dir;
    },
    getBuffer() {
        return this._buffer;
    },
    read(stream, revision) {
        this.super$read(stream, revision);
        this._dir = stream.readByte();
    },
    write(stream) {
        this.super$write(stream);
        stream.writeByte(this._dir);
    }
}));
itemLiquidJunction.update = true;
itemLiquidJunction.solid = true;
itemLiquidJunction.group = BlockGroup.liquids;
itemLiquidJunction.unloadable = false;
itemLiquidJunction.outputsLiquid = true;
itemLiquidJunction.hasLiquids = true;
