import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('event_demo')
export class event_demo extends Component {
    Emit_Red(){
        console.log("Push event red");
        this.node.emit("Red");
    }

    Emit_Green(){
        console.log("Push event green");
        this.node.emit("Green");
    }
}


