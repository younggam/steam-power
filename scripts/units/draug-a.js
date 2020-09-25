const draugA = extendContent(UnitType, "draug-a", {});
const furnaces = this.global.furnaces;
const draugSizes = this.global.draugSizes;
draugA.create(prov(() => {
    const e = new JavaAdapter(MinerDrone, {
        added() {
            this.state = extend(StateMachine, {
                state: null,
                update() {
                    if (this.state != null) this.state.update();
                },
                set(next) {
                    if (next == this.state) return;
                    if (this.state != null) this.state.exited();
                    this.state = next;
                    if (next != null) next.entered();
                },
                current() {
                    return this.state;
                },
                is(state) {
                    return this.state == state;
                }
            });
            this.super$added();
            draugSizes[this.team.toString()]++;
        },
        removed() {
            this.super$removed();
            draugSizes[this.team.toString()]--;
        },
        updateTarget() {
            return this.timer.get(this.timerTarget2, 60);
        },
        customMine: new UnitState() {
            entered() {
                    e.target = null;
            },
            update() {
                if (e.updateTarget()) e.getClosestFurnace();
                var entity = e._closestFurnace;
                if (entity == null || entity instanceof BuildBlock.BuildEntity) return;
                if (e == null) return;
                e.findItem();
                if (e.targetItem != null && entity.block.acceptStack(e.targetItem, 1, entity.tile, e) == 0) {
                    e.clearItem();
                    return;
                }
                if (e.item().amount >= e.getItemCapacity() || (e.targetItem != null && !e.acceptsItem(e.targetItem)) || e.item().amount >= entity.block.acceptStack(e.targetItem, entity.block.itemCapacity - entity.items.get(e.targetItem), entity.tile, e)) {
                    e.setState(e.customDrop);
                } else {
                    if (e.retarget() && e.targetItem != null) {
                        e.target = Vars.indexer.findClosestOre(e.x, e.y, e.targetItem);
                    }
                    if (e.target instanceof Tile) {
                        e.moveTo(e.type.range / 1.5);
                        if (e.dst(e.target) < e.type.range && e.mineTile != e.target) {
                            e.setMineTile(e.target);
                        }
                        if (e.target.block() != Blocks.air) {
                            e.setState(e.customDrop);
                        }
                    } else {
                        if (e.getSpawner() != null) {
                            e.target = e.getSpawner();
                            e.circle(40);
                        }
                    }
                }
            },
            exited() {
                e.setMineTile(null);
            }
        },
        customDrop: new UnitState() {
            entered() {
                    e.target = null;
            },
            update() {
                if (e == null) return;
                if (e.item().amount == 0) {
                    e.clearItem();
                    e.setState(e.customMine);
                    return;
                }
                if (e.updateTarget()) e.getClosestFurnace();
                e.target = e._closestFurnace;
                var tile = e.target;
                if (tile == null || tile instanceof BuildBlock.BuildEntity) return;
                if (e.dst(e.target) < e.type.range) {
                    if (tile.tile.block().acceptStack(e.item().item, e.item().amount, tile.tile, e) > 0) {
                        Call.transferItemTo(e.item().item, Mathf.clamp(e.item().amount, 0, tile.tile.block().itemCapacity - tile.items.get(e.item().item)), e.x, e.y, tile.tile);
                    }
                    e.clearItem();
                    e.setState(e.customMine);
                }
                e.circle(e.type.range / 1.8);
            },
            exited() {

            }
        },
        _closestFurnace: null,
        getClosestFurnace() {
            const teamFurnaces = furnaces[this.team.toString()];
            if (teamFurnaces.size <= 0) {
                this._closestFurnace = null;
                return;
            }
            var iterator = teamFurnaces.iterator();
            var draugPerFurnace = Math.ceil(draugSizes[this.team] / teamFurnaces.size);
            var current =this._closestFurnace!=null?teamFurnaces.get(this._closestFurnace,draugPerFurnace+1):draugPerFurnace+1;
            if(current>=draugPerFurnace){
                while (iterator.hasNext()) {
                    var tmp = iterator.next();
                    if(tmp.key==this._closestFurnace) continue;
                    else if(this.dst2(tmp.key) > 160000) continue;
                    if(current>tmp.value+1){
                        if (this._closestFurnace != null && teamFurnaces.containsKey(this._closestFurnace)) teamFurnaces.getAndIncrement(this._closestFurnace, 0, -1);
                        teamFurnaces.getAndIncrement(tmp.key, 0, 1);
                        this._closestFurnace = tmp.key;
                        return;
                    }
                }
            }
        },
        getClosestCore() {
            return this._closestFurnace;
        },
        getStartState() {
            return this.customMine;
        },
        update() {
            this.super$update();
            this.updateMining();
        },
        write(data) {
            this.super$write(data);
            data.writeInt(this.mineTile == null || !this.state.is(this.customMine) ? Pos.invalid : this.mineTile.pos());
        },
        read(data) {
            this.super$read(data);
            this.mineTile = Vars.world.tile(data.readInt());
        }
    });
    return e;
}));
