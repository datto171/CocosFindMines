import { _decorator, Component, Node, color, Sprite, Color } from 'cc';
import { TileComponent } from './TileComponent';
const { ccclass, property } = _decorator;

@ccclass('observer_1')
export class observer_1 extends Component {
    @property(Node) subjectEvent : Node = null;

    @property(TileComponent) tile : TileComponent = null;

    start() {
        console.log("Hello");
        this.subjectEvent.on("Green", this.Become_Green, this);
        this.subjectEvent.on("Red", this.Become_Red, this);
    }

    Become_Red(){
        this.tile.getComponent(Sprite).color = Color.RED;
        console.log("CHANGE TO RED");
    }

    Become_Green(){
        console.log("CHANGE TO GREEN");
        this.tile.getComponent(Sprite).color = Color.GREEN;
    }
}