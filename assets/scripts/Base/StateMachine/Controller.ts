import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller {
    _states: {}
    _currentState = null
    Init(states){
        this._states = states
    }

    ChangeState(key, context){
        //Previous state OnExit(context)
        if(this._currentState != null) {
            this._currentState.OnExit(context);
        }
        this._currentState = this._states[key];
        this._currentState.OnEnter(context)
    }

    Update(dt, context){
        this._currentState.OnUpdate(dt, context)
    }
}