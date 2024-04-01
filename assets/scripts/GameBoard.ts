import { _decorator, Component, Node, Sprite, SpriteFrame, Label, SkeletalAnimation, Skeleton, instantiate, UITransform, sp } from 'cc';
import { TileComponent } from './TileComponent';
const { ccclass, property } = _decorator;

@ccclass('GameBoard')
export class GameBoard extends Component {
    private _timer: number = 0.0;

    // letiable for setup game 
    @property width = 9;
    @property height = 9;
    @property numberMines = 1;

    @property({ type: [TileComponent] }) listTiles: TileComponent[] = [];
    @property({ type: [SpriteFrame] }) arrBlockLight: SpriteFrame[] = []; // Array Tiles Light
    @property({ type: [SpriteFrame] }) arrBlockDark: SpriteFrame[] = [];  // Array Tiles Dark
    @property({ type: [SpriteFrame] }) arrSpritesBombPlayer: SpriteFrame[] = []; // Array Sprites bomb player
    @property({ type: [SpriteFrame] }) arrSpritesBombEnemy: SpriteFrame[] = [];  // Array Sprites bomb enemy

    @property({ type: [Node] }) posContainTiles = null;
    @property({ type: [TileComponent] }) tilePref = null;

    @property({ type: [Label] }) textScorePlayer = null;
    @property({ type: [Label] }) textScoreEnemy = null;

    @property({ type: sp.Skeleton }) skePlayer: sp.Skeleton | null = null;
    @property({ type: sp.Skeleton }) skeEnemy: sp.Skeleton | null = null;

    @property({ type: Node }) popupWin: Node = null;
    @property({ type: Node }) popupLose: Node = null;

    // letiable logic game 
    isContinue = false;
    isTurnEnemy = true;
    turnPlayer = 1;
    scorePlayer = 0;
    scoreEnemy = 0;
    scoreToWin = 0;
    playerWin = -1;

    start() {
        this.newGame();
    }

    newGame() {
        this.popupWin.active = false;
        this.popupLose.active = false;

        this.resetData();

        this._timer = 1.0;

        this.SetIndexMap();
        this.SetupMines();
        this.SetupNumbers();
        console.log(this.numberMines);
        this.scoreToWin = Math.ceil((this.numberMines - 1) / 2);
        console.log(this.scoreToWin);

        this.ListenEvent();
        this.skePlayer.setAnimation(0, "Idle2", true);
        this.textScorePlayer.getComponent(Label).string = 0;
        this.textScoreEnemy.getComponent(Label).string = 0;
    }

    resetData() {
        this.isContinue = false;
        this.isTurnEnemy = true;
        this.turnPlayer = 1;
        this.scorePlayer = 0;
        this.scoreEnemy = 0;
        this.scoreToWin = 0;
        this.playerWin = -1;
    }

    // Handle Timer ~~ No need right now
    update(deltaTime: number) {

        // if (this._timer >= 10.0) {
        //     console.log('I am done!');
        //     this._timer = 0;
        //     // this.enabled = false;
        // }

        if (this.turnPlayer == 2 && this.isTurnEnemy) {
            this._timer += deltaTime;
            if (this._timer > 3) {
                this.isTurnEnemy = false;
                this.BotPlay();
                this.CheckEndGame();
                if (this.playerWin == -1) {
                    this.NextTurn();
                }
            }
        }
    }

    // Listen event of all tiles
    ListenEvent() {
        for (let i = 0; i < this.listTiles.length; i++) {
            this.listTiles[i].tile.on("ClickTile", this.Emit_OpenTile, this);
        }
    }

    OffEvent() {
        for (let i = 0; i < this.listTiles.length; i++) {
            this.listTiles[i].tile.off("ClickTile", this.Emit_OpenTile, this);
        }
    }

    // HANDLE LOGIC GAME PLAY (ALL STATE MACHINE)
    Emit_OpenTile(x, y) {
        console.log
        this.OpenTile(x, y);

        this.CheckEndGame();
        if (this.playerWin == -1) {
            this.NextTurn();

            if (this.turnPlayer == 2) {
                this.OffEvent();
            }
        }
        //  else {
        //     this.ListenEvent();
        // }
    }

    OpenTile(x, y) {
        let tile = this.GetTile(x, y);
        if (tile != null) {
            tile.img.getComponent(Sprite).spriteFrame = null;
            tile.isHide = false;
            if (tile.isMine) {
                // Change img Flag
                if (this.turnPlayer == 1) {
                    this.scorePlayer += 1;
                    this.textScorePlayer.getComponent(Label).string = this.scorePlayer;
                    tile.img.getComponent(Sprite).spriteFrame = this.arrSpritesBombPlayer[0];
                } else {
                    this.scoreEnemy += 1;
                    this.textScoreEnemy.getComponent(Label).string = this.scoreEnemy;
                    tile.img.getComponent(Sprite).spriteFrame = this.arrSpritesBombEnemy[0];
                }
                // tile.img.getComponent(UITransform).setContentSize(40, 50);

                this.isContinue = true;
            } else {
                if (tile.numberMines == 0) {
                    this.OpenTileAroundZero(tile);
                } else {
                    tile.ShowNumberMinesAround();
                }
                this.isContinue = false;
            }
        } else {
            console.log("Tile = null");
        }
    }


    CheckEndGame() {
        if (this.scorePlayer > this.scoreToWin || this.scoreEnemy > this.scoreToWin) {
            if (this.turnPlayer == 1) {
                this.popupWin.active = true;
            } else {
                this.popupLose.active = true;
            }
        }
    }

    NextTurn() {
        if (this.isContinue == false) {
            if (this.turnPlayer == 2) {
                console.log("Turn Player again");
                this.turnPlayer = 1;
                this.ListenEvent();
            } else {
                this.turnPlayer = 2;
                this.isTurnEnemy = true;
                this._timer = 0;
                console.log("time to turn enemy");
            }
        } else {
            this._timer = 0;
            if (this.turnPlayer == 2) {
                this.isTurnEnemy = true;
            }
        }
    }

    OpenTileAroundZero(target) {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let tileAround = this.GetTile(target.posX + i, target.posY + j);
                if (tileAround != null) {
                    if (tileAround.isHide) {
                        this.OpenTile(tileAround.posX, tileAround.posY);
                    }
                }
            }
        }
    }

    BotPlay() {
        console.log("Bot play");
        let k = 0;
        let listTilesHide = [];
        for (let i = 0; i < this.listTiles.length; i++) {
            if (this.listTiles[i].isHide) {
                // console.log("x: " + this.listTiles[i].posX + " - " + this.listTiles[i].posY)
                listTilesHide.push(this.listTiles[i]);
            }
            k++;
        }
        // ===== Log debug ====== //
        console.log("size tiles" + listTilesHide.length);
        let random = this.GetRandomInt(0, listTilesHide.length);

        // ==== Check ===== //
        if (listTilesHide[random] != null) {
            this.OpenTile(listTilesHide[random].posX, listTilesHide[random].posY);
        }
    }

    /// ====== HANDLE LOGIC GAME BOARD (SETUP BOARD) ======= ///

    CreateMap() {
        for (let i = 0; i < this.width * this.height; i++) {
            let tile = instantiate(this.tilePref);
            tile.parent = this.posContainTiles;
        }
    }

    SetIndexMap() {
        for (let i = 0; i < this.listTiles.length; i++) {
            this.listTiles[i].posX = i % this.width;
            this.listTiles[i].posY = Math.trunc(i / this.height);
            this.listTiles[i].isHide = true;
            this.listTiles[i].text.getComponent(Label).string = "";

            if ((this.listTiles[i].posX + this.listTiles[i].posY) % 2 == 0) {
                let random = this.GetRandomInt(0, this.arrBlockLight.length);
                // console.log("random" + random);
                this.listTiles[i].img.getComponent(Sprite).spriteFrame = this.arrBlockLight[random];
            }
            else {
                let random = this.GetRandomInt(0, this.arrBlockDark.length);
                this.listTiles[i].getComponent(Sprite).spriteFrame = this.arrBlockDark[random];
            }
        }
    }

    SetupMines() {
        let numbMineCreate = 0;

        while (this.numberMines > numbMineCreate) {
            let posX = this.GetRandomInt(0, this.width);
            let posY = this.GetRandomInt(0, this.height);

            let tile = this.GetTile(posX, posY);
            if (tile != null) {
                if (!tile.isMine) {
                    tile.isMine = true;
                    numbMineCreate++;
                }
            }
        }
    }

    SetupNumbers() {
        for (let i = 0; i < this.listTiles.length; i++) {
            if (!this.listTiles[i].isMine) {
                this.CheckTilesAround(this.listTiles[i]);
            }
        }
    }

    CheckTilesAround(tile) {
        let numbMines = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let tileAround = this.GetTile(tile.posX + i, tile.posY + j);
                if (tileAround != null) {
                    if (tileAround.isMine) {
                        numbMines++;
                    }
                }
            }
        }

        let tile2 = this.GetTile(tile.posX, tile.posY)
        if (tile2 != null) {
            tile2.SetNumberMines(numbMines);
        }
    }

    GetTile(posX, posY) {
        if (posX < 0 || posY < 0 || posX > (this.width - 1) || posY > (this.height - 1)) {
            return null;
        }
        else {
            return this.listTiles[posY * this.width + posX];
        }
    }

    GetListTileHide() {
        let arrTilesHide = null;
        for (let i = 0; i < this.listTiles.length; i++) {
            if (this.listTiles[i].isHide) {
                arrTilesHide.Add(this.listTiles[i]);
            }
            return arrTilesHide;
        }
    }

    GetRandomInt(min, max) {
        return Math.trunc(Math.random() * (max - min) + min);
    }
}