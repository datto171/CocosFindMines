import { _decorator, Component, Node, Button, systemEvent, SystemEvent, SystemEventType, EventMouse, input, NodeEventType, Label, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileComponent')
export class TileComponent extends Component {
    public posX = 0;
    public posY = 0;
    public index = 0;
    public isChecked = false;

    public isHide = false;

    public isMine = false;
    public numberMines = 0;

    @property(Node) text: Node = null;
    @property(Node) img: Node = null;
    @property(Node) tile: Node = null;
    ////////////////////////////////////////

    start() {
        this.tile.on(Node.EventType.MOUSE_DOWN, this.onDown, this);
    }

    onDown(event: EventMouse) {
        console.log("Open Tile x: " + this.posX + ": y" + this.posY);
        if (this.isHide) {
            this.node.emit("ClickTile", this.posX, this.posY);
        }
    }

    SetNumberMines(count) {
        // console.log(this.posX + ":" + this.posY + " => " + count);
        this.numberMines = count;
    }

    ShowNumberMinesAround(){
        this.text.getComponent(Label).string = this.numberMines + "";
    }
}