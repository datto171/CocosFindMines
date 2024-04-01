import { _decorator, Component, Node } from 'cc';
import { Controller } from './StateMachine/Controller';
import { TurnState } from './StateMachine/TurnState';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    newController = new Controller();
    turnState = new TurnState();
    // newController.Init(turnState);
    // newController
}

enum GameState {
    StartState,
    TurnState,
    TurnResolveState,
    EndState
}