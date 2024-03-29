import { _decorator, Component, Node } from 'cc';
import { Controller } from './StateMachine/Controller';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    newController = new Controller();
    // newController
}