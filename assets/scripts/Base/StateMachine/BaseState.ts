import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('state')
export class BaseState {
    OnEnter(){
        console.log("ko co On enter");
    }

    OnUpdate(){
        console.log("ko co On update");
    }

    OnExit(){
        console.log("ko co On exit");
    }
}